import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import { LoadContentModes, LoadFolderModes } from "@src/types/parser/modes";
import { IPageProps } from "@src/types/models";
import { createPopoverLinksNodeProcessor } from "@lib/processors/createPopoverLinksNodeProcessor";
import GenericPage from "@lib/dynamic-content-utils/components/genericPage";

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) => {
	const paths = await mlNextUtils.getNestedStaticPaths({
		contentFolder: __filename,
		locales: context.locales,
	});

	return paths;
};

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) => {
	const params = context.params || {};

	const relativePath = await mlNextUtils.populateDynamicPath(
		__filename,
		params as { [key: string]: string }
	);

	return mlNextUtils.getFolderStaticProps({
		folderPath: relativePath,
		locale: context.locale,
		loadMode: LoadFolderModes.Folder,
		mode: {
			contentMode: LoadContentModes.Full,
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		},
		pathParams: context.params
	});
};
