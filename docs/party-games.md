# Party games, read for the round that is not the field

Ideas read off the two games the owner named — Nintendo's **Mario Party**
series (1998–) and Ubisoft's **Rayman Raving Rabbids** (2006–2008) — aimed at
one question: **what else can a round be**, now that
[`docs/decisions.md` #21](decisions.md) has said a round with no columns is
outside the no-travel rule and four of them are built.

`docs/borrowed.md` did this for two co-op games and came back with mostly `NO`,
because their unit of play is a character crossing a space and ours is a
column. `docs/tower-defence.md` did it for the genre our *field* already is,
and came back with almost everything. This page is the third, and it sits
between them: a party game's unit of play is **a rule you are told in one
sentence and are finished with in forty seconds**, which is exactly the unit
[`docs/spec/interludes.md`](spec/interludes.md) already specifies. The
geometry never transfers. The **shape of the sixty seconds** always does.

Nothing here is built. Nothing here is a decision. It is a shelf.

## What the pictures are, and are not

`docs/tower-defence.md` sets the house rule and this page follows it: art that
is not ours is **linked**, never copied into a public repository. Every picture
below is an `![…](…)` pointing at the wiki that holds it, nothing is committed
under `assets/`, and each alt text is a sentence saying what the picture shows
— so a row that fails to load still says what it was showing, which is why the
alt text is written as prose rather than as a label.

Five rows carry one, and they are the five the verdict column marks `ROUND` or
reads as outside confirmation of a decision already made. That is where a
picture earns its place: a row refused needs no screenshot of the thing it was
refused for. Every row still carries a link to its own wiki page as well, which
is where the rest of the minigame is.

## The verdict column

The four words `docs/borrowed.md` uses, plus the one `docs/tower-defence.md`
added.

| Verdict | Means |
|---|---|
| `BUILT` | we already have it under another name — do not propose it again |
| `ROUND` | its own round, its own rules, its own picture — decisions #20 and #21 |
| `FIELD` | could change how a wave is played, and nothing travels |
| `HULL` | a persistent mark or capability, not a round |
| `NO` | with the reason in the cell |

`INTERLUDE` was the word on the other two pages. It is `ROUND` here, because
that category was retired in August 2026 and the word for the thing is now
*round* ([interludes](spec/interludes.md), decision #20).

## The one sentence that decides almost every row

**A party minigame is four people looking at one television.** Everything that
follows from that is against us: the rules are legible because everybody can
see the whole board, the tension is competitive, and the reward is watching
somebody else fail at a thing you can see them failing at.

This game has two phones, two different pictures and no way to see the other
one. So the first instinct — pick a good minigame, port it — fails the same
way on every row it fails on, and it is filter 6
([transfers-hazelight](spec/transfers-hazelight.md#the-filter)): **a round one
player could do alone while the other watched is not a round here.** Nearly
every party minigame is exactly that, four times over in parallel.

What survives is never the minigame. It is the **archetype under it** — the
shape of the forty seconds, stripped of the screen it was played on — and there
turn out to be about eight of those in two hundred minigames. Cut one in half
across two devices and it becomes a conversation, or it becomes nothing. Which
of the two is the only question this page asks.

## Mario Party — the archetypes, not the minigames

The series' own categories are 4-player, 1-vs-3, 2-vs-2 and co-op. **Only 2-vs-2
and co-op can reach us at all**, and the useful reading is that even inside
those the split is almost always *parallel* — both teammates doing the same job
harder — rather than *asymmetric*.

| Minigame | What it actually is | To Neon Spore |
|---|---|---|
| [Torpedo Targets](https://www.mariowiki.com/Torpedo_Targets) (MP2, 2-vs-2) | one player steers a submarine, the other launches and steers the torpedo | `BUILT` — the pilot's column and the navigator's trigger, in a hull. Read as outside confirmation that the split is the good one, not as new work |
| [Bowser's Big Blast](https://www.mariowiki.com/Bowser's_Big_Blast) (MP2) | five plungers, one detonates; each player presses one in turn, five become four become three | `ROUND` — the strongest row on the page once it is made co-op. See **THE FUSE** |
| [Look Away](https://www.mariowiki.com/Look_Away) (MP2, 1-vs-3) | one player picks a direction, the other three must not pick the same one | `ROUND` — inverted, it is the round a pair **loses by agreeing**, and nothing in the store does that. See **THE DIVIDE** |
| [Hexagon Heat](https://www.mariowiki.com/Hexagon_Heat) / [Mushroom Mix-Up](https://www.mariowiki.com/Mushroom_Mix-Up) (MP2/MP1) | a flag names a colour, every other tile sinks, and the naming gets faster | `ROUND` — give the call to one seat one beat early and the tiles to the other. See **THE FLOOR** |
| [Handcar Havoc](https://www.mariowiki.com/List_of_Mario_Party_2_minigames) / Dungeon Dash (MP2, 2-vs-2) | two people alternating presses to drive one machine | `ROUND` — the only party archetype that is *structurally* two-handed. See **THE CRANK** |
| Slot Car Derby (MP1, 2-vs-2) | hold the throttle, but a corner taken too fast throws you off the track | `ROUND` — one seat reads the track, the other holds the throttle. See **THE THROTTLE** |
| Face Lift, Crazy Cutters, Trace Race | match a target shape by deforming or drawing one | `ROUND` — already **THE LATHE** ([ideas](spec/ideas.md#rounds)). Three independent arrivals at the same round is the strongest argument in the store for building it |
| Memory Match, Slot Machine, pairs of every kind | remember where a face was | `ROUND` — already **THE VAULT**, and the party version is the one without the information split, which is to say the boring one |
| [Bombs Away](https://mario.fandom.com/wiki/Bombs_Away_(minigame)) (MP1/MP2) | a pirate ship shells a tilting island; jump when a shot lands or be stunned | `NO` — it is dodging, and the players are the thing that moves |
| Bumper Balls, Tug o' War, Mecha-Marathon, the mashers | be faster or heavier than the other person | `NO` — competitive, and filter 4 asks a round to teach the pair something about *each other* |
| Chance Time, the Item and Duel spaces, the board itself | a run of luck arranged so the loser can still win at the end | `NO` on the field, and see **What the format says** below — the board is the interesting half and it is not a minigame |

![Torpedo Targets — the screen split into two horizontal panels, one for each seat, both looking down the same green cavern; each carries its own red-and-white bullseye reticle and its own count in the corner](https://mario.wiki.gallery/images/5/55/MP2_Torpedo_Targets.png)

*Torpedo Targets. Two seats, one cavern, and neither panel is the whole
picture — the split this field already runs on, arrived at by somebody else in
1999.*

![Bowser's Big Blast — five coloured plungers in a row on a table under a giant Bowser head, with the players standing around the table waiting to press one](https://mario.wiki.gallery/images/4/47/MP2_Bowsers_Big_Blast.png)

*Bowser's Big Blast. The whole round is on the table: five things to press, one
of which ends it, and one fewer left every time round. See **THE FUSE**.*

![Look Away — one player's face across the top of the screen and the other three below it, a rainbow of note symbols marking the beat they all turn on, and a row of stars along the top scoring the round](https://mario.wiki.gallery/images/8/8c/Mario_wins_in_Look_away.png)

*Look Away. Four faces and one instant, and the asymmetry is of information
rather than of count — which is why it is the only 1-vs-3 game on this page
that survives. Inverted, into a pair that must **not** match, it is a round
nothing in the store has. See **THE DIVIDE**.*

![Hexagon Heat — seven coloured hexagons floating over a drop with the players crowded onto the green one, and a figure on a ledge at the back who names the colour that stays](https://mario.wiki.gallery/images/2/2d/MP2_Hexagon_Heat.png)

*Hexagon Heat. The naming and the standing are two different jobs, and the
picture says so: one figure at the back calls a colour and everybody else has
to be on it before the rest sink. Give the two halves to the two seats. See
**THE FLOOR**.*

**The 1-vs-3 category has nothing to say to us and it is worth saying why.**
Its whole content is an *asymmetry of numbers*, and there are two of us; every
one of them collapses to 1-vs-1, which is a duel. The one that survives —
Look Away — survives because its asymmetry is of *information*, not of count.

## Rayman Raving Rabbids — the archetypes

Three games, about a hundred and forty minigames, and structurally they are
narrower than Mario Party: the great majority are **rail shooters, rhythm
games, or a Wii-remote gesture performed under time pressure**. The first two
of those are directly interesting and the third is the thing this design
refuses hardest.

| Minigame or family | What it actually is | To Neon Spore |
|---|---|---|
| [Bunny Hunt](https://raymanpc.com/wiki/en/Rayman_Raving_Rabbids) — "Bunnies Have a Soft Spot for Plungers" and the rest | a first-person shooting gallery in which **you cannot move**; you aim, and the targets come to you | `BUILT` — it is our field's premise, arrived at from the opposite direction, and the plunger is our ammunition rule. Worth quoting at anybody who thinks the no-travel rule is a limitation |
| [Dance battles](https://rabbids.fandom.com/wiki/Dance_Battles) | rabbids arrive from **both sides** on the beat; the left hand answers the left side and the right hand the right | `ROUND` — two hands is two players. It sharpens **THE DUET** rather than becoming a round of its own; see the note there |
| [Rhythm minigames](https://rabbids.fandom.com/wiki/Rhythm_Minigames_(Rayman_Raving_Rabbids_2)) generally — one closes every day of the game | a phrase runs past and you answer it on the beat | `ROUND` — **THE DUET**, and the structural observation is the placement: a rhythm round is what the game ends a session on, every time |
| The cow toss, and every wind-up-and-release gesture | charge a throw, release at the right moment, at a target you can see | `ROUND` — split the charge from the release and it is two people. See **THE SLING** |
| [Flippin' Burgers](https://en.wikipedia.org/wiki/Rayman_Raving_Rabbids:_TV_Party), the assembly-line games | an order arrives, parts are stacked in the wrong order, the clock runs | `ROUND` — and **THE BELT** already holds this shape. Refused as a second entry rather than promoted; see the refusals |
| Monster Tractors, Bunnies Can't Fly, the races | steer a thing through a course faster than three other things | `NO` — travel, and competitive |
| Every "shake the remote as hard as you can" game | be more energetic than the other person for eight seconds | `NO` — a phone is not a Wii remote, and the whole design hangs off the beat rather than off effort |
| The escalation structure: the same minigame returns on a later day, harder | a rule learnt once is charged interest later | `HULL` — see **What the format says**. It costs nothing and the store has no answer to it |

![A Rayman Raving Rabbids dance battle — four dancers standing in red and blue rings on a beach at night, on lanes converging upward on a mirrorball, with two red arrows and two blue arrows arriving down them and a score bar for each team along the bottom](https://static.wikia.nocookie.net/ravingrabbids/images/c/cf/Dance_Battle_By_The_Sea_minigame.png/revision/latest?cb=20221009222021)

*A dance battle. Two arrows red and two blue, arriving together down lanes that
meet at the top: the colours are the split, and the beat is the thing both
sides share. That is **THE DUET**'s argument in one frame.*

**The Rabbids' real lesson is tonal and it is free.** Every minigame in the
series is one joke, stated in its title, and the title is the whole briefing.
`briefings.md` already wants a card that is one sentence split in half; this is
a hundred and forty proofs that one sentence is enough, from a game that never
once explains itself.

## What the format says, and it is not a minigame

Two structural findings, and both are about the run rather than about a round.

**The break is frequent, not rare.** A Mario Party board gives four players a
minigame *every turn* — under a minute of board, then a minute of minigame,
for two hours. Rabbids runs four minigames per in-game day and closes each day
on the rhythm one. This design's rounds are bosses, so the pair meets one every
tenth wave at most. That is the correct decision for a game whose field is the
thing being learnt, and it is worth knowing that both reference points sit an
order of magnitude the other side of it. The honest version of the finding:
**ten acts is ten rounds, and fifteen candidates is not too many** — it is
barely one and a half runs' worth.

**A round may come back.** Every party game repeats its minigames, and the
second meeting is where a pair finds out they are good at something. Ours are
one-shot by design: *nothing it teaches is used again*
([interludes](spec/interludes.md)). Coming back once, in a later act, with one
number turned, costs a row in `waves.ts` and nothing else — the round is already
a `boss:` entry and the entry is already data. It is the cheapest thing on this
page and it is filed as an `Asks:` in `docs/queue.md`, because it changes what a
round *is* and that sentence is the owner's.

## What actually comes out of this

Six rounds, promoted to [the idea store](spec/ideas.md#rounds), and one note
added to a round already there. **Two of the six are still there** — THE FUSE
and THE SLING, the two built on a held thumb and an information split. The
owner cut the store to what fits the game as it stands on 12 September 2026,
and the four counted on the beat went, along with THE DUET; what they were is
below, and stays here as the reading it came out of.

1. **THE FUSE** (Bowser's Big Blast) — press-your-luck, made co-op by splitting
   the evidence: one seat may press, the other alone can read the tell.
2. **THE DIVIDE** (Look Away, inverted) — the round the pair loses by agreeing.
   The only entry in the store whose protocol is *diverging*.
3. **THE CRANK** (Handcar Havoc, Dungeon Dash) — strict alternation on the
   beat, with the pattern known to one seat and the hands in both.
4. **THE SLING** (the cow toss) — one seat winds, the other alone sees the
   range and calls the release beat.
5. **THE THROTTLE** (Slot Car Derby) — one seat reads the track ahead, the
   other holds the speed and sees only the needle.
6. **THE FLOOR** (Hexagon Heat, Mushroom Mix-Up) — the tile is called one beat
   early, to the seat that cannot brace it.
7. **A note on THE DUET** — the dance battle's two-sided arrival, which turns
   the round's handover from a queue into a cue each player gives the other.

Three refusals worth writing down rather than leaving as a silence:

- **Every competitive minigame**, for the third time on the third page. Two
  devices, no shared screen, and the only channel that could settle a score is
  the one the whole game is made of. `docs/borrowed.md` refused it for It Takes
  Two's twenty-five; nothing about two hundred more changes the reason.
- **The assembly line** (Flippin' Burgers, Cake Factory). It is a good round and
  it is **THE BELT** with a different noun. A second entry for it would be the
  store lying about how many ideas it holds.
- **Anything measuring how hard a player shook something.** A gesture's
  difficulty is a wobble in wall-clock time, and `sim` has no wall clock —
  `CLAUDE.md` rule 2, and the sentence in
  [interludes](spec/interludes.md#what-a-round-is-drawn-out-of) that already
  rules out "the reflex minigames both reference games are full of".

## Sources

Read September 2026, all public. **None of these pages was opened**: the
network policy of the session that wrote this blocked every one of the hosts,
so what is below is what a search engine returned about them, checked against
each other and against the design rather than against the page.

- [List of Mario Party 2 minigames — Super Mario Wiki](https://www.mariowiki.com/List_of_Mario_Party_2_minigames)
- [Torpedo Targets](https://www.mariowiki.com/Torpedo_Targets), [Bowser's Big Blast](https://www.mariowiki.com/Bowser's_Big_Blast), [Look Away](https://www.mariowiki.com/Look_Away), [Hexagon Heat](https://www.mariowiki.com/Hexagon_Heat), [Mushroom Mix-Up](https://www.mariowiki.com/Mushroom_Mix-Up) — Super Mario Wiki
- [2 vs. 2 minigame — Mario Wiki](https://mario.fandom.com/wiki/2_vs._2_minigame)
- [List of Super Mario Party minigames — Super Mario Wiki](https://www.mariowiki.com/List_of_Super_Mario_Party_minigames)
- [Rayman Raving Rabbids — RayWiki](https://raymanpc.com/wiki/en/Rayman_Raving_Rabbids)
- [List of Mini games — Rabbids Wiki](https://raving-rabbids.fandom.com/wiki/List_of_Mini_games)
- [Dance Battles](https://rabbids.fandom.com/wiki/Dance_Battles) and [Rhythm Minigames (RRR2)](https://rabbids.fandom.com/wiki/Rhythm_Minigames_(Rayman_Raving_Rabbids_2)) — Raving Rabbids Wiki
- [Rayman Raving Rabbids: TV Party — Wikipedia](https://en.wikipedia.org/wiki/Rayman_Raving_Rabbids:_TV_Party)
- [Rayman Raving Rabbids 2 — Wikipedia](https://en.wikipedia.org/wiki/Rayman_Raving_Rabbids_2)
