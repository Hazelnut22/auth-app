function require(key) {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}
 
export const JWT_SECRET           = process.env.JWT_SECRET || "secret";

export const PORT                 = process.env.PORT              || 4000;
export const NODE_ENV             = process.env.NODE_ENV          || "development";
export const MAX_LOGIN_ATTEMPTS   = Number(process.env.MAX_LOGIN_ATTEMPTS)  || 5;
export const LOCKOUT_MINUTES      = Number(process.env.LOCKOUT_MINUTES)     || 15;
export const PASSWORD_EXPIRY_DAYS = Number(process.env.PASSWORD_EXPIRY_DAYS)|| 90;
export const PASSWORD_HISTORY_LIMIT = Number(process.env.PASSWORD_HISTORY_LIMIT) || 5;
export const ACCESS_TOKEN_EXPIRY  = process.env.ACCESS_TOKEN_EXPIRY  || "15m";
export const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";