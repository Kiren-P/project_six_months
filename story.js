// ✏️  EDIT ME — this file is the whole story. Each object is one scene, shown in order.
// Everything below is placeholder text. Swap in your real memories, dates and photos.
// Photos: drop files into /assets and set image: "assets/our-photo.jpg" (otherwise a gradient is shown).

window.STORY = {
  herName: "Her Name",          // shown on the opening scene and the letter
  startDate: "2026-05-21",      // the day you got together (YYYY-MM-DD) — drives the live counter

  scenes: [
    {
      type: "hero",
      kicker: "Six months",
      title: "For {name}",
      subtitle: "A little story of us. Scroll down.",
    },

    {
      type: "moment",
      date: "Month 1",
      title: "The beginning",
      text: "Placeholder: write about how it all started — the first message, the first date, the first time you knew.",
      emoji: "✨",
      image: null,
    },

    {
      type: "flip",
      prompt: "Tap to remember",
      front: "The moment I knew",
      back: "Placeholder: the exact moment you realised she was the one.",
    },

    {
      type: "moment",
      date: "Month 3",
      title: "Our thing",
      text: "Placeholder: an inside joke, a favourite place, a ritual only the two of you have.",
      emoji: "🌙",
      image: null,
    },

    {
      type: "months",
      title: "Six months, one by one",
      note: "Tap a month",
      months: [
        { label: "1", text: "Placeholder: what month one meant." },
        { label: "2", text: "Placeholder: what month two meant." },
        { label: "3", text: "Placeholder: what month three meant." },
        { label: "4", text: "Placeholder: what month four meant." },
        { label: "5", text: "Placeholder: what month five meant." },
        { label: "6", text: "Placeholder: today. Still falling for you." },
      ],
    },

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
