import React, { PropsWithChildren, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getIcon } from "@components/icons";
import { Button, ToolbarItem } from "..";
import PopoverTrigger from "./PopoverTrigger";
import PopoverDialog from "./PopoverDialog";
import useClassNames from "@hooks/useClassNames";
import { ComponentContextProvider } from "@contexts";
import { createDialogHandler } from "@lib/browser/dialog-utils";

import styles from "./Popover.module.scss";

type CustomPopoverProps = {
	trigger: React.ReactNode;
	side: 'top' | 'right' | 'bottom' | 'left';
	locale: string;
	toolbarItems?: React.ReactNode[];
	open?: boolean;
};

const Popover = ({
	open,
	trigger,
	side,
	locale,
	toolbarItems,
	children,
}: PropsWithChildren<CustomPopoverProps>) => {
	const [isVisible, setIsVisible] = useState(open);
	const { createSubClass } = useClassNames({
		part: "dialog",
		classes: [styles.dialog],
	})
	const dialogHandler = useMemo(() => {
		return createDialogHandler({
			closeSelector: "",
			dragSelector: "",
		})
	}, []);
	const buttonRef = useRef<HTMLButtonElement>(null);


	useLayoutEffect(() => {
		if (isVisible) {
			dialogHandler.show({
				anchor: buttonRef.current,
				modal: true
			})
		}
		else {
			dialogHandler.close();
		}
	}, [dialogHandler, isVisible])

	return (
		<>
			<button
				ref={buttonRef}
				onClick={() => setIsVisible(!isVisible)}
				className={styles.trigger}
			>
				<PopoverTrigger opened={isVisible}>{trigger}</PopoverTrigger>
			</button>

			<PopoverDialog dialogHandler={dialogHandler}>
				{toolbarItems && (
					<ComponentContextProvider relativePath="toolbar" >

						<div className={createSubClass("toolbar", styles.toolbar)}>
							<div className={styles.panel}>{toolbarItems}</div>
							<div className={styles.closeButton}>
								<ToolbarItem>
									<Button
										onClick={() => setIsVisible(false)}
										className={styles.close}
									>
										{getIcon('close')}
									</Button>
								</ToolbarItem>
							</div>
						</div>
					</ComponentContextProvider>
				)}
				{children}
			</PopoverDialog>
			{/* <PopoverPrimitive.Arrow /> */}
		</>
	);
};

export default Popover;
