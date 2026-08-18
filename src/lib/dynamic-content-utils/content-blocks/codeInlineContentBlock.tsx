import React from "react";
import { IContentComponentProps } from "@src/types/models";
import CodeInline from "@components/code-inline/CodeInline";

export const CodeInlineContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => (
	<CodeInline>{componentData.node.text}</CodeInline>
);
