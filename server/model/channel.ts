import mongoose from 'mongoose';

const ChannelSchema = new mongoose.Schema(
	{
		_id: { type: String },
		teamId: { type: String, index: true, ref: 'Team' }
	},
	{
		timestamps: true
	}
);

export const Channel = mongoose.model('Channel', ChannelSchema);
