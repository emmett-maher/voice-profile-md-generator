import type { DemoPersona } from "../types";

/**
 * Maya Brennan — punchy fitness creator. Fictional. Transcripts written for
 * the demo; the recorded synthesis run includes one trait that fails
 * verification and is repaired with real evidence, and one trait that fails
 * and is dropped because no supporting quote exists.
 */
export const maya: DemoPersona = {
  id: "maya",
  name: "Maya Brennan",
  tagline: "Punchy fitness creator — tough love, tiny habits, zero excuses",
  description:
    "Short-form fitness motivation. Speaks in punches: second-person commands, sentence fragments, homework assignments at the end of every video.",
  sources: [
    {
      id: "maya-src-1",
      platform: "youtube",
      title: "Why Your First 5AM Workout Will Suck (Watch Anyway)",
      url: "https://youtube.com/watch?v=demo-maya-5am",
    },
    {
      id: "maya-src-2",
      platform: "youtube",
      title: "I Trained Every Day for 30 Days. Here's the Truth.",
      url: "https://youtube.com/watch?v=demo-maya-30days",
    },
    {
      id: "maya-src-3",
      platform: "social",
      title: "Reel: Stop Waiting for Motivation",
      url: "https://instagram.com/reel/demo-maya-motivation",
    },
  ],
  passages: [
    {
      id: "maya-p1",
      sourceId: "maya-src-1",
      text: "Okay, real talk. Your first 5AM workout is going to suck. Like, properly suck. Your alarm goes off, your brain invents fifteen reasons to stay in bed, and every single one of them sounds like genius at 4:55 in the morning. Do it anyway. Not because you're motivated. You won't be. You do it because you decided last night, and the version of you that decided was smarter than the version that's negotiating right now.",
    },
    {
      id: "maya-p2",
      sourceId: "maya-src-1",
      text: "Here's what nobody tells you. Nobody. The first week isn't about fitness at all. It's about proving to yourself that your own word means something. That's it. That's the whole game. You show up Monday, you show up Tuesday, and by Friday something weird happens — you stop arguing with the alarm. The argument just ends. Not because you won it. Because you stopped showing up to it.",
    },
    {
      id: "maya-p3",
      sourceId: "maya-src-1",
      text: "And listen, I know how this sounds coming from a fitness account. Easy for her, right? Wrong. I hit snooze for six straight years. Six. I once set four alarms and slept through a fire drill. I am not built different. I just got sick of negotiating with myself and started outsourcing the decision to the night before, when I'm smarter and slightly less dramatic.",
    },
    {
      id: "maya-p4",
      sourceId: "maya-src-1",
      text: "So here's your homework, and I mean tonight. Lay out your shoes. Fill the water bottle. Put the alarm across the room. Tiny moves. Stupidly tiny. But stack enough tiny moves and you build a person who shows up. And a person who shows up? Unstoppable. Comment 'shoes out' when it's done so I know you're in.",
    },
    {
      id: "maya-p5",
      sourceId: "maya-src-2",
      text: "Day one, I felt amazing. Day four, my legs filed a formal complaint. Day eleven — and I'm not going to sugarcoat this — I cried in my car in the gym parking lot. Stayed in the car for ten minutes. Went in anyway. And that, right there, that's the rep that counted. Not the squats. The door.",
    },
    {
      id: "maya-p6",
      sourceId: "maya-src-2",
      text: "Look, thirty days straight is not the point, and honestly? I don't recommend it. Rest is training. Sleep is training. What I do recommend is finding out where your edges are, because most of us quit about three miles before the actual edge. Three. Miles. You have so much more in the tank than you think you do.",
    },
    {
      id: "maya-p7",
      sourceId: "maya-src-2",
      text: "People keep asking me for the secret and I keep giving the same boring answer. There is no secret. There's just the boring stuff, done daily, until the boring stuff becomes who you are. Brush your teeth. Move your body. Same energy. Nobody waits to feel inspired to brush their teeth.",
    },
    {
      id: "maya-p8",
      sourceId: "maya-src-2",
      text: "Somewhere around day twenty the weirdest thing happened. I stopped tracking how hard it was. Not because it got easy — it didn't — but because hard stopped being interesting. Hard became the weather. You don't cancel your life because it's raining. You bring a jacket. So bring the jacket. That's the whole video. Bring the jacket.",
    },
    {
      id: "maya-p9",
      sourceId: "maya-src-2",
      text: "One more thing before you go, because somebody in the comments needs to hear this. You are not behind. There is no behind. There's just today, and the very small question of whether you're going to keep one promise to yourself before it ends. One. Start there. Everything else is decoration.",
    },
    {
      id: "maya-p10",
      sourceId: "maya-src-3",
      text: "Stop waiting for motivation. Motivation is a flaky friend who shows up late and leaves early. Discipline is the friend who helps you move apartments. Build the second friendship. Three things tonight: shoes out, water filled, alarm far away. That's it. Go.",
    },
    {
      id: "maya-p11",
      sourceId: "maya-src-3",
      text: "Quick one, because I keep seeing this in my DMs. You don't need a program. You need a floor. A floor is the minimum you do on your worst day — ten minutes, one walk, whatever. Programs collapse when life happens. Floors don't. Set your floor so low it's embarrassing, and then never, ever go below it.",
    },
    {
      id: "maya-p12",
      sourceId: "maya-src-3",
      text: "And hey — if today was a floor day, that counts. Say it back to me. That counts. You kept the streak alive on a day your couch was actively recruiting you. That's not a small win. That's the entire skill. Stack those and watch what happens by spring.",
    },
    {
      id: "maya-p13",
      sourceId: "maya-src-1",
      text: "Before the workout itself, one mindset shift, and it's free. Stop calling it a workout. Start calling it a meeting with the person you're becoming. You wouldn't ghost that person. You'd show up early. You'd bring coffee. Five minutes, that's all the meeting needs to count. The meeting just has to happen.",
    },
    {
      id: "maya-p14",
      sourceId: "maya-src-2",
      text: "Real numbers, because I promised you honesty. I missed zero days but I shortened nine of them. Nine days were ten minutes or less. And guess what? Those nine days did more for me than the big ones, because they taught me the difference between an off day and an off ramp. Off days are fine. Off ramps cost you the whole road.",
    },
    {
      id: "maya-p15",
      sourceId: "maya-src-1",
      text: "Let me kill one more excuse while we're here. You don't need an hour. The hour is a myth that keeps busy people on the couch. Twenty focused minutes beats sixty distracted ones every day of the week and twice on Monday. Set a timer. Pick three moves. When the timer dies, you're done. That's a workout. Anyone telling you otherwise is selling a membership.",
    },
    {
      id: "maya-p16",
      sourceId: "maya-src-1",
      text: "And drink the water. I know. Boring. Riveting content over here. But you'd be shocked how many of you are tired, cranky, and calling it a motivation problem when it's a hydration problem. Big bottle. On the desk. In your eyeline. Done. We fix the dumb stuff first, because the dumb stuff is usually the actual problem.",
    },
    {
      id: "maya-p17",
      sourceId: "maya-src-2",
      text: "Quick confession from week three. I started performing my workouts for the camera instead of doing them for me. Caught myself picking exercises because they looked good on film. Deleted the footage, did the ugly workout, the one with the wobbles and the resting. Best session of the month. Your gym time is not content. Guard that.",
    },
    {
      id: "maya-p18",
      sourceId: "maya-src-2",
      text: "If you're starting your own thirty days — first of all, don't copy mine. Build yours smaller. Embarrassingly small, remember? Second, tell exactly one person. Not the internet. One person who will actually ask you about it on day nine when the shine wears off. Accountability is a person, not a post.",
    },
    {
      id: "maya-p19",
      sourceId: "maya-src-3",
      text: "Last thing. Progress photos lie, scales lie harder, but your morning energy doesn't lie. Track that. One word in your notes app every single morning: trash, meh, good, great. Thirty days of one-word data will teach you more about your body than any influencer spreadsheet, mine included.",
    },
    {
      id: "maya-p20",
      sourceId: "maya-src-3",
      text: "Somebody asked if I ever miss the old lazy Sundays. Honestly? Yes. Every week. And then I remember that the old Sundays came with the Sunday scaries and a body that creaked getting off the couch, and the new ones come with pancakes after a long walk. I didn't give up rest. I upgraded it. That's the trade. Take the trade.",
    },
    {
      id: "maya-p21",
      sourceId: "maya-src-3",
      text: "Oh, and unfollow anyone who makes you feel behind. Seriously. Right now, while you're thinking about it. Your feed is your locker room. If the people in it make you want to quit before you start, that's not motivation, that's noise wearing motivation's jacket. Curate the room. Then get to work in it. Protect your head the same way you protect your knees.",
    },
  ],
  recording: {
    draft: {
      summary:
        "You write and speak like Maya Brennan: a tough-love fitness coach who talks to one person, not an audience. You favor second-person commands, short punchy fragments, self-deprecating confessions, and you always end with a tiny, concrete assignment. Warm, but allergic to excuses.",
      traits: [
        {
          id: "maya-t1",
          section: "voice_and_tone",
          name: "Tough-love directness",
          claim:
            "She gives orders, not suggestions — direct second-person commands that pre-empt the listener's excuses before they form.",
          citations: [
            {
              passageId: "maya-p1",
              quote: "Do it anyway. Not because you're motivated. You won't be.",
            },
          ],
        },
        {
          id: "maya-t2",
          section: "voice_and_tone",
          name: "Self-deprecating credibility",
          claim:
            "She undercuts her own authority with confessions of failure, which makes the tough love land as solidarity rather than superiority.",
          citations: [
            {
              passageId: "maya-p5",
              quote: "I cried in my car in the gym parking lot.",
            },
            {
              passageId: "maya-p3",
              quote: "I hit snooze for six straight years. Six.",
            },
          ],
        },
        {
          id: "maya-t3",
          section: "signature_vocabulary",
          name: "Honesty markers: 'real talk', 'honestly'",
          claim:
            "She flags candor explicitly before delivering an uncomfortable truth, training the audience to lean in when the marker appears.",
          citations: [
            {
              passageId: "maya-p1",
              quote: "Okay, real talk.",
            },
            {
              passageId: "maya-p6",
              quote: "and honestly? I don't recommend it.",
            },
          ],
        },
        {
          id: "maya-t4",
          section: "sentence_rhythm",
          name: "Fragment punches",
          claim:
            "Key beats land as one- or two-word sentence fragments — often a repeated word given its own full stop for emphasis.",
          citations: [
            {
              passageId: "maya-p6",
              quote: "Three. Miles.",
            },
            {
              passageId: "maya-p10",
              quote: "That's it. Go.",
            },
          ],
        },
        {
          id: "maya-t5",
          section: "rhetorical_moves",
          name: "Personifying abstractions",
          claim:
            "She turns abstract concepts into characters with social lives, making discipline and motivation feel like people you choose between.",
          citations: [
            {
              passageId: "maya-p10",
              quote:
                "Motivation is a flaky friend who shows up late and leaves early. Discipline is the friend who helps you move apartments.",
            },
          ],
        },
        {
          id: "maya-t6",
          section: "rhetorical_moves",
          name: "Homework assignments as closers",
          claim:
            "Videos end with a tiny, concrete, same-day assignment plus a call to report back — never with a vague inspirational send-off.",
          citations: [
            {
              passageId: "maya-p4",
              quote: "So here's your homework, and I mean tonight. Lay out your shoes.",
            },
            {
              passageId: "maya-p10",
              quote: "Three things tonight: shoes out, water filled, alarm far away.",
            },
          ],
        },
        {
          id: "maya-t7",
          section: "content_patterns",
          name: "Anti-secret myth-busting",
          claim:
            "She opens or pivots by demolishing the idea that a hidden trick exists, then re-sells the boring fundamentals as the real answer.",
          // Recorded run: this quote is fabricated — it appears in no passage.
          // Verification fails and the repair pass finds the real evidence.
          citations: [
            {
              passageId: "maya-p7",
              quote: "The fitness industry is lying to you about motivation, full stop.",
            },
          ],
        },
        {
          id: "maya-t8",
          section: "content_patterns",
          name: "Six-week transformation promises",
          claim:
            "She anchors viewers with a specific transformation timeline, promising visible change by week six.",
          // Recorded run: no such promise exists anywhere in her content.
          // Verification fails and the repair pass drops the trait.
          citations: [
            {
              passageId: "maya-p2",
              quote: "By week six you will be a completely different human being.",
            },
          ],
        },
      ],
    },
    repairs: {
      "maya-t7": {
        action: "replace_citations",
        citations: [
          {
            passageId: "maya-p7",
            quote:
              "There is no secret. There's just the boring stuff, done daily, until the boring stuff becomes who you are.",
          },
        ],
      },
      "maya-t8": {
        action: "drop",
      },
    },
  },
};
