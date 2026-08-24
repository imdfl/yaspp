import React, { useContext } from "react";
import { GetStaticProps, NextPage } from "next";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "../lib/next-utils/nextUtils";
import type { IPageProps } from "@src/types/models";
import { usePageData } from "../hooks/usePageData";
import { LoadContentModes, LoadFolderModes } from "@src/types/parser/modes";
import { Link } from "@components/index";
import Layout from "@src/layout/Layout";
import { LocaleContext } from "@contexts";

const Docs: NextPage<IPageProps> = (props) => {
	const { metaData } = usePageData(props);
	const { t } = useContext(LocaleContext);
	return (
		<Layout>
			<article className="page">
				<h1 className="title">{t('docs:page:title')}</h1>
				{metaData.length && (
					<ul>
						{metaData.map((page, index) => {
							const key = `doc-${index}`;
							return (
								<li className="item" key={key}>
									<Link href={page.path}>{page.metaData.title}</Link>
								</li>
							);
						})}
					</ul>
				)}
			</article>
		</Layout>
	);
};

export const getStaticProps: GetStaticProps = async (context) => {
	const indexProps = await mlNextUtils.getFolderStaticProps({
		folderPath: ContentTypes.Docs,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		pathParams: context.params
	});

	const childrenProps = await mlNextUtils.getFolderStaticProps({
		folderPath: ContentTypes.Docs,
		locale: context.locale,
		loadMode: LoadFolderModes.Children,
		mode: {
			contentMode: LoadContentModes.Metadata,
		},
		pathParams: context.params
	});

	/* eslint-disable @typescript-eslint/no-explicit-any */
	const props = {
		props: {
			...(indexProps as any).props,
			metaData: (childrenProps as any).props.content,
		},
	};

	return props;
};

export default Docs;
