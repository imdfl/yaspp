import React, { useContext } from "react";
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import type { IMLParsedNode, IPageProps } from "@src/types/models";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import { LoadFolderModes } from "@src/types/parser/modes";
import { MLNODE_TYPES } from "@src/types/nodes";
import { usePageData } from "@hooks/usePageData";
import { Link, List } from "@components/index";
import { ContentIterator } from "@lib/dynamic-content-utils/contentIterator";
import Layout from "@src/layout/Layout";
import { createPopoverLinksNodeProcessor } from "@lib/markdown-utils/createPopoverLinksNodeProcessor";
import { LocaleContext } from "@contexts";

export default function GlossaryTerm(props: IPageProps) {
	const { pageData } = usePageData(props);
	const page = pageData?.[0];
	const metaData = page?.metaData;
	const node: IMLParsedNode = page && {
		children: page.parsed,
		key: page.id,
		line: -1,
		type: MLNODE_TYPES.UNKNOWN,
	};
	const { t } = useContext(LocaleContext);

	return (
		<Layout>
			<article className="page">
				<Link className="title" href={'/glossary'}>
					{t('common:button:backToTarget', {
						sep: t('common:to'),
						target: t('pages:glossary:title'),
					})}
				</Link>
				<h1 className="title">{t('pages:glossary:title')}</h1>
				<h2 className="title">
					{t(`glossary:term:${metaData?.glossary_key}`)}
				</h2>
				{/* TODO: Use forced translation */}
				{/* <p className="term">{t(metaData?.glossary_key, 'en')}</p> */}
				{node ? (
					<ContentIterator componentData={{ node }} />
				) : (
					<div className="no-content">(No page content)</div>
				)}
				<List
					className="bibliography"
					label={''}
					items={[
						{
							label: `${metaData.source_name}${
								metaData.source_name ? ` / ${metaData.source_name}` : ''
							}`,
							url: metaData.source_url,
						},
					]}
				/>
			</article>
		</Layout>
	);
}

export const getStaticPaths: GetStaticPaths = async (context) => {
	const paths = await mlNextUtils.getFolderStaticPaths(ContentTypes.Glossary, context.locales);
	return paths;
}

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps({
		folderPath: `${ContentTypes.Glossary}/${context.params.id as string}`,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		mode: {
			nodeProcessors: [createPopoverLinksNodeProcessor()]
		},
		pathParams: context.params
	});
