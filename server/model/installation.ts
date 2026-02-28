import mongoose from 'mongoose';

const InstallationSchema = new mongoose.Schema(
	{
		teamId: { type: String, index: true, ref: 'Team' },
		slackInstallation: { type: Object }
	},
	{
		timestamps: true,
		statics: {
			async findOneByTeam(teamId: string) {
				return this.findOne({ teamId }).sort({ createdAt: 'desc' });
			}
		}
	}
);

export const Installation = mongoose.model('Installation', InstallationSchema);
