import React, { PropsWithChildren, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getIcon } from "@components/icons";
import { Button } from "..";
import PopoverTrigger from "./PopoverTrigger";
import PopoverDialog from "./PopoverDialog";
import useClassNames from "@hooks/useClassNames";
import { ComponentContextProvider } from "@contexts";
import type { IDialogRelativePosition } from "@lib/browser/dialog-utils";
import { createDialogHandler } from "@lib/browser/dialog-utils";

import styles from "./Popover.module.scss";

type CustomPopoverProps = {
	trigger: React.ReactNode;
	toolbarItems?: React.ReactNode[];
	// open?: boolean;
	position?: Partial<IDialogRelativePosition>;
};

const Popover = ({
	// open,
	trigger,
	position,
	toolbarItems,
	children,
}: PropsWithChildren<CustomPopoverProps>) => {
	const [isOpen, setIsOpen] = useState(false);
	const { createSubClass } = useClassNames({
		part: "dialog",
		classes: [styles.dialog],
	})
	const buttonRef = useRef<HTMLButtonElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const onDialogClose = useCallback(() => {
		setIsOpen(false);
	}, [])


	const dialogHandler = useMemo(() => {
		return createDialogHandler({
			closeSelector: "",
			dragSelector: `.${styles.toolbar}`,
			dragClass: styles.dragging,
			openClass: styles.open,
			onClose: onDialogClose
		})
	}, []);

	const openDialog = useCallback(() => {
		setIsOpen(true);
	}, []);


	useEffect(() => {
		if (isOpen && dialogRef.current) {
			dialogHandler.attach(dialogRef.current);
			dialogHandler.show({
				anchor: buttonRef.current,
				modal: true,
				position
			})
		}
		return () => {
			console.log(`Popover cleanup: detaching dialog`);
			dialogHandler.close();
			dialogHandler.detach();
		}

	}, [isOpen, dialogRef])

	return (
		<>
			<button
				ref={buttonRef}
				onClick={() => openDialog()}
				className={styles.trigger}
			>
				<PopoverTrigger opened={isOpen}>{trigger}</PopoverTrigger>
			</button>

			{isOpen && (<PopoverDialog dialogRef={dialogRef} className={styles.root}>
				{toolbarItems && (
					<ComponentContextProvider relativePath="toolbar" >

						<div className={createSubClass("toolbar", styles.toolbar)}>
							<div className={styles.panel}>{toolbarItems}</div>
							<div className={styles.closeButton}>
								{/* <ToolbarItem> */}
									<Button
										onClick={() => setIsOpen(false)}
										className={styles.close}
									>
										{getIcon('close')}
									</Button>
								{/* </ToolbarItem> */}
							</div>
						</div>
					</ComponentContextProvider>
				)}
				{children}
			</PopoverDialog>)
			}
			{/* <PopoverPrimitive.Arrow /> */}
		</>
	);
};

export default Popover;
