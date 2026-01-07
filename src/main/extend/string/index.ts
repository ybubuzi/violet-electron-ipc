if (!String.prototype.format) {
  String.prototype.format = function (...args) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const formatString = this;
    return formatString.replace(/{(\d+)(?::(.*?))?}/g, (match, indexStr, formatSpecifier) => {
      const index = parseInt(indexStr, 10);

      if (index >= args.length) {
        return match; // 如果索引越界，保留占位符
      }

      const value = args[index];

      if (!formatSpecifier) {
        return String(value);
      }

      if (/^0+$/.test(formatSpecifier)) {
        if (typeof value === "number") {
          return String(value).padStart(formatSpecifier.length, "0");
        }
      }

      // 处理十进制格式, 如: 1.111
      if (/^\d+\.\d+$/.test(formatSpecifier)) {
        if (typeof value === "number") {
          const parts = formatSpecifier.split(".");
          const precision = parts[1].length;
          return value.toFixed(precision);
        }
      }
      return String(value);
    });
  };
}

if (!String.rawEx) {
  // @ts-ignore - custom String extension
  String.rawEx = function (callSite: TemplateStringsArray, ...substitutions: unknown[]) {
    const rawString = String.raw(callSite, ...substitutions);
    const lines = rawString.split(/\r?\n/);
    if (lines.length > 1) {
      if (lines[0] === "") {
        lines.shift();
      }
      if (lines[lines.length - 1] === "") {
        lines.pop();
      }
    }

    let minSpaceCount = Number.MAX_SAFE_INTEGER;
    for (const line of lines) {
      if (/^\s.*$/.test(line)) {
        const currCount = line.length - line.replace(/^\s+/, "").length;
        if (currCount < minSpaceCount && currCount > 0) {
          minSpaceCount = currCount;
        }
      }
    }
    const spaceRegex = new RegExp(`^\\s{${minSpaceCount}}`);
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(spaceRegex, "");
    }
    return lines.join("\n");
  };
}
