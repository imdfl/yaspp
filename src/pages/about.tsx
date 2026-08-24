import { useCallback, useContext } from "react";
import Head from "next/head";
import type { IPageProps } from "@src/types/models";
import { GetStaticProps, NextPage } from "next";
import { ContentTypes } from "../types/content";
import { mlNextUtils } from "../lib/next-utils/nextUtils";
import { usePageData } from "../hooks/usePageData";
import { LoadFolderModes } from "@src/types/parser/modes";
import Layout from "@src/layout/Layout";
import { renderElements, usePageMetadata } from "@lib/dynamicContentHelpers";
import { GenericContentLayout } from "@src/custom-layouts/generic-content-layout/GenericContentLayout";
import { Container } from "@components/index";
import { LocaleContext } from "@contexts";
import { useTranslatedString } from "@hooks/useTranslatedString";

const About: NextPage<IPageProps> = (props) => {
	const { pageData } = usePageData(props);
	const { metaData } = usePageMetadata(pageData);

	const { t } = useContext(LocaleContext);
	const tGen = useCallback(() => `${t('common:site:title')} – ${t('pages:about:title')}`, [t]);
	const { text: title } = useTranslatedString(tGen);
	return (
		<Layout>
			<Head>
				<title>{title}</title>
			</Head>
			<GenericContentLayout caption={metaData.title} title={metaData.abstract}>
				<Container flexDirection="column">{renderElements(pageData)}</Container>
			</GenericContentLayout>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async (context) =>
	mlNextUtils.getFolderStaticProps({
		folderPath: ContentTypes.About,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		pathParams: context.params
	});

export default About;
