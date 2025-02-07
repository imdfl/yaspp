import { clonePlainObject } from 'utils/clonePlainObject';
import { VALID_PARSE_MODES } from './parseModes';
import { MLParseModes } from 'types/parser/modes';
import type { IContentParseOptions } from 'types/parser/parser';
import type { IMLParsedNode, IPageMetaData } from 'types/models';
import type { IYasppApp } from 'types/app';
import { wrapTranslate } from './locale/translate';

export class MLParseContext {
	private _linkDefs: Record<string, IMLParsedNode> = {};
	private _indexer: NodeIndexer = new NodeIndexer();
	private readonly _metaData: IPageMetaData;
	private readonly _mode: IContentParseOptions;
	private readonly _translate: (key: string) => string;

	constructor(private readonly app: IYasppApp, mode: IContentParseOptions, metaData: IPageMetaData) {
		const parseMode = mode.parseMode || metaData.parse_mode;

		this._mode = {
			...mode,
			parseMode: VALID_PARSE_MODES.has(parseMode)
				? parseMode
				: MLParseModes.NORMAL,
		};

		this._metaData = clonePlainObject(metaData);
		this._translate = wrapTranslate({
			dictionary: app.dictionary,
			locale: mode.locale,
			defaultLocale: app.defaultLocale
		})
	}

	public translate(text: string): string {
		return this._translate(text);
	}

	public get mode(): IContentParseOptions {
		return this._mode;
	}

	public clone(mode: Partial<IContentParseOptions>): MLParseContext {
		const newMode: IContentParseOptions = Object.assign(
			Object.assign({}, this.mode),
			mode
		);

		const ret = new MLParseContext(this.app, newMode, this._metaData);

		ret._indexer = this.indexer;
		ret._linkDefs = this._linkDefs;

		return ret;
	}

	public get metaData(): IPageMetaData {
		return this._metaData;
	}

	public get linkDefs(): Record<string, IMLParsedNode> {
		return this._linkDefs;
	}

	public get indexer(): NodeIndexer {
		return this._indexer;
	}
}

class NodeIndexer {
	// static - insure multiple pages get different keys
	private static keyIndex = 0;
	private readonly indices: Map<string, number> = new Map<string, number>();

	public nextKey(): string {
		return `ast-${NodeIndexer.keyIndex++}`;
	}

	public nextLine(): number {
		return this.nextIndex('line');
	}

	public nextIndex(key: string): number {
		if (!this.indices.has(key)) {
			this.indices.set(key, -1);
		}

		const ind = this.indices.get(key) + 1;
		this.indices.set(key, ind);

		return ind;
	}

	public currentIndex(key: string): number {
		return this.indices.has(key) ? this.indices.get(key) : 0;
	}

	public currentLine(): number {
		return this.currentIndex('line');
	}
}

