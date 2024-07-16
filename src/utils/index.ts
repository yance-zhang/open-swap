export const debounce = (func: any, timeout = 500) => {
  let timer: any;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};

export const formatNumber = (num: number = 0, precision: number = 2) => {
  const map = [
    { suffix: "T", threshold: 1e12 },
    { suffix: "B", threshold: 1e9 },
    { suffix: "M", threshold: 1e6 },
    { suffix: "K", threshold: 1e3 },
    // { suffix: '', threshold: 1 },
  ];

  const found = map.find((x) => Math.abs(num) >= x.threshold);
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix;
    return formatted;
  }

  if (num.toString().length > precision + 2) {
    return num.toFixed(precision);
  }

  return num.toString();
};

export const formatBalanceNumber = (
  num: number = 0,
  precision: number = 2,
  comma: boolean = true
) => {
  if (!num) {
    return "0";
  }

  const baseNumber = Math.pow(10, precision);

  const balance = Math.floor(num * baseNumber) / baseNumber;

  const balanceWithComma = balance.toLocaleString("en-US", {
    minimumFractionDigits: precision,
  });

  return comma ? balanceWithComma : balance.toString();
};
