import React from "react";
import Text from "../text/Text";
import styles from "./Paragraph.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";
// import useClassNames from "@hooks/useClassNames";
// import ComponentContextProvider from "@contexts/componentContext";


export const Paragraph = ({
	children,
	className,
}: YSPComponentPropsWithChildren): JSX.Element => (
	<p className={classNames(styles.root, className)}>
		<Text variant="body1">{children}</Text>
	</p>
);

export default Paragraph;
