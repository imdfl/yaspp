import React, { PropsWithChildren, useContext } from "react";
import { DynamicContentTypes } from "@src/types/content";
import NoteContentLayout from "@src/custom-layouts/note-content-layout/NoteContentLayout";
import ReferenceContentLayout from "@src/custom-layouts/reference-content-layout/ReferenceContentLayout";
import { LocaleContext } from "@contexts";
import type { RefOrSourceProps } from "@src/types/components";
import type { TextDirection } from "@src/types/locale";

import styles from "@src/custom-layouts/dynamic-content-layout/DynamicContentLayout.module.scss";

type ContentLayoutProps = {
	type: DynamicContentTypes;
	textDirection?: TextDirection;
	term?: string;
	sources?: RefOrSourceProps[];
};


export const DynamicContentLayout = ({
	type,
	term,
	sources,
	children,
}: PropsWithChildren<ContentLayoutProps>): React.JSX.Element => {
	let dynamicLayout = null;

	const { t, locale } = useContext(LocaleContext);

	switch (type) {
		case DynamicContentTypes.Annotation:
			// todo: support source list for note content layout
			dynamicLayout = <NoteContentLayout>{children}</NoteContentLayout>;
			break;
		case DynamicContentTypes.Glossary:
			dynamicLayout = (
				<ReferenceContentLayout
					caption={t(`common:caption:glossary`)}
					title={t(`glossary:term:${term}`)}
					term={locale === "en" ? "" : t(`glossary:en:term:${term}`)}
					sources={sources}
					sourcesLabel={t(
						`common:caption:source:${
							sources.length > 1 ? 'multiple' : 'single'
						}`
					)}
				>
					{children}
				</ReferenceContentLayout>
			);
			break;
		default:
			dynamicLayout = <>error: undefined dynamic content layout</>;
			break;
	}

	return (
		<section className={styles.root}>{dynamicLayout}</section>
	);
};
