// @ts-check
const { Client } = require("../lib/client");
const { Token } = require("../lib/token");
const { defaultConfig } = require("../lib/config");
const { Scope } = require("../types/scope");
const axios = require("axios").default;
jest.mock("axios");

describe("getAuthorizationUri()", () => {
  const config = {
    clientId: 1234,
    clientSecret: "mysecret",
    redirectUri: "https://localhost:8443",
    scopes: [Scope.Read, Scope.ActivityWrite],
  };

  let client;

  beforeAll(() => {
    client = new Client(config);
  });

  it("should return the correct uri", () => {
    const uri = client.getAuthorizationUri();
    expect(uri).toEqual(
      "https://www.strava.com/api/v3/oauth/authorize?client_id=1234&redirect_uri=https%3A%2F%2Flocalhost%3A8443&response_type=code&approval_prompt=auto&scope=read%2Cactivity%3Awrite"
    );
  });
});

const config = {
  clientId: 1234,
  clientSecret: "mysecret",
  redirectUri: "https://localhost:8443",
  scopes: [Scope.Read, Scope.ActivityWrite],
};

const token_json = {
  token_type: "Bearer",
  expires_at: 1568775134,
  expires_in: 21600,
  refresh_token: "e5n567567",
  access_token: "a4b945687g",
  athlete: {
    name: null,
  },
};

const token = new Token(
  token_json.token_type,
  token_json.expires_at,
  token_json.expires_in,
  token_json.refresh_token,
  token_json.access_token,
  token_json.athlete
);

describe("getToken(reqUrl)", () => {
  let client;
  beforeEach(() => {
    client = new Client(config);
    axios.post.mockImplementation(async () => {
      return { body: token_json, ok: true };
    });
  });

  it("should parse a URL into an object and call getTokenFromObject", async () => {
    client.getTokenFromObject = jest.fn();
    const req_url =
      "https://localhost:8443/?state=&code=db1baba06e40d4b3b3f999c8a0235c346c6b2547&scope=activity:write,read";
    const param_object = {
      state: "",
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      scope: "activity:write,read",
    };
    await client.getToken(req_url);
    expect(client.getTokenFromObject).toHaveBeenCalledWith(param_object);
  });

  it("should create a token when passed a relative URL", async () => {
    client.getTokenFromObject = jest.fn();
    const req_url =
      "/api/auth/callback?state=&code=8e8435a0e7c7f7027068611cfe0cd9a3392d974d&scope=read,activity:read_all";
    const param_object = {
      state: "",
      code: "8e8435a0e7c7f7027068611cfe0cd9a3392d974d",
      scope: "read,activity:read_all",
    };
    const response_token = await client.getToken(req_url);
    expect(client.getTokenFromObject).toHaveBeenCalledWith(param_object);
  });
});

describe("getTokenFromObject(paramObject)", () => {
  let client;
  beforeAll(() => {
    client = new Client(config);
    axios.post.mockImplementation(async () => ({ data: token_json }));
  });

  it("should create and return a token object based on the Strava auth response", async () => {
    const param_object = {
      state: "",
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      scope: "activity:write,read",
    };
    const response_token = await client.getTokenFromObject(param_object);
    expect(response_token).toEqual(token);
  });

  it("should throw an exception if the request does not contain all scopes requested", async () => {
    const param_object = {
      state: "",
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      scope: "activity:write",
    };
    await expect(async () => {
      await client.getTokenFromObject(param_object);
    }).rejects.toThrow();
  });

  it("should send a post request with the extracted data from the URL", async () => {
    const param_object = {
      state: "",
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      scope: "activity:write,read",
    };
    await client.getTokenFromObject(param_object);

    const expected_request_data = {
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      grant_type: "authorization_code",
    };

    expect(axios.post).toHaveBeenCalledWith(
      defaultConfig.tokenUri,
      expected_request_data
    );
  });

  it("should create and return a token object based on the Strava auth response", async () => {
    const param_object = {
      state: "",
      code: "db1baba06e40d4b3b3f999c8a0235c346c6b2547",
      scope: "activity:write,read",
    };

    const response_token = await client.getTokenFromObject(param_object);
    expect(response_token).toEqual(token);
  });
});
