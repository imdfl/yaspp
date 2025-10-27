import React, { Context, createContext, PropsWithChildren } from 'react';
import { createDynamicContentServer } from '@lib/dynamic-content-utils/dynamicContentServer';
import type { IDynamicContentServer } from '@lib/types';
import type { IPageContext } from 'types/contexts';
import type { IYasppClassTree } from '../types/styles';

import type { INavSection, NavGroups } from 'types/nav';
import { stringUtils } from '../lib/stringUtils';
import { createStyleRegistry, type IStyleRegistry } from '../lib/styleRegistry';
export interface IPageContextOptions {
	readonly dynamicContentServer: IDynamicContentServer,
	readonly documentPath: string,
	readonly nav: string | NavGroups;
	readonly styleClassBindings: string | IYasppClassTree[];
}

export class PageContextClass implements IPageContext {
	private readonly navItems: Map<string, ReadonlyArray<INavSection>>;
	public readonly dynamicContentServer: IDynamicContentServer;
	public readonly documentPath: string;
	private readonly _styleReg: IStyleRegistry;
	constructor(options: IPageContextOptions) {
		this.dynamicContentServer = options.dynamicContentServer;
		this.documentPath = options.documentPath;
		let ni: NavGroups = {};
		this.navItems = new Map();

		const sb = options.styleClassBindings;
		const bindings: IYasppClassTree[] = [];
		if (sb) {
			if (typeof sb === "string") {
				const parseRes = stringUtils.parseJSON<IYasppClassTree[]>(sb);
				if (parseRes.error || !Array.isArray(parseRes.result)) {
					console.error(`Error parsing class bindings ${parseRes.error || "unknown"}`);
				}
				else {
					bindings.push(...parseRes.result);
				}
			}
			else if (Array.isArray(sb)) {
				bindings.push(...sb);
			}
		}
		const reg = this._styleReg = createStyleRegistry();
		bindings.forEach(b => reg.registerBindings(b));

		const nav = options.nav;
		if (nav) {
			if (typeof nav === "string") {
				const parsed = JSON.parse(nav);
				ni = parsed;
			}
			else {
				ni = nav;
			}
		}
		Object.entries(ni).forEach(([groupName, section]) => {
			this.navItems.set(groupName, section)
		});
	}

	public get navigationGroups(): ReadonlyMap<string, ReadonlyArray<INavSection>> {
		return this.navItems;
	}

	public get styleRegistry(): IStyleRegistry {
		return this._styleReg;
	}
}

const ctx = createContext<IPageContext>(new PageContextClass({
	dynamicContentServer: null,
	documentPath: "",
	nav: "",
	styleClassBindings: ""
}));

export const PageContext: Context<IPageContext> = ctx;

export type PageContextProps = PropsWithChildren<Omit<IPageContextOptions, "dynamicContentServer">>;

export const PageProvider = ({ documentPath, nav, children, styleClassBindings }: PageContextProps) => (
	<PageContext.Provider
		value={
			new PageContextClass({
				dynamicContentServer: createDynamicContentServer(),
				documentPath,
				nav,
				styleClassBindings
			})
		}
	>
		{children}
	</PageContext.Provider>
);

export default PageProvider;
