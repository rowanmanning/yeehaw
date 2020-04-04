'use strict';

module.exports = {
	extends: '@rowanmanning/eslint-config/es2018',
	rules: {
		'camelcase': 'off',
		'no-invalid-this': 'off',
		'callback-return': 'off',
		'max-depth': ['warn', 8],
		'max-statements': ['warn', 30],
		'complexity': ['warn', 20],
		'no-underscore-dangle': 'off'
	}
};
