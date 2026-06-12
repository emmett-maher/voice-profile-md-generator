import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Scheduled ingestion upkeep: re-kick sources stuck in a transient state
// (e.g. the action died mid-fetch) so pasted URLs always converge to
// ready/error.
crons.interval("retry stuck ingestions", { minutes: 10 }, internal.ingest.retryStuck, {});

export default crons;
