import React from "react";
import { ContentComponentProps } from "types/models";
import { CustomImage } from "components/index";

export const CustomImageContentBlock = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => (
	<CustomImage src={componentData.node.target} />
);

export default CustomImageContentBlock;
