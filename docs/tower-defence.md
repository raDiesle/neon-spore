# Tower defence, read for the three we already have

Ideas read off 2D tower-defence games, aimed at one question: **what else can a
slick, a bulb or a meteor be, without becoming a fourth creature.**

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
| a rock that heals other bodies | — | tower-defence healers | — | — | `NO` — nothing on the field has hit points to heal, and giving it some is a different game |
| a rock that must be dug out after it lands | — | burrowers | — | — | `NO` — the hull is not a surface things sit on |

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

And the Galaxy Defense boss further up is the closest of the three to what this
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

## If exactly one thing were built from this page

`SPLIT`, and then `ARC` two waves later. `SPLIT` is one creature entry and a
spawn on death; it turns a solved column into two unsolved ones in the moment
player 2 is reloading, which is the only kind of difficulty this game wants; and
it needs no new control, no new colour and no new silhouette — a slick at
`hullRadiusMul` halved is still a slick, and the word the pair says for it does
not change. `ARC` is the answer to it, which is why it comes second and not
first: an answer that arrives before the question is just a stronger cannon.
