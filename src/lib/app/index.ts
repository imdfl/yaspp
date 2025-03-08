import getNextConfig from 'next/config';
import * as fsPath from 'path';
import { fileUtils } from '../fileUtils';
import i18nconfig from "@root/i18n";
import type { IYasppApp } from 'types/app';
import type { I18NConfig, LocaleDictionary, LocaleId, LocaleLanguage, LocaleNamespace } from 'types';
import type { INavSection, NavGroups } from 'types/nav';
import { YASPP } from "yaspp-types";


const CONFIG_FILE = "yaspp.json";

interface ILocaleResult {
	ns: string;
	data: LocaleNamespace;
}
class YasppApp implements IYasppApp {
	private _root = "";
	private _content = "";
	private _indexPage = "";
	private _isLoading = false;
	private _dictionary: LocaleDictionary | null = null;
	private readonly _navItems: Record<string, INavSection[]> = {};

	public get isLoading() {
		return this._isLoading;
	}

	public get isValid(): boolean {
		return Boolean(this._indexPage && this._dictionary)
	}

	public get dictionary(): LocaleDictionary {
		return this._dictionary;
	}

	public get defaultLocale(): string {
		return i18nconfig.defaultLocale;
	}

	public get nav(): NavGroups {
		return {
			...this._navItems
		}
	}

	public async init(cwd: string, contentRoot: string): Promise<string> {
		if (this._isLoading) {
			throw new Error("Can't call yaspp app init when it's loading");
		}
		this._isLoading = true;
		if (!await fileUtils.isFolder(cwd)) {
			return `path ${cwd} is not a folder, can't find ${CONFIG_FILE}`;
		}
		this._root = cwd;
		const configPath = fsPath.resolve(cwd, CONFIG_FILE);
		const cdata = await fileUtils.readJSON(configPath);
		if (!cdata) {
			return `Failed to load config file ${configPath}`;
		}
		contentRoot = fsPath.resolve(cwd, contentRoot);
		const config = this._validateContentConfig(cdata);
		const contentErr = await this._processContent(config, contentRoot);
		if (contentErr) {
			return contentErr;
		}
		const dictErr = await this._loadLocales();
		if (dictErr) {
			return dictErr;
		}

		const navErr = await this._loadNavItems(contentRoot)

		return navErr;
	}

	private async _loadNavItems(contentRoot: string): Promise<string> {
		const navPath = fsPath.resolve(contentRoot, "nav.json");
		const navData = await fileUtils.readJSON<YASPP.IYasppNavData>(navPath);
		if (!navData) {
			return `navigation items data not found in ${navPath}`;
		}
		if (!navData.items || !navData.sections || !navData.groups) {
			return `nav.json must contain items, sections and groups`;
		}
		Object.entries(navData.groups).forEach(([groupName, groupData]) => {
			if (!groupName || !Array.isArray(groupData.items)) {
				console.error(`bad entry in nav sections ${groupName}`);
				return;
			}
			this._navItems[groupName] = [];

			groupData.items.forEach(sectionName => {
				const sectionData = navData.sections[sectionName];
				if (!Array.isArray(sectionData?.items)) {
					console.error(`unknown or invalid section ${sectionName}`);
					return;
				}
				const section: INavSection = {
					id: sectionName,
					locale: sectionData.locale?? {},
					title: sectionData.title,
					items: sectionData.items.map(itemName => {
						const itemData = navData.items[itemName];
						if (!itemData) {
							console.error(`Missing nav item ${itemName}`);
							return null;
						}
						return {
							...itemData,
							locale: itemData.locale?? {},
							id: itemName,
						};
					}).filter(Boolean) as YASPP.INavItemData[]
				};
				this._navItems[groupName].push(section);
			})
		})
		return "";
	}

	private async _loadLocales(): Promise<string> {
		try {
			const localeConfig = i18nconfig as I18NConfig;
			if (!localeConfig?.dictionaries || !localeConfig?.locales?.length) {
				throw new Error(`i18n.js must include locales and dictionaries`);
			}
			const ret: LocaleDictionary = new Map();
			for await (const lang of localeConfig.locales) {
				const dict = await this._loadLanguage(lang, localeConfig);
				if (dict) {
					ret.set(lang, dict);
				}
			}
			this._dictionary = ret;
			return "";
		}
		catch (err) {
			return `Failed to load dictionaries block from i18n.js: ${err}`;
		}

	}

	public get indexPath() {
		return this._indexPage;
	}

	public get contentPath() {
		return this._content;
	}

	public get rootPath() {
		return this._root;
	}

	private async _processContent(config: YASPP.IYasppContentConfig, contentRoot: string): Promise<string> {
		if (!config.root) {
			return `Invalid content root in yaspp.json`;
		}
		const contentPath = fsPath.resolve(contentRoot, "content");
		if (!await fileUtils.isFolder(contentPath)) {
			return `Content path indicated by config not found: ${contentPath}`;
		}
		this._content = contentPath;
		const indexPath = fsPath.resolve(contentPath, config.index);
		if (!await fileUtils.isFileOrFolder(indexPath)) {
			return `Failed to find index pag/folder at ${indexPath}`;
		}
		this._indexPage = config.index;

		return "";

	}

	/**
	 * 
	 * @param config 
	 * @returns 
	 */
	private _validateContentConfig(config: Partial<YASPP.IYasppConfig>): YASPP.IYasppContentConfig {
		const content = config?.content || {} as Partial<YASPP.IYasppContentConfig>;
		return {
			root: content.root || "",
			index: content.index || "",
		};
	}

	private async _loadLanguage(lang: LocaleId, localeConfig: I18NConfig): Promise<LocaleLanguage | null> {
		async function load(nsMap: Record<string, string>): Promise<ILocaleResult[]> {
			const sys = Object.entries(nsMap).map(async ([ns, path]): Promise<ILocaleResult> => {
				path = path.replace(/%LANG%/g, lang);
				const data = await fileUtils.readJSON<LocaleNamespace>(path, { canFail: true });
				return {
					ns,
					data
				}
			});
			return await Promise.all(sys);
		}

		try {
			const dictionaries: LocaleLanguage = new Map();
			const loaded = await load(localeConfig.dictionaries.system || {});
			loaded.forEach(rec => {
				if (rec.data) {
					dictionaries.set(rec.ns, rec.data);
				}
			});
			const ploaded = await load(localeConfig.dictionaries.project || {});
			ploaded.forEach(rec => {
				const cur = dictionaries.get(rec.ns) ?? {};
				Object.assign(cur, rec.data);
				dictionaries.set(rec.ns, cur);
			})
			return dictionaries;

		}
		catch (err) {
			console.error(`Failed to load dictionaries block from i18n.js`);
			return null;
		}

	}
}

type InitCallback = (app: IYasppApp) => unknown;

const _instances: Map<string, {
	app: YasppApp;
	resolvers: InitCallback[];
}> = new Map();

export const initYaspp = async function (root?: string): Promise<IYasppApp> {
	if (!root) {
		const { serverRuntimeConfig } = getNextConfig();
		root = String(serverRuntimeConfig.PROJECT_ROOT);
	}
	const { app, resolvers } = _instances.get(root) ?? {
		app: new YasppApp(),
		resolvers: []
	}
	if (app.isValid) {
		return app;
	}
	if (app.isLoading) {
		const p = new Promise<IYasppApp>(resolve => {
			resolvers.push(resolve);
		});
		return p;
	}
	_instances.set(root, { app, resolvers });
	const error = await app.init(root, "public/yaspp");
	if (error) {
		const err = `Error loading yaspp: ${error}`;
		console.log(err);
		// throw new Error(`Error loading yaspp: ${error}`);
	}
	_instances.set(root, { app, resolvers: [] });
	resolvers.forEach(resolve => resolve(app));
	return app;

}
