export type ParamObject = {
  code: string;
  state: string;
  scope: string;
};

export type TokenResponse = {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: object;
};
