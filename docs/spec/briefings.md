# Briefings

> **Status: planned, nothing built.** This is the plan `docs/spec/structure.md`
> promises under "New creature types get a short animated preview" and never
> specified. Read it before writing any of it; the first block is meant to be
> built alone, shown, and approved before the second one exists.

A **briefing** is an animated demonstration with words, shown before a wave
that asks something new of the pair. It stops the field, plays a short loop of
the thing being taught, says what each of the two devices has to do about it,
and gets out of the way. Either player can skip it.

## The rule it is built on

A briefing is **placed, never triggered**. The game does not watch the queue
and guess that a meteor is new; a wave names the blocks that run before it, and
moving that wave in the director moves its teaching with it. Anything else goes
wrong the first time a wave is reordered — the rock gets taught on wave 9,
three waves after the rock arrived, and nothing complains.

The second rule is the game's own: **neither player is told the other's half.**
Every step carries three lines — one both screens read, and one for each
device. A briefing that puts all of it on both screens has taught the pair that
they do not need to talk, which is the one thing the game cannot survive.

---

## 1 · What has to be taught

Everything below is *built* today. The right-hand column is where the block
goes; the wave list is `packages/content/src/waves.ts`.

| # | Block | What is new | Who holds what | Before wave |
|---|---|---|---|---|
| 1 | **The opening** | two devices, one ship; the beat; the cannon | see §2 | 1 · FIRST STEP |
| 2 | **The two colours** | red answers red, cyan answers cyan; a wrong colour is *spent*, not missed | p1 the column, p2 the colour | 2 · TWO COLOURS |
| 3 | **The rock** | cannot be shot; shield in the column **and** triggered at contact | p2 slides, p1 triggers | 4 · THE ROCK |
| 4 | **The torch** | two columns wide, the fastest thing in the field, and only on p1's strip | p1 sees it coming, p2 must cover both columns | 6 · TORCH |
| 5 | **The pod** | shooting it loose is half of getting it; then it sinks and drifts | p2 frees it, p1 chases and opens the maw | 11 · SALVAGE |
| 6 | **The queen** | two marks, one real; she opens for two beats; a torch drops every eight | p1 sees *what*, p2 sees *where* | 13 · BULB QUEEN |

Six blocks, twelve or so steps. That is the whole built game.

### Gaps this list exposes

Worth knowing before authoring, not worth blocking on:

- **Pod kinds.** `mend`, `purge` and `ward` land three different receipts
  (`+HULL`, `SWEPT`, `WARDED`) and no wave places anything but `mend`. When a
  wave places one, it needs a block.
- **Rock speed tiers.** `meteorMedium` … `meteorFastest` are brushes in the
  director and appear in no wave. A tier that ships needs one line, not a block.
- **The hull, the score, the balance sheet.** Never explained anywhere. The
  opening should name the hull bar; the sheet is after the run and is its own
  question.

---

## 2 · The opening, in detail

The one that matters most, because it is the only one shown to a pair who have
never played. Three steps.

**Step 1 — "Neither of you sees all of it."**
Picture: two phone outlines side by side, showing genuinely different things —
a mark on the left one's strip, a shield and two colour buttons on the right
one's. A pulse travels from one to the other.
Both: *One ship, two screens — and the two screens do not show the same thing.
What is coming is on one of them; the control that answers it is on the other.*
P1: *Yours is the cannon, the shield's trigger and the maw.*
P2: *Yours is the shield itself, and the two colours.*

**Step 2 — "Everything falls on the beat."**
Picture: the field, creatures stepping down one row per beat, the four HUD dots
lighting in time, the hull bar at the top right.
Both: *One row per beat, on the four dots you both watch. That is what makes a
sentence like "it lands on the fourth" something the other one can act on.*
P1: *Dead rock announces itself on your strip, before it is on the field.*
P2: *Living creatures announce themselves on yours.*

**Step 3 — "The cannon fires straight up."**
Picture: a red slick in a column; a hand drags the cannon strip until the lobe
is under it; a colour button presses; the shot goes up; it pops.
Both: *It slides along the hull and never aims sideways. Standing in the column
is the whole of aiming — and the one who stands there is not the one who
shoots.*
P1: *Drag your strip until the cannon is under it. Say the column.*
P2: *Press a colour. Nothing leaves the hull until you do.*

The voice channel itself is **not** explained here — that belongs to the menu,
before a room is even joined, and is being written separately.

---

## 3 · What is required

### 3.1 Data — `packages/content`

- `briefings.ts`: the catalogue. A `Briefing` is `{ id, title, category,
  summary, steps }`; a `BriefingStep` is `{ scene, title, say, p1, p2 }`.
- `scene` names one of a **closed set** of animations. Placing and rewording a
  block is authoring; adding a new picture is a change to `render/`. Closing the
  set is what keeps the director honest — it can only offer what exists.
- `Wave.briefings?: BriefingId[]`. Ids are stable: renaming one is a migration,
  because the id is also what the "already seen" set remembers.
- Purity applies unchanged — it is content, so no clock, no randomness, no DOM.

### 3.2 The animations — `packages/render/src/briefing/`

The load-bearing requirement: **the demonstration is drawn with the game's own
geometry, not a diagram of it.** A briefing that shows a simplified hull teaches
a shape the game does not have, and goes on being wrong until somebody changes
the lobe.

Concretely, that means splitting the tile-and-hull part of `Layout` out as a
`Field` (`tile`, `gridLeft`, `gridTop`, `gridWidth`, `gridHeight`, `hullY`) so a
few-hundred-pixel panel can be one, and `hull-frame.ts` can sample the real
membrane inside it. Everything else — creatures, rocks, pods, bullets, the band
strips — already draws from column and row.

Each scene is a pure function of `(ctx, panel, t, role)`. No state, so the same
scene can be stepped by the game loop, by the director's preview, and by a
test, and look the same in all three.

Scenes needed: `hail`, `field`, `cannon`, `colour`, `rock`, `torch`, `pod`,
`queen`.

### 3.3 Playback

- A `BriefingPlayer` in `render/`: which step is showing, how long it has been
  up, `next()`, `skip()`, `done`. Presentation state, driven by `dt`.
- `ViewState.briefing` carries it into `Canvas2DRenderer.draw`, which paints it
  over everything else.
- The overlay owns its own hit areas (NEXT, SKIP) and exports them, so input
  hit-tests exactly what was drawn — the same rule as `Layout`.
- Keyboard: space/enter advances, escape skips.

### 3.4 Where it hooks into the game

After `startWave`, before the world is allowed to tick. The wave is then frozen
on its first beat behind the overlay, which is exactly the right picture. The
tick gate is a new flag, not `running` — `running` is the pause overlay and
already means something else.

### 3.5 Two devices

`docs/spec/structure.md` calls for a "both ready" signal. **Delayed lockstep
already is one:** a device holding a briefing sends no commands, so the other
one cannot advance past the input-delay window whatever it does. No protocol
change. The one visible consequence is that the link chip will read `STALLED`
while one player is still reading — worth suppressing while a briefing is up,
and worth deciding rather than discovering.

### 3.6 Seen once

Persisted in `localStorage` in `apps/game`, keyed by block id — never in
`content` or `render`. Spec 7.1 already says the save carries "the previews
already seen". The test rig needs a way to forget them, or every session after
the first is testing nothing.

### 3.7 The director

This is the half the request is most specific about: **a fixed block of
category description you can move to the right place before a specific wave.**

- A panel in the WAVE tab listing the catalogue grouped by category, each block
  a toggle: on this wave, or not. Order within a wave is the catalogue's.
- A mark in the wave rail, the way `♛` marks a boss wave, so placement is
  visible without opening every wave.
- `serialize.ts` writes `briefings: [...]` back into `waves.ts`, after `hint`.
  The round-trip test covers it.
- `refuse()` rejects an id that resolves to nothing, so a hand edit cannot be
  saved into a wave that teaches nothing.
- **A PREVIEW button on the stage.** The director is where these get judged, so
  it has to be able to play one. Without it every review is a round trip through
  the game.

### 3.8 Tests

- `content`: ids unique, every `Wave.briefings` entry resolves, no step with an
  empty line.
- `render/test/frame.test.ts`: every scene, every role, through the strict
  canvas stub. Anything drawn is drawn there — the convention is not optional.
- `render/test/restart.test.ts` is unaffected: a briefing holds no state that
  outlives a wave. It must stay that way.
- `serialize.test.ts`: round trip with and without `briefings`.

---

## 4 · Order of work

1. **The machinery, with one block only** — the opening, three steps. Data
   shape, `Field`, the three scenes, the overlay, the game hook, the director
   panel and its preview. Ship it and look at it.
2. **Approve or rework the opening.** This is the step the whole plan is shaped
   around: the first block is the one that decides what the rest look like, so
   nothing else gets authored until it has been seen and agreed.
3. **The remaining five blocks.** By then they are authoring, not building.

Deliberately not in scope: figures (`wave-design.md` 8.1), an unlockable
bestiary screen, and anything that reads a microphone — rule 4 stands.
