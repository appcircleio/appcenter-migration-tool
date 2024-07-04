import { CommandTypes } from './commands';
import { ProgramCommand } from '../program';
import handleLogin from './commands/login';
import { noCommandFound } from './commands/index';
import handleOrganizations from './commands/organizations';
import handleApps from './commands/apps';
import handleDistributionGroup from './commands/distributionGroup';

export const runCommand = async (command: ProgramCommand) => {
  const params = command.opts() as any;

  //In interactive mode, if any parameters have errors, we can't continue execution.
  if (params.isError) {
    process.exit(1);
  }

  if (command.isGroupCommand(CommandTypes.LOGIN)) {
    return handleLogin(command, params);
  }

  if (command.isGroupCommand(CommandTypes.ORGANIZATIONS)) {
    return handleOrganizations(command, params);
  }

  if (command.isGroupCommand(CommandTypes.APPS)) {
    return handleApps(command, params);
  }

  if (command.isGroupCommand(CommandTypes.DISTRIBUTION_GROUPS)) {
    return handleDistributionGroup(command, params);
  }

  noCommandFound(command);
};
