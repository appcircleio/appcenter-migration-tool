import axios from 'axios';

import { EnvironmentVariables, readEnviromentConfigVariable } from '../config';

export const API_HOSTNAME = readEnviromentConfigVariable(EnvironmentVariables.API_HOSTNAME);
export const APPCENTER_TOKEN = readEnviromentConfigVariable(EnvironmentVariables.APPCENTER_TOKEN);

export type OptionsType<T = {}> = Record<string, any> & { output?: 'json' | 'plain' } & T;

export const appcenterApi = axios.create({
  baseURL: API_HOSTNAME,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': APPCENTER_TOKEN,
  },
});
