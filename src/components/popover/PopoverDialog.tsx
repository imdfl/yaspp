import { useContext } from "react";
import { createPortal } from "react-dom";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { ComponentContextProvider, LocaleContext } from "@contexts";
import useClassNames from "@hooks/useClassNames";

import styles from "./PopoverDialog.module.scss";

interface IPopoverDialogOptions extends YSPComponentPropsWithChildren {
	readonly dialogRef: React.RefObject<HTMLDialogElement>;
}

const PopoverDialog = ({
	className,
	currentPath,
	children,
	dialogRef
}: IPopoverDialogOptions) => {
	// const { textDirection } = useContext(LocaleContext);
	// const dialogRef = useRef<HTMLDialogElement>(null);
	const { textDirection } = useContext(LocaleContext);
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, styles.modal, className],
		part: "dialog",
		currentPath
	});

	return (
		<ComponentContextProvider parentPath={componentPath}>
			{createPortal(
				<dialog dir={textDirection} ref={dialogRef} className={componentClass} closedby="any" popover="auto">{children}</dialog>,
				document.body)
			}
			{/* <div className={componentClass} dir={textDirection}>{children}</div> */}
		</ComponentContextProvider>
	);
};

export default PopoverDialog;
