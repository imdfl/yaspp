import React, { PropsWithChildren } from 'react';
import Scrollbar from '../../components/scrollbar/Scrollbar';
import styles from './DynamicContentLayout.module.scss';
import type { DynamicContentTypes } from 'types/content';
import type { RefOrSourceProps } from 'types/components';
import type { TextDirection } from 'types/locale';

type ContentLayoutProps = {
	type: DynamicContentTypes;
	textDirection?: TextDirection;
	term?: string;
	sources?: RefOrSourceProps[];
};

const ContentLayout = ({
	textDirection,
	children,
}: PropsWithChildren<ContentLayoutProps>): JSX.Element => (
	<Scrollbar textDirection={textDirection}>
		<section className={styles.root}>{children}</section>
	</Scrollbar>
);

export default ContentLayout;
export type { ContentLayoutProps };
