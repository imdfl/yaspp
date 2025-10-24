export const flattenArray = <T>(arr: Array<T | T[]>): T[] => {
	const f = arr.reduce((flat: T[], toFlatten: T | T[]) => {
		return flat.concat(Array.isArray(toFlatten) ? flattenArray(toFlatten) : toFlatten);
	}, []);
	return f as T[];
};
