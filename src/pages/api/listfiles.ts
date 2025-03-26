import type { NextApiRequest, NextApiResponse } from 'next';
import type {
	IMLApiResponse,
} from 'types/api';
import * as fsPath from 'path';
import { promises as fs } from 'fs';


interface IDirRecord {
	readonly files: string[];
	readonly folders: {
		[name: string]: IDirRecord;
	};
	readonly error?: string;
}

interface IListFilesRequest {
	readonly path: string;
	readonly depth: number;
}

interface IListFilesResponse {
	readonly root: string;
	readonly content: IDirRecord;
}

async function collectFSData(root: string, depth: number): Promise<IDirRecord> {
	const ret: IDirRecord = {
		files: [],
		folders: {}
	};
	try {
		const lst = await fs.readdir(root, { withFileTypes: true });
		for await (const dirent of lst) {
			const name = dirent.name;
			if (dirent.isDirectory()) {
				if (name !== '.' && name !== '..') {
					if (depth > 0) {
						ret.folders[dirent.name] = await collectFSData(fsPath.resolve(root, name), depth - 1);
					}
					else {
						ret.files.push(name + '/');
					}
				}
			}
			else {
				ret.files.push(name + (dirent.isFile() ? '' : '?'));
			}
		}
	}
	catch (err) {
		return {
			...ret,
			error: String(err)
		};
	}
	return ret;
}

async function loadContent({ path, depth }: IListFilesRequest): Promise<IMLApiResponse<IListFilesResponse>> {
	try {
		const root = fsPath.resolve(process.cwd(), path);
		const data = await collectFSData(root, depth);
		return data.error ? { data: null, error: data.error } : {
			data: {
				root,
				content: data
			}
		}
	}
	catch (error) {
		return { data: null, error: String(error) };
	}
}

function formatDirData(data: IListFilesResponse): string {
	const strData = JSON.stringify(data, null, 2)
		.replace(/"([^"]+)":/g, "$1:");
	return `<html><head>Yaspp File Listing</head><body><pre>${strData}</pre></body></html>`;
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
	const rawParams = _req.query as unknown as IListFilesRequest,
		params: IListFilesRequest = {
			path: rawParams?.path || ".",
			depth: Number(rawParams?.depth) >= 0 ? Math.round(Number(rawParams.depth)) : 999
		};
	try {
		const response = await loadContent(params);
		if (response.error) {
			res.status(500).json(response);
		}
		else {
			res.setHeader('Content-Type', 'text/html');
			const html = formatDirData(response.data);
			res.status(200).send(html);
		}
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
}

