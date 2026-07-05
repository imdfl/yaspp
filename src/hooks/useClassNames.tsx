import { useContext, useMemo } from "react";
import { PageContext, ComponentContext } from "@contexts/index";
import classNames from "@lib/class-names";
import { ComponentPath } from "@src/types/components";
import { IStyleRegistry } from "../lib/styleRegistry";

export interface IClassNamesData {
	readonly componentClass: string;
	readonly componentPath: ComponentPath;
	readonly parentPath: ComponentPath;
}

export interface IUserClassNamesOptions {
	readonly part: string;
	readonly classes: ReadonlyArray<string>;
}


function calcClasses(reg: IStyleRegistry, parentPath: ReadonlyArray<string>, options: IUserClassNamesOptions): string {
		const more = reg.getClassNames(options.part, parentPath);
		return classNames(options.classes, more);

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

	const className = useMemo(() => calcClasses(styleRegistry, parentPath, options), [ styleRegistry, parentPath, options]);
	const componentPath = useMemo<ComponentPath>(() => parentPath?.concat(options.part) ?? [options.part], 
		[parentPath, options])
	// If the props changed, due to locale change, reparse the content
	// useEffect(() => {
	// 	const more = styleRegistry.getClassNames(options.part, parentPath);
	// 	const cs = classNames(options.classes, more);
	// 	setClassName(cs);
	// }, [ styleRegistry, parentPath, options]);

	return {
		componentClass: className,
		componentPath,
		parentPath
	};
};

export default useClassNames;
