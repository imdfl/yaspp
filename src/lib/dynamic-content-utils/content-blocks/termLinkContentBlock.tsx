import React from "react";
import { ContentIterator } from "../contentIterator";
import type { IContentComponentProps } from "@src/types/models";
import { Term } from "@components/index";

export const TermLinkContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	return (
		<Term>
			<ContentIterator componentData={componentData} />
		</Term>
	);
};
