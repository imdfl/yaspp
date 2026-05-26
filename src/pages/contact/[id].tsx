import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from "next";
import { ContentTypes } from "@src/types/content";
import { mlNextUtils } from "@lib/next-utils/nextUtils";
import type { IPageProps } from "@src/types/models";
import { LoadFolderModes } from "@src/types/parser/modes";
import GenericPage from "@lib/dynamic-content-utils/components/genericPage";

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) =>
	mlNextUtils.getFolderStaticPaths(ContentTypes.Contact, context.locales);

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps(
		`${ContentTypes.Contact}/${context.params.id as string}`,
		context.locale,
		LoadFolderModes.Folder
	);
