import { Context, createContext, PropsWithChildren, useContext } from "react";
import type { IComponentPath } from "@src/types/components";
import { createComponentPath } from "@lib/next-runtime-utils/component-path";

export interface IComponentContext {
	readonly parentPath: IComponentPath
	createSubPath(relativePath: string): IComponentPath;
	// createSubClass(relativePath: string): string;
}

export interface IComponentContextOptions {
	readonly parentPath?: IComponentPath;
	readonly relativePath?: string;
}

class MLComponentContextImpl implements IComponentContext {
	private readonly _path: IComponentPath;
	constructor(parentPath?: IComponentPath) {
		this._path = parentPath?.clone() ?? createComponentPath([]);
	}

	public get parentPath(): IComponentPath {
		return this._path;
	}

	public createSubPath(relativePath: string): IComponentPath {
		return relativePath ? this._path.add(relativePath) : this._path;
	}

	// public createSubClass(relativePath: string): string {
	// 	const path =  relativePath ? this._path.add(relativePath) : this._path;
	// 	return path.join('.');
	// }
}

const ctx = createContext<IComponentContext>(new MLComponentContextImpl());

export const ComponentContext: Context<IComponentContext> = ctx;

type ComponentContextProps = PropsWithChildren<IComponentContextOptions>;

export const ComponentContextProvider = (props: ComponentContextProps) => {
	const { children, relativePath } = props;
	const ctx = useContext(ComponentContext);
	const newPath = (relativePath && ctx) ?
		ctx.parentPath.add(relativePath) : props.parentPath;
	return (
        <ComponentContext
            value={
                new MLComponentContextImpl(newPath)
            }
        >
            {children}
        </ComponentContext>
    );
}

export default ComponentContextProvider;
