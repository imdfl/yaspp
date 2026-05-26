import React from "react";
import { ContentComponentProps } from "@src/types/models";
import { useComponentAttrs } from "../../../hooks/useComponentAttrs";
import { Table } from "@components/index";
import { renderNodes } from "@lib/dynamicContentHelpers";

export const TableContentBlock = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { attributes, style } = useComponentAttrs(node);
	const { key, children } = node;
	return (
		<Table key={key} {...attributes} style={style}>
			{renderNodes(children)}
		</Table>
	);
};

export default TableContentBlock;
