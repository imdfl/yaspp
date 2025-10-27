

export interface IYasppClassOverrides {
	readonly add: ReadonlyArray<string>;
	readonly remove: ReadonlyArray<string>;
}

export interface IYasppClassDefinition {
	readonly classes?: Partial<IYasppClassOverrides> | ReadonlyArray<string>;
}
export interface IYasppClassTree  {
	readonly [subclass: string]: IYasppClassBindings;
}

export type IYasppClassBindings = IYasppClassDefinition & IYasppClassTree;

export interface IYasppBindingsFile {
	readonly bindings: ReadonlyArray<IYasppClassTree>;
}