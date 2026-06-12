# Build: Voice Profile MD Generator

## Context
Creators who want Claude to write in their voice face a cold-start problem: they paste a few examples and get generic output that sounds nothing like them. The raw material for an authentic voice profile already exists — scattered across their YouTube videos, podcasts, and social posts — but distilling it into a reusable instruction file by hand is tedious and most people don't know what to extract. This idea, surfaced in Andrew Kroeze's AI Reels workshop, is to automate that distillation: ingest a creator's actual spoken and written content, then produce a structured markdown file that captures *how they talk* precisely enough that Claude can reproduce it.

The essential mechanism is **evidence-grounded voice synthesis**: every claim in the generated profile (a vocabulary tic, a sentence rhythm, a rhetorical move) must be traceable to specific quoted passages from the user's own content. The profile is not a vibe — it is a defended argument about how this person speaks, with citations. Everything else in the app serves this.

## Requirements
1. **Core mechanism — cited voice synthesis.** Given ingested transcripts, an agentic loop produces a structured voice profile where every observed trait is backed by at least one verbatim quote drawn from the source content. Code owns the contract: it parses model output against a Zod schema, verifies each cited quote actually appears (substring match, normalized for whitespace) in the stored transcripts, and rejects any trait whose citation cannot be located.
2. **Division of labor.** The model (Claude) interprets style, names patterns, and writes the prose of the profile. Deterministic code segments transcripts, validates schema, verifies citations against source text, computes coverage metrics (word count ingested, sources used), and assembles the final markdown. The model never judges whether its own citations are valid — code does.
3. **Honest failure.** If citation verification fails for a trait, that trait is dropped or sent back for repair, never shipped. The app never presents a profile as "grounded" when any included claim failed verification. Thin input (too few words) yields an explicit low-confidence profile, clearly labelled, not a confident fabrication.
4. **Credentials-only handoff.** A fresh clone runs from `.env.example` alone via one command. With keys present, the full ingest→synthesize→export flow works. With keys missing, the app boots into labelled demo mode: seeded transcripts from fictional creators, a persona switcher, and a replayable recorded synthesis run.
5. **Server-enforced ownership.** A user can only view, generate from, or export profiles built from their own connected sources. Authorization is checked server-side, never in the client.
6. **Source provenance is persisted.** Every ingested passage stores its origin (platform, source title/URL) so citations in the export can name where each quote came from.
7. **The export is the product.** The generated markdown is downloadable and copy-pasteable, structured as a Claude context file (system-prompt-ready), and self-contained.

## Stack
- **Next.js (App Router) + TypeScript** — the app shell and server routes for ingestion and synthesis.
- **shadcn/ui + Tailwind** — all UI, including the live synthesis view.
- **Anthropic Claude API, Zod-validated at every boundary** — the synthesis engine. `claude-opus-4-8` runs the core voice-synthesis loop (the hardest reasoning: distilling style and defending it with citations); `claude-haiku-4-5-20251001` handles transcript segmentation and source classification (high-volume, latency-sensitive); `claude-sonnet-4-6` for the repair pass when a trait fails verification.
- **Convex** — database, server functions, scheduled ingestion jobs, and reactive queries so the synthesis loop's progress streams live to the UI. Chosen because the agentic loop and live-updating profile view are central.
- **Auth.js with Google provider** — sign-in; persona switcher is the keyless fallback.
- **Deepgram** — speech-to-text for YouTube/podcast audio where no transcript is available (using its current recommended transcription model, resolved at build time). Justified: the core mechanism needs spoken-word source text, and many videos lack captions.
- **Resend** — emails the user when a long ingestion/synthesis job completes; in-app notification is the keyless fallback.

## Architecture
Key entities: **Connection** (a linked source account or pasted URL), **Source** (one video/post/episode with platform + title + URL), **Passage** (a verified-stored chunk of transcript text tied to a Source), and **Profile** (the generated artifact, holding named traits each with one or more **Citations** pointing at Passages).

Ingestion runs as scheduled Convex jobs: fetch transcripts where available, fall back to Deepgram for audio without captions, segment into Passages via Haiku, persist with provenance. The **synthesis loop** runs server-side in Convex: Opus reads a sampled, representative set of Passages and emits a structured profile — traits with quoted citations — validated against a Zod schema. Code then verifies each quote exists verbatim in the cited Passage. Verified traits are kept; failed ones go to a Sonnet repair pass (find a real supporting quote or drop the trait). The loop persists each pass so the UI can render reasoning live. Final assembly is deterministic: code renders verified traits and citations into the markdown export with coverage stats. The model writes; code certifies.

## Product
A creator signs in, connects a YouTube channel or pastes video/post URLs, and watches the app ingest their content — sources appearing with word counts as transcripts land. They click generate and watch the synthesis loop reason in real time: "Detected a recurring habit of opening with a rhetorical question — verifying against 4 passages." Failed citations visibly drop or get repaired, so the user *sees* the grounding happen rather than trusting a black box.

The result is a structured profile — sections like voice & tone, signature vocabulary, sentence rhythm, rhetorical moves, content patterns — each trait followed by its quoted evidence and source. Example: a "tone" entry reads *"Warm and self-deprecating,"* backed by `"honestly I had no idea what I was doing here"` (from *My First 100k Video*). The user downloads the markdown and pastes it into Claude as a system prompt; Claude now writes in their voice. Demo personas (a punchy fitness creator, a measured tech explainer) let a keyless visitor exercise the entire flow on seeded transcripts.

## Out of Scope for v1
Auto-publishing generated content; multi-language profiles; A/B testing profiles against draft output; team/agency dashboards; scheduled re-syncing as creators post new content; fine-tuning or model training; analytics on which traits Claude actually reproduces. All roadmap, none required by the core mechanism.

## Acceptance
1. On seeded data with keys configured, ingest→synthesize→export produces a markdown profile where **every** included trait has a verbatim, locatable citation.
2. An injected trait citing text absent from all Passages is rejected or repaired and never appears in the export.
3. A source with too little text yields an explicit low-confidence labelled profile, not a confident one.
4. The live synthesis view shows the loop's passes, including at least one drop or repair, on seeded data.
5. Exported markdown is copy-pasteable, self-contained, and usable directly as a Claude system prompt.
6. Authorization: a user cannot access another user's profiles or sources via any route.
7. Fresh clone runs to a working app using only the README and `.env.example`; one command starts it.
8. With no keys set, the app boots into clearly labelled demo mode with persona switching and a replayable recorded synthesis run.
9. `npm run build` completes clean with no type errors.