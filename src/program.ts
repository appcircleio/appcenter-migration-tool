import { CommandTypes } from './core/commands';
import { Command } from 'commander';

export type ProgramCommand = {
  fullCommandName: string;
  isGroupCommand: (commandName: CommandTypes) => boolean;
  parent: Command | null;
  name: () => string;
  args: any;
  opts: () => { [key: string]: any };
};
