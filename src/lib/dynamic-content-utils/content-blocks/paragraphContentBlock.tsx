import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { Paragraph } from "@components/index";
import { renderNodes } from "@lib/dynamicContentHelpers";

export const ParagraphContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { key, children } = node;
	return <Paragraph key={key}>{renderNodes(children)}</Paragraph>;
};

export default ParagraphContentBlock;
