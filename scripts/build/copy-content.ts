/* eslint-disable no-inner-declarations */

import fsPath from "path";
// import { promises as fs } from "fs";
import { yasppUtils } from "./utils";
// import { fileUtils } from "../../src/lib/fileUtils";
// import type { YASPP } from "yaspp-types";
import { getYasppProjectRoot, loadYasppConfig } from "../../src/lib/yaspp/yaspp-lib";

const rootPath = fsPath.resolve(__dirname, "../..");

// async function copyStyles(projectRoot: string, publicRoot: string, style: Partial<YASPP.IYasppStyleConfig> | undefined, clean: boolean): Promise<string> {
// 	const targetPath = fsPath.resolve(publicRoot, "styles"),
// 		sitePath = fsPath.resolve(targetPath, "site.scss");
// 	await fileUtils.mkdir(targetPath);
// 	if (clean) {
// 		await fileUtils.removeFolder({ path: targetPath, removeRoot: false });
// 	}
// 	try {
// 		if (style?.root) {
// 			const stylePath = fsPath.resolve(projectRoot, style.root);

// 			if (!await fileUtils.isFolder(stylePath)) {
// 				return `Styles folder ${style.root} (${stylePath}) not found`;
// 			}
// 			const contentErr = await yasppUtils.copyFolderContent(stylePath, targetPath, clean);
// 			if (contentErr) {
// 				return contentErr;
// 			}
// 			console.log(`copied ${style.root} to public/styles`);
// 			if (style.sheets?.length) {
// 				// const name = style.index.replace(/\.scss\s*$/i, "");
// 				// const indexPath = fsPath.resolve(targetPath, `${name}.scss`);
// 				// if (indexPath === sitePath) {
// 				// 	return "";
// 				// }
// 				// await fs.copyFile(indexPath, sitePath);
// 				// console.log(`copied ${style.index} to ${yasppUtils.trimPath(sitePath)}`);
// 				return "";
// 			}
// 		}

// 		// Create default site.scss if it doesn't exist
// 		if (await fileUtils.isFile(sitePath)) {
// 			return "";
// 		}
// 		const tmplResult = await yasppUtils.loadTemplate("site.scss");
// 		if (tmplResult.error) {
// 			return tmplResult.error;
// 		}
// 		await fs.writeFile(sitePath, tmplResult.result!);
// 		console.log(`Generated default site.scss`);
// 		return "";
// 	}
// 	catch (err) {
// 		return `Error copying styles ${err}`;
// 	}

// }

/**
 * Returns an error message, empty if no error
 */
async function run(clean: boolean, root?: string): Promise<string> {
	const projectRoot = await getYasppProjectRoot(root);
	if (!projectRoot) {
		return `Failed to find yaspp project root`;
	}
	const { error, result } = await loadYasppConfig(projectRoot);
	if (error) {
		return error;
	}
	try {
		const config = result!;
		const publicPath = fsPath.resolve(rootPath, "public/yaspp");
		const { locale, style, assets } = config;

		async function copyOne(target: string, root?: string): Promise<string> {
			if (!root) {
				return "";
			}
			const contentPath = fsPath.resolve(projectRoot, root),
				targetPath = fsPath.resolve(publicPath, target);
			const err = await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
			if (!err) {
				console.log(`copied ${root} to ${target}`);
			}
			return err;
		}
		const err = // await copyNav()
			// await copyOne("content", content.root)
			await copyOne("locales", locale.root)
			|| await copyOne("styles", style?.root)
			|| await copyOne("assets", assets?.root);

		
		return err ?? "";
	}
	catch (err) {
		return `Error copying yaspp data: ${err}`;
	}
}
const clean = yasppUtils.getArg(process.argv, "--clean");
const projectRoot = yasppUtils.getArg(process.argv, "--root");
console.log(`Copying yaspp project site data, clean mode ${clean !== null}`);
run(clean !== null, projectRoot ?? "")
	.then(err => {
		yasppUtils.exitWith(err);
	})
	.catch(err => {
		yasppUtils.exitWith(String(err));
	})