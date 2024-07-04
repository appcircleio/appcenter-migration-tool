import axios from 'axios';
import { getConsoleOutputType, setConsoleOutputType } from './config';
import { runCommand } from './core/commandRunner';
import { runCommandsInteractively } from './core/interactiveRunner';
import { createProgram } from './core/program';
import minimist from 'minimist';
import chalk from 'chalk';
import { PROGRAM_NAME } from './constant';

export class ProgramError extends Error {
  constructor(message: string) {
    super(message);
  }
}

const collectErrorMessageFromData = (data: any) => {
  if (data && (typeof data === 'string' || data instanceof String || data instanceof ArrayBuffer)) {
    return data;
  }
  return data
    ? '\n↳ ' +
        Object.keys(data)
          .filter((k) => k !== 'stackTrace')
          .map((key) => ' -' + key + ': ' + data[key])
          .join('\n↳ ')
    : '';
};

const handleError = (error: any) => {
  if (getConsoleOutputType() === 'json') {
    if (axios.isAxiosError(error)) {
      console.error(
        JSON.stringify({
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        }),
      );
    } else {
      console.error(JSON.stringify(error));
    }
  } else {
    if (axios.isAxiosError(error)) {
      const data = error.response?.data as any;
      console.error(`\n${chalk.red('✖')} ${error.message} ${chalk.red(error.response?.statusText)}${collectErrorMessageFromData(data)}`);
      if (error.response?.status === 401) {
        console.error(`Run ${chalk.cyan(`"${PROGRAM_NAME} login --help"`)} command for more information.`);
      }
    } else if (error?.message) {
      console.error(`\n${chalk.red('✖')} ${error.message} ${chalk.red(error.response?.statusText)}${collectErrorMessageFromData(error)}`);
      if (error?.status === 401) {
        console.error(`Run ${chalk.cyan(`"${PROGRAM_NAME} login --help"`)} command for more information.`);
      }
    } else if (error instanceof ProgramError) {
      console.error(chalk.red('✖'), error.message);
    } else {
      console.error(error);
    }
  }

  process.exit(1);
};

process.on('unhandledRejection', (error) => {
  handleError(error);
});

process.on('unCaughtException', (error) => {
  handleError(error);
});

const main = async () => {
  const program = createProgram();
  const argv = minimist(process.argv.slice(2));
  try {
    setConsoleOutputType(argv.output || argv.o || 'plain');
    if (process.argv.length === 2 || argv.i || argv.interactive) {
      runCommandsInteractively();
    } else {
      program.onCommandRun(runCommand);
      try {
        program.parse();
      } catch (err) {
        //handling command error
        process.exit(1);
      }
    }
  } catch (error) {
    if (getConsoleOutputType() === 'json') {
      console.error(JSON.stringify(error));
    } else {
      if (axios.isAxiosError(error)) {
        console.error(`${error.message} ${error.code}`);
      } else {
        console.error(error);
      }
    }
  }
};

main();
