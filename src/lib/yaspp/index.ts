import * as fsPath from 'path';
import { fileUtils } from '../fileUtils';
import i18nconfig from "@root/i18n";
import styleBindings from "@root/class-bindings.json";
import type { IStylesheetUrl, IYasppApp } from 'types/app';
import type { I18NConfig, LocaleDictionary, LocaleId, LocaleLanguage, LocaleNamespace } from 'types';
import type { INavSection, NavGroups } from 'types/nav';
import type { IYasppBindingsFile, IYasppClassTree } from 'types/styles';
import type { YASPP } from "yaspp-types";
import { getYasppProjectPath, loadYasppConfig, validateClassBindings } from './yaspp-lib';
import YConstants from './constants';

interface ILocaleResult {
	ns: string;
	data: LocaleNamespace;
}

type YAppState = "none" | "error" | "loading" | "loaded";
class YasppApp implements IYasppApp {
	private _root = "";
	private _content = "";
	private _indexPage = "";
	private _error: string = "";
	private _state: YAppState = "none";
	private _dictionary: LocaleDictionary | null = null;
	private readonly _navItems: Record<string, INavSection[]> = {};
	private readonly _styleUrls: IStylesheetUrl[] = [];
	private readonly _classBindings: Array<IYasppClassTree> = [];

	public get isLoading() {
		return this._state === "loading";
	}

	public get error(){
		return this._error;
	}

	public get isValid(): boolean {
		return this._state === "loaded";
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

	public get styleClassBindings(): ReadonlyArray<IYasppClassTree> {
		return this._classBindings.slice();
	}

	public async init(projectRoot: string): Promise<string> {
		if (this._state !== "none") {
			throw new Error("Can't call yaspp app init more than once");
		}
		this._state = "loading";
		const returnError = (err: string) => {
			this._state  = err ? "error" : "loaded";
			this._error = err ? `Yaspp init error: ${err}\ncwd: ${process.cwd()}\nProject root: ${projectRoot}` : "";
			return err;
		}
		try {
			if (!await fileUtils.isFolder(projectRoot)) {
				return returnError(`path ${projectRoot} is not a folder, can't find ${YConstants.CONFIG_FILE}`);
			}
			this._root = projectRoot;
			const configResult = await loadYasppConfig(projectRoot);
			if (configResult.error) {
				return returnError(configResult.error);
			}
			const yConfig = configResult.result;
			this._content = fsPath.resolve(projectRoot, yConfig.content.root);
			this._indexPage = yConfig.content.index;
	
			const styleErr = await this._processStyles(projectRoot, yConfig.style);
			if (styleErr) {
				return returnError(styleErr);
			}
			const dictErr = await this._loadLocales();
			if (dictErr) {
				return returnError(dictErr);
			}
			const bf = styleBindings as unknown as IYasppBindingsFile;
			const bres = validateClassBindings(bf.bindings);
			if (bres.error) {
				return returnError(bres.error);
			}
			this._classBindings.push(...bres.result);

			const navErr = await this._loadNavItems(yConfig.nav, projectRoot);

			return returnError(navErr);
		}
		catch(err) {
			return returnError(String(err));
		}
	}

	private async _loadNavItems(config: YASPP.IYasppNavConfig, projectRoot: string): Promise<string> {
		const index = config.index;

		const navPath = fsPath.resolve(projectRoot, index);
		const navRes = await fileUtils.readJSON<YASPP.IYasppNavData>(navPath);
		if (!navRes.result) {
			return `navigation items data not found in ${navPath} (${navRes.error || "unknown error"})`;
		}
		const navData = navRes.result;
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

		for await (const rawSheet of sheets as string[]) {
			if (rawSheet.includes("..") || !/^[a-z_]/i.test(rawSheet)) {
				return `Illegal stylesheet url ${rawSheet}`
			}
			const sheet = fileUtils.assertFileExtension(rawSheet, "css");
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

	private async _loadLanguage(lang: LocaleId, localeConfig: I18NConfig): Promise<LocaleLanguage | null> {
		async function load(nsMap: Record<string, string>): Promise<ILocaleResult[]> {
			const sys = Object.entries(nsMap).map(async ([ns, path]): Promise<ILocaleResult> => {
				path = path.replace(/%LANG%/g, lang);
				// ignore errors
				const res = await fileUtils.readJSON<LocaleNamespace>(path, { canFail: true });
				return {
					ns,
					data: res.result
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
	readonly app: YasppApp;
	readonly resolvers: InitCallback[];
}> = new Map();


export interface IInitYasppOptions {
	// will default to 
	readonly yasppRoot: string;
	readonly projectRoot: string;
}
/**
 * Tries to load yaspp.config.json and build the relevant data from this file and
 * files that it references. An app is always returned, you should check its `isValid` value;
 * @param [projectRoot] defaults to process.cwd()
 * @returns 
 */
export const initYaspp = async function (): Promise<IYasppApp> {
	const projectRoot = YConstants.PUBLIC_PATH;
	const projectPath = await getYasppProjectPath(projectRoot);

	const { app, resolvers } = _instances.get(projectRoot) ?? {
		app: new YasppApp(),
		resolvers: []
	}
	if (app.isValid || app.error) {
		return app;
	}
	if (app.isLoading) {
		const p = new Promise<IYasppApp>(resolve => {
			resolvers.push(resolve);
		});
		return p;
	}
	_instances.set(projectRoot, { app, resolvers });
	const error = await app.init(projectPath);
	if (error) {
		const err = `Error loading yaspp: ${error}`;
		console.log(err);
		// throw new Error(`Error loading yaspp: ${error}`);
	}
	// update data in map
	_instances.set(projectRoot, { app, resolvers: [] });
	resolvers.forEach(resolve => resolve(app));
	return app;

}
