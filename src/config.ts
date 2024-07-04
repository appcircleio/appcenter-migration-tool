import Conf from 'conf';

export type ConsoleOutputType = 'json' | 'plain';

let output_type = (process.env.CONSOLE_OUTPUT_TYPE || 'plain') as ConsoleOutputType;

export const setConsoleOutputType = (type: ConsoleOutputType) => {
  output_type = type;
};
export const getConsoleOutputType = () => {
  return output_type;
};

export enum EnvironmentVariables {
  API_HOSTNAME = 'API_HOSTNAME',
  X_API_TOKEN = 'X_API_TOKEN',
}

export const DefaultEnvironmentVariables = {
  API_HOSTNAME: 'https://api.appcenter.ms/v0.1',
  X_API_TOKEN: '',
};

const config = new Conf<{
  current: string;
  envs: { [key: string]: typeof DefaultEnvironmentVariables };
}>({
  defaults: {
    current: 'default',
    envs: { default: DefaultEnvironmentVariables },
  },
});

export function writeEnviromentConfigVariable(variable: EnvironmentVariables, value: string): void {
  const current = config.get('current') || 'default';
  try {
    config.set(`envs.${current}.${variable}`, value);
  } catch {
    console.error('Could not write variable to the config file.');
  }
}

export function readEnviromentConfigVariable(variable: EnvironmentVariables): string {
  const current = config.get('current') || 'default';
  try {
    return config.get(`envs.${current}.${variable}`) || '';
  } catch {
    console.error('Could not read data, returning empty.');
    return '';
  }
}

export function clearConfigs() {
  config.clear();
}
