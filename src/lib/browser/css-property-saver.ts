
type CSSRestoreFunction = () => unknown;

export interface IAddRemoveClasses {
	readonly add: readonly string[];
	readonly remove: readonly string[]
}
export interface ISaveCSSPropertiesOptions {
	readonly props: Record<string, string | null>;
	readonly classes: Partial<IAddRemoveClasses>;
	readonly attributes: Record<string, unknown>;

}

export function saveCSSProperties(root: HTMLElement, { 
	props, classes, attributes
}: Partial<ISaveCSSPropertiesOptions>): CSSRestoreFunction {
	const savedProps: Record<string, string> = {};
	const savedAttrs: Record<string, string | null> = {};
	const add = classes?.add?.filter(cls => !root.classList.contains(cls)) ?? [];
	const remove = classes?.remove?.filter(cls => root.classList.contains(cls)) ?? [];
	if (props) {
		Object.entries(props).forEach(([key, value]) => {
			savedProps[key] = root.style.getPropertyValue(key);
			if (value !== null) {
				root.style.setProperty(key, value);
			}
		})
	}

	if (attributes) {
		Object.entries(attributes).forEach(([key, value]) => {
			savedAttrs[key] = root.getAttribute(key);
			if (value !== null) {
				root.setAttribute(key, String(value));
			}
		})
	}
	add.forEach(cls => {
		root.classList.add(cls);
	});
	remove.forEach(cls => {
		root.classList.remove(cls);
	});

	const reset = () => {
		Object.entries(savedProps).forEach(([key, value]) => {
			if (value) {
				root.style.setProperty(key, value);
			}
			else {
				root.style.removeProperty(key);
			}
		});

		Object.entries(savedAttrs).forEach(([key, value]) => {
			if (value === null) {
				root.removeAttribute(key);
			}
			else {
				root.setAttribute(key, value);
			}
		})

		if (!root.style.cssText) {
			root.removeAttribute("style");
		}
		remove.forEach(cls => root.classList.add(cls));
		add.forEach(cls => root.classList.remove(cls));
	}
	return reset;
}


