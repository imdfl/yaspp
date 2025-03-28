import { useEffect, useState } from 'react';
import { IParsedPageData } from 'types/models';
import { mlNextBrowserUtils } from '../lib/next-runtime-utils/nextRunetimeUtils';

interface IComponentContentData {
	content: string | object | null;
	metaData?: string | object | null;
}

export interface IParsedComponentData {
	readonly pageData: IParsedPageData[];
	readonly metaData: IParsedPageData[];
}

/**
 * Returns an object with (possibly cached) parsed page data and parsed metaData (embedded in pages)
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const usePageData = (
	props: IComponentContentData
): IParsedComponentData => {
	const [pageData, setPageData] = useState<IParsedPageData[]>(
		mlNextBrowserUtils.getParsedPagedData(props.content)
	);

	const [metaData, setMetaData] = useState<IParsedPageData[]>(
		mlNextBrowserUtils.getParsedPagedData(props.metaData)
	);

	// If the props changed, due to locale change, reparse the content
	useEffect(() => {
		setPageData(mlNextBrowserUtils.getParsedPagedData(props.content));
		setMetaData(mlNextBrowserUtils.getParsedPagedData(props.metaData));
	}, [props]);

	return {
		pageData,
		metaData,
	};
};

export default usePageData;
