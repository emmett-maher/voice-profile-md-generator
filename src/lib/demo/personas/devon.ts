import type { DemoPersona } from "../types";

/**
 * Devon Okafor — measured tech explainer. Fictional. The recorded run
 * includes a trait repaired with real evidence and a trait dropped because
 * the transcripts contain nothing to support it.
 */
export const devon: DemoPersona = {
  id: "devon",
  name: "Devon Okafor",
  tagline: "Measured tech explainer — steelmans first, verdicts second",
  description:
    "Long-form explainers on security and consumer tech. Even-handed, dry-humored, fond of everyday analogies and a single concrete recommendation at the end.",
  sources: [
    {
      id: "devon-src-1",
      platform: "youtube",
      title: "How Passkeys Actually Work (No, Really)",
      url: "https://youtube.com/watch?v=demo-devon-passkeys",
    },
    {
      id: "devon-src-2",
      platform: "youtube",
      title: "Why Your Smart Home Is Dumb: A Gentle Rant",
      url: "https://youtube.com/watch?v=demo-devon-smarthome",
    },
    {
      id: "devon-src-3",
      platform: "blog",
      title: "Notes on Local-First Software",
      url: "https://devonokafor.example/blog/local-first-notes",
    },
  ],
  passages: [
    {
      id: "devon-p1",
      sourceId: "devon-src-1",
      text: "Let's start with what a passkey actually is, because the marketing has done us no favors here. A passkey is, roughly speaking, a cryptographic key pair where the private half never leaves your device. That's the whole trick. When a website wants to log you in, it sends a challenge, your device signs it, and the signature proves you are you — without a shared secret sitting on a server somewhere, waiting to be stolen.",
    },
    {
      id: "devon-p2",
      sourceId: "devon-src-1",
      text: "Now, is this perfect? No. The honest answer is that nothing in security is perfect, and anyone who tells you otherwise is selling something. There are real questions about recovery, about platform lock-in, about what happens when you lose every device you own in a house fire. These are solvable problems, but they are problems, and I think it matters that we say so out loud.",
    },
    {
      id: "devon-p3",
      sourceId: "devon-src-1",
      text: "Here's my favorite way to think about it. A password is like a key that you photocopy and hand to every building you ever enter, hoping none of them leaves the copy lying around. A passkey is like a doorman who recognizes your face. The building never holds anything worth stealing. That asymmetry — that's the entire reason this technology exists.",
    },
    {
      id: "devon-p4",
      sourceId: "devon-src-1",
      text: "If you take one thing away from this video, let it be this: turn passkeys on for your email account first. Email is the skeleton key to your digital life — everything else resets through it. Start there, live with it for a week, and then decide how you feel about going further. Small experiments beat grand migrations, every single time.",
    },
    {
      id: "devon-p5",
      sourceId: "devon-src-1",
      text: "A brief aside on the word 'unphishable', which you will see in every press release on this subject. It is mostly true and slightly oversold. The protocol binds the credential to the real website, so a lookalike site gets nothing. What it cannot do is stop you from being talked into resetting the account through older, weaker channels. The chain is stronger; the chain still has other links.",
    },
    {
      id: "devon-p6",
      sourceId: "devon-src-2",
      text: "I want to be fair to the smart home industry, so let me steelman the pitch first: the dream is a house that anticipates you. Lights that know. Heating that learns. And in fairness, when it works, it is genuinely lovely. But the gap between the demo and the Tuesday-evening reality is where this whole category lives, and we should talk about that gap honestly.",
    },
    {
      id: "devon-p7",
      sourceId: "devon-src-2",
      text: "My thermostat has, by my count, three different apps, two cloud accounts, and one opinion of its own. None of these are coordinated. The result is what I'd call distributed disappointment — every component works, roughly, and the system as a whole still manages to fail. This is not a hardware problem. It's an incentives problem, and incentives are much harder to patch.",
    },
    {
      id: "devon-p8",
      sourceId: "devon-src-2",
      text: "So what do I actually recommend? Boring local standards. Devices that work when the internet doesn't. If a lightbulb needs a server in another country to turn on, the lightbulb does not respect you. Buy things that fail gracefully, and your future self — the one standing in a dark hallway during an outage — will thank you.",
    },
    {
      id: "devon-p9",
      sourceId: "devon-src-2",
      text: "And to the engineers working on this stuff, genuinely: none of this is your fault, and most of you know all of it already. You are shipping inside constraints set three levels above your head. The polite version of my request is this — when the roadmap meeting happens, be the person who asks what happens to the customer when the company loses interest.",
    },
    {
      id: "devon-p10",
      sourceId: "devon-src-3",
      text: "Local-first software is one of those ideas that sounds radical until you describe it plainly: your data lives on your machine, and the network is an enhancement rather than a requirement. We used to just call this 'software'. The fact that it now needs a manifesto tells you something about the decade we've had.",
    },
    {
      id: "devon-p11",
      sourceId: "devon-src-3",
      text: "I keep coming back to a simple test. Open the app in airplane mode. What still works? That single question cuts through more marketing than any spec sheet I've read. The answer doesn't have to be 'everything' — sync is genuinely hard — but the answer should not be a blank white screen and a spinner of shame.",
    },
    {
      id: "devon-p12",
      sourceId: "devon-src-3",
      text: "To be clear, I'm not arguing the cloud is bad. That would be a silly position, and the people who hold it loudest are mostly performing. I'm arguing that defaults matter, that ownership matters, and that we drifted into a set of defaults nobody would have chosen deliberately. Drift is reversible. That's the optimistic note I want to end on.",
    },
    {
      id: "devon-p13",
      sourceId: "devon-src-3",
      text: "A practical starting point, since I promised one: pick a single document that matters to you — the novel draft, the tax spreadsheet — and make sure a complete, openable copy exists on hardware you can hold. Not a sync cache. A copy. Do it this weekend. It will take eleven minutes and it will change how you think about every app you use.",
    },
    {
      id: "devon-p14",
      sourceId: "devon-src-1",
      text: "One more wrinkle worth naming: the ecosystem question. Your passkeys today probably live with one of three large companies, and moving between them is, let's say, a work in progress. The standards bodies know. Portability is coming, slowly, in the way that infrastructure always comes — late, unglamorous, and then suddenly everywhere.",
    },
    {
      id: "devon-p15",
      sourceId: "devon-src-2",
      text: "A quick word on privacy, because a microphone in every room is the part of this we've all agreed not to think about. I'm not going to tell you it's fine, and I'm not going to tell you to throw your speaker in the sea. I'll tell you what I do: the microphone lives in the kitchen, not the bedroom, and the mute switch is a real switch. Draw your own line, but draw it on purpose rather than by default.",
    },
    {
      id: "devon-p16",
      sourceId: "devon-src-3",
      text: "There's a fair objection to all of this, and I want to give it room: collaboration genuinely is better in the cloud, and pretending otherwise is nostalgia. Fine. Granted. But notice how far that concession actually extends — it covers the documents you share, which for most people is maybe a tenth of what they make. The other ninety percent got moved onto someone else's computer as a side effect, not a decision.",
    },
    {
      id: "devon-p17",
      sourceId: "devon-src-1",
      text: "Let me also answer the question I get most often, which is whether password managers are now obsolete. No — and honestly the question has it backwards. The manager is the bridge. It holds the passwords for the long tail of websites that will not support any of this for another decade, and increasingly it holds your passkeys too. You'll retire the passwords one login at a time, like paying down a debt.",
    },
    {
      id: "devon-p18",
      sourceId: "devon-src-2",
      text: "I'll leave you with the test I now apply to every gadget that wants to live in my house: if this company vanished tomorrow, what would this object become? A worse version of itself is acceptable. A brick is not. It's remarkable how quickly that one question sorts the catalogue, and slightly depressing how short the surviving list is.",
    },
    {
      id: "devon-p19",
      sourceId: "devon-src-3",
      text: "Housekeeping note, since several of you asked: these notes will stay free, there's no course coming, and the only thing I'll ever ask you to subscribe to is the idea that you should be able to open your own files in ten years. If that lands as radical, well — that's rather the point of writing them.",
    },
  ],
  recording: {
    draft: {
      summary:
        "You write and speak like Devon Okafor: a measured tech explainer who steelmans the opposing case before critiquing it, hedges precisely rather than vaguely, reaches for everyday analogies, and closes with one small concrete experiment the audience can run this week. Dry humor, never snark.",
      traits: [
        {
          id: "devon-t1",
          section: "voice_and_tone",
          name: "Even-handed candor",
          claim:
            "He acknowledges the limits of his own position unprompted, which reads as trustworthiness rather than hedging.",
          citations: [
            {
              passageId: "devon-p2",
              quote:
                "The honest answer is that nothing in security is perfect, and anyone who tells you otherwise is selling something.",
            },
          ],
        },
        {
          id: "devon-t2",
          section: "voice_and_tone",
          name: "Dry, affectionate humor",
          claim:
            "Jokes arrive deadpan inside otherwise serious sentences, usually at the expense of objects and systems rather than people.",
          citations: [
            {
              passageId: "devon-p7",
              quote:
                "My thermostat has, by my count, three different apps, two cloud accounts, and one opinion of its own.",
            },
            {
              passageId: "devon-p11",
              quote: "a blank white screen and a spinner of shame",
            },
          ],
        },
        {
          id: "devon-t3",
          section: "signature_vocabulary",
          name: "Precision hedges: 'roughly speaking'",
          claim:
            "He qualifies technical claims with calibrated hedges — 'roughly speaking', 'mostly true and slightly oversold' — signalling exactly how much to trust each statement.",
          citations: [
            {
              passageId: "devon-p1",
              quote:
                "A passkey is, roughly speaking, a cryptographic key pair where the private half never leaves your device.",
            },
            {
              passageId: "devon-p5",
              quote: "It is mostly true and slightly oversold.",
            },
          ],
        },
        {
          id: "devon-t4",
          section: "sentence_rhythm",
          name: "Long setup, short verdict",
          claim:
            "Paragraphs build through long, clause-stacked sentences and then land on a clipped final judgment of a few words.",
          citations: [
            {
              passageId: "devon-p3",
              quote: "That asymmetry — that's the entire reason this technology exists.",
            },
            {
              passageId: "devon-p8",
              quote:
                "If a lightbulb needs a server in another country to turn on, the lightbulb does not respect you.",
            },
          ],
        },
        {
          id: "devon-t5",
          section: "rhetorical_moves",
          name: "Steelman before critique",
          claim:
            "He states the strongest version of the opposing case before disagreeing with it, and tells the audience that's what he's doing.",
          citations: [
            {
              passageId: "devon-p6",
              quote:
                "I want to be fair to the smart home industry, so let me steelman the pitch first",
            },
          ],
        },
        {
          id: "devon-t6",
          section: "rhetorical_moves",
          name: "One concrete experiment as the closer",
          claim:
            "Every piece ends with a single, small, immediately actionable experiment rather than a list of takeaways.",
          citations: [
            {
              passageId: "devon-p4",
              quote: "turn passkeys on for your email account first",
            },
            {
              passageId: "devon-p13",
              quote: "Do it this weekend. It will take eleven minutes",
            },
          ],
        },
        {
          id: "devon-t7",
          section: "content_patterns",
          name: "Everyday analogies for technical machinery",
          claim:
            "Technical mechanisms are explained through domestic, physical analogies — keys, doormen, buildings — before any jargon is allowed in.",
          citations: [
            {
              passageId: "devon-p3",
              quote:
                "A password is like a key that you photocopy and hand to every building you ever enter",
            },
          ],
        },
        {
          id: "devon-t8",
          section: "content_patterns",
          name: "Demo-versus-reality framing",
          claim:
            "He structures critiques around the distance between a product's demo and its lived Tuesday-evening reality.",
          // Recorded run: fabricated quote — fails verification, repaired
          // with the real sentence from the same passage.
          citations: [
            {
              passageId: "devon-p6",
              quote: "The demo is a lie that everyone agrees to politely believe.",
            },
          ],
        },
        {
          id: "devon-t9",
          section: "content_patterns",
          name: "Transparent sponsor disclosures",
          claim:
            "He opens sponsored segments by stating exactly what the sponsorship does and does not buy.",
          // Recorded run: there is no sponsor content anywhere in the
          // transcripts. Verification fails and the repair pass drops it.
          citations: [
            {
              passageId: "devon-p10",
              quote: "this video is sponsored, and here is exactly what that means",
            },
          ],
        },
      ],
    },
    repairs: {
      "devon-t8": {
        action: "replace_citations",
        citations: [
          {
            passageId: "devon-p6",
            quote:
              "the gap between the demo and the Tuesday-evening reality is where this whole category lives",
          },
        ],
      },
      "devon-t9": {
        action: "drop",
      },
    },
  },
};
