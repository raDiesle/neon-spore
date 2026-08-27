# The same two games, read at boss scale

> **Status: none of it built, none of it accepted.** The second half of
> [transfers](transfers.md), which read Spaceteam and Lovers in a Dangerous
> Spacetime for the whole game and promoted five things, **none of them a
> boss**. This page is that gap filled in: what the two games do with a big
> body, what of it the three worked-out bosses already spend, and what is left.

A boss is where a shape is actually spent. A creature is one silhouette that
has to survive being named out loud at 26 px; a boss is a body across a third
of the screen, with phases, that has to say how far in you are without a bar.
Both reference games put their best pictures at that size, so it is the one
place where "what does it look like" and "what does it do" are the same
question.

## The filter, on top of the other five

[transfers](transfers.md#the-filter) lists what any idea has to survive. Three
more apply only here, and all three are already written down somewhere else:

1. **A fourth boss asks a fourth question.** The Queen is about *what you
   know*, THE MIRROR about *what you remember*, the Warden about *what your
   hands are free to do* — and [bosses](bosses.md#114-the-warden--the-eye-that-takes-a-hand-off-you)
   says plainly that a second boss built on the Queen's coupling would be a
   re-skin. That sentence is the filter.
2. **A boss holds a row, or it is a fixture.** Nothing traverses the field, the
   bosses included: the Queen paces one row, THE MIRROR hangs at the top, the
   Warden never moves at all.
3. **Its health is its silhouette.** Petals, plates, a pupil that ends up
   permanently wide. No bar, ever.

## Spaceteam has no boss, and that is the finding

It escalates instead. Panels break and are replaced, instructions arrive
faster, and the climax is the ship coming apart under the two of you.

Held against the Warden, that whole arc is **already spent, and spent better**:
a control frozen for a cycle while the only person who can free it is the other
one is Spaceteam's broken panel with an owner attached. Spaceteam breaks a
panel and hands the pair a worse machine; the Warden breaks a panel and hands
one player a job.

What is left is the **wormhole** — the single event in that game that changes
what a *word* means rather than what a hand can reach. Nothing here does that,
and the slot for it already exists and is already named. **The Conductor (30)**
was deferred rather than rejected because a boss that bends the shared beat
attacks the wall that lets speech survive a two-second delay
([ideas](ideas.md#deliberately-deferred), [latency](latency.md)) — and the
deferral says in as many words that the slot keeps the name, and that anything
built there should bend something else. Bend the field instead of the tempo.
That is **THE VANE**, below, and the pendulum arm drawn for the Conductor is
already the right picture for it.

## Lovers has real bosses, and three of their four tricks are spent

| What its bosses do | Here | Left to take |
|---|---|---|
| A multi-part body that comes apart and re-forms | **THE CHOIR**, drawn as a `cluster` that now genuinely parts | nothing — the drawing caught up while this was being written |
| Armour that visibly sheds, phase by phase | the Warden's plates, the Queen's petals — built | nothing |
| A weak point that opens where your shield is *not* | nothing does this | **THE TITHE**, now with a body |
| A body assembled from the level's own hazards | nothing does this | **THE CAIRN**, now with a body |

The third row is the best thing either game has at this scale and it is the one
this design has never used. Its shield holds one column; every boss so far has
been careful to never ask for the shield and the cannon on the same beat — the
Queen's bloom opens exactly halfway between torch releases, precisely so the
pair is never fighting two fights at once. That care is right for a first,
second and third boss and it leaves a whole question unasked.

## The three already in the store, re-read

- **THE WEIGHT** — the closest thing in the store to what that game actually
  feels like: something sinks unless a hand is on it, and a hand on it is a
  hand off everything else. Of the three parked encounters it is the one whose
  mechanic needs no new machinery at all; only its animation was spent
  elsewhere, on the Warden's tether.
- **THE CHOIR** — the Whisperer's pillar at boss scale, and it needs no new
  rule. It was blocked on a drawing problem and is not any more: `cluster` is
  traced on a grid now instead of marched out from the centroid, so three
  bodies genuinely part and merge back ([asset catalogue](../asset-catalogue.md)).
  What is open there is whether a parting reads at 26 px on a phone — and that
  question is much softer for a boss than for a creature, since a boss is drawn
  at several times the size. A mechanic that hangs on visible separation is
  safer as an encounter than as a kind, which is an argument for building this
  one before Symbiosis.
- **THE CODEX** — Spaceteam's labelled dials grown into a body, and the only
  one of the three whose open question can be answered today: can a *key* be
  read off a rim of travelling notches at boss size, or does `glyphed` only
  ever read as texture? That is a `bun run shapes` question, an hour's work,
  and it decides whether the encounter exists.

## Collected

### THE VANE — it bends the field, not the beat

**The shape.** Drawn, as `vane`: the pendulum arm offered to the Conductor plus
the bearing it turns on. An *open* contour with no inside, the only kind of
body in the game besides the Warden's tether, sweeping the top of the field on
`TOLL`. A vane is the thing that turns when something pushes it, which is what
the sweep should read as — not a weapon, a mechanism.

The bearing is not decoration and it is what took a second attempt. The first
was the Conductor's arm at a phase offset, on the theory that the still should
stand at the end of a sweep; the arm is already at an end at `t = 0`, so the
two cards came out mirror images of each other and a mirror image is not a
second idea. The pivot is the only part of this boss that can be hit, so a card
without it on it was a picture of the part you cannot reach.

**The mechanic.** At the end of each sweep the arm **rolls one player's field**:
their column order reverses, so column four on their device is column eight on
the other. Every announcement made under a roll has to be turned around out
loud by whoever is not rolled. Its pivot is exposed only at the far end of a
sweep — which is the end belonging to the player who was just rolled, so the
person who has to shoot is the person whose numbers stopped matching, and the
other one has to talk them into a column that is not the one they can read.
The fourth question, and it is a good one: **what you can still say when the
words no longer line up.**

**Why it does not break determinism.** The roll is a transform on one device's
picture and that device's touch mapping (`packages/render/src/layout.ts`,
`touch.ts`); both simulations stay identical and the wire carries nothing new.
It is the one flip that is legal here, and it is legal because the sim never
hears about it.

**Slot:** The Conductor (30), whose deferral invited exactly this.
**Unworked out:** whether **The Flip** ([ideas](ideas.md)) should be built at
wave scale first — leaning a boss on a mechanic no wave has ever run is how you
find out at the worst moment; whether both players can ever be rolled at once
(almost certainly never: then nobody can translate); and how the roll ends, so
it is a passage and not a state.

### THE TITHE — it always takes something; you choose what

**The shape.** Drawn, as `plated`. The first boss wider than the middle of the
field: a slab spanning seven of the eleven columns, made rather than grown,
with a row of plates along its underside and exactly one of them live. Where
the Warden is a body with a hole and the Queen is a body with a mark, this is a
body that is mostly *edge* — the danger is which part of a long thing is live
right now, and a long thing makes "which column" a fine distinction inside one
silhouette.

Drawing it settled the thing prose could not. "Lit" is a colour and a
silhouette has no colours, so the live plate cannot glow: it **reaches**,
hanging two and a half times as far as its neighbours, and it is the only part
of the outline that moves. At 390 px the body is 248 across, which makes each
of the seven plates exactly one column wide — not a number to tidy up later,
since the mechanic is "which column" and a plate that spans anything else is a
body arguing with the grid it is asking about. Two cards: the live plate in the
middle, and the live plate at the outermost column, which is where the reading
is a fine distinction rather than an obvious one.

**The mechanic.** Two rocks a cycle, in two columns, on the same beat. One
shield, and one lit plate in a third column that wants the cannon on that same
beat. Two hands, three demands, every cycle, forever: the pair can always save
one and never all three, so each cycle is a sentence about what to give up —
and the scars left behind are the record of what they chose. It is the first
boss where the correct play is to take damage on purpose. **What you are
willing to lose**, as a question the pair has to answer out loud, repeatedly,
under a clock.

**The obvious objection, and the mitigation.** This is one edit away from being
merely mean. Two conditions keep it honest, both borrowed from rules already
written: the choice must be legible a full cycle ahead, fixed and learnable, as
[11.1](bosses.md#111-the-mother--reactive-but-announced) demands of every boss;
and a pair that eats exactly one scar per cycle must finish the fight alive —
paying the tithe is the intended line through it, not the failure state.

**Slot:** The Kernel (100), the last before the finale. **Unworked out:**
whether its plates repeat the Warden's silhouette-as-health trick too closely,
and whether the third demand should be the cannon at all, or the maw.

### THE CAIRN — a boss built out of the field's own rocks

**The shape.** Drawn, as `pile` — the form this page asked for, below. Seven
angular units held in one outline: the first boss drawn with facets rather than
lobes, and the first that is a *pile* rather than a body, with the seams
between units left visible so the eye can count them. `SHIVER` for the pile
settling; the pulled card goes `LURCH`.

A unit is a rock at the size and facet count the game already draws one —
seven-sided, radius 46, the same as `METEOR`. That is the fiction made literal
rather than described: the boss dismantles into ordinary rocks, so the parts it
is stacked from have to *be* ordinary rocks before anything is pulled, not
boss-sized lumps that shrink on the way out. Seven of them stack three, three
and one, which lands a shade wider than the Warden.

Two cards, and the second is the encounter: one unit dragged clear becomes its
own loop and stops being part of the boss. It is one outline while stacked and
exactly two once pulled, at every one of fifteen thousand sampled moments —
which is a claim worth checking rather than eyeballing, because a pile held
together by a field is held together by arithmetic, and the first spacing tried
shed a rock at six moments in four hundred and eighty.

**The mechanic.** Nothing about it can be shot — rocks are indestructible and
the game teaches that in its first act. You take it apart with **hands**: a
grip held on a unit drags it out of the pile, and once loose it falls as an
ordinary rock that has to be warded like any other. So the boss dismantles into
the game the pair already knows, and the whole fight is *rate* — pull two at
once and you have two rocks and one shield. **How much your partner can absorb
right now**, which is a question neither of the other three asks, and the one
Lovers in a Dangerous Spacetime asks constantly.

**Slot:** it wants The Heart (60), and so does THE WEIGHT. They are the same
pillar — hands, and the price of a hand — and both should not be built.
**Unworked out:** what stops a pair pulling nothing and waiting; probably the
pile itself descends, which makes it THE WEIGHT again, and that is the argument
they have to have before either is drawn.

## The shapes, slot by slot

Every act slot, and what picture it has today. Three of the eleven have a body,
four have a draft offered to them, and four have a name and nothing else.

| Slot | Picture today | Form | Motion |
|---|---|---|---|
| Bulb Queen (10) | **built** — armoured body, two marks, torches on the wing tips | `blobPath` | own |
| Strand Nest (20) | nothing | — | — |
| The Conductor (30) | draft — the pendulum arm, and THE VANE's the same arm on a drawn bearing | `arm`, `vane` | `TOLL` |
| The Choir (40) | draft — three bodies in one film, parting and merging | `cluster` | `SHIVER` |
| The Warden (50) | **built** — the ring you see the field through | `ring` | `TURN` |
| The Heart (60) | two drafts for one slot — a sac hung heavy (THE WEIGHT), a pile of seven rocks (THE CAIRN) | `sac`, `pile` | `HEAVE`, `SHIVER` |
| The Mother (70) | nothing; she is a rule about the previous act, not a body yet | — | — |
| The Codex (80) | draft — a slab whose rim scrolls a key | `glyphed` | `SWELL` |
| The Echoes (90) | **built**, if it is given the slot — THE MIRROR, your own hull flipped | `drawHull` | own |
| The Kernel (100) | draft — a slab of seven columns, one plate reaching (THE TITHE) | `plated` | `TWITCH` |
| The Vessel (finale) | nothing; the clearest argument for the information split | — | — |

Three things fall out of the table. **The Warden spent the see-past trick**,
and it can only be spent once — a second body with a window in it is a repeat,
not a surprise, and `ringClearance` says how narrow the margin was even the
first time. **The Kernel is no longer empty**, which leaves the finale as the
only slot at the end of the run with no picture at all — still the opposite of
where drawing effort has gone, but one slot rather than two. And **The Heart
now has two bodies competing for it**, which is the argument this page said
THE WEIGHT and THE CAIRN would have to have; both are drawn now, so it can be
had by looking rather than by imagining.

## The machinery, now that the cluster parts

The multi-loop subject was the thing this page was going to ask for, and it
landed on `main` while the page was being written: a contour can be several
closed loops, so the Warden's hole and a parted cluster are one rule
([asset catalogue](../asset-catalogue.md)). Every "it comes apart" boss either
game has is drawable today.

What was left was narrower and belonged to **THE CAIRN**, and it is built.
`cluster` traces a metaball of round bodies, and a pile of rocks is neither
round nor a field: it wanted the same tracing over *faceted* units, so the
seams stay straight and the pile reads as stacked rather than as a bloom. That
is `pile`, one form beside `cluster`, and it was not a new idea about contours
— the grid tracing is shared and only the field differs. Each unit contributes
its own polygon raised to the twentieth rather than a metaball, so the sum
behaves nearly as a maximum and the union is very nearly the union of the
polygons themselves: straight edges, and a sharp reflex corner everywhere two
rocks cross. The exponent is the whole shape. Six was the first guess and drew
a lumpy boulder — enough to dent the outline, nowhere near enough to keep a
facet straight — and the spacing had to follow it: the units are driven into
each other by a fixed fraction of their own reach, so an overlap is guaranteed
by construction rather than by a grid that happens to suit the sizes one seed
drew. With a near-maximum field, overlapping and joined are the same word.

A regular polygon is the intersection of its facet half-planes, which is what
makes that cheap: the ratio the field needs is the largest of the facet dot
products, so there is no angle taken anywhere and the exactness is free. The
first version asked `atan2` per unit per grid cell and cost thirteen
milliseconds a frame; the same shape, to the last loop, comes out of dot
products in five.

## Refused at boss scale

- **A health bar.** Both games have one; this one has petals, plates and a
  pupil, and the substitution is strictly better because it is visible from
  across a room and needs no glance away from the field.
- **A boss that roams the field.** Nothing traverses, bosses included.
- **Camera shake, tilt and zoom on a boss hit.** The field is a coordinate
  system two people are naming out loud — see the refusals in
  [transfers](transfers.md#refused-with-the-reason).
- **A second body you can see through.** Not a rule, a budget: the Warden has
  it, and the trick is worth exactly one boss.
- **Bosses with two-handed set pieces on one device.** Two devices, two thumbs,
  no shared screen — a manoeuvre needing four hands in one place cannot happen
  here at all.
