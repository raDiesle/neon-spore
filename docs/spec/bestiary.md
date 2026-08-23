# Bestiary

> **Status: three of twenty built.** Slick, bulb and meteor exist
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

**Only `slick`, `bulb` and `meteor` are committed** — they are `CreatureKind`
values in the simulation. Every other name on this page is a label on an
unbuilt design and costs one edit to change.

## 10.1 The first thirteen

| Creature | Form | Role |
|---|---|---|
| **Slick** | wide flat blob, two broad lobes; tilts and ripples — always red | match the colour |
| **Dart** | small, banded, quick | match the colour |
| **Meteor** | matt, angular, no glow | ward only (the mirror image of the strand) |
| **Veil** | opaque; one flash shows the core | announce the colour |
| **Bulb** | round, many fine lobes, rotating ring of light; pumps — always cyan | mark + colour |
| **Strand** | chain of segments, boring head | shoot through; warding locked out |
| **Crystal** | facets, breaks into two halves | fast switching |
| **Gum** | sticky; grabs and holds on | three evasive manoeuvres in a row |
| **Throb** | swells and shrinks on a fixed beat | timing instead of a snap call |
| **Runt** | tiny, helpless | do *not* hit it (costs points) |
| **Choke** | docks on, shuts one control | inverted instruction |
| **Glyph** | pattern across its skin | look it up in a table |
| **Pod** | capsule with a blinking core | power-up |

Built: slick, bulb, meteor. The three of them carry the ten teaching waves.

**The strand in detail:** it appears, turns lengthways, fires an unavoidable
marking shot at the hull, **extinguishes its own drive** (visibly), whereupon
player 2's controls **grey out**. After that the only way through is shooting
its 5–7 segments in alternating colours.

> The strand, the gum and the pod depend on evasion, which no longer exists.
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

**The Blind One — interference, not invisibility.** On the second device it
appears as interference in the right place (noise, distortion, a flicker in the
grid), not as nothing. The information is thereby incomplete rather than
absent, and the ground rule from
[systems 5.2](systems.md#52-information-split--not-built) holds: the position
is there, it is just not readable. The other player has to turn that into a
very short description — which is exactly the task. Act 5 at the earliest.

Two requirements: the interference must sit **at the position** and travel with
it, or it is decoration. And it must be distinguishable from a real connection
problem — otherwise a pair will think the game is broken the first time they
see it.

## 10.3 Examined and rejected

- **The Mirror**, **The Translator** — they rest on the same object being drawn
  differently on the two devices without the world explaining it. Pure UI
  confusion; and with separate devices there is no shared screen on which
  "left" could be in dispute
- **The Fogger** — duplicates the veil
- **The Resonator** — every hit changes its neighbours; collides with the fixed
  choreography, because after two shots no announcement holds any more
- **The Swarm Node** — dangerous from three neighbours on; at 26 px "three or
  four?" is an eye test, not a communication task

**Merged:** brood fibre and root are absorbed into the **Colony** · the
Splitter is the **Crystal** · the Inverter is the **Choke** · the runt cloud is
a later stage of the **Runt**

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
