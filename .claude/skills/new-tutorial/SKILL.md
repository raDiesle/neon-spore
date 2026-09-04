---
name: new-tutorial
description: Write a wave's tutorial in Neon Spore — the rehearsal a guide plays, its pages, its captions and the rules the owner has already corrected twice. Use when adding or changing a guide, a scene, a rehearsal, a tutorial or the pages a pair reads before a wave.
---

# Writing a wave's tutorial

A **guide** is the screen a wave opens on. A guide that names a `scene` is a
**rehearsal**: the game's own screen at full size, playing the wave the pair is
about to meet, with the words inside the picture beside the things they
explain. `docs/spec/briefings.md` is the spec; this is the part that has been
corrected by the owner, in his own words, and it is the part that keeps getting
got wrong.

**Read all of section 1 before authoring anything.** Every rule in it was a
correction, and most of them were a correction of something that had already
been rewritten once.

## 1 · The rules, and who asked for them

### The tutorial is the game's screen, not a card over it

> *I don't want to show old cards any longer.*

No panel, no border, no scrim over a shrunken picture. Full size, the real
field, the real band, the real ship. If a change would look at home in a modal
dialog it is wrong.

### The words go inside the picture, beside their subject

> *Show the text inside the screen, in the position where it is explaining.*

A caption names a subject (`SceneAnchor`) and the drawing finds it — a body on
the field, a control on the band, the hull, the bar. **Never place a caption by
coordinate**, and never write a paragraph under the picture: the eye reading
the paragraph is not watching the thing it describes.

A caption over a *strip* stands closer to it than one over anything else
(`CLEAR_STRIP` in `guide-caption.ts`), because the strip is the bottom edge of
the ship and a box at full clearance covers the hull:

> *The box overlaps the cannon, can we move it more down, so we see the ship
> more, just some.*

### One screen at a time, and the switch is announced three ways

A step owns a `seat`. When the seat changes the picture **slides** — a cut
between two screens that look alike reads as a screen that changed by itself —
a lit seam travels with the join, and the corner plate **flares** in the
arriving seat's colour:

> *When it is switching from player 1 screen text top left to player 2 and the
> other way around, make some effect to indicate it changes.*

### The corner plate is always there and never fades

> *Do not fade in or fade out "Player 2 screen". Show it immediately and keep
> it showing all the time. Maybe top left?*

One plate, top left: `TUTORIAL` over `PLAYER n · SCREEN`, the second line the
prominent one. Nothing else. The line saying whether it was the phone in your
own hand was cut — *"one of the two screens" we can remove*.

### Every page belongs to a seat — with exactly one exception

> *Step 4/5 is useless, the game scene shows exactly the same for both players
> … so remove this. Also for future tutorials.*

and, a day later:

> *The step is missing to show that the enemy hits the ship and it loses
> health.*

Both are right about their own half. The rule that holds them together, and it
is checked by `packages/content/test/scenes.test.ts`: **a film may spend at
most one page on what both screens share** — a page anchored at `hull` or at
`health` — and every other page has to belong to a seat. A film made of shared
pages teaches a pair nothing about holding two different halves; a film with
none of them never says what the game costs when they get it wrong. Put the
shared page **last**, where it is the consequence of the pages above it.

### A page plays once and waits

> *The automatic repeat is ugly. Remove it. Instead give the user a button to
> repeat the current step.*

A page plays through and stands on its last frame for as long as the seat
reading it wants. REPLAY plays it again; NEXT moves on. Each seat has its own
cursor: *every player has their own time to go through the tutorial, and just
at the end both need to say they are ready.*

**NEXT gets louder once the page has played** — *when the animation is finished
for a step, the next must raise more attention.*

### Nothing moves before the words

> *Before the slider starts moving it should briefly stay with the text, then
> slide with the text.*

Put a page's first act about a beat and a half after the page opens. A pair
reading "move the cannon" while the cannon is already moving has been shown the
answer instead of asked the question.

### Slow enough to follow

The scene's `bpm` is 120 and pages are at least 1.5 seconds
(`scenes.test.ts`). *The animations were too fast* was the correction that got
it there; the tempo is not a place to save time, because nothing is waiting on
the end of a page.

### Captions are short, spelled out, and in the present tense

At most 28 characters (checked). The voice is

> `PLAYER 1 MOVES CANNON`

— *"p1 slide to its column" → "Player 1 moves cannon"*. Spell the player out,
say what they do, no `P1 ·` shorthand and no imperative aimed at one of the two
readers.

### The last page is the gate, and it says as little as possible

Wave number, name, sentence, then two circles. *Shorten text to a minimum.* The
name goes **under** each circle, big, clear of the ring that breathes around
it; READY goes **inside** the circle; the whole page above the bar is what a
thumb presses.

### Anything new you draw is drawn the panel's way

A grown contour out of `blobPath`, a wet socket, a film of gloss, and slime
feeding it. Never a filled rectangle with a stroke round it — that has been
corrected three times, most recently about the corner plate itself: *make the
box again so that it looks more aligned to other design graphic elements.*

### It is a real simulation, never a painting

The rehearsal is a real world stepped by the real `step` (`sim/scene.ts`). A
moment placed by hand against a clock is a second copy of where a creature
lands, and it drifts silently. If the picture you want cannot be produced by
the rules, change the entries or the acts — do not draw it.

## 2 · The shape of one

Author in `packages/content/src/scenes/<wave-id>.ts`, add the id to `SceneId`
and the scene to `SCENES` in `scenes.ts`, and name it from the wave's `guide`.

```ts
const TWO_COLOURS: GuideScene = {
  ticks: 1200,          // one turn of the loop
  bpm: 120,             // must divide tickHz — the test checks it
  seed: 1,
  entries: [ /* WaveEntry, the same seven columns every wave is written in */ ],
  acts:    [ /* { tick, control, col? } — a thumb on a control */ ],
  steps:   [ /* { tick, seat, text, anchor } — one page each */ ],
};
```

- **`entries`** are ordinary arrivals. Author the thing being taught, and
  nothing else: a page with two lessons in it teaches neither.
- **`acts`** name a `ControlId` and never a command — the seat, the command and
  where the ghost hand goes are all read off that one name, so a scene cannot
  put a thumb on a button the wave's own panel has not got.
- **`steps`** are pages. The first is at tick 0; a page runs until the next one
  begins, and the last until one tick short of the loop.

### The hand does not have to be on the panel

Three gestures are not presses on a button, and each has its own way of being
authored:

- **A grip** — a finger held on something falling — is `{ tick, grip: 1|2, col,
  until }`. The column is authored; *which body* is found by the runner at the
  moment the hand goes down, because ids do not exist when a film is written.
- **A control reached on the ship** — the cannon slid on the hull, a lift that
  carried it nowhere opening the maw, the plate dragged or pressed, the muzzle
  carried left or right for a colour — is an ordinary act with `onField: true`.
  The command and the seat are unchanged; only where the hand is drawn moves.
  `ControlDef.ship` says which swelling answers which control, and a control
  without one is refused by the tests.
- **A held cord, a string or a rope** is `{ tick, drag, col?, until, toMilli? }`.
  The seat is not authored: all three handles are the pilot's, because the
  navigator carries both colours and fires. `col` says where the body is for
  `lidString`, the one handle that is *many* — a wave may send three lids down
  at once — and the runner finds the body standing there at the moment the hand
  goes down, exactly as a grip's is found. Left out, `toMilli` is the handle's
  own taut distance, which is what a page about a cord almost always wants;
  written down, it is a pull that stops short. The carry travels over the ticks
  between `tick` and `until` rather than arriving, because the parting *is* the
  picture.

A drag has **two clocks**: `by` is when the carry finishes and `until` is when
the hand lets go. They are apart wherever a film has to act while a handle is
still held — a lid's plates shut the instant the cord goes, and the maze's
wheel unlocks on the next movement after a click.

The captions for those point at `{ at: "held" }`, `{ at: "ship", control }` and
the pod, the radar strip or a round's slab as the case may be — never at a
coordinate. `packages/render/src/caption-anchor.ts` is the list.

## 3 · The checklist

1. What **one** thing does this wave teach that the wave before it did not? If
   there is no answer, the wave carries prose or nothing — not a rehearsal.
2. Which half of it is on **which** screen? A page that either player could
   watch on either phone is the page to cut.
3. Three or four pages. Every one belongs to a seat, except at most one that
   says what a mistake costs.
4. `bun test packages/content` — the scene tests are the invariants: panel,
   ordering, page length, caption length, shared pages, tempo.
5. Look at it. `bun run preview`, drive it with `window.neonSpore`, and send
   the owner **one PNG** of the real frame with one sentence about what to look
   at. Never a description, never an SVG, never "open this and check".
