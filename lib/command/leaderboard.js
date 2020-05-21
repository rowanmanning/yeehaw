'use strict';

const countBy = require('lodash/countBy');
const numberFormatter = new Intl.NumberFormat('en');
const orderBy = require('lodash/orderBy');

module.exports = async function leaderboardCommand(commandOptions) {
	const {channelId, slackWebClient, text} = commandOptions;
	let messageText = '';
	if (text.startsWith('ratios')) {
		messageText = await leaderboardBettingRatios(commandOptions);
	} else {
		messageText = await leaderboardTotalWins(commandOptions);
	}

	const message = await slackWebClient.chat.postMessage({
		channel: channelId,
		text: 'Leaderboard incoming!'
	});
	// Hack to prevent notifications from @mentions
	await slackWebClient.chat.update({
		channel: channelId,
		ts: message.ts,
		text: messageText
	});
};

async function leaderboardTotalWins(commandOptions) {
	const {channelId, teamId, text} = commandOptions;
	const {Bet} = commandOptions.models;
	const isGlobal = text.startsWith('global');

	const winningBets = await Bet.findWinningBets(teamId, isGlobal ? undefined : channelId);
	const winningBetCounts = orderBy(Object.entries(countBy(winningBets, 'slackUserId')), 1, 'desc');

	const winningBetsRendered = winningBetCounts.slice(0, 10).map(([userId, count]) => {
		return `*<@${userId}>:* ${numberFormatter.format(count)} winning bets`;
	}).join('\n');

	return (
		winningBets.length ?
			`Yeehaw! These are the top 10 betters ${isGlobal ? ' across all of Slack' : 'in this channel'}:\n${winningBetsRendered}` :
			`Yeehaw! Nobody has placed bets${isGlobal ? '' : ' in this channel'} yet`
	);
}

async function leaderboardBettingRatios(commandOptions) {
	const {teamId} = commandOptions;
	const {Bet} = commandOptions.models;

	const betRatios = orderBy(await Bet.getBettingRatiosForTeam(teamId), 'ratio', 'desc').filter(userBettingRatio => {
		// Filter out people who have only bet and won once
		const betAndWonOnce = (userBettingRatio.bets === 1 && userBettingRatio.wins === 1);
		return !betAndWonOnce;
	});

	const betRatiosRendered = betRatios.slice(0, 10).map(({userId, ratio, bets, wins}) => {
		return `*<@${userId}>:* ${numberFormatter.format(ratio)} (${numberFormatter.format(bets)} bets, ${numberFormatter.format(wins)} wins)`;
	}).join('\n');

	return (
		betRatios.length ?
			`Yeehaw! These are the top 10 betters across all of Slack:\n${betRatiosRendered}` :
			`Yeehaw! Nobody has placed bets yet`
	);
}
