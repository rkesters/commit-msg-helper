// Use lint-staged to apply trivial formatting standards across all projects.
export default {
	'*.{ts,tsx}': [
		'organize-imports-cli',
		'prettier --write --no-editorconfig',
		'eslint'
	],
	'*.{cjs,js,json,mjs}': [
		'prettier --write --no-editorconfig',
		'eslint'
	],
};
