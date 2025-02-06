import globals from "globals";
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

export default [...compat.extends("eslint:recommended"), {
  languageOptions: {
    globals: {
      ...globals.node,
    },
    ecmaVersion: 5,
    sourceType: "module",
    parserOptions: {
      ecmaFeatures: {
        impliedStrict: true,
      },
    },
  },

  rules: {
    "array-bracket-spacing": ["error", "never"],
    "block-scoped-var": "error",
    "brace-style": ["error", "1tbs"],
    camelcase: "error",

    "comma-spacing": ["error", {
      before: false,
      after: true,
    }],

    "computed-property-spacing": ["error", "never"],
    complexity: ["error", 12],
    curly: "error",
    "eol-last": "error",

    indent: ["error", 2, {
      SwitchCase: 1,
      MemberExpression: 1,
    }],

    eqeqeq: ["error", "smart"],

    "keyword-spacing": ["error", {
      before: true,
      after: true,
    }],

    "max-depth": ["warn", 3],
    "max-len": ["warn", 130],
    "max-nested-callbacks": ["warn", 3],
    "max-params": ["warn", 3],
    "max-statements": ["warn", 15],
    "new-cap": "off",
    "no-console": "error",
    "no-duplicate-imports": "error",
    "no-else-return": "error",
    "no-extend-native": "error",
    "no-extra-parens": "warn",
    "no-invalid-this": "error",
    "no-lone-blocks": "warn",
    "no-mixed-spaces-and-tabs": "error",
    "no-multi-spaces": "error",
    "no-return-await": "warn",
    "no-shadow": "error",
    "no-trailing-spaces": "error",
    "no-throw-literal": "error",
    "no-unused-expressions": "error",
    "no-unused-vars": "error",
    "no-use-before-define": "off",
    "no-useless-call": "warn",

    "object-curly-spacing": ["error", "always", {
      objectsInObjects: false,
    }],

    "prefer-const": "off",
    "prefer-rest-params": "error",
    "prefer-spread": "error",
    "require-await": "warn",
    semi: ["warn", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": "error",
    strict: "error",
    quotes: ["error", "single", "avoid-escape"],
  },
}];
