import fsPath from "path";
import { promises as fs } from "fs";
import { parse as parseJSON } from "json5";
import { loadYasppConfig, yasppUtils } from "./utils";
import type { IProjectLocaleConfig, IYasppAppConfig, IYasppLocaleConfig } from "../../src/types/app"
import { fileUtils } from "../../src/lib/fileUtils";

/**
 * The root of the  yaspp module
 */
const ROOT_FOLDER = fsPath.resolve(__dirname, "../..");
const I18N_TMPL = "i18n-tmpl.json";
const GEN_HEADER = `// ****************************************************************"
// This is a GENERATED file, editing it is likely to break the build
// ****************************************************************\n`;


async function generateI18N(projectRoot: string, config: IYasppLocaleConfig): Promise<string> {
	const values = {
		"%LANGS%": [] as ReadonlyArray<string>,
		"%DEFAULT%": "en",
		"%PAGES%": "",
		"%SYSNS%": [] as ReadonlyArray<string>,
		"%USERNS%": [] as ReadonlyArray<string>,
		"%DICTIONARIES%": ""
	}
	const tmplResult = await yasppUtils.loadTemplate("i18n.js");
	if (tmplResult.error) {
		return tmplResult.error;
	}
	const outputTmpl = tmplResult.result!.replace(/\/\/.+$/mg, "");
	const tmplPath = fsPath.resolve(process.cwd(), I18N_TMPL);
	if (!await fileUtils.isFile(tmplPath)) {
		return `Template file ${I18N_TMPL} (${tmplPath}) not found`;
	}
	try {
		function ts(s: string) { return `"${s}"`; }
		const data = await fs.readFile(tmplPath, "utf-8");
		const tmpl = parseJSON<IProjectLocaleConfig>(data);
		const sysNS = Object.entries(tmpl.pages).reduce((ns: Set<string>, [key, values]) => {
			values.forEach(s => ns.add(s));
			return ns
		}, new Set<string>());
		const nsArray = Array.from(sysNS.keys());
		values["%SYSNS%"] = nsArray.map(ts);
		const sysDict = nsArray.reduce((dict: Record<string, string>, ns) => {
			dict[ns] = `./locales/%LANG%/${ns}.json`;
			return dict;
		}, {})
		const dicts = {
			system: sysDict,
			project: {} as Record<string, string>
		}
		values["%DEFAULT%"] = config.defaultLocale;
		values["%LANGS%"] = config.langs.map(ts);
		const mergedPages = Object.entries(config.pages).reduce((pages, [key, values]) => {
			const sys = new Set(pages[key] || []);
			values.forEach(s => sys.add(s));
			pages[key] = Array.from(sys.keys());
			return pages;
		}, tmpl.pages);
		values["%PAGES%"] = JSON.stringify(mergedPages, null, 4);
		if (config.root) {
			const nsPath = fsPath.resolve(projectRoot, config.root, config.defaultLocale);
			if (!await fileUtils.isFolder(nsPath)) {
				return `Failed to find locale folder for ${config.defaultLocale} under ${config.root}`;
			}
			const list = await fs.readdir(nsPath, { withFileTypes: true });
			const userNS = list
				.filter(dirent => dirent.isFile())
				.filter(dirent => /\.json$/.test(dirent.name))
				.map(dirent => dirent.name)
				.map(s => s.replace(/\.[^\.]+$/, ""));
			values["%USERNS%"] = userNS.map(ts);
			const pDict = userNS.reduce((dict: Record<string, string>, ns) => {
				dict[ns] = `./public/locales/%LANG%/${ns}.json`;
				return dict;
			}, {})
			dicts.project = pDict
		}
		values["%DICTIONARIES%"] = JSON.stringify(dicts, null, 4);
		const output = Object.entries(values).reduce((html, [key, value]) => {
			const re = new RegExp(key, "g");
			return html.replace(re, String(value));
		}, outputTmpl);
		const outPath = fsPath.resolve(ROOT_FOLDER, "i18n.js");
		await fs.writeFile(outPath, GEN_HEADER + output);
		console.log(`Generated ${yasppUtils.trimPath(outPath)}`);
	}
	catch (err) {
		return `Error loading template file ${I18N_TMPL} (${tmplPath}): ${err}`;
	}
	return "";
}

async function generateAppJSON(config: IYasppAppConfig): Promise<string> {
	const fpath = fsPath.resolve(ROOT_FOLDER, "yaspp.json");
	try {
		const data = [
			GEN_HEADER,
			JSON.stringify(config, null, 4)
		]
		await fs.writeFile(fpath, data.join('\n'));
		console.log(`Generated ${yasppUtils.trimPath(fpath)}`);
		return "";
	}
	catch (err) {
		return `Error generating yaspp.json (${fpath}): ${err}`;
	}

}

async function clean(): Promise<string> {
	try {
		const publicPath = fsPath.resolve(ROOT_FOLDER, "public");
		if (!await fileUtils.isFolder(publicPath)) {
			return "public folder not found";
		}
		const folders = ["content", "locales", "styles", "assets/site"];
		for await (const folder of folders) {
			const fpath = fsPath.resolve(publicPath, folder);
			await fileUtils.mkdir(fpath);
			await fileUtils.removeFolder({
				path: fpath,
				removeRoot: false
			});
		}
		console.log(`Cleaned ${folders}`);
		return "";
	}
	catch (err) {
		return (`Error cleaning project content ${err}`);
	}
}
/**
 * Returns an error message, empty if no error
 */
async function run(projectRoot: string): Promise<string> {
	try {
		const { error, result } = await loadYasppConfig(projectRoot, { validate: true });
		if (error) {
			return error;
		}
		const { content, locale, style } = result!;
		const config: IYasppAppConfig = {
			root: yasppUtils.diffPaths(ROOT_FOLDER, projectRoot),
			content,
			locale,
			style
		}
		const appErr = await generateAppJSON(config);
		if (appErr) {
			return appErr;
		}
		const i18err = await generateI18N(projectRoot, locale);
		if (i18err) {
			return i18err;
		}
		const cleanErr = await clean();
		return cleanErr;
	}
	catch (e) {
		return `Error loading yaspp.json: ${e}`;
	}
}

function exitWith(err: string): void {
	if (err) {
		console.error(err);
	}
	process.exit(err ? 1 : 0);
}

const rootArg = yasppUtils.getArg(process.argv, "--project") || yasppUtils.getArg(process.argv, "-P");
if (!rootArg) {
	exitWith(`Please provide the relative or absolute path of your project, e.g.\n--project ../path/to/your/project`);
}
else {
	const projectRoot = fsPath.resolve(process.cwd(), rootArg!);
	run(projectRoot)
		.then(err => {
			exitWith(err);
		})
		.catch(err => {
			exitWith(String(err));
		});
}