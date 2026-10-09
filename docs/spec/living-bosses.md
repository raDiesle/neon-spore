# Living bosses — motion, THE INSTAR's body, and the director's steps

**Status: in part built.** A concept, written 26 September 2026 from the owner's
message of the same day. THE INSTAR's body with weight and its serpent swim
are built (2 October 2026); the rest is not. The work it implies is on `docs/queue.md`, in the
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

**Offered (1 October 2026, VERSUS `instar:drift` / `turn`), dropped 2 October
2026.** THE INSTAR's whole side-on body drifted on the rig's yaw, pitch and
roll about its middle, the head turned on top of it from the profile toward
three-quarter and back, never away, and seven of its parts drifted on their
own — the head cocking about its neck, the jaw breathing, the eyes glancing,
each wing wandering, the tail swinging — hushed to a tenth over live marks.
Retuned the same day to reach 1.75 times the shared drift with a quick tremor
on top, on the owner's *can also increase visible movement shake of body*.
The owner, 2 October 2026: *looks worse*. The candidate went, and with it the
code that drew it (`tools/versus/DECIDED.md`); the shared `idle-drift.ts`
stays for the other bosses.

**Decided (1 October 2026, VERSUS `instar:head`, dropped).** Three organic
side-on heads were offered against the rig head; the owner kept the current
one — *all alternatives look worse* — and asked for it *altogether* bigger. So
side-on the head is drawn `SIDE_GROW` (1.3) times the body's head radius, by as
far as the turn has reached (`packages/render/src/instar-head-look.ts`); the
body, the wings and the tail keep the radius they are measured in, and the
face-on head keeps its size, for its eye and fire marks are pinned to it.

**Decided (7 October 2026, asked for by name).** The owner: *from the side
still looks ugly, it should look more 3d and head natural — overall like a
dragon — and head should look half way to player perspective and look angry.*
Side-on the head is now turned three quarters to the ship while the body
stays in profile: a skull, a snout and a jaw on its hinge modelled in three
dimensions, seen once at the turn and painted with the shipped hide, scales,
eye and horns (`instar-quarter-model.ts`, `instar-quarter-head.ts`). Both
eyes and both nostrils show, the near ones larger; the upper lids are driven
down at the snout under heavy brows, and the bridge is rucked in a snarl. It
stays a mark's ring clear of every nest, blade and patch of hide it is drawn
over (`instar-quarter-head.test.ts`). `bun run solid --instar-quarter` draws
it beside the profile head it replaced.

The same day, for *I most concern about body shape and 3d perspective*, the
side-on body grew four legs (`instar-legs.ts`): a foreleg under the chest
with its elbow back, a hind leg under the haunches with its knee forward,
each a lit tube with three hooked claws, dangling as a flying dragon's do.
The far pair hangs behind the body, higher on it and hazed toward the field,
so one leg over another gives the side view a depth it lacked. A bolt meets
them (`instar-limb-stop.ts`).

The owner again, the same evening: *improve the tail end visual to look more
cool and natural living*. The fork's two crescents of bone, which read as
shears, are fins now (`instar-tail-blade.ts`): skin stretched over three bony
rays, lit through toward its scalloped free edge, which ripples, and a hooked
barb of bone at the tip, where the crescent's point was, over the mark.

And: *can you make it that from any angle view, it's identified to be the same
drake? e.g. the tail looks different from front perspective and side*. Face-on
the body now carries the same tail out of its far end, fins and all, and the
same four legs, each sized against the girth it hangs from so the far ones are
smaller by the body's own perspective (`instar-front.ts`, `frontLimbs`). Its
tube wears the side view's hide — the rows of scales, the paler belly, the
lamps and the two rows of spines, placed round its own rings and seen from the
front (`instar-front-body.ts`) — where it used to wear the head's baked scales,
a pale grey body face-on against a violet one side-on.

**Offered (1 October 2026, VERSUS `instar:flight` / `serpent`).** While THE
INSTAR flies in, passes or crosses, a wave runs down its side-on body from
the neck to the engines: one and a half crests along it, a third of a head
radius at the neck growing to a whole one at the rear, a crest every three
beats (`packages/render/src/instar-serpent.ts`, on `chainAt`). A crest toward
the players swells the girth by up to 18%, and the wings beat once a crest on
the wave at the shoulders. It grows over the flight's first beat and dies
over its last, so the landing has nothing to snap, and a step that stays
has none. The face-on half of a flight is unchanged. Test:
`packages/render/test/instar-serpent.test.ts`; the strip:
`bun run solid --instar-flight`.

**Retuned (1 October 2026, the owner: *looks better, can also be more
movement shake of body*).** The wave is half as big again — half a head radius
at the neck to one and a half at the rear — and a crest comes every two beats
rather than three. The girth swells by up to 28%. A shiver now runs down
on top of the swim, three to the body, one every half beat, growing to a
seventh of a head radius at the rear, so the body shakes as it swims.

**Reworked (2 October 2026, the owner: *looks better. can you make it slower
and not so strong path of movement and also have it in all perspective of boss
level like this movement animation of body*).** The wave is half the first
retune's — a quarter of a head radius at the neck to three quarters at the
rear — a crest takes four beats, the body holds a crest and a quarter, the
girth swells by up to 14%, and the shiver is gone. It runs on every step now,
not only in flight: perched, standing and turning the body swims at half its
flight's size (`REST`), on the beat clock so a flight is the same wave grown
and nothing jumps at either end. Face-on it rides down the tube going back
into the dark, the neck held under the head (`instar-front-body.ts` `dive`).
It takes the weave's hush (`instar-sway.ts` `instarLive`), a twentieth while
THE SLOW is open and none once the body is beaten, so a mark on a nest stays
under its circle. The wings take the wave's beat only in flight.

**Built (2 October 2026).** The owner picked the rework from VERSUS: *add to
game "INSTAR:FLIGHT · SERPENT"*. `INSTAR_SERPENT.amount` is 1 on the field.

**Offered (8 October 2026, VERSUS `instar:flight`, the owner's *it looks
ugly when it flies in*).** Two answers for the first approach, both through
`INSTAR_FLIGHT_LOOK` (`packages/render/src/instar-flight-look.ts`), which
ships as the identity, and judged on the director's `INSTAR · FLYING IN`.
**SIDE** flies the approach in profile — the turned head, the legs under it,
the wings up — and turns face-on only over its last third. **TAPER** keeps it
face-on, but the seamed tube behind the head is one smooth taper from a deep
chest to a fine end (`instar-front-body.ts`, `smooth`), with the wings spread
full; the plates come back and the wings settle over the last 30%. Neither
reaches a mark: the flight is over before any is up. Test:
`packages/render/test/instar-flight-look.test.ts`.

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

  *As built, 27 September 2026* (`packages/render/src/outline-drift.ts`,
  offered in VERSUS as `queen:shell`, `cairn:pile` and `reprise:sac`, each
  `drift`): the roll a lean about the body's root, the turn a squash across it
  and a slide towards it, the pitch a stretch up it — **capped by reach**, so
  no point of the body moves more than a fifth of a tile and every hit test
  keeps reading the rest pose. A wide body leans less than a narrow one by
  that rule: the queen, 3.7 tiles to her torches, under 2°. It hushes to a
  tenth in THE SLOW. THE WARDEN waits for its rope to be tied through the
  pose, and the parts and the surface marks are their own entries on the queue.

  *Dropped, 27 September 2026:* all three slots, under the owner's rule of
  that day (`docs/looks.md`, *Big enough to be seen*) — capped at a fifth of a
  tile, the lean is the size he could not see on `creature:skin`. The helper
  stays at 0 until the cap is lifted: the next pose for an outline boss is
  one large enough to see, with the hit tests following it.

  *THE WARDEN, as built, 27 September 2026* (`warden-drift.ts`,
  `warden-frame.ts`): the first with the cap lifted, on the field under *a
  look with no shipped alternative*. The ring rocks about its foot, where
  the throat is cut for the shot and the rope, so the foot stays within a
  fifth of a tile and the top of the ring leans by more than half a tile, up
  to four fifths (`outlineShift`). The eye's grip, the cues written on it
  and the rope's anchor all read `wardenPosed`, so a thumb lands on the eye
  the canvas drew. The clock is the beat, because a hit test has the beat
  and no frame time. The other five are their own entry on the queue.

  *THE THROAT, as built, 27 September 2026* (`throat-sway.ts`): a lean
  about one root would part the gullet from its mouth, so it bows instead.
  The root at the top of the frame and the lowest ring, which is the
  navigator's cinch, hold still. The rings between swing across, the middle
  by more than half a tile, as a bow plus an S from the idle drift's roll
  and pitch rows. The sway lives in `rings()`, so the skin, the captions,
  THE SLOW's aim and the cinch all read the swung ring. On the field under
  *a look with no shipped alternative*. The other four are their own entry.

  *THE UNDERTOW, as built, 27 September 2026* (`undertow-drift.ts`): each
  lobe, and the body once, leans about the point where it crosses the skin,
  since the hull hides everything below that point. Each lobe takes a seed
  from its column, so a row of them sways out of step. A rising lobe leans
  only as far as it has risen. The top of a grown lobe leans by more than
  half a tile, with the cap lifted to nine tenths. Nothing is hit-tested on
  a lobe: the pin's and the free's rings stand over the column. On the
  field under *a look with no shipped alternative*.

  *THE GORGE, as built, 27 September 2026* (`gorge-drift.ts`): each lobe
  leans about its own intake, the pucker a shot goes in by, so the intake
  stays over its column. Each lobe takes a seed from its index, so the
  seven sway out of step. The top of a lobe leans by more than half a
  tile, with the cap lifted to nine tenths. The pinch's and the pry's rings
  stand in the swell of a lobe, so `gorgeGripCircle` carries them with the
  lean on the beat, and the navigator's ring round the nearest-full lobe
  is drawn in the same pose. On the field under *a look with no shipped
  alternative*.

  *THE CURTAIN, as built, 27 September 2026* (`curtain-sway.ts`): the rail
  is held and the hem swings across, the whole sheet sheared about its top
  edge the way the shove's trail already shears it. The corners swing by
  more than half a tile each way. A pose about each scallop's joint would
  move nothing that is seen, so the curtain moves as a curtain does. The
  beads stay over their columns, since a shot up a column breaks the bead
  there, and the hem's ring stands on the hem's line, which a swing across
  does not move. Only the edge it swings toward reaches out, and the
  trailing edge stays over its column, so no covered core is uncovered.
  The swing dies as the hem is gathered and stops in `out`.
  On the field under *a look with no shipped alternative*.

  *THE TASTER, as built, 27 September 2026* (`taster-sway.ts`): one gust
  runs across the fan, each blade's tip swinging a moment after the one
  before it, like wheat. A tip swings by more than half a tile, and two
  neighbours never differ by a fifth of a tile, so no two cross, since
  crossed blades are how the fan says *closed*. The sway is the lean each
  blade already had (`bladePath`), so the root stays in the crest. The
  pin, the pry and the wipe are at the root or in an empty column, so
  nothing pressed moves. Still in `closed` and `out`. On the field under
  *a look with no shipped alternative*.

  *THE SINEW, as built, 7 October 2026* (`sinew-sway.ts`): the crown and
  the collar hold still, the collar being the gauge, and the mass under it
  swings across like a weight on a rope, up to nine tenths of a tile and
  rising a little at either end. The handles ride the mass, and their hit
  test reads the same centre (`sinewMassCentre`), on the beat. Still half a
  beat into the fall, where THE SLOW asks for the handles, and once landed.
  On the field under *a look with no shipped alternative*.

  *THE SURGE, as built, 7 October 2026* (`surge-sway.ts`): the bulb rocks
  about its own middle, up to half a radian, so a flank lifts and dips by
  more than half a tile and the bulb never leaves its columns, which judge
  what it takes in and throws. The seam and its gauge roll with it; the
  grip marks ride the flanks and every reader of them is handed the same
  roll. Eased out as it everts, hushed under THE SLOW. On the field under
  *a look with no shipped alternative*.

  *THE LEDGER, as built, 7 October 2026* (`ledger-sway.ts`): both halves
  sheared together about the underside, where the cord is rooted and the
  seam's mouth opens, so the top of the plating wanders up to nine tenths
  of a tile and nothing goes up or down. One lean for both, so the gap, the
  readout, stays the same width all the way up. A bolt meets the plating
  as it leans; the FIRE word stays over the seam's column. Paid in as the
  cord roots, hushed under THE SLOW, eased out over the first beat of `out`. On
  the field under *a look with no shipped alternative*.

  *THE STARE, as built, 7 October 2026* (`stare-sway.ts`): the cowl, the
  eye, the lashes and the glass roll together about the eye's middle, up to
  0.3 of a radian, so the cowl's horns lift and dip by more than half a
  tile and the pupil does not move. The count of turns is drawn level,
  outside the roll; a bolt meets the rolled glass. Gone as the charge opens
  THE SLOW, still through the rise and the calm, back over the first beat
  of each rest. On the field under *a look with no shipped alternative*.

  *THE CYST, as built, 7 October 2026; the boss was taken out on 8 October*: each of the four
  lobes turns about the sac's middle by its own angle, up to 0.4 of a
  radian at the tip and none at the waists between neighbours
  (`cystBent`), so they sway out of step and the ring never tears; a tip
  moves by more than half a tile. The core, the freeze marks, the bud and
  the pinch zones do not move; a bolt meets the lobes as drawn. As THE SLOW
  opens the flanks and the spit lobe go still, being the step, and the top
  lobe keeps a third. Still through the split. On the field under *a look
  with no shipped alternative*.

  *THE VISE, as built, 7 October 2026* (`vise-sway.ts`): both lobes and
  the spine turn together about the hinge, up to 0.24 of a radian, so the
  case's foot wanders across by more than half a tile and the gap between
  the lobes does not change. The kernel hangs still over the middle
  column, where a shot at it is judged. Every lit step opens THE SLOW and
  a rest is a beat, so the swing keeps a third under it rather than
  stopping, and the two lobe marks ride it: every reader turns them about
  the same hinge (`viseSwung`). Clamped through a bite, still through the
  split. On the field under *a look with no shipped alternative*.

  *THE MANTLE, as built, 7 October 2026* (`mantle-sway.ts`): the shell,
  the core, the seam, the crack and the vent sheared together about the
  line the two straps are tied on, so the nose wanders up to eight tenths
  of a tile and the ties, and the knobs under them, do not move. The rings
  stand where they are answered; a bolt meets the shell as it leans. A
  tenth under THE SLOW, which every step of its story opens, and gone as
  the valves swing open. On the field under *a look with no shipped
  alternative*.

  *THE KEEL, as built, 7 October 2026* (`keel-sway.ts`): one swell runs
  along the spine, head to tail, and each segment still loose rises and
  falls on it a moment after the one before, up to six tenths of a tile,
  on top of the small rock it already had. A locked segment is rigid and
  does not heave, so the spine stills a joint at a time as the pair lock
  it. Up and down only, so every segment stays over its column. Every
  reader takes the segments from `keelSegs`, so the rings ride the heave;
  a third is left under THE SLOW, the middle two still as they hinge
  apart, and nothing once the spine is done. On the field under *a look
  with no shipped alternative*.

  *THE SPLICE, as built, 7 October 2026* (`splice-sway.ts`): the eater's
  neck lifts its head out of its hang by up to seven tenths of a tile, and
  only ever up, off the straws' top ends and the numbers under it; the sac
  out of the lower hole swings at its fat end by more than half a tile
  each way. Both roots stay in their holes, the tendrils bent and not
  moved. Nothing is pressed or shot on the eater, and the tongue starts
  from the mouth as drawn. Gone through the bite and the chew, back after
  the swallow, gone as the beaten eater pulls back; the back end's swing
  goes as its sac swells. On the field under *a look with no shipped
  alternative*.

  *THE FILAMENT, 7 October 2026*: nothing added. Its one part is the
  heart, and the heart already turns as an organ, modelled in three
  dimensions (`heartYaw`, `filament-heart-look.ts`), its face moving by
  about half a tile, the way THE ANTIPHON's, THE BATON's and THE LEAD's
  light turn was taken as their drift. A pendulum on top of it would move
  the apex every vein goes in at.

  *THE HIVE, as built, 7 October 2026* (`hive-sway.ts`): one gust runs
  along the underside, column by column, and each shut drop leans on it
  about the site it hangs from, its tip swinging across by more than half
  a tile. A breach, shot up its own column, and a scar, the count of what
  is sealed, hang still, as does a cocoon on a wall. The next site and its
  twin ease plumb over the beat before they swell, so a drop is still by
  the time a thumb is asked to pinch it. A bolt meets each drop as it leans
  (`shornFoot`, `hive-stop.ts`). A tenth under THE SLOW. On the field under
  *a look with no shipped alternative*.

  *Step 11, the mechanisms' hinged parts, 7 October 2026.* A machine's
  hinged part swings on its own pin, on the beat clock, so both screens
  see one swing, and by more than half a tile at its far end. A part a
  thumb holds or a cannon is judged by is not one of them.

  *THE HASP, as built* (`hasp-sway.ts`): a spent clasp's two half-shells
  turn together about the pin at the nose, up to a quarter of a radian,
  so the pair swings like a gate left open and its tail travels by more
  than half a tile, each clasp on its own wander. It replaces the slack
  the halves breathed by on the wall clock. A sealed clasp is still; a
  bolt meets the halves as they swing; gone as the row clears and hushed
  under THE SLOW. On the field under *a look the owner asked for by name*:
  he asked for step 11 on 7 October 2026, and the slack it replaces was on
  the wall clock, so the two screens disagreed.

  *THE PLUMB, as built* (`plumbSwing`, `plumb-pose.ts`): a loose stone
  already swung on its chain as the readout of what is still owed; it now
  swings 0.42 of a radian, so on the 1.25-tile chain it travels just over
  half a tile each way, and on the beat clock rather than each phone's wall
  clock, so the two stones the pair compare swing in step on both screens.
  A locked stone still hangs still, an asked one still steadies as it is
  held, and the press still takes a stone 0.6 of a tile past its rim, which
  covers the swing. Under *a look the owner asked for by name*.

  *THE SPOOL, as built, 8 October 2026* (`spool-sway.ts`): the casing, its
  ribs and both flanges roll together about the brake's flange, up to 0.12
  of a radian, so the far end, 5.2 tiles out, rises and dips by more than
  half a tile. The rail, its knob and the navigator's gauge are drawn off
  the unrolled pose and stay put; the line's top follows the winding, so
  it stays taut to the hull. The knob sits at the pivot, where the roll
  moves nothing, so it stays under the thumb; a hand on the brake does not
  still the roll, since a barrel stopping under a thumb would show the
  navigator the grip. The slack spool has its own turn and takes none of
  this, and it is hushed under THE SLOW. Under *a look the owner asked for by name*.

  *THE SLING, as built, 8 October 2026* (`sling-twang.ts`): after a true
  loose the two tines ring about the crotch through the rest that follows,
  mirrored like a struck fork, 0.6 of a radian at the first swing and two
  and a half swings dying to nothing as the rest runs out, so the tips
  travel more than half a tile and are still before the next step lights,
  since a tine is a seat's draw handle. Each cord, its verdict ring and the
  bolt's stop go round with their tine. An event, not an idle drift: the
  September `sling:tine` sway was too small to see. Timed off the rest's
  own beat; that a loose and not a shot or a spring began the rest is kept
  from the events, and cleared by every other end. Not hushed: the loose
  closes THE SLOW. Under *a look the owner asked for by name*.

  *Left still on purpose:* THE VALVE, since its drum carries the wheel the
  pilot turns and the socket both seats tap, and its pins are thumb-held
  and already sway as the owner picked on VERSUS `valve:pin`; THE DAVIT,
  since its hook is both seats' loose handle and the fire step's target,
  and a hook swinging off the middle column would mislead the cannons;
  and THE VANE, SCUTTLE, RATCHET and TRIVET for the reasons given
  under *A mechanism is not an animal*.

  *The parts, as built, 27 September 2026* (`outline-parts.ts`,
  `queen-parts.ts`): a part turns about its own joint by a matrix
  (`partMatrix`), its angles scaled so its tip moves half a tile, a pair
  drawn as exact mirrors. The queen's wings swing on their hinges and her
  arms on their shoulders, and the arm's swing dies as it straightens to
  let go; her claws stay still, since their opening is the drop's *when*.
  Her wings' ends are behind her torches, so what is seen of her is her
  arms: their elbows swing more than a tile, twice any other part, and at
  2.25 times the arm row's period, since a tile of swing on an arm under a
  tile long at 6 s would turn it past 20° a second — slower for a big part,
  as the weight rule says (`QUEEN_ARM`, the owner, 27 September 2026: what
  falls and the torches barely move sideways, so the arms over the wings
  and over her body). THE CAIRN's
  stones rock, each on the ones under it (`cairn-rock.ts`): its top half a
  tile from its seat, what stands on it riding along, so the apex wanders
  four fifths of a tile; every mark on a stone reads `cairnUnits` and follows.
  THE REPRISE's two cords swing about their roots on the sac as a mirror
  pair, their ends walking half a tile along the top of the screen, and its
  eye — the lens and its ring of eggs — glances half a tile about inside the
  sac, home in the middle whenever an echo plays, where the navigator's word
  and the beam stand (`reprise-parts.ts`). *Its skin, 1 October 2026*
  (`reprise-surface.ts`, offered as `reprise:skin` `turn`, **taken 2 October
  2026** — the owner: *like it, build into game*): the sac turns up to 65° on
  the outline's own yaw, its veins drawn at 0.4 and 0.07 wide rather than the
  faint 0.12 and 0.04 they had, and its veins are pinned by longitude —
  each sample's latitude its height, its longitude read off the sac's width
  there — so a turn slides them across it, fastest through the middle; a near
  vein goes over the rim and a far pair, hidden at rest, comes round. The
  gloss stays: the light does not turn. Held still, the skin draws the
  shipped curves to the pixel. *Her shell, the same day* (`queen-surface.ts`,
  offered as `queen:plates` `turn`): THE QUEEN's seams are pinned on her
  equator, each at the longitude its shipped share of her half-width gives,
  with a far pair behind the rim; the shell turns up to 45° on her outline's
  yaw, so an outer seam goes over the rim and a far one comes round. Her two
  marks ride the same turn by 9° (`QUEEN_MARK_TURN`) — a third of a tile,
  never out of the column the simulation fires up — and the drawing, the hit
  test, the cue and the caption all ask `queenTurn`, on the beat clock and
  never hushed, so the thumb finds a mark where it is drawn. Held still, the
  shell draws its shipped seams.

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
- **One number turns it down.** A `life` level from 0 to 1
  (`packages/render/src/motion-life.ts`) multiplies the part drift, and the
  body drift takes half of it plus a half. The motion setting sets it and
  nothing else (the owner left the choice to the lane, 27 September 2026): a
  device that has asked the game to be still draws its parts at their
  parents' angles and its bodies at half their lean; every other device —
  one that has said nothing, whatever its phone prefers — draws full life.
  It is one value a page, not a field of the view, because a hit test that
  finds a mark where it is drawn (`warden-grip.ts`) reads the same pose from
  a `Field` and has to agree with the drawer.

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
| THE SPLICE (the eater) | head, eyes, jaw, neck, body, rear | the neck lifts the head and the rear swings, each tendril bent from its root (`splice-sway.ts`, 7 October 2026) |
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
| THE VISE | both lobes, kernel | ready |
| THE MANTLE | core, both valves | ready |
| THE KEEL | each spine segment | ready |
| THE CAIRN | each stone | ready |
| THE FILAMENT | heart | ready |
| THE GIMBAL | the drum, nodding in its rings | shipped 3 October 2026 (`gimbal-tilt.ts`) |
| THE ANTIPHON, THE BATON, THE LEAD | none | decided 2 October 2026: their light turn is their drift |
| THE NETTLE | its bell and each tentacle | not drawn yet: its body lane builds the parts separate from the start |

**The owner, 27 September 2026, widened this:** a machine moves too —
*"something moving can also be applied for bosses which are not living like but
machine like"* — as a body, in a tilt, a turn or pieces turning, and large
enough to be seen (`docs/looks.md`, *Big enough to be seen*). The paragraph
below is the rule as it stood before that, and the swings it built are the ones
he could not see.

**A mechanism is not an animal**, and the owner's ask is for the creatures.
THE VANE, THE SCUTTLE, THE SPOOL, THE HASP, THE RATCHET, THE VALVE,
THE SLING, THE TRIVET, THE PLUMB and THE DAVIT get the part
drift only on what **hangs or hinges** — a boom, a bob, a hook, a jaw on its
bolt, a tine, a spar's tip — at half the table's range, and nothing rigid
wobbles. THE MAZE, THE FLEET and THE MIRROR have no body and get none.

*As built, 27 September 2026* (`mechanism-swing.ts`, since removed;
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
TRIVET's dangle was offered and dropped; THE VANE is left out, since its spar already whips as it swings
(`vane-draw.ts`) and its tip is the fold line the pair read.

*Dropped, 27 September 2026:* `davit:hook`, `plumb:bob` and `sling:tine` —
the owner could not see a difference on any of the three (`DECIDED.md`).
`MECHANISM_SWING` and its module were removed the same day, since no
machine lane was re-aiming it; a movement that reads would start again from
the part table (`idle-drift-parts.ts`).

The other six have nothing to add. THE VALVE's pins and THE HASP's spent
half-shells sway on their hinges already (`valve-draw.ts`, `HASP_SLACK` in
`hasp-draw.ts`). THE SCUTTLE's parts hang on threads a quarter of a tile
long at most, so even a hand's whole range moves a part under two pixels —
THE TRIVET's lesson again. THE RATCHET's pawl hinges, but it is sprung onto
the teeth and lifts on every step; a pawl that swung loose would say the
lock is broken. THE SPOOL's line is taut to the hull and its ribs ease
open on the script's clock: nothing on it hangs.

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
   *Built:* THE GIMBAL, offered in VERSUS as `gimbal:tilt` (2 October 2026):
   a shaded drum nodding inside steel rings, the cradle turning, tipping and
   rolling in its yoke, a third of it through a turn (`gimbal-tilt.ts`).
   Taken into the game by the owner, 3 October 2026.
   *Decided, 2 October 2026:* the other three keep the turn in their light
   and get nothing more. Everything they say is read by column — THE
   ANTIPHON's pits, perches and rail, THE BATON's joints and knuckles, THE
   LEAD's angle and beads — so their bodies cannot wander under it, and the
   owner judged the light turn they already have enough.
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

Retuned (1 October 2026, the owner: *each body piece looks like it does not
belong together to same body, should look like one body*). Three seams made
it read as parts: the spine began below and behind the skull, so there was
no neck; the rear was wider than the tail that stood straight up off it; and a
contact shadow marked the join. Now the spine starts inside the skull
(`INSTAR_BODY.neck`, 0.3 and 0.05 head radii off its centre), the profile is
0.5 at the neck, 1.0 at the chest, 0.88 at the middle and 0.42 at the rear,
the tail's root is 0.4 — the rear's own width — and the tail leaves along the
spine's heading before it turns up to the fork (`INSTAR_BODY.flow`, 0.8), its
seam shadow fading as it does. The candidate wears the shipped head, not the
rig's.

Reshaped (2 October 2026, the owner: *looks better but make body more natural
shape of a dragon*). One swell from the head to the rear read as a slug, with
the chest straight under the jaw. Now the profile has a dragon's line: 0.32 at
the neck and 0.4 a sixth along, so a slender neck shows under the head; 0.9 at
the chest, two fifths along over the shoulders; 0.64 at the waist; 0.72 over
the haunches; 0.36 at the rear. The tail runs 0.34 at the root to 0.17 halfway
and 0.05 at the blade, and the ridge stands tallest over the chest and lowers
by a third toward the tail.

**Built (2 October 2026).** The owner picked the reshape from VERSUS: *add to
game "INSTAR:BODY · WEIGHT"*. `INSTAR_BODY` (`instar-body-look.ts`) holds the
dragon's line and `drawBelly` (`instar-profile-surface.ts`) the belly band;
`packages/render/test/instar-body.test.ts` holds the nests on the back and the
tail's taper. The side-on view's reach grew to fit the deeper body
(`instar-reach.ts`), and the tube light's gradient cache to fit its lights
(`solid-tube-light.ts`).

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
2. plays on from there, so ▶ goes straight into the step from its first
   frame rather than stopping on a still of it (the owner, 3 October 2026).

Replays are cheap — no frame is drawn — but a late step of THE INSTAR is
thousands of ticks. So the first time a step is reached, the director
remembers the tick it began on; a later jump to it replays straight to that
tick instead of watching the cursor. The memory is dropped on restart and
whenever the wave or the build changes. A jump that cannot reach its step
within the whole wave's length stops, says which step it reached, and stays
paused there.

**Built, 29 September 2026** — `tools/director/src/stage-jump.ts` replays,
`tools/director/src/stage-jump-row.ts` is the row. The cap on a wave that
never ends is `JUMP_CAP_BEATS`; THE INSTAR's last step, from a cold start, is
about a tenth of a second.

---

## The order the work is queued in

1. The director's step readout.
2. The director's jump (landed 29 September 2026).
3. The idle drift helper, with the part drift in it, and its tests, drawing
   nothing.
4. THE INSTAR's one head, a VERSUS candidate.
5. THE INSTAR's body with weight, a VERSUS candidate (built 2 October 2026).
6. THE INSTAR turning on the idle drift, its parts moving on their own, a
   VERSUS candidate.
7. THE INSTAR's serpentine flight, a VERSUS candidate (built 2 October 2026).
8. The four rig bosses, one lane each (their DEFERRED entries, un-deferred),
   each with its parts moving.
9. The parts split out, where the part map says **split first**: the queen,
   the warden's lids, and the hanging lobes of THE HIVE, THE CURTAIN and
   THE CYST. These change no frame and can run any time after three.
   All five landed on 27 September 2026; the part map says **ready** for each.
10. The outline tier for every other creature, six a lane, body and parts
    together. Landed 7 October 2026, the last ten that day: THE SINEW,
    SURGE, LEDGER, STARE, CYST, VISE, MANTLE, KEEL, SPLICE and HIVE; THE
    FILAMENT's organ turn was taken as its sway.
11. The mechanisms' hinged parts, six a lane. THE HASP and THE PLUMB landed
    7 October 2026, THE SPOOL and THE SLING 8 October; the rest
    are left still on purpose.
12. What sets the `life` level lower: the motion setting (landed 29 September 2026).

One, two, three and nine need no screen. Four to eight, ten and eleven are
looked at, so they are local only.
