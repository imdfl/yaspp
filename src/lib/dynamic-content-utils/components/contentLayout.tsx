import React, { PropsWithChildren, useContext } from "react";
import { DynamicContentTypes } from "@src/types/content";
import type { ContentLayoutProps } from "@src/custom-layouts/dynamic-content-layout/DynamicContentLayout";
import NoteContentLayout from "@src/custom-layouts/note-content-layout/NoteContentLayout";
import ReferenceContentLayout from "@src/custom-layouts/reference-content-layout/ReferenceContentLayout";
import ContentLayout from "@src/custom-layouts/dynamic-content-layout/DynamicContentLayout";
import { LocaleContext } from "@contexts/localeContext";

export const DynamicContentLayout = ({
	type,
	term,
	sources,
	children,
}: PropsWithChildren<ContentLayoutProps>): React.JSX.Element => {
	let dynamicLayout = null;

	const { t, locale, textDirection } = useContext(LocaleContext);

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
		<ContentLayout type={type} textDirection={textDirection}>
			{dynamicLayout}
		</ContentLayout>
	);
};
