import { exec } from 'child_process';
import { PROGRAM_NAME } from '../constant';

function runCLICommand(command: string, retry: boolean = true): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(command, (error: any, stdout: any, stderr: any) => {
      if (error) {
        if (!retry) {
          let errorMessage = stderr
            .replace('- Fetching...', '')
            .replace('Run "login --help" command for more information.', `Run "${PROGRAM_NAME} appcircle login --help" command for more information.`);
          console.error(errorMessage);

          process.exit(1);
        }
        if (retry) {
          runCLICommand(command.replace('-o json', ''), false);
        }
      } else {
        resolve(stdout);
      }
    });
  });
}

export const getAppcirclePAT = async () => {
  const jwtToken = await runCLICommand(`npx appcircle config get AC_ACCESS_TOKEN -o json`);
  return JSON.parse(jwtToken);
};

export const appcircleLogin = async (pat: string): Promise<string> => {
  const response = await runCLICommand('npx appcircle login --pat=' + pat + ' -o json');

  return JSON.parse(response);
};

export const getAppcircleOrganizations = async () => {
  const commandResponse = await runCLICommand(`npx appcircle organization view -o json`);

  return JSON.parse(commandResponse).sort((a: any, b: any) => a.name.localeCompare(b.name));
};

export const createTestingDistributionProfile = async (profileName: string) => {
  const command = `npx appcircle testing-distribution profile create --name=${profileName}`;
  const response = await runCLICommand(command);

  return response;
};

export const getAllTestingDistProfiles = async () => {
  const commandResponse = await runCLICommand(`npx appcircle testing-distribution profile list -o json`);

  return JSON.parse(commandResponse);
};

export const createDistGroup = async (distGroupName: string) => {
  const command = `npx appcircle testing-distribution testing-group create --name "${distGroupName}" o json`;
  const response = await runCLICommand(command);

  return response;
};

export const getTestingGroups = async () => {
  const commandResponse = await runCLICommand(`npx appcircle testing-distribution testing-group list -o json`);

  return JSON.parse(commandResponse);
};

export const addTester = async (testingGroupId: string, testEmail: string) => {
  const command = `npx appcircle testing-distribution testing-group tester add --testingGroupId=${testingGroupId} --testerEmail=${testEmail}`;
  const response = await runCLICommand(command);

  return response;
};

export const getTestingDistProfiles = async () => {
  const commandResponse = await runCLICommand(`npx appcircle testing-distribution profile list -o json`);

  return JSON.parse(commandResponse);
};
