import { IpcController, IpcMethod } from '..';

@IpcController('hadaController')
export default class TestController {
  aa: string = 'aa';

  /**
   * 此方法未暴露
   * @param username
   * @param password
   */
  async login(username: string, password: string) {
    console.log('login', username, password);
  }

  /**
   * 测试方法
   * @param username 用户名
   * @param password 密码
   */
  @IpcMethod()
  private test(username: string, password: string) {
    console.log('login', username, password);
    return 'test';
  }
}
