export const APP_THEME_TOKEN = "OPEN_SWAP_THEME";

export const shortenAddress = (address: string) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};

export const copyText = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export const randomInt = (min: number, max: number) => {
  return Math.round(Math.random() * (max - min)) + min;
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

export const DEFAULT_SWAP_PRECISION = 2;

export const DEFAULT_CALCULATE_PRECISION = 6;

export const formatBalanceNumber: (
  num?: number,
  precision?: number
) => string = (num: number = 0, precision: number = 2) => {
  if (!num) {
    return "0";
  }

  const baseNumber = Math.pow(10, precision);

  const balance = (Math.floor(num * baseNumber) / baseNumber).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: precision,
    }
  );

  if (num < 0.000001) {
    return "<0.000001";
  }

  // upgrade precision
  if (num < 1 / baseNumber && precision < 12) {
    return formatBalanceNumber(num, precision + 2);
  }

  return balance;
};

export const prettifyNumber: (num: number, precision?: number) => number = (
  num,
  precision = DEFAULT_SWAP_PRECISION
) => {
  if (!num) {
    return 0;
  }

  const baseNumber = Math.pow(10, precision - 1);

  const prettified = Number(num.toFixed(precision));

  if (num < 1 / baseNumber) {
    return prettifyNumber(num, precision + 2);
  }

  return prettified;
};

export const stringToHex = (string: string) => {
  let hex = "";
  for (let i = 0; i < string.length; i++) {
    hex += string.charCodeAt(i).toString(16);
  }

  return hex;
};

export const isSameAddress = (address1: string, address2: string) => {
  return address1.toLowerCase() === address2.toLowerCase();
};
