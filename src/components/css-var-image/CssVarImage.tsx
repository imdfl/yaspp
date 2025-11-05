import React from "react";
import styles from "./CssVarImage.module.scss";
import classNames from "@lib/class-names";
import { getCustomStyle } from "./helpers";
import type { YSPComponentPropsWithChildren } from "types/components";

interface CssVarImageProps {
	readonly varName: string;
	readonly size?: string;
};

const CssVarImage = ({ varName, size, className }: YSPComponentPropsWithChildren<CssVarImageProps>) => (
	<>
		<style>{getCustomStyle(styles, varName, size)};</style>
		<span className={classNames(styles.root, className)}></span>
	</>
);

export default CssVarImage;
export type { CssVarImageProps };
