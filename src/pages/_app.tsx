import { useEffect, useState } from "react";
import { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { PageProvider } from "@contexts/pageContext";
import type { IPageProps } from "@src/types/models";
import { LocaleContextProvider } from "@contexts/localeContext";
import MLThemeContextProvider from "@contexts/MLThemeContext";

import { fontFaceDecls } from "../siteFonts";
import "normalize.css/normalize.css";
import "../styles/app.scss";
import "../styles/classes/index.scss";

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
		// if (!pageProps.themes?.length) {
		// 	return;
		// }
		const allUrls = []; //(themes?.map(r => r.path)) ?? [];
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
	const globalStyle = [fontFaceDecls, ...pageStyles].join('\n');

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
						{
							// pageStyles.map((cssText, ind) => (
							// 	<style jsx global key={ind}>
							// 		{cssText}
							// 	</style>
							// ))
						}
						<Component {...pageProps} />
					</PageProvider>
				</MLThemeContextProvider>
			</ThemeProvider>
		</LocaleContextProvider>
	);
};

export default App;
