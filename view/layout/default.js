'use strict';

const {html} = require('@rowanmanning/app');

module.exports = function defaultLayout(context, content) {
	const {fathomSiteId} = context.app.options;
	return html`
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>${context.title}</title>
				<link rel="stylesheet" href="/main.css" />
				${fathomSiteId ? html`
					<script src="https://cdn.usefathom.com/script.js" data-site=${fathomSiteId} honor-dnt="true" defer></script>
				` : ''}
			</head>
			<body>
				<div class="page">
					${content}
				</div>
			</body>
		</html>
	`;
};
