# Tower defence, read for the three we already have

Ideas read off 2D tower-defence games — and, for the meteor, off the two
genres that are actually about a thing falling out of the sky — aimed at one
question: **what else can a slick, a bulb or a meteor be, without becoming a
fourth creature.**

`docs/borrowed.md` did this for two co-op games and came back with mostly `NO`,
because their unit of play is a character crossing a space and ours is a column.
This file has the opposite problem. Tower defence *is* our geometry — things
come down lanes at a fixed thing that shoots back — so almost everything
transfers, and the useful work is not finding ideas but **saying which ones the
game already has** and which of the rest are worth one wave.

Nothing here is built. Nothing here is a decision. It is a shelf.

## What the pictures are, and are not

Every image below is **linked, not copied** — the repository is public and none
of this art is ours. A picture is here because a sentence like *the shell cracks
as it takes damage* is a picture the reader has to build alone, and two readers
build two different ones. If one fails to load, the caption still says what it
showed. The one exception is the OpenGameArt meteor, which is CC-BY and could
actually be used.

## The verdict column

Same four words `docs/borrowed.md` uses, plus one this file needs.

| Verdict | Means |
|---|---|
| `BUILT` | we already have it, under another name — do not propose it again |
| `FIELD` | a wave could be played this way tomorrow, nothing travels |
| `HULL` | a persistent capability or mark, not a creature |
| `INTERLUDE` | its own round, its own rules — decisions #20 and #21 |
| `NO` | with the reason in the cell |

And a second column this file adds, because the ask was explicit that a borrowed
idea does not have to be co-op: **SOLO** means it works with one pair of hands
and gets *better* with two, rather than requiring them.

## The reference — Galaxy Defense: Fortress TD

It is the closest commercial thing to this field that exists, and the closeness
is not thematic. It is **vertical**: bodies fall from the top of a portrait
phone toward a fixed thing at the bottom that cannot move away, and the whole
game is what you do in the seconds while they fall.

![Galaxy Defense — a faceted dome across the full width of the screen, red spiked bodies falling into it from above, beams going out through it from the small figure underneath](https://play-lh.googleusercontent.com/O03fHRtIG_vMe6T87MokWwhgmeMRZkfdyiLkkolbH-gq4oeV-tZc14T8PCQHvpiR1ux6WszD8GnpA8CdElUwzg=w720)

*The full-width barrier, which is the single most transferable object in the
game — see `CANOPY` below. Note that it is drawn as a faceted shell rather than
a glow, so you can see how much of it is left.*

![Galaxy Defense — a boss: a large black body with red lobes and several red eyes, filling the upper half of a portrait screen, with a red boss bar across the top reading x10, small spiked minions falling around it, and a green arc of shield over the figure at the bottom](https://play-lh.googleusercontent.com/5K9lEQuuY24bLOCivmhF0GN13fYduVJw6NUlMKBT3FxVkbMzd6DPt5X_sOglG5pvc-fG1d6opWDy1mm5ndnUxw=w720)

*Their boss is a **blob with lobes** — closed contour, red bulges, eyes as
lights on the body rather than as a face. That is `blobPath` and `hullRadiusMul`
drawn by somebody else. The `x10` on the bar is worth stealing on its own: it
says "this body is ten of the ones you have been killing" without a number of
hit points anywhere.*

*And the small bodies falling around it are the second half of the frame:
spiked discs with pale spots, and capsules wearing a fringe of fine hairs.
Both read as microbes, both are unmistakable at a size where a face would not
be, and neither of them is doing it with colour. All three are converted below.*

![Galaxy Defense — a level-up screen offering three cards: Thunder Boost, Piercing Bullets, Beam Intensity, above a row of five turret icons](https://play-lh.googleusercontent.com/CL6q05G7ZHyGEeb2pioRYDEpiAmo1_39NoF9ZMhA3HU6lpVLYkmUMbM9gwfbUF4f2dobznnu8fCF68ADFx36_g=w720)

*Its weapon vocabulary, in one screen: gun, beam, piercing shot, chain
lightning, and a slowing turret. Five verbs, and four of them are on the shelf
below. The card-choice framing is `INTERLUDE` at best — a between-waves choice
is a round of its own — but the verbs are `FIELD`.*

Sources: the [Play listing](https://play.google.com/store/apps/details?id=com.cyberjoy.galaxydefense),
[BlueStacks' beginner guide](https://www.bluestacks.com/blog/game-guides/galaxy-defense-fortress-td/gdftd-beginners-guide-en.html)
and [a strategy write-up](https://mturbogamer.com/2025/05/galaxy-defense-fortress-td-guide-tips-strategy/).
Its own wiki is empty, so the enemy taxonomy below is read from other games.

## First: what we already have

Half of what a tower-defence wiki calls an enemy modifier is in
`packages/content/src/creatures.ts` already, under our own names. Proposing it
again is the most likely way to waste a session, so it goes at the top rather
than in a footnote.

| Modifier, as tower defence names it | We call it | Where |
|---|---|---|
| speed tiers of one body | the meteor ladder | `meteorMedium` to `meteorFastest`, five of them |
| a big fast variant | `torch` | twice as wide, fastest thing on the field |
| armour stripped before the body can be hurt | `shell` | two columns, one plate each, hidden colour underneath |
| invulnerability phases on a clock | `throb` | only a shot while it is swollen lands |
| camouflage — invisible to all but one answer | `lure` | and it is worse than camouflage: shooting it costs the hull |
| a boss that spawns | `queen` | drops a torch out of a socket every eight beats |
| a boss with a moving weak point | `warden` | the hole slides, the core stands in it two beats |
| a body answered by hand rather than by a weapon | `tether` | dragged aside by the pilot |

So the shelf below deliberately avoids all eight. What it looks for is the
modifiers nobody here has spent yet.

## The slick and the bulb — changing an aim target

Player 2 holds the cannon; player 1 reads the column. Every row's real cost is
**what has to be said out loud**, so that column is in the table.

| Name | What changes | Read off | What the pair now has to say | Solo | Verdict |
|---|---|---|---|---|---|
| `SPLIT` | one hit does not kill it — it becomes two half-size bodies in the two neighbouring columns | Asteroids; the Bloons ceramic | one column becomes two, mid-sentence | yes | `FIELD` — the strongest row here |
| `RIND` | three hits, and it visibly sheds a layer and gets smaller each time | Bloons ceramic, PvZ bucket-head | "again", twice — and the size is the health bar, so no bar is drawn | yes | `FIELD` |
| `RECOIL` | a hit throws it back up two rows instead of killing it, once; it vents fire downward as it goes | the PvZ pole vault, inverted | "it is coming again" — a column you had finished is live | yes | `FIELD` |
| `DRIFT` | changes column every four beats while it falls | the PvZ balloon zombie | the column has to be *re-said*, which is the first time a call goes stale | no — this is the co-op one | `FIELD` |
| `FACE` | leans one way, armoured on the side it leans; only a shot from the column it is turned away from lands | the PvZ screen door | player 1 sees the lean, player 2 cannot — a second thing to say beside the column | no | `FIELD` |
| `CREEP` | half speed, and it will not die until the fast one behind it has passed through | tower-defence tanks and swarmers mixed in one wave | ordering — "leave that one, take the second" | yes | `FIELD` |
| `BLOOM` | small and harmless at the top, wider every row, hull-killing by the bottom | growth-on-approach, common to lane defence | urgency, without a timer drawn anywhere | yes | `FIELD` |
| `BROOD` | drops a small body every four beats as it falls | Kingdom Rush spawners | two calls at once from one arrival | yes | `FIELD` |
| `MEND` | if not finished within six beats it goes back up a layer | the Bloons regrow bloon | "finish it" as an instruction with a deadline | yes | `FIELD` |
| `CHAIN` | two bodies joined down one column; the upper cannot be hit until the lower is gone | Kingdom Rush shielded pairs | nothing new — which is why it is the weakest row here | yes | `FIELD`, low value |
| flying over the defence | — | PvZ balloon, tower-defence flyers | — | — | `NO` — there is no over. The hull spans the field and the columns are the whole world |
| an enemy that attacks the towers | — | most tower defence | — | — | `NO` — the cannon and the shield cannot be destroyed without the field becoming unplayable mid-wave |

### The five worth a picture

![Asteroids — a vector screen of white outlined rocks of three sizes with a small ship among them](https://upload.wikimedia.org/wikipedia/en/thumb/1/13/Asteroi1.png/250px-Asteroi1.png)

**`SPLIT`, from Asteroids (1979).** One big rock becomes two medium, each medium
two small. It is the oldest idea in this file and still the best, because it is
the only one that turns *a good shot* into *more work*, which is exactly the
shape a wave wants at its end. Ours would be gentler: one body, one split, two
half-size children in the neighbouring columns, and the children die to one
shot. Note what it does to the pair — player 1's single call becomes two calls
in the time it takes player 2 to reload, and neither of them planned it.
Source: [Asteroids](https://en.wikipedia.org/wiki/Asteroids_(video_game)).

![Bloons TD — a ceramic bloon: a hard tan shell over a coloured balloon, the shell drawn with visible seams](https://static.wikia.nocookie.net/b__/images/8/8d/BTD6Ceramic.png/revision/latest?cb=20200616232120&path-prefix=bloons)

**`RIND`, from the Bloons ceramic.** Its shell **cracks visibly** with each hit
and the balloon underneath starts to show, so the player reads remaining health
off the body rather than off a bar. We can do better than crack: shrink. A
slick that is three sizes and loses one per hit says *two more* in a way no
number does, and it reuses `hullRadiusMul` rather than adding a health readout
to a field that has none.
Source: [Ceramic Bloon](https://bloons.fandom.com/wiki/Ceramic_Bloon).

![Plants vs Zombies — the screen door zombie, carrying a screen door in front of it as a shield](https://static.wikia.nocookie.net/plantsvszombies/images/6/63/Screen_Door_Zombie1.png/revision/latest)

**`FACE`, from the screen door zombie.** Its door stops everything from the
front and nothing from behind or below. The lesson is not the door, it is that
**armour with a direction is a fact you can see and your partner cannot** — and
that is our whole design. Player 1 reads the lean off the radar, player 2 has a
cannon that must be on the *other* side. It is the pod's shape with no new
control: one player supplies the fact, the other spends it.
Source: [Screen Door Zombie](https://plantsvszombies.fandom.com/wiki/Screen_Door_Zombie_(PvZ)).

![Plants vs Zombies — the pole vaulting zombie, running with a vaulting pole held level](https://static.wikia.nocookie.net/plantsvszombies/images/f/fe/Pole_Vaulting_Zombie1.png/revision/latest?cb=20230830191502)

**`RECOIL`, from the pole vault, turned upside down.** The vaulter spends one
leap and is ordinary afterwards; ours would spend one *hit*, be thrown two rows
back up on a jet of its own fire, and come down ordinary. The value is the
sound the pair makes when a column they had closed reopens — and the jet gives
the renderer something to draw that is not another particle burst.
Source: [Pole Vaulting Zombie](https://plantsvszombies.fandom.com/wiki/Pole_Vaulting_Zombie).

![Plants vs Zombies — the balloon zombie, hanging under a red balloon](https://static.wikia.nocookie.net/plantsvszombies/images/6/68/Balloon_Zombie1.png/revision/latest)

**`DRIFT`, from the balloon zombie**, which floats over the defence until the
balloon is popped and then drops into the lane it happens to be over. We cannot
have *over*, and we do not want it. What survives is the half that matters here:
**a body whose column is not the column it was announced in.** It is the only
row in the table that makes a call go stale, and a stale call is the one thing
this game has that no single-player tower defence can have.
Source: [Balloon Zombie](https://plantsvszombies.fandom.com/wiki/Balloon_Zombie).

## The meteor — changing a guard target

Player 1 holds the shield; player 2 reads it coming. A meteor cannot be shot, so
every row here is about **timing, width or duration** rather than damage. This
is the thinner list and that is honest: a rock has fewer knobs than a body.

| Name | What changes | Read off | What it asks of the pair | Solo | Verdict |
|---|---|---|---|---|---|
| `SHARD` | catching it does not end it — it breaks into two smaller rocks in the neighbouring columns, which fall on | Asteroids again | one guard becomes two, and the shield is in the wrong place for both | yes | `FIELD` — the best row here |
| `HAIL` | three small rocks in one column, one beat apart | tower-defence swarms | the answer is *hold*, not *time* — the first mechanic where duration beats precision | yes | `FIELD` |
| `CRUST` | two catches: the first cracks it and slows it, the second ends it | Bloons ceramic, again | patience, on a body that is still falling | yes | `FIELD` |
| `VEER` | changes column once, at a fixed row, always the same way | tower-defence path switches | player 2 announces a column that is about to be wrong, on purpose | no | `FIELD` |
| `SURGE` | accelerates as it falls instead of falling at one speed | gravity, which the ladder does not model | every timing the pair learned on the ladder is wrong for this one | yes | `FIELD` — and nearly free: the ladder is five constants |
| `EMBER` | leaves its column burning for two beats after it is caught; the cannon cannot fire through a burning column | area denial, common to tower defence | player 2 loses a column to player 1's success | no | `FIELD` |
| `ANVIL` | two columns wide and slow; a catch turns it aside rather than stopping it, and it lands one column over | knockback and deflection | "catch it *left*" — the first time the shield has a direction | no | `FIELD` |
| `SMART` | a catch that only grazes it does not stop it: it corrects its column and comes on | the Missile Command smart bomb | "you missed, it is in four now", said in the half-second there is for it | yes | `FIELD` |
| a rock that heals other bodies | — | tower-defence healers | — | — | `NO` — nothing on the field has hit points to heal, and giving it some is a different game |
| a rock that must be dug out after it lands | — | burrowers | — | — | `NO` — the hull is not a surface things sit on |

### Missile Command, which is the meteor's real reference

![Missile Command — a dark screen with cities along the bottom, missile trails coming down from the top in long straight lines, and round explosions blooming where they have been intercepted](https://upload.wikimedia.org/wikipedia/en/thumb/8/86/A5200_Missile_Command.png/250px-A5200_Missile_Command.png)

Atari, 1980, by Dave Theurer. Missiles rain down a screen at six cities that
cannot move, and the player defends by putting an **explosion at a point in the
sky** — anything that enters the fireball dies. You are not aiming at the
missile. You are aiming at where it will be, early enough that the bloom is
already there when it arrives.

That is our shield, one step less abstract, and it makes this game a better
reference for the meteor than any tower defence on this page — tower defence is
about *what you built before the wave*, and this is about *where you put a thing
in the next second*, which is the only question player 1 ever has.

Two of its mechanics are already rows above, and it is worth saying that they
are its rather than ours:

- **MIRV splitting.** A missile breaks into several independently-aimed
  warheads part-way down. That is `SHARD`, invented forty-six years earlier and
  tuned by an arcade.
- **Smart bombs**, which steer around an explosion that was not placed well
  enough. That is `SMART`, and it is the sharper of the two for us: a shield
  that half-works is a much more interesting failure than a shield that misses,
  because the pair has to notice the difference and say so.

One thing it has that we should not take: its cities stay dead. The hull is one
number and a wave is a sentence; a field that is visibly two-thirds destroyed by
beat forty is a field the pair has already stopped talking about.

Source: [Missile Command](https://en.wikipedia.org/wiki/Missile_Command).

## Bullet hell, and the one thing that survives it

Japanese *danmaku*, "bullet curtain" — a sub-genre of vertical shooters where
the screen fills with hundreds of slow, **patterned** projectiles and the game
is reading the pattern rather than reacting to any one bullet. Batsugun (1993)
started it; DoDonPachi, Ikaruga, Mushihimesama and Touhou are the names.

The mechanic is `NO`, and the reason is one line: its verb is **dodging**, and
`CLAUDE.md` forbids travel outright. There is nothing to salvage by making the
hull narrower or the bullets slower — a bullet-hell screen answered by a shield
that slides along a rail is a screen you cannot survive, and one answered by a
shield that covers everything is not a screen at all.

What survives is not a mechanic. It is **the way arrivals are shaped**. A wave
here is creatures in cells; danmaku thinks in rings, spirals, walls and fans,
and the player learns to recognise a pattern *as a named thing* and answer it
with one decision instead of twelve. A rock formation the pair calls by name —
"it is the fan" — is a real idea, and it is the only one in this file that lands
in wave authoring rather than in a creature or a control. Whether seven columns
is enough width for a pattern to be recognisable at all is the open question,
and it is answerable by drawing four of them on paper before anything is built.

Sources: [Bullet hell](https://en.wikipedia.org/wiki/Bullet_hell) and
[Touhou Wiki on danmaku](https://en.touhouwiki.net/wiki/Danmaku). The Neon
Pulsefire pictures in the next section are also danmaku, and are the clearest
look at what a bullet curtain actually is.

## Neon Pulsefire — for the look, not the mechanics

[Neon Pulsefire](https://store.steampowered.com/app/4402170/Neon_Pulsefire/)
(Marian Kunz, June 2026) is a bullet-heaven roguelite, and its *mechanics* are
almost entirely `NO` here: it is an arena, the player moves, and the build is
the game. Its **drawing** is the closest thing on this page to what this project
is already trying to be, which is why it gets a section rather than a row.

![Neon Pulsefire — a black arena over a starfield, filled with outlined neon shapes: green squares, green four-petal rosettes, magenta starbursts, a swarm of small magenta bullets, and yellow damage numbers](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/159568f45292404405619e1fb166743f9b5cdc1b/ss_159568f45292404405619e1fb166743f9b5cdc1b.1920x1080.jpg?t=1782154921)

**Shapes.** Every body is an *outline with a glow and no fill*. A hexagon, a
square, a four-petal rosette, an arrowhead. Nothing is rendered — everything is
drawn — which is exactly the register `blobPath` works in, and it is proof at
scale that a silhouette alone carries a creature's identity with no texture
under it.

**Colour.** Green is one kind, blue is another, magenta a third, yellow a
fourth, and the rule never bends: one kind, one colour, one shape. That is
`packages/content/src/creatures.ts`'s own rule, being obeyed by somebody with
twenty kinds where we have thirteen. Worth reading as confirmation that the
ceiling is higher than it feels from inside.

![Neon Pulsefire — the same arena with a ring-shaped boss made of a core inside a circle of orbiting nodes, a red laser line cutting diagonally across the whole arena, and dense swarms of blue hexagons and yellow arrowheads](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/7dc4a3a03092b65a9ed8ea2b4c92cf8df5be0c3b/ss_7dc4a3a03092b65a9ed8ea2b4c92cf8df5be0c3b.1920x1080.jpg?t=1782154921)

**Bosses.** The one in this frame is a **core inside a ring of orbiting nodes**,
which is very nearly `warden` arrived at independently, and is the strongest
argument on the page that the ring-with-a-hole reads. What it does that ours
does not is let the nodes *orbit*: the ring turns, so the gap between two nodes
is a moving opening rather than a drawn one. That is a look question for the
warden's hole and belongs in a VERSUS pair, never straight onto the field.

**The hazard beam.** The red line cutting the arena is a third thing on the
screen that is neither enemy nor player — an area simply forbidden for a while.
`EMBER` above is that idea at one column's width, and this is what it looks like
drawn as a line rather than as a stain.

![Neon Pulsefire — a menu screen: magenta and cyan neon outlines on black, hexagonal stat icons in a column, glowing card frames, and outlined display type](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/501924c57d6a978e9203c6f1fbe2466f7986d1b3/ss_501924c57d6a978e9203c6f1fbe2466f7986d1b3.1920x1080.jpg?t=1782154921)

**Animation and interface.** Everything glows, and the glow is the whole
lighting model — no shadow, no light source, a body lit by being the thing that
emits. That is not what `docs/dimensional.md` is reaching for, and it is the
honest alternative to it, so it belongs here as the other answer rather than as
a competitor. The interface is worth reading closely for the director as much as
for the game: outlined display type, hexagonal icons, and a strict two-colour
split between what you have and what you could take.

The one thing to **not** take is in every frame: the damage numbers. That game
is a build, so its numbers are the point. A wave here is a sentence, and a
number floating off a body is the fastest way to make the pair read instead
of talk.

### Three more frames, and the one thing they all say

Three of that game's six screenshots were not read when the section above was
written. They are worth a subsection because the finding in them is not a
shape, it is a rule, and it is one sentence: **the glow is not decoration, it
is state.** Everything alive, available, close or dangerous glows; everything
locked, spent, distant or inert is the same drawing with the glow taken off.
That is a lighting model doing the job a colour or a label would otherwise
have to do, and it is the argument for a `GLOW` axis on SHAPES rather than a
brightness slider — see the queue entry `A FOURTH AXIS ON SHAPES: GLOW`.

![Neon Pulsefire — an arena at speed: a small magenta ring-of-nodes at the centre inside a dashed magenta circle, a swarm of green outlined squares sitting under one soft green cloud, loose yellow arrowheads, a line of blue hexagons, a red boundary line with a hard core and a wide bloom, and distant red enemies drawn as smears of red haze with a hairline ring inside](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/9b09ed8a1a1eca7eec7065da18851dca2e838f38/ss_9b09ed8a1a1eca7eec7065da18851dca2e838f38.1920x1080.jpg?t=1782154921)

Five things in this frame that the section above did not have:

**The bloom belongs to the swarm, not to the body.** The twenty green squares
are not twenty glows; they are one soft green cloud with twenty hard outlines
punched into it. That is cheaper than a per-body halo and it reads as *a
group* — which is the thing a column of falling slicks has never had a way to
say. Worth knowing before anybody writes a per-creature aura: the per-body
version of this look is the expensive one *and* the weaker one.

**Distance is drawn as glow-without-outline.** The red bodies at the edges are
almost entirely haze with a one-pixel ring inside. Near ones are almost
entirely outline. So the same body walks a ratio between the two, and nothing
about its shape changes. That is a depth cue this project has been reaching
for in `docs/dimensional.md` by other means, arrived at with no shadow at all.

**A trail is dots, not a ribbon.** The projectile leaving the player leaves a
row of separating dots that shrink behind it, not a tapered stroke. It costs
nothing to draw and it says speed better, because the *gaps* are the reading.

**The telegraph is a dashed ring and it is never filled.** The magenta circle
around the player is drawn as a dashed outline over the field, and everything
under it stays legible. A filled indicator would have hidden the swarm it is
warning about, which is the trap `EMBER` walks toward.

**The hazard beam is a hard core inside a wide bloom**, with small ring nodes
at the corners where it turns. The core carries the position, the bloom
carries the threat, and they are two different widths of the same line.

![Neon Pulsefire — a level-up screen: three glowing offer cards in cyan and magenta beside a fourth that is grey and unlit and reads LOCKED, a column of hexagonal stat icons, and hollow outlined display type whose fill is its own glow](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/4a0320619bbc1760cc98cb5c69c6092b07508b19/ss_4a0320619bbc1760cc98cb5c69c6092b07508b19.1920x1080.jpg?t=1782154921)

![Neon Pulsefire — an achievements list: two rows lit magenta and two rows grey and unlit, each with a white line icon at the left, a glowing rule along the bottom standing in for a progress bar, and sheared parallelogram tabs above](https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/4402170/52c6adb6fb0688447969221ab8cbc3c8304d89bb/ss_52c6adb6fb0688447969221ab8cbc3c8304d89bb.1920x1080.jpg?t=1782154921)

The two interface frames say the same rule twice, and they are the clearest
statement of it because the drawing does not change at all: the LOCKED card
and the unearned achievements are the identical geometry with the glow
removed. No grey-out, no reduced opacity, no diagonal hatch. **Off is
unlit.**

Three smaller things from them, all of which are the director's business
before they are the game's: display type drawn hollow so that its glow is its
fill; a progress bar that is a glowing rule under a row rather than a track
with something in it; and an icon set that is a hexagon with one line glyph
inside — one frame, twenty meanings, which is a solved version of the problem
`shapes-all.ts`'s body picker has.

What still does not transfer is what did not transfer before: the damage
numbers, and now also the halftone dither visible inside the green cloud. That
dither is how that game gets a soft gradient out of a hard renderer, and a
canvas has `createRadialGradient`, so copying it would be importing a
workaround for a constraint we do not have.

## What the hands get — weapons and helping systems

The other half of the ask, and the half Galaxy Defense is actually about. The
rule that decides these is `CLAUDE.md`'s: **nothing the players control
travels**. A turret you place would violate it; a *region* you paint does not,
and neither does a barrier that appears where it is. So the shelf is regions,
barriers and shots — never a unit.

Every one of these needs paying for, or it is simply a better cannon. The two
honest currencies are a **cooldown in beats** and a **charge earned by kills**.
Galaxy Defense uses the second and puts it on a bar; we already have
`shotChargeBeats`, which is the first.

| Name | What it does | Whose hands | Read off | Solo | Verdict |
|---|---|---|---|---|---|
| `CANOPY` | a barrier across the **full width** above the hull; absorbs three hits, then shatters; nothing can be fired out through it either | player 1 — and while it is up the shield cannot be used | the Galaxy Defense dome | yes | `HULL` — the strongest item on this page, and the one the ask named |
| `MOLASSES` | paints a band of rows where everything falls at half speed for six beats | player 1 | the Galaxy Defense slowing turret, the Bloons ice monkey | yes | `HULL` — buys the pair the one thing they never have, which is time to finish a sentence |
| `ARC` | one shot that jumps to both neighbouring columns at half strength | player 2 | tesla and chain-lightning towers | yes | `FIELD` — the answer to `SPLIT` and `HAIL`, which is why it should land after them, not before |
| `RAIL` | hold three beats, then one shot that goes through every body in the column | player 2 | the rail gun and piercing bullets | yes | `FIELD` |
| `SEEKER` | a slow shot fired from any column that curves to the nearest body | player 2, aimed by player 1 | homing missile turrets | no | `FIELD` — the purest pod: player 2 spends it, player 1 chooses what it finds |
| `STRIPPER` | a pulse that removes every armour and phase on the field for two beats — `throb` stays open, `shell` loses a plate, `FACE` turns to face you | player 1 | disruptor towers | yes | `HULL` |
| `DRAW` | pulls one body sideways by one column | player 1 | tractor and magnet towers | no | `FIELD` — it lets the pair *line two bodies up*, which is a plan rather than a reaction |
| `FLARE` | lights one column for two beats: whatever is in it is shown to **both** players, disguise included | player 1 | detector towers, camo | no | `HULL` — the honest counter to `lure`, and it costs a column of attention to use |
| `BUOY` | hangs a mine in a column; the next body to touch it dies | player 1 | mines and traps | yes | `FIELD` |
| `BRACE` | repairs one point of hull, between waves only | either | tower-defence repair | yes | `INTERLUDE` |
| placing towers on a map | — | — | all of tower defence | — | `NO` — a placed unit is a thing on the field that neither player is, and the field has room for exactly two people's attention |
| upgrade trees and gear | — | — | Galaxy Defense's chips and gear | — | `NO` — a wave is a sentence, not a build. If this ever comes, it comes as an `INTERLUDE` between acts |

`CANOPY` and `MOLASSES` deserve the same warning: both make the field *easier*
in a game whose difficulty is conversational, not mechanical. The interesting
version of each is the one that costs the other player something — a canopy that
also blocks the cannon, a slow field that also slows player 2's own shots
through it. Otherwise they are a button that says "be less bad".

## Bosses worth stealing a body from

Not mechanics — **shapes and motion**. Bodies here are closed contours with
lobes, so a boss reference is useful exactly when it is a silhouette rather than
a character.

![Kingdom Rush — Sarelgaz, a giant spider boss, animated](https://static.wikia.nocookie.net/kingdomrushtd/images/0/08/Sar.gif)

**Sarelgaz (Kingdom Rush)** — worth it for the animation rather than the body:
the legs carry a slow idle cycle while the abdomen holds still, so the thing
reads as alive when nothing is happening. That is `docs/alive.md`'s whole
question, answered by giving one part of the body a clock the rest does not
share.
Source: [Sarelgaz](https://kingdomrushtd.fandom.com/wiki/Sarelgaz).

![Kingdom Rush — Tyranthor, a large horned beast boss portrait](https://static.wikia.nocookie.net/kingdomrushtd/images/9/9e/EnemyBox_Tyranthor.png)

**Tyranthor (Kingdom Rush)** — the useful part is the read at thumbnail size:
one enormous mass, one bright mouth, and everything else dark. At 380 px wide a
boss gets about that much room, and this is what survives it.
Source: [Kingdom Rush bosses](https://kingdomrushtd.fandom.com/wiki/Category:Bosses).

Neon Pulsefire's ring-of-nodes boss has its own section above, and is the
fourth worth looking at — it is the warden, drawn by somebody else.

And the Galaxy Defense boss further up is the closest of the four to what this
game would draw: a lobed blob, lit from inside, with the minions it drops
falling around it as part of the same picture.

## Animations and effects worth stealing

![OpenGameArt — a small animated meteor sprite, rock with a fire trail, CC-BY](https://opengameart.org/sites/default/files/Meteor1.png)

**The falling meteor with a fire tail** the ask named. This one is
[CC-BY 4.0 on OpenGameArt](https://opengameart.org/content/meteor-animated-64x64),
so unlike everything else on this page it could actually be used or traced.
What it does that ours does not: the tail is **longer than the rock and behind
its direction of travel**, and it flickers on a faster clock than the rock
tumbles on. Two clocks, one body — the same trick as Sarelgaz's legs.

Three more, no picture needed because they are one sentence each:

- **The boss bar that says `x10`** rather than a number of hit points. Galaxy
  Defense, in the picture above.
- **Damage numbers rising off the point of impact** — Galaxy Defense again.
  Almost certainly `NO` for us: numbers on the field are the thing this game has
  managed to avoid, and one exception opens the door.
- **The barrier drawn as facets rather than as a glow**, so how much is left is
  visible in the shape. Directly relevant to our own shield, and the honest
  place for it is a VERSUS pair beside the shield we ship — see `docs/versus.md`
  and the rule in `CLAUDE.md` about offering a look rather than replacing one.

## Nova Drift — a line-up drawn as silhouettes

[Nova Drift](https://store.steampowered.com/app/858210/Nova_Drift/) is another
bullet-heaven roguelite and its mechanics are `NO` here for the same reasons
Neon Pulsefire's are: it is an arena, the player moves, the build is the game.
It earns a section for one reason, and it is a lucky one.

![Nova Drift — twenty-odd enemy designs drawn as flat white silhouettes on a dark starfield: winged arrowheads, a large round body ringed with triangular spikes over a skirt of hexagonal plates, a hollow hexagonal frame with two escorts, and a small body under a detached arc](https://static.wikia.nocookie.net/nova-drift/images/7/77/Enemy_slider.png/revision/latest?cb=20190813163415)

**Its own promotional line-up is drawn as flat white silhouettes on dark.** No
colour, no fill, no light — which is the exact test this project applies to
every body it draws, applied by somebody else to twenty-six of theirs. It is
the single most useful reference on this page for that reason alone: a
catalogue that has already passed the test we care about.

What reading it produced was mostly a list of things we have. The winged
arrowheads are `hooked` and `heeled`. The spiked ring is `THE RASP` at boss
scale. The skirt of hexagonal plates is `plated`, and the hollow hexagonal
frame is `THE CORONA` with corners. The small bodies flying in a fixed pattern
around a larger one look like a form and are not — `cluster` already draws
several bodies at a spread that never lets them merge, and a formation is that
tuned rather than something new.

One arrangement was genuinely absent, and it is the small body near the top
with an arc floating over it, touching nothing. That became `THE HOOD`.

Source: [the Nova Drift enemy list](https://nova-drift.fandom.com/wiki/Enemies),
twenty-six of them, in three strengths.

## What has been converted, and where it went

Three bodies out of that one frame, redrawn in this game's vocabulary. They are
in the catalogue as **free contours** — `tools/shape-sheet/src/drafts/tower-defence.ts` —
so they are on the director's `◇ NOT BUILT YET` → SHAPES tab, animated, beside
every shape the game already draws and every spare one. That is the only place
a silhouette can actually be judged: a card here would be a picture at whatever
size the column happened to be, and the question about all three is what they
do at 26 px.

### The bodies

| Converted | From | The claim | What to look at |
|---|---|---|---|
| `THE BURR` | the Galaxy Defense stage boss | a heavy lobed body wearing blunt knobs, with a crown of longer ones on top | does the crown read as a *front*, or only as a rim that got untidy |
| `THE RASP` | its small spiked discs | a small round body under a ring of twenty short spines | does a spine survive a phone, where it is one pixel and the slick's own wobble is already ragged |
| `THE BRISTLE` | its capsules | a squared-off lozenge in a fringe of forty-four fine hairs | is a hair distinguishable from a spine at all, or only in the source file |
| `THE CORONA` | Neon Pulsefire's ring boss | eleven nodes on a turning ring, two of them missing, so one wide opening comes round every six beats | is an opening that *arrives* better than the warden's, which is moved |
| `THE RIND` | the Bloons ceramic | three sizes stepped down, the rim smoothing as it goes | does the step read as an event — the thing that makes a player say "again" — or as a body breathing |
| `THE CANOPY` | the Galaxy Defense dome | a faceted arc over the whole hull with two facets spent out of the middle | can you see *which part* is gone at the width the hull gets, and is that worth more than a glow getting dimmer |
| `THE SMART` | Missile Command's smart bomb | an ordinary rock — the argument is entirely in how it moves | see `SETTLE` below; the body is only there to carry it |
| `THE HOOD` | Nova Drift's line-up | a body with an arc standing over it, attached to nothing | is the arc plainly a *separate object* rather than a rim that has come loose |
| `THE HOOD — BROKEN` | the same, with the guard gone | identical in every parameter except that the arc is absent | does the bare body read as *exposed*, or merely as smaller — the pair of cards is the proposal, neither one alone |

### The motions

Three, in `motions/borrowed.ts`, on the same tab. A motion is judged in the
motion view rather than in a still, and each of these had to earn a signature
no existing one carries — a fourth candidate was dropped for failing that, a
strobing invulnerability, which is `SWELL` with a harder edge and is `throb`
besides.

| Converted | From | What it does | Judge it against |
|---|---|---|---|
| `RECOIL` | the PvZ vault, inverted | knocked back hard, drifts down slowly, then **holds** for over half the cycle | `HEAVE`, which never stops — the hold is the whole difference and it is what reads as *coming on again* |
| `TUMBLE` | the meteor sprite's fire tail, and Sarelgaz's legs | a slow rotation with a tremor at seventeen times its rate riding on it | `TURN`, which is the same rotation with nothing on it. The pair asks whether a second clock is visible at 26 px or is simply noise |
| `SETTLE` | Missile Command's smart bomb | wanders off its line over four beats, then snaps back onto it in half of one | `LURCH` and `CANT`, which both travel and both stay. This is the only one that returns, and the asymmetry is the tell: eased home reads as loose, snapped home reads as steered |
| `WIND` | Ikaruga's third-chapter boss | spins faster and faster over twelve beats, then lets go and starts again from nothing | `TURN` and `TUMBLE`, which both hold one speed. A constant rate says machinery or alive; a climbing rate says *about to*, and it is the only way a silhouette can carry a countdown without the eye leaving the field for the radar strip |

One thing the cards cannot hide, and it is worth knowing before looking at
them: a card fits its whole subject to the frame, so `THE HOOD` draws its
*body* smaller than `THE HOOD — BROKEN` draws the same body, because the arc is
inside the fit. That is not a bug in either card. It is the 26 px question
arriving early — a body that has to share its frame with its own guard has less
room to be legible in, and that is a real cost of the idea rather than an
artefact of the sheet.

`TUMBLE` is the cheapest thing on this page and the one worth trying first. It
costs nothing in silhouette, it is one extra term in a pose, and the whole
observation behind it is that a body with one clock reads as drawn while a body
with two reads as alive.


**Converted, not copied.** What crosses over is the claim the outline makes,
or the timing.
What is left behind is everything the source says with fill and light — the
interior blisters, the bright pustules, the pale core inside the capsule — none
of which reaches a phone, and all of which would make these pictures of a
picture rather than proposals about a silhouette. The boss's bright swellings
are the one real loss, because they are what give that body a front; `THE BURR`
argues that length can say it instead, and that argument is the card.

They are `free` rather than `draft` deliberately. A draft is drawn *at* a named
idea in `docs/spec/ideas.md` and carries its name; nothing here is one, and
marking one a draft would quietly promote a row off a page that says of itself
that it is a shelf. A free contour is a picture looking for a behaviour, which
is exactly what these are — and handing one to a bestiary entry is a decision
somebody makes by looking at it.

Three pieces of machinery were needed. `forms/studded.ts` is a rim of the same
feature repeated, with `width` and `blunt` separate so that a club, a spine and
a hair are three points on one axis rather than three forms — the first cut had
them as one number and produced a cog, which is the whole reason they are two.
`forms/haloed.ts` is a ring whose nodes travel, so the gap between two of them
comes round rather than being moved. `forms/spanning.ts` holds the two that are
not bodies at all: the barrier, and a shell coming off in steps.
`forms/detached.ts` holds a body and a piece that is not part of it — the one
thing in this catalogue that can draw protection as a separate object rather
than as a thickness.

**Two things were looked at and not converted**, which is worth saying because
a catalogue that only ever grows stops meaning anything. Neon Pulsefire's small
bodies are hard polygons, and `crystal` in `subjects.ts` already draws every one
of them — a meteor *is* a seven-sided crystal. What that game does that we do
not is spend a polygon on a body that is *alive*, and that is a decision about
the bestiary rather than a shape anybody has to draw. Kingdom Rush's Tyranthor
is one mass with one bright mouth, and `mawed` has drawn that since THE MOTHER;
the part that does not transfer is the contrast, which is fill and light. And
most of Nova Drift's line-up turned out to be this catalogue under other names,
which the section above lists one by one — including the formation that looked
like a form and is `cluster` at a spread that never merges.

And one mistake is worth recording because it took a frame to catch: `THE
CANOPY`'s spent facets were first made by dropping points out of one open path,
which does not put a gap in it — it puts a longer straight segment in it, and
the barrier rendered looking whole. A hole in something open has to be a break
between two subpaths.

## If exactly one thing were built from this page

`SPLIT`, and then `ARC` two waves later. `SPLIT` is one creature entry and a
spawn on death; it turns a solved column into two unsolved ones in the moment
player 2 is reloading, which is the only kind of difficulty this game wants; and
it needs no new control, no new colour and no new silhouette — a slick at
`hullRadiusMul` halved is still a slick, and the word the pair says for it does
not change. `ARC` is the answer to it, which is why it comes second and not
first: an answer that arrives before the question is just a stronger cannon.
