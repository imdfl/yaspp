import { PropsWithChildren } from "react";

export type RefOrSourceProps = {
	readonly name: string;
	readonly url?: string;
};

export interface IComponentPath {
	readonly asString: string;
	readonly asArray: string[];
	readonly parentPath: IComponentPath;
	/**
	 * Returns a new instance
	 * @param parts 
	 */
	add(...parts: string[]): IComponentPath;
	clone(): IComponentPath;
}
export type ComponentPath = (ReadonlyArray<string> | string)     ;
export interface IYSPComponentProps {
	readonly style?: Record<string, string>;
	readonly className?: string;
	readonly currentPath?: ComponentPath;
	// readonly partName?: string;
}

export type YSPComponentPropsWithChildren<TProps extends object = object> = PropsWithChildren<TProps & IYSPComponentProps>