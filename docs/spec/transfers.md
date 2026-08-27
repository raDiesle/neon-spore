# What to take from the two reference points

> **Status: none of it built, and none of it accepted.** This is a reading of
> two games against this one's constraints, not a plan. An entry leaves this
> page in one of two directions: into [the idea store](ideas.md) as a bullet
> somebody can work out, or into the refusals at the bottom, with the reason it
> did not survive the trip.

[overview](overview.md) names Spaceteam, Lovers in a Dangerous Spacetime and
Keep Talking and Nobody Explodes as reference points, and calls Spaceteam the
closest. Naming a reference point is not the same as having read what it does.
This page is that reading, mechanism by mechanism, for the two that are about
*two people operating one machine* — the third is about a manual, which is a
different problem.

Most of what comes back is already here under another name, and saying so is
half the value: an idea that arrives twice from two directions is a strong
idea, and an idea already refused for a good reason should not be re-imported
because a famous game does it.

## The filter

Five tests. Anything that fails one is not a smaller version of itself, it is
a different game.

1. **It survives the delay.** 0.5–2 s of voice ([latency](latency.md)), so a
   mechanic hangs off the beat, never off the word "now".
2. **Nothing travels.** No flight, thrust, dodge or jump
   ([roles](roles.md#there-is-no-ship-movement)). A station you run to is a
   thumb that moves, or it is nothing.
3. **It reads at 26 px in portrait.** Two devices, no shared screen, one
   silhouette per kind ([graphics](graphics.md), [bestiary](bestiary.md)).
4. **It asks the pair something new about each other**
   ([overview](overview.md#11-the-guiding-question-for-every-new-idea)), rather
   than asking one player to be faster.
5. **It never needs to know what was said** — rule 4 in `CLAUDE.md`. Both of
   these games are loud; neither of them listens, and neither may this one.

And underneath all five: integers, the seeded `Rng`, the tick counter. A
mechanism whose effect is a wobble in wall-clock time cannot exist here at all.

## Spaceteam

### What it actually does

| Mechanism | Here already as | Verdict |
|---|---|---|
| The instruction is printed on the wrong person's device | the whole of [announcing](couplings.md), and the radar split | built, in its own form |
| Controls named in absurd, precise words you must say exactly | naming rule 3, [bestiary](bestiary.md#naming) | half of it is new — see **Call signs** |
| A panel that is destroyed and replaced mid-round | the **Choke**, which shuts one control | designed; see the note below |
| A timer bar on every instruction | the falling creature, the beat | built, and better — the clock is shared |
| The wormhole: the screen flips over | nothing | new — see **The Flip** |
| The asteroid: both swipe the same way at the same moment | [warding](couplings.md#1-warding--built) | built |
| Everything generated fresh per round | refused; [structure](structure.md) fixes the choreography | refused, see below |

**The Choke is the panel breaking, and it should be built as one.** The design
already has a creature that "docks on, shuts one control"
([bestiary](bestiary.md#101-the-first-thirteen)). What Spaceteam adds is the
implementation note rather than the idea: control visibility is a per-wave
constant today (`controlsForKinds`, [systems](systems.md#51-control-visibility-principle-a--built)),
and the Choke is the same table asked again in the middle of a wave. Whoever
builds it is changing when that function is called, not inventing a rule.

### Call signs

Eleven columns are eleven numbers today, and "seven" and "eleven" over a laggy
channel share a vowel and an ending. The bestiary already has a rule about
this for creatures (naming rule 3) and the field never got the same treatment.
Spaceteam's nonsense words are not comedy first: they are chosen to be
unmistakable when yelled, and that is the transferable half.

The trade is real and it goes both ways, which is why this is a question and
not a change. Numbers carry order for free — "two left of you" needs no
memorising, and a pair invents it themselves in the first minute. Names have
to be learnt before they help, and eleven of them is a vocabulary lesson in
front of a game that teaches by playing ([briefings](briefings.md)). The
likely answer is neither: keep the numbers and fix only the collisions, or
name the five that matter and count from them.

### The Flip

Spaceteam's wormhole turns one player's screen upside down, and the moment is
the best thing in the game: your partner's directions stop meaning what they
say, and you have to hear "left" and do the opposite, out loud, together.

Here it would be the field's column order reversed for one player — column
four on one device is column eight on the other. That is precisely the shape
of **The Mirror** and **The Translator**, both examined and rejected
([bestiary](bestiary.md#103-examined-and-rejected)) as "pure UI confusion",
and the rejection is right about the version that was proposed. What makes the
Spaceteam version work is the one thing the rejected version lacked: **the
world explains it**, loudly, in an animation you cannot miss, and it is
temporary. A silent disagreement between two screens is a bug the pair will
report. A field that visibly rolls over, for eight beats, with a sound, is a
mechanic.

So this is a refusal reversed on a condition, and the condition is the whole
of it: no flip that is not announced by the field itself, on both devices —
the player whose picture turned needs to know it turned, and the player whose
picture did not needs to know theirs is now the odd one out.

### The Fork

Between waves Spaceteam has the warp jump: everything stops, and the round
only continues when both people commit. This game has nothing there — a wave
ends and the next one starts.

Two things fit in that gap. The small one is the commit itself: the next wave
begins when both thumbs are down, which is the only moment in the run that
belongs to the pair rather than to the clock, and the only place they can
choose to breathe. The larger one is a choice attached to it, which is where
Lovers in a Dangerous Spacetime comes in: its levels fork, and picking a route
is a decision made out loud. Give each player half of what is known about the
two routes — the pilot the rock traffic, the navigator the colour mix — and
the fork is an announcement with a decision at the end of it, at zero timing
pressure. Everything else in this game is an announcement under a falling
object.

The friction is bookkeeping: waves are numbered and save points hang off the
numbering ([structure](structure.md), open question 11).

## Lovers in a Dangerous Spacetime

### What it actually does

| Mechanism | Here already as | Verdict |
|---|---|---|
| Stations only one pair of hands can be at | THE GRIP, and its price ([assists](assists.md#64-the-grip--keep-watch-built)) | built |
| Running between stations; travel time is the cost | nothing travels; the thumb does | see **Reach** |
| A shield covering one arc, rotated to face the threat | the shield's column | built |
| A central weapon both players charge | the **Reserve** ([assists](assists.md#61-the-three-forms)) | designed, convergent |
| Captives collected by flying to them | the **pod**, which comes to you instead ([systems](systems.md#57-power-ups--the-pod-built)) | built, re-designed |
| Fires and breaches on your own ship, patched by hand | nothing — the hull is mute | new — see **The Patch** |
| Both avatars on one screen: you watch your partner scramble | nothing; two devices | new — see **The Other Hand** |
| A companion who mans a station badly | nothing | refused, see below |

### The Patch

The hull is the only element nobody operates, and
[open question 17](open-questions.md#from-the-raster-round) asks whether it
should stay that way. This is the answer that game already worked out: damage
is not only a number going down, it is a **job appearing**. A breach in that
game pulls you toward it and somebody has to leave their station to close it.

Here the material is already on the field. A scar is permanent and sits at a
column (`Scar`, [systems](systems.md#58-overall-behaviour-in-the-raster--built)),
and there is already a gesture for a hand held on something — the grip, whose
price is the thumb. Point it inward: a fresh scar leaves that column open, so
the cannon cannot fire through it or a hit there costs double, until somebody
holds a hand on it for a few beats. The hull stops being scenery, the cost of
a miss stops being a number, and the pair gets a new sentence they never had
to say before: *let it through, I'm holding the hole.*

### The Other Hand

The whole feeling of that game is watching your partner run — you can see that
they are busy, and it changes what you ask of them. Two devices lose it
completely, and it is the one thing the split screen was better at.

The recoverable half is small and it must stay small: your hull shows **that**
your partner's thumb is down, never **what** it is doing. A lobe brightens
while they hold something, and goes out when they let go. That is an input
fact, so it costs no rule and reads at a glance — and the restriction is the
design, not a limitation of it. Knowing which column they are on would replace
a sentence; knowing only that their hands are full changes which sentence you
say. If it turns out to give away too much, it belongs in
[assists](assists.md) with a price on it, like sharing sight.

### Reach

Nothing the pair controls traverses the field, but a thumb crosses a phone,
and that distance is currently an accident. When only one control group is
active, [control visibility](systems.md#51-control-visibility-principle-a--built)
gives it the full width and large buttons; when both are, they are small and
far apart. So the layout already hands a wave a difficulty knob it was never
designed with, and nothing in `packages/render/src/band.ts` was chosen for
that reason. Worth measuring before it is worth designing.

## Shapes

Both games are neon on black, and the convergence is not a coincidence — it is
what a glowing vector reads as on a small screen. What is genuinely
transferable is narrower than the look.

**The ship as one body with the stations as bumps on it.** Lovers draws a
rounded hull with its turrets and shield as coloured protrusions around the
rim, and this game builds its hull exactly that way already — cannon and shield
are lobes of one contour (`hullRadiusMul`, `bumpAdd`,
`packages/render/src/hull.ts`). What is not taken is the colour: those lobes
are the same as the body, so nothing says which hand answers for which. Colour
them by role and **The Other Hand** is already drawn.

**A panel is made, not grown.** Spaceteam's controls are hard-edged, labelled,
rectangular — the opposite of a blob, which is why they read as machinery. The
shape catalogue already has `slab` for exactly this (a superellipse, "made
rather than grown", [asset catalogue](../asset-catalogue.md)) and `glyphed`
for a rim of travelling notches, which is the shape a call sign or a codebook
key would live on. Neither needs drawing again.

## Animations

| Wanted | The nearest thing that exists | Note |
|---|---|---|
| The field rolling over (**The Flip**) | `TURN`, spare motion | it must be *slow enough to see*; the flip that is not watched is the rejected version |
| A lobe answering a partner's thumb | `SWELL`, spare motion | brighten on press, decay on release; no position, ever |
| A hand held on your own hull (**The Patch**) | `packages/render/src/grip.ts` | the beam and ring already exist, pointed the other way — the maw's trick |
| The pair committing to the next wave (**The Fork**) | `TOLL`, `HEAVE` | the one moment in a run with no falling object in it |
| Escalating alarm | the sound catalogue's spare cues | Spaceteam shouts; here the speech band stays clear ([audio](audio.md)), so it must be felt and not said |

**Screen shake is refused, and the reason is a rule.** Both games shake the
picture when something lands, and here the picture *is* the coordinate system:
own-motion never touches the lane
([systems](systems.md#58-overall-behaviour-in-the-raster--built)), because a
column has to mean the same thing on both devices while somebody is saying its
name. The hull may flinch. The field may not.

## Promoted to the idea store

Five bullets, in [ideas.md](ideas.md), under the group each would become:
**The Patch**, **The Flip** and **The Fork** as mechanics, **Call signs** and
**The Other Hand** as controls. Nothing was promoted as a creature, and that is
a finding rather than an omission: neither game gets its pressure from the
things that come at you, so neither has much to say about a bestiary. Both put
it on the controls, on what each person can reach, and on the shape of the
round.

Nothing was promoted as a boss either, and that was this page's blind spot
rather than a finding — a boss is where a shape is spent, and both games keep
their best pictures at that size. [transfers-bosses](transfers-bosses.md) fills
it in, and promoted three more.

## Refused, with the reason

- **Procedural generation per round** (Spaceteam) — the choreography is fixed
  and the randomness rule is deliberate: same wave, same run, and only what one
  player knows and the other does not stays random
  ([structure](structure.md#73-the-randomness-rule--built)). Chaos here would be
  chaos for both, which is a worse version of the veil.
- **Screen shake and tilt** — see above; the field is a coordinate system two
  people are naming out loud.
- **Nonsense vocabulary in full** — funny, and it collides with naming rule 3.
  The phonetic half survives as **Call signs**; the joke does not.
- **The companion at the second station** (Lovers, in single-player) — this
  game is for exactly two people, and a third pair of hands, however bad, makes
  one of them optional.
- **Free movement between stations** — nothing traverses the field. **Reach**
  is what is left of it, and it is a layout question rather than a mechanic.
- **One shared screen** — two devices is the premise, not a limitation to work
  around. What the shared screen bought is recovered, deliberately narrowed, as
  **The Other Hand**.
