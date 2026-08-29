import { useContext, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { YSPComponentPropsWithChildren } from "@src/types/components";
import { ComponentContextProvider, LocaleContext } from "@contexts";
import useClassNames from "@hooks/useClassNames";
import { IDialogHandler } from "@lib/browser/dialog-utils";

import styles from "./PopoverDialog.module.scss";

interface IPopoverDialogOptions extends YSPComponentPropsWithChildren {
	readonly dialogHandler: IDialogHandler;
}

const PopoverDialog = ({
	className,
	currentPath,
	children,
	dialogHandler
}: IPopoverDialogOptions) => {
	// const { textDirection } = useContext(LocaleContext);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const { componentClass, componentPath } = useClassNames({
		classes: [styles.root, styles.modal, className],
		part: "dialog",
		currentPath
	});
	useEffect(() => {
		dialogHandler?.attach(dialogRef.current);
		return () => {
			dialogHandler?.detach()
		}
	}, [dialogRef, dialogHandler])

	return (
		<ComponentContextProvider parentPath={componentPath}>
			{
				createPortal(<dialog ref={dialogRef} className={componentClass} closedby="any" popover="auto">{children}</dialog>, document.body)
			}
			{/* <div className={componentClass} dir={textDirection}>{children}</div> */}
		</ComponentContextProvider>
	);
};

export default PopoverDialog;
