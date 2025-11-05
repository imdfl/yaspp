import React from "react";
import classNames from "@lib/class-names";
import styles from "./Table.module.scss";
import type { YSPComponentPropsWithChildren } from "types/components";
// import useClassNames from "@hooks/useClassNames";
// import ComponentContextProvider from "@contexts/componentContext";


export const Table = ({
	children,
	className,
	style = {},
}: YSPComponentPropsWithChildren) => (
	<table key={"dada"} className={classNames(styles.root, className)} style={style}>
		<tbody>{children}</tbody>
	</table>
);

export default Table;
