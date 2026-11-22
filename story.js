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
      date: "Chapter one",
      title: "Title for card 1",                // ✏️ front of the card
      text: "Placeholder: a line for card 1.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 1.mp4",
      media: [
        { src: "media/Card 1/WhatsApp Video 2026-11-21 at 18.59.47.mp4" },
        { src: "media/Card 1/WhatsApp Video 2026-11-21 at 18.59.48.mp4" },
      ],
    },

    // ── Card 2 ── 1 media file(s)
    {
      date: "Chapter two",
      title: "Title for card 2",                // ✏️ front of the card
      text: "Placeholder: a line for card 2.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 2.m4a.mp4",
      media: [
        { src: "media/Card 2/WhatsApp Video 2026-11-21 at 18.59.32.mp4" },
      ],
    },

    // ── Card 3 ── 4 media file(s)
    {
      date: "Chapter three",
      title: "Title for card 3",                // ✏️ front of the card
      text: "Placeholder: a line for card 3.",   // ✏️ back of the card (shown while it flips)
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
      date: "Chapter four",
      title: "Title for card 4",                // ✏️ front of the card
      text: "Placeholder: a line for card 4.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 4.m4a.mp4",
      media: [
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30 (5).jpeg" },
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30 (6).jpeg" },
        { src: "media/Card 4/WhatsApp Image 2026-11-21 at 18.59.30.jpeg" },
      ],
    },

    // ── Card 5 ── 14 media file(s)
    {
      date: "Chapter five",
      title: "Title for card 5",                // ✏️ front of the card
      text: "Placeholder: a line for card 5.",   // ✏️ back of the card (shown while it flips)
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
      date: "Chapter six",
      title: "Title for card 6",                // ✏️ front of the card
      text: "Placeholder: a line for card 6.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 6.m4a.mp4",
      media: [
        { src: "media/Card 6/WhatsApp Video 2026-11-21 at 18.59.40.mp4" },
        { src: "media/Card 6/WhatsApp Video 2026-11-21 at 18.59.41 (1).mp4" },
        { src: "media/Card 6/WhatsApp Image 2026-11-21 at 18.59.31 (1).jpeg" },
      ],
    },

    // ── Card 7 ── 3 media file(s)
    {
      date: "Chapter seven",
      title: "Title for card 7",                // ✏️ front of the card
      text: "Placeholder: a line for card 7.",   // ✏️ back of the card (shown while it flips)
      audio: "voiceovers/Card 7.m4a.mp4",
      media: [
        { src: "media/Card 7/WhatsApp Video 2026-11-21 at 18.59.35.mp4" },
        { src: "media/Card 7/WhatsApp Image 2026-11-21 at 18.59.31 (3).jpeg" },
        { src: "media/Card 7/WhatsApp Image 2026-11-21 at 18.59.31 (4).jpeg" },
      ],
    },

    // ── Card 8 ── 7 media file(s)
    {
      date: "Chapter eight",
      title: "Title for card 8",                // ✏️ front of the card
      text: "Placeholder: a line for card 8.",   // ✏️ back of the card (shown while it flips)
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
      title: "Together for",
    },

    {
      type: "letter",
      prompt: "Tap to open",
      title: "One last thing…",
      text:
        "Placeholder letter.\n\nWrite what you really want to say to her here. Line breaks are kept.\n\nI love you, {name}.",
      signoff: "— Yours",
    },
  ],
};
