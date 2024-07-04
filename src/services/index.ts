import axios from 'axios';
import { API_HOSTNAME, OptionsType, appcenterApi } from './appcenterApi';
import { getAppcirclePAT } from '../utils/appcircleCLIHelper';

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

/* Appcircle API */

export async function createDistributionProfile(options: OptionsType<{ name: string }>) {
  const appcirclePAT = await getAppcirclePAT();

  const response = await axios.post(
    `https://api.appcircle.io/distribution/v2/profiles`,
    { name: options.name, organizationId: '874d2262-aeae-4412-b1e4-48d0881331d3', pinned: true },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appcirclePAT.AC_ACCESS_TOKEN}`,
      },
    },
  );
  return response.data;
}

export const createSubOrganization = async (orgName: string) => {
  const appcirclePAT = await getAppcirclePAT();

  const response = await axios.post(
    'https://api.appcircle.io/identity/v1/organizations/current/sub-organizations',
    {
      name: orgName,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appcirclePAT.AC_ACCESS_TOKEN}`,
      },
    },
  );

  return response.data;
};

export const updateProfileTestingGroups = async (profileId: string, testingGroupId: string, testingProfiles: any) => {
  const appcirclePAT = await getAppcirclePAT();
  const testingGroupIds = Array.isArray(testingProfiles) ? [...testingProfiles, testingGroupId] : [testingGroupId];

  const response = await axios.patch(
    `https://api.appcircle.io/distribution/v1/profiles/${profileId}`,
    {
      testingGroupIds: testingGroupIds,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appcirclePAT.AC_ACCESS_TOKEN}`,
      },
    },
  );

  return response.data;
};

export const inviteUserToOrganization = async (
  options: OptionsType<{
    organizationId: string;
    email: string;
    role: string[] | string;
  }>,
) => {
  const appcirclePAT = await getAppcirclePAT();
  let roles = Array.isArray(options.role) ? options.role : [options.role];
  roles = roles.includes('owner') ? ['owner'] : roles;

  const invitationRes = await axios.patch(
    `https://api.appcircle.io/identity/v1/users?action=invite&organizationId=${options.organizationId}`,
    {
      userEmail: options.email,
      organizationsAndRoles: [
        {
          organizationId: options.organizationId,
          roles: roles,
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${appcirclePAT.AC_ACCESS_TOKEN}`,
      },
    },
  );
  return invitationRes.data;
};
