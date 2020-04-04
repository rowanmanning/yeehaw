'use strict';

module.exports = async function setupRaceInteraction(interactionOptions) {
	const {payload, slackWebClient} = interactionOptions;

	await slackWebClient.views.open({
		trigger_id: payload.trigger_id,
		view: {
			type: 'modal',
			callback_id: 'startRaceInChannel',
			title: {
				type: 'plain_text',
				text: 'Set up your race'
			},
			submit: {
				type: 'plain_text',
				text: 'Start the race!'
			},
			close: {
				type: 'plain_text',
				text: 'Cancel'
			},
			blocks: [
				{
					type: 'input',
					block_id: 'channel',
					label: {
						type: 'plain_text',
						text: 'Channel'
					},
					element: {
						type: 'channels_select',
						placeholder: {
							type: 'plain_text',
							text: 'Which channel shall we start a race in?'
						}
					}
				}
			]
		}
	});

};
