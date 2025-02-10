import React from 'react';
import classNames from 'classnames';
import styles from './Figure.module.scss';
import type { YSPComponentPropsWithChildren } from 'types/components';

type FigureProps = {
	elementId: string;
	className?: string;
};

const Figure = ({
	elementId,
	children,
	className,
	style = {},
	...rest
}: YSPComponentPropsWithChildren<FigureProps>) => (
	<figure className={classNames(styles.root, className)} {...rest} style={style}>
		{elementId && <a id={elementId}></a>}
		<div className={styles.figureContent}>{children}</div>
	</figure>
);

export default Figure;
export type { FigureProps };
