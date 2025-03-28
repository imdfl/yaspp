/* eslint-disable no-inner-declarations */

import fsPath from "path";
import { promises as fs } from "fs";
import { yasppUtils } from "./utils";
// import { fileUtils } from "../../src/lib/fileUtils";
// import type { YASPP } from "yaspp-types";
import { getYasppProjectPath, loadYasppConfig } from "../lib/yaspp/yaspp-lib";
import { YASPP } from "yaspp-types";
import YConstants from "../lib/yaspp/constants"
import { fileUtils } from "../lib/fileUtils";

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
		const publicPath = fsPath.resolve(rootPath, YConstants.PUBLIC_PATH);
		const { locale, style, assets, content, nav } = config;

		async function copyOne(target: string, root?: string): Promise<string> {
			if (!root) {
				return "";
			}
			const contentPath = fsPath.resolve(projectPath, root),
				targetPath = fsPath.resolve(publicPath, target);
			try {
				const contentType = await fileUtils.getFileType(contentPath);
				if (!contentType) {
					return `Can't find ${root} at ${projectPath}`;
				}

				if (contentType === "file") {
					await fs.copyFile(contentPath, targetPath);
					return "";
				}
				if (contentType === "folder") {
					return await yasppUtils.copyFolderContent(contentPath, targetPath, clean);
				}
				return `Unknown content type ${contentType} for ${contentPath}`;
			}
			catch(err) {
				return `Error copying ${target} from ${contentPath} to ${targetPath}: ${err}`;
			}
		}
		const err = 
			await copyOne("nav.json", nav?.index)
			|| await copyOne("content", content.root)
			|| await copyOne("locales", locale.root)
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