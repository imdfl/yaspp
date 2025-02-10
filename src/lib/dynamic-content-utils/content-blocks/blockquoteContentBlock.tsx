import React from 'react';
import { ContentComponentProps } from 'types/models';
import { useComponentAttrs } from '../../../hooks/useComponentAttrs';
import { Blockquote, Paragraph } from 'components/index';
import { renderNodes } from 'lib/dynamicContentHelpers';

export const BlockquoteContentBlock = ({
	componentData,
}: ContentComponentProps): JSX.Element => {
	const { node } = componentData;
	const { attributes, style } = useComponentAttrs(node);
	const { key, children } = node;
	return (
		<Blockquote key={key} {...attributes} style={style}>
			<Paragraph>{renderNodes(children)}</Paragraph>
		</Blockquote>
	);
};
