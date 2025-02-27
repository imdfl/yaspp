/* eslint-disable no-inner-declarations */

import fsPath from "path";
import { promises as fs } from "fs";
import { yasppUtils, loadYasppAppConfig } from "./utils";
import { IYasppStyleConfig } from "../../src/types/app";
import { fileUtils } from "../../src/lib/fileUtils";

const rootPath = fsPath.resolve(__dirname, "../..");

async function copyStyles(projectRoot: string, publicRoot: string, style: Partial<IYasppStyleConfig> | undefined, clean: boolean): Promise<string> {
	const targetPath = fsPath.resolve(publicRoot, "styles"),
		sitePath = fsPath.resolve(targetPath, "site.scss");
	await fileUtils.mkdir(targetPath);
	if (clean) {
		await fileUtils.removeFolder({ path: targetPath, removeRoot: false });
	}
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
				console.log(`copied ${style.index} to ${yasppUtils.trimPath(sitePath)}`);
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
	const { error, result } = await loadYasppAppConfig();
	if (error) {
		return error;
	}
	try {
		const config = result!;
		const projectRoot = fsPath.resolve(rootPath, config.root),
			publicPath = fsPath.resolve(rootPath, "public/yaspp");
		const { content, locale, style, assets } = config;

		async function copyOne(target: string, root?: string): Promise<string> {
			if (!root) {
				return "";
			}
			const contentPath = fsPath.resolve(projectRoot, root),
				targetPath = fsPath.resolve(publicPath, target);
			return await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
		}
		/**
		 * Copies default assets from the build assets folder
		 * @returns 
		 */
		async function copyAssets() {
			const contentPath = fsPath.resolve(__dirname, "assets"),
				targetPath = fsPath.resolve(publicPath, "assets");
			const err = await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
			if (!err) {
				console.log("copied default assets");
			}
			return err;
		}

		async function copyNav(): Promise<string> {
			const navPath = config.nav?.index;
			if(!navPath) {
				return "missing nav:index in configuration";
			};
			const srcPath = fsPath.resolve(projectRoot, navPath),
				trgPath = fsPath.resolve(publicPath, "nav.json");
			try {
				await fs.copyFile(srcPath, trgPath);
				return "";
			}
			catch(err) {
				return `Error copying ${srcPath}: ${err}`
			}
		}
		const err = await copyNav()
			|| await copyOne("content", content.root)
			|| await copyOne("locales", locale.root)
			|| await copyStyles(projectRoot, publicPath, style, clean)
			|| await copyAssets()
			|| await copyOne("assets", assets?.root);

		
		return err ?? "";
	}
	catch (err) {
		return `Error copying yaspp data: ${err}`;
	}
}
const clean = yasppUtils.getArg(process.argv, "--clean");
console.log(`Copying yaspp project site data, clean mode ${clean !== null}`);
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