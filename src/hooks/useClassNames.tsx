import { useContext, useEffect, useState } from 'react';
import { PageContext } from '../contexts/pageContext';
import classNames from '@lib/class-names';
import { ComponentPath } from '../types/components';
import { IStyleRegistry } from '../lib/styleRegistry';
import { ComponentContext } from '../contexts/componentContext';

export interface IClassNamesData {
	readonly componentClass: string;
	readonly componentPath: ComponentPath;
	readonly parentPath: ComponentPath;
}

export interface IUserClassNamesOptions {
	readonly part: string;
	readonly classes: ReadonlyArray<string>;
}

function calcClassNames(registry: IStyleRegistry, path: ComponentPath, options: IUserClassNamesOptions): string {
	const more = registry.getClassNames(options.part, path);
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

	const [className, setClassName] = useState(calcClassNames(styleRegistry, parentPath, options));
	const [ componentPath ] = useState<ComponentPath>(parentPath?.concat(options.part) ?? [options.part])
	// If the props changed, due to locale change, reparse the content
	useEffect(() => {
		setClassName(calcClassNames(styleRegistry, parentPath, options));
	}, [ styleRegistry, parentPath, options]);

	return {
		componentClass: className,
		componentPath,
		parentPath
	};
};

export default useClassNames;
