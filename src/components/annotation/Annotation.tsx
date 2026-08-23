import React from "react";
import styles from "./Annotation.module.scss";
import classNames from "@lib/class-names";
import { YSPComponentPropsWithChildren } from "@src/types/components";

interface AnnotationProps {
	readonly index: number;
	readonly hasPrefix?: boolean;
};

const Annotation = ({ index, hasPrefix = true, className }: YSPComponentPropsWithChildren<AnnotationProps>): React.JSX.Element => {
	const ind = hasPrefix ? String(index).padStart(2, '0') : String(index);
	return (
		<span className={classNames(styles.root, className)}>
			<span
				className={styles.content}
				data-seq={index}
			>{ind}</span>
		</span>
	)
};

export default Annotation;
export type { AnnotationProps };
