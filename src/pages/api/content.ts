import type { NextApiRequest, NextApiResponse } from 'next';
import { ContentTypes } from 'types/content';
import { mlApiUtils } from '../../lib/apiUtils';
import { LoadContentModes, LoadFolderModes } from 'types/parser/modes';
import { loadContentFolder } from '../../lib/loadFolderContent';
import type {
	IMLApiResponse,
	IMLDynamicContentParams,
	IMLDynamicContentResponse,
} from 'types/api';
import * as fsPath from 'path';
import { promises as fs } from 'fs';
import { createPopoverLinksNodeProcessor } from 'lib/processors/createPopoverLinksNodeProcessor';
import { initYaspp } from '../../lib/yaspp';
import type { IYasppApp } from 'types/app';

const TypeMap: { [key: string]: ContentTypes } = {
	annotation: ContentTypes.Annotation,
	glossary: ContentTypes.Glossary,
};

const noop = function () {
	void 0;
};

const arrayToMap = <T>(
	array: Array<T>,
	field: string
): { [key: string]: T } => {
	const map: { [key: string]: T } = array.reduce((acc, elem) => {
		const value = elem && elem[field];
		if (value !== null && value !== undefined) {
			acc[String(value)] = elem;
		}
		return acc;
	}, {});

	return map;
};

/**
 * returns the first folder in the provided hierarchy (`relativePath`) that contains a folder
 * named `contentPath`. Useful if you have annotations that are common to several subpages
 * @param relativePath
 * @param contentPath
 * @returns
 */
const findFirstFolder = async (
	relativePath: string,
	contentPath: string,
	app: IYasppApp
): Promise<string | null> => {
	if (!relativePath || !contentPath) {
		return null;
	}
	const parts = relativePath.split('/').filter(Boolean); // in case there was a / prefix
	const root = app.contentPath; //getContentRootDir(process.cwd());

	while (parts.length >= 2) {
		// at least docs/xxx, posts/yyy
		const folderPath = [...parts, contentPath].join('/'),
			path = fsPath.join(root, folderPath);
		try {
			const stat = await fs.lstat(path);
			if (stat?.isDirectory()) {
				return folderPath;
			}
		} catch {
			void 0;
		} finally {
			parts.pop();
		}
	}

	return null;
};

const collectFSData = async () => {
	const root = process.cwd(),
		up1 = fsPath.resolve(root, '..'),
		up2 = fsPath.resolve(up1, '..');

	async function collectOne(target: string): Promise<string[]> {
		try {
			const lst = await fs.readdir(target, { withFileTypes: true });
			return lst.map(dirent => {
				const suffix = dirent.isDirectory() ? '/' : dirent.isFile() ? '' : '?';
				return `${dirent.name}${suffix}`;
			});
		} 
		catch (err) {
			return [`error: ${err}`];
		}
	}
	const data = {
		[`cwd (${root}):`]: await collectOne(root),
		[`${up1}:`]: await collectOne(up1),
		[`${up2}:`]: await collectOne(up2)
	}
	return data;
}
	/**
	 *
	 * @param _req
	 * @param res
	 * @returns
	 */
	export default async function handler(
		_req: NextApiRequest,
		res: NextApiResponse
	) {
		const params = _req.query as unknown as IMLDynamicContentParams;
		try {
			const response = await loadContent(params || {});
			res.status(response.error ? 500 : 200).json(response);
		} catch (e) {
			res.status(500).json({ error: String(e) });
		}
	}

	async function loadContent(
		params: Partial<IMLDynamicContentParams>
	): Promise<IMLApiResponse<IMLDynamicContentResponse>> {
		const contentType = TypeMap[params.type];
		if (!params?.locale || !contentType) {
			return {
				data: null,
				error: `Bad content params, locale ${params?.locale} type ${params.type} 
(expected one of ${Object.keys(TypeMap).toString()})`,
			};
		}
		const clientPath = params.document || '';
		const cacheKey = `dc-${contentType}-${clientPath}${clientPath && '-'}${params.locale
			}`;
		try {
			// const contentPath = fsPath.resolve(process.cwd(), 'public');
			// console.log(`using content path ${contentPath}`);

			const payload = await mlApiUtils.getFromCache(cacheKey);

			if (payload) {
				return JSON.parse(payload);
			}

			const app = await initYaspp();
			if (!app.isValid) {
				const data = await collectFSData();
				throw new Error(`Failed to initialize yaspp: ${app.error}\n${JSON.stringify(data, null, '\t')}`);
			}
			const docPath =
				clientPath && contentType === ContentTypes.Annotation ?
					await findFirstFolder(clientPath, contentType, app)
					: contentType;

			if (!docPath) {
				throw new Error(`No ${contentType} for ${clientPath}, or globally`);
			}
			const docData = await loadContentFolder({
				app,
				relativePath: docPath,
				locale: params.locale,
				loadMode: LoadFolderModes.Children,
				mode: {
					contentMode: LoadContentModes.Full,
					nodeProcessors: [createPopoverLinksNodeProcessor()],
				},
			});

			const data = {
				locale: params.locale,
				// turn array into map
				items: arrayToMap(docData.pages, 'id'),
			};

			// don't want to await before returning, so
			mlApiUtils
				.saveToCache(cacheKey, JSON.stringify({ data }))
				.then(noop)
				.catch(noop);
			return Object.assign({ data }, { cache: false });
		}
		catch (error) {
			return { data: null, error: String(error) };
		}
	}
