# Generated waves — how they are made, and how to use the tool

> **Status: built, 15 October 2026.** The plan and every decision behind it is
> `wave-curriculum.md`; the measured numbers of every wave are
> `wave-curriculum-today.md`. The director shows both, with this page, under
> DOCUMENTATION › WAVES.

## What it is

Most of the game's waves are **composed by a tool from waves an author already
wrote**. Nothing is generated while the game runs: the tool writes ordinary
waves into the act files once, the owner reads them, and from then on they are
waves like any other — they open in the director, any arrival can be dragged,
and the game does not know they were composed.

Today: **570 waves**. 57 bring something new (an *intro*), 60 are bosses, and
453 are *regular* — waves that bring nothing new and need no tutorial. Most of
the regular ones are composed. AUTO plays the whole game in 4 h 50 min; a pair
needs about 9 h 39 min. Past the tutorial there are **54 blocks and 56
bosses**: 33 opened by a body or a pod, 10 by a lesson, 11 reviews — and 45
fillers, one in front of each boss whose block teaches.

## The shape: a block

Every new thing — a body, a pod, a panel, a fault — opens a **block**: its intro wave, then
**five regular waves** that use it, each with one job (eight until 17 October
2026 — the owner: *too boring to variation*). Only then does the next
new thing arrive. Up to FINALE (the tutorial) a block has three regular waves,
not five. A boss closes a block — past the tutorial, behind a **filler**
(below), so it never folds under a wave that teaches.

| Step | Name | What it does |
|---|---|---|
| I | the intro | the new thing alone, centre column — written by hand |
| R1 | Again | alone, centre and its neighbours, one at a time |
| R2 | Spread | alone, columns 2–8 — no block uses it since 17 October 2026 |
| R3 | Reach | alone, to the edges, long jumps |
| R4 | Pair | with the previous block's thing |
| R5 | Breathe | with slicks, bulbs and slow rocks, wide gaps — the dip; a filler's, not a block's |
| R6 | Recall | with a thing from three or more blocks back |
| R7 | Bend | one known lever on top: a twin across the field, a fault, a faster rock; a filler's, not a block's |
| R8 | Peak | two known things, the tightest gaps, and a twin |
| ♛ | boss | the first boss whose panel and bodies the pair has now been taught |

A block is Again, Reach, Pair, Recall and Peak (`BLOCK_STEPS`).

In the director a block is **one row that opens into six**: the composed waves
are variants folded under their intro. OPEN ALL and FOLD ALL over the wave list
open or fold every block at once.

## Time — how long a wave takes

The beat is 0.625 s (96 BPM). A wave's length is its **span**, the beats from
its first arrival to its last; played time is about span + 10 beats of falling
+ 6 of rest.

| Wave | Span (beats) | Arrivals | Played, about |
|---|---|---|---|
| Intro | 8–24 | 1–4 | 15–25 s |
| R1–R3 | 24–32 | 4–6 | 25–30 s |
| R4–R6 | 32–40 | 6–8 | 30–35 s |
| R7–R8 | 40–48 | 8–12 | 35–40 s |
| Normal boss | — | — | a pair 60–120 s |
| Special boss | — | — | a pair 90–180 s |

Every wave is **measured by AUTO**, the autopilot: it plays both seats with
perfect hands and never talks, so its time is a lower bound. A talking pair is
taken to need **twice** AUTO's time — the owner's accepted guess, never yet
measured. The table under this page has AUTO's beats and seconds and a pair's
estimate for every wave, and the whole game's totals by kind.

## Difficulty — pressure

Every wave has one number, its **pressure** (`wavePressure`, in
`packages/content/src/wave-pressure.ts`): the most work inside any 8 beats.
Each arrival costs its kind's weight, more when the cannon has to travel, when
the job changes (a red after a cyan, a shield after a shot) and when two land
together; every fault adds 2. It is the number at the end of each row of the
director's wave list.

**Pace** (`fastSlides`, `packages/content/src/wave-pace.ts`) is the one
rule that is a bound, not a score: two arrivals three columns or more apart
need 2 + ⌈columns ÷ 2⌉ beats between them, or the cannon has to cross the
field fast between two actions. A composed wave does that at most once — never
in the tutorial or a block's Again — and rests at least 8 beats after it;
where it would, the composer waits instead. `wave-curriculum.md` §5.2.

Pressure counts what the hands do. **Talk** (`waveTalk`, in
`packages/content/src/wave-talk.ts`) counts what the voices do: each kind is
scored by the facts one player must hand the other per arrival — *where* (1),
a colour or a moment it does not wear plainly (1), something only one seat is
drawn at all (2), a column that changes on the way down (1), the cannon and
the shield both answering it (1) — and a wave by the most facts inside any 8
beats, plus what each fault costs to say (CODEX, HANDOVER and FLIP 3, the
others 1–2). It is the **Talk** column of DOCUMENTATION › WAVES. Measured on
15 October 2026 it follows pressure only loosely (correlation 0.56), and the
order it reads is not the curriculum's yet: VEIL, WISP and GHOST (4 each) are
taught before wave 140 while LIMPET, LEECH, BEATBOX and WEIGHT (1 each) come
after 300, and every fault is taught after wave 270. The composer does not
aim at talk yet.

Inside a block, pressure climbs in small steps:

- **R1** aims at the lower quarter of what the block's draws can reach, and
  never below **0.1 over the gentlest regular wave of the block before**, so
  the game as a whole keeps rising.
- **Each step rises 0.3 to 2** over the one before it, nearest a rise of 1.
- **R5 dips** — the breather in the sawtooth.
- **Every four blocks the steps grow**: first wider columns, then more mixed
  kinds, then, from block 24, more twins.

## How one wave is composed

1. **The pieces are copied, not invented.** Every arrival is a copy of one an
   author wrote — a *motif* — from the intro of its kind, so whatever a body
   carries (its route, its pods, what it wears) comes along.
2. **Placed by the step's rule**: its columns, its gaps (two arrivals needing
   different jobs at least 4 beats apart, 3 after block 20), its kinds, from a
   seeded random number — the same block composes the same way every time.
3. **Checked.** Span, arrival count, the gap rule and pressure against its
   target, and then **AUTO plays it**: it must clear the wave, and clear it
   without a breach at the game's own charge. A wave that fails is drawn
   again; a step that never passes stops the block rather than ship a bad
   wave.
4. **Tried again on another seed** when a block will not fit under the
   hand-written waves that follow it, and failing that, the block's own
   written waves lead and the composed ones follow them.
5. **Named.** The composer makes up every regular wave's name: the block's
   thing, read off its intro (THE LURE is LURE), and a word for its step's
   mood — R1 a dawn, R5 a lullaby, R8 a storm — so LURE RISING, LAZY LURE,
   LURE OVERDRIVE. Which word of the mood is a hash of the wave's id, so
   the same list names the same way every time; no two waves share a name,
   every one fits the HUD (20 letters, four words), and none borrows a word
   the game already means something by (`compose-names.ts`).
6. **Read before it lands.** Claude reads every block's table and sends the
   owner one picture of its maps.

## Bosses

Each boss goes to **the end of the first block after which everything it needs
has been taught** — its panel, every button on it, the hold, and every body it
carries — one boss to a block, each taking the first block still free once it
is ready, so no block goes without one. Before any of that, **a boss about a
block's new thing closes that block** (`BOSS_ABOUT`, `boss-about.ts`; the
owner, 17 October 2026). A boss on a panel only bosses carry
comes after the boss before it on that panel (THE HAUL after THE SCOUT). The
tutorial keeps THE BROOD, THE BASTION and BULB QUEEN (after the review block
that follows SALVAGE's) where they are, and no boss on a panel of its own
stands in it — THE SPLICE closes THE ECHO's block, behind a filler. THE BLISTER's
gestures stand before THE BASTION; THE INSTAR closes the first block after
it. The last 12 bosses
close a **review block** (below). Every boss has five regular waves in front
of it and comes straight after one. A boss's length is the owner's to adjust by hand: the boss table
in `wave-curriculum-today.md` marks each one short, in band or long.

## Lesson blocks

A **lesson** is a wave that teaches a panel or a fault rather than a body:
THE LANCE (the hold), THE JAM, THE CHOKE, THE LIMPET, THE LEECH, THE CLAW,
THE CODEX, THE HANDOVER, THE FLIP, THE DARK. Each opens a block of its own:
it stands after the regular waves of the block it came in, with the guided
waves that follow it (THE PURGE after THE LANCE, THE LEAK after THE
HANDOVER), and five regular waves are composed after it from the bodies of
that block, on the lesson's panel, **every wave carrying the lesson's fault**.

Two exceptions, both because AUTO cannot play them: **THE JAM's** waves go
without the cannon jam, and **THE CHOKE's** carry the steer fault on three of
eight. **THE CLAW's** are on the block's own panel, not the claw: on the claw a
rock is cleared only through a pod the arm takes, which the steps do not place.

Their names are made up like every other (step 5): JAM DAWN … DARK INFERNO.
`bun run waves:lessons --write`
does all of it, places the bosses again and drops a review block at the end
that no boss closes any more; run a second time it changes nothing.

## Review blocks

A **review block** is a block with no intro: five regular waves in front of a
boss that had no block of its own. Its **theme** is a thing the game already
taught, in the order it was taught from THE LURE — LURES RETURN … LURES
SUMMIT before THE HASP, THROBS RETURN … before THE RATCHET, and so on to the
crawlers before THE HYDRA. It is composed with its theme block's own five
steps, one notch further on, on the panel the game has reached, and starts a
little above the gentlest wave of the block before. Its first wave (RETURN)
is not a variant, so the director folds the other four under it.

Their names are made up from the theme's word (step 5) — a review of the
ghosts is OUTER GHOST, GHOST LEGEND. A new boss written later gets one with
`bun run waves:review --write`.

## Fillers

A **filler** is three regular waves between a block and its boss — the
owner, 17 October 2026: a boss should not sit in a group that *introduces
something new*, but in a short group *which just reuses what we have so far,
then the boss*. Its steps are Breathe, Recall and Bend: down from the block's
Peak to the oldest basics, something from far back, then one known lever into
the boss. Its theme is the last body taught, on the panel the game has
reached. Its first wave is a head and the other two variants, so the director
folds them and the boss under it; boss placement reads it as the end of the
block before, not a block of its own. A boss behind a review needs none, and
the tutorial's bosses have none. Ids start `filler` and the boss's name
(`fillerGaugeBreathe`); names are the block's word, like a review's.


| Command | What it does |
|---|---|
| `bun run waves:compose <intro id>` | Composes a block's regular waves and prints the table: step, id, span, arrivals, pressure, AUTO's time. Writes nothing. |
| `… --write` | Writes them after the intro, with the names the composer made up. `--names "…"` names them by hand instead, in order — one string, the names split by a vertical bar; `--seed N` draws again. |
| `bun run waves:names [id …] [--write]` | Names every regular wave again, or only the ids given, and prints each name that changes. A name chosen by hand is overwritten by a run over every wave. |
| `bun run waves:review [--count N] --write` | Composes the next review blocks, each in front of a boss waiting at the end, named from its theme. |
| `bun run waves:fillers [--write]` | Composes a filler in front of every boss that still closes a block which teaches. Nothing else moves; `waves:order` writes them too. |
| `bun run waves:lessons --write` | Moves every lesson behind its block's waves, composes its five, places the bosses again. |
| `bun run waves:bosses --write` | Moves every boss to its block. Run after a block is written. |
| `bun run waves:measure` | Plays every wave with AUTO and rewrites `wave-curriculum-today.md`. |
| `bun run briefings:renumber` | Puts today's wave numbers into `briefings.md`, which names waves by number. |

**A new creature, start to finish:** write its intro wave by hand in the
director → `waves:compose <its id>` → read the table → `--write` →
`waves:bosses --write` → `waves:fillers --write` → `waves:measure` →
`briefings:renumber` → commit.

**Changing a composed wave:** open it in the director and edit it like any
other. Nothing composes over it: the composer only writes the steps a block
is missing.

## Where the code is

| File | What it holds |
|---|---|
| `tools/director/src/compose-steps.ts` | the eight steps, the five a block uses, and their rules |
| `tools/director/src/compose-block.ts` | reading a block off the wave list |
| `tools/director/src/compose-ramp.ts` | choosing a block's pressures together |
| `tools/director/src/compose-grow.ts` | how the steps grow every four blocks |
| `tools/director/src/compose-place.ts` | placing arrivals for one step |
| `tools/director/src/compose-check.ts` | the checks, AUTO included |
| `tools/director/src/compose-review.ts` | review blocks: their theme, place and floor |
| `tools/director/src/compose-filler.ts` | fillers: the three waves between a block and its boss |
| `tools/director/src/compose-lesson.ts` | lesson blocks: the move, the panel, the faults |
| `tools/director/src/compose-names.ts` | every regular wave's name, and its words in `compose-names-moods.ts` |
| `tools/director/src/compose-starts.ts` | where a block starts, of every kind |
| `tools/director/src/boss-slots.ts` | where each boss goes |
| `tools/probe/measure-waves.ts` | the measured table |
| `packages/content/src/wave-pressure.ts` | pressure |
| `packages/content/src/wave-regular.ts` | what makes a wave regular, what it introduces |
