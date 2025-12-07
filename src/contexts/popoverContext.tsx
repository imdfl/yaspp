import { Context, createContext } from "react";
import { IPopoverContext } from "@dynamicContent/types";

const ctx = createContext<IPopoverContext>(null);

export const PopoverContext: Context<IPopoverContext> = ctx;

export const PopoverProvider = ({ value, children }) => (
	<PopoverContext value={value}>{children}</PopoverContext>
);
