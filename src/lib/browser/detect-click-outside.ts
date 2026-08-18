export type Value = string | boolean | undefined | null;
export type ClassNameMapping = Record<string, boolean>;
// export interface ArgumentArray extends Array<Argument> {}
export type ArgumentArray = ReadonlyArray<Argument>;
export type Argument = Value | ClassNameMapping | ArgumentArray;
/**
 * A simple JavaScript utility for conditionally joining classNames together.
 */


export interface IClickOutsideOptions {
	readonly callback: () => unknown;
}

export interface IClickOutsideMonitor {
	clear(): void;
	addTargets(...els: HTMLElement[]): void;
	removeTargets(...els: HTMLElement[]): void;
}

const EVENTS = ["mousedown", "touchstart"];
class ClickOutsideMonitor implements IClickOutsideMonitor {
	private readonly _els: HTMLElement[] = [];
	private _listener: (evt: MouseEvent) => unknown;
	private _eventTarget: undefined | EventTarget;

	constructor({ callback }: IClickOutsideOptions) {
		if (typeof callback !== "function") {
			throw new Error(`detect click outside: Invalid callback `);
		}
		this._listener = (evt: MouseEvent) => {
			if (!this._els.length) {
				console.warn(`detect click outside: listener running with no elements`);
				return;
			}
			const trg = evt.target as Node;
			if (!trg?.nodeType) {
				return;
			}
			for (let ind = 0; ind < this._els.length; ++ind) {
				if (this._els[ind].contains(trg)) {
					return;
				}
			}
			callback();

		}
	}

	clear(): void {
		if (this._eventTarget) {
			EVENTS.forEach(evt => this._eventTarget.removeEventListener(evt, this._listener, true));
		}
		this._eventTarget = undefined;
		this._els.length = 0;
	}

	addTargets(...els: HTMLElement[]): void {
		const es = Array.from(els)
			.filter(e => e?.ownerDocument?.defaultView && !this._els.includes(e));
		if (es.length < 1) {
			return;
		}
		if (this._eventTarget) {
			const bad = es.filter(e => e.ownerDocument?.defaultView !== this._eventTarget);
			if (bad.length) {
				throw new Error(`detect click outside: ${bad.length} elements are not on the current window`);
			}
		}
		this._els.push(...es);
		if (this._els.length && !this._eventTarget) {
			this._eventTarget = this._els[0].ownerDocument.defaultView;
			EVENTS.forEach(evt => this._eventTarget!.addEventListener(evt, this._listener, true));
		}

	}
	removeTargets(...els: HTMLElement[]): void {
		Array.from(els).forEach(el => {
			if (this._els.includes(el)) {
				this._els.splice(this._els.indexOf(el), 1);
			}
		});
		if (this._els.length === 0 && this._eventTarget) {
			EVENTS.forEach(evt => this._eventTarget.removeEventListener(evt, this._listener, true));
			this._eventTarget = undefined;
		}

	}
	
}

function createDCO(options: IClickOutsideOptions): IClickOutsideMonitor {
	return new ClickOutsideMonitor(options);
}
export const createClickOutsideMonitor = createDCO;
