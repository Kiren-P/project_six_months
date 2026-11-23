// ✏️  EDIT ME — this file is the whole story.
// Scenes are shown in order as she scrolls.
//
// PATHS are relative to index.html and must use forward slashes:  "media/Card 1/clip.mp4"  ✅
//                                                                   ".\media\Card 1\clip.mp4"  ❌ (won't load)
// Photos/videos for card N live in media/Card N/, voice-overs in voiceovers/.
// Video tiles are always muted (the sound was also stripped from the files) so only the voice-over is heard.

window.STORY = {
  herName: "Ishani",            // shown on the opening scene and the letter
  startDate: "26-05-2026",      // day you got together — DD-MM-YYYY or YYYY-MM-DD both work — drives the live counter

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) HOW MANY STORY CARDS (one card per scroll section)
  //    - If `cards` below has fewer entries than this number, the extra cards are filled with placeholders.
  //    - If `cards` has more entries, the extras are ignored (so you can keep drafts around).
  storyCardCount: 8,

  // 2) HOW MANY MEDIA TILES a card shows when it has NO `media` list (blank placeholders).
  //    Cards with a `media` list show exactly the files in that list. Layout is automatic:
  //      1–4 tiles  → they fill the screen in a grid around the middle button
  //      5+ tiles   → they shrink into scattered polaroids (tap one to enlarge it)
  mediaPerCard: 4,
  // ─────────────────────────────────────────────────────────────────────────────

  // The story cards, in order. Each card:
  //   audio: the voice-over. Plays as soon as she taps; when it ENDS the card closes and flips back.
  //   media: one { src } per tile. .mp4/.mov/.webm = looping muted video, anything else = photo.
  //          Optional: { src, caption: "text under the tile" }.
  cards: [
    // ── Card 1 ── 2 media file(s)
    {
      title: "Toen we spraken",                // ✏️ front of the card
      text: "Toen we spraken",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 1.mp4",
      media: [
        { src: "media/Card 1/WhatsApp Video 2026-11-21 at 18.59.47.mp4" },
        { src: "media/Card 1/WhatsApp Video 2026-11-21 at 18.59.48.mp4" },
      ],
    },

    // ── Card 2 ── 1 media file(s)
    {
      title: "Eerste ontmoeting",                // ✏️ front of the card
      text: "Eerste ontmoeting",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 2.m4a.mp4",
      media: [
        { src: "media/Card 2/WhatsApp Video 2026-11-21 at 18.59.32.mp4" },
      ],
    },

    // ── Card 3 ── 4 media file(s)
    {
      title: "Onze eerste date",                // ✏️ front of the card
      text: "Onze eerste date",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 3.m4a.mp4",
      media: [
        { src: "media/Card 3/WhatsApp Image 2026-11-21 at 18.59.28.jpeg" },
        { src: "media/Card 3/WhatsApp Image 2026-11-21 at 18.59.29 (1).jpeg" },
        { src: "media/Card 3/WhatsApp Image 2026-11-21 at 18.59.29 (2).jpeg" },
        { src: "media/Card 3/WhatsApp Image 2026-11-21 at 18.59.29.jpeg" },
      ],
    },

    // ── Card 4 ── 3 media file(s)
    {
      title: "Jouw man",                // ✏️ front of the card
      text: "Jouw man",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 4.m4a.mp4",
      media: [
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30 (5).jpeg" },
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30 (6).jpeg" },
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30.jpeg" },
      ],
    },

    // ── Card 5 ── 14 media file(s)
    {
      title: "Dates",                // ✏️ front of the card
      text: "Dates.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 5.m4a.mp4",
      media: [
        { src: "media/Card 5/WhatsApp Video 2026-11-21 at 18.59.32 (1).mp4" },
        { src: "media/Card 5/WhatsApp Video 2026-11-21 at 18.59.36 (1).mp4" },
        { src: "media/Card 5/WhatsApp Video 2026-11-21 at 18.59.36.mp4" },
        { src: "media/Card 5/WhatsApp Video 2026-11-21 at 18.59.42.mp4" },
        { src: "media/Card 5/cheek kiss.mp4" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.28 (1).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.28 (2).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.28 (3).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.30 (1).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.30 (2).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.30 (3).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.30 (4).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.31 (2).jpeg" },
        { src: "media/Card 5/WhatsApp Image 2026-11-21 at 18.59.31.jpeg" },
      ],
    },

    // ── Card 6 ── 3 media file(s)
    {
      title: "Onze eerste maand samen",                // ✏️ front of the card
      text: "Onze eerste maand samen",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 6.m4a.mp4",
      media: [
        { src: "media/Card 6/WhatsApp Video 2026-11-21 at 18.59.40.mp4" },
        { src: "media/Card 6/WhatsApp Video 2026-11-21 at 18.59.41 (1).mp4" },
        { src: "media/Card 6/WhatsApp Image 2026-11-21 at 18.59.31 (1).jpeg" },
      ],
    },

    // ── Card 7 ── 3 media file(s)
    {
      title: "Momenten",                // ✏️ front of the card
      text: "Momenten",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 7.m4a.mp4",
      media: [
        { src: "media/Card 7/WhatsApp Video 2026-11-21 at 18.59.35.mp4" },
        { src: "media/Card 7/WhatsApp Image 2026-11-21 at 18.59.31 (3).jpeg" },
        { src: "media/Card 7/WhatsApp Image 2026-11-21 at 18.59.31 (4).jpeg" },
      ],
    },

    // ── Card 8 ── 7 media file(s)
    {
      title: "7448 Km",                // ✏️ front of the card
      text: "7448 Km",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 8.m4a.mp4",
      media: [
        { src: "media/Card 8/WhatsApp Video 2026-11-21 at 18.59.43.mp4" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.28 (4).jpeg" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.31 (5).jpeg" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.31 (6).jpeg" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.31 (7).jpeg" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.31 (8).jpeg" },
        { src: "media/Card 8/WhatsApp Image 2026-11-21 at 18.59.32.jpeg" },
      ],
    },
  ],

  // The order of the page. "storycards" expands into all the story cards above — move or remove it as you like.
  scenes: [
    {
      type: "hero",
      kicker: "Happy Six months",
      title: "Ishani",
      subtitle: "A little story of us. Scroll down.",
    },

    { type: "storycards" },

    {
      type: "counter",
      title: "We zijn",
    },

    {
      // The final card: flips open into the full letter, plays your voice-over and highlights each word.
      // The letter TEXT and per-word TIMINGS come from letter.js, which is generated from Letter.txt and
      // voiceovers/Letter.mp4. After editing Letter.txt or re-recording, run:  python tools/align_letter.py
      type: "letter",
      prompt: "Tap to open",
      title: "6 maanden",      // front of the letter card
      signoff: "— jouw Kiren",            // shown under the letter; set to "" to hide
      // If the blue highlight runs consistently ahead of your voice, make this negative (e.g. -0.2);
      // if it lags behind, make it positive (e.g. 0.2). In seconds.
      syncOffset: 0,
    },
  ],
};
