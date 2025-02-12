import fsPath from "path";
import { promises as fs } from "fs";
import { yasppUtils, loadYasppAppConfig, IResponse } from "./utils";
import { IYasppStyleConfig } from "../../src/types/app";
import { fileUtils } from "../../src/lib/fileUtils";

const rootPath = fsPath.resolve(__dirname, "../..");

async function copyStyles(projectRoot: string, style: Partial<IYasppStyleConfig> | undefined, clean: boolean): Promise<string> {
	const targetPath = fsPath.resolve(rootPath, "public/styles"),
		sitePath = fsPath.resolve(targetPath, "site.scss");
	await fileUtils.mkdir(targetPath);
	try {
		if (style?.root) {
			const stylePath = fsPath.resolve(projectRoot, style.root);

			if (!await fileUtils.isFolder(stylePath)) {
				return `Styles folder ${style.root} (${stylePath}) not found`;
			}
			const contentErr = await yasppUtils.copyFolderContent(stylePath, targetPath, clean);
			if (contentErr) {
				return contentErr;
			}
			console.log(`copied ${style.root} to public/styles`);
			if (style.index) {
				const name = style.index.replace(/\.scss$/i, "");
				const indexPath = fsPath.resolve(targetPath, `${name}.scss`);
				if (indexPath === sitePath) {
					return "";
				}
				await fs.copyFile(indexPath, sitePath);
				console.log(`copied ${style.index} to public/styles/site.scss`);
				return "";
			}
		}

		// Create default site.scss if it doesn't exist
		if (await fileUtils.isFile(sitePath)) {
			return "";
		}
		const tmplResult = await yasppUtils.loadTemplate("site.scss");
		if (tmplResult.error) {
			return tmplResult.error;
		}
		await fs.writeFile(sitePath, tmplResult.result!);
		console.log(`Generated default site.scss`);
		return "";
	}
	catch (err) {
		return `Error copying styles ${err}`;
	}

}

/**
 * Returns an error message, empty if no error
 */
async function run(clean: boolean): Promise<string> {
	try {
		const { error, result } = await loadYasppAppConfig({ validate: false });
		if (error) {
			return error;
		}
		const config = result!;
		const projectRoot = fsPath.resolve(rootPath, config.root),
			publicPath = fsPath.resolve(rootPath, "public");
		const { content, locale, style, assets } = config;

		async function copyOne(target: string, root?: string): Promise<string> {
			if (!root) {
				return "";
			}
			const contentPath = fsPath.resolve(projectRoot, root),
				targetPath = fsPath.resolve(publicPath, target);
			return await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
		}
		async function copyAssets() {
			const contentPath = fsPath.resolve(__dirname, "assets"),
				targetPath = fsPath.resolve(publicPath, "assets/site");
			const err = await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
			if (!err) {
				console.log("copied default assets");
			}
			return err;
		}
		const err = await copyOne("content", content.root)
			|| await copyOne("locales", locale.root)
			|| await copyStyles(projectRoot, style, clean)
			|| await copyAssets()
			|| await copyOne("assets/site", assets?.root);
		return err ?? "";
	}
	catch (err) {
		return `Error loading yaspp.json: ${err}`;
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