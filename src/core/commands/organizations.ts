import { CommandTypes } from '../commands';
import { ProgramCommand } from '../../program';
import { commandWriter } from '../writer';
import { PROGRAM_NAME } from '../../constant';
import { noCommandFound } from './index';
import { createOra } from '../../utils/oraHelper';
import { getAppDistributionGroups, getOrgDistributionGroups, getOrgUsers, getOrganizations } from '../../services';
import { createSubOrganization, getAppcircleOrganizations, inviteUserToOrganization } from '../../services/appcircleApi';

const FULL_COMMANDS = ['-organizations-list-appcenter-orgs', '-organizations-migrate-orgs', '-organizations-migrate-collab'];

type RoleMapperReturnType = { [key: string]: string | undefined };
const appCenterTestingGroupMapping = (role: string) => {
  const roleMapping: RoleMapperReturnType = {
    admin: 'manage',
    collaborator: 'manage',
    member: 'view',
  };

  return (roleMapping[role] ?? 'None') + '-distribution-group';
};

const appcenterDistProfileMapping = (role: string) => {
  const roleMapping: RoleMapperReturnType = {
    admin: 'manage',
    collaborator: 'operate',
    member: 'view',
  };

  return (roleMapping[role] ?? 'None') + '-distribution-profile';
};

const handleOrganizations = async (command: ProgramCommand, params: any) => {
  const commandName = command.fullCommandName.split(PROGRAM_NAME).pop();

  const spinner = createOra('');
  switch (commandName) {
    case FULL_COMMANDS[0]:
      spinner.text = 'Fetching App Center Organizations';
      spinner.start();
      const organizationList = await getOrganizations();
      spinner.succeed('App Center Organizations fetched successfully. Here is the list of your App Center account organizations:');
      commandWriter(CommandTypes.ORGANIZATIONS, {
        fullCommandName: command.fullCommandName,
        data: organizationList,
      });
      break;

    case FULL_COMMANDS[1]:
      spinner.text = 'Organization(s) creation migration in progress';
      spinner.start();
      params.organizationNames = Array.isArray(params.organizationNames) ? params.organizationNames : params.organizationNames.split(' ');

      const appcircleOrgs = await getAppcircleOrganizations();

      for (let orgName of params.organizationNames) {
        await createSubOrganization(addNameWithSuffix(appcircleOrgs, orgName));
      }

      spinner.succeed('Organization(s) migrated successfully.');
      break;

    case FULL_COMMANDS[2]:
      spinner.text = 'Selected Organization Collaborators Fetching';
      spinner.start();
      params.organizationUsers = Array.isArray(params.organizationUsers) ? params.organizationUsers : params.organizationUsers.split(' ');

      const organizationUsers = await getOrgUsers(params.organizationName);

      const selectedAppcircleOrg = (await getAppcircleOrganizations()).filter((org: any) => params.appcircleOrganization.includes(org.name));
      for (let email of params.organizationUsers) {
        const selectedUser = organizationUsers.find((orgUser: any) => orgUser.email === email);
        const testGroupRole = appCenterTestingGroupMapping(selectedUser.role);
        const distProfileRole = appcenterDistProfileMapping(selectedUser.role);

        await inviteUserToOrganization({ organizationId: selectedAppcircleOrg[0].id, email, role: [testGroupRole, distProfileRole] }).catch((err) =>
          console.error(`\nFailed to migrate ${email}, ${err}\n`),
        );
        spinner.text = `${email} invited to selected organizations`;
      }

      spinner.succeed('Selected Organization Collaborators migrated successfully.');

      break;

    default:
      noCommandFound(command);
  }
};

export default handleOrganizations;

function addNameWithSuffix(nameArray: any, orgName: string) {
  const regex = /^(.*?)(?:-(\d+))?$/;

  let highestSuffix = -1;
  nameArray.forEach((obj: any) => {
    if (obj.name.startsWith(orgName)) {
      const match = obj.name.match(regex);
      if (match) {
        const suffix = parseInt(match[2] || 0);
        highestSuffix = Math.max(highestSuffix, suffix);
      }
    }
  });

  if (highestSuffix === -1) {
    return orgName;
  }

  const newSuffix = highestSuffix + 1;
  const newNameWithSuffix = `${orgName}-${newSuffix}`;
  return newNameWithSuffix;
}
