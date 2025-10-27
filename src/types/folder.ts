export interface IFolderStaticProps {
	/** Typically the stringified ParsedPageData */
	readonly content: string | object;

	readonly nav: string | object;

	/** The path of the first page in the document data */
	readonly documentPath: string;

	readonly styleClassBindings: string | object;
}
