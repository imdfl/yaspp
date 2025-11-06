import React, { useCallback, useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import { mlNextUtils } from '../lib/next-utils/nextUtils';
import { usePageData } from '../hooks/usePageData';
import Head from 'next/head';
import Layout from 'layout/Layout';
import { GenericContentLayout } from 'custom-layouts/generic-content-layout/GenericContentLayout';
// import { ContentTypes } from '../types/content';
import { createPopoverLinksNodeProcessor } from 'lib/processors/createPopoverLinksNodeProcessor';
import { renderElements, usePageMetadata } from '../lib/dynamicContentHelpers';
import { LoadContentModes, LoadFolderModes } from 'types/parser/modes';
import type { IPageProps } from 'types/models';
import { LocaleContext } from '@contexts/localeContext';
import { useTranslatedString } from '../hooks/useTranslatedString';

const Index: NextPage<IPageProps> = (props) => {
	const { t } = useContext(LocaleContext);
	const { pageData } = usePageData(props);
	const { metaData } = usePageMetadata(pageData);

	const pageTitleGen = useCallback(() => `${t('common:site:title')} – ${t('common:site:subtitle')}`, [t]);
	const { text: pageTitle } = useTranslatedString(pageTitleGen); 
	
	return (
		<Layout>
			<Head>
				<title>{pageTitle}</title>
			</Head>
			<GenericContentLayout title={metaData.title} abstract={metaData.moto}>
				{renderElements(pageData)}
			</GenericContentLayout>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async (context) => {
	return mlNextUtils.getFolderStaticProps(
		null, // convention for the default index page, empty string also works
		context.locale,
		LoadFolderModes.Folder,
		{
			contentMode: LoadContentModes.Full,
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		}
	);
}

export default Index;
