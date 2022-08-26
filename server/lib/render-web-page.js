'use strict';

/**
 * @param {object} options
 *     Rendering options.
 * @param {string} [options.fathomSiteId]
 *     The Fathom site ID for analytics.
 * @returns {string}
 *     Returns the page CSS.
 */
module.exports = function renderWebPage({fathomSiteId}) {
	const title = 'Yeehaw';

	return `
		<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>${title}</title>
				<style>${getCss()}</style>
				${fathomSiteId ? `
					<script src="https://cdn.usefathom.com/script.js" data-site="${fathomSiteId}" honor-dnt="true" defer></script>
				` : ''}
			</head>
			<body>
				<div class="page">
					<h1>${title}</h1>
					<p>Stage exciting horse races from the comfort of any public Slack channel, and bet on the result. Yeehaw!</p>
					<a href="/slack/install">
						<img
							alt="Add to Slack"
							height="40"
							width="139"
							src="https://platform.slack-edge.com/img/add_to_slack.png"
							srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
						/>
					</a>
				</div>
			</body>
		</html>
	`;
};

/**
 * @returns {string}
 *     Returns the page CSS.
 */
function getCss() {
	return `
		html,
		body {
			margin: 0;
			padding: 0;
			font-family: sans-serif;
		}
		
		body {
			padding: 20px;
			background: #eee;
		}
		
		.page {
			box-sizing: border-box;
			max-width: 600px;
			padding: 20px;
			margin: 0 auto;
			background: #fff;
		}
		
		h1,
		p,
		pre {
			margin: 0 0 20px 0;
		}
		
		h1:last-child,
		p:last-child,
		pre:last-child {
			margin: 0;
		}
		
		.error-stack,
		.slash-command {
			padding: 20px;
			background: #eee;
			overflow: auto;
		}	
	`;
}
