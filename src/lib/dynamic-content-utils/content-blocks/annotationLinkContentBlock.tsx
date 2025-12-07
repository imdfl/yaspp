import React from "react";
import { ContentComponentProps } from "types/models";
import { Annotation } from "../../../components";

export const AnnotationContentBlock = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => (
	<Annotation index={componentData.node.sequence} />
);
