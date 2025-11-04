import React from "react";
import styles from "./Logo.module.scss";
import classNames from "@lib/class-names";
import { useMountGuard } from "@hooks/useMountGuard";

type LogoProps = {
	mode: string;
	className?: string;
};

const Logo = ({ mode, className }: LogoProps) => {
	const { mounted } = useMountGuard();
	if (!mounted) {
		return null;
	}
	return (
		<div data-mode={mode} className={classNames(styles.root, className)} />
	);
};

export default Logo;
export type { LogoProps };
