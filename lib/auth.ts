// Simple personal-use auth. Single password -> session cookie.
export const SESSION_COOKIE = "emi_session";

export const getPassword = () => process.env.APP_PASSWORD || "kishan";
export const getSecret = () =>
  process.env.APP_SESSION_SECRET || "emi-dashboard-secret-please-change";
