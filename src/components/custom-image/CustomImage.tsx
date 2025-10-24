import React from 'react';
import styles from './CustomImage.module.scss';
import classNames from '@lib/class-names';

type CustomImageProps = {
	src: string;
	className?: string;
};

export const CustomImage = ({
	src,
	className,
}: CustomImageProps): JSX.Element => (
	<img className={classNames(styles.root, className)} src={src} />
);

export default CustomImage;
export type { CustomImageProps };
