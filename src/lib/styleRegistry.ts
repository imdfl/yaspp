

import type { IYasppClassBindings, IYasppClassTree, IYasppClassOverrides} from "types/styles";
import { Mutable } from "../types";
import { stringUtils } from "./stringUtils";


export interface IStyleRegistry {
	registerBindings(bindings: IYasppClassTree): void;
}
/*
	the map is indexed by component part name
	each item includes:
	rule id
	chains: [{
		parts: string[];
		rule id
	}]
*/

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
	private readonly _cache: Map<string, string>;
	private readonly _rules: Map<string, IRuleData>;
	private readonly _bindings: Map<string, IComponentRules>;
	private readonly _newRuleId: () => string;

	constructor() {
		this._cache = new Map();
		this._rules = new Map();
		this._bindings = new Map();
		this._newRuleId = (() => {
			let ruleId = 0;
			return () => `r${ruleId++}-id`;
		})();
	}

	public registerBindings(bindings: IYasppClassTree): void {
		Object.entries(bindings).forEach(([ part, binding]) => {
			this._registerBinding([], part, binding);
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
		Object.entries(binding).forEach(([ part, binding]) => {
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
			ruleId = rawId && this._rules.has(rawId) ? rawId : this._newRuleId();
			this._rules.set(ruleId, {
				classes: stringUtils.toStringArray(classes, strArrayOptions)
			});
		}
		else {
			const ovr = classes as IYasppClassOverrides;
			if (!ovr.add && !ovr.remove) {
				return "";
			}
			ruleId = this._newRuleId();
			this._rules.set(ruleId, {
				add: stringUtils.toStringArray(ovr.add, strArrayOptions),
				remove: stringUtils.toStringArray(ovr.remove, strArrayOptions)
			});
			// add?.forEach(cls => {
			// 	if (cls && typeof cls === "string") {
			// 		const ind = clist.indexOf(cls);
			// 		if (ind < 0) {
			// 			clist.push(cls);
			// 		}
			// 	}
			// })
			// remove?.forEach(cls => {
			// 	if (cls && typeof cls === "string") {
			// 		const ind = clist.indexOf(cls);
			// 		if (ind >= 0) {
			// 			clist.splice(ind, 1);
			// 		}
			// 	}
			// })
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