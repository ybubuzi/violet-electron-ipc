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
