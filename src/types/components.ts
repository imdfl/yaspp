import { PropsWithChildren } from "react";

export type RefOrSourceProps = {
	readonly name: string;
	readonly url?: string;
};

export type ComponentPath = ReadonlyArray<string>;

export interface IYSPComponentProps {
	readonly style?: Record<string, string>;
}

export type YSPComponentPropsWithChildren<TProps extends object> = PropsWithChildren<TProps> & IYSPComponentProps