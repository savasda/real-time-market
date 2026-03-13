import typescriptEslint from '@typescript-eslint/eslint-plugin';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import _import from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import jsdoc from 'eslint-plugin-jsdoc';
import preferArrow from 'eslint-plugin-prefer-arrow';
import angularEslint from '@angular-eslint/eslint-plugin';
import angularEslintTemplate from '@angular-eslint/eslint-plugin-template';
import { fixupPluginRules } from '@eslint/compat';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ['**/polyfills.ts', 'dist/**'],
  },
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      '@stylistic/ts': stylisticTs,
      import: fixupPluginRules(_import),
      'unused-imports': unusedImports,
      jsdoc,
      'prefer-arrow': preferArrow,
      '@angular-eslint': angularEslint,
      '@angular-eslint/template': angularEslintTemplate,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  ...compat
    .extends(
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:@angular-eslint/recommended',
      'plugin:@angular-eslint/template/process-inline-templates',
      'plugin:prettier/recommended',
    )
    .map((config) => ({
      ...config,
      files: ['**/*.ts'],
    })),
  {
    files: ['**/*.ts'],

    rules: {
      '@angular-eslint/prefer-standalone': 'off',

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      '@typescript-eslint/unbound-method': [
        'error',
        {
          ignoreStatic: true,
        },
      ],

      '@typescript-eslint/no-unused-expressions': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/no-explicit-any': 'off',

      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'memberLike',
          modifiers: ['public'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'forbid',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'memberLike',
          modifiers: ['private'],
          format: ['camelCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'allow',
        },
      ],

      '@stylistic/ts/array-type': 'off',

      '@stylistic/ts/explicit-member-accessibility': [
        'off',
        {
          accessibility: 'explicit',
        },
      ],

      '@stylistic/ts/indent': [
        'error',
        2,
        {
          FunctionDeclaration: {
            parameters: 'first',
          },

          FunctionExpression: {
            parameters: 'first',
          },

          SwitchCase: 1,
          ignoredNodes: ['PropertyDefinition'],
        },
      ],

      '@stylistic/ts/interface-name-prefix': 'off',

      '@stylistic/ts/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },

          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],

      '@stylistic/ts/no-empty-function': 'off',
      '@stylistic/ts/no-explicit-any': 'off',
      '@stylistic/ts/no-parameter-properties': 'off',
      '@stylistic/ts/no-use-before-define': 'off',
      '@stylistic/ts/no-var-requires': 'off',
      '@stylistic/ts/quotes': ['error', 'single', 'avoid-escape'],
      '@stylistic/ts/semi': ['error', 'always'],
      '@stylistic/ts/type-annotation-spacing': 'error',
      'arrow-body-style': 'error',
      'arrow-parens': ['off', 'as-needed'],
      camelcase: 'error',
      'comma-dangle': 'off',
      complexity: 'off',
      'constructor-super': 'error',
      curly: 'error',
      'dot-notation': 'error',
      'eol-last': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',

      'id-blacklist': [
        'error',
        'any',
        'Number',
        'number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
      ],

      'id-match': 'error',
      'import/no-deprecated': 'warn',

      'import/order': [
        'error',
        {
          'newlines-between': 'always',

          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'unknown'],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'jsdoc/no-types': 'error',
      'max-classes-per-file': 'off',
      'new-parens': 'error',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'error',

      'no-console': [
        'error',
        {
          allow: [
            'log',
            'dirxml',
            'warn',
            'error',
            'dir',
            'timeLog',
            'assert',
            'clear',
            'count',
            'countReset',
            'group',
            'groupCollapsed',
            'groupEnd',
            'table',
            'Console',
            'markTimeline',
            'profile',
            'profileEnd',
            'timeline',
            'timelineEnd',
            'timeStamp',
            'context',
          ],
        },
      ],

      'no-debugger': 'error',
      'no-empty': 'off',
      'no-eval': 'error',
      'no-fallthrough': 'error',
      'no-invalid-this': 'off',
      'no-multiple-empty-lines': 'off',
      'no-new-wrappers': 'error',
      'no-restricted-imports': ['error', 'rxjs/Rx', 'lodash'],
      'no-shadow': 'off',
      'no-throw-literal': 'error',

      'no-trailing-spaces': [
        'error',
        {
          skipBlankLines: true,
        },
      ],

      'no-undef-init': 'error',
      'no-underscore-dangle': 'error',
      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'one-var': ['error', 'never'],
      'prefer-arrow/prefer-arrow-functions': 'error',
      'prefer-const': 'error',
      'quote-props': ['error', 'as-needed'],
      radix: 'error',

      'sort-imports': [
        'error',
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
          allowSeparatedGroups: true,
        },
      ],

      'space-before-function-paren': [
        'error',
        {
          anonymous: 'never',
          asyncArrow: 'always',
          named: 'never',
        },
      ],

      'function-paren-newline': 'off',
      'spaced-comment': 'error',
      'unused-imports/no-unused-imports': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'off',
    },
  },
  ...compat
    .extends('plugin:@angular-eslint/template/recommended', 'plugin:@angular-eslint/template/accessibility')
    .map((config) => ({
      ...config,
      files: ['**/*.html'],
    })),
  {
    files: ['**/*.html'],

    rules: {
      '@angular-eslint/template/attributes-order': ['error'],
      '@angular-eslint/template/eqeqeq': ['error'],
      '@angular-eslint/template/prefer-control-flow': ['error'],
      '@angular-eslint/template/prefer-self-closing-tags': ['error'],
      '@angular-eslint/template/no-interpolation-in-attributes': ['error'],
      '@angular-eslint/template/no-duplicate-attributes': ['error'],
    },
  },
  ...compat.extends('plugin:prettier/recommended').map((config) => ({
    ...config,
    files: ['**/*.html'],
  })),
  {
    files: ['**/*.html'],

    rules: {
      'prettier/prettier': [
        'error',
        {
          parser: 'angular',
        },
      ],
    },
  },
];
