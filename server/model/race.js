'use strict';

const generateHorseName = require('../lib/horse-names');

/**
 * @param {object} options
 *     Model options.
 * @param {import('mongoose').Mongoose} options.mongoose
 *     The Mongoose database.
 */
module.exports = function initializeRaceModel({ mongoose }) {
	const { Schema } = mongoose;

	// Define a schema for horses
	const horseSchema = new Schema({
		name: {
			type: String,
			required: true,
			default: generateHorseName
		},
		emoji: {
			type: String
		},
		distanceFromFinish: {
			type: Number
		},
		hasFinished: {
			type: Boolean,
			default: false
		},
		finishingPosition: {
			type: Number
		}
	});

	// Define a schema for races
	const raceSchema = new Schema(
		{
			teamId: {
				type: String,
				required: true
			},
			channelId: {
				type: String,
				required: true
			},
			userId: {
				type: String,
				required: true
			},
			messageTimestamp: {
				type: String
			},
			horses: {
				type: [horseSchema],
				default: []
			},
			phase: {
				type: String,
				required: true,
				default: 'betting',
				enum: ['betting', 'racing', 'finished']
			}
		},
		{ timestamps: true }
	);

	mongoose.model('Race', raceSchema);
};
