import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { ContentIterator } from "../contentIterator";
import { ListItem, Text } from "@components/index";

export const ListItemContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => {
	return (
		<ListItem>
			<Text 
			// variant="body1"
			>
				<ContentIterator componentData={componentData} />
			</Text>
		</ListItem>
	);
};

export default ListItemContentBlock;
