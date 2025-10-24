import React from 'react';
import styles from './Strip.module.scss';
import classNames from '@lib/class-names';

type StripProps = {
	className?: string;
};

const Strip = ({ className }: StripProps) => (
	<div className={classNames(styles.root, className)} />
);

export default Strip;
export type { StripProps };
