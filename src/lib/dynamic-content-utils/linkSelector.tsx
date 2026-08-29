import React, { useContext } from "react";
import type { ContentComponentProps } from "@src/types/models";
import { LinkContentBlock } from "./content-blocks";
import { DynamicContentContext } from "@contexts";
import { PopoverContentBlock } from "./content-blocks/popoverContentBlock";
import { NODE_DISPLAY_TYPES } from "@src/types/nodes";

export const LinkSelector = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { displayType, key } = node;
	const ctx = useContext(DynamicContentContext);

	const isPopover = (displayType === NODE_DISPLAY_TYPES.POPOVER);
	// 	return <LinkContentBlock key={key} componentData={componentData} />;
	// }

	if (ctx || !isPopover) {
		const onClick = isPopover ? (evt: React.MouseEvent) => {
			ctx.addContentNode(node);
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		} : undefined;

		return (
			<LinkContentBlock
				key={key}
				componentData={componentData}
				onClick={onClick}
			/>
		);
	}

	return (
		<PopoverContentBlock
			type={node.linkType}
			componentData={componentData}
		/>
	);
};
