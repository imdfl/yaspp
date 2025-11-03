import React, { Context, createContext, PropsWithChildren } from "react";
import { IThemeUrl } from "../types/app";
import { stringUtils } from "../lib/stringUtils";
import { useTheme } from "next-themes";

export type SetThemeFunc = (theme: string) => unknown;

export interface IMLThemeProvider {
	readonly theme: string;
	readonly setTheme: SetThemeFunc;
	readonly themes: ReadonlyArray<IThemeUrl>;
}

const STOAGE_KEY = "ml:theme";

interface IMLThemeOptions {
	readonly themes: string | ReadonlyArray<IThemeUrl>;
}

interface IMLThemeContextOptions extends IMLThemeOptions {
	readonly theme: string;
	readonly setNextTheme?: SetThemeFunc;
}
class MLThemeContextImpl implements IMLThemeProvider {
	private _theme: string;
	private readonly _themes: IThemeUrl[];
	private readonly _setNextTheme: SetThemeFunc;
	constructor({ themes, theme, setNextTheme }: IMLThemeContextOptions) {
		this._theme = theme;
		this._setNextTheme = setNextTheme;
		this._themes = [];
		if (typeof themes === "string") {
			const { error, result: ts} = stringUtils.parseJSON<IThemeUrl[]>(themes);
			if (error) {
				console.error(`Error parsing themes data: ${error}`);
			}
			else {
				this._themes.push(...ts);
			}
		}
		else if (Array.isArray(themes)) {
			this._themes.push(...(themes as IThemeUrl[]));
		}
		else {
			console.error(`MLThemeProvider: Missing or invalid themes in input`);
		}
	}
	public get theme(): string {
		return this._theme;
	}

	public get themes(): IThemeUrl[] {
		return this._themes.slice();
	}

	public get setTheme(): SetThemeFunc {
		return (theme: string) => {
			this._theme = theme ?? "";
			if (window?.localStorage) {
				window.localStorage.setItem(STOAGE_KEY, this._theme);
			}
			this._setNextTheme(theme);
		}
	}

}

const ctx = createContext<IMLThemeProvider>(new MLThemeContextImpl({
	theme: "",
	themes: [],
}));

export const MLThemeContext: Context<IMLThemeProvider> = ctx;


type MLThemeProps = PropsWithChildren<IMLThemeOptions>;

export const MLThemeContextProvider = ({ children, themes }: MLThemeProps) => {
	const { theme, setTheme: setNextTheme} = useTheme();
	return <MLThemeContext.Provider
		value={
			new MLThemeContextImpl({ theme, themes, setNextTheme })
		}
	>
		{children}
	</MLThemeContext.Provider>
}

export default MLThemeContextProvider;
