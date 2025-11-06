import { useEffect, useState } from "react";

export interface IUseMountedData {
	readonly mounted: boolean;
}

/**
 * A hook that turns to true on the first useEffect, providing an indication of mounting
 * on the client side
 * @returns an object with a `mounted` boolean prop
 */
export const useMountGuard = (): IUseMountedData => {
	const [mounted, setMounted] = useState(false);

	// If the node changed, reparse the attributes
	useEffect(() => {
		setMounted(true);
	}, []);

	return {
		mounted
	};
};
