import { ProgramCommand } from '../../program';

export const noCommandFound = (command: ProgramCommand) => {
  const beutufiyCommandName = command.fullCommandName.split('-').join(' ');
  console.error(`"${beutufiyCommandName} ..." command not found \nRun "${beutufiyCommandName} --help" for more information`);
  process.exit(1);
};
