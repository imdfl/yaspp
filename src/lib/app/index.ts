import getConfig from 'next/config';
import * as fsPath from 'path';
import { promises as fs } from 'fs';
import { fileUtils } from '../fileUtils';
import { parse as parseJSON } from 'json5';
import i18nconfig from "@root/i18n";
import type { IYasppApp, IYasppConfig, IYasppContentConfig, IYasppLocaleConfig } from 'types/app';
import type { I18NConfig, LocaleDictionary, LocaleId, LocaleLanguage, LocaleNamespace } from '../../types';


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
		if (!await fileUtils.isFile(configPath)) {
			return `Can't find file ${configPath}`;
		}
		try {
			const data = await fs.readFile(configPath, "utf-8");
			const config = this._validateConfig(parseJSON(data));
			if (!config.content.root) {
				return `Invalid content root in yaspp.json`;
			}
			const contentPath = fsPath.resolve(cwd, contentRoot);
			if (!await fileUtils.isFolder(contentPath)) {
				return `Content path indicated by config not found: ${contentPath}`;
			}
			this._content = contentPath;
			const indexPath = fsPath.resolve(contentPath, config.content.index);
			if (!await fileUtils.isFileOrFolder(indexPath)) {
				return `Failed to find index pag/folder at ${indexPath}`;
			}
			this._indexPage = config.content.index;
			this._dictionary = await this.loadLocales();
			if (!this._dictionary) {
				return "Failed to load locales";
			}

			return "";
		}
		catch (err) {
			return `Error loading configuration from ${configPath}: ${err}`;
		}
	}

	public async loadLocales(): Promise<LocaleDictionary | null> {
		try {
			const localeConfig = i18nconfig as I18NConfig;
			if (!localeConfig?.dictionaries || !localeConfig?.locales?.length) {
				throw new Error(`i18n.js must include langsand dictionaries`);
			}
			const ret: LocaleDictionary = new Map();
			for await (const lang of localeConfig.locales) {
				const dict = await this._loadLanguage(lang, localeConfig);
				if (dict) {
					ret.set(lang, dict);
				}
			}
			return ret;
		}
		catch (err) {
			console.error(`Failed to load dictionaries block from i18n.js: ${err}`);
			return null;
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

	private _validateConfig(config: Partial<IYasppConfig>): IYasppConfig {
		config = config ?? {};
		const content = config.content || {} as Partial<IYasppContentConfig>,
			locale = config.locale || {} as Partial<IYasppLocaleConfig>;
		const langs = Array.isArray(locale.langs) ? locale.langs : ["en"];
		return {
			content: {
				root: content.root || "",
				index: content.index || ""
			},
			locale: {
				langs,
				defaultLocale: locale.defaultLocale && langs.includes(locale.defaultLocale) ?
					locale.defaultLocale : undefined,
				pages: {},
				root: locale.root || ""

			}
		};
	}

	private async _loadLanguage(lang: LocaleId, localeConfig: I18NConfig): Promise<LocaleLanguage | null> {
		async function load(nsMap: Record<string, string>): Promise<ILocaleResult[]> {
			const sys = Object.entries(nsMap).map(async ([ns, path]): Promise<ILocaleResult> => {
				path = path.replace(/%LANG%/g, lang);
				const data = await fileUtils.readJSON<LocaleNamespace>(path);
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
				dictionaries.set(rec.ns, rec.data);
			});
			const ploaded = await load(localeConfig.dictionaries.project ||{});
			ploaded.forEach(rec => {
				const cur= dictionaries.get(rec.ns) ?? {};
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

const _instances: Map<string, {
	app: YasppApp;
	resolvers: InitCallback[];
}> = new Map();
type InitCallback = (app: IYasppApp) => unknown;

export const initYaspp = async function (root?: string): Promise<IYasppApp> {
	if (!root) {
		const { serverRuntimeConfig } = getConfig();
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
	const error = await app.init(root, "public/content");
	if (error) {
		const err = `Error loading yaspp: ${error}`;
		console.log(err);
		// throw new Error(`Error loading yaspp: ${error}`);
	}
	_instances.set(root, { app, resolvers: [] });
	resolvers.forEach(resolve => resolve(app));
	return app;

}
