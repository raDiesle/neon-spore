# The wave curriculum

> **Status: partly built.** The plan is answered (§9). Built: the ≡ press that
> shows only the regular waves, the pressure score on every row of the wave
> list (`wavePressure`), and `bun run waves:measure`, which writes today's game
> measured to `wave-curriculum-today.md` beside this file. Not built: the
> composer and the blocks.

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

Eight because it fits the owner's thousand: 56 introductions × 9 + 54 bosses
is about 560 today, and the hundred-odd new things to come make a thousand.

Each of the eight has a job, and the order is the owner's FIRST STEP rule
generalised — *first in the middle, then a second in the same wave, then
another lane, then further*:

| Step | Name | What it does | Pressure, on the wave before |
|---|---|---|---|
| I | Show | The new thing alone, **centre column**, nothing else on the field | — |
| R1 | Again | The new thing alone, centre and its neighbours (cols 4–6), one at a time | the gentlest |
| R2 | Spread | Alone, lanes widen to cols 2–8 | + 0.3 to 2 |
| R3 | Reach | Alone, to the edges (0 and 10), long jumps between arrivals | + 0.3 to 2 |
| R4 | Pair | With the **previous** block's thing, the jobs alternating | + 0.3 to 2 |
| R5 | Breathe | With the oldest basics (slick, bulb, slow rock), wide gaps — the dip in the sawtooth | − 0.5 to 3 |
| R6 | Recall | With a thing from **three or more blocks back** — the spaced repeat | + 0.3 to 2 |
| R7 | Bend | One known **lever** on top: a known fault, a known panel, a faster rock, two at once | + 0.3 to 2 |
| R8 | Peak | With two known things, the tightest gaps the gap rule allows | + 0.3 to 2 |

**Decision 4 — one lever per step.** From one wave to the next, change one
thing: where (columns), when (gaps), with what (a second kind), or how (a
fault, a panel, speed). Never two. This is what keeps the steps small.

**Decision 8 — the tutorial arc has short blocks.** Waves 1–19, up to
FINALE, teach the basic panel and the basic mechanics: slick and bulb, the
rock, the torch, the pods, and the bosses on screen there (THE INSTAR, THE
BASTION). The owner, 14 October 2026: there, each basic thing gets **three**
regular waves, not eight — R1 *Again*, R3 *Reach*, R4 *Pair* — so the arc grows
to about forty waves and is still a tutorial. Its old regular waves (TWO
COLOURS to CROWDED, and FINALE) count among the three. Slick and bulb are the
game's ordinary enemy, so **from R4 on, at least half of every regular wave's
arrivals are slicks and bulbs**, in the tutorial and after it.

**Decision 5 — revised by the composer, 14 October 2026.** A floor of
3 + 0.1 × *b* could not be aimed at: a wave of slicks eight beats apart scores
1.2, and a torch block sits higher at every step than a slick block. So a block
holds its **ramp**, not a number: R1 is the lower quarter of what its draws
reach, each step after rises 0.3 to 2 over the one before, R5 dips. Across
blocks (the owner, same day): R1 aims 0.1 above the block before's gentlest
wave, and every four blocks past the arc the steps grow — **wider, then
mixed**, then from block 24 **more twins** in R4 and R6–R8 (`compose-grow.ts`).

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

A prototype: it ranks TWO ROCKS 2.4 < THE WALL 10 < FINALE 20.9, but the
weights are guesses, to be tuned against a pair playing, not AUTO.

**Decision 6 — a step may raise pressure by at most 2** over the wave before it
in the block (two steps' worth where the tutorial skips R2). The composer picks
a block's pressures together, nearest a rise of 1 a step (`compose-ramp.ts`).

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
| R1 | 4–6 | 6–8 | X |
| R2 | 2–8 | 5–7 | X |
| R3 | 0–10 | 5–6 | X |
| R4 | 0–10 | 4–6 | X, Y alternating |
| R5 | 2–8 | 6–8 | X, slick/bulb/rock |
| R6 | 0–10 | 5–6 | X, Z |
| R7 | 0–10 | 5–6 | X, Y + one lever |
| R8 | 0–10 | 4 (3 after block 20) | X, Y, Z + a twin |

## 7. Bosses

**Decision 7 — a boss closes a block, and the bosses are spread out.** It
comes after R8, at most one per block. The owner chose on 14 October 2026 to
move the bosses rather than leave them together: each boss goes to the end of
the first block after which everything it needs has been taught — its panel,
every button on it and the hold, and every body, pod and fault it carries.
Moving a boss never moves an intro: the order new things are taught in stays
the order they ship in today.

Done, 15 October 2026, by `bun run waves:bosses --write`
(`tools/director/src/boss-slots.ts`). Three rules the decision left open,
decided then while the owner was away:

- **The tutorial arc keeps its bosses.** THE INSTAR and THE BASTION stay
  where they are, and no boss moves into the arc.
- **A boss takes the first free block** once everything it needs is taught.
  First decided as *the bosses keep their order*; the owner, 15 October 2026,
  *you can rearrange boss waves however you want*, so a block one boss skips
  (THE SPLICE waits for THE CLAW's button) is taken by the next one ready,
  and no block goes without a boss. A boss on a panel only bosses carry still
  follows the boss before it on that panel: THE HAUL after THE SCOUT.
- **A boss with no block left waits at the end**, in order — and gets a
  review block: eight regular waves with no intro, themed on the things
  taught from THE LURE on, composed by `bun run waves:review`
  (`tools/director/src/compose-review.ts`; the owner: *create all other
  waves, so that waves are distributed also between all the boss waves*).
  21 were written; 11 remain since the lessons got blocks of their own.
- **A boss comes straight after a regular wave** — the owner: *I expect to
  follow from top to bottom without spaces.* THE TWITCH and FIVE BLISTERS,
  hand-written regular waves, fold into their blocks.
- **Every lesson opens a block** — the owner: *there are a lot of waves
  introducing new concepts or enemies, which then should have waves.* A
  lesson teaches a panel or a fault: THE LANCE, THE JAM, THE CHOKE, THE
  LIMPET, THE LEECH, THE CLAW, THE CODEX, THE HANDOVER, THE FLIP, THE DARK.
  Each moved behind the regular waves of the block it came in and has eight
  of its own, carrying its fault (`bun run waves:lessons`,
  `tools/director/src/compose-lesson.ts`). THE JAM's go without the jam and
  THE CHOKE's mostly without the steer fault, which AUTO cannot play; THE
  CLAW's are on the block's panel, not the claw.

Past the arc that makes **54 blocks — 33 opened by a body or a pod, 10 by a
lesson, 11 reviews — and 54 bosses, one closing each**: 564 waves in all.

The boss table — every boss's AUTO time against the band — is in
`wave-curriculum-today.md`. AUTO plays perfectly and never talks, so the
*pair* column doubles it: that factor is a guess nobody has measured. Read
roughly: **28 bosses are short** (THE FLEET 9 s, THE VALVE 10 s, THE MANTLE
11 s), **8 are long** (THE INSTAR 343 s, PINBALL 257 s, THE BATON 177 s),
**12 are in band**, and **6 AUTO cannot finish**, so their length is unknown.

Bosses are the owner's to lengthen by hand. This plan only places them.

## 8. Lanes, once the answers are in

1. **The scorer** — built: `wavePressure`, its test, and the number at the
   end of every row of the director's wave list.
2. **The composer** — built: `bun run waves:compose`; the arc's five short
   blocks are written. A pod never comes alone (two bodies after each), and
   R7's lever is a twin across the field, of a slick, bulb or rock only, and
   R8 has one too; the rise across blocks is held (§4).
3. **Blocks** — done, 15 October 2026: every block after FINALE has its
   regular waves.
4. **The bosses moved** — done: `bun run waves:bosses` (§7).
   Review blocks in front of the 21 that waited — done the same day:
   `bun run waves:review` (§7).
5. **The today table** — built: `bun run waves:measure` rewrites it.

## 9. Answered by the owner, 14 October 2026

1. **Eight** regular waves per new thing (over six and twelve).
2. **The bosses are spread out**, one closing a block (§7), rather than the
   existing order kept with 22 bosses in a row.
3. **The 10 old regular waves count** as the first of their block's eight; the
   composer writes only the rest, and nothing hand-made is lost.
4. **A pair takes twice AUTO's time** — the boss bands of §3 stand.
5. **Waves 1–19 get short blocks** of three regular waves per basic thing
   (§4, decision 8), over keeping the arc as it is or giving it full blocks.
