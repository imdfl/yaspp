import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import type { IPageProps } from "@src/types/models";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import GenericPage from "@lib/dynamic-content-utils/components/genericPage";
import { LoadFolderModes } from "@src/types/parser/modes";
import { createPopoverLinksNodeProcessor } from "@lib/processors/createPopoverLinksNodeProcessor";

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) => {
	return mlNextUtils.getFolderStaticPaths(ContentTypes.Demo, context.locales);
};

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) => {
	if (process.env.NODE_ENV === "production") {
		return { notFound: true };
	}
	return mlNextUtils.getFolderStaticProps(
		`${ContentTypes.Demo}/${context.params.id as string}`,
		context.locale,
		LoadFolderModes.Folder,
		{
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		}
	);
};
