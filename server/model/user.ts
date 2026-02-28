import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
	{
		_id: { type: String },
		team: { type: String, index: true, ref: 'Team' }
	},
	{
		timestamps: true
	}
);

export const User = mongoose.model('User', UserSchema);
