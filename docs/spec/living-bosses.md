# Living bosses — motion, THE INSTAR's body, and the director's steps

**Status: not built.** A concept, written 26 September 2026 from the owner's
message of the same day. The work it implies is on `docs/queue.md`, in the
order given at the end of this page. Nothing here is a new boss.

The owner asked for three things at once:

1. Every boss that has a body on the field keeps moving like a living
   creature — the head looks left and right, the body shifts its angle — so
   the depth reads and the boss is seen from more than one side.
2. THE INSTAR's side view is redesigned: the head does not match the front
   head, the body is too thin, and it should fly like a Chinese dragon.
3. The director shows which step of a choreography is playing, how many are
   left, and jumps to any step quickly.

What stays true from before: **the graphics look 3D, the game does not move
in 3D** (`.claude/skills/depth`), battery and frame time matter more than any
look, no library, and **a look is offered, never replaced** — every change
below that shows in a frame of the running game is built as a VERSUS
candidate beside the shipped look (`docs/versus.md`), and the owner picks.

---

## 1. Living motion, one mechanism for every boss

### What it is

A boss that is standing still in its script is not standing still. On top of
the pose its script holds, it has an **idle drift**: a slow, never-repeating
wander of four angles.

| Angle | What it does | Range | Period (wandering) |
|---|---|---|---|
| body yaw | the whole body turns a little toward one side, then the other | ±14° | 9–13 s |
| body pitch | the back tips toward us and away | ±5° | 7–10 s |
| body roll | the body rolls about its own length | ±6° | 6–8 s (THE INSTAR's `rollAt` already) |
| head yaw | the head looks left, then right, ahead of the body | ±28° relative to the body | 4–7 s |

The head **leads** and the body **follows**: body yaw is head yaw a quarter
cycle later, at half the size, through `chainAt` in
`packages/render/src/solid-motion.ts`. A head that looks right is followed a
moment later by a body that turns a little right, which is what an animal
does and what makes the turn read as intent rather than as a rotating model.

Each angle is `noise1` of time with its own seed, eased so its speed is never
more than about 12° a second. That is the **never snaps** rule, and it is
tested, not reviewed: a test samples the drift at every frame of ten minutes
and fails on any step larger than a frame's share of that speed.

### How far it reaches, by kind of body

- **A body on the rig** (`packages/render/src/solid-rig.ts`) takes all four
  angles as a real change of `view(yaw, pitch)` from
  `packages/content/src/solid.ts`. This is where the owner's *see the boss
  from different angles* is actually true: a yaw on the rig brings the far
  flank round and hides the near one, which no pose can
  (`.claude/skills/depth`, "No pose can ever bring anything out from behind").
- **A body still drawn as an outline** takes the same four numbers as a
  pose: a lean, a small squash across the turn, a head offset, and the
  surface marks moved by longitude with `pin`/`facet` from
  `packages/content/src/surface.ts`. It reads as alive, not as turning. Such a
  boss gets its real turn only when it moves onto the rig.

### Where it lives

One function in `packages/render`, a new file next to `packages/render/src/solid-motion.ts`
(call it idle-drift.ts): `idleDrift(time, seed, kind)` returns the four
angles. Nothing in `packages/sim` knows about it and `hashWorld` cannot see
it: it is the picture's alone, like THE INSTAR's weave
(`packages/render/src/instar-sway.ts`). Each boss's drawer calls it with its
own seed, so two bosses on one screen never move in step.

**Its clock is `look.time`, the wall clock**, the same as THE INSTAR's
breath (`packages/render/src/instar-profile-life.ts`): the drift is the
body's own life, and THE SLOW is shown by the weave, not by this.

**It dies down where a thumb is working.** A mark a thumb presses must be
where it is drawn. Two rules, both needed:

- The hit test goes through the same projection as the drawing, the way
  `instarMarkUnder` in `packages/render/src/instar-mark-grip.ts` already adds
  the weave. A drifted mark is found where it is drawn.
- While a window is open over marks, the drift eases to a third of its size
  over one beat, and back up over one beat after it closes. A thumb aimed at
  a mark does not chase it.

A beaten boss stills its drift over its first beats of `down`, the same way
the weave does.

### The battery budget

The owner said battery matters to him more than any look. The drift is
allowed only if all of these hold, and each is a test that exists already or
is added with the helper:

- **No new cache keys.** A yaw that changes every frame must not rebuild a
  baked sprite or a gradient every frame. Everything keyed on an angle is
  keyed on the angle stepped to a forty-eighth of a turn, as the tube light
  already is (`packages/render/src/solid-tube-light.ts`).
  `packages/render/test/baked-growth.test.ts` must stay flat with the drift
  on.
- **At most 10% more draw operations** on a boss's row in its op-count
  budget test (the `*-budget.test.ts` files in `packages/render/test/`). The drift adds a
  handful of sines per boss per frame; the cost is in what the rig redraws
  when the view moves, and that is what the budget watches.
- **Nothing outlives a frame.** The drift is a pure function of time and a
  seed; there is no state, so nothing goes in `Effects`.
- **No `shadowBlur`, no WebGL, no library.**

### Rollout order

The earlier scope (26 September 2026) held new depth work to THE INSTAR, and
named THE ANTIPHON, THE BATON, THE LEAD and THE GIMBAL as the other bodies
fit for the rig. This ask widens it to every visible boss. The order:

1. **THE INSTAR**, first and alone, with THE INSTAR redesign below: it is on
   the rig already and it is the boss the owner is looking at.
2. **The four rig candidates** — THE GIMBAL, THE ANTIPHON, THE BATON,
   THE LEAD — one lane each, each moved onto the rig and given the full
   drift. Their entries already sit on the queue as DEFERRED; this ask
   un-defers them in that order.
3. **Every other boss with a body**, on the outline tier: a pose-only drift
   through the shared helper, six bosses a lane, as a roster entry.

---

## 2. THE INSTAR, redesigned

### What is wrong today

Seen in real frames of the running game (`bun run frames . --wave "THE INSTAR"
--auto both`, 26 September 2026):

- **Two heads.** The face-on head is broad and blunt, cat-like, with two big
  slanted yellow eyes, a boxy jaw and horns curling up and out
  (`packages/render/src/instar-head.ts`). The side head is a long, low wedge,
  a crocodile's snout with one small eye and the horns flat behind
  (`packages/render/src/instar-side-head.ts`). They are two animals.
  Nothing moves between them but a crossfade over the middle of the turn
  (`instarHandover` in `packages/render/src/instar-turn.ts`).
- **A thin body.** Side-on, the chest is about 50 px across on a 390 px
  field, against a head about 70 px tall; the rear is thinner, and the tail
  is a stick of nearly one width, about 18 px, all the way to its blade. It
  reads as a snake with a dragon's head on it, not as a creature with weight.
- **One fixed angle.** The profile is drawn through `view(SIDE)` and never
  another yaw, so the side-on body is flat to us however well it is lit.
- **A flight that moves the body, not through it.** The arrival
  (`packages/render/src/instar-flight.ts`) carries the whole figure by one
  transform, `dx`, `dy` and a scale. The body is a rigid thing slid across
  the sky.

### What changes

**One head, modelled once, seen from any side.** The face-on head is the
design; the side head is replaced by that same head turned. It is built on
the rig from its own parts, each hung on an anchor
(`packages/content/src/solid-anchor.ts`):

- the **skull**, a ball, a little wider than tall;
- the **muzzle**, a short, broad tube tapering forward, about as long as the
  skull is deep — not the long wedge the side view has today;
- the **jaw**, a tube on its own anchor, pitched open for the roar and the
  fire;
- the **horns**, two curved tubes rooted on the brow, sweeping back and up;
- the **brow ridges**, two sheets (`packages/render/src/solid-sheet.ts`);
- the **eyes**, placed on the skull by longitude and latitude with
  `pin`/`facet`, so at the side one eye is full and the other has gone round
  the far side.

The thumb marks on the head stay where they are on the face-on view, which
the owner's hands already know: they are placed on the skull the same way as
the eyes, so they turn with it. The two drawings and their handover go when
the rig head is picked.

**A body with weight.** The width is read from a radius profile along the
spine rather than from the poses' top and bottom lines
(`packages/render/src/instar-profile-surface.ts`'s `bodyOf`):

| Along the body | Radius, in head radii |
|---|---|
| neck, behind the skull | 0.65 |
| chest, a quarter along | 1.05 |
| middle, between the nests | 0.9 |
| rear, over the engines | 0.6 |
| tail root | 0.45 |
| tail, three quarters along | 0.2 |
| tail tip, at the blade | 0.07 |

The chest is now as deep as the head, the body carries its weight forward,
and the tail tapers to a point instead of being a stick. Two surface marks
make the new thickness read as round: a **paler belly band** along the
underside, placed by longitude so the roll carries it, and the **dorsal
ridge** (`drawRidge`) rising a little higher at the chest. The breath, the
roll and the undulation of `packages/render/src/instar-profile-life.ts` stay
as they are, on the thicker body.

**The whole body keeps turning.** The profile goes through `view(yaw)`
with the idle drift of section 1 on top of `SIDE`: the head looks toward the
players and away, the body follows a quarter cycle behind, the near wing and
the far wing change sizes as it does. At the drift's widest the players see
a third of the way round the chest; at its narrowest a little of the back.

**It flies like a Chinese dragon.** In flight the body stops being one rigid
figure carried by a transform. Instead:

- the **head flies a path**: the arrival's line as today, plus a sideways
  wave across it and a smaller one up and down, so the head swims through
  the air;
- **every ring of the body follows where the head was**, a little earlier
  for each ring along it (follow-the-leader, `chainAt` over arc length), so
  the wave the head makes travels down the body to the tail tip;
- about **one and a half crests** show along the body at once, the wave's
  size **grows toward the tail**, from a third of a head radius at the neck
  to one head radius at the tip;
- the wave's **up-and-down half is seen in depth**: a crest that rises toward
  the players swells by the rig's lens and a trough shrinks, which is what
  makes the undulation read as through the air and not on a sheet of paper;
- the **wings beat on the crest**: one slow beat each time a crest passes
  the shoulders.

The flight is over before a mark can glow (`INSTAR_FLIGHT_ENDS` in
`packages/render/src/instar-shape.ts`), so the flight changes no hit test.
Once the body lands, the wave dies down to the undulation it has at rest over
one beat, from where it was, never by a cut.

### What goes to VERSUS

The head, the body and the flight are three candidates, each beside the
shipped look, each with its own sheet made with `bun run solid`'s pattern: the
body at five yaws, twice, and across time. The owner picks each. The shipped
look changes only when he has picked, in a lane of its own.

---

## 3. The director: which step, how many left, jump to any

**This is a tool and not a look; it lands as usual.**

### What is there today

- A choreographed boss keeps its place in its script as `cursor` on its
  state: THE INSTAR and THE NETTLE through the shared `SceneStateOf`
  (`packages/sim/src/instar.ts`), THE GIMBAL and THE FILAMENT through their
  own (`packages/sim/src/gimbal.ts`, `packages/sim/src/filament.ts`). The
  count is the length of its steps.
- The director's stage has play and pause and restart
  (`tools/director/src/stage-transport.ts`) and no step label anywhere.
- A seek already exists: the map rebuilds the world and replays it,
  headless, to a beat (`tools/director/src/stage.ts`, `stage.seek`;
  `tools/director/src/stage-step.ts`).

### What is added

**A step readout on the stage**, shown whenever the wave has a
choreographed boss: `STEP 7 / 25 · 18 LEFT`, and the step's pose name after
it where the step has one. It reads the boss's `cursor` and step count
through one small adapter per state shape — the shared scene shape covers
THE INSTAR and THE NETTLE at once, and THE GIMBAL and THE FILAMENT get one
line each. A boss added later with a `cursor` is one more adapter line, and
a test fails if a boss wave with a cursor has no adapter.

**A jump.** Beside the readout: **◀** and **▶** for the step before and
after, and a list of every step by number and pose name. Pressing one:

1. rebuilds the world and replays it headless, with AUTO playing both seats
   (`tools/director/src/stage-step.ts` already steps AUTO's commands), until
   the boss's `cursor` reaches the step asked for and its phase is the start
   of that step's morph;
2. pauses there, drawn, so the step can be looked at from its first frame.

Replays are cheap — no frame is drawn — but a late step of THE INSTAR is
thousands of ticks. So the first time a step is reached, the director
remembers the tick it began on; a later jump to it replays straight to that
tick instead of watching the cursor. The memory is dropped on restart and
whenever the wave or the build changes. A jump that cannot reach its step
within the whole wave's length stops, says which step it reached, and stays
paused there.

---

## The order the work is queued in

1. The director's step readout.
2. The director's jump.
3. The idle drift helper, with its tests, drawing nothing.
4. THE INSTAR's one head, a VERSUS candidate.
5. THE INSTAR's body with weight, a VERSUS candidate.
6. THE INSTAR turning on the idle drift, a VERSUS candidate.
7. THE INSTAR's serpentine flight, a VERSUS candidate.
8. The four rig bosses, one lane each (their DEFERRED entries, un-deferred).
9. The outline tier for every other boss, six a lane.

One and two need no screen. Three needs none either. Four to nine are
looked at, so they are local only.
