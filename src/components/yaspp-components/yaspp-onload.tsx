import React from 'react';

function onLoadRef(node: HTMLElement) {
	if (!node?.ownerDocument) {
		return;
	}
	const head = node.ownerDocument.head ?? node.ownerDocument.querySelector("head");
	if (head) {
		const toMove = head.querySelectorAll("[data-yaspp-position='last']");
		// move all these elements to the end of their parent
		Array.from(toMove).forEach(lnk => {
			lnk.parentNode?.appendChild(lnk);
		})
	}
};

/**
 * Used to mimic document onload. Place this component at the end of your layout
 * @returns 
 */
const YasppOnload = (): JSX.Element => {
	return (
		<span ref={onLoadRef} data-yaspp-stub></span>
	);
};

export default YasppOnload;
