const fs = require('fs');
const path = require('path');
// 创建.vscode目录
fs.existsSync('.vscode') || fs.mkdirSync('.vscode');
function overwriteFile(filePath, overwriteFilePath) {
  let defaultSettings = {};
  if (fs.existsSync(filePath)) {
    defaultSettings = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }
  const overrideSettings = fs.readFileSync(overwriteFilePath, 'utf-8');
  const settings = { ...defaultSettings, ...JSON.parse(overrideSettings) };
  // 写入.vscode/
  fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
}

overwriteFile('.vscode/settings.json', './config/editor/.vscode/settings.json');
overwriteFile('.vscode/launch.json', './config/editor/.vscode/launch.json');
