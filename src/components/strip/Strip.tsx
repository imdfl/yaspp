import React from "react";
import styles from "./Strip.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";
// import useClassNames from "@hooks/useClassNames";
// import ComponentContextProvider from "@contexts/componentContext";


const Strip = ({ className }: YSPComponentPropsWithChildren) => (
	<div className={classNames(styles.root, className)} />
);

export default Strip;
