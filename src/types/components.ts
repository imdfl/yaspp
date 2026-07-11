import { PropsWithChildren } from "react";

export type RefOrSourceProps = {
	readonly name: string;
	readonly url?: string;
};

export type ComponentPath = (ReadonlyArray<string> | string)     ;
export interface IYSPComponentProps {
	readonly style?: Record<string, string>;
	readonly className?: string;
	readonly currentPath?: string;
	// readonly partName?: string;
}

export type YSPComponentPropsWithChildren<TProps extends object = object> = PropsWithChildren<TProps & IYSPComponentProps>