import type { NextApiRequest, NextApiResponse } from 'next';
import type {
	IMLApiResponse,
} from 'types/api';
import * as fsPath from 'path';
import { promises as fs } from 'fs';

const INTERACTIVE_TEMPLATE = `<!DOCTYPE html><html>
<html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 5px;
                background-color: #FFF;
                color: #000;
            }
            [data-yaspp-dir] {
                font-weight: 900;
            }
            [data-yaspp-file], [data-yaspp-dir] {
                cursor: pointer;
            }

        </style>
        <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
        <script type="text/javascript">

            function load() {
                $(document.body).on("click", "[data-yaspp-dir]", function(evt) {
                    if (!evt.ctrlKey) {
                        return;
                    }
                    const linkStr = decodeURIComponent($(this).attr("data-yaspp-dir")),
                        linkData = JSON.parse(linkStr);
                    const url = new URL("/api/listfiles", window.location.href);
                    url.searchParams.set("path", linkData.path);
                    if (linkData.interactive) {
                        url.searchParams.set("interactive", "");
                    }
                    url.searchParams.set("depth", linkData.depth);
                    window.location.href = url.toString();
                });
                $(document.body).on("click", "[data-yaspp-file]", function(evt) {
                    if (!evt.ctrlKey) {
                        return;
                    }
                    const linkStr = decodeURIComponent($(this).attr("data-yaspp-file"));
                    if (!linkStr) {
						console.warn("Missing data-yaspp-file attribute on element", this);
                        return;
                    }
                    const url = new URL("/api/showfile", window.location.href);
                    url.searchParams.set("path", linkStr);
                    window.location.href = url.toString();
                });
            }
            $(load);
        </script>
    </head>
    <body>
        <h2>Folder listing for %PATH</h2>
        <h3>(%ROOT)</h3>
        <pre>
            %CONTENT
        </pre>
    </body>
</html>`;

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
	readonly interactive: boolean;
}

interface IListFilesResponse {
	readonly root: string;
	readonly content: IDirRecord;
}

function toDirLink(path: string, params: IListFilesRequest): string{
	const linkData = JSON.stringify({
		...params,
		path: `${params.path}/${path}`
	});
	return `<span data-yaspp-dir="${encodeURIComponent(linkData)}">${path}</span>`;
	// return `<a href="/api/listfiles?path=${params.path}/${path}&depth=${params.depth}${intr}">${path}</a>`;
}

function toFileLink(fileName: string, root: string): string{
	return `<span data-yaspp-file="${root}/${fileName}">${fileName}</span>`;
}

function toLink(path: string, params: IListFilesRequest): string {
	if (path.endsWith('/')) {
		return toDirLink(path, params);
	}
	if (path.endsWith('?')) {
		return `<span>${path}</span>`;
	}
	return toFileLink(path, params.path);
}

function spacer(depth: number): string {
	return " ".repeat(depth * 2);
}
function formatDirData(data: IDirRecord, params: IListFilesRequest, depth: number): string {
	const space = spacer(depth);
	const space1 = spacer(depth + 1);
	const space2 = spacer(depth + 2);
	const space1n = `\n${space1}`
	const space2n = `\n${space2}`
	const root = params.path;
	const files = data.files.map(f => toLink(f, params));
	const folders = Object.entries(data.folders).map(([name, rec]) => {
		return `${toDirLink(name, params)}: ${formatDirData(rec, {
			...params,
			path: `${root}/${name}`
		}, depth + 2)}`;
	});
	return `{
${space1}files: [${files.length ? space2n : ""}${ files.join(',' + space2n)}${files.length ? space1n : ""}],
${space1}Folders: {
${space2}${folders.join(','+ space2n)}
${space1}}
${space}}`;
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

async function loadContent(path: string, depth: number): Promise<IMLApiResponse<IListFilesResponse>> {
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

function formatSimpleDirData(data: IListFilesResponse): string {
	const strData = JSON.stringify(data, null, 2)
		.replace(/"([^"]+)":/g, "$1:");
	return `<html><head><title>Yaspp File Listing</title></head><body><pre>${strData}</pre></body></html>`;
}

function formatInteractiveDirData(data: IListFilesResponse, params: IListFilesRequest): string {
	const content = formatDirData(data.content, params, 0);
	const html = INTERACTIVE_TEMPLATE
		.replace(/%ROOT/g, data.root)
		.replace(/%PATH/g, params.path)
		.replace(/%CONTENT/g, content);

	return html;
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
			depth: Number(rawParams?.depth) >= 0 ? Math.round(Number(rawParams.depth)) : 999,
			interactive: rawParams?.interactive !== undefined
		};
	try {
		const response = await loadContent(params.path, params.depth);
		if (response.error) {
			res.status(500).json(response);
		}
		else {
			res.setHeader('Content-Type', 'text/html');
			const html = params.interactive ? 
				formatInteractiveDirData(response.data, params)
				: formatSimpleDirData(response.data);
			res.status(200).send(html);
		}
	} catch (e) {
		res.status(500).json({ error: String(e) });
	}
}

