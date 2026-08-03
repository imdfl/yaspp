
interface IFontFaceFamily {
	readonly weight: number;
	readonly href: string;
	readonly format: string;
}

interface IBaseFontFace {
	readonly id: string;
	readonly name: string;
}
export interface IFontFaceRecord extends IBaseFontFace{
	readonly family: readonly IFontFaceFamily[];
}

export interface IFontFaceOptions {
	readonly basePath: string;
}

interface IFontFaceDecl extends IBaseFontFace {
	weight: number;
	href: string;
	format: string;
}

const FontFaceDecl = ({ name, id, href, weight, format }: IFontFaceDecl, options: Partial<IFontFaceOptions>) => {
	const src = options?.basePath ? `url("${options.basePath}/${id}/${href}") format("${format}")`
		: `url(${href})`;
	const fontFaceProps = [
		['font-family', `"${name}"`],
		['src', src],
		['font-weight', weight],
		['font-display', 'swap'],
	]
		.map((keyVal) => `${keyVal[0]}: ${keyVal[1]};`)
		.join('');
	return `@font-face{${fontFaceProps}}`;
};

export const fontFaceToDecls = (fontData: IFontFaceRecord[], options: Partial<IFontFaceOptions>) =>
	fontData.map(({ id, name, family }) => {
		return family
			.map(({ weight, format, href }) =>
				FontFaceDecl({ name, id, href, weight, format }, options ?? {})
			)
			.join('\n');
	})
	.join('\n');

