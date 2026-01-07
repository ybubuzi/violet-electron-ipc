const utils = require("util");
const cp = require("node:child_process");
const promisifiedExec = utils.promisify(cp.exec);
const cachedList = cp
  .execSync("git diff --cached --name-only --diff-filter=ACM")
  .toString();
const pkg = require(`${process.cwd()}/package.json`);

const rule = pkg["lint-staged"];
const regexList = Object.entries(rule).map(([k, v]) => {
  const nk = k.replace("*", "");
  return [nk, v];
});

const fileList = cachedList
  .split(/\n/g)
  .map((i) => i.trim())
  .filter((i) => i != "");
const paddings = [];
for (const filePath of fileList) {
  const cmds = [];
  for (const [ext, cmd] of regexList) {
    if (!filePath.endsWith(ext)) {
      continue;
    }
    cmds.push(...cmd);
  }
  if (cmds.length == 0) {
    continue;
  }
  for (const cmd of cmds) {
    const execCmd = cmd.replace("$1", filePath);
    paddings.push(promisifiedExec(`npx ${execCmd}`));
  }
}
Promise.all(paddings);
