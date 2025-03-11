import * as fsPath from 'path';
import { fileUtils } from '../fileUtils';
import i18nconfig from "@root/i18n";
import type { IStylesheetUrl, IYasppApp } from 'types/app';
import type { I18NConfig, LocaleDictionary, LocaleId, LocaleLanguage, LocaleNamespace } from 'types';
import type { INavSection, NavGroups } from 'types/nav';
import { YASPP } from "yaspp-types";
import { getYasppProjectRoot, loadYasppConfig } from './yaspp-lib';


const CONFIG_FILE = "yaspp.config.json";

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
	private readonly _styleUrls: IStylesheetUrl[] = [];

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

	public get styleUrls(): ReadonlyArray<IStylesheetUrl> {
		return this._styleUrls.slice();
	}

	public get nav(): NavGroups {
		return {
			...this._navItems
		}
	}

	public async init(projectRoot: string): Promise<string> {
		if (this._isLoading) {
			throw new Error("Can't call yaspp app init when it's loading");
		}
		this._isLoading = true;
		try {
			if (!await fileUtils.isFolder(projectRoot)) {
				return `path ${projectRoot} is not a folder, can't find ${CONFIG_FILE}`;
			}
			this._root = projectRoot;
			const configResult = await loadYasppConfig(projectRoot);
			if (configResult.error) {
				return configResult.error;
			}
			const yConfig = configResult.result;
			this._content = fsPath.resolve(projectRoot, yConfig.content.root);
			this._indexPage = yConfig.content.index;
	
			const styleErr = await this._processStyles(projectRoot, yConfig.style);
			if (styleErr) {
				return styleErr;
			}
			const dictErr = await this._loadLocales();
			if (dictErr) {
				return dictErr;
			}

			const navErr = await this._loadNavItems(yConfig.nav, projectRoot);

			return navErr;
		}
		finally {
			this._isLoading = false;
		}
	}

	private async _loadNavItems(config: YASPP.IYasppNavConfig, projectRoot: string): Promise<string> {
		const index = config.index;

		const navPath = fsPath.resolve(projectRoot, index);
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
					locale: sectionData.locale ?? {},
					title: sectionData.title,
					items: sectionData.items.map(itemName => {
						const itemData = navData.items[itemName];
						if (!itemData) {
							console.error(`Missing nav item ${itemName}`);
							return null;
						}
						return {
							...itemData,
							locale: itemData.locale ?? {},
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

	/**
	 * The config is validated and sheets is an array
	 * @param config 
	 * @param projectRoot 
	 * @returns 
	 */
	private async _processStyles(projectRoot: string, config?: YASPP.IYasppStyleConfig): Promise<string> {
		if (!config) {
			return "";
		}
		const { root, sheets } = config;

		const styleRoot = fsPath.resolve(projectRoot, root);
		if (!await fileUtils.isFolder(styleRoot)) {
			return `Style root folder ${styleRoot} not found`;
		}

		for await (const sheet of sheets as string[]) {
			if (sheet.includes("..") || !/^[a-z_]/i.test(sheet)) {
				return `Illegal stylesheet url ${sheet}`
			}
			const sheetPath = fsPath.resolve(styleRoot, sheet);
			if (!await fileUtils.isFile(sheetPath)) {
				return `Stylesheet ${sheetPath} not found`;
			}
			this._styleUrls.push({
				base: sheet,
				full: `/yaspp/styles/${sheet}`
			});
		}
		return "";
	}

	/**
	 * 
	 * @param config 
	 * @returns 
	 */
	private _extractContentConfig(config: Partial<YASPP.IYasppConfig>): YASPP.IYasppContentConfig {
		const content = config?.content || {} as Partial<YASPP.IYasppContentConfig>;
		return {
			root: content.root || "",
			index: content.index || "",
		};
	}

	private _extractStyleConfig(config: Partial<YASPP.IYasppConfig>): YASPP.IYasppStyleConfig {
		const style = config?.style || {} as Partial<YASPP.IYasppStyleConfig>,
			rawSheets = style.sheets;

		const sheets = typeof rawSheets === "string" ?
			rawSheets.split(',').map(s => s.trim())
			: Array.isArray(rawSheets) ?
				rawSheets.slice()
				: ((rawSheets && console.error(`Invalid sheets entry in configuration ${typeof rawSheets}`)), []);
		return {
			root: style.root || "",
			sheets: sheets.filter(Boolean)
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
	const projectRoot = await getYasppProjectRoot(root);

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
	const error = await app.init(projectRoot);
	if (error) {
		const err = `Error loading yaspp: ${error}`;
		console.log(err);
		// throw new Error(`Error loading yaspp: ${error}`);
	}
	// update data in map
	_instances.set(root, { app, resolvers: [] });
	resolvers.forEach(resolve => resolve(app));
	return app;

}
