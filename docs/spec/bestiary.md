# Bestiary

> **Status: twenty-five `CreatureKind` values exist**, against the twenty-odd
> designed on this page — slick, bulb, the five meteor tiers, torch, queen,
> warden, tether, lure, throb, shell, clasp, dart, veil, wisp, ghost, echo,
> rind, gyre, mount, lid and recoil
> (`packages/sim/src/creature-kinds.ts` is the roster). Everything else here is
> design.
>
> **Adding one is not "one entry plus a silhouette", which this line used to
> say.** It is a row in the roster, a row in `CREATURES`, a row in `MECHANICS`,
> a row in `living-look.ts`, a row in render's `TALKER`, a wave that introduces
> it and a guide written inside that wave — and more if it carries state of its
> own. Every one of those is enforced by a compiler or a test, which is the
> only reason the list can be trusted to be complete.
> `.claude/skills/new-creature` walks them in order.

## Naming

Four rules, in this order:

1. **Blob and slime, not sea life.** The original bestiary was marine because
   the setting was. It is not any more — see `docs/decisions.md` #11 and #13.
   Non-living things (meteor, crystal) are the deliberate exception: they are
   angular, they get `crystalPath` instead of `blobPath`, and the contrast is
   the point.
2. **The name says the behaviour or the shape.** A player who hears a name they
   have not seen yet should still guess right.
3. **Distinct when spoken over a laggy voice channel.** This is the one that
   overrides the other two. Names are said out loud across a 0.5–2 s delay, so
   two creatures must not share an onset, a vowel and a syllable count. That is
   why the flat one is not called a *glider* — "glide" is already the fixed
   word for how every creature moves, one tile per beat.
4. **One kind, one colour, one silhouette.** A shape is not painted in two
   colours: a red one is a slick, a cyan one is a bulb, and `kindForColor` in
   `packages/content/src/creatures.ts` is the only place that mapping lives —
   waves author the colour and the shape follows. A free silhouette from the
   table below is spent on a creature that *behaves* differently from the
   standard one, and then it has to read as clearly different, not as the same
   blob in another tint.

**A name on this page is committed only if it is a `CreatureKind`** — the
status block above names the twenty-five that are, and the roster in
`packages/sim/src/creature-kinds.ts` is the list that decides. Every other name
here is a label on an unbuilt design and costs one edit to change. The list is
not repeated a third time on purpose: it was repeated twice and both copies
were years out of date.

## Categories

The bestiary groups into what a player does about a kind, not its shape.
`categoryOf(kind)` (`packages/content/src/creatures.ts`) derives the group
from `controls` — it is never a second, hand-maintained classification, so it
cannot drift from the control-visibility rule in `docs/spec/systems.md` 5.1.

Every member is written as a `kind` rather than in prose, and that is what
makes the four rows below checkable: `packages/content/test/categories.test.ts`
parses this table and fails when it disagrees with `categoryOf`. It had drifted
in three rows of four before that test existed — `shell` and `veil` missing
from `cannon`, `warden` and `clasp` from `mixed`, and `special` still described
as empty a while after the tether landed in it. Nothing said a word, because a
table in a document cannot be wrong in a way a compiler notices.

| Category | Answered by | Members today |
|---|---|---|
| `cannon` | `aim` only | `slick`, `bulb`, `lure`, `throb`, `shell`, `dart`, `veil`, `wisp`, `ghost`, `echo`, `rind`, `recoil`, `gyre`, `lid` |
| `shield` | `guard` only | `meteor`, `meteorMedium`, `meteorFast`, `meteorFaster`, `meteorFastest`, `torch` |
| `mixed` | `aim` and `guard` | `queen`, `warden`, `clasp` |
| `special` | neither | `tether`, `mount` |
| `suck` | — (pods, not `CreatureKind`) | mend, purge, ward |

`special` was reserved and empty for a long time on the reasoning that nothing
standard describes a creature answered by neither control. **The tether is what
filled it**, and it did so by not being a creature in the sense the row was
waiting for: it does not fall, it is not shot and it is not guarded against —
it is dragged by its handle, which is a gesture with no control group at all.
The bucket was right to exist and wrong about what would land in it.

**THE GYRE's mounts are the second thing in it**, and they arrive by the
same door. One of the six on a wheel's rim is an ordinary slick or bulb and
is answered by `aim` like one — but it is not a body a wave places, it is a
body a wheel brings, so it carries no control group and the `gyre` beside it
in `cannon` is what shows the panel. Both rows say the same thing: `special`
is where a body goes when something else on the field put it there.

It stays a different axis from `radar`: *The Silent* and *The Jammer* (10.2)
are unusual in what they tell a radar strip, not in what a player does about
them, so they still land in `cannon`, `shield` or `mixed` like anything else.
Pods are never `CreatureKind` values and were never in `CREATURES`, so they do
not go through `categoryOf` at all — `POD_CATEGORY` names their group
directly, `"suck"`, after what taking one in is called throughout the sim
(`docs/spec/systems.md` 5.7).

## 10.1 The first thirteen

| Creature | Form | Role |
|---|---|---|
| **Slick** | wide flat blob, two broad lobes; tilts and ripples — always red | match the colour |
| **Dart** | three deep lobes between the slick's flat two and the bulb's fine nine; never falls straight, and leans toward the diagonal it takes next | match the colour, in the column it is going to |
| **Meteor** | matt, angular, no glow | ward only (the mirror image of the strand) |
| **Veil** | a thundercloud; the pilot sees into it, the navigator does not, and the body inside turns over every few beats | announce the body *and* how long it is good for |
| **Bulb** | round, many fine lobes, rotating ring of light; pumps — always cyan | mark + colour |
| **Strand** | chain of segments, boring head | shoot through; warding locked out |
| **Crystal** | facets, breaks into two halves | fast switching |
| **Gum** | sticky; grabs and holds on | three evasive manoeuvres in a row |
| **Throb** | swells and shrinks on a fixed beat | timing instead of a snap call |
| **Lure** | a slick or a bulb that only the navigator can see through | do *not* hit it (costs the hull) |
| **Choke** | docks on, shuts one control | inverted instruction |
| **Glyph** | pattern across its skin | look it up in a table |
| **Pod** | capsule with a blinking core | power-up |

Built: slick, bulb, meteor, lure, throb, dart, veil, torch. Slick, bulb and
meteor carry the teaching waves; the torch is the meteor's own widened
relative, not one of the original thirteen. Lure, throb, dart and veil are the
next four of that thirteen — none of them needed a new control group, only an
entry and a state machine (see THE LURE, THE THROB, THE DART and THE VEIL
waves, and `.claude/skills/new-creature`).

**The veil is the lure's split turned over**, and the pair is the point: THE
LURE hides something from the navigator's *trigger finger* by showing the pilot
a ring, and THE VEIL hides something from the navigator's *eyes* by showing the
pilot a window. One says "do not fire at that one"; the other says "fire that
colour, now". Between them the pair learns that a body neither of them can
fully see is a body they have to describe rather than react to.

The shipped veil differs from the row above's original wording in one place and
it is a deliberate substitution: the flash became a **morph**. See
`docs/spec/systems.md` 5.2 for the argument — a flash makes the pilot catch a
moment, a morph makes them hold one, and only the second of those is a
sentence.

**The dart is the first body that does not hold its lane**, and that is the
whole of why it was worth a silhouette. Everything before it fell straight
down, so a column said out loud stayed true until the thing landed; a dart
makes that sentence expire after one beat. It moves on a two-beat cycle — a
diagonal of two rows and two columns to one side, then one beat hanging — and
the side of a move is rolled a whole beat before the move takes it, so the
*next* diagonal is knowable while the current one is still being flown. Only
player 2 is shown any of it, and player 1's screen draws none of it: an arrow
on the tile the next move starts from, a dotted two-legged path, and the
dart's own contour drawn hollow on the tile it is about to stand in — which
the body lands inside, and which then steps forward to the next tile along the
path. It is the field's only trajectory line, and it is on one screen because
the seat that has to stand the cannon in that column is the other one. Both colours wear the
one silhouette, which is the "one kind, one colour" rule spent deliberately:
the shape is new because the *behaviour* is new, and what the pair has to say
about a dart is the same sentence in either colour.

**THE LURE holds the slot the Runt had, and is not the same creature.** The
Runt was small and helpless and the whole point of it was that you could see
that. A lure is the opposite: a full-size slick or a full-size bulb, in its
real colour, with its real contour and its real own-motion, on player 1's
screen — and its danger is that it looks like exactly what you want. Player 2
sees the same body inside a white target lock — corner brackets that flicker,
the same frame every picked-out body in the game wears — and the same mark on
the radar strip; player 1 has no tell at all, right up to the
moment it goes. That asymmetry is the creature: the one who can see it cannot
act on it, and the one who is acting cannot see it, so a sentence has to cross
the room — *do not move to this one position, I will not shoot it anyway.*

A shot that lands costs the hull, whatever colour it was. Nothing else does:
it never reaches the ship at all, going on its own on the beat it would step
off the row `lureVanishRows` above the hull. So it is free to ignore, and its
only teeth are the seconds player 1 spends standing in its column while
something real falls elsewhere — which puts the whole weight of it on wave
authoring rather than on the rules.

The runt's own contour and its `TREMBLE` motion are not deleted. Both are
spare, in `tools/shape-sheet/src/retired.ts`, available to the next creature
that is genuinely small — and that creature inherits the question that killed
every proposal for the runt's interior: at `sizeMul` 0.55 it draws at about
10 px, and `docs/spec/graphics.md` says nothing of a figure survives below 11.
That question is not open any more. It dissolved with the creature.

The throb's own-motion is `HOLD`, deliberately the smallest motion in
`packages/content/src/own-motion.ts`: its swell on
the shared beat (`Creature.throbOpen`, `render/creatures.ts`) is what tells the
pair when to fire, and a body that also tilted or pumped on its own would be
saying two things at once. `HOLD` never rotates and never scales, so nothing
in the own-motion layer competes with that beat.

**The pod is built, and it is not a creature.** It carries no colour, is never
cleared and never blocks a wave, so it lives outside `CREATURES` entirely — its
own list on the wave, its own list in the world. Shooting it loose needs both
players, catching it needs player 1's maw. See [systems](systems.md) 5.7.

**The torch is built, and it is a rock, not a new tier.** Three tiles wide,
falling at `meteorFastest`'s speed rather than a faster one of its own — the
other session already tuned that tier, and a new number would only drift from
it. What is new is the shape and the size: `colSpan` makes it occupy three
columns at once, so a shield in any one of them deflects it and a miss scars
all three, once, for a single `damageMeteor`. Radar `"p1"`, the same as every
other rock — see `docs/decisions.md` #15 — and `packages/render/src/torch-alarm.ts`
gives the strip a second, louder cue: a pulsing band and a role-specific line,
because three columns of warning is worth more than a blip the size of every
other rock's.

**The strand in detail:** it appears, turns lengthways, fires an unavoidable
marking shot at the hull, **extinguishes its own drive** (visibly), whereupon
player 2's controls **grey out**. After that the only way through is shooting
its 5–7 segments in alternating colours.

> The strand and the gum depend on evasion, which no longer exists. (The pod
> did too; it was re-designed rather than dropped — see above.)
> The strand's whole point — greying out a control group — survives if it greys
> out `guard` instead, but that has to be re-designed rather than renamed.

## The ghost

**The ghost is not one of the thirteen**, and the table above is left alone on
purpose: it is a design that arrived after the original list, the way the torch
did, and padding a table headed *the first thirteen* with a fourteenth row
would make the count a lie about where the design came from.

**It is the first creature whose secret is a *place*.** Everything split across
the two screens until now hid a property of a body both players could see — the
side a dart takes, the colour inside a cloud, whether a slick is really a slick.
The ghost hides the body. Player 2 sees it whole; player 1 is drawn a band
across the row it is standing in and nothing whatever about the column, and
player 1 is the seat holding the cannon. So the sentence the pair has to say is
a bare number, which nothing else in this game has ever asked for, and the
handover is the mechanic: the number is worth nothing until the cannon is
standing on it, and only the player who cannot check can put it there.

**The camouflage is a picture, not an absence.** On player 1's screen the body
is not drawn at all — a halo, a glow pass and a rim all reach outside the
contour they belong to, so anything drawn at any opacity would be the column
given away in light (`render/ghost.ts`). On player 2's it wears the disguise it
is failing to hold: torn horizontal bands, a few of them thrown clear of the
outline, two eyes burning in dark sockets, and the places it
has just been, fading out behind it (`render/ghost-trail.ts`) — over its head
on the fall, and back along the row on the crossing, where it is the one thing
that says which way the body is travelling.

**Its silhouette is the first that is not a closed lobed blob.** A dome over a
hem that hangs in four tails, taller than it is wide by enough that `longAxis`
calls it tall — `content/ghost-shape.ts` is the geometry and says why no radial
contour could describe it.

**A wave may send one across instead of down.** It prowls one row sideways, a
column a beat, turning at each wall and getting visibly angrier each time;
after the third turn it stops hiding on both screens and comes straight down at
the hull, head first, for more than an ordinary arrival costs. That is a
`path` on the entry rather than a second kind (`WaveEntry.path`): the pair says
the same sentence about both, and what changes is how long the number stays
true.

**And it leaves upward.** Shot, it lets go and climbs out of the top of the
field like a balloon released — the only thing in this game that ever travels
up, and the only sight player 1 gets of the body they have been firing at.

## 10.2 Newly accepted

| Creature | Pillar | Description |
|---|---|---|
| **Wisp** | Uncertainty | on one screen and not the other at all, and never in the same tile twice — the first creature whose *position* is the secret. **Built** |
| **Thread** | Future | a trace of its *future* movement; the navigator sees it strongly, the pilot the current position. For the first time both talk about a future rather than a state |
| **The Shadow** | Order | invulnerable while it lies behind another creature. Forces a planned order instead of a reaction |
| **The Whisperer** | Rhythm | reacts only when both inputs hit the same beat. Makes the beat the load-bearing system instead of a comfort feature |
| **The Doppelgänger** | Uncertainty | two nearly identical creatures; the pilot recognises the shape, the navigator the radar behaviour |
| **The Blind One** | Uncertainty | visible to one, only interference to the other — see below |
| **The Clamp** | Order | joins two creatures into one dangerous line; three ways out, chosen together |
| **The Beat-breaker** | Rhythm | runs on its own offset while the global beat stays correct |
| **The Silent** | Uncertainty | `radar: "none"` — neither strip announces it. Must be slow enough that the field itself is the only warning |
| **The Jammer** | Uncertainty | blanks the *other* player's radar for as long as it lives — the one kind whose danger is what it does to a strip, not what it does to the hull |

**THE WISP is the first body one player cannot see at all**, and the first
whose position is the secret rather than its colour, its kind or its path. THE
LURE hides what a body *is* from the navigator; THE VEIL hides it from the
pilot; both draw the body on both screens with something about it withheld.
This one is simply not on player 1's field — not dimmed, not ringed, not a
smear where it stands. It does not fall and it does not leave: every
`wispDwellBeats` it is somewhere else on the field, drawn from the seeded rng
one tile at a time, and the wave stays open until it is shot. Either colour
shoots it, for the throb's reason — the ammunition is not the question this
creature asks.

**It jumps, and the square it is jumping to is on the navigator's screen the
whole time.** `wispNext` is rolled on the beat the body *lands* — THE DART's
arrangement, one move ahead — so from the instant one jump ends the destination
of the next is already marked, with the arc drawn to it. The navigator has a
whole dwell to read two characters, say them, be heard and have a cannon
standing on the tile before anything arrives on it. It used to blink instead —
out of one tile, into another, nothing in between — which gave them a square at
the instant it stopped being true. The dwell grew with the jump: six beats, of
which one is the flight, and a shot at the named tile connects from the moment
the body leaves the ground, because the simulation has already put it there.

**And the pilot gets an instrument that is visibly looking.** A target-lock
frame (`render/target-lock.ts`) crosses the grid on two sweeps that share no
period: it never stops, never lines up with a row or a column, and is between
tiles almost all of the time. It knows nothing — nothing in `wisp-search.ts`
takes a creature, a column or a row — and the motion is what says so. A box
that settled square on a square would be read as *the enemy is there*, and a
pilot who fires at it is a pilot who has stopped listening.

**The body itself is not solid.** It is received in horizontal bands, a couple
of which are missing on any frame, so the field shows through the one creature
the other screen does not have at all. Transparent and not faint: a flat low
opacity is a dim body, equally present everywhere, which an eye goes on
treating as an object.

**And it is what finally turned the grid on.** `render/field.ts` has carried
the tile lattice behind a constant since the field was first drawn, under a
comment saying to flip it back on when a mechanic needed a player to call out
a square. Nothing had; this does. While a wisp is on the field, both screens
carry the lattice and its two axes — letters across, numbers down toward the
ship — and the pair's whole vocabulary for it is two characters. That is the
timing decision as well as the picture one: six beats is 3.75 s, which is one
full spoken exchange (`docs/spec/latency.md`) and not two, so a pair who
describe the tile still run out and a pair who name it have room to aim. It
was two beats and 1.25 s, which was under an exchange rather than equal to one
— that did not force the shorthand, it forced a miss. The grid goes down again
with the last wisp, because a lattice behind every wave is a texture the pair
stops seeing.

**The Silent — the field is the warning, or there is none.** Every other rock
and every living kind picks a `radar` owner (`docs/decisions.md` #15); this is
the one place `RadarOwner`'s third case, `"none"`, is meant to be spent. With
no strip announcement at all, it can only be fair if it is slow enough to be
read and named after it is already visible — which is a tighter constraint
than it sounds, since `docs/spec/latency.md`'s 3-second floor was written
assuming a radar lead exists. Do not build this one until that arithmetic is
worked out; a silent fast kind is not uncertainty, it is an unannounced hit.

**The Jammer — the danger is the strip going dark, not the kind itself.**
While it is alive, the radar that would normally show its own kind (say,
guard kinds, if the jammer itself is aimed at) blanks for the player who reads
that strip — a live variant of `showsRadar` returning false for everything,
not just this one kind, for as long as the jammer's creature exists. The
player who lost their strip has to fall back on the other player's picture of
the field, which is the one time in the game the split is not permanent.

**The Blind One — interference, not invisibility.** It does not touch the
field the way the original draft proposed; with the radar built and owned per
kind (`systems.md#52-information-split--partly-built`), interference belongs
on the *radar strip that owns it* — the screen that would normally get a clean
announcement instead gets noise, distortion, a flicker in the blip's shape or
timing, in the right column, not silence. The information is incomplete
rather than absent: the other player still holds a clean picture, since only
one radar owns any given kind, and has to turn a garbled call into a very
short, best-guess description — which is exactly the task. Act 5 at the
earliest.

Two requirements, unchanged from the original draft: the interference must sit
**at the position** (now: in the blip's column, at its correct height) and
travel with it, or it is decoration. And it must be distinguishable from a
real connection problem — otherwise a pair will think the game is broken the
first time they see it.

## 10.3 Examined and rejected

- **The Mirror**, **The Translator** — they rest on the same object being drawn
  differently on the two devices without the world explaining it. Pure UI
  confusion; and with separate devices there is no shared screen on which
  "left" could be in dispute. (A later, unrelated idea reused the name for a
  shot-deflecting object — see **Prism** in [ideas](ideas.md), which needs a
  different final name since "Mirror" is also THE MIRROR boss)
- **The Fogger** — duplicates the veil
- **The Resonator** — every hit changes its neighbours; collides with the fixed
  choreography, because after two shots no announcement holds any more
- **The Swarm Node** — dangerous from three neighbours on; at 26 px "three or
  four?" is an eye test, not a communication task

**Merged:** brood fibre and root are absorbed into the **Colony** · the
Splitter is the **Crystal** · the Inverter is the **Choke** · the runt cloud is
a later stage of the retired **Runt**, whose slot THE LURE now holds

**Name clash:** *Echo* used to be the name of a creature that appears one
second earlier for one player. **THE ECHO is built now** and it is a different
thing — a body that comes down at half speed and divides into four — so the
unbuilt one is the **Herald** (see [ideas](ideas.md)), by the rule under
[Naming](#naming): a name is committed only once it is a `CreatureKind`, and
every other name is a label on a design and costs one edit. A creature that
repeats an *action* with a delay is a third thing again, and it is called
**Reverb**.

## 10.4 The ceiling

13 existing plus 7 new is 20 types. At 20–26 px object size and within the
style frame from [graphics](graphics.md), that is probably the limit for
unambiguously distinguishable silhouettes — and it is capped anyway by "new
creatures only up to wave 50". Rule 3 above is likely to bite before rule 1
does: twenty names that stay distinct over a voice channel is the harder
constraint.
