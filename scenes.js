// Pixel-art scenes shown at the bottom of each story card (before it's flipped).
// Pick one per card in story.js with   scene: "texting"   — the names are the keys of SCENES below.
//
// Each scene is drawn on a tiny 110 × 62 pixel grid at 10 frames per second and scaled up crisply.
// A scene is { dur: seconds per loop, draw(px, t) } where t is the time inside the loop.
(() => {
  const W = 110, H = 62, GROUND = 57, FPS = 10;

  // ── palette (one character per colour in the sprites; "." = transparent) ──────────
  const PAL = {
    W: "#ffffff", w: "#ffe4ee", s: "#ffc4da", m: "#ff6f9f", r: "#e3245f", R: "#a3134a",
    k: "#3d0c2a", h: "#6b2147", H: "#8f3a68",
    l: "#d6f1ff", L: "#a6d8f2", b: "#8fd3ff", B: "#3f9ee0", d: "#e8fbff",
    p: "#ecd2ff", P: "#c79bf0", g: "#6cc06c", G: "#3f8f4a", y: "#ffd25e", Y: "#e0a526",
    c: "#a8693f", C: "#6e4428", n: "#2e2233", f: "#ff9a73", o: "#ffb347",
  };
  const OUTLINE = [120, 20, 70, 215];
  const RGB = Object.fromEntries(Object.entries(PAL).map(([k, v]) => [k, [1, 3, 5].map((i) => parseInt(v.slice(i, i + 2), 16))]));

  // ── tiny 3×5 font for signs ─────────────────────────────────────────────────────
  const FONT = {
    A: [".#.", "#.#", "###", "#.#", "#.#"], B: ["##.", "#.#", "##.", "#.#", "##."], C: [".##", "#..", "#..", "#..", ".##"],
    E: ["###", "#..", "##.", "#..", "###"], F: ["###", "#..", "##.", "#..", "#.."], H: ["#.#", "#.#", "###", "#.#", "#.#"],
    I: ["###", ".#.", ".#.", ".#.", "###"], K: ["#.#", "#.#", "##.", "#.#", "#.#"], O: [".#.", "#.#", "#.#", "#.#", ".#."],
    R: ["##.", "#.#", "##.", "#.#", "#.#"], T: ["###", ".#.", ".#.", ".#.", ".#."], Y: ["#.#", "#.#", ".#.", ".#.", ".#."],
    Z: ["###", "..#", ".#.", "#..", "###"],
  };

  // ── pixel buffer with drawing helpers ───────────────────────────────────────────
  class Px {
    constructor() { this.a = new Uint8ClampedArray(W * H * 4); }
    clear() { this.a.fill(0); }
    dot(x, y, c) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= W || y >= H || !RGB[c]) return;
      const i = (y * W + x) * 4, v = RGB[c];
      this.a[i] = v[0]; this.a[i + 1] = v[1]; this.a[i + 2] = v[2]; this.a[i + 3] = 255;
    }
    rect(x, y, w, h, c) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.dot(x + i, y + j, c); }
    line(x0, y0, x1, y1, c, thick = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let e = dx + dy;
      for (;;) {
        this.dot(x0, y0, c);
        if (thick > 1) this.dot(x0 + 1, y0, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * e;
        if (e2 >= dy) { e += dy; x0 += sx; }
        if (e2 <= dx) { e += dx; y0 += sy; }
      }
    }
    // sprite: array of strings; flip mirrors it horizontally; map can swap colours
    spr(rows, x, y, flip = false, map) {
      const w = Math.max(...rows.map((r) => r.length));
      rows.forEach((row, j) => {
        for (let i = 0; i < row.length; i++) {
          let c = row[i];
          if (c === "." || c === " ") continue;
          if (map && map[c]) c = map[c];
          this.dot(x + (flip ? w - 1 - i : i), y + j, c);
        }
      });
    }
    text(str, x, y, c) {
      for (const ch of str) {
        if (ch === " ") { x += 2; continue; }
        const g = FONT[ch];
        if (g) g.forEach((row, j) => [...row].forEach((v, i) => v === "#" && this.dot(x + i, y + j, c)));
        x += 4;
      }
    }
    // 1px dark outline around everything drawn so far (classic pixel-art look)
    outline() {
      const a = this.a, src = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) src[i] = a[i * 4 + 3] > 0 ? 1 : 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (src[i]) continue;
        if ((x > 0 && src[i - 1]) || (x < W - 1 && src[i + 1]) || (y > 0 && src[i - W]) || (y < H - 1 && src[i + W])) {
          a.set(OUTLINE, i * 4);
        }
      }
    }
  }

  // ── timing helpers ─────────────────────────────────────────────────────────────
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const prog = (t, a, b) => clamp((t - a) / (b - a)); // 0→1 between seconds a and b
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k * k * (3 - 2 * k);
  const mix = (p0, p1, k) => [Math.round(lerp(p0[0], p1[0], ease(k))), Math.round(lerp(p0[1], p1[1], ease(k)))];
  const blink = (t, period) => Math.floor(t / period) % 2 === 0;

  // ── sprites ────────────────────────────────────────────────────────────────────
  // side-view heads, facing right ("neck" column noted for placement)
  const GUY_HEAD = [ // 7×8, neck col 3
    "..hhhh.",
    ".hhhhhh",
    "hhhhWWW",
    "hhWWWkW",
    "hHWWWWW",
    ".WWWWmW",
    "..WWWW.",
    "...WW..",
  ];
  const GIRL_HEAD = [ // 8×11, neck col 5
    "..hhhhh.",
    ".hhhhhhh",
    "hhhhhWWW",
    "hhhhWWkW",
    "hhhHWWWW",
    "hhhWWWmW",
    "hhhhWWW.",
    "hhhh.WW.",
    "hhhh....",
    ".hhh....",
    "..hh....",
  ];
  const HEART = ["rr.rr", "rWrrr", "rrrrr", ".rrr.", "..r.."];
  const HEART_S = ["r.r", "rrr", ".r."];
  const BOTTLE = [".BB.", ".ll.", "bbbb", "bdbb", "WWWW", "bWWb", "bdbb", "bbbb", "bbbb", ".bb."]; // 4×10 water bottle
  const PHONE = ["kkk", "kbk", "kbk", "kbk", "kkk"];
  const PHONE_ON = ["kkk", "kdk", "kWk", "kdk", "kkk"];
  const BOUQUET = [ // 7×10, held at col 3 row 7
    ".Rr.rR.",
    "rrRrRrr",
    "gRrrrRg",
    ".grRrg.",
    "gwWWWwg",
    ".wWWWw.",
    ".wWmWw.",
    "..wWw..",
    "..wWw..",
    "...w...",
  ];
  const GYMBAG = ["..k...k..", "..k...k..", "BBBBBBBBB", "BbWWWWWbB", "BBBBBBBBB", "BBBkkkBBB"];

  // ── people ─────────────────────────────────────────────────────────────────────
  // o: { x, dir (1 right / -1 left), girl, sit (hip row) , legs: "stand"|"walk"|"walk2",
  //      armF/armB: [forward, down] hand offset from the shoulder, blush, behind(px, hand) }
  function person(px, o) {
    const dir = o.dir || 1, cx = o.x, girl = !!o.girl, y0 = o.y ?? GROUND;
    const hy = o.sit ?? y0 - 8; // hip row
    const X = (dx) => cx + dir * dx;
    const sF = [X(1), hy - 8], sB = [X(-1), hy - 8];
    const aF = o.armF || [1, 7], aB = o.armB || [-1, 7];
    const hF = [sF[0] + dir * aF[0], sF[1] + aF[1]], hB = [sB[0] + dir * aB[0], sB[1] + aB[1]];
    if (!o.sit && !o.noShadow) px.rect(cx - 5, y0 + 1, 11, 1, "s");
    // back arm (and anything held behind)
    px.line(sB[0], sB[1], hB[0], hB[1], "W");
    if (o.behind) o.behind(hB);
    // legs
    const legC = girl ? "W" : "h", shoe = girl ? "m" : "k";
    if (o.sit != null) {
      px.rect(Math.min(X(-2), X(6)), hy + 1, 9, 2, girl ? "p" : "h");
      px.rect(Math.min(X(5), X(6)), hy + 3, 2, y0 - hy - 3, girl ? "W" : "h");
      px.rect(Math.min(X(5), X(7)), y0, 3, 1, shoe);
    } else if (o.legs === "walk" || o.legs === "walk2") {
      const s = o.legs === "walk" ? 3 : -3;
      px.line(X(-1), hy + 1, X(-s), y0 - 1, legC, girl ? 1 : 2);
      px.line(X(1), hy + 1, X(s), y0 - 1, legC, girl ? 1 : 2);
      px.rect(Math.min(X(-s), X(-s + 1)), y0, 2, 1, shoe);
      px.rect(Math.min(X(s), X(s + 1)), y0, 2, 1, shoe);
    } else if (girl) {
      px.rect(X(-1), hy + 2, 1, y0 - hy - 2, "W"); px.rect(X(1), hy + 2, 1, y0 - hy - 2, "W");
      px.rect(Math.min(X(-2), X(-1)), y0, 2, 1, shoe); px.rect(Math.min(X(1), X(2)), y0, 2, 1, shoe);
    } else {
      px.rect(Math.min(X(-2), X(-1)), hy + 1, 2, y0 - hy - 1, "h"); px.rect(Math.min(X(1), X(2)), hy + 1, 2, y0 - hy - 1, "h");
      px.rect(Math.min(X(-2), X(-1)), y0, 2, 1, shoe); px.rect(Math.min(X(1), X(3)), y0, 3, 1, shoe);
    }
    // torso
    if (girl) {
      const rows = o.sit != null ? 10 : 11;
      for (let r = 0; r < rows; r++) {
        const half = r < 4 ? 2 : r < 7 ? 3 : 4;
        for (let i = -half; i <= half; i++) px.dot(X(i), hy - 9 + r, i === -half || r === rows - 1 ? "P" : "p");
      }
      for (let i = -3; i <= 3; i++) px.dot(X(i), hy - 4, "m"); // ribbon belt
    } else {
      for (let r = 0; r < 9; r++) for (let i = -2; i <= 2; i++) px.dot(X(i), hy - 9 + r, i === -2 ? "L" : "l");
      px.dot(X(1), hy - 9, "W"); px.dot(X(2), hy - 9, "W"); // collar
      for (let i = -2; i <= 2; i++) px.dot(X(i), hy, "k"); // belt
    }
    // head
    const top = hy - 17;
    if (girl) px.spr(GIRL_HEAD, dir === 1 ? cx - 5 : cx - 2, top, dir === -1);
    else px.spr(GUY_HEAD, cx - 3, top, dir === -1);
    if (o.blush) { px.dot(X(1), hy - 12, "m"); px.dot(X(2), hy - 12, "m"); }
    // front arm
    px.line(sF[0], sF[1], hF[0], hF[1], "W");
    return { hF, hB, mouth: [X(3), hy - 12], top: [cx, top] };
  }

  const ground = (px, x0 = 0, x1 = W) => {
    px.rect(x0, GROUND + 2, x1 - x0, 3, "w");
    for (let x = x0 + 2; x < x1; x += 7) px.dot(x, GROUND + 3, "s");
  };
  const floatHeart = (px, x, y, t, a, b, small) => {
    if (t < a || t > b) return;
    const k = prog(t, a, b);
    if (k > 0.85 && blink(t, 0.1)) return;
    px.spr(small ? HEART_S : HEART, x, Math.round(y - k * 6));
  };

  // ── the scenes ─────────────────────────────────────────────────────────────────
  // Card 1 — texting: she's in bed, he's at his desk; the line between their phones draws a heart
  const LINK = (() => {
    const segs = [
      [[23, 34], [26, 48], [38, 56], [47, 55]], [[47, 55], [52, 52], [57, 47], [56, 43]],
      [[56, 43], [55, 39], [49, 38], [47, 43]], [[47, 43], [45, 38], [39, 39], [38, 43]],
      [[38, 43], [37, 47], [42, 52], [47, 55]], [[47, 55], [56, 56], [69, 48], [73, 34]],
    ];
    const pts = [];
    for (const [a, b, c, d] of segs) for (let i = 0; i <= 40; i++) {
      const u = i / 40, v = 1 - u;
      const p = [0, 1].map((k) => Math.round(v * v * v * a[k] + 3 * v * v * u * b[k] + 3 * v * u * u * c[k] + u * u * u * d[k]));
      const q = pts[pts.length - 1];
      if (!q || q[0] !== p[0] || q[1] !== p[1]) pts.push(p);
    }
    return pts;
  })();
  const texting = {
    dur: 6,
    draw(px, t) {
      ground(px);
      // bed
      px.rect(2, 32, 3, 26, "W"); px.rect(2, 32, 3, 1, "w"); px.rect(3, 34, 1, 22, "w");
      px.rect(5, 44, 37, 5, "W"); px.rect(5, 48, 37, 1, "w"); px.rect(39, 49, 2, 9, "w");
      px.rect(5, 38, 8, 6, "w"); px.rect(6, 39, 6, 4, "W");
      // her, sitting up against the pillow
      const phoneUp = [5, -3];
      const g = person(px, { x: 13, dir: 1, girl: true, sit: 44, armF: phoneUp, armB: [2, 6] });
      // blanket over her legs (with little hearts)
      px.rect(16, 41, 24, 4, "p"); px.rect(16, 44, 24, 1, "P");
      for (let x = 19; x < 39; x += 6) px.spr(HEART_S, x, 41, false, { r: "m" });
      const glow = blink(t, 0.4);
      px.spr(glow ? PHONE_ON : PHONE, g.hF[0], g.hF[1] - 4);
      // desk, laptop, mug, lamp
      px.rect(90, 38, 19, 2, "W"); px.rect(91, 40, 1, 18, "w"); px.rect(106, 40, 1, 18, "w");
      px.rect(95, 31, 8, 7, "L"); px.rect(96, 32, 6, 5, "l"); px.rect(94, 37, 10, 1, "W");
      px.rect(104, 34, 3, 4, "W"); px.dot(107, 35, "W");
      px.line(100, 30, 97, 20, "k"); px.rect(95, 18, 5, 2, "y"); px.dot(97, 17, "Y");
      // desk chair
      px.rect(77, 46, 11, 2, "B"); px.rect(86, 34, 3, 12, "B"); px.rect(87, 35, 1, 10, "b"); px.rect(82, 48, 1, 6, "k");
      px.line(77, 55, 87, 55, "k"); px.dot(77, 57, "k"); px.dot(87, 57, "k"); px.dot(82, 57, "k");
      // him, sitting facing left
      const b = person(px, { x: 83, dir: -1, sit: 45, armF: [5, -3], armB: [3, 5] });
      px.spr(!glow ? PHONE_ON : PHONE, b.hF[0] - 2, b.hF[1] - 4);
      // typing bubbles
      const bub = (x, y) => { px.rect(x, y, 9, 5, "W"); px.dot(x + 1, y + 5, "W"); for (let i = 0; i < 3; i++) if (Math.floor(t * 3) % 3 >= i) px.dot(x + 2 + i * 2, y + 2, "k"); };
      if (t < 2.2) (Math.floor(t / 1.1) % 2 ? bub(64, 14) : bub(19, 14));
      // the line between the phones that turns into a heart
      const n = Math.floor(prog(t, 0.3, 2.8) * LINK.length);
      if (t < 5.4) for (let i = 0; i < n; i++) px.dot(LINK[i][0], LINK[i][1], "W");
      if (t > 2.9 && t < 5.4) {
        px.spr(["rr.rr", "rWrrr", "rrrrr", ".rrr.", "..r.."], 45, 45);
        if (blink(t, 0.3)) { px.dot(43, 41, "y"); px.dot(51, 41, "y"); px.dot(47, 39, "y"); }
      }
    },
  };

  // Card 2 — gym: he walks up to her outside Fit Factory and takes her water bottle
  const gym = {
    dur: 8,
    draw(px, t) {
      ground(px);
      // timeline
      const walkEnd = 3.0, reach = [3.3, 3.8], swap = 4.4, back = [4.6, 5.0], turn = 5.2, go = [5.4, 7.4];
      const step = (on) => (on ? (Math.floor(t / 0.2) % 2 ? "walk" : "walk2") : "stand");
      // Fit Factory building — the door opens as they walk up
      px.rect(64, 14, 45, 44, "W"); px.rect(62, 12, 48, 3, "w");
      for (let y = 37; y < 57; y += 3) for (let x = 66 + ((y / 3) % 2) * 3; x < 107; x += 6) px.rect(x, y, 3, 1, "w");
      px.rect(66, 17, 41, 16, "h"); px.rect(67, 18, 39, 14, "H");
      px.text("FIT", 81, 19, "W"); px.text("FACTORY", 73, 26, "W");
      px.rect(67, 36, 11, 9, "w"); px.rect(68, 37, 9, 7, "l"); px.rect(70, 40, 5, 1, "k"); px.rect(69, 39, 1, 3, "k"); px.rect(75, 39, 1, 3, "k");
      px.rect(97, 36, 10, 9, "w"); px.rect(98, 37, 8, 7, "l"); px.line(99, 43, 104, 38, "W");
      const doorOpen = t > 6.2 && t < 7.9;
      px.rect(83, 38, 11, 20, "w");
      if (doorOpen) { px.rect(84, 39, 9, 18, "h"); px.rect(85, 40, 7, 4, "H"); px.rect(84, 39, 2, 18, "W"); }
      else { px.rect(84, 39, 9, 8, "l"); px.rect(84, 48, 9, 9, "W"); px.dot(91, 51, "k"); px.dot(91, 52, "k"); }
      px.rect(81, 57, 15, 1, "s");
      // positions: he walks up to her, then they walk into the gym together and disappear through the door
      const together = prog(t, go[0], go[1]);
      const gx = Math.round(lerp(48, 90, together));
      const bx = t < go[0] ? Math.round(lerp(4, 33, prog(t, 0.2, walkEnd))) : Math.round(lerp(33, 89, prog(t, go[0] + 0.2, go[1] + 0.3)));
      const herWalk = t > go[0] && t < go[1], hisWalk = (t > 0.2 && t < walkEnd) || (t > go[0] + 0.2 && t < go[1] + 0.3);
      const gDir = t >= turn ? 1 : -1;
      // him: reaches straight out for the bottle, then just carries it
      let arm = [1, 7];
      if (t > reach[0] && t < back[0]) arm = mix([1, 7], [6, 0], prog(t, reach[0], reach[1]));
      else if (t >= back[0]) arm = mix([6, 0], [2, 5], prog(t, back[0], back[1]));
      if (bx < 86) {
        const b = person(px, { x: bx, dir: 1, legs: step(hisWalk), armF: arm, armB: hisWalk ? [Math.floor(t / 0.2) % 2 ? 2 : -2, 7] : [-1, 7] });
        if (t >= swap) px.spr(BOTTLE, b.hF[0] - 1, b.hF[1] - 6);
      }
      // her: gym bag on her shoulder, hands him the bottle, turns and leads the way in
      const herArm = t < reach[0] ? [1, 7] : t < back[0] ? mix([1, 7], [6, 0], prog(t, reach[0] + 0.1, reach[1] + 0.1)) : mix([6, 0], [1, 7], prog(t, back[0], back[1]));
      if (gx < 86) {
        const g = person(px, { x: gx, dir: gDir, girl: true, legs: step(herWalk), armF: herArm, armB: [1, 6],
          behind: () => { const bagX = gDir === 1 ? gx - 11 : gx + 2; px.line(gx, 41, gDir === 1 ? gx - 5 : gx + 5, 46, "k"); px.spr(GYMBAG, bagX, 44); } });
        if (t < swap) px.spr(BOTTLE, g.hF[0] - 2, g.hF[1] - 6);
      }
      floatHeart(px, 40, 22, t, 4.6, 6.0);
    },
  };

  // Card 3 — date at ZIKIRI beach bar: sushi and a coconut
  const date = {
    dur: 6,
    draw(px, t) {
      ground(px);
      px.line(0, 60, 110, 60, "l"); // the sea's edge
      // sign + palm
      const sway = blink(t, 0.6) ? 0 : 1;
      px.rect(18, 6, 2, 52, "c"); px.rect(18, 6, 1, 52, "C");
      for (let y = 9; y < 56; y += 4) px.dot(19, y, "C");
      [[-13, 5], [13, 5], [-9, 9], [9, 9], [-4, 10], [4, 10]].forEach(([dx, dy]) => {
        const s = dx < 0 ? -1 : 1, ex = 19 + dx + (sway ? s : 0), ey = 5 + dy;
        px.line(19, 5, ex, ey, "G", 2); px.line(19, 4, ex, ey - 1, "g");
      });
      px.rect(17, 5, 4, 3, "c"); px.dot(16, 7, "C"); px.dot(21, 7, "C");
      px.rect(1, 16, 37, 13, "W"); px.rect(1, 16, 37, 1, "s"); px.rect(1, 28, 37, 1, "s");
      px.text("ZIKIRI", 8, 18, "k"); px.text("BEACH BAR", 3, 23, "R");
      // her chair + her
      px.rect(40, 33, 2, 25, "c"); px.rect(40, 46, 9, 2, "c"); px.rect(47, 48, 1, 10, "C");
      const lift = prog(t, 1.0, 1.6) - prog(t, 2.6, 3.2);
      const handArm = mix([7, 2], [4, -4], lift);
      const g = person(px, { x: 45, dir: 1, girl: true, sit: 45, armF: handArm, armB: [2, 6], blush: t > 3.2 });
      // table with sushi and a coconut
      px.rect(56, 42, 22, 2, "W"); px.rect(56, 44, 22, 3, "s"); for (let x = 57; x < 78; x += 3) px.dot(x, 47, "s");
      px.rect(66, 47, 2, 10, "w"); px.rect(62, 57, 10, 1, "w");
      px.rect(57, 40, 11, 2, "w");
      if (lift < 0.5) px.spr(["nWWn", "nffn", "nnnn"], 58, 37);
      px.spr(["nWWn", "nffn", "nnnn"], 63, 37);
      px.spr(["..oo..", ".cccc.", "cCcccc", "ccccCc", "cccccc", ".cccc."], 70, 36); px.rect(71, 36, 4, 1, "W");
      px.line(73, 36, 76, 29, "m"); px.spr(["..r..", ".rrr.", "rrrrr"], 74, 27);
      // chopsticks (with a piece of sushi while lifting)
      const [hx, hy] = g.hF;
      px.line(hx, hy, hx + 5, hy - 2, "C"); px.line(hx, hy + 1, hx + 5, hy, "C");
      if (lift > 0.5) { px.dot(hx + 5, hy - 1, "f"); px.dot(hx + 6, hy - 1, "W"); }
      // his chair + him
      px.rect(93, 33, 2, 25, "c"); px.rect(85, 46, 9, 2, "c"); px.rect(86, 48, 1, 10, "C");
      person(px, { x: 89, dir: -1, sit: 45, armF: [7, 1], armB: [2, 6] });
      floatHeart(px, 64, 20, t, 3.2, 5.2);
      floatHeart(px, 58, 26, t, 3.5, 5.2, true);
    },
  };

  // Card 4 — road trip, seen from above: she's lying in the reclined seat under a blanket,
  // head on a neck pillow, legs stretched over onto his lap under the steering wheel
  const roadtrip = {
    dur: 3,
    draw(px, t) {
      // road
      const off = Math.floor(t * 40) % 16;
      for (let x = -16; x < W + 16; x += 16) { px.rect(x - off, 3, 9, 1, "w"); px.rect(x - off, 58, 9, 1, "w"); }
      for (let i = 0; i < 3; i++) { const x = 8 - ((Math.floor(t * 30) + i * 7) % 20); px.rect(x, 20 + i * 10, 6, 1, "w"); }
      const bob = blink(t, 0.3) ? 0 : 1;
      const Y = (v) => v + bob;
      // car body (front is on the right)
      px.rect(8, Y(9), 92, 44, "W"); px.rect(6, Y(12), 2, 38, "W"); px.rect(100, Y(11), 3, 40, "W"); px.rect(103, Y(14), 2, 34, "W");
      px.rect(14, Y(7), 11, 2, "k"); px.rect(78, Y(7), 11, 2, "k"); px.rect(14, Y(53), 11, 2, "k"); px.rect(78, Y(53), 11, 2, "k");
      px.rect(103, Y(15), 2, 5, "y"); px.rect(103, Y(42), 2, 5, "y"); px.rect(6, Y(13), 2, 4, "r"); px.rect(6, Y(45), 2, 4, "r");
      px.rect(80, Y(6), 3, 3, "W"); px.rect(80, Y(53), 3, 3, "W");
      // windscreen, open cabin, dashboard, back seat
      px.rect(84, Y(12), 6, 38, "l"); px.line(85, Y(13), 89, Y(18), "W"); px.line(85, Y(40), 88, Y(44), "W");
      px.rect(11, Y(12), 73, 38, "s");
      px.rect(76, Y(12), 8, 38, "h"); px.rect(78, Y(28), 4, 6, "b");
      px.rect(12, Y(13), 8, 36, "w"); px.line(13, Y(31), 19, Y(31), "s");
      // driver seat (top) and the passenger seat reclined flat (bottom)
      px.rect(50, Y(13), 15, 16, "w");
      px.rect(21, Y(32), 46, 17, "w"); px.rect(21, Y(34), 4, 13, "W");
      // him, seen from above: shoulders, head, arms on the wheel, legs under it
      px.rect(61, Y(18), 16, 2, "h"); px.rect(61, Y(22), 16, 2, "h");
      px.rect(54, Y(14), 4, 14, "l"); px.rect(54, Y(14), 1, 14, "L");
      px.spr([".hhhh.", "hhhhhh", "hHhhhh", "hhhhhh", "hhhhhh", ".hhhh."], 55, Y(17));
      px.line(57, Y(15), 72, Y(16), "W"); px.line(57, Y(26), 72, Y(25), "W");
      px.rect(73, Y(13), 2, 15, "k"); px.dot(72, Y(13), "k"); px.dot(72, Y(27), "k");
      // her, lying on her back: hair spread on the headrest, neck pillow, blanket, eyes closed
      px.spr(["..hhhhhh..", ".hhhhhhhh.", "hhhWWWWhhh", "hhWWWWWWhh", "hhWkkWWWhh", "hhWWWWWWhh", "hhWkkWWWhh", "hhWWWmWWhh", "hhhWWWWhhh", ".hhhhhhhh.", "..hhhhhh.."], 22, Y(35), false);
      px.spr(["mmmm", "m...", "m...", "m...", "m...", "m...", "m...", "mmmm"], 31, Y(36)); // neck pillow
      px.rect(34, Y(33), 29, 15, "p"); px.rect(34, Y(33), 29, 2, "P");
      for (let x = 37; x < 62; x += 6) for (let y = 37; y < 47; y += 4) px.spr(HEART_S, x + ((y / 4) % 2) * 3, Y(y), false, { r: "P" });
      // her legs over the console onto his lap, pink socks on his knees
      px.line(62, Y(36), 64, Y(23), "W", 2); px.line(62, Y(42), 68, Y(25), "W", 2);
      px.rect(63, Y(19), 3, 3, "m"); px.rect(67, Y(21), 3, 3, "m");
      // z z z
      for (let i = 0; i < 3; i++) {
        const k = ((t / 3) + i / 3) % 1, x = 30 + Math.round(k * 6), y = Y(33) - Math.round(k * 26);
        px.spr(["kkk", "..k", ".k.", "k..", "kkk"], x, y, false, { k: "W" });
      }
    },
  };

  // Card 5 — bouquet: he brings it out from behind his back, she melts and takes it
  const bouquet = {
    dur: 7,
    draw(px, t) {
      ground(px);
      // little park: lamp post, flowers, a bench
      px.rect(100, 16, 2, 42, "h"); px.rect(97, 13, 8, 4, "h"); px.rect(98, 17, 6, 2, "y"); if (blink(t, 0.5)) px.dot(101, 20, "y");
      for (let x = 4; x < 100; x += 9) { px.dot(x, 56, "G"); px.dot(x, 55, (x / 9) % 2 ? "m" : "y"); }
      px.rect(3, 47, 14, 2, "c"); px.rect(3, 43, 14, 2, "c"); px.rect(4, 49, 1, 8, "C"); px.rect(15, 49, 1, 8, "C");
      const show = [1.2, 1.8], cheek = [2.0, 3.4], reach = [3.5, 3.9], swap = 4.1;
      // him
      let arm = [-3, 4];
      if (t >= show[0] && t < swap + 0.2) arm = mix([-3, 4], [7, 0], prog(t, show[0], show[1]));
      if (t >= swap + 0.2) arm = mix([7, 0], [1, 7], prog(t, swap + 0.2, swap + 0.7));
      const hidden = t < show[0];
      const b = person(px, { x: 38, dir: 1, armF: hidden ? [1, 7] : arm, armB: hidden ? [-3, 4] : [-1, 7],
        behind: (h) => hidden && px.spr(BOUQUET, h[0] - 3, h[1] - 7) });
      if (!hidden && t < swap) px.spr(BOUQUET, b.hF[0] - 3, b.hF[1] - 7);
      // her
      let hArm = [1, 7], bArm = [1, 6];
      if (t >= cheek[0] && t < reach[0]) { hArm = mix([1, 7], [2, -4], prog(t, cheek[0], cheek[0] + 0.4)); bArm = mix([1, 6], [-1, -4], prog(t, cheek[0], cheek[0] + 0.4)); }
      if (t >= reach[0] && t < swap + 0.2) hArm = mix([2, -4], [7, 0], prog(t, reach[0], reach[1]));
      if (t >= swap + 0.2) hArm = mix([7, 0], [3, -3], prog(t, swap + 0.2, swap + 0.7));
      const g = person(px, { x: 58, dir: -1, girl: true, armF: hArm, armB: bArm, blush: t > cheek[0] });
      if (t >= swap) px.spr(BOUQUET, g.hF[0] - 3, g.hF[1] - 7, true);
      floatHeart(px, 48, 20, t, 4.4, 6.4);
      floatHeart(px, 56, 14, t, 4.8, 6.6, true);
      floatHeart(px, 42, 16, t, 5.1, 6.7, true);
    },
  };

  // Card 7 — close-up in the car: he opens a ring box (gold ring, sparkling diamond), she's speechless
  const GUY_BIG = [
    "....hhhhhhhh....",
    "..hhhhhhhhhhhh..",
    ".hhhhhhhhhhhhhh.",
    ".hhhhhHHhhhhhhh.",
    ".hhWWhhhhhWWhhh.",
    ".hWWWWWWWWWWWWh.",
    "WWWWWWWWWWWWWWWW",
    "WWWWkkWWWWWWkkWW",
    "WWWWkkWWWWWWkkWW",
    ".WWWWWWWWWWWWWW.",
    ".WWqqWWWWWWWqqW.",
    ".WWWWWWWWWWWWWW.",
    "..WWWWkkkkWWWW..",
    "...WWWWWWWWWW...",
    ".....WWWWWW.....",
    "......WWWW......",
    "......WWWW......",
  ];
  const GIRL_BIG = [
    ".....hhhhhhhh.....",
    "...hhhhhhhhhhhh...",
    "..hhhhhhhhhhhhhh..",
    ".hhhhhhhhhhhhhhhh.",
    ".hhhhHHhhhhhhhhhh.",
    "hhhhWWWhhhhWWWhhhh",
    "hhhWWWWWWWWWWWWhhh",
    "hhWWWWWWWWWWWWWWhh",
    "hhWkkkWWWWWWkkkWhh",
    "hhWWkkWWWWWWkkWWhh",
    "hhWWWWWWWWWWWWWWhh",
    "hhWqqWWWWWWWWqqWhh",
    "hhWWWWWWWWWWWWWWhh",
    "hhhWWWWWkkWWWWWhhh",
    "hhhWWWWWkkWWWWWhhh",
    "hhhhWWWWWWWWWWhhhh",
    "hhhh.WWWWWWWW.hhhh",
    "hhhh...WWWW...hhhh",
    "hhhh...WWWW...hhhh",
    "hhh............hhh",
    "hhh............hhh",
    ".hh............hh.",
  ];
  const RING = [
    "..W..",
    ".ddd.",
    "dWdLd",
    ".dLd.",
    "..d..",
    ".yYy.",
    "y...Y",
    "y...Y",
    ".yYy.",
  ];
  // shared close-up car interior (front view through the windscreen): him driving (left), her (right)
  const carInside = (px, blushHim, blushHer) => {
    px.rect(18, 16, 24, 30, "w"); px.rect(68, 14, 26, 32, "w"); px.rect(19, 17, 22, 1, "s"); px.rect(69, 15, 24, 1, "s");
    px.rect(14, 42, 33, 20, "l"); px.rect(14, 42, 4, 20, "L"); px.rect(27, 41, 7, 3, "W"); px.line(16, 43, 40, 61, "k", 2);
    px.spr(GUY_BIG, 22, 25, false, { q: blushHim ? "m" : "W" });
    px.rect(63, 43, 35, 19, "p"); px.rect(94, 43, 4, 19, "P"); px.rect(76, 42, 8, 3, "W"); px.line(95, 44, 70, 61, "k", 2);
    px.spr(GIRL_BIG, 71, 22, false, { q: blushHer ? "m" : "W" });
  };
  const carFrame = (px, t) => {
    // steering wheel in front of him, windscreen frame, rear-view mirror with a swinging heart
    px.line(10, 61, 14, 54, "k", 2); px.line(14, 54, 22, 51, "k", 2); px.line(22, 51, 32, 51, "k", 2); px.line(32, 51, 40, 54, "k", 2); px.line(40, 54, 44, 61, "k", 2);
    px.rect(25, 56, 4, 6, "k");
    px.rect(0, 0, W, 2, "W"); px.line(0, 2, 7, 61, "W", 2); px.line(108, 2, 101, 61, "W", 2);
    px.rect(48, 2, 15, 5, "w"); px.rect(49, 3, 13, 3, "l"); px.rect(54, 0, 3, 2, "k");
    const sw = Math.round(Math.sin(t * 3) * 2);
    px.line(55, 7, 55 + sw, 11, "k"); px.spr(HEART_S, 54 + sw, 11);
  };

  const ring = {
    dur: 7,
    draw(px, t) {
      const opened = t > 1.6, react = t > 2.1;
      carInside(px, react, react);
      // she covers her mouth with both hands
      if (react && t < 6.5) {
        px.line(66, 50, 75, 39, "W", 2); px.line(95, 50, 86, 39, "W", 2);
        px.rect(74, 35, 4, 4, "W"); px.rect(84, 35, 4, 4, "W");
      }
      // his hand bringing the box up between them
      const up = prog(t, 0.2, 0.9);
      const by = Math.round(lerp(60, 50, up)), bx = 49;
      px.line(44, 52, bx + 2, by + 3, "W", 2);
      // ring box: lid flips open, gold ring with a diamond on a dark cushion
      if (opened) {
        px.rect(bx, by - 9, 13, 9, "R"); px.rect(bx + 1, by - 8, 11, 7, "h");
        px.spr(RING, bx + 4, by - 10);
      }
      px.rect(bx, by, 13, 6, "R"); px.rect(bx, by, 13, 1, "h"); px.rect(bx + 1, by + 1, 11, 1, "k"); px.rect(bx, by + 5, 13, 1, "R");
      px.dot(bx + 6, by + 3, "y");
      if (!opened) px.rect(bx, by - 3, 13, 3, "R");
      // sparkles around the diamond
      if (opened) {
        const f = Math.floor(t * 5) % 3;
        const star = (x, y) => { px.dot(x, y, "W"); px.dot(x - 1, y, "d"); px.dot(x + 1, y, "d"); px.dot(x, y - 1, "d"); px.dot(x, y + 1, "d"); };
        if (f === 0) star(bx + 3, by - 12);
        if (f === 1) star(bx + 10, by - 11);
        if (f === 2) star(bx + 6, by - 14);
      }
      carFrame(px, t);
      floatHeart(px, 98, 26, t, 2.6, 4.6, true);
      floatHeart(px, 66, 16, t, 3.0, 5.2);
      floatHeart(px, 100, 12, t, 3.8, 5.8);
    },
  };

  // Card 6 — in the car: a small white cake with chocolate frosting on the console; they cut it
  // together, then she feeds him a bite and he feeds her from the same slice
  const CAKE = [ // 11×8: chocolate top with drips, white sponge, chocolate sprinkles
    "..CCCCCCC..",
    ".CcCCcCCcC.",
    "CCcCCCCcCCC",
    "WCWWCWWWCWW",
    "WWWWWWCWWWW",
    "WWCWWWWWWCW",
    "WWWWWCWWWWW",
    "sssssssssss",
  ];
  const cake = {
    dur: 10,
    draw(px, t) {
      const knife = [0.5, 3.0], press = prog(t, 1.3, 2.0) - prog(t, 2.4, 2.8);
      const fork = 3.2, feedHim = [3.8, 4.6], bite1 = 4.8, swap = 5.6, feedHer = [6.0, 6.8], bite2 = 7.0;
      carInside(px, t > bite1, t > bite2);
      // small plate + cake on the console between them (a slice missing after the cut)
      px.rect(47, 55, 17, 2, "W"); px.rect(48, 57, 15, 1, "w");
      px.spr(CAKE, 50, 47);
      if (t > 3.0) { px.rect(55, 47, 3, 8, "s"); px.rect(55, 47, 3, 1, "C"); }
      // both hands on a small knife, cutting
      const p = Math.round(press * 3);
      const kOn = t > knife[0] && t < knife[1] + 0.3;
      const reach = prog(t, knife[0], knife[0] + 0.4) - prog(t, knife[1], knife[1] + 0.3);
      if (kOn) {
        const hy = Math.round(lerp(58, 41 + p, reach));
        px.line(44, 52, lerp(44, 53, reach), hy, "W", 2); px.line(66, 52, lerp(66, 58, reach), hy, "W", 2);
        if (reach > 0.6) { px.rect(54, 39 + p, 3, 4, "h"); px.rect(55, 43 + p, 2, 6, "d"); px.dot(55, 49 + p, "d"); }
      }
      // fork with a slice (white with chocolate on top)
      const slice = (x, y, size) => {
        px.line(x, y, x, y + 6, "d"); px.dot(x - 1, y - 1, "d"); px.dot(x + 1, y - 1, "d");
        if (size === 2) px.spr(["CCC", "WCW", "WWW"], x - 1, y - 4);
        if (size === 1) px.spr(["CC", "WW"], x - 1, y - 3);
      };
      // she feeds him
      if (t >= fork && t < swap) {
        const k = prog(t, feedHim[0], feedHim[1]) - prog(t, bite1 + 0.2, bite1 + 0.6);
        const fx = Math.round(lerp(64, 34, k)), fy = Math.round(lerp(46, 40, k));
        px.line(68, 52, fx + 1, fy + 6, "W", 2);
        slice(fx, fy, t < bite1 ? 2 : 1);
      }
      // he feeds her from the same slice
      if (t >= swap && t < bite2 + 0.6) {
        const k = prog(t, feedHer[0], feedHer[1]) - prog(t, bite2 + 0.2, bite2 + 0.6);
        const fx = Math.round(lerp(46, 80, k)), fy = Math.round(lerp(46, 39, k));
        px.line(42, 52, fx - 1, fy + 6, "W", 2);
        slice(fx, fy, t < bite2 ? 1 : 0);
      }
      carFrame(px, t);
      floatHeart(px, 55, 24, t, 7.6, 9.4);
      floatHeart(px, 47, 30, t, 7.9, 9.5, true);
      floatHeart(px, 63, 30, t, 8.1, 9.6, true);
    },
  };

  // Card 8 — airport: a long hug, he walks up the stairs into a big plane, it takes off
  const drawPlane = (px, dx, dy, tilt) => {
    // everything goes through P() so the whole plane can move and tilt nose-up
    const P = (x, y, c) => px.dot(x + dx, y + dy - Math.round((x - 60) * tilt), c);
    const R = (x, y, w, h, c) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) P(x + i, y + j, c); };
    // tail fin with a heart logo, stabiliser
    for (let y = 4; y <= 22; y++) { const x1 = 58 + Math.round((y - 4) * 0.55); R(52 + Math.round((y - 4) * 0.2), y, x1 - 52 - Math.round((y - 4) * 0.2), 1, y < 6 ? "w" : "W"); }
    [[55, 11], [57, 11], [54, 12], [55, 12], [56, 12], [57, 12], [58, 12], [55, 13], [56, 13], [57, 13], [56, 14]].forEach(([x, y]) => P(x, y, "r"));
    R(45, 27, 16, 2, "w");
    // fuselage (runs off the right edge), tail cone, belly stripe, windows, door
    R(52, 29, 8, 15, "W"); R(56, 25, 4, 4, "W");
    R(60, 22, 60, 25, "W"); R(60, 22, 60, 1, "w");
    R(52, 40, 68, 2, "m"); R(52, 42, 68, 5, "w"); R(52, 46, 68, 1, "s");
    for (let x = 78; x < 120; x += 5) { R(x, 28, 2, 3, "L"); P(x, 28, "l"); }
    R(64, 25, 8, 16, "k"); R(65, 26, 6, 14, "w"); R(66, 27, 4, 5, "l"); P(70, 33, "k");
    // wing towards us, with an engine
    for (let y = 40; y <= 51; y++) R(84 - (y - 40), y, 16 - Math.round((y - 40) * 0.6), 1, y === 40 ? "W" : "w");
    R(76, 47, 11, 5, "s"); R(76, 47, 2, 5, "k"); R(86, 48, 1, 3, "w");
    return P;
  };
  const airport = {
    dur: 10,
    draw(px, t) {
      // sky + tarmac
      const cl = (t * 3) % 150;
      px.spr(["..WWW...", ".WWWWWW.", "WWWWWWWW"], Math.round(40 - cl + (cl > 60 ? 150 : 0)), 5);
      px.spr(["..WW..", "WWWWWW"], Math.round(20 - cl * 0.6 + (cl > 40 ? 150 : 0)), 13);
      px.rect(0, GROUND + 2, W, 3, "w"); for (let x = 0; x < W; x += 8) px.rect(x, GROUND + 3, 4, 1, "y");
      // plane: waits, taxis a little, then climbs away
      const taxi = prog(t, 5.8, 6.6), climb = prog(t, 6.6, 9.0);
      const dx = Math.round(taxi * 6 + climb * climb * 90), dy = -Math.round(climb * climb * 60);
      const tilt = Math.min(0.22, climb * 0.5);
      const P = drawPlane(px, dx, dy, tilt);
      if (climb < 0.15) { // landing gear
        [[62, "k"], [104, "k"]].forEach(([x]) => { for (let y = 47; y < GROUND; y++) P(x, y, "k"); P(x - 1, GROUND, "k"); P(x, GROUND, "k"); P(x + 1, GROUND, "k"); });
      }
      // stair truck to the door
      if (t < 5.6) {
        for (let i = 0; i < 8; i++) px.rect(48 + i * 2, 56 - i * 2, 3, 1, "w");
        px.line(47, 52, 63, 37, "k"); px.line(47, 52, 47, 57, "k"); px.rect(45, 57, 22, 1, "h");
      }
      // her: hugging, then waving him goodbye
      const hug = t < 2.2;
      let wave = [1, 7];
      if (hug) wave = [6, -1];
      else if (t > 3.0 && t < 9.4) wave = Math.floor(t / 0.25) % 2 ? [3, -8] : [5, -7];
      person(px, { x: 18, dir: 1, girl: true, armF: wave, armB: hug ? [5, 0] : [1, 7], blush: hug });
      // him: hug (facing her), then turns, walks over and climbs the stairs into the plane
      if (hug) {
        person(px, { x: 25, dir: -1, armF: [6, -1], armB: [5, 0] });
      } else if (t < 5.4) {
        const walk = prog(t, 2.4, 4.0), up = prog(t, 4.0, 5.2);
        const x = Math.round(lerp(25, 46, walk) + up * 20), y = GROUND - Math.round(up * 16);
        const moving = t > 2.4 && t < 5.2;
        person(px, { x, y, dir: 1, legs: moving ? (Math.floor(t / 0.2) % 2 ? "walk" : "walk2") : "stand",
          armF: t < 2.9 ? [3, -8] : [1, 7], noShadow: up > 0 });
      }
      floatHeart(px, 19, 18, t, 0.4, 2.2);
    },
  };

  const SCENES = { texting, gym, date, roadtrip, bouquet, cake, ring, airport };

  // ── mounting + one shared animation loop ───────────────────────────────────────
  const mounted = [];
  const px = new Px();
  const small = document.createElement("canvas");
  small.width = W; small.height = H;
  const sctx = small.getContext("2d");
  const render = (m) => {
    const c = m.canvas, dpr = Math.min(3, window.devicePixelRatio || 1);
    const cw = Math.round(c.clientWidth * dpr), ch = Math.round(c.clientHeight * dpr);
    if (!cw || !ch) return;
    if (c.width !== cw || c.height !== ch) { c.width = cw; c.height = ch; }
    px.clear();
    m.def.draw(px, m.frame / FPS);
    px.outline();
    sctx.putImageData(new ImageData(px.a, W, H), 0, 0);
    const ctx = m.ctx, s = Math.max(1, Math.floor(Math.min(cw / W, ch / H)));
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(small, Math.round((cw - W * s) / 2), ch - H * s, W * s, H * s);
  };
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    for (const m of mounted) {
      if (m.fixed != null) { const f = Math.floor(m.fixed * FPS); if (f !== m.frame || m.dirty) { m.frame = f; m.dirty = false; render(m); } continue; }
      if (!m.active()) continue;
      m.t = (m.t + dt) % m.def.dur;
      const f = Math.floor(m.t * FPS);
      if (f !== m.frame || m.dirty) { m.frame = f; m.dirty = false; render(m); }
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  addEventListener("resize", () => mounted.forEach((m) => (m.dirty = true)));

  window.CARD_SCENES = SCENES;
  // el: container; active(): whether it should animate right now (on screen, card not flipped)
  window.mountCardScene = (el, name, active = () => true) => {
    const def = SCENES[name];
    if (!def) return null;
    const canvas = document.createElement("canvas");
    canvas.className = "pxscene";
    el.append(canvas);
    const m = { el, def, canvas, ctx: canvas.getContext("2d"), t: 0, frame: -1, dirty: true, active, fixed: null };
    mounted.push(m);
    return m;
  };
  // for checking a scene at a given moment:  __pixelShow(0, 2.5)  (card index, seconds)
  window.__pixelScenes = mounted;
  window.__pixelShow = (i, t) => { const m = mounted[i]; m.fixed = t; m.frame = Math.floor(t * FPS); render(m); };
})();
