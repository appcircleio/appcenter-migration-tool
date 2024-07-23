import { noCommandFound } from './index';
import { PROGRAM_NAME } from '../../constant';
import { ProgramCommand } from '../../program';
import { getAllAppCenterApps, getOrgApps } from '../../services';
import { createOra } from '../../utils/oraHelper';
import { CommandTypes } from '../commands';
import { commandWriter } from '../writer';
import chalk from 'chalk';
import { createDistributionProfile, getAppcircleOrganizations, getDistributionProfiles, getSubOrgToken } from '../../services/appcircleApi';

const FULL_COMMANDS = ['-apps-list', '-apps-list-organization', '-apps-migrate-profile'];

const handleApps = async (command: ProgramCommand, params: any) => {
  const commandName = command.fullCommandName.split(PROGRAM_NAME).pop();

  const spinner = createOra('');
  switch (commandName) {
    case FULL_COMMANDS[0]:
      spinner.text = 'App Center Apps Fetching';
      spinner.start();
      const appsList = await getAllAppCenterApps();
      spinner.succeed('App Center Apps fetched successfully.');
      commandWriter(CommandTypes.APPS, {
        fullCommandName: command.fullCommandName,
        data: appsList,
      });
      break;

    case FULL_COMMANDS[1]:
      spinner.text = 'Organization Apps Fetching';
      spinner.start();
      const organizationApps = await getOrgApps(params.organizationName);
      spinner.succeed('Organization Apps fetched successfully.');
      commandWriter(CommandTypes.APPS, {
        fullCommandName: command.fullCommandName,
        data: organizationApps,
      });
      break;

    case FULL_COMMANDS[2]:
      spinner.text = 'App Center Apps Profile(s) Migrating';
      spinner.start();
      const appcircleOrgs = await getAppcircleOrganizations();
      const selectedOrg = appcircleOrgs.find((org: any) => org.name === params.appcircleOrganization);
      const migratedProfiles = [];
      const existProfiles = [];
      let subOrgToken: undefined | string;

      if (!selectedOrg) {
        spinner.fail(`Appcircle Organization ${params.appcircleOrganization} not found.`);
        process.exit(1);
      }
      if ('rootOrganizationId' in selectedOrg) {
        subOrgToken = await getSubOrgToken(selectedOrg.id);
      }

      const profiles = await getDistributionProfiles({ subOrgToken });

      for (const profile of params.profileNames) {
        if (profiles.some((acProfile: any) => acProfile.name === profile)) {
          existProfiles.push(profile);
        } else {
          await createDistributionProfile({ name: profile, subOrgToken: subOrgToken });
          migratedProfiles.push(profile);
        }
      }

      spinner.succeed(migratedProfiles?.length > 0 ? `Testing Distribution profile(s) Created successfully.` : '');
      if (existProfiles.length > 0) {
        console.log(chalk.bold(`\n${existProfiles}`), `, profile(s) already exist within Appcircle/${selectedOrg.name} organization\n`);
      }

      break;

    default:
      noCommandFound(command);
  }
};

export default handleApps;
