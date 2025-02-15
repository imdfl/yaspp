import React, { useContext } from 'react';
import type { ContentComponentProps } from 'types/models';
import { LinkContentBlock } from './content-blocks';
import { DynamicContentContext } from '@contexts/contentContext';
import { PopoverContentBlock } from './content-blocks/popoverContentBlock';
import { NODE_DISPLAY_TYPES } from 'types/nodes';

export const LinkSelector = ({
	componentData,
}: ContentComponentProps): JSX.Element => {
	const { node } = componentData;
	const { displayType, key } = node;
	const ctx = useContext(DynamicContentContext);

	if (displayType !== NODE_DISPLAY_TYPES.POPOVER) {
		return <LinkContentBlock key={key} componentData={componentData} />;
	}

	if (ctx) {
		const onClick = (evt: React.MouseEvent) => {
			ctx.addContentNode(node);
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		};

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
			data-testid={`${node.linkType}_${node.target.split(`/`)[1]}`}
		/>
	);
};
