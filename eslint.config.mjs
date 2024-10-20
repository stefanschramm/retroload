// @ts-check

import eslint from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.all,
  ...tseslint.configs.strictTypeChecked,
  stylisticTs.configs['all-flat'],
  {
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    'rules': {
      '@stylistic/ts/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/ts/indent': ['error', 2],
      '@stylistic/ts/lines-between-class-members': 'off',
      '@stylistic/ts/no-extra-parens': 'off',
      '@stylistic/ts/object-property-newline': 'off',
      '@stylistic/ts/quote-props': 'off',
      '@stylistic/ts/quotes': ['error', 'single'],
      '@stylistic/ts/space-before-function-paren': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          'args': 'all',
          'argsIgnorePattern': '^_',
        },
      ],
      '@typescript-eslint/restrict-template-expressions': ['error', {allowNumber: true}],
      'capitalized-comments': 'off',
      'class-methods-use-this': 'off',
      'dot-notation': 'off',
      'func-style': 'off',
      'id-length': 'off',
      'init-declarations': 'off',
      'max-classes-per-file': 'off',
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      'max-params': 'off',
      'max-statements': 'off',
      'no-bitwise': 'off',
      'no-continue': 'off',
      'no-empty-function': ['error', {'allow': ['constructors']}],
      'no-inline-comments': 'off',
      'no-magic-numbers': 'off',
      'no-plusplus': 'off',
      'no-ternary': 'off',
      'no-undefined': 'off',
      'no-use-before-define': 'off',
      'no-useless-constructor': 'off',
      'no-warning-comments': 'off',
      'one-var': ['error', 'never'],
      'prefer-destructuring': 'off',
      'sort-keys': 'off',
    },
  },
);
