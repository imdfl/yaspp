import React from "react";
import { IContentComponentProps } from "@src/types/models";
import { Annotation } from "../../../components";

export const AnnotationContentBlock = ({
	componentData,
}: IContentComponentProps): React.JSX.Element => (
	<Annotation index={componentData.node.sequence} />
);
