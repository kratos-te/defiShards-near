import {
  parseNearAmount,
  formatNearAmount,
} from "near-api-js/lib/utils/format";

export const cutDecimal = (value: number, fix: number = 3): number => {
  return Math.trunc(value * Math.pow(10, fix)) / Math.pow(10, fix);
};

export const convertToFloat = (
  value: string,
  fix: number = 3,
  decimal: number = 24
): number => {
  return cutDecimal(
    parseFloat(
      formatNearAmount(value + "0".repeat(24 - decimal)).replaceAll(",", "")
    ),
    fix
  );
};

export const convertToAmount = (
  value: number,
  decimal: number = 24
): string => {
  if (value === 0) return "0";
  let amount = parseNearAmount(value.toString());
  amount = amount!.substring(0, amount!.length - (24 - decimal));
  return amount;
};
