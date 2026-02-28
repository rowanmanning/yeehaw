import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
	{
		_id: { type: String }
	},
	{
		timestamps: true
	}
);

export const Team = mongoose.model('Team', TeamSchema);
