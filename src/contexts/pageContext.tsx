import React, { Context, createContext } from 'react';
import { DynamicContentServer } from 'lib/dynamic-content-utils/dynamicContentServer';
import type { IDynamicContentServer } from 'lib/types';
import type { IPageContext } from '../types/contexts';
import { INavSection } from '../types/nav';

export class PageContextClass implements IPageContext {
	public readonly navItems: ReadonlyArray<INavSection>;
	constructor(
		public readonly dynamicContentServer: IDynamicContentServer,
		public documentPath: string,
		nav: string | object
	) {
		let ni: INavSection[];
		if (nav) {
			if (typeof nav === "string") {
				const parsed = JSON.parse(nav);
				ni = parsed;
			}
			else {
				ni = nav as INavSection[];
			}
		}
		this.navItems = Array.isArray(ni) ? ni : [];
	}
}

const ctx = createContext<IPageContext>(new PageContextClass(null, '', ''));

export const PageContext: Context<IPageContext> = ctx;

export const PageProvider = ({ documentPath, nav, children }) => (
	<PageContext.Provider
		value={
			new PageContextClass(new DynamicContentServer(), documentPath as string, nav as string)
		}
	>
		{children}
	</PageContext.Provider>
);

export default PageProvider;
