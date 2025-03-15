export type NotNull = NonNullable<unknown>;
export type Nullable<T extends NotNull> = T | null;
export interface IResponse<T extends NotNull> {
	result?: T;
	error?: string;
}

export * from './locale';
export * from './nodes';
