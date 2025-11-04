import React, { useCallback, useContext } from 'react';
import Layout from 'layout/Layout';
import Head from 'next/head';
import type { IContentComponentData, IMLParsedNode } from 'types/models';
import { ContentIterator } from '../contentIterator';
import { usePageData } from '@hooks/usePageData';
import { MLNODE_TYPES } from 'types/nodes';
import { GenericContentLayout } from 'custom-layouts/generic-content-layout/GenericContentLayout';
import { usePageMetadata } from 'lib/dynamicContentHelpers';
import { LocaleContext } from '@contexts/localeContext';
import { useTranslatedString } from '@hooks/useTranslatedString';

const GenericPage = ({ pageProps, className }: IContentComponentData) => {
	const { pageData } = usePageData(pageProps);
	const page = pageData?.[0];
	const node: IMLParsedNode = page && {
		children: page.parsed,
		key: page.id,
		line: -1,
		type: MLNODE_TYPES.UNKNOWN,
	};
	const { t } = useContext(LocaleContext);
	const { metaData } = usePageMetadata(pageData);
	const setTitle = useCallback(() => {
		return `${t('common:site:title')} – ${t('common:site:subtitle')} – ${metaData.title}`;
	}, [t, metaData]);

	const { text: pageTitle } = useTranslatedString(setTitle);
	// `${t('common:site:title')} – ${t('common:site:subtitle')} – ${metaData.title}`;

	if (!node) {
		return <></>;
	}

	return (
		<Layout>
			<Head>
				<title>{pageTitle}</title>
			</Head>
			<GenericContentLayout
				title={metaData.title}
				abstract={metaData.abstract}
				author={metaData.author}
				date={metaData.date}
				className={className}
			>
				<ContentIterator componentData={{ node }} />
			</GenericContentLayout>
		</Layout>
	);
};

export default GenericPage;
