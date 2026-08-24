# Wave design

> **Status: partly built.** The one-sentence test is enforced in the data
> structure and eleven waves exist. Figures, acts and the modifier system are
> design only.

**Goal:** a very long playing time made of through-composed waves with a low
density of novelty. Not constantly something new, but never filler.

## 8.1 Figures — not built

A **figure** is a hand-placed building block of 4–8 s: fixed count, fixed
starting positions, fixed paths, fixed moments. Example: "three slicks fanning
in from the left, then a meteor through the gap."

A **wave** is a fixed sequence of 6–10 figures.

**Important:** this is an authoring tool, not a generator. Nothing is assembled
at runtime. Figures are placed by hand in the editor; every wave is as
through-composed as one written individually. The gain is that wave 60 draws on
tested building blocks instead of placing single enemies again. Think of it
musically: figures are motifs, waves are sentences — a motif returns, mirrored,
faster, in another colour, and feels new although it is the same.

Today a wave is a flat list of `WaveEntry` (beat, column, kind, colour) with no
figure layer above it. Figures are the next authoring step, and
`docs/decisions.md` #8 puts the network layer before them.

## 8.2 Room for variation without new material

- **Mixture** — a meteor among slicks forces a switch between warding and aiming
- **Controls** — a pure warding wave, a pure colour wave, or a switch in the
  middle of the wave. The strongest lever: a wave that *takes away* a control
  group feels new without new material
- **Direction and density** — from below, from two sides, clustered rather than
  spread
- **The beat** — on the pulse instead of free. Changes the talking more than
  any new creature does
- **Modifiers** — echo, interference, camouflage, reversed wave, countdown,
  inverted instructions. Each one transforms a known wave completely, without a
  creature having to be drawn

> The original wrote the first two of these against free flight ("switch
> between evading and aiming", "a pure evasion wave"). The lever survives with
> `guard` in place of `dodge`, and the ten built waves already use it — see
> `SHOOT AND SHIELD`.

## 8.3 The two filters — built as a rule

- **The wave test:** every wave must be nameable in one sentence — "the one
  where you are not allowed to evade", "the one where everything comes at
  once". Waves without such a sentence are padding and get cut
- **The communication-value test:** every new creature must do at least one of:
  create new information, make information incomplete, demand new timing, allow
  a shorthand, re-interpret existing information, shift attention, or force a
  decision that is only possible together. More hit points or more speed is not
  enough

The wave test is stricter than it sounds. Realistically it carries 60–80 waves,
not 200.

Enforced: `Wave.sentence` is a required field of the data structure
(`packages/content/src/waves.ts`), and the skill at `.claude/skills/new-wave`
applies the test. `.claude/skills/new-creature` applies the second filter.

## 8.4 The ten pillars as an act structure — not built

Ten dimensions of communication, ten acts of ten waves each, one boss per act —
a hundred waves with an ordering by content rather than by counting.

| Act | Pillar | carried by | Boss |
|---|---|---|---|
| 1 | **Space** | slick, dart, meteor | Bulb Queen |
| 2 | **Colour** | bulb, crystal | Strand Nest |
| 3 | **Time** | throb, countdown | The Conductor |
| 4 | **Order** | strand, shadow, clamp | The Choir |
| 5 | **Uncertainty** | veil, doppelgänger, blind one | The Warden |
| 6 | **Rhythm** | whisperer, beat-breaker | The Heart |
| 7 | **Priority** | runt, runt cloud, colony | The Mother |
| 8 | **Negation** | camouflage, choke | The Codex |
| 9 | **Trust** | echo, symbiosis | The Echoes |
| 10 | **Future** | thread, needle | The Kernel |

The Vessel stays outside the count, as the finale.

**Two consequences:** first, it is now decided where a new creature belongs —
in the act of its pillar, not wherever there is room. Second, the Warden
moves from act 4 to act 5.

## 8.5 The shape of an act — not built

| Waves in the act | Function |
|---|---|
| 1 | introduce |
| 2–4 | vary |
| 5–7 | combine |
| 8–9 | invert (modifier) |
| 10 | boss |

**New creatures only up to about wave 50.** After that, nothing but
recombination and modifiers. That half carries for a long time precisely
because the pair has mastered its repertoire there and only execution counts.

## 8.6 How to proceed

Build the figure management first, then fill acts 1–2. After that everything
further is content rather than code. After twenty waves it shows honestly
whether forty figures come together or fifteen — in the second case the
scaffolding is not lost, only the scope is smaller.
