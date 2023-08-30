import { formatNearAmount } from "near-api-js/lib/utils/format";

export const cutDecimal = (value: number, fix = 3) => {
    return Math.trunc(value * Math.pow(10, fix)) / Math.pow(10, fix);
};

export const convertToFloat = (value: string, fix = 3, decimal = 24) => {
    return cutDecimal(
        parseFloat(formatNearAmount(value + "0".repeat(24 - decimal)).replaceAll(",", "")),
        fix
    );
};

export const bytesToHex = (bytes: any) => {
    for (var hex = [], i = 0; i < bytes.length; i++) {
        var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
        hex.push((current >>> 4).toString(16));
        hex.push((current & 0xf).toString(16));
    }
    return hex.join("");
};

export const unifySymbol = (symbol: string) => {
    if (!symbol || symbol === "near" || symbol.startsWith("$")) {
        return symbol;
    }
    const res = `$${symbol}`;
    return res;
};