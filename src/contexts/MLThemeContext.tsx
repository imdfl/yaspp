import React, { Context, createContext } from 'react';

export interface IMLThemeProvider {
	readonly theme: string;
	setTheme: (theme: string) => unknown;
}

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
			this._theme = theme;
		}
	}

}

const ctx = createContext<IMLThemeProvider>(new MLThemeContextImpl("light"));

export const MLThemeContext: Context<IMLThemeProvider> = ctx;

export const MLThemeContextProvider = ({ theme, children }) => (
	<MLThemeContext.Provider
		value={
			new MLThemeContextImpl(theme as string)
		}
	>
		{children}
	</MLThemeContext.Provider>
);

export default MLThemeContextProvider;
