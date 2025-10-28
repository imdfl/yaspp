import React, { PropsWithChildren } from "react";
import { Slot } from "@radix-ui/react-slot";
import styles from "./Text.module.scss";
import useClassNames from "@hooks/useClassNames";
import ComponentContextProvider from "@contexts/componentContext";

type HeadingVariant = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type SubtitleVariant = "subtitle1" | "subtitle2" | "subtitle3" | "subtitle4";
type TextVariant = "body1" | "body2";

type TextProps = {
	asChild?: boolean;
	variant?: TextVariant | HeadingVariant | SubtitleVariant;
	italics?: boolean;
	weight?: number;
	locale?: string;
	className?: string;
};

const Text = ({
	asChild,
	variant,
	children,
	className,
}: PropsWithChildren<TextProps>) => {
	const Comp = asChild ? Slot : "span";
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "text",
	});

	return (
		<ComponentContextProvider parentPath={componentPath}>
			<Comp data-variant={variant} className={componentClass}>
				{children}
			</Comp>
		</ComponentContextProvider>
	);
};

export default Text;
export type { TextProps, TextVariant, HeadingVariant, SubtitleVariant };
