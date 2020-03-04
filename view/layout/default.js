'use strict';

const {html} = require('@rowanmanning/app');

module.exports = function defaultLayout(context, content) {
	return html`
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>${context.title}</title>
			</head>
			<body>
				${content}
			</body>
		</html>
	`;
};
