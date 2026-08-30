import React, { useContext, useState } from "react";
import { DynamicContentLayout } from "./contentLayout";
import { Text, LoadingIndicator } from "@components/index";
import { DynamicContentTypes } from "@src/types/content";
import { useDynamicContentServer } from "../hooks/useDynamicContentServer";
import { SHOW_LOADING_INDICATOR_AFTER_MSEC } from "../consts";
import { RefOrSourceProps } from "@src/types/components";
import { contentUtils } from "@lib/contentUtils";
import { renderNodes } from "@lib/dynamicContentHelpers";
import { LocaleContext } from "@contexts";

type DynamicContentViewerProps = {
	url: string;
};

export const DynamicContentViewer = ({
	url,
}: DynamicContentViewerProps): React.JSX.Element => {
	const { error, isLoading, item } = useDynamicContentServer(url);
	const { t } = useContext(LocaleContext);
	/**
	 * Set to true if you want to debug the loading animation
	 */
	const [debugLoading] = useState(false);

	if (error) {
		return <Text className="error">{error}</Text>;
	}

	if (isLoading || debugLoading) {
		return (
			<LoadingIndicator
				label={t('common:caption:loading')}
				delay={SHOW_LOADING_INDICATOR_AFTER_MSEC}
				size="xl"
			/>
		);
	}

	const elements = item?.parsed;

	if (!elements?.length) {
		return <></>;
	}

	const itemData = contentUtils.urlToContentData(
		url,
		DynamicContentTypes.Glossary
	);

	const { type } = itemData;
	const { metaData } = item;

	const {
		source_name: sourceName,
		source_url: sourceUrl,
		glossary_key: term,
	} = metaData;

	const sources: RefOrSourceProps[] = sourceName && [
		{
			name: sourceName,
			url: sourceUrl,
		},
	];

	return (
		<DynamicContentLayout type={type} term={term} sources={sources}>
			{renderNodes(elements)}
		</DynamicContentLayout>
	);
};

export default DynamicContentViewer;
