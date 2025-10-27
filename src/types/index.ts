export type NotNull = NonNullable<unknown>;
export type Nullable<T extends NotNull> = T | null;

export type Maybe<T extends object> = T | undefined;
export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type DeepMutable<T> = T extends (string | number | boolean | undefined) ? T
	: T extends ReadonlyArray<infer TElement> ? Array<DeepMutable<TElement>>
	: T extends object ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
	: T;

export type PartialWith<TObject extends object, TKey extends keyof TObject = keyof TObject> = Pick<TObject, TKey> & Partial<TObject>;	
export type PartialWithout<TObject extends object, TKey extends keyof TObject> = Omit<TObject, TKey> & Partial<TObject>;	

/**
 * Allows using keyof vars as indices
 */
export type KeyOf<TObject extends object> = (string & keyof TObject);
export type AnyFunction = (...args: unknown[]) => unknown;

export interface IOperationResult<T extends NotNull> {
	readonly error?: string;
	readonly result?: T;
}

export type OperationPromise<T extends object> = Promise<IOperationResult<T>>;


export * from './locale';
export * from './nodes';
