import { AnyFunction } from "@src/types";
import { IAddRemoveClasses, saveCSSProperties } from "./css-property-saver";
import { createOnCleanup, IOnCleanup } from "./on-cleanup";

interface IMargin {
	readonly x: number,
	readonly y: number
}

interface DialogRelativePosition {
	readonly h: "right" | "left" | "center";
	readonly v: "top" | "bottom" | "center";
}

export interface IDialogOptions {
	// readonly isPopover: boolean;
	readonly dragSelector: string;
	readonly closeSelector: string;
	readonly screenMargin: IMargin;
	readonly looseDragging: boolean;
}

export interface IShowDialogOptions {
	readonly anchor: HTMLElement;
	readonly modal: boolean;
	readonly position: Partial<DialogRelativePosition>;
}

interface IAttachDialogOptions extends Omit<IDialogOptions, "position"> {
	readonly close: AnyFunction;
}

function getTopLeft(el: HTMLElement) {
	const cs = window.getComputedStyle(el);
	return {
		top: parseInt(cs.getPropertyValue("top")) || 0,
		left: parseInt(cs.getPropertyValue("left")) || 0
	};
}

function positionWithoutMargin(el: HTMLElement) {
	const rect = el.getBoundingClientRect();
	el.style.setProperty("margin", "0");
	const postRect = el.getBoundingClientRect();
	const { top, left } = getTopLeft(el);
	const newTop = Math.round(rect.y - postRect.y + top);
	const newLeft = Math.round(rect.x - postRect.x + left);
	el.style.setProperty("top", newTop ? `${newTop}px` : "0");
	el.style.setProperty("left", newLeft ? `${newLeft}px` : "0");
}

function addTranslate(el: HTMLElement, options: { dx: number, dy: number, current?: string }) {
	const { current, dx, dy } = options;
	const cur = current ?? el.style.transform;
	let idx = Math.round(dx);
	let idy = Math.round(dy);
	if (idx || idy) {
		const tr = `translate(${idx}px, ${idy}px)`;
		el.style.transform = cur ? `${cur} ${tr}` : tr;
	}
}

function positionRelative(anchor: HTMLElement, target: HTMLElement, { h: hDirection, v: vDirection }: DialogRelativePosition) {
	const anchorRect = anchor.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const anchorMiddleX = anchorRect.left + anchorRect.width * 0.5;
	const anchorMiddleY = anchorRect.top + anchorRect.height * 0.5;
	const targetEdgeX = hDirection === "left" ?
		targetRect.right
		: hDirection === "center" ? targetRect.left + (targetRect.width / 2)
			: targetRect.left;
	const targetEdgeY = vDirection === "top" ?
		targetRect.bottom
		: vDirection === "center" ? targetRect.top + (targetRect.height / 2)
			: targetRect.top;

	addTranslate(target, {
		dx: anchorMiddleX - targetEdgeX,
		dy: anchorMiddleY - targetEdgeY
	});
}

function fixScreenPosition(el: HTMLElement, margin: { x: number, y: number }) {
	const parent = el.offsetParent || el.ownerDocument?.documentElement;
	if (!parent) {
		return;
	}

	const elementRect = el.getBoundingClientRect();
	const rawParentRect = parent.getBoundingClientRect();
	const marginX = Math.round(margin?.x || 0),
		marginY = Math.round(margin?.y || 0);
	const parentRect = {
		left: rawParentRect.left + marginX,
		right: rawParentRect.right - marginX,
		top: rawParentRect.top + marginY,
		bottom: rawParentRect.bottom - marginY
	}
	let dx = 0;
	let dy = 0;

	if (elementRect.left < parentRect.left) {
		dx = parentRect.left - elementRect.left;
	}
	else if (elementRect.right > parentRect.right) {
		dx = parentRect.right - elementRect.right;
	}
	if (elementRect.top < parentRect.top) {
		dy = parentRect.top - elementRect.top;
	}
	else if (elementRect.bottom > parentRect.bottom) {
		dy = parentRect.bottom - elementRect.bottom;
	}
	addTranslate(el, {
		dx, dy
	});
}

function resetPropsOnClose(dlg: HTMLElement, classes?: Partial<IAddRemoveClasses>): AnyFunction {
	const reset = saveCSSProperties(dlg, {
		props: {
			transform: null,
			top: null,
			left: null,
			margin: null
		},
		classes
	})
	return reset;
}


function attachDialogHandlers(dlg: HTMLDialogElement,
	{ dragSelector, closeSelector, close, looseDragging = false }: Partial<IAttachDialogOptions>
): IOnCleanup {
	const onCleanup = createOnCleanup();
	if (closeSelector) {
		if (typeof close === "function") {
			dlg.querySelectorAll(closeSelector).forEach(el => {
				const handler = () => {
					close();
				};
				onCleanup.add(attachEventListener(el, "click", handler));
			})
		}
		else {
			console.warn(`attach dialog handlers: close selector provided with no valid close function (${typeof close})`);
		}
	}
	if (!dragSelector) {
		return onCleanup;
	}
	// const dlg = document.getElementById("modal") as HTMLDialogElement;
	const toolbar = dlg.querySelector<HTMLElement>(dragSelector);
	if (!toolbar) {
		console.warn(`attachDialogHandlers: draggable element ${dragSelector} not found in`, dlg);
		return onCleanup;
	}
	onCleanup.add(saveCSSProperties(toolbar, {
		attributes: {
			draggable: "true"
		}
	}));

	const dragHandler = (evt: DragEvent) => {
		evt.preventDefault();
		evt.stopPropagation();
		const onDragCleanup = createOnCleanup();

		positionWithoutMargin(dlg);
		const resets = [
			saveCSSProperties(toolbar, {
				classes: {
					add: ["dragging", "toolbar"]
				}
			}),
			saveCSSProperties(dlg, {
				props: {
					userSelect: "none",
					transform: null
				}

			})
		];
		resets.forEach(reset => onDragCleanup.add(reset));

		const curX = evt.clientX, curY = evt.clientY;
		const curTransform = dlg.style.getPropertyValue("transform");
		let lastDX: number | null = null,
			lastDY: number | null = null;

		const trackMousePosition = (event: MouseEvent) => {
			lastDX = event.clientX - curX;
			lastDY = event.clientY - curY;
			addTranslate(dlg, {
				dx: lastDX, dy: lastDY, current: curTransform
			});
		}

		const stopTracking = () => {
			onDragCleanup.run();
			if (lastDX !== null) {
				const { top, left } = getTopLeft(dlg);
				dlg.style.top = `${top + lastDY!}px`;
				dlg.style.left = `${left + lastDX}px`;
			}
		}

		onDragCleanup.add(attachEventListener<Document>(window.document, "mousemove", trackMousePosition));
		onDragCleanup.add(attachEventListener(window.document, "pointerup", () => {
			stopTracking();
		}, { once: true }));
	};

	const downHandler = (evt: MouseEvent) => {
		const downCleanup = createOnCleanup();
		toolbar.addEventListener("pointerup", () => {
			downCleanup.run();
		}, { once: true })
		if (looseDragging || evt.target === toolbar) {
			downCleanup.add(attachEventListener(toolbar, "dragstart", dragHandler, { once: true }));
		}
		else {
			const abort = (evt: DragEvent) => {
				evt.preventDefault();
				evt.stopPropagation();
			}
			downCleanup.add(attachEventListener(toolbar, "dragstart", abort, { once: true }));
		}
	}

	onCleanup.add(attachEventListener(toolbar, "pointerdown", downHandler));

	return onCleanup;
}

export interface IDialogHandler {
	attach(el?: HTMLDialogElement | null): IDialogHandler;
	/**
	 * 
	 * @param close Defaults to false, if true and there's an attached dialog, close it
	 */
	detach(close?: boolean): IDialogHandler;
	show(options: Partial<IShowDialogOptions>): void;
	close(): void;
}

class DialogHandler implements IDialogHandler {
	private _dialog: HTMLDialogElement | null = null;
	private readonly _options: IDialogOptions;
	private _close: AnyFunction | null = null;
	private readonly _onCleanup: IOnCleanup;
	private readonly _onShowCleanup: IOnCleanup;
	private _isOpen = false;

	constructor(options: Partial<IDialogOptions>) {
		this._options = {
			looseDragging: options.looseDragging ?? false,
			closeSelector: options.closeSelector ?? "",
			dragSelector: options.dragSelector ?? "",
			screenMargin: {
				x: options.screenMargin?.x ?? 20,
				y: options.screenMargin?.y ?? 20
			}
		}
		this._onCleanup = createOnCleanup();
		this._onShowCleanup = createOnCleanup();
	}

	public attach(el?: HTMLDialogElement | null): IDialogHandler {
		if (el !== this._dialog) {
			this.detach();
			this._dialog = el ?? null;
			this._isOpen = Boolean(el && el.hasAttribute("open"))
			if (el) {
				const onClose = () => {
					this._isOpen = false;
					this._onShowCleanup.run();
				}
				const onToggle = (evt: ToggleEvent) => {
					if (evt?.newState === "open") {
						this._isOpen = true;
					}
					else {
						onClose();
					}
				}
				this._onCleanup.add(attachEventListener(el, "close", onClose));
				this._onCleanup.add(attachEventListener(el, "toggle", onToggle));
			}
		}
		return this;
	}

	public detach(): IDialogHandler {
		if (this._dialog) {
			this._dialog = null;
			this._onShowCleanup.run();
		}
		this._isOpen = false;
		this._onCleanup.run();
		return this;
	}

	public show({ anchor, modal, position }: Partial<IShowDialogOptions>): void {
		if (this._isOpen) {
			console.warn(`dialog show: already shown`);
			return;
		}
		const dlg = this._dialog;
		if (!dlg) {
			throw new Error(`Dialog handler show: no dialog element`);
		}
		this._isOpen = true;

		this._onShowCleanup.add(resetPropsOnClose(dlg, { add: ["open"] }));
		this._onShowCleanup.add(attachDialogHandlers(dlg, {
			...this._options,
			close: () => this.close()
		}));
		if (anchor) {
			return this._popover(anchor, position);
		}

		this._close = () => {
			dlg.close();
		}
		if (modal) {
			dlg.showModal();
		}
		else {
			dlg.show();
		}
	}

	public close(): void {
		if (!this._isOpen) {
			return;
		}
		this._isOpen = false;
		const cl = this._close;
		if (cl) {
			this._close = null;
			cl();
		}
		this._onShowCleanup.run();
	}

	private _popover(anchor: HTMLElement, position?: Partial<DialogRelativePosition>): void {
		const pos = {
			h: position?.h ?? "right",
			v: position?.v ?? "bottom"
		};
		const dlg = this._dialog!;
		this._close = () => {
			(dlg as HTMLElement).hidePopover();
			this._onShowCleanup.run();
		}
		dlg.showPopover({
			// source: anchor
		})
		positionRelative(anchor, dlg, pos);
		fixScreenPosition(dlg, this._options.screenMargin);
	}
}



export const createDialogHandler = (options: Partial<IDialogOptions>): IDialogHandler => {
	return new DialogHandler(options);
}

export function attachEventListener<TTarget extends EventTarget = EventTarget>(
	el: TTarget,
	type: string,
	listener: AnyFunction,
	options?: boolean | AddEventListenerOptions
): AnyFunction {
	el.addEventListener(type, listener, options);
	return () => {
		el.removeEventListener(type, listener, options);
	};
}

