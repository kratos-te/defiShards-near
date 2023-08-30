import { getConfig } from "./config";

export const nearConfig = getConfig(process.env.REACT_APP_ENVIRONMENT || "development");
