# The wave curriculum

> **Status: not built — the plan, waiting on the owner's four answers at the
> end.** Today's game, measured, is `wave-curriculum-today.md` beside this
> file. The director's ≡ press, which shows only the regular waves, is built.

The owner, 14 October 2026: *I want AI to generate regular waves, composed from
the mechanics and enemies we already have … there should be an equal number of
waves until something new is added, so players are not always learning
something new … increase difficulty in very small steps, and don't make it
boring.* And, the same day: *the game will have around 1000 waves, probably
more as I extend it.*

This page is the set of decisions a generator needs before it places one
arrival: how long a wave is, how many follow each new thing, in what order the
levers are pulled, and a number that says whether a wave is harder than the one
before it.

## 1. What is wrong today, in numbers

Read off the 120 waves on 14 October 2026 (`wave-curriculum-today.md`):

- **10 of 120 waves are regular.** 110 introduce a body, a pod, a fault, a
  panel or a boss. From wave 20 to wave 119 there is one regular wave (THE
  TWITCH): the pair learns something new on nearly every wave.
- **Difficulty jumps around.** On the pressure score (§5), FINALE is 20.9,
  CROWDED and THE WARD 14.4, and the wave after THE WARD is 3.0. THE WARD is an
  introduction at the game's third-highest pressure; a new thing should arrive
  at low pressure.
- **Boss lengths range from 9 s to 343 s when AUTO plays them** (§7). 22 of the
  last 23 waves are bosses, one after another.

## 2. What other games do — the research

- **Introduce, develop, twist, conclude** — Nintendo's four steps
  (kishōtenketsu, Koichi Hayashida on Super Mario 3D Land/World): the new
  thing first where failing costs nothing, then with stakes, then bent, then
  played with confidence.
  [MCV](https://www.mcvuk.com/development/video-nintendos-level-design-secrets-in-four-steps),
  [Game Developer](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design).
- **A sawtooth, not a ramp.** Difficulty rises in teeth: a hard stretch, then a
  breather, then the next tooth starts a little higher. Never put a new thing
  on top of a peak.
  [bugnet](https://bugnet.io/blog/difficulty-curves-how-to-get-them-right),
  [abratabia](https://www.abratabia.com/game-design/difficulty-curves.php).
- **Measure strain in a window, not the average.** Rhythm games rate a chart by
  its densest stretch — osu!'s star rating takes peak *strain* per section,
  where strain is what each note costs given what came just before it.
  [osu! 2021](https://osu.ppy.sh/home/news/2021-07-27-performance-points-star-rating-updates),
  [osu!taiko 2020](https://dev.ppy.sh/home/news/2020-09-15-changes-to-osutaiko-star-rating).
- **Bring old things back at intervals** (spaced repetition, interleaving). A
  thing met once and never again is forgotten; a mix of an old thing with a new
  one is what makes either feel new.

`docs/spec/wave-design.md` §8.5 already had the shape — introduce, vary,
combine, invert, boss — for ten waves. This page gives it numbers.

## 3. Time

The beat is 0.625 s (96 BPM). Measured on the probe (`tools/probe/`):

| Fact | Beats | Seconds |
|---|---|---|
| A slick, bulb or slow rock falls to the hull | 14–16 | 9–10 |
| A medium / fast / fastest rock | 9 / 7 / 5 | 6 / 4 / 3 |
| A torch | 4 | 2.5 |
| One spoken exchange — call and answer (`config-creatures.ts`) | 4–5 | 2.5–3 |
| The rest after a cleared wave (`waveRestBeats`) | 6 | 3.75 |

**Decision 1 — a wave's length is its span**: beats from its first arrival to
its last. Played time is span + about 10 beats of falling + 6 of rest.

| Wave | Span (beats) | Arrivals | Played, about |
|---|---|---|---|
| Introduction (I) | 8–24 | 1–4 | 15–25 s |
| Regular, early in a block (R1–R3) | 24–32 | 4–6 | 25–30 s |
| Regular, middle (R4–R6) | 32–40 | 6–8 | 30–35 s |
| Regular, late (R7–R8) | 40–48 | 8–12 | 35–40 s |
| Normal boss | — | — | a pair 60–120 s (AUTO 30–60 s) |
| Special boss | — | — | a pair 90–180 s (AUTO 45–90 s) |

FIRST STEP — the owner's own example — is a span of 48 with 9 arrivals: the
length of an R8, which is right for the wave that has to carry the first block.

**Decision 2 — the gap rule.** Two arrivals that need *different* jobs (a red
and a cyan, a shot and a shield, a body and a rock) are at least **4 beats**
apart — one spoken exchange — in the first 20 blocks, and at least **3** after.
The same job in the same column may follow on the next beat.

## 4. The block: one new thing, then eight regular waves

**Decision 3 — every new thing opens a block of 1 + 8 waves.** The intro wave
teaches it, eight regular waves use it, and only then does the next new thing
arrive. Equal for every block, so the pair always has the same eight waves to
get good at something before being taught again.

A *new thing* is whatever `waveIntroduces` names: a body, a pod, a fault, a
panel. A boss is not a block — it closes one (§7).

Eight because it fits the owner's thousand: the 56 non-boss introductions today
make 56 × 9 = 504 waves, plus 54 bosses is about 560; the hundred-odd new
things the game is heading for make about a thousand. It also makes a new thing arrive every four to five
minutes of play.

Each of the eight has a job, and the order is the owner's FIRST STEP rule
generalised — *first in the middle, then a second in the same wave, then
another lane, then further*:

| Step | Name | What it does | Pressure |
|---|---|---|---|
| I | Show | The new thing alone, **centre column**, nothing else on the field | floor |
| R1 | Again | The new thing alone, centre and its neighbours (cols 4–6), one at a time | floor + 1 |
| R2 | Spread | Alone, lanes widen to cols 2–8 | floor + 2 |
| R3 | Reach | Alone, to the edges (0 and 10), long jumps between arrivals | floor + 3 |
| R4 | Pair | With the **previous** block's thing, the jobs alternating | floor + 4 |
| R5 | Breathe | With the oldest basics (slick, bulb, slow rock), wide gaps — the dip in the sawtooth | floor + 2 |
| R6 | Recall | With a thing from **three or more blocks back** — the spaced repeat | floor + 4 |
| R7 | Bend | One known **lever** on top: a known fault, a known panel, a faster rock, two at once | floor + 5 |
| R8 | Peak | With two known things, the tightest gaps the gap rule allows | floor + 6 |

**Decision 4 — one lever per step.** From one wave to the next, change one
thing: where (columns), when (gaps), with what (a second kind), or how (a
fault, a panel, speed). Never two. This is what keeps the steps small.

**Decision 5 — the floor rises slowly.** Block *b* (counting from 0) has
floor = 3 + 0.1 × *b*, so block 50 starts at 8 and peaks at 14. The ceiling is
never above 20 — FINALE today, the hardest regular wave the game has.

The intro wave of block *b* + 1 is back at its floor: the tooth drops and the
new thing always arrives easy.

## 5. Pressure — the number that says *harder*

One number per wave, from its entries alone, so a generator can aim at it and a
test can hold it. Built like a rhythm game's strain:

```
cost(arrival) = weight(kind) × (1 + travel + switch + together)
  travel   = columns from the previous arrival ÷ 5        (0 to 2)
  switch   = 1 if the job differs from the previous arrival's
  together = 0.5 if it arrives on the same beat as the previous one
pressure(wave) = the most cost inside any 8 beats   (8 beats = 5 s, two exchanges)
               + 2 for every fault placed
```

Weights: slick, bulb, slow rock 1 · medium rock 1.3 · fast 1.6 · faster 1.8 ·
fastest 2 · torch 1.5 · every other body 1.5 until it is tuned. The first
arrival's travel is counted from the centre column.

It is a prototype. It already ranks the existing waves the way the owner would
(TWO ROCKS 2.4 < THE WALL 10 < FINALE 20.9), but the weights are guesses; they
are tuned against a pair playing, not against AUTO.

**Decision 6 — a step may raise pressure by at most 2** over the wave before it
in the block, and a generated wave lands within ±1 of its target in §4.

## 6. How the waves get made

**Composed once, at author time, into the act files** — never at run time.
`docs/spec/wave-design.md` §8.1 rules out a run-time generator, and §7.3 keeps
positions, moments and order fixed so the pair can learn a wave. A composed
wave is ordinary data: it opens in the wave editor, the owner can drag any
arrival, and nothing in the game knows it was composed.

1. `bun run waves:compose <intro id>` — a tool in `tools/` that reads this
   page's tables, takes the pool of things known before the block, and writes
   R1–R8 as `variant: true` waves directly after the intro wave. The director
   already folds variants under the wave they vary (the owner, 11 October
   2026), so a block is one row that opens into nine.
2. Positions come from the seeded `Rng` with the block's id as the seed — the
   same block composes the same way every time, and re-rolling is a new seed.
3. Every composed wave is checked against §3–§5: span, arrivals, gap rule,
   pressure within ±1 of its target. A wave that misses is re-rolled, never
   shipped.
4. **Claude reads each block before it lands** and gives each wave its
   one-sentence test (`.claude/skills/new-wave`) — the sentence goes in the
   commit, the name on the wave.
5. The owner sees a block as **one PNG**: the nine maps side by side, each with
   its name, span, seconds and pressure.

**What the map editor will place**, step by step, for a block whose new thing
is X, the previous block's is Y and an older one is Z:

| Step | Columns | Gaps (beats) | Kinds |
|---|---|---|---|
| I | 5 | ≥ 8 | X |
| R1 | 4–6 | 8 | X |
| R2 | 2–8 | 6–8 | X |
| R3 | 0–10 | 6 | X |
| R4 | 0–10 | 5–6 | X, Y alternating |
| R5 | 2–8 | 8 | X, slick/bulb/rock |
| R6 | 0–10 | 5 | X, Z |
| R7 | 0–10 | 5 | X, Y + one lever |
| R8 | 0–10 | 4 (3 after block 20) | X, Y, Z |

## 7. Bosses

**Decision 7 — a boss closes a block.** It comes after R8, at most one per
block. There are 54 bosses and 56 blocks today, so nearly every block ends on
one; a block without one goes straight on to the next intro.

The boss table — every boss's AUTO time against the band — is in
`wave-curriculum-today.md`. AUTO plays perfectly and never talks, so the
*pair* column doubles it: that factor is a guess nobody has measured. Read
roughly: **28 bosses are short** (THE FLEET 9 s, THE VALVE 10 s, THE MANTLE
11 s), **8 are long** (THE INSTAR 343 s, PINBALL 257 s, THE BATON 177 s),
**12 are in band**, and **6 AUTO cannot finish**, so their length is unknown.

Bosses are the owner's to lengthen by hand. This plan only places them.

## 8. Lanes, once the answers are in

1. **The scorer** — `wavePressure` in `packages/content`, its test, and the
   number on every row of the director's wave list beside the marks.
2. **The composer** — `bun run waves:compose`, the checks of §6, and the block
   sheet PNG.
3. **Blocks**, about six per lane, in game order: compose, read, name, land,
   send the sheet.
4. **The today table** made a command (`bun run waves:measure`) so this page's
   numbers can be regenerated rather than copied.

## 9. Asked of the owner, 14 October 2026

1. Eight regular waves per new thing — or fewer, or more?
2. Do the existing waves keep their order, with blocks inserted after each
   intro — or are the 22 bosses at the end (waves 98–119) spread out, one per
   block?
3. Do the 10 old regular waves stay where they are, or count as the first of
   their block's eight?
4. Is a pair taking twice AUTO's time the right guess for the boss bands?
