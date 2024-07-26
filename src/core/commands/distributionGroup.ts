import { noCommandFound } from './index';
import { PROGRAM_NAME } from '../../constant';
import { ProgramCommand } from '../../program';
import { getAppDistributionGroups, getOrgDistributionGroups } from '../../services';
import { createOra } from '../../utils/oraHelper';
import { CommandTypes } from '../commands';
import { commandWriter } from '../writer';
import chalk from 'chalk';

import {
  addTesterToTestingGroup,
  createTestingGroup,
  getAppcircleOrganizations,
  getDistributionProfiles,
  getSubOrgToken,
  getTestingGroups,
  updateProfileTestingGroups,
} from '../../services/appcircleApi';
import { collectErrorMessageFromData } from '../../main';

const FULL_COMMANDS = [
  '-distribution-groups-list-org-distgroups',
  '-distribution-groups-list-app-distgroups',
  '-distribution-groups-migrate-org-distgroups',
  '-distribution-groups-migrate-app-distgroups',
];

const handleDistributionGroup = async (command: ProgramCommand, params: any) => {
  const commandName = command.fullCommandName.split(PROGRAM_NAME).pop();

  const spinner = createOra('');
  switch (commandName) {
    case FULL_COMMANDS[0]:
      spinner.text = 'Distribution Groups Fetching';
      spinner.start();
      const distGroupList = await getOrgDistributionGroups(params.organizationName);

      if (distGroupList.length === 0) {
        spinner.fail('No Distribution Groups Found.');
        process.exit(1);
      }

      spinner.succeed('Distribution Groups Fetched successfully.');
      commandWriter(CommandTypes.DISTRIBUTION_GROUPS, {
        fullCommandName: command.fullCommandName,
        data: distGroupList.map((distGroup: any) => ({
          ...distGroup,
          organization_name: params.organizationName,
        })),
      });
      break;

    case FULL_COMMANDS[1]:
      spinner.text = `Distribution Groups Fetching for ${params.appName}`;
      spinner.start();
      const appDistGroupList = await getAppDistributionGroups(params.organizationName, params.appName);
      if (appDistGroupList.length === 0) {
        spinner.fail('No Distribution Groups Found.');
        process.exit(1);
      }

      spinner.succeed('Distribution Groups Fetched successfully.');
      commandWriter(CommandTypes.DISTRIBUTION_GROUPS, {
        fullCommandName: command.fullCommandName,
        data: appDistGroupList.map((distGroup: any) => ({
          ...distGroup,
          organization_name: params.organizationName,
        })),
      });
      break;

    case FULL_COMMANDS[2]:
      spinner.text = `${params.distributionGroupName} Migrating`;
      spinner.start();
      params.distGroupUsersforOrg = Array.isArray(params.distGroupUsersforOrg) ? params.distGroupUsersforOrg : params.distGroupUsersforOrg.split(' ');

      const appcircleOrganizations = await getAppcircleOrganizations();
      const selectedAppcircleOrg = appcircleOrganizations.find((org: any) => org.name === params.appcircleOrganization);
      let subOrganizationToken: undefined | string;

      if (!selectedAppcircleOrg) {
        spinner.fail(`Appcircle Organization ${params.appcircleOrganization} not found.`);
        process.exit(1);
      }
      if ('rootOrganizationId' in selectedAppcircleOrg) {
        subOrganizationToken = await getSubOrgToken(selectedAppcircleOrg.id);
      }

      const testingGroups = await getTestingGroups({ subOrgToken: subOrganizationToken });
      if (testingGroups.some((group: any) => group.name === params.distributionGroupName)) {
        spinner.fail(`"${params.distributionGroupName}" Distribution Group already exists.`);
        process.exit(1);
      }

      const createResponse = await createTestingGroup({ name: params.distributionGroupName, subOrgToken: subOrganizationToken });

      for (let userEmail of params.distGroupUsersforOrg) {
        await addTesterToTestingGroup({ testerEmail: userEmail, testingGroupId: createResponse.id, token: subOrganizationToken }).catch((error) => {
          const data = error.response?.data as any;
          console.error(`\n${chalk.red('✖')} ${error.message} ${chalk.red(error.response?.statusText)}${collectErrorMessageFromData(data)}`);

          process.exit(1);
        });
      }

      spinner.succeed(`${params.distributionGroupName} Migrated successfully.`);
      break;

    case FULL_COMMANDS[3]:
      spinner.text = `${params.distributionGroupNameForApp} Migrating`;
      spinner.start();
      params.distGroupUsersforApp = Array.isArray(params.distGroupUsersforApp) ? params.distGroupUsersforApp : params.distGroupUsersforApp.split(' ');

      const appcircleOrgs = await getAppcircleOrganizations();
      const selectedOrg = appcircleOrgs.find((org: any) => org.name === params.appcircleOrganization);
      let subOrgToken: undefined | string;

      if (!selectedOrg) {
        spinner.fail(`Appcircle Organization ${params.appcircleOrganization} not found.`);
        process.exit(1);
      }
      if ('rootOrganizationId' in selectedOrg) {
        subOrgToken = await getSubOrgToken(selectedOrg.id);
      }

      const testGroupName = params.appName + '-' + params.distributionGroupNameForApp;
      const response = await createTestingGroup({ name: testGroupName, subOrgToken: subOrgToken });

      for (let userEmail of params.distGroupUsersforApp) {
        await addTesterToTestingGroup({ testerEmail: userEmail, testingGroupId: response.id, token: subOrgToken }).catch((error) => {
          const data = error.response?.data as any;
          console.error(`\n${chalk.red('✖')} ${error.message} ${chalk.red(error.response?.statusText)}${collectErrorMessageFromData(data)}`);
          process.exit(1);
        });
      }

      // We try to match appName with the distribution profile name, if it exists we assign the newly created distribution group to the distribution profile automatically.
      const responseProfiles = await getDistributionProfiles({ subOrgToken });
      const testingProfile = responseProfiles.find((testingGroup: any) => testingGroup.name === params.appName);
      if (testingProfile) {
        await updateProfileTestingGroups(testingProfile.id, response.id, testingProfile.testingGroupIds, subOrgToken);
      }

      spinner.succeed(`${params.distributionGroupNameForApp} Migrated successfully.`);

      break;

    default:
      noCommandFound(command);
  }
};

export default handleDistributionGroup;
