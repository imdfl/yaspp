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

export interface IUseClassNamesOptions {
	readonly part: string;
	readonly classes: ComponentPath;
	readonly currentPath?: ComponentPath;
}


function calcClasses(reg: IStyleRegistry, parentPath: ComponentPath, {part, classes}: IUseClassNamesOptions): string {
		const more = reg.getClassNames(part, parentPath);
		return classNames(classes, more);

}
/**
 * Returns an object with (possibly cached) parsed page data and parsed metaData (embedded in pages)
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const useClassNames = ({ part, currentPath, classes }: IUseClassNamesOptions): IClassNamesData => {
	const { styleRegistry } = useContext(PageContext);
	const { parentPath } = useContext(ComponentContext);
	const myPath = currentPath || parentPath;

	const className = useMemo(() => calcClasses(styleRegistry, myPath, { part, classes}), [ styleRegistry, parentPath, part, currentPath]);
	const componentPath = useMemo<ComponentPath>(() => myPath?.concat(part) ?? [part], 
		[parentPath, part])

	return {
		componentClass: className,
		componentPath,
		parentPath: myPath
	};
};

export default useClassNames;
