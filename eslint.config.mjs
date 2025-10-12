// @ts-check

import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.all,
  ...tseslint.configs.strictTypeChecked,
  stylistic.configs['all'],
  {
    plugins: {
      '@stylistic/ts': stylistic,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    'rules': {
      '@stylistic/array-element-newline': 'off',
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/dot-location': ['error', 'property'],
      '@stylistic/function-call-argument-newline': ['error', 'consistent'],
      '@stylistic/function-paren-newline': ['error', 'consistent'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/lines-between-class-members': 'off',
      '@stylistic/multiline-comment-style': 'off',
      '@stylistic/multiline-ternary': 'off',
      '@stylistic/newline-per-chained-call': ['error', {'ignoreChainWithDepth': 3}],
      '@stylistic/no-extra-parens': 'off',
      '@stylistic/no-extraneous-class': 'off',
      '@stylistic/no-unnecessary-condition': 'off',
      '@stylistic/object-property-newline': 'off',
      '@stylistic/padded-blocks': 'off',
      '@stylistic/quote-props': 'off',
      '@stylistic/quotes': ['error', 'single'],
      '@stylistic/space-before-function-paren': 'off',
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',
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
