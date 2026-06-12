/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as connections from "../connections.js";
import type * as crons from "../crons.js";
import type * as ingest from "../ingest.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_models from "../lib/models.js";
import type * as lib_transcripts from "../lib/transcripts.js";
import type * as notifications from "../notifications.js";
import type * as profiles from "../profiles.js";
import type * as sources from "../sources.js";
import type * as synthesis from "../synthesis.js";
import type * as synthesisAction from "../synthesisAction.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  connections: typeof connections;
  crons: typeof crons;
  ingest: typeof ingest;
  "lib/auth": typeof lib_auth;
  "lib/models": typeof lib_models;
  "lib/transcripts": typeof lib_transcripts;
  notifications: typeof notifications;
  profiles: typeof profiles;
  sources: typeof sources;
  synthesis: typeof synthesis;
  synthesisAction: typeof synthesisAction;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
