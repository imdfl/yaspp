import React, { Context, createContext, PropsWithChildren } from "react";
import type { ComponentPath } from "@src/types/components";

export interface IComponentContext {
	readonly parentPath: ComponentPath
	createSubPath(relativePath: string): ComponentPath;
}

export interface IComponentContextOptions {
	readonly parentPath: ComponentPath;
}

class MLComponentContextImpl implements IComponentContext {
	private readonly _path: ComponentPath;
	constructor(parentPath: ComponentPath) {
		this._path = parentPath?.slice() ?? [];
	}

	public get parentPath(): ComponentPath {
		return this._path;
	}

	public createSubPath(relativePath: string): ComponentPath {
		return relativePath ? this._path.concat(relativePath) : this._path.slice();
	}
}

const ctx = createContext<IComponentContext>(new MLComponentContextImpl([]));

export const ComponentContext: Context<IComponentContext> = ctx;

type ComponentContextProps = PropsWithChildren<IComponentContextOptions>;

export const ComponentContextProvider = (props: ComponentContextProps) => {
	const { children } = props;
	return (
        <ComponentContext
            value={
                new MLComponentContextImpl(props.parentPath)
            }
        >
            {children}
        </ComponentContext>
    );
}

export default ComponentContextProvider;
