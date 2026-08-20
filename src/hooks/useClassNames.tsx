import { useContext, useMemo } from "react";
import { PageContext, ComponentContext } from "@contexts/index";
import classNames from "@lib/class-names";
import { ComponentPath, IComponentPath } from "@src/types/components";
import { createComponentPath } from "@lib/next-runtime-utils/component-path";

export type ComponentPathGenerator = (path: ComponentPath) => ComponentPath;
export type ClassNameGenerator = (part: string, ...classes: ReadonlyArray<string>) => string;
export type ComponentAttributesGenerator = (part: string) => Record<string, string>;
export interface IClassNamesInfo {
	readonly componentClass: string;
	readonly componentPath: IComponentPath;
	// readonly createSubPath: ComponentPathGenerator;
	readonly createSubClass: ClassNameGenerator;
	readonly createAttributes: ComponentAttributesGenerator
	readonly attributes: Record<string, string>;
}

export interface IUseClassNamesOptions {
	readonly part: string;
	readonly classes: string | ReadonlyArray<string>;
	readonly currentPath?: ComponentPath;
}

/**
 * Returns an object with (possibly cached) classname and component path for the given part
 *
 * Guaranteed not null
 * @param props
 * @returns
 */
export const useClassNames = ({ part, currentPath, classes }: IUseClassNamesOptions): IClassNamesInfo => {
	const { styleRegistry } = useContext(PageContext);
	const { parentPath } = useContext(ComponentContext);

	const className = useMemo(() => {
		const more = styleRegistry.getClassNames(part, currentPath || parentPath.asArray);
		return classNames(classes, more);
	},
		[styleRegistry, parentPath, part, currentPath]
	);

	const componentPath = useMemo<IComponentPath>(() => createComponentPath(currentPath || parentPath.asArray).add(part),
		[currentPath, parentPath, part]);

	// const createSubPath = useMemo((): IComponentPath => {
	// 	const rootPath = styleRegistry.pathToArray(componentPath);
	// 	return (subPath: ComponentPath): ComponentPath => {
	// 		const pathParts = styleRegistry.pathToArray(subPath);
	// 		if (!rootPath.length) {
	// 			return pathParts;
	// 		}
	// 		return rootPath.concat(pathParts);
	// 	}
	// }, [componentPath, styleRegistry])

	const createSubClass = useMemo(() => (part: string, ...classes: ReadonlyArray<string>) => {
		const more = styleRegistry.getClassNames(part, componentPath.asArray);
		return classes.length ? classNames(classes, more) : more.join(' ');
	}, [currentPath, parentPath, styleRegistry]);

	const createAttributes = useMemo(() => (part: string): Record<string, string> => {
		return {
			"data-component-path": String(componentPath.add(part))
		}
	}, [componentPath])

	const attributes = useMemo((): Record<string, string> => {
		return createAttributes("");
	}, [componentPath])

	return {
		componentClass: className,
		componentPath,
		createSubClass,
		createAttributes,
		attributes
	};
};

export default useClassNames;
