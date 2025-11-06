import { useEffect, useState } from "react";
import { IMLParsedNode, INodeAttributeData } from "types/models";
import { mlNextBrowserUtils } from "../lib/next-runtime-utils/nextRunetimeUtils";


/**
 * Returns an object with the sanitized attribute map of the node
 * Guaranteed not null
 * @param node
 * @returns
 */
export const useComponentAttrs = (
	node: IMLParsedNode
): INodeAttributeData => {
	const [nodeData, setNodeData] = useState<INodeAttributeData>({ attributes: {}, style: {}});

	// If the node changed, reparse the attributes
	useEffect(
		() => setNodeData(mlNextBrowserUtils.extractNodeAttributes(node)),
		[node]
	);

	return {
		...nodeData
	};
};
