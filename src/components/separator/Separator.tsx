import React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import styles from "./Separator.module.scss";
import classNames from "@lib/class-names";
import type { YSPComponentPropsWithChildren } from "types/components";
// import useClassNames from "@hooks/useClassNames";

interface SeparatorProps {
	readonly orientation?: "vertical" | "horizontal";
	readonly decorative?: boolean;
	readonly asChild?: boolean;
};

const Separator = ({
	orientation = "vertical",
	decorative = true,
	asChild,
	className,
}: YSPComponentPropsWithChildren<SeparatorProps>): JSX.Element => (
	<SeparatorPrimitive.Root
		asChild={asChild}
		decorative={decorative}
		orientation={orientation}
		className={classNames(styles.root, className)}
	/>
);

export default Separator;
export type { Separator };
