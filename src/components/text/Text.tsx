import React from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./Text.module.scss";
import useClassNames from "@hooks/useClassNames";
import ComponentContextProvider from "@contexts/componentContext";
import type { YSPComponentPropsWithChildren } from "@src/types/components";

// type HeadingVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
// type SubtitleVariant = "subtitle1" | "subtitle2" | "subtitle3" | "subtitle4";
// type TextVariant = "body1" | "body2";

interface TextProps {
	readonly asChild?: boolean;
	// readonly variant?: TextVariant | HeadingVariant | SubtitleVariant;
	readonly italics?: boolean;
	readonly weight?: number;
	readonly locale?: string;
};

const Text = ({
	asChild,
	// variant,
	children,
	className,
}: YSPComponentPropsWithChildren<TextProps>) => {
	const Comp = asChild ? Slot : "span";
	const { componentClass, attributes } = useClassNames({
		classes: [styles.root, className],
		part: "text",
	});

	return (
			<Comp className={componentClass} {...attributes}>
				{children}
			</Comp>
	);
};

export default Text;
export type { TextProps /*, TextVariant, HeadingVariant, SubtitleVariant */};
