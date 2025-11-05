import React from "react";
import styles from "./Annotation.module.scss";
import { leadingZero } from "./helpers";
import classNames from "@lib/class-names";
import { YSPComponentPropsWithChildren } from "types/components";

interface AnnotationProps {
	readonly index: number;
	readonly hasPrefix?: boolean;
};

const Annotation = ({ index, hasPrefix = true, className }: YSPComponentPropsWithChildren<AnnotationProps>): JSX.Element => (
	<span className={classNames(styles.root, className)}>
		<span
			className={styles.content}
			data-prefix-content={hasPrefix ? leadingZero(index) : ""}
			data-seq={index}
		></span>
	</span>
);

export default Annotation;
export type { AnnotationProps };
