# Bestiary

> **Status: five of twenty built.** Slick, bulb, meteor, lure and throb exist
> (`packages/content/src/creatures.ts`). Everything else on this page is
> design.
>
> Adding one is one entry in `CREATURES` plus a silhouette. See
> `.claude/skills/new-creature`.

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

**Only `slick`, `bulb`, `meteor`, `lure` and `throb` are committed** — they are
`CreatureKind` values in the simulation. Every other name on this page is a
label on an unbuilt design and costs one edit to change.

## Categories

The bestiary groups into what a player does about a kind, not its shape.
`categoryOf(kind)` (`packages/content/src/creatures.ts`) derives the group
from `controls` — it is never a second, hand-maintained classification, so it
cannot drift from the control-visibility rule in `docs/spec/systems.md` 5.1.

| Category | Answered by | Members today |
|---|---|---|
| `cannon` | `aim` only | slick, bulb, lure, throb, dart |
| `shield` | `guard` only | every meteor tier, the torch |
| `mixed` | `aim` and `guard` | the queen |
| `special` | neither | *(reserved, empty)* |
| `suck` | — (pods, not `CreatureKind`) | mend, purge, ward |

`special` is not a bucket to fill on principle — nothing standard describes a
creature that is neither aimed at nor guarded against, and the plan is to
leave it empty until one is actually designed. It is a different axis from
`radar`: *The Silent* and *The Jammer* (10.2) are unusual in what they tell a
radar strip, not in what a player does about them, so they still land in
`cannon`, `shield` or `mixed` like anything else — `special` waits for a
creature answered by neither control at all.
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
| **Veil** | opaque; one flash shows the core | announce the colour |
| **Bulb** | round, many fine lobes, rotating ring of light; pumps — always cyan | mark + colour |
| **Strand** | chain of segments, boring head | shoot through; warding locked out |
| **Crystal** | facets, breaks into two halves | fast switching |
| **Gum** | sticky; grabs and holds on | three evasive manoeuvres in a row |
| **Throb** | swells and shrinks on a fixed beat | timing instead of a snap call |
| **Lure** | a slick or a bulb that only the navigator can see through | do *not* hit it (costs the hull) |
| **Choke** | docks on, shuts one control | inverted instruction |
| **Glyph** | pattern across its skin | look it up in a table |
| **Pod** | capsule with a blinking core | power-up |

Built: slick, bulb, meteor, lure, throb, dart, torch. Slick, bulb and meteor
carry the teaching waves; the torch is the meteor's own widened relative, not
one of the original thirteen. Lure, throb and dart are the next three of that
thirteen — none of them needed a new control group, only an entry and a state
machine (see THE LURE, ON THE BEAT and THE DART waves, and
`.claude/skills/new-creature`).

**The dart is the first body that does not hold its lane**, and that is the
whole of why it was worth a silhouette. Everything before it fell straight
down, so a column said out loud stayed true until the thing landed; a dart
makes that sentence expire after one beat. It moves on a two-beat cycle — a
diagonal of two rows and two columns to one side, then one beat hanging with
the next side already chosen — and only player 2 is shown which side, by an
arrow over the body that player 1's screen never draws. Both colours wear the
one silhouette, which is the "one kind, one colour" rule spent deliberately:
the shape is new because the *behaviour* is new, and what the pair has to say
about a dart is the same sentence in either colour.

**THE LURE holds the slot the Runt had, and is not the same creature.** The
Runt was small and helpless and the whole point of it was that you could see
that. A lure is the opposite: a full-size slick or a full-size bulb, in its
real colour, with its real contour and its real own-motion, on player 1's
screen — and its danger is that it looks like exactly what you want. Player 2
sees the same body inside a white ring, with an exclamation over it and the
same mark on the radar strip; player 1 has no tell at all, right up to the
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

## 10.2 Newly accepted

| Creature | Pillar | Description |
|---|---|---|
| **Thread** | Future | a trace of its *future* movement; the navigator sees it strongly, the pilot the current position. For the first time both talk about a future rather than a state |
| **The Shadow** | Order | invulnerable while it lies behind another creature. Forces a planned order instead of a reaction |
| **The Whisperer** | Rhythm | reacts only when both inputs hit the same beat. Makes the beat the load-bearing system instead of a comfort feature |
| **The Doppelgänger** | Uncertainty | two nearly identical creatures; the pilot recognises the shape, the navigator the radar behaviour |
| **The Blind One** | Uncertainty | visible to one, only interference to the other — see below |
| **The Clamp** | Order | joins two creatures into one dangerous line; three ways out, chosen together |
| **The Beat-breaker** | Rhythm | runs on its own offset while the global beat stays correct |
| **The Silent** | Uncertainty | `radar: "none"` — neither strip announces it. Must be slow enough that the field itself is the only warning |
| **The Jammer** | Uncertainty | blanks the *other* player's radar for as long as it lives — the one kind whose danger is what it does to a strip, not what it does to the hull |

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

**Name clash:** the *Echo* (a creature appears one second earlier for one
player) is a different thing from a creature that repeats an action with a
delay. The latter is called **Reverb**.

## 10.4 The ceiling

13 existing plus 7 new is 20 types. At 20–26 px object size and within the
style frame from [graphics](graphics.md), that is probably the limit for
unambiguously distinguishable silhouettes — and it is capped anyway by "new
creatures only up to wave 50". Rule 3 above is likely to bite before rule 1
does: twenty names that stay distinct over a voice channel is the harder
constraint.
