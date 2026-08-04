import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import { ContentTypes } from "@src/types/content";
import { LoadFolderModes } from "@src/types/parser/modes";
import type { IPageProps } from "@src/types/models";
import GenericPage from "@lib/dynamic-content-utils/components/genericPage";

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) =>
	mlNextUtils.getFolderStaticPaths(ContentTypes.About, context.locales);

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps({
		folderPath: `${ContentTypes.Docs}/${context.params.id as string}`,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		pathParams: context.params
	});
