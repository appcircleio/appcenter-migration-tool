import axios from 'axios';
import { API_HOSTNAME, OptionsType, appcenterApi } from './appcenterApi';
import { EnvironmentVariables, readEnviromentConfigVariable } from '../config';
import { AC_API_HOSTNAME } from './appcircleApi';

export const getOrganizations = async () => {
  const response = await appcenterApi('/orgs');
  return response.data.sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name));
};

export const getOrgDistributionGroups = async (orgName: string) => {
  const response = await appcenterApi(`/orgs/${orgName}/distribution_groups_details`);

  return response.data.sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name));
};

export const getAppDistributionGroups = async (orgName: string, appName: string) => {
  const response = await appcenterApi(`/apps/${orgName}/${appName}/distribution_groups`);

  return response.data.sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name));
};

export const getAllAppCenterApps = async () => {
  const response = await appcenterApi('/apps');

  return response.data.sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name));
};

export const getOrgApps = async (orgName: string) => {
  const response = await appcenterApi(`/orgs/${orgName}/apps`);

  return response.data.sort((a: { name: string }, b: { name: any }) => a.name.localeCompare(b.name));
};

/*
  * This function is used to get the App Center user information
  * Since appcenterApi created when cli is started, We can not fetch the token from the config file
  * So, we need to fetch user with the token that is provided by the user
  
*/
export const getAppCenterUser = async (token: string) => {
  const api = axios.create({
    baseURL: API_HOSTNAME,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Token': token,
    },
  });

  const response = await api.get('/user');

  return response.data;
};

export const getOrgUsers = async (orgName: string) => {
  const response = await appcenterApi(`/orgs/${orgName}/users`);

  return response.data.sort((a: { email: string }, b: { email: any }) => a.email.localeCompare(b.email));
};

export const getDistGroupUsers = async (orgName: string, distGroupName: string) => {
  const response = await appcenterApi(`/orgs/${orgName}/distribution_groups/${distGroupName}/members`);

  return response.data;
};

export const getDistGroupUsersForApp = async (orgName: string, appName: string, distGroupName: string) => {
  const response = await appcenterApi(`/apps/${orgName}/${appName}/distribution_groups/${distGroupName}/members`);

  return response.data.sort((a: { email: string }, b: { email: any }) => a.email.localeCompare(b.email));
};
