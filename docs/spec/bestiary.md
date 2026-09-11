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
| `cannon` | `aim` only | `slick`, `bulb`, `lure`, `throb`, `shell`, `dart`, `veil`, `wisp`, `ghost`, `echo`, `rind`, `recoil`, `gyre`, `lid`, `strand`, `magnet`, `choir`, `gum`, `choke`, `countdown` |
| `shield` | `guard` only | `meteor`, `meteorMedium`, `meteorFast`, `meteorFaster`, `meteorFastest`, `torch`, `veer`, `coil` |
| `mixed` | `aim` and `guard` | `queen`, `warden`, `clasp`, `carom`, `volley`, `crawler`, `fence`, `crystal` |
| `special` | neither | `tether`, `mount`, `chute`, `beatbox`, `balloon` |
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

**THE BEATBOX is the fourth, and it lands here for a reason none of the first
three has.** It is authored directly, like any ordinary arrival, and nothing
else on the field shows a panel on its behalf — a wave carrying one needs no
`aim` and no `guard` at all, because the body is answered by a tap, and a tap
on the field is not a `ControlGroup` any more than THE MAGNET's hand or THE
CHOIR's shake is (below). What makes it `special` rather than `cannon`, the way
those two are, is that there is no body underneath still waiting on the cannon
once the gesture is done: a magnet is answered sideways by a shot and a choir
becomes a slick or a bulb, but a box that is answered correctly simply goes
quiet.

**THE CHOIR is in `cannon` and its whole answer is not**, which is the sharpest
reading this table has of what a category is for. A pair of bodies in one
membrane is opened by a gesture on neither panel — the phone shaken, or two
arrows carried off the edges of the field — and then the body they become is
shot like any other. The
row says `aim` because `aim` is what the *wave's panel* has to be able to
answer; the gesture is not a `ControlGroup` and never will be, for the reason
THE MAGNET's hand is not one. So a category names what the panel owes, not
everything the pair has to do.

**THE BALLOON is the second thing in `special` a wave actually places**, and
it is THE BEATBOX's own argument said about a different gesture. This one is
authored like any other arrival and is in `special` because **neither control
reaches it at all**: no bolt lands on it in any colour and the shield is never
offered it, so a wave carrying nothing but balloons owes its panel nothing.
What answers it is a hand from each seat on a handle of its own
(`sim/balloon-pull.ts`), and a hand is not a `ControlGroup` for the reason THE
MAGNET's is not and THE CHOIR's gesture is not. The difference from THE CHOIR
is that there is no body at the end of it for the cannon to finish, so the row
has no `aim` to owe — and the difference from THE BEATBOX is that the gesture
takes two seats rather than one.

It stays a different axis from `radar`: what a body tells a radar strip is
not what a player does about it, so a kind unusual there still lands in
`cannon`, `shield` or `mixed` like anything else.
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
| **Strand** | chain of segments on one thread, alternating red and cyan | eaten from its ends inward — and only one of you is shown which end is next |
| **Crystal** | a red slick and a cyan bulb joined at a thin middle, armoured all round — an hourglass on its side, three tiles wide, crossing on the carom's diagonal | the shield under the middle and the shot in the join's colour on the same beat; then it is two plain bodies |
| **Gum** | THE WEIGHT's sac in the palette's venom green, falling straight down one lane; a flat smear across the plating with drips off it once it has landed | it cannot be shot and the shield does not stop it; it sticks to the ship and shuts the cannon in its columns until player 2 swipes it toward the nearer wall — which only works while player 1 has the cannon parked under it. The wrong way spreads it a lane wider |
| **Throb** | six clubs on a small core, red down one side and cyan down the other, turning clockwise | colour *and* timing in one call |
| **Lure** | a slick or a bulb that only the navigator can see through | do *not* hit it (costs the hull) |
| **Choke** | TENDRIL's sac in the palette's bile yellow, tall and boneless, falling straight down one lane with two hooks under it; wound round the cannon's swelling once it has landed, and round player 1's strip node | it cannot be shot and the shield does not stop it; it lands, takes the cannon, and the cannon strip goes dead while the cannon walks wall to wall a column a beat. Player 2 keeps firing from wherever it is. Player 1 taps the dead strip, a lift between each — how many loops are still tight is the count, on both screens — `chokeTaps` times, and it lets go |
| **Countdown** | the COUNTDOWN draft's disc — as near a plain circle as the roster has — with marks cut into its rim on the pilot's screen only, one fewer each beat, and the rim lit while none are left; a bare disc on the navigator's | hit only while the count is at zero, in its colour; a shot on any other beat costs the hull like a lure's and the body stays. The pilot counts down out loud, the navigator fires on the word — THE COUNT (act 3) teaches it |
| **Pod** | capsule with a blinking core | power-up |

Built: slick, bulb, meteor, lure, throb, dart, veil, strand, torch, crystal, gum, choke, countdown.

The thirteenth was **Glyph** — a pattern across its skin, looked up in a
table — and it left this list on 11 September 2026: THE MIRROR's Simon Says is
that look-up, played on the pair's own controls (`bosses.md` 11.3,
`docs/decisions.md` #28).
Slick, bulb and meteor carry the teaching waves; the torch is the meteor's own
widened relative, not one of the original thirteen. Lure, throb, dart, veil and
strand are the next five of that thirteen — none of them needed a new control
group, only an entry and a state machine (see THE LURE, THE THROB, THE DART,
THE VEIL and THE STRAND waves, and `.claude/skills/new-creature`). The crystal
is the seventh, built 11 September 2026 on THE CRYSTAL (wave 43): the Splitter
as it was merged into, with the split made the pair's to earn — the shield
standing under the middle tile and the guard armed on the beat the shot of the
join's colour lands, or the shot bounces off and the whole thing dives a row
(`packages/sim/src/crystal.ts`, `packages/render/src/crystal.ts`).

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
`packages/content/src/own-motion.ts`: its clockwise turn (`throbTurnMilli`,
`sim/throb.ts`, drawn in `render/living-draw.ts`) is what tells the pair when
to fire, and a body that also tilted or pumped on its own would be saying two
things at once. `HOLD` never rotates and never scales — a second rotation
above all, since that is not a competing signal but the same one made
unreadable.

**The pod is built, and it is not a creature.** It carries no colour, is never
cleared and never blocks a wave, so it lives outside `CREATURES` entirely — its
own list on the wave, its own list in the world. Shooting it loose needs both
players, catching it needs player 1's maw. See [systems](systems.md) 5.7.

**The torch is built, and it is a rock, not a new tier.** It falls at
`meteorFastest`'s speed rather than at a faster one of its own — that tier was
already tuned, and a new number would only drift from it — so what is different
is the shape and the width. `colSpan` gives it two columns where every plain
rock has one, and a wave may narrow it to a single tile
(`WaveEntry.size`, offered as SIZE in the director beside a plain rock's): the
same creature at either width, and what changes is how much of the hull one
plate has to cover. A shield in any column the body occupies deflects it, and a
miss scars all of them, once, for a single `damageMeteor`. The one-tile torch
is also what a coil's dome leaves behind when it comes off — see THE COIL. Radar
`"p1"`, the same as every other rock (`docs/decisions.md` #15), and
`packages/render/src/torch-alarm.ts` gives the strip a second, louder cue: a
pulsing band over the columns the body will actually cover, and a role-specific
line, because a rock the pair has to cover two lanes for is worth more than a
blip the size of every other rock's.

**The strand in detail, as it was written:** it appears, turns lengthways,
fires an unavoidable marking shot at the hull, **extinguishes its own drive**
(visibly), whereupon player 2's controls **grey out**. After that the only way
through is shooting its 5–7 segments in alternating colours.

> The strand and the gum depended on evasion, which no longer exists. (The pod
> did too; it was re-designed rather than dropped — see above.) The gum's
> replacement is built: it shuts the cannon where it lands, and the pair gets
> it back by parking under it and swiping — wave THE GUM, `packages/content/src/waves/act-5.ts`.

> The strand's whole point — greying out a control group — survives if it greys
> out `guard` instead, but that has to be re-designed rather than renamed.

**And as it is built**, which is the last sentence of that paragraph and
nothing else: two to five segments on one thread, alternating red and cyan, and
only one of them can be shot at a time. The marking shot, the turn lengthways
and the greyed-out control group are all gone with the evasion they were
written against — what is left is the *order*, and the order is what makes the
pair talk.

**The thread is eaten from its ends inward, and which end is rolled again after
every bead.** It was a fixed march from one rolled end first, which is the
plainest reading of the row above and gives the creature away on the second
bead: the first raisin shows the pilot which end the order started at, and the
navigator — who has heard one colour and can see that the beads alternate —
works out all the rest from there. One exchange, and the thread answers itself.
Rolled, neither of them can derive the other's half at any point, and both
calls are worth making until the last bead.

The split is the part the original did not have, and it is the first one in
this game that runs **both ways**. The navigator is shown which segment is lit
and no colours at all; the pilot is shown the colours and no mark. So neither
of them can answer a thread with what is on their own screen: the column has to
cross the room one way and the colour the other, for every bead. A shot at the
wrong one swells the last dead bead back into a live one, which is what the
greyed-out control group used to be for — a mistake that costs the pair
something they had already earned. `packages/sim/src/strand.ts` is the whole of
it, and THE STRAND is the wave that teaches it.

## The ghost

**The ghost is not one of the thirteen**, and the table above is left alone on
purpose: it is a design that arrived after the original list, the way the torch
did, and padding a table headed *the first thirteen* with a fourteenth row
would make the count a lie about where the design came from.

**It is the first creature whose secret is a *place*.** Everything split across
the two screens until now hid a property of a body both players could see — the
side a dart takes, the colour inside a cloud, whether a slick is really a slick.
The ghost hides the body. Player 2 sees it whole; player 1 is drawn a box
scanning the row it is standing in, left to right and several times a second,
and nothing whatever about the column, and player 1 is the seat holding the
cannon. So the sentence the pair has to say is
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

Nine more names stood in this table until 11 September 2026 — Thread, The
Shadow, The Whisperer, The Doppelgänger, The Blind One, The Clamp, The
Beat-breaker, The Silent, The Jammer — and the owner retired them
(`docs/decisions.md` #28). Their arguments are in this file's history.

**THE WISP is the first body one player cannot see at all**, and the first
whose position is the secret rather than its colour, its kind or its path. THE
LURE hides what a body *is* from the navigator; THE VEIL hides it from the
pilot; both draw the body on both screens with something about it withheld.
This one is simply not on player 1's field — not dimmed, not ringed, not a
smear where it stands. It does not fall and it does not leave: every
`wispDwellBeats` it is somewhere else on the field, drawn from the seeded rng
one tile at a time, and the wave stays open until it is shot. Either colour
shoots it, and it is the last body on the field that takes either — the
ammunition is not the question this creature asks.

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
frame (`render/target-lock.ts`) strikes somewhere on the grid about eight times
a second, holds for a fraction of one and is gone. It knows nothing — nothing
in `wisp-search.ts` takes a creature, a column or a row — and every strike
lands on a *crossing*, dead between four tiles, so there is no square it can be
pointing at. A box that settled square on a square would be read as *the enemy
is there*, and a pilot who fires at it is a pilot who has stopped listening.

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

## THE MAGNET

**The first body in this game that cannot be answered from the column it is
standing in.** Every arrival since THE SLICK has rewarded one motion — put the
muzzle under it and pull — and this creature exists to take that motion away
without taking anything else with it. Nothing about it is hidden, nothing about
it is fast, and standing in its column is the losing move.

**What it is.** A horseshoe hanging on its two poles, one red and one cyan,
with a flat armoured plate slung under it on a staff — wider than the poles
stand and hanging clear below their tips. It falls a row a beat like a slick.
Both screens draw the whole of it: the opening at the bottom says there is a
way in, the plate says the way in is not from underneath, and the two colours
say the way in has a colour.

**What it does.** A shot climbing its own column arrives square under the plate
and does nothing at all — no crater, no colour miss, no window. It is
**reflected**: it comes back off the plate the way it went in, falls about a
tile and is gone (`render/magnet-bounce.ts`). There is no number in the rule
and nothing to tune. A locked bolt travels a corner — up its own column, then
level and straight across (6.6) — so what reaches a magnet either arrived
sideways or it did not, and only the second meets armour.

**So the answer is THE LOCK, used as an aim.** The one thing in this game that
sends a shot sideways is player 1's hand held on a body (`sim/lock.ts`). Any
column but the magnet's own is an answer, at any height: the pilot stands the
cannon off the column, holds the body, and the bolt climbs, turns level with
it and comes in horizontally at a pole. The gesture already cost the pilot
their strip; here it also costs them the oldest habit in the game.

**And the side is the colour.** The left pole carries the authored colour and
the right one carries its opposite (`magnetPoleColor`), so which side the bolt
comes in on decides which trigger kills it. Player 1 chooses the side by
choosing where to stand; player 2 holds both lobes and cannot pick one until
the side has been said out loud. That is the exchange, and it is short enough
to survive the voice delay: *coming from your left*.

**It is the pilot's hand and only the pilot's.** A navigator's press on a
magnet does nothing at all (`canBeHeld` in `sim/grip.ts`), which is the one
place in the game a grip is refused by seat rather than by kind. A hand on a
falling body is a brake everywhere else; on this one it is also an aim, and a
navigator who could hold a magnet would be slowing the body whose entire cost
is that the pilot has to leave its column — with the hand that should be on a
trigger.

**Where it is played.** THE MAGNET introduces it on the ordinary panel with one
rock beside it, so the shield is still worth having and the two controls are
plainly asking for different places at once.

## THE MALFUNCTION

**A wave in which one of the two seats does not have its control any more — the
control has it.** Not a creature and not a panel: a fault is a fact about the
wave, named beside `boss` and `controls` on `Wave`, and it reads the same on
every set because it changes no button on any of them.

Two of them, and they are two mechanics rather than one because a pair who has
played one has learnt nothing about the other:

- **A cannon fault** fires up player 1's column on every beat. RED and CYAN go
  dead on player 2's panel. The ammunition is authored — red, cyan, or
  **alternating**, which changes on the beat and makes the colour a thing
  somebody has to call.
- **A shield fault** brings the dome up over player 2's column on every beat.
  SHIELD goes dead on player 1's panel. Every rock the plate is standing under
  is warded for free — and every clasp it passes is opened for free too, on a
  beat nobody chose, which turns the navigator's route into a schedule of work
  for the pilot.

**The broken half is never the half that moves**, and that is the whole design.
The seat that still has a strip has to *aim the fault somewhere harmless* — off
a lure's column, past a clasp the cannon is not ready for — which is why those
creatures are what the faults were built for. A fault that took the strip
instead would leave the pair with nothing to do about it.

**There is no brake, and the coupling is the calling.** The broken seat used to
get one lobe back where its buttons were — a relief, two beats of quiet a tap at
a time — and the owner took it out on 6 September 2026: he did not want the
button. So the seat with no control has nothing to press at all, and everything
it knows has to leave its mouth. On THE JAM that is the colour the gun has
loaded and which columns are lures; on THE TWITCH it is which dome the charge is
travelling to. The other seat holds the only thing that can act on any of it,
and a fault runs from the first beat of the wave to the last.

**The rule is enforced in the simulation, not on the panel.** A lobe is not the
only way into a `fire` or a `guard` — a swipe on the hull is a second, a
rehearsal's ghost thumb a third and the wire a fourth — so a broken control is
swallowed above the switch in `applyCommand`. render/ draws the button dead and
tearing; it does not decide anything.

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
Splitter is the **Crystal** · the Inverter is the **Choke**, built as wave
THE CHOKE (`packages/content/src/waves/act-7a.ts`) · the runt cloud is
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

`CREATURE_KINDS` holds forty-one names today, and the design's own guess was
twenty. At 20–26 px object size and within the style frame from
[graphics](graphics.md), twenty was thought the limit for unambiguously
distinguishable silhouettes — and it is capped anyway by "new creatures only
up to wave 50". Rule 3 above is likely to bite before rule 1 does: names that
stay distinct over a voice channel is the harder constraint, which is one
reason the idea rows of 10.1 and 10.2 were retired rather than built.
