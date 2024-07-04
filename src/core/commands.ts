export enum CommandParameterTypes {
  SELECT = 'select',
  BOOLEAN = 'boolean',
  STRING = 'input',
  PASSWORD = 'password',
  MULTIPLE_SELECT = 'multipleSelect',
}

export enum CommandTypes {
  LOGIN = 'login',
  ORGANIZATIONS = 'organizations',
  APPS = 'apps',
  DISTRIBUTION_GROUPS = 'distribution-groups',
}

export type ParamType = {
  name: string;
  description: string;
  longDescription?: string;
  type: CommandParameterTypes;
  valueType?: string;
  required?: boolean;
  params?: any[];
  requriedForInteractiveMode?: boolean;
  skipForInteractiveMode?: boolean;
  paramType?: string;
  defaultValue?: any;
  from?: 'user' | 'default';
};

export type CommandType = {
  command: string;
  description: string;
  longDescription?: string;
  ignore?: boolean;
  subCommands?: CommandType[];
  arguments?: ParamType[];
  params: ParamType[];
};

export const commands: CommandType[] = [
  {
    command: CommandTypes.LOGIN,
    description: 'Login',
    longDescription: 'Log in to connect Appcircle or App Center account',
    params: [],
    subCommands: [
      {
        command: 'appcenter',
        description: 'App Center Account',
        longDescription: 'Log in to your App Center account',
        params: [
          {
            name: 'appcenterToken',
            description: 'App Center User API token',
            type: CommandParameterTypes.STRING,
            valueType: 'string',
          },
        ],
      },
      {
        command: 'appcircle',
        description: 'Appcircle Account',
        longDescription: 'Log in to your Appcircle account',
        params: [
          {
            name: 'appcircleToken',
            description: 'Appcircle Personal API Token',
            type: CommandParameterTypes.STRING,
            valueType: 'string',
          },
        ],
      },
    ],
  },
  {
    command: CommandTypes.ORGANIZATIONS,
    description: 'Organizations',
    longDescription: 'List and update available organizations in App Center',
    params: [],
    subCommands: [
      {
        command: 'list-appcenter-organizations',
        description: 'List App Center Organizations',
        longDescription: 'List available organizations at App Center',
        params: [],
      },
      {
        command: 'migrate',
        description: 'Migrate App Center Organization to Appcircle',
        longDescription: 'Create App Center organization at Appcircle',
        params: [
          {
            name: 'organizationNames',
            description: 'App Center Organization Names',
            type: CommandParameterTypes.MULTIPLE_SELECT,
            valueType: 'string',
          },
        ],
      },
      {
        command: 'migrate-collaborators',
        description: 'Migrate App Center Organization Collaborators',
        longDescription: 'Migrate App Center organization collaborators',
        params: [
          {
            name: 'organizationName',
            description: 'App Center Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
            requriedForInteractiveMode: true,
            required: true,
          },
          {
            name: 'organizationUsers',
            description: 'Organizations Users for Migration',
            type: CommandParameterTypes.MULTIPLE_SELECT,
            valueType: 'string',
            requriedForInteractiveMode: true,
            required: true,
            skipForInteractiveMode: true,
          },
          {
            name: 'appcircleOrganization',
            description: 'Appcircle Organization for Migration',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
            requriedForInteractiveMode: true,
            required: true,
          },
        ],
      },
    ],
  },
  {
    command: CommandTypes.APPS,
    description: 'App Center Apps',
    longDescription: 'List and migrate available apps in App Center',
    params: [],
    subCommands: [
      {
        command: 'list',
        description: 'List All App Center Apps',
        longDescription: 'List available apps in App Center',
        params: [],
      },
      {
        command: 'list-organization',
        description: 'List Organization Based App Center Apps',
        longDescription: 'List Organization Based App Center Apps',
        params: [
          {
            name: 'organizationName',
            description: 'App Center Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
        ],
      },
      {
        command: 'migrate-profile',
        description: 'Migrate App Center App to Appcircle Testing Distribution Profile',
        longDescription: 'Migrate App Center App to Appcircle Testing Distribution Profile',
        params: [
          {
            name: 'profileNames',
            description: 'App Center App Name for Testing Distribution profile',
            type: CommandParameterTypes.MULTIPLE_SELECT,
            valueType: 'string',
          },
        ],
      },
    ],
  },
  {
    command: CommandTypes.DISTRIBUTION_GROUPS,
    description: 'App Center Distribution Groups',
    longDescription: 'List available distribution groups in App Center',
    params: [],
    subCommands: [
      {
        command: 'list-organization',
        description: 'List App Center Organization Distribution Groups',
        longDescription: 'List available distribution groups in App Center',
        params: [
          {
            name: 'organizationName',
            description: 'Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
        ],
      },
      {
        command: 'list-app',
        description: 'List App Center App Distribution Groups',
        longDescription: "List available App's Distribution Groups in App Center",
        params: [
          {
            name: 'organizationName',
            description: 'Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'appName',
            description: 'App Name',
            longDescription: 'App Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
        ],
      },
      {
        command: 'migrate-organization',
        description: 'Migrate App Center Organization Based Distribution Group to Appcircle',
        longDescription: 'Migrate App Center Organization Distribution Group to Appcircle',
        params: [
          {
            name: 'organizationName',
            description: 'Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'distributionGroupName',
            description: 'Distribution Group Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'distGroupUsers',
            description: 'Users to migrate from App Center Distribution Group',
            type: CommandParameterTypes.MULTIPLE_SELECT,
            valueType: 'string',
            required: true,
          },
        ],
      },
      {
        command: 'migrate-app',
        description: 'Migrate App Center App Distribution Group to Appcircle',
        longDescription: 'Migrate App Center App Distribution Group to Appcircle',
        params: [
          {
            name: 'organizationName',
            description: 'App Center Organization Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'appName',
            description: 'App Center App Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'distributionGroupNameForApp',
            description: 'App Center Distribution Group Name',
            type: CommandParameterTypes.SELECT,
            valueType: 'string',
          },
          {
            name: 'distGroupUsersForApp',
            description: 'Distribution Group Users',
            type: CommandParameterTypes.MULTIPLE_SELECT,
            valueType: 'string',
          },
          // {
          //   name: 'appcircleProfileName',
          //   description: 'Appcircle Testing Distribution Profile Name',
          //   longDescription: 'Appcircle Testing Distribution Profile Name',
          //   type: CommandParameterTypes.SELECT,
          //   valueType: 'string',
          // },
        ],
      },
    ],
  },
];
