import type { InstallationStore } from '@slack/bolt';
import { CodedError } from '@yeehaw/errors';
import { Installation } from '../model/installation.ts';
import { Team } from '../model/team.ts';

export default function createInstallationStore(): InstallationStore {
	return {
		async storeInstallation(installation) {
			try {
				if (!installation.team) {
					throw new Error('No team found in installation data');
				}
				const team = await Team.findById(installation.team.id);
				if (!team) {
					await Team.create({ _id: installation.team.id });
				}
				await Installation.create({
					teamId: installation.team.id,
					slackInstallation: installation
				});
			} catch (cause) {
				throw new CodedError('Failed to save installation data', {
					code: 'INSTALLATION_STORE',
					cause
				});
			}
		},
		async fetchInstallation(query) {
			try {
				if (!query.teamId) {
					throw new Error('No team ID found in query');
				}
				const installation = await Installation.findOneByTeam(query.teamId);
				return installation?.slackInstallation;
			} catch (cause) {
				throw new CodedError('Failed to fetch installation data', {
					code: 'INSTALLATION_FETCH',
					cause
				});
			}
		},
		async deleteInstallation(query) {
			try {
				if (!query.teamId) {
					throw new Error('No team ID found in query');
				}
				await Installation.deleteMany({
					teamId: query.teamId
				});
				// TODO delete all related stuff
			} catch (cause) {
				throw new CodedError('Failed to delete installation data', {
					code: 'INSTALLATION_DELETE',
					cause
				});
			}
		}
	};
}
