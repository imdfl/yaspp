import React, { useContext } from 'react';
import { GetStaticProps, NextPage } from 'next';
import { ContentTypes } from 'types/content';
import { mlNextUtils } from '../lib/next-utils/nextUtils';
import { usePageData } from '../hooks/usePageData';
import { LoadFolderModes } from 'types/parser/modes';
import type { IPageProps } from 'types/models';
import Layout from 'layout/Layout';
import { renderElements, usePageMetadata } from 'lib/dynamicContentHelpers';
import Head from 'next/head';
import { GenericContentLayout } from '../custom-layouts/generic-content-layout/GenericContentLayout';
import { LocaleContext } from '../contexts/localeContext';

const Contribute: NextPage<IPageProps> = (props) => {
	const { pageData } = usePageData(props);
	const { metaData } = usePageMetadata(pageData);
	const { t } = useContext(LocaleContext);
	const pageTitle = `
		${t('common:site:title')} – ${t('pages:contribute:title')}
	`;

	return (
		<Layout>
			<Head>
				<title>{pageTitle}</title>
			</Head>
			<GenericContentLayout
				caption={metaData.title}
				title={'Contribute and Participate'}
			>
				{renderElements(pageData)}
			</GenericContentLayout>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async (context) =>
	mlNextUtils.getFolderStaticProps(
		ContentTypes.Contrib,
		context.locale,
		LoadFolderModes.Folder
	);

export default Contribute;
