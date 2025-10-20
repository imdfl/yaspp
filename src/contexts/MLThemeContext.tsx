import React, { Context, createContext, PropsWithChildren } from 'react';

export interface IMLThemeProvider {
	readonly theme: string;
	setTheme: (theme: string) => unknown;
}

const STOAGE_KEY = "ml:theme";
class MLThemeContextImpl implements IMLThemeProvider {
	private _theme: string;
	constructor(theme: string) {
		this._theme = theme;
	}
	public get theme(): string {
		return this._theme;
	}

	public get setTheme(): (theme: string) => void {
		return (theme: string) => {
			this._theme = theme ?? "";
			if (window?.localStorage) {
				window.localStorage.setItem(STOAGE_KEY, this._theme);
			}
		}
	}

}

const ctx = createContext<IMLThemeProvider>(new MLThemeContextImpl("light"));

export const MLThemeContext: Context<IMLThemeProvider> = ctx;

interface IMLThemeOptions {
	readonly theme?: string;
}

type MLThemeProps = PropsWithChildren<IMLThemeOptions>;

export const MLThemeContextProvider = ({ theme, children }: MLThemeProps) => {
	if (!theme) {
		if (window?.localStorage) {
			theme = window.localStorage.getItem(STOAGE_KEY) || "";
		}
		else {
			theme = "";
		}
	}
	return <MLThemeContext.Provider
		value={
			new MLThemeContextImpl(theme)
		}
	>
		{children}
	</MLThemeContext.Provider>
}

export default MLThemeContextProvider;
