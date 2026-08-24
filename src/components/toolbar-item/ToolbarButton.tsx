import React from "react";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import Button from "@components/button/Button";
import PopoverToolbarItem from "./ToolbarItem";
import styles from "./ToolbarButton.module.scss";

interface ToolbarButtonProps {
	readonly title: string;
	readonly onClick: () => void;
};

const ToolbarButton = ({
	title,
	onClick,
	children,
}: YSPComponentPropsWithChildren<ToolbarButtonProps>): React.JSX.Element => (
	<PopoverToolbarItem>
		<Button title={title} onClick={onClick} className={styles.root}>
			{children}
		</Button>
	</PopoverToolbarItem>
);

export default ToolbarButton;
