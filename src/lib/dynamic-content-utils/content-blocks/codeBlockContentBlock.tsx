import React from "react";
import CodeBlock from "@components/code-block/CodeBlock";
import { IContentComponentProps } from "@src/types/models";

export const CodeBlockContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	return <CodeBlock key={node.key}>{node.text}</CodeBlock>;
};
