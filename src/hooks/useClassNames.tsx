import { useContext, useEffect, useState } from "react";
import { PageContext, ComponentContext } from "@contexts/index";
import classNames from "@lib/class-names";
import { ComponentPath } from "types/components";

export interface IClassNamesData {
	readonly componentClass: string;
	readonly componentPath: ComponentPath;
	readonly parentPath: ComponentPath;
}

export interface IUserClassNamesOptions {
	readonly part: string;
	readonly classes: ReadonlyArray<string>;
}

/**
 * Returns an object with (possibly cached) parsed page data and parsed metaData (embedded in pages)
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const useClassNames = (options: IUserClassNamesOptions): IClassNamesData => {
	const { styleRegistry } = useContext(PageContext);
	const { parentPath } = useContext(ComponentContext);

	const [className, setClassName] = useState("");
	const [ componentPath ] = useState<ComponentPath>(parentPath?.concat(options.part) ?? [options.part])
	// If the props changed, due to locale change, reparse the content
	useEffect(() => {
		const more = styleRegistry.getClassNames(options.part, parentPath);
		const cs = classNames(options.classes, more);
		setClassName(cs);
	}, [ styleRegistry, parentPath, options]);

	return {
		componentClass: className,
		componentPath,
		parentPath
	};
};

export default useClassNames;
