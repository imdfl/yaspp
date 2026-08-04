import * as zod from "zod";
import type { YASPP } from "yaspp-types";
import type { IOperationResult, Mutable, NotNull, OperationPromise } from "@src/types";
import { fileUtils } from "../fileUtils";
import type { IThemeUrl, IYasppNavData } from "@src/types/app";
import YConstants from "./constants";
import { stringUtils } from "../stringUtils";
import type { IYasppClassOverrides } from "@src/types/styles";


const _contentBlockSchema = zod.object({
	root: zod.string().min(1).max(128),
	index: zod.string().min(1).max(256)
}).strict();

const _navBlockSchema = zod.object({
	index: zod.string().min(1).max(256)
}).strict();

const _localePageSchema = zod.array(zod.string().min(1).max(128));
const _localeNameSchema = zod.string().min(2).max(6);
const _themeNameSchema = zod.string().min(1).max(32);
const _stringOrArray = zod.union([zod.string(), zod.array(zod.string())]);

const _allowedLocaleSchema = zod.object({
	path: _stringOrArray,
	locales: zod.array(_localeNameSchema)
});


const _localeBlockSchema = zod.object({
	root: zod.string().min(1).max(128),
	langs: zod.array(_localeNameSchema).optional(),
	defaultLocale: _localeNameSchema.optional(),
	pages: zod.record(zod.string(), _localePageSchema).optional(),
	initialLocale: _localeNameSchema.optional(),
	allowedLocales: zod.array(_allowedLocaleSchema).optional()

})

const _stylesBlockSchema = zod.object({
	sheets: _stringOrArray.optional(),
	classBindings: _stringOrArray.optional(),
	themes: zod.array(_themeNameSchema).optional(),
	theme: _themeNameSchema.optional()
});

const _assetsBlockSchema = zod.object({
	root: zod.string().min(1).max(128),
});

const _globalFileSchema = zod.object({
	source: zod.string(),
	dest: zod.string()
});


const _globalsBlockSchema = zod.object({
	files: zod.array(_globalFileSchema)
});


const _yasppConfigSchema = zod.object({
	/**
	 * Content configuration
	 */
	content: _contentBlockSchema,
	/**
	 * Navigation configuration - 
	 */
	nav: _navBlockSchema,
	locale: _localeBlockSchema,
	style: _stylesBlockSchema.optional(),
	assets: _assetsBlockSchema.optional(),
	globals: _globalsBlockSchema.optional()
});


const _classesListSchema = zod.array(zod.string());
const _changeClassesSchema: zod.ZodType<Partial<IYasppClassOverrides>> = zod.object({
	add: zod.array(zod.string()).optional(),
	remove: zod.array(zod.string()).optional()
})
const _classRecSchema = zod.union([_classesListSchema, _changeClassesSchema]);


const _classConfigSchema = zod.lazy(() => zod.object({
	classes: _classRecSchema.optional()
}).catchall(_classConfigSchema));

const _classTreeSchema = zod.record(zod.string(), _classConfigSchema);

export interface IYasppConfigSchemas {
	readonly Config: typeof _yasppConfigSchema,
	readonly Content: typeof _contentBlockSchema,
	readonly Nav: typeof _navBlockSchema,
	readonly Locale: typeof _localeBlockSchema,
	readonly Style: typeof _stylesBlockSchema,
	readonly Assets: typeof _assetsBlockSchema,
	readonly Globals: typeof _globalsBlockSchema
}


export interface IYasppClassBindingsSchema {
	readonly Tree: typeof _classTreeSchema,
	readonly ClassConfig: typeof _classConfigSchema,
}

export const yasspConfigSchemas: IYasppConfigSchemas = {
	Assets: _assetsBlockSchema,
	Config: _yasppConfigSchema,
	Content: _contentBlockSchema,
	Globals: _globalsBlockSchema,
	Locale: _localeBlockSchema,
	Nav: _navBlockSchema,
	Style: _stylesBlockSchema
}


export const classBindingSchemas: IYasppClassBindingsSchema = {
	ClassConfig: _classConfigSchema,
	Tree: _classTreeSchema
}

///////////////////////////////////////////////////////////////////////
///////////// Exported members ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////



