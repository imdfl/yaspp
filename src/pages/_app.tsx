import React from 'react';
import css from 'styled-jsx/css';
import { AppProps } from 'next/app';
import { ThemeProvider } from 'next-themes';
import { PageProvider } from '../contexts/pageContext';
import { fontFaceDecls } from '../siteFonts';
import 'normalize.css/normalize.css';
import '../styles/app.scss';
import type { IPageProps } from 'types/models';
import { LocaleContextProvider } from '../contexts/localeContext';

const App = ({ Component, pageProps, router }: AppProps<IPageProps>) => {
	// const [appData, setAppData] = useState<object | null>(null);
	// const [error, setError] = useState<string>("");
	
	// useEffect(() => {
	// 	import("../../yaspp.json").then(obj => {
	// 		if (obj) {
	// 			console.log("loaded app");
	// 			setAppData(obj.default);
	// 		}
	// 		else {
	// 			setError(`Failed to load Yaspp`);
	// 		}
	// 	})
	// 	.catch(err => {
	// 		setError(String(err));
	// 	})
	// }, [])
	const fontStyles = css`
		${fontFaceDecls}
	`;


	// if (error) {
	// 	return <h2>{error}</h2>
	// }
	// if (!appData) {
	// 	return <div>Loading...</div>
	// }
	return (
		<LocaleContextProvider router={router}>
			<ThemeProvider
				defaultTheme="light"
				storageKey="ml-theme"
				attribute="data-ml-theme"
			>
				<PageProvider documentPath={pageProps.documentPath}>
					<style jsx global>
						{fontStyles}
					</style>
					<Component {...pageProps} />
				</PageProvider>
			</ThemeProvider>
		</LocaleContextProvider>
	);
};

export default App;
