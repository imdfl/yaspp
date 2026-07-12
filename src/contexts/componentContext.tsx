import React, { Context, createContext, PropsWithChildren } from "react";
import type { ComponentPath } from "@src/types/components";
import { stringUtils } from "../lib/stringUtils";

export interface IComponentContext {
	readonly parentPath: ComponentPath
	createSubPath(relativePath: string): ComponentPath;
	createSubClass(relativePath: string): string;
}

export interface IComponentContextOptions {
	readonly parentPath: ComponentPath;
}

class MLComponentContextImpl implements IComponentContext {
	private readonly _path: ReadonlyArray<string>;
	constructor(parentPath: ComponentPath) {
		const path = stringUtils.toStringArray(parentPath);
		this._path = path.slice();
	}

	public get parentPath(): ComponentPath {
		return this._path;
	}

	public createSubPath(relativePath: string): ComponentPath {
		return relativePath ? this._path.concat(relativePath) : this._path.slice();
	}

	public createSubClass(relativePath: string): string {
		const path =  relativePath ? this._path.concat(relativePath) : this._path.slice();
		return path.join('.');
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
