import { Context, createContext, PropsWithChildren } from "react";
import { IThemeUrl } from "@src/types/app";
import { useTheme } from "next-themes";

export type SetThemeFunc = (theme: string) => unknown;

export interface IMLThemeProvider {
	readonly theme: string;
	readonly setTheme: SetThemeFunc;
	readonly themes: ReadonlyArray<IThemeUrl>;
	readonly oppositeTheme: string;
}

const STOAGE_KEY = "ml:theme";

interface IMLThemeOptions {
	readonly themes: ReadonlyArray<IThemeUrl>;
}

interface IMLThemeContextOptions extends IMLThemeOptions {
	readonly theme: string;
	readonly setNextTheme?: SetThemeFunc;
}
class MLThemeContextImpl implements IMLThemeProvider {
	private _theme: string;
	private readonly _themes: ReadonlyArray<IThemeUrl>;
	private readonly _setNextTheme: SetThemeFunc;
	private readonly _setTheme: SetThemeFunc;
	private _oppositeTheme = "";
	constructor({ themes, theme, setNextTheme }: IMLThemeContextOptions) {
		this._themes = Array.isArray(themes) ? themes.slice() : [];
		this._theme = this._isValidTheme(theme) ? theme : (this._themes[0]?.name ?? "");

		this._setNextTheme = setNextTheme ?? (() => void 0);
		this._setTheme = (theme: string) => {
			if (this._isValidTheme(theme)) {
				this._theme = theme;
				window?.localStorage?.setItem(STOAGE_KEY, this._theme);
				if (this._themes.length > 1) {
					const ind = this._themes.findIndex(t => t.name === theme);
					this._oppositeTheme = this._themes[ind === 0 ? 1 : 0].name;
				}
				this._setNextTheme(theme);
			}
			else {
				console.warn(`setTheme: unknown theme ${theme}`);
			}
		};
		if (this._theme && this._theme !== theme) {
			setTimeout(() => this._setNextTheme(this._theme), 10);
		}

	}

	public get oppositeTheme() {
		return this._oppositeTheme;
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

	private _findThemeIndex(theme: string): number {
		return theme ? this._themes.findIndex(u => u.name === theme) : -1;
	}

	private _isValidTheme(theme: string): boolean {
		return this._findThemeIndex(theme) >= 0;
	}
}

const ctx = createContext<IMLThemeProvider>(new MLThemeContextImpl({
	theme: "",
	themes: [],
}));

export const MLThemeContext: Context<IMLThemeProvider> = ctx;


type MLThemeProps = PropsWithChildren<IMLThemeOptions>;

export const MLThemeContextProvider = ({ children, themes }: MLThemeProps) => {
	const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
	const theme = nextTheme || themes[0].name;
	return (
        <MLThemeContext
            value={
                new MLThemeContextImpl({ theme, themes, setNextTheme })
            }
        >
            {children}
        </MLThemeContext>
    );
}

export default MLThemeContextProvider;
