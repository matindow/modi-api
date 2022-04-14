module.exports = {
	env: {
		es2021: true,
		node: true,
	},
	extends: [
		'airbnb-base',
		'plugin:chai-friendly/recommended',
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	settings: {
		'import/resolver': {
			node: { extensions: ['.js', '.mjs'] },
		},
	},
	rules: {
		camelcase: 0,
		'linebreak-style': 0,
		semi: [2, 'never'],
		indent: ['error', 'tab'],
		'no-tabs': [2, { allowIndentationTabs: true }],
		'import/extensions': 0,
	},
	plugins: [
		'chai-friendly',
	],
}
