import { flattenArray } from "@utils/index";
import { fontFaceToDecls, IFontFaceRecord } from "@lib/site-fonts";
import siteFontData from "./layout/data/typography/siteFonts.json";

const fontBasePath = '/assets/fonts';


interface IFontFaceLink {
	id: string;
	href: string;
	format: string;
}


const FontFaceLink = ({ id, href, format }: IFontFaceLink) => (
	<link
		key={`fontfacelink_${format}_${id}`}
		rel="preload"
		href={`${fontBasePath}/${id}/${href}`}
		as="font"
		type={`font/${format}`}
		crossOrigin="anonymous"
	/>
);
// TODO support font face options
export const fontFaceLinks = (siteFontData: IFontFaceRecord[]) => flattenArray(
	siteFontData.map(({ id, family }) =>
		family.map(({ href, format }) => FontFaceLink({ id, href, format }))
	)
);
