import React from "react";
import * as ToggleRoot from "@radix-ui/react-toggle";
import classNames from "@lib/class-names";
import styles from "./ToggleButton.module.scss";
import type { YSPComponentPropsWithChildren } from "types/components";

interface ToggleButtonProps {
	readonly title: string;
	readonly isToggled: boolean;
	readonly onClick?: () => void;
};

const ToggleButton = ({
	isToggled,
	title,
	children,
	onClick,
	className,
	...rest
}: YSPComponentPropsWithChildren<ToggleButtonProps>): JSX.Element => (
	<div className={styles.root}>
		<ToggleRoot.Root
			onPressedChange={onClick}
			defaultPressed={isToggled}
			title={title}
			className={classNames(styles.root, className)}
			asChild
			{...rest}
		>
			<span className={styles.item}>{children}</span>
		</ToggleRoot.Root>
	</div>
);

export default ToggleButton;
export type { ToggleButtonProps };
