import { default as ModernDrawer } from "react-modern-drawer";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import ComponentContextProvider from "@contexts/componentContext";
import useClassNames from "@hooks/useClassNames";
import cx from "@lib/class-names";
import styles from "./Drawer.module.scss";

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
	return (
		<ComponentContextProvider relativePath="drawer">
			<ModernDrawer
				direction={direction}
				open={open}
				size={size}
				duration={duration}
				overlayOpacity={overlayOpacity}
				onClose={onClose}
				className={cx(styles.root, className)}
			>
				{children}
			</ModernDrawer>
		</ComponentContextProvider>
	)
};

export default Drawer;

export type { DrawerProps };
