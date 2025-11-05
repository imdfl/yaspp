import React, { SyntheticEvent } from "react";
import { Slot } from "@radix-ui/react-slot";
import type { YSPComponentPropsWithChildren } from "types/components";
import styles from "./Button.module.scss";
import useClassNames from "@hooks/useClassNames";
import ComponentContextProvider from "@contexts/componentContext";

type ButtonProps = {
	title?: string;
	asChild?: boolean;
	disabled?: boolean;
	onClick?: (e: SyntheticEvent | string | number | boolean) => void;
	type?: "submit";
};

const Button = ({
	asChild,
	disabled,
	children,
	className,
	partName,
	title,
	onClick,
	...props
}: YSPComponentPropsWithChildren<ButtonProps>) => {

	const Comp = asChild && typeof children !== "string" ? Slot : "button";
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: partName || "button",
	});

	return (
		<ComponentContextProvider parentPath={componentPath}>
			<Comp
				className={componentClass}
				onClick={(e: SyntheticEvent) => onClick?.(e)}
				disabled={disabled}
				title={title}
				{...props}
			>
				{children}
			</Comp>
		</ComponentContextProvider>
	);
};

export default Button;
export type { ButtonProps };
