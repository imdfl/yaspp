import { PropsWithChildren } from "react";

export type RefOrSourceProps = {
	name: string;
	url?: string;
};

export type YSPComponentPropsWithChildren<TProps extends object> = PropsWithChildren<TProps> & {
	readonly style?: Record<string, string>
}