import axios, { AxiosRequestConfig } from 'axios';
import { OptionsType } from './appcenterApi';
import qs from 'querystring';
import { EnvironmentVariables, readEnviromentConfigVariable, writeEnviromentConfigVariable } from '../config';
import jwt from 'jsonwebtoken';

export const AC_API_HOSTNAME = readEnviromentConfigVariable(EnvironmentVariables.AC_API_HOSTNAME);
export const AUTH_HOSTNAME = readEnviromentConfigVariable(EnvironmentVariables.AC_AUTH_HOSTNAME);

export const appcircleApi = axios.create({
  baseURL: AC_API_HOSTNAME.endsWith('/') ? AC_API_HOSTNAME : `${AC_API_HOSTNAME}/`,
});

// appcircleApi.interceptors.request.use((config) => {
//   console.log('config:', config.baseURL);

//   config.headers = getHeaders();

//   return config;
// });

export const getHeaders = (token?: string, withToken = true): AxiosRequestConfig['headers'] => {
  let response: AxiosRequestConfig['headers'] = {
    accept: 'application/json',
    'User-Agent': 'Appcircle CLI/1.0.3',
  };

  if (withToken) {
    response.Authorization = `Bearer ${token ?? readEnviromentConfigVariable(EnvironmentVariables.AC_ACCESS_TOKEN)}`;
  }
  return response;
};

// Login

export async function getACToken(options: OptionsType<{ pat: string; subOrgId?: string }>) {
  // console.log('AC_AUTH_HOSTNAME:', AUTH_HOSTNAME);
  // const endpointURL = `${AUTH_HOSTNAME}/auth/v1/token`;
  // const response = await axios.post(endpointURL, qs.stringify({ pat: options.pat }), {
  //   headers: {
  //     accept: 'application/json',
  //     'content-type': 'application/x-www-form-urlencoded',
  //   },
  // });
  // return response.data;

  const url = 'https://dev-auth.appcircle.io/auth/realms/appcircle/protocol/openid-connect/token';
  const headers: any = {
    Authorization: options.pat,
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  if (options.subOrgId) {
    headers['Sub-Organization-Id'] = options.subOrgId;
  }

  const data = new URLSearchParams();
  data.append('grant_type', 'password');
  data.append('client_id', 'appcircle-web');
  data.append('client_secret', 'fc39c736-293a-450d-8c06-9e719e688251');
  data.append('scope', 'openid profile');

  const response = await axios.post(url, data, { headers });

  if (options.subOrgId) {
    writeEnviromentConfigVariable(options.subOrgId, response.data);
  }

  return response.data;
}

function isTokenExpired(token: string, bufferTimeInMinutes = 30) {
  try {
    const decodedToken: any = jwt.decode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferTimeInMinutes * 60;

    if (decodedToken.exp < currentTime) {
      return true;
    } else if (decodedToken.exp - currentTime <= bufferTime) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
}

export async function getSubOrgToken(subOrgId: string) {
  try {
    const token: any = readEnviromentConfigVariable(subOrgId);
    if (token && !isTokenExpired(token.access_token)) {
      return token.access_token;
    }

    const mainPAT = readEnviromentConfigVariable(EnvironmentVariables.AC_PAT);
    const getSubOrgToken = await getACToken({ pat: mainPAT, subOrgId: subOrgId });

    return getSubOrgToken.access_token;
  } catch (error) {
    console.log('Error getting sub org token:', error);
    process.exit(1);
  }
}

// Distribution Module

export async function getDistributionProfiles(options?: { subOrgToken?: string }) {
  const distributionProfiles = await appcircleApi.get(`distribution/v2/profiles`, {
    headers: getHeaders(options?.subOrgToken),
  });
  return distributionProfiles.data;
}

export async function createDistributionProfile(options: OptionsType<{ name: string; subOrgToken?: string }>) {
  const response = await appcircleApi.post(
    `/distribution/v2/profiles`,
    { name: options.name },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.subOrgToken ?? readEnviromentConfigVariable(EnvironmentVariables.AC_ACCESS_TOKEN)}`,
      },
    },
  );

  return response.data;
}

export async function getTestingGroups() {
  const response = await appcircleApi.get(`distribution/v2/testing-groups`, {
    headers: getHeaders(),
  });
  return response.data;
}

export async function createTestingGroup(options: OptionsType<{ name: string }>) {
  const { name } = options;
  const response = await appcircleApi.post(
    `distribution/v2/testing-groups`,
    { name },
    {
      headers: getHeaders(),
    },
  );
  return response.data;
}

export async function addTesterToTestingGroup(options: OptionsType<{ testerEmail: string; testingGroupId: string }>) {
  const response = await appcircleApi.post(`distribution/v2/testing-groups/${options.testingGroupId}/testers`, [options.testerEmail], {
    headers: getHeaders(),
  });
  return response.data;
}

export const updateProfileTestingGroups = async (profileId: string, testingGroupId: string, testingProfiles: any) => {
  const testingGroupIds = Array.isArray(testingProfiles) ? [...testingProfiles, testingGroupId] : [testingGroupId];

  const response = await axios.patch(
    `${AC_API_HOSTNAME}/distribution/v1/profiles/${profileId}`,
    {
      testingGroupIds: testingGroupIds,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readEnviromentConfigVariable(EnvironmentVariables.AC_ACCESS_TOKEN)}`,
      },
    },
  );

  return response.data;
};

// Organization Module

export const getAppcircleOrganizations = async () => {
  const response = await appcircleApi.get(`/identity/v1/organizations`, {
    headers: getHeaders(),
  });

  return response.data.data;
};

export const createSubOrganization = async (orgName: string) => {
  const response = await axios.post(
    `${AC_API_HOSTNAME}/identity/v1/organizations/current/sub-organizations`,
    {
      name: orgName,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${readEnviromentConfigVariable(EnvironmentVariables.AC_ACCESS_TOKEN)}`,
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
  let roles = Array.isArray(options.role) ? options.role : [options.role];
  roles = roles.includes('owner') ? ['owner'] : roles;

  const invitationRes = await axios.patch(
    `${AC_API_HOSTNAME}/identity/v1/users?action=invite&organizationId=${options.organizationId}`,
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
        Authorization: `Bearer ${readEnviromentConfigVariable(EnvironmentVariables.AC_ACCESS_TOKEN)}`,
      },
    },
  );
  return invitationRes.data;
};
