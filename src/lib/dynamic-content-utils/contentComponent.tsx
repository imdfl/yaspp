import React from "react";
import { ContentIterator } from "./contentIterator";
import { MLNODE_TYPES } from "types/nodes";
import { LinkSelector } from "./linkSelector";
import {
	HeadingContentBlock,
	ListItemContentBlock,
	LineContentBlock,
	ParagraphContentBlock,
	FigureContentBlock,
	BlockquoteContentBlock,
	TableContentBlock,
	CustomImageContentBlock,
	CodeInlineContentBlock,
	CodeBlockContentBlock,
	ListContentBlock,
	TextContentBlock,
} from "./content-blocks";
import type { ContentComponentProps } from "types/models";
import { ErrorMessage } from "components/index";
import { CaseInsensitiveMap } from "../caseInsensitiveCollections";

const HTMLTypeMap = new CaseInsensitiveMap<MLNODE_TYPES>([
	["a", MLNODE_TYPES.LINK]
])

export const ContentComponent = ({
	componentData,
}: ContentComponentProps): React.JSX.Element => {
	const { node } = componentData;
	const { key, type } = node;

	if (!key) {
		console.warn("missing key on", node);
	}

	const props = { componentData };
	const renderType = HTMLTypeMap.get(type) || type;

	switch (renderType) {
		case MLNODE_TYPES.DEL:
		case MLNODE_TYPES.INS:
		case MLNODE_TYPES.STRONG:
		case MLNODE_TYPES.EM:
		case MLNODE_TYPES.TR:
		case MLNODE_TYPES.TD:
		case MLNODE_TYPES.TH:
		case MLNODE_TYPES.SUB:
		case MLNODE_TYPES.SUP:
		case MLNODE_TYPES.CITE:
		case MLNODE_TYPES.FIGCAPTION:
			return (
				<ContentIterator
					key={key}
					componentData={{ tag: type, ...componentData }}
				/>
			);
		case MLNODE_TYPES.LINK:
			return <LinkSelector key={key} {...props} />;
		case MLNODE_TYPES.TEXT:
			return <TextContentBlock key={key} {...props} />;
		case MLNODE_TYPES.PARAGRAPH:
			return <ParagraphContentBlock key={key} {...props} />;
		case MLNODE_TYPES.LINE:
			return <LineContentBlock key={key} {...props} />;
		case MLNODE_TYPES.CODE:
			return <CodeInlineContentBlock key={key} {...props} />;
		case MLNODE_TYPES.CODEBLOCK:
			return <CodeBlockContentBlock key={key} {...props} />;
		case MLNODE_TYPES.BLOCKQUOTE:
			return <BlockquoteContentBlock key={key} {...props} />;
		case MLNODE_TYPES.LIST:
			return <ListContentBlock key={key} {...props} />;
		case MLNODE_TYPES.LIST_ITEM:
			return <ListItemContentBlock key={key} {...props} />;
		case MLNODE_TYPES.IMAGE:
			return <CustomImageContentBlock key={key} {...props} />;
		case MLNODE_TYPES.FIGURE:
			return <FigureContentBlock key={key} {...props} />;
		case MLNODE_TYPES.TABLE:
			return <TableContentBlock key={key} {...props} />;
		case MLNODE_TYPES.HR:
			return <hr />;
		default:
			if (/heading/i.test(type)) {
				return <HeadingContentBlock key={key} {...props} />;
			}
			return <ErrorMessage message={`Type "${node.type}" not found`} />;
	}
};

export default ContentComponent;
