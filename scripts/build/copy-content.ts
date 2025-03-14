/* eslint-disable no-inner-declarations */

import fsPath from "path";
// import { promises as fs } from "fs";
import { yasppUtils } from "./utils";
// import { fileUtils } from "../../src/lib/fileUtils";
// import type { YASPP } from "yaspp-types";
import { getYasppProjectRoot, loadYasppConfig } from "../../src/lib/yaspp/yaspp-lib";

const rootPath = fsPath.resolve(__dirname, "../..");

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