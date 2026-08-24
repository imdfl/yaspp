import React, { useEffect, useState } from "react";
import type { CSSTextSize } from "@styles/types";
import cx from "@lib/class-names";
import styles from "./LoadingIndicator.module.scss";

type LoadingIndicatorProps = {
	/**
	 * Number of MILLISECONDS to wait before displaying
	 */
	readonly delay: number;
	readonly size?: CSSTextSize
	readonly label?: string;
};

const LoadingIndicator = ({
	delay,
	size = "md",
	label,
}: LoadingIndicatorProps): React.JSX.Element => {
	const [show, setShow] = useState(false);

	useEffect(() => {
		let removed = false;

		setTimeout(() => {
			if (!removed) {
				setShow(true);
			}
		}, Math.round(delay));

		return () => {
			removed = true;
		};
	}, [delay]);

	if (!show) {
		return <></>;
	}
	const sizeCls = `size-${size}`;
	return (
		<div className={cx(styles[sizeCls], styles.root)}>
			<div className={cx(styles[sizeCls], styles.image)}></div>
			{label && <div className={cx(styles[sizeCls], styles.label)}>{label}</div>}
		</div>
	);
};

export default LoadingIndicator;
export type { LoadingIndicatorProps };
