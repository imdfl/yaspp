import React from "react";
import styles from "./PopoverTrigger.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";

type PopoverTriggerProps = {
	opened?: boolean;
};

const PopoverTrigger = ({
	opened,
	children,
	className,
}: YSPComponentPropsWithChildren<PopoverTriggerProps>): JSX.Element => (
	<span
		data-popover-state={opened ? "open" : "closed"}
		className={classNames(styles.root, className)}
	>
		{children}
	</span>
);

export default PopoverTrigger;
