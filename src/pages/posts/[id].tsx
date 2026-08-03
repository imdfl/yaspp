import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import type { IPageProps } from "@src/types/models";
import { LoadFolderModes } from "@src/types/parser/modes";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "../../lib/next-utils/nextUtils";
import { usePageData } from "../../hooks/usePageData";
import { Container, Link } from "@components/index";
import Layout from "@src/layout/Layout";
import { getIcon } from "@components/icons";
import { GenericContentLayout } from "@src/custom-layouts/generic-content-layout/GenericContentLayout";
import { renderElements, usePageMetadata } from "@lib/dynamicContentHelpers";
import styles from "../../custom-layouts/generic-content-layout/mixins/BlogPostLayoutMixin.module.scss";
import { LocaleContext } from "@contexts/localeContext";
import { useContext } from "react";

export default function Doc(props: IPageProps) {
	const { pageData } = usePageData(props);
	const page = pageData?.[0];
	const { metaData } = usePageMetadata(pageData);
	const { t, textDirection } = useContext(LocaleContext);
	// const { metaData } = page ?? {};
	const backIcon = getIcon(
		`chevron${textDirection === 'ltr' ? 'Left' : 'Right'}`
	);
	if (!page) {
		return <></>
	}
	return (
		<Layout>
			<div className="page">
				<h3>Rabak</h3>
				<Container alignItemsCenter>
					<Link href="/posts">
						{backIcon}
						{t('common:button:backToTarget', {
							sep: t('common:to'),
							target: t('pages:blog:title'),
						})}
					</Link>
				</Container>
				<GenericContentLayout
					key={metaData.title}
					title={metaData.title}
					date={metaData.date}
					author={metaData.author}
					className={styles.root}
				>
					{renderElements(pageData)}
				</GenericContentLayout>
			</div>
		</Layout>
	);
}

export const getStaticPaths: GetStaticPaths = async (context) => {
	const paths = await mlNextUtils.getFolderStaticPaths(ContentTypes.Posts, context.locales);
	return paths;
}

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps({
		folderRelativePath: `${ContentTypes.Posts}/${context.params.id as string}`,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
	});
