import mongoose from 'mongoose';
import { Racer } from './racer.ts';

const initialRacerCount = 20;

const TeamSchema = new mongoose.Schema(
	{
		_id: { type: String }
	},
	{
		timestamps: true
	}
);

// If a team is created, populate some starting racers
TeamSchema.pre('save', function () {
	this.$locals.wasNew = this.isNew;
});
TeamSchema.post('save', async function () {
	if (this.$locals.wasNew) {
		await Racer.create(Array(initialRacerCount).fill({ team: this.id }));
	}
});

export const Team = mongoose.model('Team', TeamSchema);
