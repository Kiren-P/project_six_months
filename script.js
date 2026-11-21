(() => {
  const S = window.STORY;
  const { herName, startDate } = S;
  const root = document.getElementById("story");
  const fill = (s) => (s || "").replaceAll("{name}", herName);

  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => fill(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  // Accepts DD-MM-YYYY or YYYY-MM-DD
  const parseDate = (s) => {
    const m = String(s).match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    return m ? new Date(+m[3], +m[2] - 1, +m[1]) : new Date(s + "T00:00:00");
  };

  // Build the list of story cards from story.js (count + defaults live there).
  const makeCards = () =>
    Array.from({ length: S.storyCardCount ?? 4 }, (_, i) => {
      const c = S.cards?.[i] || {};
      return {
        type: "storycard",
        date: c.date ?? `Card ${i + 1}`,
        title: c.title ?? `Story ${i + 1}`,
        text: c.text ?? "Placeholder text.",
        audio: c.audio ?? null,
        media: c.media ?? Array.from({ length: S.mediaPerCard ?? 3 }, (_, k) => ({ src: null, caption: `Placeholder ${k + 1}` })),
      };
    });

  // Only one story card (and its audio) is open at a time.
  let active = null;

  const mediaTile = (m, i) => {
    const tile = el("div", "mcard");
    if (!m.src) {
      tile.classList.add("mcard--empty");
      tile.innerHTML = `<span>${esc(m.caption || "Photo / video " + (i + 1))}</span>`;
      return tile;
    }
    const isVideo = m.type ? m.type === "video" : /\.(mp4|mov|webm|m4v)$/i.test(m.src);
    if (isVideo) {
      const v = el("video");
      v.src = m.src; v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
      v.setAttribute("playsinline", "");
      tile.append(v);
    } else {
      const img = el("img");
      img.src = m.src; img.alt = m.caption || ""; img.loading = "lazy";
      tile.append(img);
    }
    if (m.caption) tile.append(el("small", "mcard__cap", esc(m.caption)));
    return tile;
  };

  const builders = {
    hero(s, sec) {
      sec.classList.add("hero");
      sec.append(el("span", "kicker", esc(s.kicker)), el("h1", "", esc(s.title)), el("p", "", esc(s.subtitle)));
    },

    storycard(s, sec) {
      const audio = s.audio ? new Audio(s.audio) : null;

      // the card she taps
      const card = el("div", "flip");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML = `<div class="flip__inner">
        <div class="flip__face"><span class="date">${esc(s.date)}</span><h2>${esc(s.title)}</h2><span class="hint">Tap to open</span></div>
        <div class="flip__face flip__face--back"><p>${esc(s.text)}</p></div></div>`;

      // the media cards that appear after tapping (swipe sideways)
      const tray = el("div", "tray");
      const inner = el("div", "tray__inner");
      const scroller = el("div", "tray__scroll");
      s.media.forEach((m, i) => scroller.append(mediaTile(m, i)));
      inner.append(scroller);
      if (s.media.length > 1) inner.append(el("span", "hint tray__hint", "Swipe →"));
      tray.append(inner);

      const videos = () => scroller.querySelectorAll("video");

      const api = {
        open() {
          if (active && active !== api) active.close();
          active = api;
          card.classList.add("open");
          tray.classList.add("open");
          videos().forEach((v) => { v.preload = "auto"; v.play().catch(() => {}); });
          if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); } // missing file / blocked = stay silent
          setTimeout(() => tray.scrollIntoView({ behavior: "smooth", block: "nearest" }), 450);
        },
        close() {
          card.classList.remove("open");
          tray.classList.remove("open");
          videos().forEach((v) => v.pause());
          if (audio) audio.pause();
          if (active === api) active = null;
        },
      };

      const toggle = () => (card.classList.contains("open") ? api.close() : api.open());
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), toggle()));

      sec.append(card, tray);
    },

    counter(s, sec) {
      sec.classList.add("counter");
      const big = el("div", "counter__big");
      const small = el("div", "counter__small");
      const start = parseDate(startDate).getTime();
      const tick = () => {
        const ms = Date.now() - start;
        big.textContent = `${Math.floor(ms / 864e5)} days`;
        small.textContent = `${Math.floor(ms / 36e5) % 24}h ${Math.floor(ms / 6e4) % 60}m ${Math.floor(ms / 1e3) % 60}s — and counting`;
      };
      tick();
      setInterval(tick, 1000);
      sec.append(el("span", "kicker", esc(s.title)), big, small);
    },

    letter(s, sec) {
      const wrap = el("div", "letter-wrap");
      const env = el("button", "envelope", `💌<span class="hint">${esc(s.prompt)}</span>`);
      const letter = el("div", "letter", `<h2>${esc(s.title)}</h2><p>${esc(s.text)}</p><p class="sign">${esc(s.signoff)}</p>`);
      env.addEventListener("click", () => wrap.classList.add("open"));
      wrap.append(env, letter);
      sec.append(wrap);
    },
  };

  // "storycards" is a placeholder in S.scenes that expands into every story card
  const scenes = S.scenes.flatMap((s) => (s.type === "storycards" ? makeCards() : [s]));
  scenes.forEach((s) => {
    const sec = el("section", "scene");
    builders[s.type]?.(s, sec);
    root.append(sec);
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.25 }
  );
  document.querySelectorAll(".scene").forEach((n) => io.observe(n));

  const bar = document.getElementById("progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  addEventListener("pointerdown", (e) => {
    const h = el("div", "heart", "❤");
    h.style.left = e.clientX - 14 + "px";
    h.style.top = e.clientY - 14 + "px";
    document.body.append(h);
    setTimeout(() => h.remove(), 1400);
  });
})();
