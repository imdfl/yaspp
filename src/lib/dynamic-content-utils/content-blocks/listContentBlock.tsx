import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { List } from "@components/index";
import { renderNodes } from "@lib/dynamicContentHelpers";

export const ListContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { key, children, ordered } = node;
	return (
		<List key={key} ordered={ordered}>
			{renderNodes(children)}
		</List>
	);
};

export default ListContentBlock;
