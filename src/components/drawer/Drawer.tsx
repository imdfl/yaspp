import React from "react";
import { default as ModernDrawer } from "react-modern-drawer";
import styles from "./Drawer.module.scss";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";
import type { YSPComponentPropsWithChildren } from "types/components";

type DrawerProps = {
	open: boolean;
	direction: "left" | "right" | "top" | "bottom";
	duration?: number;
	enableOverlay?: boolean;
	lockBackgroundScroll?: boolean;
	overlayOpacity?: number;
	overlayColor?: string;
	size?: number | string;
	zIndex?: number;
	onClose?: () => void;
};

const Drawer = ({
	open,
	direction = "right",
	size = 350,
	duration = 300,
	overlayOpacity = 0.5,
	onClose,
	children,
	className,
}: YSPComponentPropsWithChildren<DrawerProps>) => {
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "drawer",
	});
	return (
		<ComponentContextProvider parentPath={componentPath}>
			<ModernDrawer
				direction={direction}
				open={open}
				size={size}
				duration={duration}
				overlayOpacity={overlayOpacity}
				onClose={onClose}
				className={componentClass}
			>
				{children}
			</ModernDrawer>
		</ComponentContextProvider>
	)
};

export default Drawer;

export type { DrawerProps };
