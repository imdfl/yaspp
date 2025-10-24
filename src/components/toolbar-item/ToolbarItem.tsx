import React, { PropsWithChildren } from 'react';
import styles from './ToolbarItem.module.scss';
import classNames from '@lib/class-names';

type PopoverToolbarItemProps = {
	className?: string;
};

const PopoverToolbarItem = ({
	className,
	children,
}: PropsWithChildren<PopoverToolbarItemProps>): JSX.Element => (
	<div className={classNames(styles.root, className)}>{children}</div>
);

export default PopoverToolbarItem;
