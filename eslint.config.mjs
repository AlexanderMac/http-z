import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
  },
  {
    ignores: [
      'coverage/**',
      'build/**',
      'dist/**',
      'demo/**',
      'tmp/**',
      "**/*.mjs",
      "jest.config.js",
      "rollup.config.js",
    ],
  },
  {
    languageOptions: { globals: globals.node }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "block-scoped-var": "error",
      "camelcase": "error",
      "complexity": ["error", 12],
      "eol-last": "error",
      "max-depth": ["warn", 3],
      "max-nested-callbacks": ["warn", 3],
      "max-params": ["warn", 3],
      "max-statements": ["warn", 15],
      "no-console": "error",
      "no-duplicate-imports": "error",
      "no-else-return": "error",
      "no-extend-native": "error",
      "no-invalid-this": "error",
      "no-lone-blocks": "error",
      "no-return-await": "error",
      "no-shadow": "error",
      "no-trailing-spaces": "error",
      "no-throw-literal": "error",
      "no-unused-expressions": "error",
      "no-use-before-define": "off",
      "no-useless-call": "error",
      "prefer-const": "error",
      "prefer-rest-params": "error",
      "prefer-spread": "error",
      "require-await": "error",
      "strict": "error",

      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  {
    files: ["test/**/*.ts"],
    rules: {
      "max-params": "off",
      "max-statements": "off",
      "max-nested-callbacks": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
