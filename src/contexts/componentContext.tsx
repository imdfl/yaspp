import React, { Context, createContext, PropsWithChildren } from 'react';
import type { ComponentPath } from 'types/components';

export interface IComponentContext {
	readonly parentPath: ComponentPath
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
}

const ctx = createContext<IComponentContext>(new MLComponentContextImpl([]));

export const ComponentContext: Context<IComponentContext> = ctx;

type ComponentContextProps = PropsWithChildren<IComponentContextOptions>;

export const ComponentContextProvider = (props: ComponentContextProps) => {
	const { children } = props;
	return <ComponentContext.Provider
		value={
			new MLComponentContextImpl(props.parentPath)
		}
	>
		{children}
	</ComponentContext.Provider>
}

export default ComponentContextProvider;
