(() => {
  const S = window.STORY;
  const { herName, startDate } = S;
  const root = document.getElementById("story");
  const fill = (s) => (s || "").replaceAll("{name}", herName);
  // phones with "Reduce Motion" on get the opening without animation (add ?motion to the URL to force it on)
  document.documentElement.classList.toggle("reduce", matchMedia("(prefers-reduced-motion: reduce)").matches && !/motion/.test(location.search));

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
        scene: c.scene ?? null, // looping white animation at the bottom of the card (see scenes.js)
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
    // Opening: "Happy six months" is written out, then her name, then a bouquet of six roses
    // appears and its roses scatter across the screen, then the subtitle fades in.
    // The timing of each step lives in styles.css (search for "intro timeline").
    hero(s, sec) {
      sec.classList.add("hero");
      const ROSE = `<svg viewBox="-24 -24 48 48">
        <path d="M-5 12C-15 13-20 20-22 24C-12 24-6 19-4 12Z" fill="#3f7a3a"/><path d="M5 12C15 13 20 20 22 24C12 24 6 19 4 12Z" fill="#4e8c43"/>
        ${[0, 72, 144, 216, 288].map((a) => `<circle r="9" cx="${(8 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(8 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" fill="#ad1457"/>`).join("")}
        <circle r="11" cx="0.5" cy="-0.5" fill="#d81b60"/>
        <path d="M0 -9.5A9.5 9.5 0 1 1 -9 3" fill="none" stroke="#ff8fb1" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M1 -5.5A5.5 5.5 0 1 1 -4.8 2.4" fill="none" stroke="#ff8fb1" stroke-width="2" stroke-linecap="round"/>
        <circle r="2" cx="0.5" cy="-0.5" fill="#ffb3c8"/></svg>`;
      // six rose heads in the bouquet (x, y inside a 150 × 180 box), back to front
      const heads = [[75, 34], [46, 48], [104, 48], [75, 58], [56, 74], [94, 74]];
      const stems = heads.map(([x, y]) => `M${x} ${y}L75 124`).join("") + "M75 124L68 172M75 124L75 174M75 124L82 172";
      sec.innerHTML = `<div class="intro">
        <svg class="write intro__happy" aria-label="${esc(s.kicker)}"><text>${esc(s.kicker)}</text></svg>
        <svg class="write intro__name" aria-label="${esc(s.title)}"><text>${esc(s.title)}</text></svg>
        <div class="intro__stage">
          <div class="intro__bouquet">
            <svg class="bq-base" viewBox="0 0 150 180">
              <path d="${stems}" stroke="#3f7a3a" stroke-width="3" fill="none" stroke-linecap="round"/>
              <path d="M30 62C22 52 24 44 34 46M120 62C128 52 126 44 116 46" stroke="#4e8c43" stroke-width="6" fill="none" stroke-linecap="round"/>
              <path d="M26 66L38 58L50 66L62 58L75 66L88 58L100 66L112 58L124 66L86 156H64Z" fill="#ffd1df" stroke="#f06a9b" stroke-width="2" stroke-linejoin="round"/>
              <path d="M75 126C60 112 50 130 75 128C100 130 90 112 75 126ZM73 128L62 146M77 128L88 146" fill="rgba(142,63,214,.35)" stroke="#8e3fd6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="75" cy="127" r="3.5" fill="#8e3fd6"/>
            </svg>
            ${heads.map(([x, y]) => `<div class="intro__rose" style="left:${x}px;top:${y}px">${ROSE}</div>`).join("")}
          </div>
          <p class="intro__sub">${esc(s.subtitle)}</p>
          <div class="intro__arrow">↓</div>
        </div></div>`;

      const start = () => {
        // size each handwritten line to its text, so it fills the width
        sec.querySelectorAll("svg.write").forEach((svg) => {
          const t = svg.querySelector("text");
          const b = t.getBBox();
          const pad = b.height * (svg.classList.contains("intro__name") ? 0.02 : 0.08);
          svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
          svg.style.setProperty("--len", Math.ceil(b.width * 4));
        });
        // where each rose flies to: around the edges of the opening screen, away from the text
        const spots = [[0.14, 0.12], [0.5, 0.07], [0.86, 0.15], [0.16, 0.83], [0.5, 0.92], [0.84, 0.8]];
        const W = sec.clientWidth, H = sec.clientHeight;
        const off = (n) => { let x = 0, y = 0; for (; n && n !== sec; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; } return [x, y]; };
        [...sec.querySelectorAll(".intro__rose")].forEach((r, i) => {
          const [x, y] = off(r);
          const [sx, sy] = spots[i % spots.length];
          const tx = sx * W + (Math.random() - 0.5) * W * 0.08 - x, ty = sy * H + (Math.random() - 0.5) * H * 0.04 - y;
          r.style.setProperty("--tx", tx.toFixed(0) + "px");
          r.style.setProperty("--ty", ty.toFixed(0) + "px");
          r.style.setProperty("--rot", ((Math.random() - 0.5) * 120).toFixed(0) + "deg");
          r.style.setProperty("--s", (1.25 + Math.random() * 0.5).toFixed(2));
          r.style.setProperty("--d", (i * 0.08).toFixed(2) + "s");
        });
        requestAnimationFrame(() => sec.classList.add("go"));
      };
      // wait (briefly) for the handwriting fonts so the text is measured in the right font
      const fonts = ['700 100px "Dancing Script"', '100px "Sverige Script"', '100px "Great Vibes"'].map((f) => document.fonts?.load(f).catch(() => {}));
      Promise.race([Promise.all(fonts), new Promise((r) => setTimeout(r, 2500))]).then(() => requestAnimationFrame(start));
    },

    storycard(s, sec, idx) {
      const scene = s.scene && window.CARD_SCENES?.[s.scene];
      const audio = s.audio ? new Audio() : null;
      if (audio) { audio.preload = "none"; audio.src = s.audio; }

      // the card she taps
      const card = el("div", "flip");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML = `<div class="flip__inner">
        <div class="flip__face${scene ? " has-scene" : ""}">${s.date ? `<span class="date">${esc(s.date)}</span>` : ""}<h2>${esc(s.title)}</h2><span class="hint">Tap to open</span>${scene ? `<div class="cscene"></div>` : ""}</div>
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

      // pixel-art scene on the card front: only animates while the card is on screen and not flipped
      if (scene) window.mountCardScene(card.querySelector(".cscene"), s.scene, () => sec.classList.contains("vis") && !card.classList.contains("open"));

      sec.append(card);
    },

    counter(s, sec) {
      sec.classList.add("counter");
      const big = el("div", "counter__big");
      const small = el("div", "counter__small");
      const start = parseDate(startDate).getTime();
      const tick = () => {
        const ms = Date.now() - start;
        big.textContent = `${Math.floor(ms / 864e5)} dagen`;
        small.textContent = `${Math.floor(ms / 36e5) % 24}u ${Math.floor(ms / 6e4) % 60}m ${Math.floor(ms / 1e3) % 60}s`;
      };
      tick();
      setInterval(tick, 1000);
      sec.append(el("span", "kicker", esc(s.title)), big, small);
      if (s.subtitle) sec.append(el("span", "kicker", esc(s.subtitle))); // same style as the title line
    },

    letter(s, sec) {
      const L = window.LETTER || { paragraphs: [] };
      const audio = new Audio();
      audio.preload = "none";
      audio.src = s.audio || L.audio;
      const offset = s.syncOffset || 0;

      // the card she taps (same look as the story cards)
      const card = el("div", "flip flip--letter");
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.innerHTML = `<div class="flip__inner">
        <div class="flip__face"><span class="envelope-emoji">💌</span><h2>${esc(s.title)}</h2><span class="hint">${esc(s.prompt)}</span></div>
        <div class="flip__face flip__face--back"><span class="envelope-emoji">💗</span></div></div>`;

      // full-screen letter: every word is its own <span> so it can be highlighted
      const ov = el("div", "loverlay");
      const paper = el("div", "lpaper");
      paper.append(el("h2", "", esc(s.title)));
      const words = []; // { el, t }
      L.paragraphs.forEach((para) => {
        const p = el("p");
        para.forEach(([w, t], i) => {
          const span = el("span", "w", esc(w));
          span.dataset.i = words.length;
          words.push({ el: span, t });
          p.append(span, i < para.length - 1 ? " " : "");
        });
        paper.append(p);
      });
      if (s.signoff) paper.append(el("p", "sign", esc(s.signoff)));
      const play = el("button", "lplay");
      play.setAttribute("aria-label", "Play or pause");
      const closeBtn = el("button", "overlay__close", "✕");
      closeBtn.setAttribute("aria-label", "Close");
      ov.append(paper, play, closeBtn);
      document.body.append(ov);

      // which word is being spoken at time t (binary search on start times)
      const wordAt = (t) => {
        let lo = 0, hi = words.length - 1, ans = -1;
        while (lo <= hi) { const m = (lo + hi) >> 1; if (words[m].t <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
        return ans;
      };

      // auto-scroll: when the highlighted word gets near the bottom, bring it back up.
      // Paused for a few seconds whenever she scrolls the letter herself.
      let userUntil = 0;
      ["touchstart", "wheel", "pointerdown"].forEach((ev) => paper.addEventListener(ev, () => (userUntil = Date.now() + 3500), { passive: true }));
      const follow = (span) => {
        if (Date.now() < userUntil) return;
        const pr = paper.getBoundingClientRect(), r = span.getBoundingClientRect();
        const y = r.top - pr.top;
        if (y > pr.height * 0.62 || y < 0) paper.scrollTo({ top: paper.scrollTop + y - pr.height * 0.3, behavior: "smooth" });
      };

      let cur = -1, raf = 0;
      const highlight = () => {
        const i = audio.ended ? -1 : wordAt(audio.currentTime + offset);
        if (i !== cur) {
          if (cur >= 0) words[cur].el.classList.remove("now");
          cur = i;
          if (cur >= 0) { words[cur].el.classList.add("now"); follow(words[cur].el); }
        }
        play.style.setProperty("--p", audio.duration ? audio.currentTime / audio.duration : 0);
      };
      const loop = () => { highlight(); raf = requestAnimationFrame(loop); };
      const setIcon = () => (play.textContent = audio.paused ? "▶" : "❚❚");
      audio.addEventListener("play", () => { setIcon(); cancelAnimationFrame(raf); loop(); });
      audio.addEventListener("pause", () => { setIcon(); cancelAnimationFrame(raf); highlight(); });
      audio.addEventListener("ended", () => { setIcon(); highlight(); });
      setIcon();

      let showTimer;
      const api = {
        open() {
          if (active && active !== api) active.close();
          active = api;
          card.classList.add("open"); // 1) card flips
          if (audio.ended) audio.currentTime = 0; // reopening continues where she left off, unless it finished
          audio.play().catch(() => {});
          showTimer = setTimeout(() => { // 2) then the letter opens full-screen
            ov.classList.add("show");
            document.body.classList.add("locked");
            if (cur >= 0) follow(words[cur].el);
          }, 650);
        },
        close() {
          clearTimeout(showTimer);
          ov.classList.remove("show");
          document.body.classList.remove("locked");
          card.classList.remove("open");
          audio.pause();
          if (active === api) active = null;
        },
      };

      // tap a word to jump the voice-over to it
      paper.addEventListener("click", (e) => {
        const w = e.target.closest(".w");
        if (!w) return;
        audio.currentTime = Math.max(0, words[+w.dataset.i].t - offset);
        audio.play().catch(() => {});
        highlight();
      });
      card.addEventListener("click", () => api.open());
      card.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), api.open()));
      play.addEventListener("click", () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
      closeBtn.addEventListener("click", () => api.close());
      addEventListener("keydown", (e) => e.key === "Escape" && active === api && api.close());
      sec._warm = () => (audio.preload = "auto");

      sec.append(card);
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

  // card scenes only animate while their card is on screen
  const visIO = new IntersectionObserver((entries) => entries.forEach((e) => e.target.classList.toggle("vis", e.isIntersecting)));
  document.querySelectorAll(".scene").forEach((n) => visIO.observe(n));

  // start loading a card's voice-over and videos when it's about one screen away
  const warmIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && (e.target._warm(), warmIO.unobserve(e.target))),
    { rootMargin: "100% 0px" }
  );
  document.querySelectorAll(".scene").forEach((n) => n._warm && warmIO.observe(n));

  // ── Rose vine ────────────────────────────────────────────────────────────────
  // One long vine runs behind all story cards, swinging left/right in the gaps between them,
  // with leaves and roses along it. It "grows" down the page as she scrolls.
  const NS = "http://www.w3.org/2000/svg";
  const svgEl = (tag, attrs = {}) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };
  const ROSE = `
    <path d="M-4 9 C-14 10 -19 17 -22 21 C-12 22 -6 17 -4 9Z" fill="#3f7a3a"/>
    <path d="M4 9 C14 10 19 17 22 21 C12 22 6 17 4 9Z" fill="#4e8c43"/>
    ${[0, 72, 144, 216, 288].map((a) => `<circle r="7" cx="${(7 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(7 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" fill="#ad1457"/>`).join("")}
    <circle r="10" cx="0.5" cy="-0.5" fill="#d81b60"/>
    <path d="M0 -9 A9 9 0 1 1 -8.6 2.7" fill="none" stroke="#ff8fb1" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M1 -5 A5 5 0 1 1 -4.2 2" fill="none" stroke="#ff8fb1" stroke-width="2" stroke-linecap="round"/>
    <circle r="1.8" cx="0.5" cy="-0.5" fill="#ffb3c8"/>`;
  const LEAF = `<path d="M0 0 C6 -7 16 -8 24 0 C16 8 6 7 0 0Z" fill="#4e8c43"/><path d="M2 0 L20 0" stroke="#2f5e2b" stroke-width="1"/>`;

  let vine = null;
  const offsetIn = (node, anc) => { let y = 0; for (let n = node; n && n !== anc; n = n.offsetParent) y += n.offsetTop; return y; };
  const buildVine = () => {
    vine?.svg.remove();
    vine = null;
    const cards = [...root.querySelectorAll(".flip:not(.flip--letter)")];
    if (cards.length < 2) return;
    const W = root.clientWidth, cx = W / 2, A = Math.min(W * 0.38, 170);
    const boxes = cards.map((c) => { const t = offsetIn(c, root); return { t, b: t + c.offsetHeight }; });

    // path: curl in above the first card, straight down behind each card, S-curve through each gap
    const first = boxes[0], last = boxes[boxes.length - 1];
    let d = `M${cx - 70} ${first.t - 150} C${cx - 90} ${first.t - 60} ${cx} ${first.t - 80} ${cx} ${first.t + 40}`;
    boxes.forEach((bx, i) => {
      d += ` L${cx} ${bx.b - 40}`;
      const next = boxes[i + 1];
      if (next) {
        const s = i % 2 ? -1 : 1, gap = next.t - bx.b;
        d += ` C${cx + A * s} ${bx.b + gap * 0.3} ${cx - A * s} ${next.t - gap * 0.3} ${cx} ${next.t + 40}`;
      }
    });
    d += ` C${cx} ${last.b + 60} ${cx + 80} ${last.b + 70} ${cx + 70} ${last.b + 140}`;

    const H = root.scrollHeight;
    const svg = svgEl("svg", { class: "vine", width: W, height: H, viewBox: `0 0 ${W} ${H}`, "aria-hidden": "true" });
    const stem = svgEl("path", { d, class: "vine__stem" });
    const light = svgEl("path", { d, class: "vine__stem vine__stem--light" });
    svg.append(stem, light);
    root.prepend(svg);

    const L = stem.getTotalLength();
    const hidden = (y) => boxes.some((bx) => y > bx.t + 10 && y < bx.b - 10); // behind a card
    const buds = [];
    let side = 1, k = 0;
    for (let len = 30; len < L; len += 34, k++) {
      const p = stem.getPointAtLength(len);
      if (hidden(p.y)) continue;
      const q = stem.getPointAtLength(Math.min(L, len + 1));
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
      const g = svgEl("g", { transform: `translate(${p.x} ${p.y})` });
      const bud = svgEl("g", { class: "bud" });
      if (k % 5 === 2) {
        // a rose every few steps, nudged to one side of the stem
        const sc = 0.9 + ((k * 37) % 10) / 20;
        bud.innerHTML = `<g transform="translate(${side * 12} 0) rotate(${(k * 53) % 360}) scale(${sc})">${ROSE}</g>`;
      } else {
        bud.innerHTML = `<g transform="rotate(${ang + side * 55})">${LEAF}</g>`;
      }
      side = -side;
      g.append(bud);
      svg.append(g);
      buds.push({ len, el: bud });
    }
    stem.style.strokeDasharray = light.style.strokeDasharray = L;
    // y → length lookup (the path only ever moves downwards)
    const samples = [];
    for (let len = 0; len <= L; len += 10) samples.push([len, stem.getPointAtLength(len).y]);
    vine = { svg, stem, light, L, buds, samples };
    growVine();
  };
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const growVine = () => {
    if (!vine) return;
    const front = scrollY + innerHeight * 0.8 - (root.getBoundingClientRect().top + scrollY);
    let grown = vine.L;
    if (!reduceMotion) {
      const hit = vine.samples.find(([, y]) => y > front);
      grown = hit ? hit[0] : vine.L;
    }
    vine.stem.style.strokeDashoffset = vine.light.style.strokeDashoffset = vine.L - grown;
    vine.buds.forEach((b) => b.el.classList.toggle("on", b.len <= grown));
  };
  let vineTimer;
  const rebuildVine = () => { clearTimeout(vineTimer); vineTimer = setTimeout(buildVine, 150); };
  addEventListener("resize", rebuildVine);
  addEventListener("load", rebuildVine);
  buildVine();

  const bar = document.getElementById("progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    growVine();
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
