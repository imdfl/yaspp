import React from "react";
import { ContentComponentProps } from "types/models";
import CodeInline from "components/code-inline/CodeInline";

export const CodeInlineContentBlock = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => (
	<CodeInline>{componentData.node.text}</CodeInline>
);
