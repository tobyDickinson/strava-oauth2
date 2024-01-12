import { Scope } from "./scope";
import { defaultConfig } from "../lib/config";

export type DefaultClientConfig = typeof defaultConfig;

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
