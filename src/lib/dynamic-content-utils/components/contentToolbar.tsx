import React, { useContext, useEffect, useState } from 'react';
import { IParsedPageData } from 'types/models';
import { DynamicContentContext } from '@contexts/contentContext';
import { PopoverContext } from '@contexts/popoverContext';
import { getIcon } from 'components/icons';
import { ToolbarButton } from 'components/index';
import { LocaleContext } from '@contexts/localeContext';

export interface IDynamicContentToolbarProps {
	pages: IParsedPageData[];
}

const backButtonKey = 'popover-toolbar-back-button';

export default function DynamicContentToolbar({
	pages,
}: IDynamicContentToolbarProps): JSX.Element {
	const [prevPageId, setPrevPageId] = useState('');
	const { t, textDirection } = useContext(LocaleContext);
	const popoverContext = useContext(PopoverContext);
	const dynamicContentContext = useContext(DynamicContentContext);

	useEffect(() => {
		if (pages.length < 2) {
			popoverContext.removeToolbarItems(backButtonKey);
			setPrevPageId('');
			return;
		}

		const idx = pages.length - 2;
		const prevPage = pages[idx]; // guaranteed

		if (prevPage.id === prevPageId) {
			return;
		}

		setPrevPageId(prevPage.id);

		popoverContext.addToolbarItems({
			element: (
				<ToolbarButton
					key={`back-button-key-${prevPage.metaData.glossary_key}`}
					title={
						prevPage.metaData.title ||
						t(prevPage.metaData.glossary_key) ||
						prevPage.id
					}
					onClick={() => dynamicContentContext.setPageIndex(idx)}
				>
					{getIcon(`arrow${textDirection === 'ltr' ? 'Left' : 'Right'}`)}
				</ToolbarButton>
			),
			id: backButtonKey,
			enabled: true,
		});
	}, [
		pages,
		prevPageId,
		dynamicContentContext,
		popoverContext,
		textDirection,
		t,
	]);

	return <></>;
}
