import { CommandTypes } from '../commands';
import { ProgramCommand } from '../../program';
import { getAppCenterUser } from '../../services';
import { commandWriter } from '../writer';
import { EnvironmentVariables, writeEnviromentConfigVariable } from '../../config';
import { PROGRAM_NAME } from '../../constant';
import { appcircleLogin, getAppcirclePAT } from '../../utils/appcircleCLIHelper';
import { noCommandFound } from './index';
import jwt from 'jsonwebtoken';

const handleLogin = async (command: ProgramCommand, params: any) => {
  if (command.fullCommandName === `${PROGRAM_NAME}-login-appcircle`) {
    const token: any = await appcircleLogin(params.appcircleToken);
    const decoded: any = await jwt.decode(token.access_token, { complete: true });
    commandWriter(CommandTypes.LOGIN, { fullCommandName: command.fullCommandName, data: { email: decoded?.payload?.email } });
  } else if (command.fullCommandName === `${PROGRAM_NAME}-login-appcenter`) {
    const response = await getAppCenterUser(params.appcenterToken);
    writeEnviromentConfigVariable(EnvironmentVariables.X_API_TOKEN, params.appcenterToken);
    commandWriter(CommandTypes.LOGIN, { fullCommandName: command.fullCommandName, data: response });
  } else {
    noCommandFound(command);
  }
};

export default handleLogin;
