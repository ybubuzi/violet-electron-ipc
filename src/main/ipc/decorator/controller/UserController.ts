import { IpcController, IpcMethod } from '..';

@IpcController()
export default class UserController {
  @IpcMethod()
  async login(username: string, password: string) {
    console.log('login', username, password);
    return 'testLogin';
  }

  @IpcMethod()
  async test(username: string, password: string) {
    console.log('login', username, password);
  }
}
