import chalk from 'chalk';
import { CommandType, commands } from './commands';
import { APPCIRCLE_COLOR } from '../constant';
import { Command } from 'commander';

//@ts-ignore https://github.com/enquirer/enquirer/issues/212
import { AutoComplete } from 'enquirer';
import { ProgramCommand } from '../program';
import { runCommand } from './commandRunner';
import { PROGRAM_NAME } from '../constant';
import handleInteractiveParamsOrArguments from '../interactiveRunner/handleInteractiveParamsOrArguments';

const handleSelectedCommand = async (command: CommandType, __parentCommand?: any): Promise<ProgramCommand | undefined> => {
  const preparedCommand = await handleCommandParamsAndArguments(command, __parentCommand);
  if (command.subCommands?.length) {
    const commandSelect = new AutoComplete({
      name: 'action',
      limit: 10,
      message: `Which sub-command of "${command.command}" do you want to run?${` (${command.subCommands.length} Options)`}`,
      choices: command.subCommands.map((cmd, index) => {
        return {
          name: cmd.command,
          message: `${index + 1}. ${cmd.description}`,
        };
      }),
    });
    const slectedCommandName = await commandSelect.run();
    const selectedCommand = command.subCommands.find((s) => s.command === slectedCommandName);
    return handleSelectedCommand(selectedCommand as CommandType, preparedCommand);
  }
  return preparedCommand;
};

const prepareFullCommandName = (command: Command): string => {
  if (command.parent) {
    return prepareFullCommandName(command.parent) + '-' + command.name();
  }
  return PROGRAM_NAME;
};

export const createCommandActionCallback = (actionCommand: any, thisCommand?: any): ProgramCommand => {
  const fullCommandName = prepareFullCommandName(actionCommand);

  return {
    fullCommandName: prepareFullCommandName(actionCommand),
    isGroupCommand: (commandName: string) => fullCommandName.includes(`${PROGRAM_NAME}-${commandName}`),
    parent: actionCommand.parent,
    name: () => actionCommand.name(),
    args: () => (Array.isArray(actionCommand.args) ? actionCommand.args : actionCommand.args()),
    opts: () => ({ ...thisCommand?.opts(), ...actionCommand.opts() }),
  };
};

export const runCommandsInteractively = async () => {
  let selectedCommand: (typeof commands)[number];
  let selectedCommandIndex = -1;

  const commandSelect = new AutoComplete({
    name: 'command',
    message: `What do you want to do?${` (${commands.length} Options)`}`,
    limit: 10,
    choices: [...commands.map((command, index) => `${index + 1}. ${command.description}`)],
  });

  selectedCommandIndex = Number((await commandSelect.run()).split('.')[0]) - 1;
  selectedCommand = commands[selectedCommandIndex];

  const preparedProgramCommand = await handleSelectedCommand(selectedCommand, {});

  if (preparedProgramCommand) {
    runCommand(preparedProgramCommand);
  }
};

const handleCommandParamsAndArguments = async (selectedCommand: CommandType, parentCommand: any): Promise<ProgramCommand | undefined> => {
  const params = (await handleInteractiveParamsOrArguments(selectedCommand.params || [])) || {};
  const args = (await handleInteractiveParamsOrArguments(selectedCommand.arguments || [])) || {};
  return createCommandActionCallback({
    parent: parentCommand || null,
    name: () => selectedCommand.command,
    opts: () => params,
    args: () => Object.values(args),
  });
};
