/* eslint-disable no-inner-declarations */

import fsPath from "path";
// import { promises as fs } from "fs";
import { yasppUtils } from "./utils";
// import { fileUtils } from "../../src/lib/fileUtils";
// import type { YASPP } from "yaspp-types";
import { getYasppProjectPath, loadYasppConfig } from "@lib/yaspp/yaspp-lib";
import { YASPP } from "yaspp-types";

const rootPath = fsPath.resolve(__dirname, "../..");

/**
 * Returns an error message, empty if no error
 */
async function run(clean: boolean, projectRoot?: string): Promise<string> {
	const projectPath = await getYasppProjectPath(projectRoot);
	if (!projectPath) {
		return `Failed to find yaspp project root`;
	}
	const { error, result } = await loadYasppConfig(projectPath);
	if (error) {
		return error;
	}
	try {
		const config: YASPP.IYasppConfig = result;
		const publicPath = fsPath.resolve(rootPath, "public/yaspp");
		const { locale, style, assets } = config;

		async function copyOne(target: string, root?: string): Promise<string> {
			if (!root) {
				return "";
			}
			const contentPath = fsPath.resolve(projectPath, root),
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
const projectRoot = yasppUtils.getArg(process.argv, "--project");
console.log(`Copying yaspp project site data, clean mode ${clean !== null}`);
yasppUtils.loadEnv()
	.then(() => {
		run(clean !== null, projectRoot ?? "")
			.then(err => {
				yasppUtils.exitWith(err);
			})
			.catch(err => {
				yasppUtils.exitWith(String(err));
			})
	})
	.catch(err => {
		yasppUtils.exitWith(String(err));
	})