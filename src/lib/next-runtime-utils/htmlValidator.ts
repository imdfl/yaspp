import { StringMap } from "types/models";
import {
	CaseInsensitiveMap,
	CaseInsensitiveSet,
} from "../caseInsensitiveCollections";

/** Provides utility functions for App Specific validating HTML content */
interface IHTMLValidator {
	/**
	 * Is the attribute name valid for the provided tag?
	 * @param tag
	 * @param key
	 */
	isValidAttributeFor(tag: string, key: string): boolean;

	/**
	 * return a map of the attributes in the provided map, that are valid for the provided tag
	 * Guaranteed not null
	 * @param tag
	 * @param attributes
	 */
	filterAttributesFor(tag: string, attributes: StringMap): StringMap;
}

const ALLOWED_HTML_ATTRIBUTES = {
	"*": {
		valid: ["align", "dir", "style"],
	},
	TD: {
		valid: ["rowspan", "colspan"],
	},
	TH: {
		valid: ["rowspan", "colspan"],
	},
	TABLE: {
		valid: ["border", "cellpadding", "cellspacing"],
	},
	A: {
		valid: ["href", "rel","target"]
	}
};

interface IAttributeMap {
	valid: CaseInsensitiveSet;
}

class HTMLValidator implements IHTMLValidator {
	private readonly attributeMap: CaseInsensitiveMap<IAttributeMap>;

	constructor() {
		const m = this.attributeMap = new CaseInsensitiveMap();
		Object.keys(ALLOWED_HTML_ATTRIBUTES).forEach((key) => {
			const rec = ALLOWED_HTML_ATTRIBUTES[key];
			m.set(key, {
				valid: new CaseInsensitiveSet(rec.valid as string[]),
			});
		});
	}

	isValidAttributeFor(tag: string, key: string): boolean {
		if (!tag || !key) {
			return false;
		}
		if (/^\s*on/i.test(key)) {
			return false;
		}
		if (/^\s*data-/.test(key)) {
			return true;
		}
		return (
			this.attributeMap.get("*").valid.has(key) ||
			Boolean(this.attributeMap.get(tag)?.valid.has(key))
		);
	}

	filterAttributesFor(tag: string, attributes: StringMap): StringMap {
		if (!tag || !attributes) {
			return {};
		}
		return Object.keys(attributes).reduce((acc, name) => {
			if (this.isValidAttributeFor(tag, name)) {
				acc[name] = attributes[name];
			}
			return acc;
		}, {});
	}
}

export const htmlValidator: IHTMLValidator = new HTMLValidator();
