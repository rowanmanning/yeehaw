import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

const InstallationSchema = new mongoose.Schema(
	{
		_id: { type: String, required: true, default: randomUUID },
		team: { type: String, index: true, required: true, ref: 'Team' },
		slackInstallation: { type: Object }
	},
	{
		timestamps: true,
		statics: {
			async findOneByTeam(teamId: string) {
				return this.findOne({ team: teamId }).sort({ createdAt: 'desc' });
			}
		}
	}
);

export const Installation = mongoose.model('Installation', InstallationSchema);
