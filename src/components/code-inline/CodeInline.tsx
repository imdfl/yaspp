import React from "react";
import styles from "./CodeInline.module.scss";
import classNames from "@lib/class-names";
import { YSPComponentPropsWithChildren } from "@src/types/components";

const CodeInline = ({
	children,
	className,
}: YSPComponentPropsWithChildren): React.JSX.Element => (
	<code className={classNames(styles.root, className)}>{children}</code>
);

export default CodeInline;
