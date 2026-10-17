# The wave curriculum

> **Status: partly built.** The plan is answered (§9). Built: the ≡ press that
> shows only the regular waves, the pressure and talk scores on every row of
> the wave list (`wavePressure`, `waveTalk`), `bun run waves:measure`, which
> writes today's game measured to `wave-curriculum-today.md` beside this file,
> the composer with its talk aim (§5.1), every block, and the order of §4.1
> (`bun run waves:order`).

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

## 4. The block: one new thing, then five regular waves

**Decision 3 — every new thing opens a block of 1 + 5 waves.** Eight until
the owner, 17 October 2026: *8 waves are too much when something new is
introduced, too boring to variation and we have a lot — change it to 5.* The
block keeps Again, Reach, Pair, Recall and Peak (`BLOCK_STEPS`); Spread is
unused, and Breathe and Bend are a filler's (§7). The intro wave
teaches it, five regular waves use it, and only then does the next new thing
arrive. Equal for every block, so the pair always has the same five waves to
get good at something before being taught again.

A *new thing* is whatever `waveIntroduces` names: a body, a pod, a fault, a
panel. A boss is not a block — it closes one (§7).

**Nothing is used before it is taught** (the owner, 16 October 2026: *disallow
to use something what was not introduced before in a wave in order of wave
list*). A wave uses its keys (`waveKeys`, `packages/content/src/wave-keys.ts`):
every mechanic it carries, its panel, every button on that panel, and the
hold. The first wave in the list to carry a key introduces it, and only a
guided wave that is not a boss may — a boss introduces only what no other
wave carries, its own, guide or not. `untaughtKeys` names whatever breaks
that; `test/wave-keys.test.ts` holds the list on disk to it, and the
director's one save (`writeWaves`) refuses a list that breaks it, so no
`waves:*` generator and no drag in the editor can write one. The day it
landed it found one: THE BASTION was the first wave on STANDARD 5, handing
the pair the intake a wave before SALVAGE teaches it, and asked nothing of
it; it plays on STANDARD 4 now.

Eight was chosen to fit the owner's thousand: 56 introductions × 9 + 54 bosses
is about 560 today, and the hundred-odd new things to come make a thousand.

Each step has a job, and the order is the owner's FIRST STEP rule
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
rock, the torch, THE BLISTER's gestures, the pods, and the bosses on screen
there (THE BROOD, THE BASTION, BULB QUEEN). The owner, 14 October 2026: there, each basic thing gets **three**
regular waves, not eight — R1 *Again*, R3 *Reach*, R4 *Pair* — so the arc grows
to about forty waves and is still a tutorial. Its old regular waves (TWO
COLOURS to CROWDED, and FINALE) count among the three. TORCH's five old ones
(SHIELD THEN CANNON to CROWDED) carried no torch and ran 3 to 9 beats at up
to 14.4; the owner, 16 October 2026 — *waves below should be torch related*
— and they gave way to three composed torch waves. Slick and bulb are the
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

### 4.1 The order new things are taught in

The owner, 15 October 2026: difficulty *should also include difficulty of each
enemy, for example how often players need to talk to each other or if
something is not visible for other but needs to tell other person*; *decide on
right positions for introducing which new things*; *controls/malfunction
brushes are also more difficult in general — it should somehow toggle between
introducing which new brush category types.* Decided that day:

**Decision 9 — new things are taught in rising cost, and the categories take
turns.** A new thing's **cost** is what it adds to the two scores
(`tools/director/src/curriculum-cost.ts`): a body, its pressure weight (§5) and
the facts one arrival asks to be said (`KIND_TALK`, §5.1); a fault, the 2 it
adds to pressure and the sentences it costs while it runs (`FAULT_TALK`); a
panel, 2 and the sentences it adds to who does what (THE LANCE 1, THE CLAW 2).
A block that brings two things costs its dearer one. Blocks are taught
cheapest first, with four rules over that:

- **Bodies and levers alternate.** A lever — a fault or a panel lesson — never
  follows a lever, and once `ceil(bodies left ÷ (levers left + 1))` bodies have
  come since the last one, the cheapest lever ready comes next. So levers are
  spread through the game, about one in four blocks, never a stretch of them,
  and none left over for the end.
- **A block only after what it carries is taught**: every body, pod and fault
  in its waves, and its panel, every button on it and the hold — what
  `bossOrder` asks of a boss (§7). A body taught on STANDARD 5 that lands
  after THE LANCE is played on the full panel, so the hold, once taught, is
  never taken away again.
- **The tutorial arc is fixed**, up to FINALE, with THE INSTAR and THE
  BASTION; its last block counts as a body, so a lever may come first after it.
- **Ties keep the order they shipped in.**
- **THE HUSK comes first after FINALE**, whatever it costs
  (`FIRST_AFTER_ARC`, `curriculum-order.ts`) — the owner, 16 October 2026:
  *after root wave of "real" i suggest after to have "hollow"*. FINALE is
  the real pods' exam, so the pod that is a lie follows it, on the arc's own
  panel (STANDARD 5) and composed from the arc's bodies alone, before THE
  LANCE teaches the hold.
- **A block the composer cannot fill where it falls waits** for the next
  place the rule would give it. A hand-written regular wave goes
  behind the block that teaches the last thing it needs. After THE BLISTER,
  each of the seven gestures — TAP, HOLD, SWIPE, TURN, RUB, COMBO, LEVER — is
  a head of its own, opened by its tutorial and followed by three
  tutorial-step waves, Again, Reach and Pair (the owner, 17 October 2026:
  *each "controls" brush receive its own parent wave with introduction, then
  with around 3 each*; `waves:controls --groups`). HELLO BLISTER, which mixes
  them, plays last, before THE BASTION.

Every composed wave is written again for its new neighbours — R4 pairs with
the block before, R6 recalls three back, R1 rises from the block before's
gentlest — and every composed wave is named again where it now stands
(`compose-names.ts`). Then the bosses are placed again (§7) and the review
blocks written for the bosses left at the end, so every boss still closes a
block of its own. `bun run waves:order --write` does all of it, and a second
run changes nothing (`curriculum-order.test.ts` holds the order).

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

**A block's intro is no harder than its gentlest regular wave** (the owner,
17 October 2026). 37 intros were, each written by hand with a climax at its
end; `bun run waves:soften` pulls such an intro toward the middle column and
spreads its arrivals, as little as that takes, and
`tools/director/test/soften-intro.test.ts` holds the list to it. CATCH AND AIM
is the one exception: its red and cyan in turn cost a switch each wherever
they stand.

**Decision 6 — a step may raise pressure by at most 2** over the wave before it
in the block (two steps' worth where the tutorial skips R2). The composer picks
a block's pressures together, nearest a rise of 1 a step (`compose-ramp.ts`).

### 5.1 Talk — the number that says *more to say*

`waveTalk` (`packages/content/src/wave-talk.ts`) counts what the voices do as
pressure counts what the hands do: the facts one player must hand the other
for each arrival — where, which, something only one seat sees, a body that
moves, two jobs to agree — summed over the busiest eight beats, plus what each
running fault costs. It is the Talk column in EVERY WAVE.

**Decision 10 — a block's talk rises beside its pressure.** The composer
chooses each step's talk with its pressure (`compose-talk.ts`): R1 aims at the
block before's gentlest talk, each rising step half a fact above the step
before, R5 a fact below. A talk under its aim costs twice one over it. Talk
is an aim, not a bound: pressure's ramp (decision 6) decides which draws are
allowed, and talk chooses among them, so no block that pressure alone composes
is refused for its talk.

### 5.2 Pace — the cannon crossing the field

**Decision 11 — a fast slide is rare, and the pace slows after it.** The
owner, 17 October 2026: *one of the hardest situations is action — move fast
a long distance — action again, because the next enemy is too close behind
the other … a wave should not have this often, better rare like a special
difficulty situation, then slow down pace*; and *when unsure, wait longer for
the next enemy.* Two arrivals `d` columns apart need 2 + ⌈d ÷ 2⌉ beats
between them — the slide at two columns a beat, and two to see, say and act
(`paceBeats`, `packages/content/src/wave-pace.ts`). Three columns or more
apart and sooner than that is a **fast slide**; a twin's two arrivals are one
moment, measured from whichever is nearer the next.

- A composed wave holds **at most one**, and none in a block's Again or
  anywhere in the tutorial arc (`fastSlidesAllowed`).
- The gap after it is a **rest** of at least 8 beats.
- Where a draw would make one it may not, the next arrival **waits** until
  the slide fits (`compose-place.ts`); the paper check drops any draw that
  still breaks it (`compose-check.ts`), and `test/compose-pace.test.ts` holds
  the list on disk to it.

`bun run waves:pace <id>…` stretches a wave written before the rule — later
arrivals, the same columns. The tutorial's composed waves (RED TANGO, TORCH
ALLIANCE, SCRAP RAIN, SCRAP AND TORCH) were stretched so; hand-written intros
are their author's and were left.

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
Moving a boss never moves an intro; the order intros are taught in is §4.1's.

Done, 15 October 2026, by `bun run waves:bosses --write`
(`tools/director/src/boss-slots.ts`). Three rules the decision left open,
decided then while the owner was away:

- **The tutorial arc keeps its bosses.** THE BROOD, THE BASTION and BULB
  QUEEN (moved in on 16 October 2026, after SALVAGE's block — the owner's
  pick of the bosses that need nothing the arc does not teach) stay
  where they are, and no boss moves into the arc. THE INSTAR left it on 16
  October 2026 — the owner: *"the instar" is a boss, it should come as a
  separate new concept wave later when all basic concepts are introduced …
  before first boss to introduce by waves all the "controls" brush enemy
  waves* — so THE BLISTER's block stands before THE BASTION and THE INSTAR
  takes the first free block after FINALE, like any other boss. That was THE
  HUSK's until THE SWINDLE, the husk's own boss (the owner's shell game, 16
  October 2026), was listed ahead of it and took it; THE INSTAR closes THE
  LANCE's, every boss after it moved one block on, and the last waits at the
  end for a block still to be written.
- **A boss takes the first free block** once everything it needs is taught.
  First decided as *the bosses keep their order*; the owner, 15 October 2026,
  *you can rearrange boss waves however you want*, so a block one boss skips
  is taken by the next one ready, and no block goes without a boss. A boss on
  a panel only bosses carry still follows the boss before it on that panel:
  THE HAUL after THE SCOUT.
- **A boss fits the new thing its block brought** — the owner, 17 October
  2026, moving THE SPLICE to close SALVAGE's block (its mouth is SALVAGE's,
  on the other seat) and BULB QUEEN to a review block of three after it:
  *every list of waves of a parent — the boss should be related to the new
  thing introduced … i will later on create new bosses which fit.* Which
  block a boss is about is a table, `BOSS_ABOUT` (`boss-about.ts`), twenty
  rows drafted off each mechanic's `what` and taken as written; those bosses
  claim their blocks first, and a boss that fits none takes the first block
  left free (the owner's pick: *stay where they are*). A new boss written for
  a block is a row there. THE SPLICE took THE ECHO's row from THE REPRISE the
  same evening: the owner took it out of the arc again — a boss on a panel of
  its own stands past the basics, behind a filler (below) — and back to THE
  ECHO's block, the one it had left.
- **A boss with no block left waits at the end**, in order — and gets a
  review block: five regular waves with no intro, themed on the bodies from
  the last taught back, composed by `bun run waves:review`
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
  Each moved behind the regular waves of the block it came in and has five
  of its own, carrying its fault (`bun run waves:lessons`,
  `tools/director/src/compose-lesson.ts`). THE CLAW's panel has no shield
  and no colours, so its five are placed by a table of their own — each
  group a pod crossing in and the rocks it answers — and played on the claw
  (`compose-claw.ts`).

- **A boss never folds under a group that teaches** — the owner, 17
  October 2026: *boss waves … should not be associated with a parent wave
  list, which parent introduces something new. instead create some new
  parent wave with maybe 3 number of waves, which just reuse what we have so
  far then the boss.* Past the arc, every boss whose block opens with an
  intro or a lesson has a **filler** in front of it: three regular waves,
  Breathe, Recall and Bend, themed on the last body taught, on the panel the
  game has reached — the sawtooth's next tooth, short, rising into the boss.
  The filler's first wave heads a group of its own and the boss folds under
  it. A boss behind a review block needs none; the arc keeps its bosses as
  they are, since its blocks are the basics. `bun run waves:fillers`
  (`tools/director/src/compose-filler.ts`) writes them and moves nothing
  else, and `waves:order` writes them last; `test/compose-filler.test.ts`
  holds the rule.

Past the arc that makes **54 blocks — 33 opened by a body or a pod, 10 by a
lesson, 11 reviews — 45 fillers, and 56 bosses**: one closing every block,
and two waiting at the end. 591 waves in all, since blocks are five and
each blister gesture has three of its own (17 October 2026).

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

1. **Eight** regular waves per new thing (over six and twelve) — **five** since
   17 October 2026 (§4, decision 3).
2. **The bosses are spread out**, one closing a block (§7), rather than the
   existing order kept with 22 bosses in a row.
3. **The 10 old regular waves count** as the first of their block's eight; the
   composer writes only the rest, and nothing hand-made is lost.
4. **A pair takes twice AUTO's time** — the boss bands of §3 stand.
5. **Waves 1–19 get short blocks** of three regular waves per basic thing
   (§4, decision 8), over keeping the arc as it is or giving it full blocks.
