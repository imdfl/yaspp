import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { ParsedUrlQuery } from "querystring";
import { collectPathsIn, decodePath, pathToRelativePath } from "./pathHelpers";
import { loadContentFolder } from "@lib/loadFolderContent";
import { ILocaleMap } from "@src/types/models";
import type { IContentParseOptions } from "@src/types/parser/parser";
import {
	LoadContentModes,
	LoadFolderModes,
	MLParseModes,
} from "@src/types/parser/modes";
import { IFolderStaticProps } from "@src/types/folder";
import { LocaleId } from "@src/types/locale";
import type { IMLGetStaticPropsOptions, IMLNextUtils, IStaticPathsParameters } from "./types";
import { initYaspp } from "../yaspp";

class MLNextUtils implements IMLNextUtils {
	/**
	 * Converts a path template, e.g. docs/[id] to docs/the-story-of-mel when `dict` has `{ id: "the-story-of-mel" }`
	 * @param path
	 * @param dict
	 * @returns
	 */
	public async populateDynamicPath(
		path: string,
		dict:  Record<string, string>
	): Promise<string> {
		let relative = await pathToRelativePath(decodePath(path));

		if (!relative) {
			return "";
		}

		Object.entries(dict).forEach(([key, value]) => {
			const re = new RegExp(`\\[${key}\\]`, "g");
			relative = relative.replace(re, value);
		});

		return relative;
	}

	public async getValidFolderStaticProps(options: IMLGetStaticPropsOptions
	): Promise<GetStaticPropsResult<IFolderStaticProps> | null> {

		try {
			const res = await this.getFolderStaticProps(options);
			const props = (res as any).props as IFolderStaticProps;
			return props?.documentPath ? res : null;
		}
		catch {
			return null;
		}
	}


	public async getFolderStaticProps({
		folderRelativePath: folderPath, locale, loadMode, mode
	}: IMLGetStaticPropsOptions
	): Promise<GetStaticPropsResult<IFolderStaticProps>> {
		const app = await initYaspp();
		if (!app.isValid) {
			console.error(`Failed to initialize yaspp: ${app.error}`);
			return {
				props: {
					content: "",
					initialLocale: "",
					documentPath: folderPath,
					nav: "",
					styleClassBindings: [],
					theme: "",
					styleUrls: [],
					themes: []
				}
			}
		}
		const relativePath = folderPath || app.indexPath;
		const docData = await loadContentFolder({
			app,
			relativePath,
			loadMode,
			locale,
			mode,
		});

		const page = docData.pages[0];

		return {
			props: {
				// Stringify the result, instead of leaving the job to Next, because
				// Next's serializer is picky about objects, won't take class instances, Dates and more
				content: JSON.stringify(docData.pages),
				documentPath: page?.path || '',
				nav: JSON.stringify(app.nav),
				styleClassBindings: app.styleClassBindings,
				theme: app.theme,
				themes: app.themeUrls.slice(),
				styleUrls: app.styleUrls.map(r => r.full),
				initialLocale: app.initialLocale,
				allowedLocales: []
			},
		};
	}

	public async getFolderStaticPaths(
		folderPath: string,
		locales: LocaleId[]
	): Promise<GetStaticPathsResult<ParsedUrlQuery>> {
		const paths: ILocaleMap[] = [];
		const app = await initYaspp();
		if (!app.isValid) {
			console.error(`Failed to get static paths, yaspp error ${app.error}`);
			return {
				paths: [],
				fallback: false
			}
		}
		for await (const locale of (locales || [])) {
			const folderData = await loadContentFolder({
				locale,
				app,
				relativePath: folderPath,
				loadMode: LoadFolderModes.Children,
				mode: {
					contentMode: LoadContentModes.None,
					parseMode: MLParseModes.NORMAL,
				},
			});
			paths.push(...folderData.ids);
		}

		return {
			paths,
			fallback: false,
		};
	}

	public async getNestedStaticPaths(
		options: IStaticPathsParameters
	): Promise<GetStaticPathsResult<ParsedUrlQuery>> {
		const app = await initYaspp();
		if (!app.isValid) {
			return {
				paths: [],
				fallback: false
			}
		}
		const paths: ILocaleMap[] = [];
		const contentFolder = decodePath(options.contentFolder);

		const allPaths = await collectPathsIn(app.contentPath, contentFolder);

		for (let rec of allPaths) {
			for (let locale of options.locales) {
				const folderData = await loadContentFolder({
					locale,
					app,
					relativePath: rec.path,
					loadMode: LoadFolderModes.Folder,
					mode: {
						contentMode: LoadContentModes.None,
						parseMode: MLParseModes.NORMAL,
					},
				});

				if (folderData.ids.length) {
					paths.push({
						params: rec.idMap,
						locale,
					});
				}
			}
		}

		return Promise.resolve({
			paths,
			fallback: false,
		});
	}
}

export const mlNextUtils: IMLNextUtils = new MLNextUtils();
