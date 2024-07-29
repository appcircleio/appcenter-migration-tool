import Conf from 'conf';
import { AC_API_HOSTNAME } from './services/appcircleApi';

export type ConsoleOutputType = 'json' | 'plain';

let output_type = (process.env.CONSOLE_OUTPUT_TYPE || 'plain') as ConsoleOutputType;

export const setConsoleOutputType = (type: ConsoleOutputType) => {
  output_type = type;
};
export const getConsoleOutputType = () => {
  return output_type;
};

export enum EnvironmentVariables {
  // App Center
  API_HOSTNAME = 'API_HOSTNAME',
  APPCENTER_TOKEN = 'APPCENTER_TOKEN',
  // Appcircle
  AC_ACCESS_TOKEN = 'AC_ACCESS_TOKEN',
  AC_PAT = 'AC_PAT',
  AC_API_HOSTNAME = 'AC_API_HOSTNAME',
  AC_AUTH_HOSTNAME = 'AC_AUTH_HOSTNAME',
}

export const DefaultEnvironmentVariables = {
  API_HOSTNAME: 'https://api.appcenter.ms/v0.1',
  APPCENTER_TOKEN: '',
  AC_API_HOSTNAME: 'https://api.appcircle.io',
  AC_AUTH_HOSTNAME: 'https://auth.appcircle.io',
  AC_ACCESS_TOKEN: '',
  AC_PAT: '',
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

export function writeEnviromentConfigVariable(variable: EnvironmentVariables | string, value: string): void {
  const current = config.get('current') || 'default';
  try {
    config.set(`envs.${current}.${variable}`, value);
  } catch {
    console.error('Could not write variable to the config file.');
  }
}

export function readEnviromentConfigVariable(variable: EnvironmentVariables | string): string {
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
