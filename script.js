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
        date: c.date ?? "", // optional small label above the title
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
      v.setAttribute("playsinline", ""); v.setAttribute("muted", ""); // always silent: only the voice-over is heard
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

    storycard(s, sec, idx) {
      const audio = s.audio ? new Audio() : null;
      if (audio) { audio.preload = "none"; audio.src = s.audio; }

      // the card she taps
      const card = el("div", "flip");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML = `<div class="flip__inner">
        <div class="flip__face">${s.date ? `<span class="date">${esc(s.date)}</span>` : ""}<h2>${esc(s.title)}</h2><span class="hint">Tap to open</span></div>
        <div class="flip__face flip__face--back"><p>${esc(s.text)}</p></div></div>`;

      // full-screen overlay. Layout depends on how many media files the card has:
      //   1–4  → "grid": tiles fill the screen around the centre button
      //   5+   → "scatter": smaller polaroids scattered around the screen (tap one to enlarge it)
      const n = s.media.length;
      const scatter = n > 4;
      const ov = el("div", "overlay");
      const stage = el("div", "ostage " + (scatter ? "scatter" : "ogrid"));
      if (!scatter) {
        const cols = n <= 2 ? 1 : 2;
        stage.style.setProperty("--cols", cols);
        stage.style.setProperty("--rows", Math.ceil(n / cols));
      }
      const tiles = s.media.map((m, i) => {
        const t = mediaTile(m, i);
        if (!scatter && n === 3 && i === 2) t.classList.add("span2");
        stage.append(t);
        return t;
      });
      const hub = el("button", "hub", "<span></span>");
      hub.setAttribute("aria-label", "Play or pause voice-over");
      const closeBtn = el("button", "overlay__close", "✕");
      closeBtn.setAttribute("aria-label", "Close");
      ov.append(stage, hub, closeBtn);
      document.body.append(ov);

      // Scatter positions: a jittered grid with a random tilt. Seeded per card so the layout is stable.
      const rand = (() => { let x = (idx + 1) * 7919; return () => (x = (x * 9301 + 49297) % 233280) / 233280; })();
      const jitter = tiles.map(() => ({ dx: rand() - 0.5, dy: rand() - 0.5, r: (rand() - 0.5) * 18, z: rand() }));
      const layout = () => {
        const W = stage.clientWidth, H = stage.clientHeight;
        if (scatter) {
          const cols = n <= 8 ? 2 : 3, rows = Math.ceil(n / cols);
          const cw = W / cols, ch = H / rows;
          const w = Math.min(cw * 1.12, (ch * 1.12) / 1.25), h = w * 1.25;
          const zs = Math.min((W * 0.92) / w, (H * 0.8) / h);
          tiles.forEach((t, i) => {
            const row = Math.floor(i / cols), inRow = Math.min(cols, n - row * cols);
            const col = (i % cols) + (cols - inRow) / 2; // centre a short last row
            const j = jitter[i];
            const cx = (col + 0.5) * cw + j.dx * cw * 0.24, cy = (row + 0.5) * ch + j.dy * ch * 0.2;
            const left = Math.max(-w * 0.04, Math.min(W - w * 0.96, cx - w / 2));
            const top = Math.max(-h * 0.04, Math.min(H - h * 0.96, cy - h / 2));
            Object.assign(t.style, { width: w + "px", height: h + "px", left: left + "px", top: top + "px", zIndex: 1 + Math.round(j.z * n) });
            t.style.setProperty("--r", j.r.toFixed(1) + "deg");
            // enlarge-on-tap target: centred, as big as fits
            t.style.setProperty("--zx", W / 2 - (left + w / 2) + "px");
            t.style.setProperty("--zy", H / 2 - (top + h / 2) + "px");
            t.style.setProperty("--zs", zs.toFixed(3));
          });
        }
        // every tile flies out from the centre button to its spot
        tiles.forEach((t) => {
          t.style.setProperty("--fx", W / 2 - (t.offsetLeft + t.offsetWidth / 2) + "px");
          t.style.setProperty("--fy", H / 2 - (t.offsetTop + t.offsetHeight / 2) + "px");
        });
      };

      if (scatter) {
        tiles.forEach((t) =>
          t.addEventListener("click", () => {
            const on = !t.classList.contains("zoom");
            tiles.forEach((x) => x.classList.remove("zoom"));
            t.classList.toggle("zoom", on);
          })
        );
      }

      const videos = () => ov.querySelectorAll("video");
      const setIcon = () => { hub.firstChild.textContent = audio ? (audio.paused ? "▶" : "❚❚") : "♥"; };
      setIcon();

      let showTimer;
      const api = {
        warm() { // called when the card scrolls near the screen, so media is ready when she taps
          if (audio) audio.preload = "auto";
          videos().forEach((v) => (v.preload = "auto"));
        },
        open() {
          if (active && active !== api) active.close();
          active = api;
          card.classList.add("open"); // 1) card flips
          if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); } // missing file / blocked = stay silent
          hub.style.setProperty("--p", 0);
          videos().forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); }); // videos start right away, muted & looping
          layout();
          const step = Math.min(70, 700 / n);
          tiles.forEach((t, i) => (t.style.transitionDelay = `${Math.round(i * step)}ms`));
          showTimer = setTimeout(() => { // 2) then it becomes the centre button and the tiles fly out
            ov.classList.add("show");
            document.body.classList.add("locked");
            setTimeout(() => tiles.forEach((t) => (t.style.transitionDelay = "")), 1300);
          }, 650);
        },
        close() {
          clearTimeout(showTimer);
          ov.classList.remove("show");
          tiles.forEach((t) => t.classList.remove("zoom"));
          document.body.classList.remove("locked");
          card.classList.remove("open"); // card flips back
          videos().forEach((v) => v.pause());
          if (audio) audio.pause();
          if (active === api) active = null;
        },
      };
      sec._warm = api.warm;

      if (audio) {
        ["play", "pause"].forEach((ev) => audio.addEventListener(ev, setIcon));
        audio.addEventListener("timeupdate", () => hub.style.setProperty("--p", audio.duration ? audio.currentTime / audio.duration : 0));
        // when the voice-over finishes: stop the videos, close the tiles and flip the card back
        audio.addEventListener("ended", () => active === api && api.close());
      }

      card.addEventListener("click", () => api.open());
      card.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), api.open()));
      hub.addEventListener("click", () => (audio ? (audio.paused ? audio.play().catch(() => {}) : audio.pause()) : api.close()));
      closeBtn.addEventListener("click", () => api.close());
      addEventListener("keydown", (e) => e.key === "Escape" && active === api && api.close());
      addEventListener("resize", () => active === api && layout());

      sec.append(card);
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
  let cardIdx = 0;
  scenes.forEach((s) => {
    const sec = el("section", "scene");
    builders[s.type]?.(s, sec, s.type === "storycard" ? cardIdx++ : 0);
    root.append(sec);
  });

  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.25 }
  );
  document.querySelectorAll(".scene").forEach((n) => io.observe(n));

  // start loading a card's voice-over and videos when it's about one screen away
  const warmIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target._warm(), warmIO.unobserve(e.target))),
    { rootMargin: "100% 0px" }
  );
  document.querySelectorAll(".scene").forEach((n) => n._warm && warmIO.observe(n));

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
