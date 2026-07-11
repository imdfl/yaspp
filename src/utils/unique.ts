export interface IMLUnique {
	id(prefix?: string): string;
};

let nextNumber = Math.round(Date.now() % 1000);

class Unique implements IMLUnique {
	private readonly seed = `mlid-${String(Date.now() % 1000)}`;

	public id(prefix?: string): string {
		const p = prefix || this.seed;
		return `${p}-${nextNumber++}`;
	}
}

export const unique: IMLUnique = new Unique();
