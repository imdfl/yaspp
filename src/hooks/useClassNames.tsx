import { useContext, useMemo } from "react";
import { PageContext, ComponentContext } from "@contexts/index";
import classNames from "@lib/class-names";
import { ComponentPath } from "@src/types/components";

export type ComponentPathGenerator = (path: ComponentPath) => ComponentPath;
export type ClassNameGenerator = (part: string, classes: string | ReadonlyArray<string>) => ComponentPath;
export type ComponentAttributesGenerator = (part: string) => Record<string, string>;
export interface IClassNamesInfo {
	readonly componentClass: string;
	readonly componentPath: ComponentPath;
	readonly parentPath: ComponentPath;
	readonly createSubPath: ComponentPathGenerator;
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
	const myPath = currentPath || parentPath;


	const className = useMemo(() => {
		const more = styleRegistry.getClassNames(part, currentPath || parentPath);
		return classNames(classes, more);
		},
		[ styleRegistry, parentPath, part, currentPath ]
	);

	const componentPath = useMemo<ComponentPath>(() => styleRegistry.pathToArray(currentPath || parentPath).concat(part || []), 
		[currentPath, styleRegistry, parentPath, part]);

	const createSubPath = useMemo(() => {
		const rootPath = styleRegistry.pathToArray(componentPath);
		return (subPath: ComponentPath): ComponentPath => {
			const pathParts = styleRegistry.pathToArray(subPath);
			if (!rootPath.length) {
				return pathParts;
			}
			return rootPath.concat(pathParts);
		}
	}, [ componentPath, styleRegistry ])

	const createSubClass = useMemo(() => (part: string, classes: string | ReadonlyArray<string>) => {
		const more = styleRegistry.getClassNames(part, currentPath || parentPath);
		return classNames(classes, more);
	}, [currentPath, parentPath, styleRegistry]);

	const attributes = useMemo((): Record<string, string> => {
		return {
			"data-component-path": styleRegistry.pathToString(componentPath)
		}
	}, [componentPath])

	const createAttributes = useMemo(() => (part: string): Record<string, string> => {
		return {
			"data-component-path": styleRegistry.pathToString(createSubPath(part))
		}
	}, [componentPath])

	return {
		componentClass: className,
		componentPath,
		parentPath: myPath,
		createSubPath,
		createSubClass,
		createAttributes,
		attributes
	};
};

export default useClassNames;
