// Invoked on the commit-msg git hook by simple-git-hooks.

const colors = require("picocolors");
const fs = require("node:fs");
const msgPath = process.argv[2];
const msg = fs.readFileSync(msgPath, "utf-8").trim();

const commitRE_en =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;
const commitRE_cn =
  /^(还原提交: )?(功能|修复|文档|开发体验|样式|重构|性能|测试|工作流|构建|持续集成|杂项|类型|进行中|发布)(\(.+\))?: .{1,50}/;

if (!(commitRE_en.test(msg) || commitRE_cn.test(msg))) {
  console.log();
  console.error(
    `  ${colors.bgRed(colors.white(" 错误 "))} ${colors.red(`提交消息格式无效。`)}\n\n` +
      colors.red(`  自动生成变更日志需要正确的提交消息格式. 例子:\n`) +
      `    ${colors.green(`功能: 添加[评论]选项`)}\n` +
      `    ${colors.green(`修复: 处理模糊事件 (关闭 #28)`)}`,
  );
  console.log(
    colors.bgGreen(
      `  支持前缀: 功能|修复|文档|开发体验|样式|重构|性能|测试|工作流|构建|持续集成|杂项|类型|进行中|发布 `,
    ),
  );
  console.log(
    colors.bgRed(`  查阅 config/docs/commit-convention.md 获取更多.`),
  );
  process.exit(1);
}
