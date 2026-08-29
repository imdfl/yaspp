type AnyFunction = (...args: unknown[]) => (unknown | void);


type AnyCleanup = AnyFunction | IOnCleanup;

interface IAddCleanupOptions {
	func: AnyCleanup,
	id: string | null
};

export interface IOnCleanup {
	run(): void;
	/**
	 * Note that if you add an `IOnCleanup` instance, its run method will be duplicated if it already exists in this instance,
	 * but it won't do anything on calls after the first.
	 * @param options 
	 */
	add(options: AnyCleanup | IAddCleanupOptions): boolean;
	remove(idOrFunc: string | AnyCleanup): boolean;
	clear(): void;
	dispose(): void;
}

function toAnyCleanup(cleanup: unknown): AnyCleanup | null {
	if (!cleanup) {
		return null;
	}
	const t = typeof cleanup;
	if (t === "function") {
		return cleanup as AnyFunction;
	}
	if (t === "object" && typeof (cleanup as IOnCleanup).run === "function") {
		return cleanup as IOnCleanup;
	}
	return null;
}

class OnCleanup implements IOnCleanup {
	private readonly _callbacks: (AnyCleanup | null)[] = [];
	private readonly _namedCallbacks: Map<string, number> = new Map();

	public run(): void {
		console.log(`Running cleanup, number of callbacks ${this._callbacks.length}`);
		const fs = this._callbacks.filter(c => Boolean(c)); // remove nulls
		this.clear();
		const errors = [] as string[];
		fs.forEach(f => {
			try {
				if (typeof f === "function") {
					f();
				}
				else {
					f!.run();
				}
			}
			catch (err) {
				errors.push(String(err));
			}
		});
		if (errors.length) {
			console.warn(`OnCleanup Errors: ${errors.join('\n')} `);
		}
	}

	public clear(): void {
		this._callbacks.length = 0;
		this._namedCallbacks.clear();
	}


	public add(options: AnyCleanup | IAddCleanupOptions): boolean {
		if (!options) {
			console.warn("OnCleanup: cannot add a null callback");
			return false;
		}
		const func = toAnyCleanup(options);
		if (func) {
			const ind = this._callbacks.indexOf(func);
			if (ind >= 0) {
				console.warn(`on cleanup add: callback already registered`);
				return false;
			}
			this._callbacks.push(func);
			return true;

		}
		if (typeof options === "object") {
			const { func: rawFunc, id } = options as IAddCleanupOptions;
			const func = toAnyCleanup(rawFunc)
			if (!func) {
				console.warn(`on cleanup add: illegal function type ${typeof rawFunc}`);
				return false;
			}
			if (id) {
				if (typeof id !== "string") {
					console.warn(`on cleanup add: illegal id ${id}(${typeof id})`);
					return false;
				}
				if (this._namedCallbacks.has(id)) {
					console.log(`Overwriting oncleanup callback for id ${id}`);
					const ind = this._namedCallbacks.get(id)!;
					this._callbacks[ind] = func;
				}
				else {
					this._callbacks.push(func);
					this._namedCallbacks.set(id, this._callbacks.length - 1);
				}
				return true;
			}
			else {
				return this.add(func);
			}
		}
		console.warn(`Illegal parameter ${options}(${typeof options})`);
		return false;
	}

	public remove(idOrFunc: string | AnyCleanup): boolean {
		if (!idOrFunc) {
			console.warn(`on cleanup: parameter is neither an id or a function`);
			return false;
		}
		if (typeof idOrFunc === "string") {
			if (!this._namedCallbacks.has(idOrFunc)) {
				console.warn(`on Cleanup remove: unknown callback id ${idOrFunc}`);
				return false;
			}
			const ind = this._namedCallbacks.get(idOrFunc)!;
			this._callbacks[ind] = null;
			this._namedCallbacks.delete(idOrFunc);
			return true;
		}
		const cleanup = toAnyCleanup(idOrFunc);
		if (!cleanup) {
			console.warn(`on Cleanup remove: unknown parameter ${idOrFunc} of type ${typeof idOrFunc}`);
			return false;
		}

		const ind = this._callbacks.indexOf(cleanup);
		if (ind < 0) {
			console.warn(`on Cleanup remove: unknown callback`);
			return false;
		}
		this._callbacks[ind] = null;
		return true;
	}

	dispose(): void {
		this.clear();
	}
}

export const createOnCleanup = (): IOnCleanup => {
	return new OnCleanup();
}