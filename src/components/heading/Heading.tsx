import React from "react";
import styles from "./Heading.module.scss";
import classNames from "@lib/class-names";
import Text, { type HeadingVariant } from "../text/Text";
import type { YSPComponentPropsWithChildren } from "types/components";

type HeadingProps = {
	level: number | string;
};

export const Heading = ({
	level,
	className,
	children,
}: YSPComponentPropsWithChildren<HeadingProps>): JSX.Element => {
	const Tag = `h${level}` as keyof JSX.IntrinsicElements;
	return (
		<Tag role="heading" className={classNames(styles.root, className)}>
			<Text variant={Tag as HeadingVariant}>{children}</Text>
		</Tag>
	);
};

export default Heading;
