import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import { ContentTypes } from "@src/types/content";
import { LoadContentModes, LoadFolderModes } from "@src/types/parser/modes";
import { IPageProps } from "@src/types/models";
import { createPopoverLinksNodeProcessor } from "@lib/processors/createPopoverLinksNodeProcessor";
import GenericPage from "@lib/dynamic-content-utils/components/genericPage";

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) =>
	mlNextUtils.getFolderStaticPaths(ContentTypes.Docs, context.locales);

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) => {
	return mlNextUtils.getFolderStaticProps({
		folderPath: `${ContentTypes.Docs}/${context.params.id as string}/codex`,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		mode: {
			contentMode: LoadContentModes.Full,
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		},
		pathParams: context.params
	});
};
