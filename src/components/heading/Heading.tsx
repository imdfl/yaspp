import React from "react";
import styles from "./Heading.module.scss";
import classNames from "@lib/class-names";
import Text from "../text/Text";
import type { YSPComponentPropsWithChildren } from "@src/types/components";

type HeadingProps = {
	level: number | string;
};

export const Heading = ({
	level,
	className,
	children,
}: YSPComponentPropsWithChildren<HeadingProps>): React.JSX.Element => {
	const Tag = `h${level}` as keyof React.JSX.IntrinsicElements;
	return (
		<Tag role="heading" className={classNames(styles.root, className, styles[`level-${level}`])}>
			<Text 
			>{children}</Text>
		</Tag>
	);
};

export default Heading;
