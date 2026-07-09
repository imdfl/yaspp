/* eslint-disable no-inner-declarations */

import fsPath from "path";
import { promises as fs } from "fs";
import type { YASPP } from "yaspp-types";
import { yasppUtils } from "./utils";
import { getYasppProjectPath, loadYasppConfig } from "../lib/yaspp/yaspp-lib";
import YConstants from "../lib/yaspp/constants"
import { fileUtils } from "../lib/fileUtils";

const ROOT_PATH = fsPath.resolve(__dirname, "../..");

type ErrorMessage = string;
interface ICopyContentOptions {
	readonly projectPath: string;
	readonly root: string;
	readonly clean: boolean;
}

async function copyGlobals(projectRoot: string, config?: YASPP.IYasppGlobalsConfig): Promise<ErrorMessage> {
	if (!config?.files) {
		return;
	}
	const f = config!.files;

	if (!Array.isArray(config.files)) {
		return `Wrong globals type ${typeof config.files}`;
	}
	for await (const rec of f) {
		try {
			const src = fsPath.resolve(projectRoot, rec.source);
			const dst = fsPath.resolve(ROOT_PATH, rec.dest);
			await fs.copyFile(src, dst);
		}
		catch (err) {
			return `Error copying ${rec.source} to ${rec.dest}: ${err}`;
		}

	}

	return "";
}


export async function copyYasppContent({ projectPath, root, clean }: ICopyContentOptions): Promise<string> {
	const { error, result } = await loadYasppConfig({ projectRoot: projectPath, siteRoot: root, compile: false });
	if (error) {
		return error;
	}
	try {
		const config: YASPP.IYasppConfig = result;
		const publicPath = fsPath.resolve(ROOT_PATH, YConstants.PUBLIC_PATH);
		const { locale, style, assets, content, nav, globals } = config;

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
			catch (err) {
				return `Error copying ${target} from ${contentPath} to ${targetPath}: ${err}`;
			}
		}
		const err =
			await copyOne("nav.json", nav?.index)
			|| await copyOne("content", content.root)
			|| await copyOne("locales", locale.root)
			|| await copyOne("styles", style?.root)
			|| await copyOne("assets", assets?.root)
			|| await copyGlobals(projectPath, globals)


		return err ?? "";
	}
	catch (err) {
		return `Error copying yaspp data: ${err}`;
	}
}

/**
 * Returns an error message, empty if no error
 */
async function run(clean: boolean, projectRoot?: string): Promise<string> {
	const { project: projectPath, root } = await getYasppProjectPath(projectRoot);
	if (!projectPath) {
		return `Failed to find yaspp project root`;
	}

	return await copyYasppContent({ projectPath, root, clean });
}


if (require.main === module) {
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

}