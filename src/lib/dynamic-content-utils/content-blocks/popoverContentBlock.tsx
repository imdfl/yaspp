import React, { useContext } from "react";

import type {
	ContentComponentProps,
	IContentComponentInitData,
} from "@src/types/models";

import DynamicContentBrowser from "../components/contentBrowser";
import { AnnotationContentBlock } from "./annotationLinkContentBlock";
import { TermLinkContentBlock } from "./termLinkContentBlock";
import { PopoverProvider, LocaleContext } from "@contexts";
import { useToolbar } from "../hooks/useToolbar";
import { IPopoverContext } from "../types";
import { DynamicContentTypes } from "@src/types/content";
import Popover from "@components/popover/Popover";
import { IDialogRelativePosition } from "@lib/browser/dialog-utils";
interface IPopoverContentBlockProps {
	type: DynamicContentTypes;
	position?: Partial<IDialogRelativePosition>;
};

const getContentBlock = (
	type: DynamicContentTypes,
	data: IContentComponentInitData,
	className: string
): React.ReactNode => {
	switch (type) {
		case DynamicContentTypes.Annotation:
			return (
				<AnnotationContentBlock className={className} componentData={data} />
			);
		default:
			return (
				<TermLinkContentBlock className={className} componentData={data} />
			);
	}
};

export const PopoverContentBlock = ({
	componentData,
	type,
	position,
	className,
}: IPopoverContentBlockProps & ContentComponentProps): React.JSX.Element => {
	const toolbar = useToolbar();
	const { textDirection } = useContext(LocaleContext);
	const { node } = componentData;
	const context: IPopoverContext = {
		toolbar: toolbar.items,
		addToolbarItems: toolbar.addItems,
		removeToolbarItems: toolbar.removeItemsById,
	};

	const pos: Partial<IDialogRelativePosition> = {
		h: position?.h ?? (textDirection === "ltr" ?
			"right" : "left"
		),
		v: position?.v
	}
	return (
		<PopoverProvider value={context}>
			<Popover
				trigger={getContentBlock(type, componentData, className)}
				toolbarItems={toolbar.items.map((item) => item.element)}
				position={pos}
			>
					<DynamicContentBrowser node={node} />
			</Popover>
		</PopoverProvider>
	);
};
