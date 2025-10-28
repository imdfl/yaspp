import React from "react";
import classNames from "@lib/class-names";
import styles from "./Table.module.scss";
import type { YSPComponentPropsWithChildren } from "../../types/components";

type TableProps = {
	className?: string;
};

export const Table = ({
	children,
	className,
	style = {},
}: YSPComponentPropsWithChildren<TableProps>) => (
	<table key={"dada"} className={classNames(styles.root, className)} style={style}>
		<tbody>{children}</tbody>
	</table>
);

export default Table;
export type { TableProps };
