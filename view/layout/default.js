'use strict';

const {html} = require('@rowanmanning/app');

module.exports = function defaultLayout(context, content) {
	return html`
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>${context.title}</title>
				<link rel="stylesheet" href="/main.css" />
			</head>
			<body>
				<div class="page">
					${content}
				</div>
			</body>
		</html>
	`;
};
