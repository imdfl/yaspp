import css from 'styled-jsx/css';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { PageProvider } from '../contexts/pageContext';
import { fontFaceDecls } from '../siteFonts';
import 'normalize.css/normalize.css';
import '../styles/app.scss';
import type { IPageProps } from 'types/models';
import { LocaleContextProvider } from '../contexts/localeContext';
import MLThemeContextProvider from '../contexts/MLThemeContext';
// import { usePageData } from '../hooks';

const App = ({ Component, pageProps, router }: AppProps<IPageProps>) => {
	const fontStyles = css`
		${fontFaceDecls}
	`;
	// const { pageData } = usePageData({ content: pageProps.content })

	// const ref = useRef<HTMLStyleElement>(null);

	return (
		<LocaleContextProvider router={router}>
			<ThemeProvider
				defaultTheme={pageProps.theme}
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
							{fontStyles}
						</style>
						<Component {...pageProps} />
					</PageProvider>
				</MLThemeContextProvider>
			</ThemeProvider>
		</LocaleContextProvider>
	);
};

export default App;
