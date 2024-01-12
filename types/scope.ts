/**
 * Available scopes for strava oauth request
 */
export enum Scope {
  Read = "read",
  ReadAll = "read_all",
  ProfileReadAll = "profile:read_all",
  ProfileWrite = "profile:write",
  ActivityRead = "activity:read",
  ActivityReadAll = "activity:read_all",
  ActivityWrite = "activity:write",
}
