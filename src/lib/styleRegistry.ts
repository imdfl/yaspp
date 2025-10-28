

import type { IYasppClassBindings, IYasppClassTree, IYasppClassOverrides } from "types/styles";
import { Mutable } from "../types";
import { stringUtils } from "./stringUtils";
import { unique } from "utils/unique";

/**
 * The style registry allows components to retrieve the classnames
 * associated with their type, based on the context, which
 * is the component path
 */
export interface IStyleRegistry {
	registerBindings(bindings: IYasppClassTree): void;
	getClassNames(part: string, path: ReadonlyArray<string>): string[];
}

interface IChainRule {
	readonly parts: ReadonlyArray<string>;
	readonly ruleId: string;
}
interface IComponentRules {
	readonly ruleId: string;
	readonly chains: IChainRule[];
}

interface IRuleClassData {
	readonly classes: ReadonlyArray<string>;
}

interface IRuleToggleData {
	readonly add: ReadonlyArray<string>;
	readonly remove: ReadonlyArray<string>;
}

type IRuleData = IRuleToggleData | IRuleClassData;

class StyleRegistry implements IStyleRegistry {
	private readonly _cache: Map<string, ReadonlyArray<string>>;
	private readonly _rules: Map<string, IRuleData>;
	/*
		the map is indexed by component part name
		each item includes:
		rule id
		chains: [{
			parts: string[];
			rule id
		}]
	*/
	private readonly _bindings: Map<string, IComponentRules>;

	constructor() {
		this._cache = new Map();
		this._rules = new Map();
		this._bindings = new Map();
	}

	public registerBindings(bindings: IYasppClassTree): void {
		Object.entries(bindings).forEach(([part, binding]) => {
			this._registerBinding([], part, binding);
		});
		this._sortChains();
	}

	public getClassNames(part: string, path: ReadonlyArray<string>): string[] {
		const b = this._bindings.get(part);
		if (!b) {
			return [];
		}
		const key = `${path.join('-')}-${part}`;
		const cur = this._cache.get(key);
		if (cur) {
			return cur.slice();
		}
		let classes: string[] = [];
		if (b.ruleId) {
			classes = this._applyRule(b.ruleId, classes);
		}
		if (path.length) {
			b.chains.forEach(chain => {
				if (this._chainsMatch(path, chain.parts)) {
					classes = this._applyRule(chain.ruleId, classes);
				}
			})
		}
		return classes;
	}

	private _chainsMatch(targetPath: ReadonlyArray<string>, matchPath: ReadonlyArray<string>): boolean {
		for (let ind = 0, lastInd = 0; ind < targetPath.length; ind++) {
			const part = targetPath[ind],
			partInd = matchPath.indexOf(part);
			if (partInd < lastInd) {
				return false;
			}
			lastInd = partInd;			
		}
		return true;
	}

	private _sortChains(): void {
		this._bindings.forEach((rules: IComponentRules) => {
			rules.chains.sort((chain1, chain2) => {
				return Math.sign(chain1.parts.length - chain2.parts.length);
			})
		})
	}

	private _registerBinding(chain: ReadonlyArray<string>, part: string, binding: IYasppClassBindings): void {
		if (!binding) {
			return;
		}
		if (binding.classes) {
			this._updateRule(chain, part, binding.classes);
		}
		const myChain = chain.concat(part);
		Object.entries(binding).forEach(([part, binding]) => {
			if (part !== "classes") {
				this._registerBinding(myChain, part, binding);
			}
		})
	}

	private _findChainIndex(binding: IComponentRules, chain: ReadonlyArray<string>): number {
		if (!chain?.length || !(binding?.chains?.length > 0)) {
			return -1;
		}
		const chstr = String(chain);
		return binding.chains.findIndex(bchain => String(bchain) === chstr)
	}

	private _applyRule(ruleId: string, classes: string[]): string[] {
		const rule = this._rules.get(ruleId);
		if (!rule) {
			return classes;
		}
		if (Array.isArray((rule as IRuleClassData).classes)) {
			return (rule as IRuleClassData).classes.slice();
		}
		const clist = classes.slice();
		const { add, remove } = rule as IRuleToggleData;
		add?.forEach(cls => {
			const ind = clist.indexOf(cls);
			if (ind < 0) {
				clist.push(cls);
			}
		})
		remove?.forEach(cls => {
			const ind = clist.indexOf(cls);
			if (ind >= 0) {
				clist.splice(ind, 1);
			}
		})
		return clist;

	}

	private _updateRule(chain: ReadonlyArray<string>, part: string, classes: ReadonlyArray<string> | Partial<IYasppClassOverrides>): string {
		part = part?.trim();
		if (!part) {
			return "";
		}
		const cur = this._bindings.get(part) as Mutable<IComponentRules> ?? {
			chains: [],
			ruleId: ""
		};
		const chainInd = this._findChainIndex(cur, chain);
		const rawId = chainInd >= 0 ? cur.chains[chainInd].ruleId : cur.ruleId;
		let ruleId = "";
		const strArrayOptions = { allowEmpty: false, unique: true };
		if (Array.isArray(classes)) {
			ruleId = rawId && this._rules.has(rawId) ? rawId : unique.id("rule-");
			this._rules.set(ruleId, {
				classes: stringUtils.toStringArray(classes, strArrayOptions)
			});
		}
		else {
			const ovr = classes as IYasppClassOverrides;
			if (!ovr.add && !ovr.remove) {
				return "";
			}
			ruleId = unique.id("rule-");
			this._rules.set(ruleId, {
				add: stringUtils.toStringArray(ovr.add, strArrayOptions),
				remove: stringUtils.toStringArray(ovr.remove, strArrayOptions)
			});
		}
		if (chainInd >= 0) {
			cur.chains[chainInd] = {
				ruleId,
				parts: cur.chains[chainInd].parts
			}
		}
		else if (chain.length) {
			cur.chains.push({
				parts: chain,
				ruleId
			})
		}
		else {
			cur.ruleId = ruleId;
		}
		this._bindings.set(part, cur);
		return ruleId;
	}
}

export const createStyleRegistry = () => {
	return new StyleRegistry();
}