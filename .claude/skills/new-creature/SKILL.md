---
name: new-creature
description: Add a creature to Neon Spore — control-visibility entry, state machine, parameters, preview and replay test. Use when adding, changing or removing a creature type, enemy or bestiary entry.
---

# Adding a creature

Work through this in order. Stop at step 1 if the test fails — a creature that
does not change what the two players have to say to each other does not belong
in the game, however good it looks.

## 1. The communication test

The creature must do at least one of these:

- create new information
- make existing information incomplete
- demand new timing
- allow a shorthand between the players
- reinterpret information already on screen
- shift attention
- force a decision only both together can make

More hit points or more speed is not one of them. Write the answer into the
`blurb` field — one sentence, in the creature's own terms.

## 2. The rows: eight the compiler names, and the ones only a test does

A creature is a name in eight tables before it is anything else, and the
compiler names every one of them. Take them in this order, because each later
one wants the name to already exist.

| # | File | What you add | What catches you |
|---|---|---|---|
| 1 | `packages/sim/src/creature-kinds*.ts` | the name, in the union of the file it belongs to (standing, handed, many, fixtures) | `KindsAreExhaustive` (`kind-code.ts`) |
| 2 | `packages/sim/src/creature-roster.ts` | the name **appended** to `CREATURE_KINDS` | `satisfies` there |
| 3 | `packages/content/src/creatures-table.ts` | the `CREATURES` row: `kind`, `controls`, `color`, `blurb` | `Record<CreatureKind, …>` |
| 4 | `packages/content/src/mechanics-table.ts` | the `MECHANICS` row — what the thing *is*, one sentence, at most 30 words | `satisfies Record<MechanicId, …>` |
| 5 | `packages/content/src/living-look.ts` | its contour and own-motion, or `null` | `satisfies Record<CreatureKind, …>` |
| 6 | `packages/render/src/comms-talker.ts` | its `TALKER` seat, or `null` | `satisfies Record<CreatureKind, …>` |
| 7 | `packages/render/src/duty-words.ts` | the siren's word for each seat, or `null` where `TALKER` is `null` | `satisfies Record<CreatureKind, …>` |
| 8 | `packages/content/src/waves-demo.ts` | `DEMONSTRATIONS`: the wave that shows it | `Record<MechanicId, …>` |

**Then the ones only `bun run check` names.** Each of these keeps a list of
its own, and the compiler does not see it. Found by adding a throwaway kind and
running the whole check (8 October 2026), so this is the list as it stood then:

| File | What you add | What catches you |
|---|---|---|
| `docs/spec/bestiary.md` | its name in the Categories table | `content/test/categories.test.ts` |
| `packages/content/test/creatures.test.ts` | its name in `categoryOf`'s special list, if it is special | that file |
| `packages/content/test/mechanics.test.ts` | its name in the nameable kinds | that file |
| `tools/director/src/brush-cards.ts` | its `SHORT_NOTE`, and `cardSubjects` | `director/test/brushes.test.ts` |
| `packages/hands/src/autopilot-touch.ts` | how AUTO answers it, if no control on a panel does | `director/test/autopilot-field.test.ts` |
| a wave in `packages/content/src/waves/act-*.ts` | the wave of its own (§5) — named in row 8 | `orphans.test.ts`, `waves-demo.test.ts`, `waves.test.ts` |

**And the ones its own make-up owes**, which a probe kind with nothing of its
own never meets:

- **a field on `SimConfig`**: named in a document (`doc-drift.test.ts`), and a
  card in `tools/director/src/ship-fields.ts` with its group in
  `ship-groups.ts` and its note in `ship-notes-hidden.ts`;
- **a field on `SpawnEntry`**: copied by `content/src/queue.ts`, typed in
  `wave-entry.ts` and written back by `tools/director/src/serialize-entry.ts`
  (the director's wave-save round trip);
- **`null` in `living-look.ts`**: an `EXCLUSIVE` row in
  `render/src/creature-body.ts`, or the body asks at runtime for a contour it
  has not got — no compiler and no test catches that until a frame does;
- **a placeholder look**: its name in `LOOK_PENDING`
  (`render/test/pixel-frame.test.ts`) until the look lane;
- **a body that stands rather than falls**: `resolveHull` (`sim/hull.ts`)
  breaches anything on the hull row a beat later, and `beat.ts` stops stepping
  it there — both need the kind named;
- **a new wave and a new film**: the counts in `docs/spec/briefings.md` §1 and
  §3.2, and a film page of at least 1.5 s with the body near mid-screen
  (`scene-pages.test.ts`).

**Rows 5 and 6 take `null` as a real answer, and `null` is a decision.** A kind
gets `null` in `living-look.ts` when it is drawn as something else — a crystal,
a boss with its own draw path, or a body it *wears* (resolve that with
`wornKind`, never with a second silhouette; for a lure a shape of its own is a
tell, not a drift). It gets `null` in `TALKER` when both screens see the same
thing and neither player has to speak. Both used to be lookups ending in a
default, so a forgotten kind was drawn as a slick that swayed like one, or
never lit its siren, and nothing anywhere said a word. They are total now,
which is why they are on this list at all.

`controls` names the groups a wave containing this creature must be able to
answer — `ControlGroup` is aim and guard, *the two things a wave may be
missing*, and a handle drawn on the field is neither. Never edit a wave to make
a creature work: a wave names one whole panel and the union is checked against
it. `packages/content/test/waves.test.ts` is where that check lives, so putting
a guard creature on a shield-less panel is a red `bun run check` rather than
something the pair is shown and cannot answer.

`color` is **one** colour, and it comes with **one** silhouette: the pair say
these things out loud across a voice delay, so a shape must mean the same word
every time. Two colours of the same shape is not two creatures. A free
silhouette is spent on a creature that *behaves* differently — and then it has
to look clearly different, not merely differently tinted.

## 3. Rules in sim, appearance in render

Behaviour goes in `packages/sim`. It may only use integers, the tick counter and
the seeded rng. Appearance goes in `packages/render` and may not decide anything.

If the creature needs a per-creature field, add it to `Creature` in
`packages/sim/src/types.ts` and to `hashWorld` in `hash.ts` — a field missing
from the hash is a field that can silently desync two devices.

**A handle the players pull is never drawn fresh.** Every boss and every wave
wears the same three pieces (the owner, 25 September 2026, generic;
`.claude/skills/new-boss/generic.md`): a thin channel along the travel that fills
green behind the hand (`drawPullTrack`, `render/src/pull-track.ts` — a track
builder beside `tether-track.ts` is all a new one writes), a big circle to start
(`drawPullKnob`, `render/src/pull-knob.ts`), and a press answered at the knob's
radius times `PULL_GRAB`. A turn with no end gets a closed ring round what it
turns. A handle *held* rather than pulled keeps its ring.

**Which pieces a creature wears is `docs/controls-catalogue.md`.** One answered
by the standard set — the band, the cannon, the shield, the grip — wears **no
helper**: the guide taught it once (the owner, 29 September 2026, generic).
One destroyed by a gesture of its own wears the full set a boss's mark does.

## 4. Timing

If beating the creature needs a spoken exchange, it needs **at least 4 seconds**
from becoming visible to impact, better 5–6. At the default config a creature
takes `rows` beats, roughly 9 s. Anything faster must work without an
announcement.

## 5. A wave of its own, and a guide inside it

**A creature nobody is introduced to is a creature nobody learns.** Every kind
on the field today arrives this way and the pattern is not written down
anywhere else, so it is written here: a new creature gets **one wave that is
about it** and **a guide written inside that wave**. Shipping a creature means
both. A creature nobody can play is not shipped, and a wave that introduces
something with nothing said about it is a wave the pair reads by guessing.

**The wave.** One entry in one of `packages/content/src/waves/act-*.ts`,
passing the one-sentence test the way any wave must — the sentence is said in
the commit, never stored on the wave — and THE RUNT's is *"The one where a shot
that lands is the mistake"*, ON THE BEAT is *"The one where firing on sight is
the miss."* Both name the **mistake the creature exists to punish**, not the
creature. That is the test: if the sentence describes the body rather than what
the pair now has to do differently, the wave is a display case and not a
lesson.

A wave about one creature is usually one entry, and not always. THE RUNT
carries a second, ordinary target beside it, because a body defined by *not*
shooting it teaches nothing with nothing else on the field to shoot. Ask what
the creature is defined **against**, and put that in the wave if the answer is
not "the empty field".

**The guide.** A `guide` on that same wave, written directly under
`name`, and it is **a film**: `guide: { scene: "<sceneId>" }`, a rehearsal of
the wave on the game's own screen, authored the way `.claude/skills/new-tutorial`
says. Its captions carry the split — what each seat does about the thing, on
that seat's own screen — and a film whose two seats are shown doing the same
thing has not understood the game. It carries no words beside it
(`WaveGuide`, the owner's 25 September 2026: not both).

Say what the *wave* is about, not what the creature is in the abstract. The
abstract sentence has its own home — the `what` row in
`packages/content/src/mechanics-table.ts`, which the bestiary reads — and a
guide that repeats it has spent the pair's attention saying something the
field is about to say by itself.

**This one is enforced.** `packages/content/test/waves.test.ts` walks the wave
list in order and fails when the first wave to carry a new kind has no guide.
It fails the other way too, so do not add a guide to a wave that introduces
nothing — that is padding, and it is the same failure as padding a wave with
entries. `mechanics-table.ts` is the other half: a kind added to the
simulation and not to that table is a type error there.

## 6. Replay test

Add a replay in `packages/sim/test/` that spawns the creature and plays the
inputs that beat it. Assert what the creature *does* — it died on the beat it
should have, the wave was lost or held the way it should —
and then that the run fingerprints the same twice.

**Do not pin the fingerprint as a constant.** Nothing in this repository does,
and `docs/decisions.md` #19 says why: every legitimate change to `hashWorld`
moves every pinned number at once, so the maintenance move is "re-pin them,
the change was intended", which is the exact motion that blesses a real
regression. Two runs compared in one process prove the property that matters
for lockstep — the two phones are on the same build.

Then run:

```
bun run check
```
