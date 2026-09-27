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

And, the same evening, a fourth: the parts move on their own too — the head,
the body, the hands and limbs each tilt, turn and rotate a little, and none
is ever held fixed. That is the part drift in section 1.

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

**A face looks at the players, never away** (the owner, 27 September 2026:
it should look as though it wants to fight the players' screen — more
exciting, and better graphics). Every boss with a face turns and tilts its
head toward the person holding the phone: the face's rest points out of the
screen, at the viewer, not along the field or off to one side. The head's
drift wanders *around* that rest and never carries the face past side-on,
away from the viewer; the tilt leans the face toward the screen, not up over
it. A body seen from the side — THE INSTAR — keeps its body side-on and turns
its head toward the viewer, so the eyes and mouth are seen; the "away" half
of the head yaw is folded back toward the players. The eyes' glance
(section 1, "Every part moves on its own") looks at the viewer as its rest,
not straight ahead of the body.

Each angle is `noise1` of time with its own seed, eased so its speed is never
more than about 12° a second. That is the **never snaps** rule, and it is
tested, not reviewed: a test samples the drift at every frame of ten minutes
and fails on any step larger than a frame's share of that speed.

**As built (27 September 2026, `packages/render/src/idle-drift.ts`).** The
head's yaw reaches **18°**, not 28°: a value noise of reach `a` and period
`p` can climb at `6a/p` degrees a second, so 28° at 4–7 s is up to 42°, over
the part drift's own 20° for the head and 30° for the head with the body
under it. The ceilings are the tested rule, so the reach was cut to fit them
at the slow end of the period, and the body's yaw is half the head's plus 5°
of its own to keep its ±14°. Every period in both tables is taken at its slow
end for the same reason. Tests: `packages/render/test/idle-drift.test.ts`
and `packages/render/test/idle-drift-parts.test.ts`.

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

### Every part moves on its own

The owner, 26 September 2026, after the drift above was written: the body
turning as one piece is not enough. The body, the hands or limbs and above
all the head each tilt, turn and rotate a little on their own, and none of
them is ever held still. This is for every boss with a body.

So on top of the whole-body drift there is a second layer, the **part
drift**. Every named part of a boss — head, jaw, neck, arms, hands, claws,
wings, tail, eyes, horns, antennae, lobes, whatever that boss has — gets
three small angles of its own, about its own joint:

| Angle | What it is | About |
|---|---|---|
| **turn** | the part swings to one side and back | the joint's up axis |
| **tilt** | the part nods, or lifts and drops | the joint's side axis |
| **rotate** | the part cocks, in the plane we see | the axis pointing at us |

Each part turns **at its joint, never about its own middle**: the head at
the neck, a hand at the wrist, a wing at the shoulder, a horn at its root. A
part that turned about its centre would look pinned on, which is the thing
the owner is asking to lose.

**How big, how slow.** The ranges are small and the periods are the part's
own, faster for a small part than a big one, which is what weight looks like:

| Part | turn | tilt | rotate | Period (wandering) |
|---|---|---|---|---|
| head (on top of the body drift's head yaw) | ±6° | ±6° | ±8° (the cock of the head) | 3–5 s |
| jaw | — | 0 to 4° open, never past shut | — | 2–4 s |
| neck, each link | ±4° | ±3° | ±3° | follows the head |
| arm, limb, at the shoulder or hip | ±5° | ±6° | ±4° | 4–6 s |
| hand, claw, foot, at the wrist | ±8° | ±8° | ±6° | 2–4 s |
| finger, talon, each | — | ±10° curl | — | 1.5–3 s |
| wing, at the shoulder, out of its beat | ±4° | ±5° | ±3° | 3–5 s |
| tail, each link | ±5° at the root, growing to ±10° at the tip | ±4° | ±4° | follows the body |
| horn, antenna, feeler, each link | ±4° at the root, ±12° at the tip | ±6° | — | 2–4 s |
| eyes, both together | a glance: the pupil moves up to 0.2 of the eye's radius | | | 1.5–4 s, with holds |
| a slime's lobe | — | ±4° lean | ±3° | 2–5 s |

A boss with a part not in the table takes the row of the part nearest it in
size and in what it does. No part's own motion is faster than **20° a
second**, and no point of the picture — a part's motion added to everything
it hangs on — moves faster than **30° a second**. The same test as the body
drift's samples ten minutes at every frame and fails on a larger step.

**Follow-through and overlap.** The parts are a hierarchy, and motion runs
down it late:

- **the eyes lead the head, the head leads the body.** A glance comes
  first, the head follows it a moment later, the body a moment after that.
  An animal decides where to look with its eyes.
- **the body leads the limbs, a limb leads its hand, a hand its fingers**;
  **a root leads its tip** — neck, tail, horn, antenna.
- Each child does what its parent did a little earlier and a little less,
  through `chainAt` in `packages/render/src/solid-motion.ts`, *plus* its own
  noise on its own seed. The lag is what makes the parts overlap instead of
  moving in lockstep; the own noise is what keeps a child from being a
  delayed copy of its parent.
- **Settling.** When the script moves a part — a pose changes, a strike
  lands, a gesture ends — the children overshoot and settle, a damped swing
  of the time since that step began: `A · e^(−t/τ) · cos(ωt)`, with the
  overshoot a fifth of the move, settled in about half a second. It is a
  function of the step's own clock, so it keeps no state and nothing goes in
  `Effects`, the same as the drift.

**Out of phase.** Every part draws its noise from its own seed, the boss's
seed and the part's index hashed together. No two parts of one boss move in
step: two parts that are not parent and child correlate under 0.3 over ten
minutes. **A pair is not a mirror** — the left hand and the right hand, the
two wings, the two horns correlate under 0.5 — except the **eyes, which look
the same way together**, as eyes do.

**Where a gesture owns a part, the drift lets go.** A jaw the script opens to
roar, an arm the script swings, a wing mid-beat: that part's own drift eases
to nothing over a quarter beat as the gesture starts and back over a quarter
beat after it ends, from where it was. The part layer never fights the
choreography; it fills the time between.

**Where a thumb is working, it dies down harder.** The body drift eases to a
third over a window with marks. The part drift eases with it, and a part that
**carries a live mark** eases to a tenth. The hit test goes through the part's
own transform as well as the body's, so a mark on a turning hand is found
where it is drawn, the way `instarMarkUnder` in
`packages/render/src/instar-mark-grip.ts` already adds the weave. A beaten
boss stills its parts with its body.

**How a body on the rig gets it.** Each part is already hung on an anchor
(`packages/content/src/solid-anchor.ts`). The three angles are one more
rotation of the anchor's frame, turn, then tilt, then rotate, before its
children are placed. Nothing else changes: the projection, the light and the
ordering by depth already follow the anchors.

**How an outline boss gets it.** In its draw code, each part is drawn inside
its own `save` / `translate(joint)` / `rotate` / `restore`, with the turn
shown the only way a flat part can — a squash across it by the cosine of the
angle and a shift toward the side it turned to. That is a handful of
transform calls per part per frame, and no path is rebuilt. A part that is
**baked** is rotated at the blit, never baked again; anything keyed on one of
its angles is keyed on the angle stepped to a forty-eighth of a turn, the
same rule as the body. A boss whose parts are one merged path or one sprite
has **its parts split out first**, in a lane of its own that changes no
frame: the same picture, drawn from separate pieces, each with a joint. Only
then does it get the part drift.

**In the code.** In the same idle-drift.ts as the body drift, a second
function: `partDrift(time, seed, part, parent, hush)` returns the three
angles for one part, `part` naming its row of the table above and `parent`
the angles of what it hangs on. Pure, seeded, on `look.time`, invisible to
`hashWorld`.

**Battery.** The part drift lives inside the body drift's budget, not beside
it: the **same 10%** on a boss's row of its op-count budget test covers both
layers together, and `packages/render/test/baked-growth.test.ts` stays flat
with both running. On top of that:

- **At most eight moving parts per boss**, a pair counting as two, and a
  finger row as one. A boss with more picks the eight that read — the head
  first, always.
- **Parts smaller than 6 px on a 390 px field do not move**: the eye cannot
  see it, and the frame pays for it.
- **One number turns it down.** The drawer is handed a `life` level from 0
  to 1 with the rest of the view, and multiplies the part drift by it. It is
  1 today. What sets it lower — the player's motion setting, a phone's
  battery saver, a frame that runs long — is the owner's to say, and is
  queued as a question.

### The part map

What each boss moves, read from its draw code on 26 September 2026. **Ready**
means each part is already drawn by its own function about its own point, so
it takes the part drift as a rotation there. **Split first** means a part is
drawn inside one shared path with the body and has to become its own piece,
with a joint, before it can move.

| Boss | Parts that move | State |
|---|---|---|
| THE INSTAR | head, jaw, eyes, horns, both wings and their claws, tail links, blade | ready (jaw, horns, wings and tail are already anchored) |
| the queen (a kind, several waves) | shell, both wings, both crane arms, both claws and their fingers | ready — each wing is a run of the shell's vertices with its joint at the root (`queenShellParts`, `queen-shell.ts`), laid into the one contour; each arm has its shoulder, elbow and wrist (`craneJoints`), and the claw hangs from the wrist |
| the warden (a kind) | body, eye, both hatch lids, cilia | ready — each lid is a piece with its hinge on its outer rim (`hatchLids`, `warden-eye.ts`); the two creases stay one path, stroked after both |
| THE SPLICE (the eater) | head, eyes, jaw, neck, body, rear | ready, but no part rotates yet — add the joint |
| THE REPRISE | sac, both cords, lens eye | ready |
| THE THROAT | skin, each muscle ring, mouth | ready |
| THE UNDERTOW | body, each lobe | ready |
| THE GORGE | sack, each lobe | ready |
| THE CURTAIN | membrane, hem weights, core | ready — each hem scallop is a piece with its joint (`curtainHem`, `curtain-hem.ts`), laid into the membrane's one outline for THE HIVE's reason |
| THE TASTER | crest, each blade | ready |
| THE SINEW | mass, both handles, fibres | ready |
| THE LEDGER | both halves, cord, whip | ready |
| THE SURGE | bulb, both grips | ready |
| THE STARE | cowl, eye, lid | ready |
| THE HIVE | mass, each hanging lobe | ready — each lobe is a piece with its joint (`hiveLobes`), laid into the mass's one outline so the translucent wax has no seam; a lobe swings by moving its piece before it is laid |
| THE CYST | sac, each of its four lobes, core | ready — each lobe is a run of the outline with its joint at the waist (`cystLobes`), the four splined as one ring |
| THE VISE | both lobes, kernel | ready |
| THE MANTLE | core, both valves | ready |
| THE KEEL | each spine segment | ready |
| THE CAIRN | each stone | ready |
| THE FILAMENT | heart | ready |
| THE ANTIPHON, THE BATON, THE LEAD, THE GIMBAL | as their rig rebuilds name them | the rig lane splits them |
| THE NETTLE | its bell and each tentacle | not drawn yet: its body lane builds the parts separate from the start |

**A mechanism is not an animal**, and the owner's ask is for the creatures.
THE VANE, THE SCUTTLE, THE SPOOL, THE HASP, THE RATCHET, THE VALVE, THE RIME,
THE SLING, THE TRIVET, THE PLUMB, THE DAVIT and THE GRINDSTONE get the part
drift only on what **hangs or hinges** — a boom, a bob, a hook, a jaw on its
bolt, a tine, a spar's tip — at half the table's range, and nothing rigid
wobbles. THE MAZE, THE FLEET and THE MIRROR have no body and get none.

*As built, 27 September 2026* (`packages/render/src/mechanism-swing.ts`,
offered through VERSUS as `davit:hook`, `plumb:bob` and `sling:tine`, each
`swing`): THE DAVIT's chain and hook swing about the boom's tip as a hand,
THE PLUMB's bob on its hook as an arm, THE SLING's two tines on the crotch as
a hand each, out of step. They take the row's **whole** range and not half:
half of a hand's six degrees is under three pixels at the end of a
tine, which is what the owner could not see on THE TRIVET's feet. Every step
of the three opens THE SLOW, so the swing is hushed by `slowHush` — to a
tenth on the part the window's mark is on (the hook and the bob on a fire
step, a tine on its own seat's draw), a third elsewhere — and a test holds a
mark five tiles out under a tenth of a tile a second at the tenth. THE
GRINDSTONE's jaw tremble had shipped already; THE TRIVET's dangle was offered
and dropped; THE VANE is left out, since its spar already whips as it swings
(`vane-draw.ts`) and its tip is the fold line the pair read. THE SCUTTLE,
THE SPOOL, THE HASP, THE RATCHET, THE VALVE (whose pins sway already) and
THE RIME are `docs/queue.md`'s.

### Where it lives

One function in `packages/render`, a new file next to `packages/render/src/solid-motion.ts`
(idle-drift.ts, as built): `idleDrift(time, seed, hush)` returns the four
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
  over one beat, and back up over one beat after it closes, and to a tenth
  over a part carrying a live mark. A thumb aimed at a mark does not chase it.
  THE INSTAR's weave goes further, to a twentieth over half a beat
  (`packages/render/src/instar-sway.ts` `instarHush`): the rule is a mark
  drawn moving under 0.1 of a tile a second, and at THE SLOW's quarter rate a
  tenth of that weave is still 0.17.

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
- **The part drift shares this budget.** Its own limits — eight moving
  parts, nothing under 6 px, the `life` level — are in "Every part moves on
  its own" above.
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

The part drift rides the same order: each boss gets its parts moving in the
lane that gives it the body drift. A boss whose parts are merged into one
path or one sprite first has them split out, in a lane that changes no
frame, before its drift lane.

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
  transform, `dx`, `dy`, a scale and a mirror. The body is a rigid thing
  carried round the sky: since 27 September 2026 a pass and a cross fly an
  ellipse in width and depth, far behind the field and round in front of it,
  mirrored on a lap's far half — but rigid.

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
with the idle drift of section 1 on top of `SIDE`: the head turns toward the
players and back, never away from them (section 1, "A face looks at the
players"), the body follows a quarter cycle behind, the near wing and
the far wing change sizes as it does. At the drift's widest the players see
a third of the way round the chest; at its narrowest a little of the back.

**It flies like a Chinese dragon.** In flight the body stops being one rigid
figure carried by a transform. Instead:

- the **head flies a path**: the arrival's lap as today, plus a sideways
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
3. The idle drift helper, with the part drift in it, and its tests, drawing
   nothing.
4. THE INSTAR's one head, a VERSUS candidate.
5. THE INSTAR's body with weight, a VERSUS candidate.
6. THE INSTAR turning on the idle drift, its parts moving on their own, a
   VERSUS candidate.
7. THE INSTAR's serpentine flight, a VERSUS candidate.
8. The four rig bosses, one lane each (their DEFERRED entries, un-deferred),
   each with its parts moving.
9. The parts split out, where the part map says **split first**: the queen,
   the warden's lids, and the hanging lobes of THE HIVE, THE CURTAIN and
   THE CYST. These change no frame and can run any time after three.
   All five landed on 27 September 2026; the part map says **ready** for each.
10. The outline tier for every other creature, six a lane, body and parts
    together.
11. The mechanisms' hinged parts, six a lane.
12. What sets the `life` level lower: a question for the owner.

One, two, three and nine need no screen. Four to eight, ten and eleven are
looked at, so they are local only.
