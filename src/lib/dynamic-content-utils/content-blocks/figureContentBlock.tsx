import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { useComponentAttrs } from "../../../hooks/useComponentAttrs";
import { Figure } from "@components/index";
import { renderNodes } from "@lib/dynamicContentHelpers";

export const FigureContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { attributes, style } = useComponentAttrs(node);
	const { key, children, elementId } = node;
	return (
		<Figure key={key} elementId={elementId} style={style} {...attributes}>
			{renderNodes(children)}
		</Figure>
	);
};
