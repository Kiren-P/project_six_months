// ✏️  EDIT ME — this file is the whole story.
// Scenes are shown in order as she scrolls. Everything marked "Placeholder" is yours to replace.
//
// FOLDERS: your photos/videos live in /media (already in the repo). Put voice-overs in a new /audio folder.
// Paths are written relative to index.html, e.g. "media/my-photo.jpeg" or "audio/card1.mp3".
// Tip: avoid spaces in file names (rename "WhatsApp Image ... (1).jpeg" to something like "first-date.jpeg").

window.STORY = {
  herName: "Ishani",            // shown on the opening scene and the letter
  startDate: "26-05-2026",      // day you got together — DD-MM-YYYY or YYYY-MM-DD both work — drives the live counter

  // ─────────────────────────────────────────────────────────────────────────────
  // 1) HOW MANY STORY CARDS (one card per scroll section)
  //    Change this one number to add/remove cards. Currently 4.
  //    - If `cards` below has fewer entries than this number, the extra cards are filled with placeholders.
  //    - If `cards` has more entries, the extras are ignored (so you can keep drafts around).
  storyCardCount: 4,

  // 2) HOW MANY MEDIA CARDS POP OUT when she taps a story card (default for every card)
  //    They fill the screen in a grid of 2 columns. 4 = a 2x2 grid with the card's button in the middle
  //    (use an even number — 2, 4, 6 — so the middle button sits neatly between tiles).
  //    A card that has its own `media: [...]` list below uses the length of that list instead.
  mediaPerCard: 4,
  // ─────────────────────────────────────────────────────────────────────────────

  // The story cards, in order. Card #1 is the first object, card #2 the second, etc.
  cards: [
    {
      date: "Month 1",
      title: "The beginning",                 // shown on the front of the card
      text: "Placeholder: how it all started.", // shown on the back once she flips it

      // 3) AUDIO FOR THIS CARD — path to your voice-over. Plays when she taps the card.
      //    Plays when she taps the card; the middle button then pauses/resumes it. Leave null (or a file that doesn't exist yet) to stay silent.
      audio: ".\\voiceovers\\sound-of-waves-marine-drive-mumbai.mp3", // e.g. "audio/card1.mp3"

      // 4) MEDIA FOR THIS CARD — the tiles that fill the screen around the middle button after she taps.
      //    One object per media card, so the number of objects = the number of pop-out cards for THIS card.
      //    src: path to the photo/video. null = shows a "placeholder" tile. type is auto-detected
      //    from the extension (.mp4/.mov/.webm = video, anything else = image).
      //    Delete this whole `media` list to fall back to `mediaPerCard` blank placeholders instead.
      media: [
        { src: null, caption: "Placeholder 1" }, // e.g. { src: "media/first-date.jpeg", caption: "Our first date" }
        { src: null, caption: "Placeholder 2" }, // e.g. { src: "media/first-clip.mp4" }
        { src: null, caption: "Placeholder 3" },
        { src: null, caption: "Placeholder 4" },
      ],
    },

    {
      date: "Month 2",
      title: "Falling for you",
      text: "Placeholder: a memory from the second month.",
      audio: null, // e.g. "audio/card2.mp3"
      media: [
        { src: null, caption: "Placeholder 1" },
        { src: null, caption: "Placeholder 2" },
        { src: null, caption: "Placeholder 3" },
        { src: null, caption: "Placeholder 4" },
      ],
    },

    {
      date: "Month 4",
      title: "Our thing",
      text: "Placeholder: an inside joke, a favourite place, a ritual only you two have.",
      audio: null, // e.g. "audio/card3.mp3"
      media: [
        { src: null, caption: "Placeholder 1" },
        { src: null, caption: "Placeholder 2" },
        { src: null, caption: "Placeholder 3" },
        { src: null, caption: "Placeholder 4" },
      ],
    },

    {
      date: "Month 6",
      title: "Today",
      text: "Placeholder: today. Still falling for you.",
      audio: null, // e.g. "audio/card4.mp3"
      media: [
        { src: null, caption: "Placeholder 1" },
        { src: null, caption: "Placeholder 2" },
        { src: null, caption: "Placeholder 3" },
        { src: null, caption: "Placeholder 4" },
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
