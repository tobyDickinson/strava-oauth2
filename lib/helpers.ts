import { ParamObject, TokenResponse } from "../types/token";

export function assertIsParamObj(obj: object): asserts obj is ParamObject {
  if (
    "state" in obj &&
    "code" in obj &&
    "scope" in obj &&
    typeof obj.state === "string" &&
    typeof obj.code === "string" &&
    typeof obj.scope === "string" &&
    Object.keys(obj).length === 3
  )
    return;
  throw new TypeError("Invalid parameters for token request");
}

export function assertValidTokenResponse(
  obj?: object | null
): asserts obj is TokenResponse {
  if (
    obj !== null &&
    typeof obj === "object" &&
    "token_type" in obj &&
    "expires_at" in obj &&
    "expires_in" in obj &&
    "refresh_token" in obj &&
    "access_token" in obj &&
    "athlete" in obj &&
    typeof obj.token_type === "string" &&
    typeof obj.expires_at === "number" &&
    typeof obj.expires_in === "number" &&
    typeof obj.refresh_token === "string" &&
    typeof obj.access_token === "string" &&
    typeof obj.athlete === "object"
  )
    return;
  throw new TypeError("Invalid token response");
}
