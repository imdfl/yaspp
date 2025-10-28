import React, { useEffect, useState } from "react";
import { ContentComponentProps, IMLParsedNode, INodeAttributeData, NodeAttributeMap } from "types/models";
import { ContentIterator } from "../contentIterator";
import { Link } from "components/index";
import { Nullable } from "types";
import { useComponentAttrs } from "@hooks/index";

export interface ILinkProps extends ContentComponentProps {
	onClick?: (evt: React.MouseEvent) => boolean;
}

const isAnchor = (target: string) => target?.[0] === "#";

function nodeDataToAttributes(node: IMLParsedNode, attributes: NodeAttributeMap): NodeAttributeMap {
	const defaults = {
		target: "_blank",
		rel: "noreferrer",
		href: ""
	};
	const attrs: Record<string, string> = {};
	if (attributes && Object.keys(attributes).length) {
		Object.assign(attrs, defaults, attributes);
	}
	else {
		if (!isAnchor(node.target)) {
			Object.assign(attrs, defaults);
		}
		attrs.href = node.target;
	}
	attrs.href = attrs.href || "";
	return attrs;
}

export const LinkContentBlock = ({
	componentData,
	onClick,
}: ILinkProps): JSX.Element => {
	const { node } = componentData;
	const { attributes, style } = useComponentAttrs(node);

	const [linkData, setLinkData] = useState<Nullable<INodeAttributeData>>(null);

	useEffect(() => {
		const attrs = nodeDataToAttributes(node, attributes); // odd compiler error, passes build
		setLinkData({
			attributes: attrs,
			style
		});
	}, [node, attributes, style])

	return linkData ? (
		<Link onClick={onClick} {...linkData.attributes} style={linkData.style}>
			<ContentIterator componentData={componentData} />
		</Link>
	) : (<></>)
};
