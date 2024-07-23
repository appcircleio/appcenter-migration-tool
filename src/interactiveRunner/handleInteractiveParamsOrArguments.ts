import { CommandType, CommandParameterTypes } from '../core/commands';
import {
  getOrganizations,
  getOrgUsers,
  getDistGroupUsers,
  getDistGroupUsersForApp,
  getOrgDistributionGroups,
  getAppDistributionGroups,
  getOrgApps,
  getAllAppCenterApps,
} from '../services';
import ora from 'ora';
//@ts-ignore https://github.com/enquirer/enquirer/issues/212
import { prompt, AutoComplete, BooleanPrompt } from 'enquirer';
import { getAppcircleOrganizations, getDistributionProfiles } from '../services/appcircleApi';

const handleInteractiveParamsOrArguments = async (
  commandParams: CommandType['params'] | CommandType['arguments'] = [],
): Promise<Record<string, any> | undefined> => {
  let params: any = {};
  const selectAll = { message: 'Select All', value: 'Select All' };

  for (let param of commandParams) {
    if (param.name === 'appcircleToken' || param.name === 'appcenterToken') {
      param.type = CommandParameterTypes.PASSWORD;
    }
    if (param.name === 'organizationName') {
      const spinner = ora('Organizations fetching').start();
      const appcircleOrgs = (await getAppcircleOrganizations()).map((org: any) => org.name);
      const organizationNames = (await getOrganizations()).map((org: any, index: number) => ({
        message: `${index + 1}. ${org.name} ${appcircleOrgs.includes(org.name) ? '| ✅ Available in Appcircle' : ''}`,
        value: org.name,
      }));

      param.params = organizationNames;
      spinner.succeed('Organizations fetched successfully');
    } else if (param.name === 'organizationNames') {
      const spinner = ora('Organizations fetching').start();
      const appcircleOrgs = (await getAppcircleOrganizations()).map((org: any) => org.name);
      const organizationNames = (await getOrganizations()).map((org: any, index: number) => ({
        message: `${index + 1}. ${org.name} ${appcircleOrgs.includes(org.name) ? '| ✅ Available in Appcircle' : ''}`,
        value: org.name,
      }));

      param.params = [selectAll, ...organizationNames];
      spinner.succeed('Organizations fetched successfully');
    } else if (param.name === 'organizationUsers') {
      const spinner = ora('Organization Users fetching').start();
      const organizationUsers = await getOrgUsers(params.organizationName).then((orgs) =>
        orgs.map((org: any, index: number) => ({ message: `${index + 1}. ${org.email}`, value: org.email })),
      );

      if (organizationUsers?.length === 0) {
        spinner.fail(`There is no users in "${params.distributionGroupName}"`);
        return process.exit(1);
      }

      param.params = [selectAll, ...organizationUsers];
      spinner.succeed('Organization Users fetched successfully');
    } else if (param.name === 'distGroupUsers') {
      const spinner = ora('Distribution Group Users fetching').start();
      let organizationUsers = await getDistGroupUsers(params.organizationName, params.distributionGroupName).then((users) =>
        users.map((user: any, index: number) => ({ message: `${index + 1}. ${user.email}`, value: user.email })),
      );

      if (organizationUsers?.length === 0) {
        spinner.fail(`There is no users in "${params.distributionGroupName}"`);
        return process.exit(1);
      }

      param.params = [selectAll, ...organizationUsers];
      spinner.succeed('Organization Users fetched successfully');
    } else if (param.name === 'distGroupUsersForApp') {
      const spinner = ora('Distribution Group Users fetching').start();
      const appUsers = await getDistGroupUsersForApp(params.organizationName, params.appName, params.distributionGroupNameForApp).then((users) =>
        users.map((user: any, index: number) => ({ message: `${index + 1}. ${user.email}`, value: user.email })),
      );

      if (appUsers?.length === 0) {
        spinner.fail(`There is no users in "${params.distributionGroupNameForApp}"`);
        return process.exit(1);
      }

      param.params = [selectAll, ...appUsers];
      spinner.succeed('Organization Users fetched successfully');
    } else if (param.name === 'appcircleOrganization') {
      const spinner = ora('Appcircle Organizations fetching').start();
      const appcircleOrganizations = (await getAppcircleOrganizations()).map((org: any, index: number) => ({
        message: `${index + 1}. ${org.name}`,
        value: org.name,
      }));
      param.params = appcircleOrganizations;
      spinner.succeed('Appcircle Organizations fetched successfully');
    } else if (param.name === 'distributionGroupName') {
      const spinner = ora('Distribution Group fetching').start();
      const distributionGroupNames = (await getOrgDistributionGroups(params.organizationName)).map((distGroup: any, index: number) => ({
        message: `${index + 1}. ${distGroup.name}`,
        value: distGroup.name,
      }));

      if (!Array.isArray(distributionGroupNames) || distributionGroupNames.length === 0) {
        spinner.fail('No distribution groups found');
        process.exit(1);
      }
      param.params = distributionGroupNames;
      spinner.succeed();
    } else if (param.name === 'distributionGroupNameForApp') {
      const spinner = ora('Distribution Group fetching').start();
      const distributionGroupNames = (await getAppDistributionGroups(params.organizationName, params.appName)).map((distGroup: any, index: number) => ({
        message: `${index + 1}. ${distGroup.name}`,
        value: distGroup.name,
      }));

      if (!Array.isArray(distributionGroupNames) || distributionGroupNames.length === 0) {
        spinner.fail('No distribution groups found');
        process.exit(1);
      }
      param.params = [selectAll, ...distributionGroupNames];
      spinner.succeed();
    } else if (param.name === 'appName') {
      const spinner = ora('Apps fetching').start();

      const orgApps = (await getOrgApps(params.organizationName)).map((app: any, index: number) => ({ message: `${index + 1}. ${app.name}`, value: app.name }));
      param.params = orgApps;
      spinner.succeed();
    } else if (param.name === 'profileNames') {
      const spinner = ora('App Center Apps fetching').start();
      const appcircleTestDistProfiles = (await getDistributionProfiles()).map((profile: any) => profile.name);
      const orgApps = (await getAllAppCenterApps()).map((app: any, index: number) => ({
        message: `${index + 1}. ${app.owner.name}/${app.name} ${appcircleTestDistProfiles.includes(app.name) ? '| ✅ Available in Appcircle' : ''}`,
        value: app.name,
      }));
      param.params = orgApps;
      spinner.succeed();
    } else if (param.name === 'appDistGroupName') {
      const spinner = ora('Distribution Group fetching').start();
      const appDistGroupNames = (await getAppDistributionGroups(params.organizationName, params.appName)).map((distGroup: any, index: number) => ({
        message: `${index + 1}. ${distGroup.name}`,
        value: distGroup.name,
      }));
      param.params = appDistGroupNames;
      spinner.succeed();
    } else if (param.name === 'appcircleProfileName') {
      const spinner = ora('Appcircle Profiles fetching').start();
      spinner.succeed('Appcircle Profiles fetched successfully');
      const appcenterApps = (await getAllAppCenterApps()).map((app: any) => app.name);
      const profiles = (await getDistributionProfiles()).map((app: any, index: number) => ({
        message: `${index + 1}. ${app.name} ${appcenterApps.includes(app.name) ? '| ✅ Migrated' : ''}`,
        value: app.name,
      }));
      param.params = profiles;
    }

    // If has paramType and type  match to selected type
    if (!param.paramType || param.paramType === params.type) {
      // Prompt for parameter
      if ([CommandParameterTypes.STRING, CommandParameterTypes.PASSWORD].includes(param.type) && !param.skipForInteractiveMode) {
        const stringPrompt = await prompt([
          {
            type: param.type,
            name: param.name,
            message: param.description,
            validate(value) {
              //@ts-ignore
              if (value.length === 0 && param.required !== false) {
                return 'This field is required';
              }
              return true;
            },
            format(value) {
              if (value.length <= 5) return value; // Return the string as is if it's 5 characters or shorter
              const maskedPart = '*'.repeat(value.length - 5);
              const visiblePart = value.slice(-5);
              return maskedPart + visiblePart;
            },
          },
        ]);
        (params as any)[param.name] = (stringPrompt as any)[Object.keys(stringPrompt)[0]];
      } else if (param.type === CommandParameterTypes.BOOLEAN) {
        const booleanPrompt = new BooleanPrompt({
          name: param.name,
          message: param.description,
        });
        //@ts-ignore
        params[param.name] = await booleanPrompt.run();
      } else if (param.type === CommandParameterTypes.SELECT && param.params) {
        const selectPrompt = new AutoComplete({
          name: param.name,
          message: `${param.description}${param?.params?.length > 10 ? ` (${param.params.length} Options)` : ''}`,
          initial: param.defaultValue,
          limit: 100,
          choices: [
            //@ts-ignore
            ...param.params.map((val: any) => val),
          ],
        });
        (params as any)[param.name] = await selectPrompt.run();
      } else if (param.type === CommandParameterTypes.MULTIPLE_SELECT && param.params) {
        let isSelectedAll = false;

        const selectPrompt = new AutoComplete({
          name: param.name,
          message: `${param.description}${param?.params?.length > 10 ? ` (${param.params.length} Options)` : ''} (Multiple selection with 'space')`,
          initial: param.defaultValue,
          limit: 100,
          multiple: true,
          validate(value: any) {
            if (value.length === 0 && param.required !== false) {
              return 'This field is required';
            }
            return true;
          },
          choices: [
            //@ts-ignore
            ...param.params.map((val: any) => val),
          ],
          indicator(state: any, choice: any) {
            if (choice.name === 'Select All' && choice.enabled) {
              state.choices.forEach((c: any) => {
                if (c.name !== 'Select All') {
                  c.enabled = true;
                }
              });
            }
            return choice.enabled ? '✔' : '✔';
          },
          result(names: string[]) {
            if (names.includes(selectAll.value)) {
              return this.choices.filter((choice: any) => choice.value !== selectAll.value).map((choice: any) => choice.value);
            }

            return names;
          },
        });

        (params as any)[param.name] = await selectPrompt.run();
      }
    }
  }

  return params;
};

export default handleInteractiveParamsOrArguments;
