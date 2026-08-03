import { useContext } from "react";
import { GetStaticProps, NextPage } from "next";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import { usePageData } from "@hooks/usePageData";
import { LoadFolderModes } from "@src/types/parser/modes";
import type { IPageProps } from "@src/types/models";
import Layout from "@src/layout/Layout";
import { renderElements, usePageMetadata } from "@lib/dynamicContentHelpers";
import Head from "next/head";
import { GenericContentLayout } from "@src/custom-layouts/generic-content-layout/GenericContentLayout";
import { LocaleContext } from "@contexts/index";

const Contribute: NextPage<IPageProps> = (props) => {
	const { pageData } = usePageData(props);
	const { metaData } = usePageMetadata(pageData);
	const { t } = useContext(LocaleContext);
	const pageTitle = `${t('common:site:title')} – ${t('pages:contribute:title')}`;

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
