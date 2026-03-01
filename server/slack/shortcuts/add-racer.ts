import type { App } from '@slack/bolt';
import type { RichTextBlock, RichTextBlockElement, RichTextElement } from '@slack/web-api';
import type { Logger } from '@yeehaw/logger';
import { randomEmoji, randomName } from '@yeehaw/racer-generator';
import { Racer } from '../../model/racer.ts';
import { User } from '../../model/user.ts';

interface Options {
	app: App;
	logger: Logger;
}

export function initialiseAddRacerShortcut({ app, logger }: Options) {
	// Handle the add_racer shortcut
	app.shortcut('add_racer', async ({ ack, client, shortcut }) => {
		const log = logger.child({ shortcut: 'add_racer', triggerId: shortcut.trigger_id });
		try {
			await ack();
			log.info({
				event: 'SHORTCUT_RUN',
				team: { id: shortcut.team?.id, domain: shortcut.team?.domain },
				user: { id: shortcut.user.id, name: shortcut.user.username }
			});
			const racerSuggestion = {
				name: randomName(),
				emoji: randomEmoji()
			};
			await client.views.open({
				trigger_id: shortcut.trigger_id,
				view: {
					type: 'modal',
					callback_id: 'submit_racer',
					clear_on_close: true,
					title: { type: 'plain_text', text: 'Add a new racer' },
					submit: { type: 'plain_text', text: 'Submit' },
					close: { type: 'plain_text', text: 'Cancel' },
					blocks: [
						{
							type: 'section',
							text: {
								type: 'mrkdwn',
								text: 'Add a new majestic steed to race with.'
							}
						},
						{
							type: 'divider'
						},
						{
							type: 'input',
							block_id: 'name',
							element: {
								type: 'plain_text_input',
								action_id: 'name_input',
								initial_value: racerSuggestion.name
							},
							label: { type: 'plain_text', text: 'Name' },
							hint: {
								type: 'plain_text',
								text: 'Enter the name of your steed, it will appear publicly in future races.'
							}
						},
						{
							type: 'input',
							block_id: 'emoji',
							element: {
								type: 'rich_text_input',
								action_id: 'emoji_input',
								initial_value: {
									type: 'rich_text',
									elements: [
										{
											type: 'rich_text_section',
											elements: [
												{
													type: 'emoji',
													name: racerSuggestion.emoji.replaceAll(':', '')
												}
											]
										}
									]
								}
							},
							label: { type: 'plain_text', text: 'Emoji' },
							hint: {
								type: 'plain_text',
								text: 'Select a single emoji for your steed, to represent it in races. Due to limitations with Slack, modifier sequences (e.g. skin tone) will be stripped'
							}
						}
					]
				}
			});
		} catch (cause) {
			log.error({ event: 'SHORTCUT_ERROR', error: cause });
			throw cause;
		}
	});

	app.view('submit_racer', async ({ ack, body, view }) => {
		const log = logger.child({ view: 'submit_racer', hash: view.hash });
		try {
			const { values } = view.state;
			const name = values.name.name_input.value?.trim();
			const emoji = extractEmojiFromRichText(
				values.emoji.emoji_input.rich_text_value
			)?.trim();

			// Validate the inputs
			try {
				Racer.assertValidName(name);
			} catch (error) {
				if (error instanceof Error) {
					return ack({ response_action: 'errors', errors: { name: error.message } });
				}
			}
			try {
				Racer.assertValidEmoji(emoji);
			} catch (error) {
				if (error instanceof Error) {
					return ack({ response_action: 'errors', errors: { emoji: error.message } });
				}
			}

			await ack();
			await Promise.all([
				User.findOneAndUpdate(
					{ _id: body.user.id },
					{ _id: body.user.id, team: view.team_id },
					{ upsert: true }
				)
			]);
			await Racer.create({
				team: view.team_id,
				user: body.user.id,
				name: name as string,
				emoji: emoji as string
			});
			// TODO some kind of success feedback
		} catch (cause) {
			log.error({ event: 'VIEW_ERROR', error: cause });
			throw cause;
		}
	});
}

function extractEmojiFromRichText(value?: RichTextBlock): string {
	if (value) {
		return value.elements.map(extractEmojiFromRichTextBlockElement).join('');
	}
	return '[NOPE]';
}

function extractEmojiFromRichTextBlockElement(value: RichTextBlockElement): string {
	if (value.type === 'rich_text_section') {
		return value.elements.map(extractEmojiFromRichTextElement).join('');
	}
	return '[NOPE]';
}

function extractEmojiFromRichTextElement(value: RichTextElement) {
	if (value.type === 'text') {
		return value.text;
	}
	if (value.type === 'emoji') {
		return `:${value.name}:`;
	}
	return '[NOPE]';
}
