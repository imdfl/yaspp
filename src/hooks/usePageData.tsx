import { useEffect, useState } from "react";
import { IParsedPageData } from "types/models";
import { mlNextBrowserUtils } from "../lib/next-runtime-utils/nextRunetimeUtils";

interface IComponentContentData {
	content: string | object | null;
	metaData?: string | object | null;
}

export interface IParsedComponentData {
	readonly pageData: ReadonlyArray<IParsedPageData>;
	readonly metaData: ReadonlyArray<IParsedPageData>;
}

/**
 * Returns an object with (possibly cached) parsed page data and parsed metaData (embedded in pages)
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const usePageData = (
	{ content, metaData: _metaData }: IComponentContentData
): IParsedComponentData => {
	const [pageData, setPageData] = useState<IParsedPageData[]>(
		mlNextBrowserUtils.getParsedPagedData(content)
	);

	const [metaData, setMetaData] = useState<IParsedPageData[]>(
		mlNextBrowserUtils.getParsedPagedData(_metaData)
	);

	// If the props changed, due to locale change, reparse the content
	useEffect(() => {
		setPageData(mlNextBrowserUtils.getParsedPagedData(content));
	}, [content]);

	useEffect(() => {
		setMetaData(mlNextBrowserUtils.getParsedPagedData(_metaData));
	}, [_metaData]);

	return {
		pageData,
		metaData,
	};
};

export default usePageData;
