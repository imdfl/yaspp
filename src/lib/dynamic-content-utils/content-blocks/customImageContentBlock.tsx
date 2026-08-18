import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { CustomImage } from "@components/index";

export const CustomImageContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => (
	<CustomImage src={componentData.node.target} />
);

export default CustomImageContentBlock;
