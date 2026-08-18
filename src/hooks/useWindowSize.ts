import { useState, useEffect } from "react";

type WindowOrientation = "portrait" | "landscape";
interface IWindowSize {
	readonly width: number | undefined;
	readonly height: number | undefined;
	readonly orientation: WindowOrientation | undefined;
}

export function useWindowSize(): IWindowSize {
	// Initialize state with undefined width/height so server and client renders match
	// Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
	const [windowSize, setWindowSize] = useState<IWindowSize>({
		width: undefined,
		height: undefined,
		orientation: undefined
	});

	useEffect(() => {
		// Handler to call on window resize
		const query = window.matchMedia("orientation: portrait");
		function handleResize() {
			// Set window width/height to state
			setWindowSize({
				width: window.innerWidth,
				height: window.innerHeight,
				orientation: query?.matches ? "portrait" : "landscape"
			});
		}
		// Add event listener
		window.addEventListener("resize", handleResize);
		// Call handler right away so state gets updated with initial window size
		handleResize();
		// Remove event listener on cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []); // Empty array ensures that effect is only run on mount

	return windowSize;
}
