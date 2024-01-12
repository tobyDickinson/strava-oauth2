import { Scope } from "../types/scope";

export const defaultConfig = {
  authorizationUri: "https://www.strava.com/api/v3/oauth/authorize",
  tokenUri: "https://www.strava.com/api/v3/oauth/token",
  revocationUri: "https://www.strava.com/api/v3/oauth/deauthorize",
  clientId: null,
  clientSecret: null,
  redirectUri: "http://localhost",
  scopes: [Scope.Read] satisfies Scope[],
} as const;
