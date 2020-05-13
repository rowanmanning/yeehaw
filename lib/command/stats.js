'use strict';

const numberFormatter = new Intl.NumberFormat('en');

module.exports = async function statsCommand(commandOptions) {
	const {channelId, slackWebClient, teamId, userId} = commandOptions;
	const {Race, Bet} = commandOptions.models;

	const races = await Race.find({teamId}).select('_id channelId');
	const raceIds = races.map(race => race.id);
	const channelIds = races.map(race => race.channelId);
	const uniqueChannelIds = [...new Set(channelIds)];
	const betCount = await Bet.countDocuments({raceId: {$in: raceIds}});
	const raceCount = races.length;

	const channelStats = uniqueChannelIds.map(uniqueChannelId => {
		const count = channelIds.filter(channelId => channelId === uniqueChannelId).length;
		const noun = (count === 1) ? 'race' : 'races';
		return `*<#${uniqueChannelId}>*: ${numberFormatter.format(count)} ${noun}`;
	}).join('\n');

	await slackWebClient.chat.postMessage({
		channel: channelId,
		blocks: [
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `Howdy! Here are the stats that <@${userId}> asked for:`
				}
			},
			{
				type: 'section',
				text: {
					type: 'mrkdwn',
					text: `*Total Races:* ${numberFormatter.format(raceCount)}\n*Total bets placed:* ${numberFormatter.format(betCount)}\n${channelStats}`
				}
			}
		]
	});

};
