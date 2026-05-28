import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all
});

export default defineConfig([globalIgnores([
	"**/node_modules",
	"**/.next",
	"**/out",
	"**/public",
	"**/bak",
	"scripts/media",
	"tests/fixme",
	"e2e/fixme",
]), {
	extends: fixupConfigRules(compat.extends(
		"plugin:@next/next/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
		"plugin:import/typescript",
		"eslint:recommended",
		// "prettier",
	)),

	plugins: {
		"jsx-a11y": jsxA11Y,
	},

	languageOptions: {
		globals: {
			...globals.browser,
			...globals.node,
		},

		parser: tsParser,
	},

	settings: {
		react: {
			version: "detect",
		},

		"import/resolver": {
			typescript: {},
		},
	},

	rules: {
		"react/react-in-jsx-scope": "off",
		"react/prop-types": "off",

		"react/no-unknown-property": [2, {
			ignore: ["jsx", "global"],
		}],
	},
}, {
	files: ["**/*.ts", "**/*.tsx"],
	ignores: ["node_modules", ".next", "out", "./*.js",
		"./*.mjs", "public", "bak", "scripts/media",
		"tests/fixme", "e2e/fixme"
	],

    extends: compat.extends(
		"plugin:@typescript-eslint/recommended",
		"plugin:@typescript-eslint/recommended-requiring-type-checking",
	),

	languageOptions: {
		ecmaVersion: 5,
		sourceType: "script",

		parserOptions: {
			project: "./**/tsconfig.json",
			tsconfigRootDir: "./",
			warnOnUnsupportedTypeScriptVersion: false,
		},
	},

	rules: {
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/require-await": "off",
		"@typescript-eslint/no-unsafe-member-access": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		"@typescript-eslint/no-unsafe-return": "off",
		"@typescript-eslint/restrict-template-expressions": "off",
		"prefer-const": "off",
		"react/no-unescaped-entities": "off",
		"no-case-declarations": "off",
		"@next/next/no-img-element": "off",
	},
}]);