import React, { useContext } from 'react';
import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from 'next';
import { ContentTypes } from 'types/content';
import { mlNextUtils } from '../../lib/next-utils/nextUtils';
import { LoadFolderModes } from 'types/parser/modes';
import { MLNODE_TYPES } from 'types/nodes';
import type { IMLParsedNode, IPageProps } from 'types/models';
import { usePageData } from '../../hooks/usePageData';
import { Link, List } from 'components/index';
import { ContentIterator } from 'lib/dynamic-content-utils/contentIterator';
import Layout from 'layout/Layout';
import { createPopoverLinksNodeProcessor } from 'lib/processors/createPopoverLinksNodeProcessor';
import { LocaleContext } from '@contexts/localeContext';

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

export const getStaticPaths: GetStaticPaths = async (context) =>
	mlNextUtils.getFolderStaticPaths(ContentTypes.Glossary, context.locales);

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps(
		`${ContentTypes.Glossary}/${context.params.id as string}`,
		context.locale,
		LoadFolderModes.Folder,
		{
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		}
	);
