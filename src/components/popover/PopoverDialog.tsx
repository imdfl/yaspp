import { useContext } from "react";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { ComponentContextProvider, LocaleContext } from "@contexts";
import useClassNames from "@hooks/useClassNames";

import styles from "./PopoverDialog.module.scss";

const PopoverDialog = ({
	className,
	currentPath,
	children,
}: YSPComponentPropsWithChildren) => {
	const { textDirection } = useContext(LocaleContext);
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, className],
		part: "dialog",
		currentPath
	});

	return (
		<ComponentContextProvider parentPath={componentPath}>
			<div className={componentClass} dir={textDirection}>{children}</div>
		</ComponentContextProvider>
	);
};

export default PopoverDialog;
