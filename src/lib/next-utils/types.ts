import { ParsedUrlQuery } from "querystring";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import type { IContentParseOptions } from "@src/types/parser/parser";
import type { LoadFolderModes } from "@src/types/parser/modes";
import type { IFolderStaticProps } from "@src/types/folder";

/**************************************************
 * Extended Next.js types
 **************************************************/

/**
 * Same as Next's GetStaticProps, parameterized by a content folder relative path
 * Will load either the index in the folder, or all the indices in the child folders,
 * depending on the type parameter
 * @param type `"folder"`: scan the index in the folder, `"children"`: scan indices in child folders
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type MLGetStaticProps<PropsType = IFolderStaticProps> = (
	folderRelativePath: string | null,
	locale: string, //GetStaticPropsContext<ParsedUrlQuery, PreviewData>,
	loadMode: LoadFolderModes,
	mode?: Partial<IContentParseOptions>
) => Promise<GetStaticPropsResult<PropsType>>;

/**
 * Same as Next's GetStaticProps, parameterized by a content folder relative path
 */
type MLGetStaticPaths = (
	folderRelativePath: string,
	locales: string[]
) => Promise<GetStaticPathsResult<ParsedUrlQuery>>;

export interface IStaticPathsParameters {
	readonly contentFolder?: string;
	readonly locales: string[];
}

/**
 * SERVER SIDE Streamlined generation of content, suitable as props for ML component props
 */
export interface IMLNextUtils {
	/**
	 * Same as Next's GetStaticProps, parameterized by a content folder relative path
	 * Will load either the index in the folder, or all the indices in the child folders,
	 * depending on the type parameter
	 * @param folderRelativePath The folder path relative to the content folder
	 * @param ctx The original context passed to the static getStaticProps function
	 * @param loadMode `"folder"`: scan the index in the folder, `"children"`: scan indices in child folders
	 * @param contentMode none, metadata or full (default)
	 * @param parseMode verse or normal (default)
	 */
	getFolderStaticProps: MLGetStaticProps;

	getValidFolderStaticProps: MLGetStaticProps<IFolderStaticProps | null>;

	/**
	 * Same as Next's GetStaticPaths, parameterized by a content folder relative path
	 */
	getFolderStaticPaths: MLGetStaticPaths;

	getNestedStaticPaths(
		params: IStaticPathsParameters
	): Promise<GetStaticPathsResult<ParsedUrlQuery>>;

	populateDynamicPath(
		path: string,
		dict: Record<string, string>
	): Promise<string>;
}

export interface ICollectedPath {
	readonly path: string;
	readonly idMap: { [key: string]: string };
}
