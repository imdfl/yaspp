import { useEffect, useState } from "react";
import { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { PageProvider } from "@contexts/pageContext";
import type { IPageProps } from "@src/types/models";
import { LocaleContextProvider } from "@contexts/localeContext";
import MLThemeContextProvider from "@contexts/MLThemeContext";

import siteFontData from "@src/layout/data/typography/siteFonts.json";

import "normalize.css/normalize.css";
import "../styles/app.scss";
import "../styles/classes/index.scss";
import { fontFaceToDecls } from "../lib/site-fonts";

const fontBasePath = '/assets/fonts';

let _globalStyles: string[] | null = null;

async function loadStyles(styleUrls?: string[]) {
	if (_globalStyles) {
		return _globalStyles;
	}
	if (!styleUrls?.length) {
		return [];
	}
	const styles: string[] = [];

	for await (const url of styleUrls) {
		const cssModule = await import(/* webpackIgnore: true */ url, { with: { type: "css" } });
		const css = (cssModule.default as CSSStyleSheet);
		if (css?.cssRules?.length) {
			const cssText = Array.from(css.cssRules).map(rule => rule.cssText).join('\n');
			styles.push(cssText);
		}
	}
	_globalStyles = styles;
	return _globalStyles;
}


const App = ({ Component, pageProps, router }: AppProps<IPageProps>) => {
	const [pageStyles, setPageStyles] = useState<string[] | null>(null);
	useEffect(() => {
		const allUrls = [];
		allUrls.push(...(pageProps.styleUrls ?? []));
		loadStyles(allUrls)
			.then(styles => setPageStyles(styles))
			.catch(err => {
				console.error(err);
			})

	}, [pageProps])
	if (!pageStyles) {
		return <>Loading...</>
	}
	const fontDecl = fontFaceToDecls(siteFontData, { basePath: fontBasePath });
	const globalStyle = [fontDecl, ...pageStyles].join('\n');

	return (
		<LocaleContextProvider router={router} initialLocale={pageProps.initialLocale}>
			<ThemeProvider
				defaultTheme={pageProps.theme || "light"}
				storageKey="ml-theme"
				attribute="data-ml-theme"
			>
				<MLThemeContextProvider themes={pageProps.themes}>
					<PageProvider
						documentPath={pageProps.documentPath}
						nav={pageProps.nav}
						styleClassBindings={pageProps.styleClassBindings}
					>
						<style jsx global>
							{globalStyle}
						</style>
						<Component {...pageProps} />
					</PageProvider>
				</MLThemeContextProvider>
			</ThemeProvider>
		</LocaleContextProvider>
	);
};

export default App;
