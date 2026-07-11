import React from "react";
import Text from "../text/Text";
import styles from "./Paragraph.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
// import useClassNames from "@hooks/useClassNames";
// import ComponentContextProvider from "@contexts/componentContext";


export const Paragraph = ({
	children,
	className,
}: YSPComponentPropsWithChildren): React.JSX.Element => (
	<p className={classNames(styles.root, className)}>
		<Text>{children}</Text>
	</p>
);

export default Paragraph;
