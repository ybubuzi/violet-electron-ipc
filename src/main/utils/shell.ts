import child from 'node:child_process';

type IOStream = Buffer<ArrayBufferLike> | string;
/**
 * 执行命令结果接口定义
 */
interface ExecResult {
  /** 标准输出内容 */
  stdout: IOStream;
  /** 标准错误输出内容 */
  stderr: IOStream;
}

/**
 * 生成进程结果接口定义
 */
interface SpawnResult {
  /** 标准输出缓冲区 */
  stdout: Buffer;
  /** 标准错误输出缓冲区 */
  stderr: Buffer;
  /** 进程退出代码 */
  code: number | null;
}

function concat(sourceBuffer: Buffer, targetBuffer: Buffer): Buffer {
  return Buffer.concat([targetBuffer, sourceBuffer]);
}

/**
 * 执行命令 - 使用 child_process.exec 执行命令并返回结果
 * @param command - 要执行的命令字符串
 * @param execOptions - 执行选项配置
 * @returns 返回包含标准输出和错误输出的 Promise
 */
async function exec(command: string, execOptions: child.ExecOptions = {}): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    child.exec(command, execOptions, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      return resolve({ stdout, stderr });
    });
  });
}

/**
 * 生成子进程 - 使用 child_process.spawn 创建子进程并收集输出
 * @param command - 要执行的命令
 * @param commandArgs - 命令参数数组
 * @param spawnOptions - 生成进程的选项配置
 * @returns 返回包含输出缓冲区和退出代码的 Promise
 */
async function spawn(command: string, commandArgs: string[], spawnOptions: child.SpawnOptions = {}): Promise<SpawnResult> {
  return new Promise<SpawnResult>((resolve, reject) => {
    const childProcess = child.spawn(command, commandArgs, { ...spawnOptions, shell: true });
    const processOutput = { stdout: Buffer.alloc(0), stderr: Buffer.alloc(0) };

    // 监听标准输出数据
    childProcess.stdout?.on('data', (data: Buffer) => {
      // @ts-ignore
      processOutput.stdout = concat(data, processOutput.stdout);
    });

    // 监听标准错误输出数据
    childProcess.stderr?.on('data', (data: Buffer) => {
      // @ts-ignore
      processOutput.stderr = concat(data, processOutput.stderr);
    });

    // 监听进程错误事件
    childProcess.on('error', (err: Error) => {
      reject(err);
    });

    // 监听进程关闭事件
    childProcess.on('close', (exitCode: number | null) => {
      resolve({ ...processOutput, code: exitCode });
    });
  });
}

export { exec, spawn };
