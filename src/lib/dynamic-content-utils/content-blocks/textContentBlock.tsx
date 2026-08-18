import React from "react";
import { IContentComponentProps } from "@src/types/models";

export const TextContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { text } = node;
	return <span>{text}</span>;
};

export default TextContentBlock;
