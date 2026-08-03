import { IThemeUrl } from "./app";
import { IYasppClassTree } from "./styles";

export interface IFolderStaticProps {
	/** Typically the stringified ParsedPageData */
	readonly content: string | object;

	readonly nav: string | object;

	/** The path of the first page in the document data */
	readonly documentPath: string;

	readonly styleClassBindings: ReadonlyArray<IYasppClassTree>;

	readonly theme: string;

	readonly themes: IThemeUrl[];

	readonly styleUrls: ReadonlyArray<string>;

	/** Locale to use when none is specified in the URL */
	readonly initialLocale: string;

	/**
	 * If not empty, this page is rendered only in the provided locales
	 */
	readonly allowedLocales?: readonly string[];
}
