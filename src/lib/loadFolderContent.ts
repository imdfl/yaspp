import { Dirent, promises as fs } from 'fs';
import fsPath from 'path';
import matter from 'gray-matter';
// import getConfig from 'next/config';
// import { setContentRootDir } from './contentRootDir';
import type { ICaptionConfiguration, IFolderContent, ILocaleMap, IMLParsedNode, IPageMetaData, IParsedPageData, PageSortField, ParsedNode } from 'types/models';
import { createMDParser } from './markdown-utils/markdownParser';
import type { IContentParseOptions } from 'types/parser/parser';
import {
	LoadContentModes,
	LoadFolderModes,
	MLParseModes,
} from 'types/parser/modes';
import type { ILoadContentOptions } from './markdown-utils/types';
import { mdUtils } from './markdown-utils/markdownUtils';
import { MLNODE_TYPES } from '../types';
import { parseDate, safeMerge } from '../utils';
import { fileUtils } from './fileUtils';
import { customMarkdownTags } from './customMarkdownTags';

/** Save setting for build time */
// const { serverRuntimeConfig } = getConfig();
// setContentRootDir(String(serverRuntimeConfig.PROJECT_ROOT));

/** Options for unspecified parse properties */
const DEFAULT_PARSE_OPTIONS: IContentParseOptions = {
	contentMode: LoadContentModes.Full,
	parseMode: MLParseModes.AUTO,
	nodeProcessors: undefined,
	locale: undefined,
};

export const loadContentFolder = async (
	{ relativePath, mode, loadMode,locale, rootFolder, app }: ILoadContentOptions
): Promise<IFolderContent> => {
	if (!rootFolder) {
		throw new Error(`can't load content folder with neither app nor root`);
	}
	const parseOptions: IContentParseOptions = {
		...DEFAULT_PARSE_OPTIONS,
		...mode,
		locale,
	};

	const contentDir = fsPath.join(
		// getContentRootDir(options.rootFolder),
		rootFolder,
		relativePath
	);

	const folderContentData = new FolderContent();

	if (!await fileUtils.isFolder(contentDir)) {
		console.warn(
			`Cannot read files in ${relativePath} (mapped to ${contentDir}). In dynamic paths, this is not an error`
		);
		return folderContentData;
	}

	// Get file names under /posts
	const folderContent: Dirent[] = await fs.readdir(contentDir, {
		withFileTypes: true,
	});

	// console.log(`collect - sorted content in "${contentDir}" for locale "${options.locale}"`);

	const targetFileName = mdUtils.getIndexFileName(locale);
	const markdownParser = createMDParser(app);

	for await (const rec of folderContent) {
		const name = rec.name;
		//log.info(`process - content ID "${name}"`);

		let fullPath: string;

		if (loadMode === LoadFolderModes.Folder) {
			if (targetFileName !== name) {
				continue;
			}
			fullPath = fsPath.join(contentDir, name);
		}
		else {
			if (!rec.isDirectory()) {
				continue;
			}

			fullPath = fsPath.join(contentDir, name, targetFileName);
		}

		if (!await fileUtils.isFile(fullPath)) {
			// return error without disclosing OS path
			// console.warn(`error - Path not found: "${fullPath}"`);
			folderContentData.pages.push(
				new ParsedPageData({
					error: `${fullPath.split(/\/|\\/).slice(-3).join('/')} not found`,
				})
			);
			continue;
		}

		folderContentData.ids.push({
			params: { id: name },
			locale: locale,
		});

		if (parseOptions.contentMode === LoadContentModes.None) {
			continue;
		}

		try {
			const fileContents = await fs.readFile(fullPath, 'utf8');
			//log.info(`parse - parsed "${fullPath}"`);

			// Use gray-matter to parse the post metadata section
			const { data: matterData, content } = matter(fileContents);

			const metaData = new PageMetaData(matterData);

			const parsedPageData = new ParsedPageData({
				metaData: metaData.toObject(),
				id: name,
				path: `${relativePath}/${name}`, // don't use path.join, it's os specific
			});

			if (parseOptions.contentMode === LoadContentModes.Full) {
				// parse markdown and process
				const mdParse = mdUtils.createHtmlMDParser(); //mdParser.defaultBlockParse;

				const tree = markdownParser.processParseTree(
					mdParse(mdUtils.stripComments(content)) as ParsedNode[],
					metaData,
					parseOptions
				);

				// Combine the data with the id
				parsedPageData.parsed = tree;
			}

			folderContentData.pages.push(parsedPageData.toObject());
		} catch (e) {
			console.error(`Error processing ${fullPath}`, e);
			folderContentData.pages.push(new ParsedPageData({ error: String(e) }));
		}
	};

	return folderContentData;
};
// filter out empty items - ?
// Sort posts by date - ?

export class FolderContent implements IFolderContent {
	public pages: IParsedPageData[] = [];
	public ids: ILocaleMap[] = [];
	public paths: string[];

	sortOn(field: PageSortField): IParsedPageData[] {
		if (!this.pages) {
			return [];
		}

		const key = String(field);

		return this.pages.slice().sort((a, b) => (a[key] < b[key] ? 1 : -1));
	}
}


class ParsedPageData implements IParsedPageData {
	/* eslint-disable @typescript-eslint/no-explicit-any */
	constructor(data: Partial<IParsedPageData>) {
		Object.keys(this).forEach((key) => {
			if (data[key] !== undefined) {
				this[key] = data[key];
			}
		});
	}

	public toObject(): IParsedPageData {
		return {
			...this,
		};
	}

	public metaData: IPageMetaData = null;
	public id = '';
	public chapterId = '';
	public path = '';
	public parsed: IMLParsedNode[] = [];
	public error?: string = '';
}

class PageMetaData implements IPageMetaData {
	constructor(data: Partial<IParsedPageData> | string) {
		safeMerge(this, data);
		if (this.date && typeof this.date === 'string') {
			this.date = parseDate(this.date);
		}
	}
	public toObject(): IPageMetaData {
		return {
			...this,
		};
	}
	public glossary_key = '';
	public date: Date = null;
	public title = '';
	public abstract = '';
	public moto = '';
	public author = '';
	public credits = '';
	public source_url = '';
	public source_name = '';
	public source_author = '';
	// value must be falsy, so initially it doesn't affect the parse mode computation
	public parse_mode = MLParseModes.AUTO;
	public readonly captions: Partial<Record<MLNODE_TYPES, ICaptionConfiguration>> = {
		[MLNODE_TYPES.FIGURE]: {
			auto: true,
			base: 1,
//			template: `[[FIGURE_ABBR]] %index%`,
			template: `[[${customMarkdownTags.figureAbbr}]] %index%`,
			
		}
	} as const;
}