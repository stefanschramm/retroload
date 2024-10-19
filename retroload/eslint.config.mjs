// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.all,
  ...tseslint.configs.recommended,
  {
    "rules": {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "args": "all",
          "argsIgnorePattern": "^_",
        }
      ],
      "capitalized-comments": "off",
      "class-methods-use-this": "off",
      "dot-notation": "off",
      "func-style": "off",
      "id-length": "off",
      "init-declarations": "off",
      "max-classes-per-file": "off",
      "max-lines": "off",
      "max-lines-per-function": "off",
      "max-params": "off",
      "max-statements": "off",
      "no-bitwise": "off",
      "no-continue": "off",
      "no-empty-function": ["error", {"allow": ["constructors"]}],
      "no-inline-comments": "off",
      "no-magic-numbers": "off",
      "no-plusplus": "off",
      "no-ternary": "off",
      "no-undefined": "off",
      "no-use-before-define": "off",
      "no-useless-constructor": "off",
      "no-warning-comments": "off",
      "one-var": ["error", "never"],
      "prefer-destructuring": "off",
      "sort-keys": "off",
    }
  }
);
