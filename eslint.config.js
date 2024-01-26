import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import filenames_plugin from 'eslint-plugin-filenames';
import import_plugin from 'eslint-plugin-import';

import stylisticTs from '@stylistic/eslint-plugin-ts';

import * as eslintApi from '@eslint/eslintrc';

const compat = new eslintApi.FlatCompat(); //{ resolvePluginsRelativeTo: __dirname });
const prettierExts = compat.extends('prettier');

const configs = [
	{
		// Jest configuration files are always processed in a node context.
		files: ['jest.config.js'],
		languageOptions: {
			globals: {
				node: true,
			},
		},
		rules: {
			'@typescript-eslint/no-var-requires': 'off',
		},
	},
	{ ignores: ['*.less.d.ts', 'dist/**/*.*'] },
	{
		ignores: ['*.less.d.ts', 'dist/**/*.*', '*.js'],
		files: ['src/**/*.ts', 'test/**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: true,
				sourceType: 'module', // Allows for the use of imports
				ecmaFeatures: {
					//jsx: true, // Allows for the parsing of JSX
				},
			},
			globals: {
				//...globals.browser, // If browser app
				...globals.node,
				...globals.nodeBuiltin,
				...globals.es2021,
				...globals.jest,
				Atomics: 'readonly',
				SharedArrayBuffer: 'readonly',
			},
		},
		plugins: {
			filenames: filenames_plugin,
			import: import_plugin,
			'@typescript-eslint': tsPlugin,
			'@stylistic/ts': stylisticTs,
			/**
		  "eslint-plugin-react": ">= 7.25.1",
		  "eslint-plugin-react-hooks": ">= 4.2.0"
		   */
		},
		rules: {
			...tsPlugin.configs['eslint-recommended'].rules,
			...tsPlugin.configs['recommended-type-checked'].rules,
			...import_plugin.configs.recommended.rules,
			'import/no-extraneous-dependencies': [
				'warn',
				{ devDependencies: ['**/*.spec.ts', 'test/**/*.ts'] },
			],
			'import/no-internal-modules': ['error'],
			'filenames/match-regex': [
				'error',
				'^[a-z]{1}[a-zA-Z-_.]+$|^[0-9]+_[a-z]{1}[0-9a-zA-Z-_.]+$',
				true,
			],
			'max-len': [
				'warn',
				{
					code: 100,
					tabWidth: 4,
					ignoreUrls: true,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals: true,
					ignoreStrings: true,
					comments: 110,
				},
			],
			'@typescript-eslint/ban-types': 'warn',
			camelcase: 'off',
			'@typescript-eslint/camelcase': 'off',
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{ varsIgnorePattern: '^_', argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/naming-convention': [
				'warn',
				{
					selector: 'default',
					format: ['camelCase'],
					leadingUnderscore: 'allow',
				},
				{ selector: 'property', format: ['camelCase'] },
				{
					selector: [
						'interface',
						'class',
						'typeAlias',
						'enum',
						'typeParameter',
					],
					format: ['PascalCase'],
				},
				{
					selector: ['enumMember'],
					format: ['UPPER_CASE', 'PascalCase'],
				},
				{
					selector: ['accessor', 'classMethod'],
					modifiers: ['static'],
					format: ['PascalCase'],
				},
			],
		},
	},

	...prettierExts,
];

export default configs;
