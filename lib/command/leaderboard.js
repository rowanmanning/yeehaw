'use strict';

const countBy = require('lodash/countBy');
const numberFormatter = new Intl.NumberFormat('en');
const orderBy = require('lodash/orderBy');

module.exports = async function leaderboardCommand(commandOptions) {
	const {channelId, slackWebClient, teamId, text} = commandOptions;
	const {Bet} = commandOptions.models;
	const isGlobal = text.startsWith('global');

	const winningBets = await Bet.findWinningBets(teamId, isGlobal ? undefined : channelId);
	const winningBetCounts = orderBy(Object.entries(countBy(winningBets, 'slackUserId')), 1, 'desc');

	const winningBetsRendered = winningBetCounts.slice(0, 10).map(([userId, count]) => {
		return `*<@${userId}>:* ${numberFormatter.format(count)} winning bets`;
	}).join('\n');

	const leaderboardText = (
		winningBets.length ?
			`Yeehaw! These are the top 10 betters ${isGlobal ? ' across all of Slack' : 'in this channel'}:\n${winningBetsRendered}` :
			`Yeehaw! Nobody has placed bets${isGlobal ? '' : ' in this channel'} yet`
	);

	const message = await slackWebClient.chat.postMessage({
		channel: channelId,
		text: 'Leaderboard incoming!'
	});
	// Hack to prevent notifications from @mentions
	await slackWebClient.chat.update({
		channel: channelId,
		ts: message.ts,
		text: leaderboardText
	});

};
