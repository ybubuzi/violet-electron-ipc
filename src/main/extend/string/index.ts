if (!String.prototype.format) {
  String.prototype.format = function (...args) {
    const formatString = this;
    return formatString.replace(/{(\d+)(?::(.*?))?}/g, (match, indexStr, formatSpecifier) => {
      const index = parseInt(indexStr, 10);

      if (index >= args.length) {
        return match; // 如果索引越界，保留占位符
      }

      let value = args[index];

      if (!formatSpecifier) {
        return String(value);
      }

      if (/^0+$/.test(formatSpecifier)) {
        if (typeof value === 'number') {
          return String(value).padStart(formatSpecifier.length, '0');
        }
      }

      // 处理十进制格式, 如: 1.111
      if (/^\d+\.\d+$/.test(formatSpecifier)) {
        if (typeof value === 'number') {
          const parts = formatSpecifier.split('.');
          const precision = parts[1].length;
          return value.toFixed(precision);
        }
      }
      return String(value);
    });
  };
}

if (!String.rawEx) {
  // @ts-ignore
  String.rawEx = function (callSite: TemplateStringsArray, ...substitutions: any[]) {
    const rawString = String.raw(callSite, ...substitutions);
    const lines = rawString.split(/\r?\n/);

    let firstLine = 0;
    while (firstLine < lines.length && /^\s*$/.test(lines[firstLine])) {
      firstLine++;
    }

    let lastLine = lines.length - 1;
    while (lastLine >= firstLine && /^\s*$/.test(lines[lastLine])) {
      lastLine--;
    }

    if (firstLine > lastLine) {
      return '';
    }

    let minIndent = -1;
    for (let i = firstLine; i <= lastLine; i++) {
      const line = lines[i];
      if (!/^\s*$/.test(line)) {
        const match = line.match(/^(\s*)/);
        const indent = match[1].length;
        if (minIndent === -1 || indent < minIndent) {
          minIndent = indent;
        }
      }
    }

    if (minIndent > 0) {
      const indentRegex = new RegExp(`^\\s{${minIndent}}`);
      for (let i = firstLine; i <= lastLine; i++) {
        lines[i] = lines[i].replace(indentRegex, '');
      }
    }
    return lines.slice(firstLine, lastLine + 1).join('\n');
  };
}
