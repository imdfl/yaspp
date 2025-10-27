import React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { ScrollAreaScrollbarVisibleProps } from "@radix-ui/react-scroll-area";
import type { TextDirection } from "types/locale";
import type { IYSPComponentProps } from "types/components";
import styles from "./Scrollbar.module.scss";
import useClassNames from "@hooks/useClassNames";
import ComponentContextProvider from "@contexts/componentContext";

type ScrollbarProps = {
	height?: string;
	textDirection: TextDirection;
} & IYSPComponentProps & ScrollAreaScrollbarVisibleProps;

const Scrollbar = ({
	children,
	height,
	textDirection,
	className,
	...rest
}: ScrollbarProps) => {
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "scrollbar",
	});

	return (
		<ComponentContextProvider parentPath={componentPath}>
			<ScrollAreaPrimitive.Root
				className={componentClass}
				type="always"
				dir={textDirection}
				style={{ height }}
			>
				<ScrollAreaPrimitive.Viewport className={styles.viewport} {...rest}>
					{children}
				</ScrollAreaPrimitive.Viewport>
				<ScrollAreaPrimitive.Scrollbar
					className={styles.scrollbar}
					orientation="vertical"
				>
					<ScrollAreaPrimitive.Thumb className={styles.thumb} />
				</ScrollAreaPrimitive.Scrollbar>
				<ScrollAreaPrimitive.Scrollbar
					className={styles.scrollbar}
					orientation="horizontal"
				>
					<ScrollAreaPrimitive.Thumb className={styles.thumb} />
				</ScrollAreaPrimitive.Scrollbar>
				<ScrollAreaPrimitive.Corner className={styles.scrollAreaCorner} />
			</ScrollAreaPrimitive.Root>
		</ComponentContextProvider>
	);
}

export default Scrollbar;
export type { ScrollbarProps };
