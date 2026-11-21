(() => {
  const { scenes, herName, startDate } = window.STORY;
  const root = document.getElementById("story");
  const fill = (s) => (s || "").replaceAll("{name}", herName);

  // tiny element helper
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const esc = (s) => fill(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  const builders = {
    hero(s, sec) {
      sec.classList.add("hero");
      sec.append(el("span", "kicker", esc(s.kicker)), el("h1", "", esc(s.title)), el("p", "", esc(s.subtitle)));
    },

    moment(s, sec) {
      const photo = el("div", "photo", s.image ? "" : s.emoji || "");
      if (s.image) photo.style.backgroundImage = `url("${s.image}")`;
      sec.append(photo, el("span", "date", esc(s.date)), el("h2", "", esc(s.title)), el("p", "", esc(s.text)));
    },

    flip(s, sec) {
      const b = el("button", "flip");
      b.innerHTML = `<div class="flip__inner">
        <div class="flip__face"><h2>${esc(s.front)}</h2><span class="hint">${esc(s.prompt)}</span></div>
        <div class="flip__face flip__face--back"><p>${esc(s.back)}</p></div></div>`;
      b.addEventListener("click", () => b.classList.toggle("open"));
      sec.append(b);
    },

    months(s, sec) {
      const grid = el("div", "months");
      const text = el("p", "month-text", esc(s.note));
      s.months.forEach((m) => {
        const b = el("button", "month", esc(m.label));
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => {
          grid.querySelectorAll(".month").forEach((x) => x.setAttribute("aria-pressed", "false"));
          b.setAttribute("aria-pressed", "true");
          text.textContent = fill(m.text);
        });
        grid.append(b);
      });
      sec.append(el("h2", "", esc(s.title)), grid, text);
    },

    counter(s, sec) {
      sec.classList.add("counter");
      const big = el("div", "counter__big");
      const small = el("div", "counter__small");
      const tick = () => {
        const ms = Date.now() - new Date(startDate + "T00:00:00").getTime();
        const days = Math.floor(ms / 864e5);
        big.textContent = `${days} days`;
        const h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, sec_ = Math.floor(ms / 1e3) % 60;
        small.textContent = `${h}h ${m}m ${sec_}s — and counting`;
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

  scenes.forEach((s) => {
    const sec = el("section", "scene");
    builders[s.type]?.(s, sec);
    root.append(sec);
  });

  // reveal scenes as they scroll into view
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.25 }
  );
  document.querySelectorAll(".scene").forEach((n) => io.observe(n));

  // scroll progress bar
  const bar = document.getElementById("progress");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // hearts wherever you tap
  addEventListener("pointerdown", (e) => {
    const h = el("div", "heart", "❤");
    h.style.left = e.clientX - 14 + "px";
    h.style.top = e.clientY - 14 + "px";
    document.body.append(h);
    setTimeout(() => h.remove(), 1400);
  });
})();
