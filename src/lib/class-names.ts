export type Value = string | boolean | undefined | null;
export type ClassNameMapping = Record<string, boolean>;
// export interface ArgumentArray extends Array<Argument> {}
export type ArgumentArray = ReadonlyArray<Argument>;
export type Argument = Value | ClassNameMapping | ArgumentArray;
/**
 * A simple JavaScript utility for conditionally joining classNames together.
 */
function _classNames(classes: string[], ...args: Argument[]): string[] {

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg) {
			const argCls = parseValue(arg, classes);
			if (argCls.length) {
				if (typeof argCls === "string") {
					toggleClass(classes, argCls, true);
				}
				else {
					argCls.forEach(c => toggleClass(classes, c, true));
				}
			}
		}
	}

	return classes;
}

function isMapping(arg: unknown): boolean {
	if (!arg || typeof arg !== "object") {
		return false;
	}
	const ents = Object.entries(arg as ClassNameMapping);
	if (ents.length < 1) {
		return false;
	}
	const ind = ents.findIndex(([cls, isOn]) => {
		return !cls
		|| typeof cls !== "string"
		|| typeof isOn !== "boolean"
	});
	return ind < 0;
}

function toggleClass(classes: string[], cls: string, state: boolean): string[] {
	const c = cls?.trim();
	if (c) {
		const ind = classes.indexOf(c);
		if (ind >= 0 && !state) {
			classes.splice(ind, 1);
		}
		else if (ind < 0 && state) {
			classes.push(c);
		}
	}
	return classes;
}

function parseValue (arg: Argument, classes: string[]): string | string[] {
	if (typeof arg === 'string') {
		return arg;
	}

	if (typeof arg !== 'object') {
		return "";
	}

	if (Array.isArray(arg)) {
		return _classNames(classes, ...(arg as ArgumentArray));
	}
	if (isMapping(arg)) {
		Object.entries(arg as ClassNameMapping)
			.forEach(([cls, isOn]) =>  {
				toggleClass(classes, cls, isOn);
			});
		return "";
	}

	const cls = arg.toString?.();// eslint-disable-line @typescript-eslint/no-base-to-string
	if (cls?.[0] && cls[0] !== '[') {
		return cls;
	}


	return "";
}



export default function classNames(...args: Argument[]): string {
	const classes = _classNames([], ...args);
	return classes.join(' ');
}
