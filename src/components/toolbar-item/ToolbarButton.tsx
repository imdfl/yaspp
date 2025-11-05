import React from 'react';
import Button from '../button/Button';
import PopoverToolbarItem from './ToolbarItem';
import styles from './ToolbarButton.module.scss';
import type { YSPComponentPropsWithChildren } from "types/components";

interface ToolbarButtonProps {
	readonly title: string;
	readonly onClick: () => void;
};

const ToolbarButton = ({
	title,
	onClick,
	children,
}: YSPComponentPropsWithChildren<ToolbarButtonProps>): JSX.Element => (
	<PopoverToolbarItem>
		<Button title={title} onClick={onClick} className={styles.root}>
			{children}
		</Button>
	</PopoverToolbarItem>
);

export default ToolbarButton;
