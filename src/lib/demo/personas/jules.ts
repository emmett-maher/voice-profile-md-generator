import type { DemoPersona } from "../types";

/**
 * Jules Tan — brand-new creator with one short video. Deliberately thin
 * input: the run completes with every citation verified, but the profile is
 * explicitly labelled low-confidence instead of pretending to be a portrait.
 */
export const jules: DemoPersona = {
  id: "jules",
  name: "Jules Tan",
  tagline: "New creator, one video — demonstrates the low-confidence path",
  description:
    "Fixes vintage film cameras at the kitchen table. Only ~230 words ingested, so the generated profile is honestly labelled low-confidence.",
  sources: [
    {
      id: "jules-src-1",
      platform: "youtube",
      title: "Reviving a 1972 Canonet (First Video!)",
      url: "https://youtube.com/watch?v=demo-jules-canonet",
    },
  ],
  passages: [
    {
      id: "jules-p1",
      sourceId: "jules-src-1",
      text: "Hey everyone, first video, so bear with me. I'm Jules, and I fix vintage film cameras at my kitchen table. Today we're opening up a 1972 Canonet that smells like somebody's attic, because it was in somebody's attic for forty years.",
    },
    {
      id: "jules-p2",
      sourceId: "jules-src-1",
      text: "The light seals have basically turned into tar, which is gross, but honestly that's the fun part. You scrape, you clean, you replace. It's meditative. Twenty minutes of cotton swabs and you've saved a machine that's older than your parents' marriage.",
    },
    {
      id: "jules-p3",
      sourceId: "jules-src-1",
      text: "If you've got a dead camera in a drawer somewhere, send me a photo. Worst case, it stays dead and we both learn something. Best case, you're shooting film next month. Okay — see you in the next one, probably.",
    },
  ],
  recording: {
    draft: {
      summary:
        "You write like Jules Tan, a soft-spoken hobbyist restorer: first-person, self-aware about being new at this, finding quiet delight in grimy mechanical work, and closing with a low-pressure invitation to the audience.",
      traits: [
        {
          id: "jules-t1",
          section: "voice_and_tone",
          name: "Self-aware beginner charm",
          claim:
            "They name their own inexperience up front and ask for patience, which sets a friendly, unpolished register.",
          citations: [
            {
              passageId: "jules-p1",
              quote: "first video, so bear with me",
            },
          ],
        },
        {
          id: "jules-t2",
          section: "rhetorical_moves",
          name: "Low-pressure audience invitations",
          claim:
            "Calls to action are framed as no-lose experiments rather than demands.",
          citations: [
            {
              passageId: "jules-p3",
              quote: "Worst case, it stays dead and we both learn something.",
            },
          ],
        },
        {
          id: "jules-t3",
          section: "sentence_rhythm",
          name: "Trailing qualifiers",
          claim:
            "Sentences end with a soft, self-undercutting qualifier that keeps the tone unassuming.",
          citations: [
            {
              passageId: "jules-p3",
              quote: "see you in the next one, probably",
            },
          ],
        },
        {
          id: "jules-t4",
          section: "content_patterns",
          name: "Delight in the gross mechanical detail",
          claim:
            "The hook is a tactile, slightly disgusting specific, reframed as the appeal of the craft.",
          citations: [
            {
              passageId: "jules-p2",
              quote:
                "The light seals have basically turned into tar, which is gross, but honestly that's the fun part.",
            },
          ],
        },
      ],
    },
    repairs: {},
  },
};
