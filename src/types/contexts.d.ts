import type { IDynamicContentServer } from "@lib/types";
import type { INavSection } from "./nav";

/** Describes a content-related context, available to all rendered components under a ML page */
export interface IPageContext {
	readonly dynamicContentServer: IDynamicContentServer;

	/** The path of the document displayed in the current component */
	readonly documentPath: string;

	readonly navigationGroups: ReadonlyMap<string, ReadonlyArray<INavSection>>;
}
