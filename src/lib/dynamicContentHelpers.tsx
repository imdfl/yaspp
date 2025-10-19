import { useEffect, useState } from 'react';
import { ContentComponent } from './dynamic-content-utils/contentComponent';
import type { IMLParsedNode, IPageMetaData, IParsedPageData } from 'types/models';

export const renderElements = (pageData: IParsedPageData[]) => {
	const page = pageData[0] || ({} as IParsedPageData);
	const elements: IMLParsedNode[] = page.parsed;
	return renderNodes(elements);
};

export const renderNodes = (elements: IMLParsedNode[]) =>
	(Array.isArray(elements) ? elements : []).map((node: IMLParsedNode) => (
		<ContentComponent
			key={`content-component-${node.type}-${node.line}-${node.key}`}
			componentData={{ node }}
		/>
	));

export const getMetadata = (keys: string[], pageData: IParsedPageData[]) => {
	const page = pageData?.[0];
	if (!page) {
		return [];
	}
	const { metaData = {} } = page;
	return keys.map((k: string) => metaData[k]);
};

type UseMetaData = { metaData: Partial<IPageMetaData> };
export const usePageMetadata = (pageData: IParsedPageData[]): UseMetaData => {
	const [ metaData, setMetaData ] = useState<Partial<IPageMetaData>>({});
	useEffect(() => {
		const page = pageData?.[0];
		setMetaData({ ...(page?.metaData ?? {}) });
	}, [pageData] )
	
	return { metaData };
};
