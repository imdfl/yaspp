import React from 'react';
import styles from './ToolbarItem.module.scss';
import classNames from '@lib/class-names';
import type { YSPComponentPropsWithChildren } from "types/components";


const PopoverToolbarItem = ({
	className,
	children,
}: YSPComponentPropsWithChildren): JSX.Element => (
	<div className={classNames(styles.root, className)}>{children}</div>
);

export default PopoverToolbarItem;
