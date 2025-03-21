import { GetStaticProps, GetStaticPaths, GetStaticPropsContext } from 'next';
import { mlNextUtils } from 'lib/next-utils/nextUtils';
import { ContentTypes } from 'types/content';
import { LoadContentModes, LoadFolderModes } from 'types/parser/modes';
import { IPageProps } from 'types/models';
import { createPopoverLinksNodeProcessor } from 'lib/processors/createPopoverLinksNodeProcessor';
import GenericPage from 'lib/dynamic-content-utils/components/genericPage';

export default function Doc(props: IPageProps) {
	return <GenericPage pageProps={props} />;
}

export const getStaticPaths: GetStaticPaths = async (context) =>
	mlNextUtils.getFolderStaticPaths(ContentTypes.Docs, context.locales);

export const getStaticProps: GetStaticProps = async (
	context: GetStaticPropsContext
) =>
	mlNextUtils.getFolderStaticProps(
		`${ContentTypes.Docs}/${context.params.id as string}`,
		context.locale,
		LoadFolderModes.Folder,
		{
			contentMode: LoadContentModes.Full,
			nodeProcessors: [createPopoverLinksNodeProcessor()],
		}
	);
