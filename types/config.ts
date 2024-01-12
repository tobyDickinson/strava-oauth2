import { Scope } from "./scope";

export type DefaultClientConfig = {
  authorizationUri: "https://www.strava.com/api/v3/oauth/authorize";
  tokenUri: "https://www.strava.com/api/v3/oauth/token";
  revocationUri: "https://www.strava.com/api/v3/oauth/deauthorize";
  clientId: null;
  clientSecret: null;
  redirectUri: "http://localhost";
  scopes: [Scope.Read];
};

export type ClientConstructorConfig = {
  authorizationUri?: string;
  tokenUri?: string;
  revocationUri?: string;
  clientId: number;
  clientSecret: string;
  redirectUri?: string;
  scopes?: Scope[];
};

export type ClientConfig = Required<ClientConstructorConfig>;
