"""
Builds letter.js: the letter text split into words, each with the time (in seconds) at which
the voice-over says it. The website uses this to highlight each word while the audio plays.

Run it again whenever you change Letter.txt or re-record voiceovers/Letter.mp4:

    python tools/align_letter.py

How it works (no internet / speech model needed):
  1. Measures loudness of the recording and finds the pauses between phrases.
  2. Matches those pauses to the punctuation in the text (pauses mostly happen at . , ! ?
     and paragraph breaks) using dynamic programming.
  3. Inside each spoken phrase, spreads the words out by their length in syllables.
It's an estimate, usually within a fraction of a second. If the highlight is consistently a bit
early or late, tweak `letterSyncOffset` in story.js instead of re-running this.
Needs: python, numpy, ffmpeg on the PATH.
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
TEXT = ROOT / "Letter.txt"
AUDIO = ROOT / "voiceovers" / "Letter.mp4"
OUT = ROOT / "letter.js"
SR = 16000
HOP = 0.01  # seconds per analysis frame

# ── 1. loudness → speech segments ───────────────────────────────────────────────
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(AUDIO), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
    capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32)
duration = len(x) / SR
hop, win = int(SR * HOP), int(SR * 0.03)
frames = np.lib.stride_tricks.sliding_window_view(x, win)[::hop]
db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
db = np.convolve(db, np.ones(5) / 5, mode="same")  # light smoothing
floor, loud = np.percentile(db, 8), np.percentile(db, 92)
thr = floor + 0.30 * (loud - floor)
speech = db > thr

MIN_PAUSE, MIN_SPEECH = 0.20, 0.08
segs, start = [], None
for i, s in enumerate(np.append(speech, False)):
    t = i * HOP
    if s and start is None:
        start = t
    elif not s and start is not None:
        segs.append([start, t])
        start = None
# merge segments separated by pauses shorter than MIN_PAUSE, drop tiny blips
merged = []
for a, b in segs:
    if merged and a - merged[-1][1] < MIN_PAUSE:
        merged[-1][1] = b
    else:
        merged.append([a, b])
segs = [s for s in merged if s[1] - s[0] >= MIN_SPEECH]

# ── 2. text → words with weights and "how likely is a pause after this word" ────
text = TEXT.read_text(encoding="utf-8").replace("\r\n", "\n").strip()
paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]
words = []  # dicts: w, p (paragraph index), brk (pause likelihood after word)
for pi, para in enumerate(paragraphs):
    toks = para.split()
    for ti, tok in enumerate(toks):
        last = ti == len(toks) - 1
        if last:
            brk = 0.0
        elif re.search(r"[.!?]['\"”’)]*$", tok):
            brk = 0.05
        elif re.search(r"[,;:]['\"”’)]*$", tok):
            brk = 0.4
        else:
            brk = 2.0
        words.append({"w": tok, "p": pi, "brk": brk})
words[-1]["brk"] = 0.0

def weight(tok):
    core = re.sub(r"[^\wÀ-ÿ]", "", tok.lower())
    syl = len(re.findall(r"[aeiouyàáâäèéêëïíîóôöúûü]+", core)) or 1
    return syl + 0.06 * len(core) + 0.15

W = np.array([weight(w["w"]) for w in words])
cumW = np.concatenate([[0], np.cumsum(W)])
seg_dur = np.array([b - a for a, b in segs])
rate = seg_dur.sum() / W.sum()  # seconds per weight unit

# ── 3. DP: assign consecutive word ranges to consecutive speech segments ────────
N, M = len(words), len(segs)
MAXW = 45
INF = 1e18
cost = np.full((M + 1, N + 1), INF)
back = np.zeros((M + 1, N + 1), dtype=np.int64)
cost[0, 0] = 0
for j in range(1, M + 1):
    d = seg_dur[j - 1]
    for b in range(0, N + 1):
        best, arg = INF, -1
        # a segment may get no words (breath / noise) — only if short
        if cost[j - 1, b] < INF:
            c = cost[j - 1, b] + (0.8 if d < 0.5 else 6.0 * d)
            if c < best:
                best, arg = c, b
        for a in range(max(0, b - MAXW), b):
            prev = cost[j - 1, a]
            if prev >= INF:
                continue
            exp = rate * (cumW[b] - cumW[a])
            c = prev + ((d - exp) / (0.35 * exp + 0.25)) ** 2
            if b < N:
                c += words[b - 1]["brk"]
            if c < best:
                best, arg = c, a
        cost[j, b], back[j, b] = best, arg
# backtrack
ranges, b = [], N
for j in range(M, 0, -1):
    a = back[j, b]
    ranges.append((j - 1, a, b))
    b = a
ranges.reverse()

times = [None] * N
for j, a, b in ranges:
    if a == b:
        continue
    s0, s1 = segs[j]
    span = cumW[b] - cumW[a]
    for k in range(a, b):
        times[k] = round(s0 + (s1 - s0) * (cumW[k] - cumW[a]) / span, 2)
assert all(t is not None for t in times), "alignment left words without a time"

used = sum(1 for _, a, b in ranges if a < b)
print(f"audio {duration:.1f}s · {M} speech segments ({used} with words) · {N} words · rate {rate:.3f}s/unit")

data = {
    "audio": "voiceovers/Letter.mp4",
    "duration": round(duration, 2),
    "paragraphs": [[[w["w"], t] for w, t in zip(words, times) if w["p"] == pi] for pi in range(len(paragraphs))],
}
OUT.write_text(
    "// GENERATED by tools/align_letter.py from Letter.txt + voiceovers/Letter.mp4 — don't edit by hand,\n"
    "// change Letter.txt and re-run:  python tools/align_letter.py\n"
    "// Format: paragraphs → [word, start time in seconds]\n"
    "window.LETTER = " + json.dumps(data, ensure_ascii=False) + ";\n",
    encoding="utf-8")
print(f"wrote {OUT.relative_to(ROOT)}")
if "--debug" in sys.argv:
    for j, a, b in ranges:
        s0, s1 = segs[j]
        print(f"{s0:7.2f}-{s1:7.2f}  {' '.join(w['w'] for w in words[a:b]) or '(none)'}")
