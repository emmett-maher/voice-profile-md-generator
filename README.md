# Voice Profile MD Generator

Distill how a creator *actually talks* — across YouTube videos, podcasts, and posts — into a
structured markdown file Claude can write with.

The core mechanism is **evidence-grounded voice synthesis**: every claim in a generated profile
(a vocabulary tic, a sentence rhythm, a rhetorical move) must be traceable to a verbatim quote
from the creator's own content. The model writes; deterministic code certifies:

- **Claude Opus 4.8** (`claude-opus-4-8`) drafts the profile — names patterns, writes the prose.
- **Code** parses the draft against a Zod schema, then verifies each cited quote appears
  verbatim (whitespace-normalized) in the stored transcripts. The model never judges its own
  citations.
- Traits whose evidence can't be located go to a **repair pass** (`claude-sonnet-4-6`): find a
  real supporting quote, or the trait is dropped. Nothing unverified ships.
- Thin input (below 1,200 ingested words) produces an explicitly **low-confidence** profile —
  never a confident fabrication.
- Final assembly is deterministic code: verified traits + citations + coverage stats →
  a self-contained, system-prompt-ready `.md` export.

## Quick start (no keys needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no keys configured, the app boots into **labelled demo mode**:
three seeded fictional creators (a punchy fitness creator, a measured tech explainer, and a
thin-input newcomer that demonstrates the low-confidence path), a persona switcher, and a
**replayable recorded synthesis run**. The recording only replays the *model outputs* — schema
validation, citation verification, the visible drop and repair, and markdown assembly all
execute for real in your browser.

```bash
npm test        # pipeline + verification test suite
npm run build   # production build
```

## Full mode (your own content)

Full mode adds: Google sign-in, Convex-backed storage with server-enforced ownership, scheduled
ingestion jobs (captions → Deepgram fallback → Haiku segmentation), the live server-side
synthesis loop, and Resend completion emails.

1. **Convex** — `npx convex dev` (creates a dev deployment; regenerates `convex/_generated`).
   Copy the deployment URL into `NEXT_PUBLIC_CONVEX_URL`.
2. **Env file** — `cp .env.example .env`, then fill in:
   - `AUTH_SECRET` (`npx auth secret`), `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
   - `CONVEX_AUTH_PRIVATE_KEY` — run `npm run generate-keys` and paste the printed line
   - `SITE_URL` (defaults to `http://localhost:3000`)
3. **Convex env vars** — keys used by server-side actions live on the deployment:
   ```bash
   npx convex env set ANTHROPIC_API_KEY sk-ant-…
   npx convex env set SITE_URL http://localhost:3000
   npx convex env set DEEPGRAM_API_KEY …     # optional: audio without captions
   npx convex env set RESEND_API_KEY …       # optional: completion emails
   ```
4. **Run** — two terminals:
   ```bash
   npx convex dev   # backend: schema, functions, scheduled jobs
   npm run dev      # app
   ```

Sign in, paste URLs (or click *Seed* to load a fictional creator's transcripts into your
account), watch sources land with word counts, then hit **Generate voice profile** and watch the
loop reason live — including any citation failures being repaired or dropped.

### How authorization works

Auth.js (Google) holds the session; `/api/auth/convex-token` mints a short-lived RS256 JWT that
Convex validates against `/api/auth/jwks` (see `convex/auth.config.ts`). Every Convex
query/mutation resolves the caller from that verified identity and filters/asserts ownership
server-side — the client never decides what it may see.

## Architecture

| Piece | Where | Role |
|---|---|---|
| `src/lib/voice/` | shared, pure TS | Zod schemas, verbatim citation verification, sampling, coverage, deterministic markdown assembly, and the synthesis pipeline (model-adapter driven) |
| `convex/` | Convex | Schema (Connection → Source → Passage → Profile + Citations), ownership-checked functions, scheduled ingestion, the server-side synthesis action, notifications, crons |
| `src/lib/demo/` | shared | Seeded personas + recorded model adapter (demo mode replays recordings through the real pipeline) |
| `src/app/`, `src/components/` | Next.js | Demo studio, full-mode studio, live synthesis feed, profile/export views |

Key entities: **Connection** (a linked account or pasted URL batch) → **Source** (one
video/post/episode with platform + title + URL) → **Passage** (verified-stored transcript chunk)
→ **Profile** (verified traits, each with **Citations** pointing at passages).

## Honesty contract

- A trait ships only if at least one citation is located verbatim in a stored passage.
- Failed traits are repaired with real evidence or dropped — visibly, in the live feed.
- A profile is labelled **Grounded** only when every included claim passed verification;
  thin corpora are labelled **Low confidence** in the UI and in the export itself.
- Even Haiku's transcript segmentation is code-checked: proposed segments must be verbatim
  slices of the transcript or the deterministic splitter takes over.
