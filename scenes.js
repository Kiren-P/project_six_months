// Looping white line-art scenes shown at the bottom of each story card (before it's flipped).
// Pick one per card in story.js with   scene: "texting"   — available names are at the bottom of this file.
// Everything is drawn in a 320 × 150 box; the animations live in scenes.css.
(() => {
  const G = 142; // ground line
  const p = (d, cls) => `<path${cls ? ` class="${cls}"` : ""} d="${d}"/>`;
  const f = (d) => `<path class="f" d="${d}"/>`;
  // a group that can be animated (rotate/translate) around origin (ox, oy)
  const grp = (cls, ox, oy, inner) => `<g class="${cls}" style="transform-origin:${ox}px ${oy}px">${inner}</g>`;
  const heart = (x, y, s, cls) =>
    grp(cls, x, y, `<path class="f" transform="translate(${x} ${y}) scale(${s})" d="M0 3C-5-1-6-6-2.5-6C-1-6 0-4.8 0-4.8C0-4.8 1-6 2.5-6C6-6 5-1 0 3Z"/>`);

  // side-view head (dir 1 = facing right, -1 = facing left); girls get long hair flowing down behind
  const head = (x, y, girl, dir = 1) =>
    (girl ? f(`M${x + dir * 3} ${y - 8}C${x - dir * 9} ${y - 10} ${x - dir * 13} ${y + 2} ${x - dir * 11} ${y + 17}C${x - dir * 8} ${y + 15} ${x - dir * 6} ${y + 10} ${x - dir * 5} ${y + 4}Z`) : "") +
    `<circle class="f" cx="${x}" cy="${y}" r="8"/>`;

  // standing person without arms, feet on the ground at x. Guys get swingable legs (legCls + "a"/"b").
  const body = (x, girl, dir = 1, legCls = "") => {
    const h = head(x + dir, 80, girl, dir);
    if (girl) return h + p(`M${x} 88V98`) + p(`M${x - 3} 97L${x - 12} 124H${x + 12}L${x + 3} 97Z`, "dress") + p(`M${x - 5} 124V${G}M${x + 5} 124V${G}`);
    return h + p(`M${x} 88V116`) + grp(legCls + "a", x, 116, p(`M${x} 116L${x - 6} ${G}`)) + grp(legCls + "b", x, 116, p(`M${x} 116L${x + 6} ${G}`));
  };
  // arm hanging from the shoulder (x, 95) towards dir; `extra` is whatever is held in the hand at (x + dir*7, 120)
  const arm = (cls, x, dir, extra = "") => grp(cls, x, 95, p(`M${x} 95L${x + dir * 7} 120`) + extra);

  // small bouquet held at (hx, hy), flowers pointing towards s (+1 right / -1 left)
  const bouquet = (hx, hy, s) =>
    f(`M${hx - 2 * s} ${hy}L${hx + 14 * s} ${hy - 7}L${hx + 14 * s} ${hy + 7}Z`) +
    [[17, -6, 4], [19, 0, 4.4], [17, 6, 4], [23, -3, 3.6], [23, 3.6, 3.6]]
      .map(([dx, dy, r]) => `<circle class="f" cx="${hx + dx * s}" cy="${hy + dy}" r="${r}"/><path class="petal" d="M${hx + dx * s - r / 2} ${hy + dy}a${r / 2} ${r / 2} 0 1 1 ${r / 2} ${r / 2}"/>`)
      .join("");

  // front view of a car with an open cabin; `inside` is drawn in the windscreen
  const car = (inside) => `
    <g class="car-bob">
      ${p("M116 34H204")}${p("M112 38H208L232 100H88Z", "glass")}
      ${inside}
      ${p("M88 84H74V76H86M232 84H246V76H234")}
      <rect x="78" y="100" width="164" height="26" rx="8" class="body"/>
      <circle cx="98" cy="112" r="6" class="f"/><circle cx="222" cy="112" r="6" class="f"/>
      <rect x="136" y="106" width="48" height="12" rx="3"/>${p("M144 110V114M152 110V114M160 110V114M168 110V114M176 110V114", "thin")}
      <rect class="f" x="88" y="126" width="18" height="14" rx="3"/><rect class="f" x="214" y="126" width="18" height="14" rx="3"/>
    </g>
    <g class="road">${p("M60 128L34 138M262 128L288 138M54 116L30 122M266 116L290 122", "thin")}</g>`;
  // front-view people for the car scenes
  const frontGuy = (lookRight) => `
    <circle cx="136" cy="56" r="9" class="face"/>
    ${f("M127 54Q128 44 136 44Q145 44 145 54Q140 49 127 54Z")}
    <circle class="f" cx="${lookRight ? 135 : 133}" cy="57" r="1.3"/><circle class="f" cx="${lookRight ? 141 : 139}" cy="57" r="1.3"/>
    ${p(`M${lookRight ? 135 : 133} 61Q136 63 ${lookRight ? 140 : 139} 61`, "thin")}
    ${p("M122 76Q136 68 150 76M124 76L126 100M148 76L146 100")}`;
  const frontGirl = (inner) => `
    ${f("M181 70L181 56Q181 44 192 44Q203 44 203 56L204 72L198 69L198 57Q198 52 192 52Q186 52 186 57L186 69Z")}
    <circle cx="192" cy="58" r="8" class="face"/>${inner}`;

  const SCENES = {
    // ── Card 1: texting — she's on her bed, he's on his desk chair; the line between the phones draws a heart
    texting: `
      ${p("M14 142V90Q14 84 20 84Q26 84 26 90V114")}<rect x="26" y="112" width="96" height="10" rx="3"/>${p("M120 122V142")}
      <ellipse cx="36" cy="106" rx="10" ry="5"/>
      ${head(36, 76, true, 1)}${p("M44 110L38 90M44 110L68 95L88 110M46 111L96 111")}
      ${p("M39 92L46 106")}${p("M39 92L50 104L54 89")}<rect class="f phone" x="51" y="76" width="7" height="12" rx="1.5"/>
      ${p("M262 98H316M268 98V142M310 98V142M278 98H300M298 98L304 80")}
      ${p("M214 114H244M244 114L250 82M229 114V130M214 138L229 130L244 138")}<circle cx="214" cy="140" r="2"/><circle cx="244" cy="140" r="2"/>
      ${head(237, 76, false, -1)}${p("M236 110L238 90M236 110L214 108L212 139M234 112L218 112L220 139")}
      ${p("M237 92L228 106")}${p("M237 92L224 104L220 89")}<rect class="f phone" x="213" y="76" width="7" height="12" rx="1.5"/>
      <path class="tx-link" pathLength="100" d="M57 90C70 124 108 138 135 132C152 121 163 108 161 99C159 89 141 87 135 101C129 87 111 89 109 99C107 108 118 121 135 132C162 138 198 124 215 90"/>
      ${heart(135, 112, 1.4, "tx-heart")}`,

    // ── Card 2: he walks up to her, reaches out; she (with her gym bag) hands him her water bottle
    gym: `<g class="g2-all">
      ${body(255, true, -1)}
      <rect x="259" y="104" width="18" height="12" rx="4"/>${p("M263 104L256 95M266 104V100H270V104", "thin")}
      ${arm("g2-gf", 255, -1, `<g class="g2-bot1"><rect class="f" x="245" y="115" width="6" height="11" rx="2"/></g>`)}
      <g class="g2-walk">
        ${body(40, false, 1, "g2-l")}
        ${arm("g2-ab", 40, -1)}
        ${arm("g2-af", 40, 1, `<g class="g2-bot2"><rect class="f" x="44" y="115" width="6" height="11" rx="2"/></g>`)}
      </g>
      ${heart(230, 58, 1.5, "g2-heart")}
    </g>`,

    // ── Card 3: date at ZIKIRI beach bar — sushi and a coconut on the table between them
    date: `
      <g class="d-sign">
        ${grp("d-palm", 49, 50, p("M49 50C40 40 30 40 22 46M49 50C58 40 68 40 76 46M49 50C46 40 48 32 54 28M49 50C38 46 30 50 26 58M49 50C60 46 68 50 72 58"))}
        <rect x="6" y="50" width="86" height="36" rx="5"/>${p("M49 86V142")}
        <text x="49" y="69" class="sign-big">ZIKIRI</text><text x="49" y="81" class="sign-small">beach bar</text>
      </g>
      ${p("M118 114H140M118 114L114 84M120 114V142M138 114V142")}
      ${head(133, 78, true, 1)}${p("M130 110L132 90M130 110L150 110L151 140")}
      ${grp("d-arm", 132, 94, p("M132 94L156 102M156 102L172 96M156 103L172 99", "") + `<circle class="f d-bite" cx="172" cy="97" r="2.6"/>`)}
      ${p("M170 104H220M195 104V138M183 140H207")}
      <ellipse cx="184" cy="102" rx="11" ry="2"/>
      <circle cx="179" cy="96" r="4"/><circle class="f" cx="179" cy="96" r="1.4"/><circle cx="189" cy="96" r="4"/><circle class="f" cx="189" cy="96" r="1.4"/>
      <circle cx="208" cy="95" r="8"/>${p("M203 92Q208 89 213 92", "thin")}${p("M211 88L218 74")}${f("M212 77Q218 67 226 74Z")}
      ${p("M250 114H272M272 114L276 84M252 114V142M270 114V142")}
      ${head(257, 78, false, -1)}${p("M260 110L258 90M260 110L240 110L239 140M258 94L232 101")}
      ${heart(195, 64, 1.5, "d-heart")}`,

    // ── Card 4: road trip — she sleeps on the passenger seat (neck pillow + blanket), legs on his lap under the wheel
    roadtrip: car(`
      ${frontGuy(false)}
      <circle cx="136" cy="84" r="11"/>${p("M125 84H147M136 84V95", "thin")}
      ${p("M122 77Q118 86 126 85M150 77Q154 86 146 85")}
      <g class="r-head">${frontGirl(p("M187 58Q189 60 191 58M193 58Q195 60 197 58", "thin"))}</g>
      ${p("M180 63Q186 75 192 71Q198 75 204 63", "pillow")}
      ${p("M178 92L131 94M178 97L133 98M131 94L127 89M133 98L128 94")}
      <path class="blanket" d="M177 74Q192 69 207 74L209 98Q200 94 192 99Q184 104 175 98Z"/>
      <text class="zz z1" x="208" y="46">z</text><text class="zz z2" x="208" y="46">z</text><text class="zz z3" x="208" y="46">z</text>`),

    // ── Card 5: he surprises her with a bouquet of roses
    bouquet: `<g class="b-all">
      ${body(120, false, 1)}${arm("b-gb", 120, -1)}
      ${arm("b-gf", 120, 1, `<g class="b-bq1">${bouquet(127, 120, 1)}</g>`)}
      ${body(196, true, -1)}
      ${arm("b-hb", 196, 1)}
      ${arm("b-hf", 196, -1, `<g class="b-bq2">${bouquet(189, 120, -1)}</g>`)}
      ${heart(158, 60, 1.3, "b-h1")}${heart(146, 48, 0.9, "b-h2")}${heart(172, 44, 1, "b-h3")}
    </g>`,

    // ── Card 6: cutting the cake together, then feeding each other a bite from the same slice
    cake: `<g class="c-all">
      ${p("M146 112H174M150 112V142M170 112V142")}
      <rect x="148" y="100" width="24" height="12" rx="2"/><rect x="153" y="92" width="14" height="8" rx="2"/>
      ${p("M160 92V86")}${grp("c-flame", 160, 84, f("M160 79Q163 83 160 86Q157 83 160 79Z"))}
      <g class="c-knife"><rect class="f" x="157" y="64" width="6" height="11" rx="2"/>${p("M158 75H162L160 92Z", "thin")}</g>
      <g class="c-girl">${body(138, true, 1)}${arm("", 138, -1)}
        ${arm("c-gf", 138, 1, `<g class="c-fork1">${p("M145 120L148 129", "thin")}<g class="c-slice1" style="transform-origin:149px 131px">${f("M146 129L153 131L148 134Z")}</g></g>`)}</g>
      <g class="c-guy">${body(182, false, -1)}${arm("", 182, 1)}
        ${arm("c-hf", 182, -1, `<g class="c-fork2">${p("M175 120L172 129", "thin")}<g class="c-slice2" style="transform-origin:171px 131px">${f("M174 129L167 131L172 134Z")}</g></g>`)}</g>
      ${heart(160, 58, 1.4, "c-h1")}${heart(148, 46, 0.9, "c-h2")}${heart(172, 44, 1, "c-h3")}
    </g>`,

    // ── Card 7: in the car, he opens a ring box for her
    ring: car(`
      ${frontGuy(true)}
      ${p("M122 77Q118 86 126 88M150 77Q158 84 156 90")}
      ${frontGirl(`<circle class="f" cx="189" cy="58" r="1.3"/><circle class="f" cx="195" cy="58" r="1.3"/><circle cx="192" cy="63" r="1.6" class="thin"/>`)}
      ${p("M180 76Q192 70 204 76M182 76L184 100M202 76L200 100")}
      ${grp("k-hl", 182, 77, p("M182 77Q178 70 186 64"))}${grp("k-hr", 202, 77, p("M202 77Q206 70 198 64"))}
      <g class="k-box" style="transform-origin:160px 92px">
        <rect class="f" x="152" y="86" width="16" height="8" rx="1.5"/>
        <g class="k-lid" style="transform-origin:160px 86px"><rect x="152" y="81" width="16" height="5" rx="1.5" class="lid"/></g>
        <g class="k-ring"><circle cx="160" cy="82" r="3.4" class="thin"/>${f("M158 78.6L160 76L162 78.6L160 80Z")}</g>
        ${grp("k-sp", 160, 74, p("M160 68V72M160 76V80M154 74H158M162 74H166", "thin"))}
      </g>
      ${heart(176, 40, 1.2, "k-h1")}${heart(160, 30, 0.9, "k-h2")}`),

    // ── Card 8: a long hug, he walks up the stairs into the plane and it flies away
    airport: `<g class="a-all">
      <g class="a-plane" style="transform-origin:255px 121px">
        ${p("M204 112L196 90H206L222 112")}
        <path class="body" d="M200 112H290C306 112 314 117 314 121C314 126 306 130 290 130H206C199 130 196 126 196 121Z"/>
        ${[236, 244, 252, 260, 268, 276, 284].map((x) => `<circle class="f" cx="${x}" cy="118" r="1.7"/>`).join("")}
        ${f("M298 115L306 116.5L304 119H297Z")}
        <rect x="210" y="115" width="8" height="13" rx="1.5" class="thin"/>
        ${p("M244 124L230 138H240L262 124")}
        ${p("M216 130V135M286 130V135", "thin")}<circle class="f" cx="216" cy="137" r="2.4"/><circle class="f" cx="286" cy="137" r="2.4"/>
      </g>
      <g class="a-stairs">${p("M188 142L208 128H212V142")}${p("M193 139H212M198 135.5H212M203 132H212", "thin")}</g>
      ${body(92, true, 1)}${arm("", 92, -1)}${arm("a-wave", 92, 1)}
      <g class="a-hugguy">${body(106, false, -1)}${arm("", 106, 1)}${arm("a-hug", 106, -1)}</g>
      <g class="a-walk"><g class="a-guy">${body(106, false, 1, "a-l")}${arm("", 106, -1)}${arm("", 106, 1)}</g></g>
      ${heart(99, 60, 1.4, "a-heart")}
    </g>`,
  };

  // scenes that only use the middle of the box get zoomed in so they're drawn bigger
  const VIEW = { cake: "84 44 152 102", bouquet: "76 30 168 116", roadtrip: "24 20 272 126", ring: "24 20 272 126" };
  window.CARD_SCENES = Object.fromEntries(
    Object.entries(SCENES).map(([name, inner]) => [
      name,
      `<svg class="cs cs-${name}" viewBox="${VIEW[name] || "0 0 320 150"}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${inner}</svg>`,
    ])
  );
})();
