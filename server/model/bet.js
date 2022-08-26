'use strict';

/**
 * @param {object} options
 *     Model options.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeBetModel({mongoose}) {
	const {Schema} = mongoose;

	// Define a schema for bet placement
	const betSchema = new Schema({
		slackTeamId: {
			type: String,
			required: true,
			index: true
		},
		slackUserId: {
			type: String,
			required: true,
			index: true
		},
		raceId: {
			type: String,
			required: true,
			index: true
		},
		horseId: {
			type: String,
			required: true
		}
	}, {timestamps: true});

	mongoose.model('Bet', betSchema);

};
