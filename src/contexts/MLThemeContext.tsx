import React, { Context, createContext, PropsWithChildren } from "react";
import { IThemeUrl } from "types/app";
import { stringUtils } from "@lib/stringUtils";
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
	private readonly _themes: IThemeUrl[] = [];
	private readonly _setNextTheme: SetThemeFunc;
	private readonly _setTheme: SetThemeFunc;
	constructor({ themes, theme, setNextTheme }: IMLThemeContextOptions) {
		this._theme = theme ?? "";
		this._setNextTheme = setNextTheme ?? (() => void 0);
		this._setTheme = (theme: string) => {
			if (this._isValidTheme(theme)) {
				this._theme = theme ?? "";
				if (window?.localStorage) {
					window.localStorage.setItem(STOAGE_KEY, this._theme);
				}
				this._setNextTheme(theme);
			}
			else {
				console.warn(`setTheme: unknown theme ${theme}`);
			}
		};
		if (!themes?.length) {
			return;
		}
		let themeUrls: IThemeUrl[];
		if (typeof themes === "string") {
			const { error, result } = stringUtils.parseJSON<IThemeUrl[]>(themes);
			if (error) {
				console.error(`Error parsing themes data: ${error}`);
			}
			else {
				themeUrls = result!;
			}
		}
		else {
			themeUrls = themes as IThemeUrl[];
		}
		if (Array.isArray(themeUrls)) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			this._themes.push(...themeUrls);
		}
	}

	public get theme(): string {
		return this._theme;
	}

	public get themes(): ReadonlyArray<IThemeUrl> {
		return this._themes;
	}

	public get setTheme(): SetThemeFunc {
		return this._setTheme;
	}

	private _isValidTheme(theme: string): boolean {
		return Boolean(theme && this._themes.find(u => u.name === theme));
	}
}

const ctx = createContext<IMLThemeProvider>(new MLThemeContextImpl({
	theme: "",
	themes: [],
}));

export const MLThemeContext: Context<IMLThemeProvider> = ctx;


type MLThemeProps = PropsWithChildren<IMLThemeOptions>;

export const MLThemeContextProvider = ({ children, themes }: MLThemeProps) => {
	const { theme, setTheme: setNextTheme } = useTheme();
	return <MLThemeContext.Provider
		value={
			new MLThemeContextImpl({ theme, themes, setNextTheme })
		}
	>
		{children}
	</MLThemeContext.Provider>
}

export default MLThemeContextProvider;
