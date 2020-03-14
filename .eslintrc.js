'use strict';

module.exports = {
	extends: '@rowanmanning/eslint-config/es2018',
	rules: {
		'no-invalid-this': 'off',
		'callback-return': 'off',
		'max-depth': ['warn', 3],
		'complexity': ['warn', 10],
		'no-underscore-dangle': 'off'
	}
};
