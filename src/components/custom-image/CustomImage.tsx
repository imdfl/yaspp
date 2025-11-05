import React from "react";
import styles from "./CustomImage.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";

type CustomImageProps = {
	src: string;
};

export const CustomImage = ({
	src,
	className,
}: YSPComponentPropsWithChildren<CustomImageProps>): JSX.Element => (
	<img className={classNames(styles.root, className)} src={src} />
);

export default CustomImage;
export type { CustomImageProps };
