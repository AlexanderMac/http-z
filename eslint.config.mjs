import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
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

export default [{
  ignores: ["projects/**/*"],
}, ...compat.extends(
  "eslint:recommended",
  "plugin:@typescript-eslint/recommended",
  "plugin:@angular-eslint/recommended",
  "plugin:@angular-eslint/template/process-inline-templates",
).map(config => ({
  ...config,
  files: ["**/*.ts"],
})), {
  files: ["**/*.ts"],

  plugins: {
    "@typescript-eslint": typescriptEslintEslintPlugin,
  },

  languageOptions: {
    ecmaVersion: 5,
    sourceType: "script",

    parserOptions: {
      project: "tsconfig.json",
    },
  },

  rules: {
    "@angular-eslint/directive-selector": ["error", {
      type: "attribute",
      prefix: "app",
      style: "camelCase",
    }],

    "@angular-eslint/component-selector": ["error", {
      type: "element",
      prefix: "app",
      style: "kebab-case",
    }],

    "brace-style": "error",
    curly: "error",
    "global-require": "error",
    "handle-callback-err": "error",

    "key-spacing": ["error", {
      beforeColon: false,
    }],

    "linebreak-style": "off",
    "max-params": ["error", 6],
    "no-console": "error",
    "no-case-declarations": "off",
    "no-lonely-if": "error",
    "no-multiple-empty-lines": "error",
    "no-new-require": "error",
    "no-path-concat": "error",
    "no-constant-condition": "off",
    "no-duplicate-imports": "error",

    "no-unused-vars": ["error", {
      vars: "all",
      args: "after-used",
      ignoreRestSiblings: false,
    }],

    "object-curly-spacing": ["error", "always"],
    semi: "off",
    quotes: "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-angle-bracket-type-assertion": "off",
    "@typescript-eslint/no-empty-function": "error",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-confusing-non-null-assertion": "error",
    "@typescript-eslint/no-duplicate-enum-values": "error",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-inferrable-types": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/ban-ts-comment": "error",
    "@typescript-eslint/ban-tslint-comment": "error",
    "@typescript-eslint/consistent-indexed-object-style": "error",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    "@typescript-eslint/no-misused-new": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-namespace": "error",
    "@typescript-eslint/no-this-alias": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-use-before-declare": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-function-type": "error",
    "@typescript-eslint/prefer-namespace-keyword": "error",

    "@typescript-eslint/naming-convention": ["error", {
      selector: "variableLike",
      format: ["camelCase"],
      leadingUnderscore: "forbid",

      filter: {
        regex: "^npm_",
        match: false,
      },
    }, {
        selector: "variable",
        format: ["PascalCase"],
        types: ["boolean"],
        prefix: ["is", "has", "should"],
        leadingUnderscore: "forbid",
      }, {
        selector: "variable",
        modifiers: ["const"],
        format: ["camelCase", "PascalCase", "UPPER_CASE"],
        leadingUnderscore: "forbid",
        filter: {
          regex: "^npm_",
          match: false,
        },
      }, {
        selector: "typeLike",
        format: ["PascalCase"],
      }, {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: false,
        },
      }, {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      }, {
        selector: "parameter",
        format: null,
        custom: {
          regex: "(^_$|^[A-Za-z1-9$]+$)",
          match: true
        }
      }
    ],
  },
}, ...compat.extends(
  "plugin:@angular-eslint/template/recommended",
  "plugin:@angular-eslint/template/accessibility",
).map(config => ({
  ...config,
  files: ["**/*.html"],
})), {
  files: ["**/*.html"],
  rules: {},
}];