import fsPath from "path";
import { yasppUtils, loadYasppAppConfig } from "./utils";

const rootPath = fsPath.resolve(__dirname, "../..");

/**
 * Returns an error message, empty if no error
 */
async function run(clean: boolean): Promise<string> {
	try {
		const { error, result} = await loadYasppAppConfig({ validate: false });
		if (error) {
			return error;
		}
		const config = result!;
		const projectRoot= fsPath.resolve(rootPath, config.root)
		const { content, locale } = config;
		const contentPath = fsPath.resolve(projectRoot, content.root),
			targetPath = fsPath.resolve(rootPath, "public/content");
		const contentErr = await yasppUtils.copyContent(contentPath, targetPath, clean);
		if (contentErr) {
			return contentErr;
		}
		if (locale?.root) {
			const localeRoot = fsPath.resolve(projectRoot, locale.root),
				targetPath = fsPath.resolve(rootPath, "public/locales");
			return await yasppUtils.copyContent(localeRoot, targetPath, clean);
		}
		return "";
	}
	catch (e) {
		return `Error loading yaspp.json: ${e}`;
	}
}
const clean = yasppUtils.getArg(process.argv, "--clean");
run(clean !== null)
	.then(err => {
		if (err) {
			console.error(err);
		}
		process.exit(err ? 1 : 0);
	})
	.catch(err => {
		console.error(err);
		process.exit(2);
	})