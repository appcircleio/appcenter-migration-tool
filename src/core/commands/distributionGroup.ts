import { noCommandFound } from './index';
import { PROGRAM_NAME } from '../../constant';
import { ProgramCommand } from '../../program';
import { getAppDistributionGroups, getOrgApps, getOrgDistributionGroups, updateProfileTestingGroups } from '../../services';
import { addTester, createDistGroup, getTestingDistProfiles, getTestingGroups } from '../../utils/appcircleCLIHelper';
import { createOra } from '../../utils/oraHelper';
import { CommandTypes } from '../commands';
import { commandWriter } from '../writer';

const FULL_COMMANDS = [
  '-distribution-groups-list-organization',
  '-distribution-groups-list-app',
  '-distribution-groups-migrate-organization',
  '-distribution-groups-migrate-app',
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

      const testingGroups = await getTestingGroups();
      if (testingGroups.some((group: any) => group.name === params.distributionGroupName)) {
        spinner.fail(`"${params.distributionGroupName}" Distribution Group already exists.`);
        process.exit(1);
      }

      await createDistGroup(params.distributionGroupName).catch((err) => {
        console.error(err);
        process.exit(1);
      });

      const createdTestingGroupId = (await getTestingGroups()).find((group: any) => group.name === params.distributionGroupName).id;
      for (let userEmail of params.distGroupUsers) {
        await addTester(createdTestingGroupId, userEmail).catch((err) => {
          console.error(err);
          process.exit(1);
        });
      }

      spinner.succeed(`${params.distributionGroupName} Migrated successfully.`);
      break;

    case FULL_COMMANDS[3]:
      spinner.text = `${params.distributionGroupNameForApp} Migrating`;
      spinner.start();

      const testGroupName = params.appName + '-' + params.distributionGroupNameForApp;
      await createDistGroup(testGroupName).catch((err) => {
        console.error(err);
        process.exit(1);
      });

      const createdAppTestingGroupId = (await getTestingGroups()).find((group: any) => group.name === testGroupName).id;

      for (let userEmail of params.distGroupUsersForApp) {
        await addTester(createdAppTestingGroupId, userEmail).catch((err) => {
          console.error(err);
          process.exit(1);
        });
      }

      // We try to match appName with the distribution profile name, if it exists we assign the newly created distribution group to the distribution profile automatically.
      const testingProfile = (await getTestingDistProfiles()).find((testingGroup: any) => testingGroup.name === params.appName);
      await updateProfileTestingGroups(testingProfile.id, createdAppTestingGroupId, testingProfile.testingGroupIds).catch(() => {});

      spinner.succeed(`${params.distributionGroupNameForApp} Migrated successfully.`);

      break;

    default:
      noCommandFound(command);
  }
};

export default handleDistributionGroup;
