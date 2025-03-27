import type { NextApiRequest, NextApiResponse } from 'next';
import type {
	IMLApiResponse,
} from 'types/api';
import * as fsPath from 'path';
import { promises as fs } from 'fs';
import { fileUtils } from '../../lib/fileUtils';

const MIME_TYPES: { [key: string]: string } = {
	"html": "text/html",
	"htm": "text/html",
	"sh": "text/x-shellscript",
	"log": "text/plain",
	"css": "text/css",
	"js": "text/javascript",
	"json": "application/json",
	"txt": "text/plain",
	"md": "text/markdown",
	"xml": "text/xml",
	"svg": "image/svg+xml",
	"png": "image/png",
	"jpg": "image/jpeg",
	"jpeg": "image/jpeg",
	"gif": "image/gif",
	"webp": "image/webp",
	"ico": "image/x-icon",
	"pdf": "application/pdf",
	"zip": "application/zip",
	"tar": "application/x-tar",
	"gz": "application/gzip",
	"tgz": "application/gzip",
	"mp3": "audio/mpeg",
	"wav": "audio/wav",
	"ogg": "audio/ogg",
	"mp4": "video/mp4",
	"webm": "video/webm",
	"ogv": "video/ogg",
	"ts": "text/typescript",
	"tsx": "text/tsx",
	"jsx": "text/jsx",
	"csv": "text/csv",
	"xls": "application/vnd.ms-excel",
	"xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"doc": "application/msword",
	"docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"ppt": "application/vnd.ms-powerpoint",
	"pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"mpg": "video/mpeg",
	"mpeg": "video/mpeg",
};

const FORBIDDEN_PATHS = [
	/^\/etc/,
	/^\/proc/,
	/^\/sys/,
	/^\/dev/,
	/^\/run/,
	/\.bin$/
];

const FORBIDDEN_NAMES = [
	/^\.env/,
	/\.exe$/
];

const ALLOWED_NAMES = [
	/\.log$/
];

interface IShowFileRequest {
	readonly path: string;
}

interface IShowFileResponse {
	readonly path: string;
	readonly type: string;
	readonly content: string | Buffer
}

function getMimeType(path: string): string {
	const ext = fsPath.extname(path).toLowerCase().replace(/^\./, "");
	return MIME_TYPES[ext] || "text/plain";
}

/**
 * path is known to point to a file
 * @param path 
 * @returns 
 */
function getPathError(path: string): string {
	const dir = fsPath.dirname(path);
	const name = fsPath.basename(path);
	if (ALLOWED_NAMES.findIndex(p => p.test(name)) >= 0) {
		return "";
	}
	if (FORBIDDEN_PATHS.findIndex(p => p.test(dir)) >= 0) {
		return `Forbidden path ${path}`;
	}
	const top = fsPath.resolve(process.cwd(), "..");
	if (!path.startsWith(top)) {
		return `Path ${path} not under ${top}`;
	}
	if (FORBIDDEN_NAMES.findIndex(p => p.test(name)) >= 0) {
		return `Forbidden name ${name}`;
	}
	return "";

}

async function loadContent(path: string): Promise<IMLApiResponse<IShowFileResponse>> {
	try {
		const root = fsPath.resolve(process.cwd(), path);
		if (!await fileUtils.isFile(root)) {
			return { data: null, error: `File ${path} (${root}) not found` };
		}
		const err = getPathError(root);
		if (err) {
			return { data: null, error: err };
		}
		const data = await fs.readFile(root);
		return {
			data: {
				content: data,
				type: getMimeType(root),
				path: root
			}
		}
	}
	catch (error) {
		return { data: null, error: String(error) };
	}
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
	const { path } = (_req.query ?? {}) as unknown as IShowFileRequest
	if (!path || typeof path !== 'string') {
		return res.status(400).json({ error: "Missing path parameter" });
	}
	try {
		const response = await loadContent(path);
		if (response.error) {
			res.status(500).json(response);
		}
		else {
			const fileData = response.data;
			res.setHeader('Content-Type', fileData.type);
			res.status(200).send(fileData.content);
		}
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
}

