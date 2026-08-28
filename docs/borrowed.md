# Borrowed

Ideas read off two other co-op games, and an honest column saying whether each
one can reach this one.

The two are Hazelight's **It Takes Two** (2021) and **Split Fiction** (2025).
They are here rather than any other pair because they are the only commercial
games built on the premise this one is built on: two people, two sets of hands,
neither able to do the other's half. Everything below was read from public
wikis and walkthroughs; nothing was played to write it, and the mapping column
is the part that is ours.

## The one sentence that decides almost every row

Both games are third-person platformers. Their unit of play is *a character
crossing a space*. Ours is a column, a beat and a thing falling down it, and
`CLAUDE.md` is explicit that **on the field nothing the players control
travels**. So the first instinct — read a chapter, port the mechanic — fails on
almost every row, and fails for the same reason each time.

What survives the crossing is never the verb. It is the **shape of the
asymmetry**: what one player is given, what the other is given, and why neither
can finish alone. Cody's sap and May's match do not transfer. *One player makes
a thing, the other spends it* does, and it is already the pod.

`docs/decisions.md` #21 is what makes the rest of the table non-empty. The
no-travel rule binds the **field**, not the game — an interlude is a round with
its own rules and its own picture. So there are three real verdicts and one
refusal:

| Verdict | Means |
|---|---|
| `FIELD` | could change how a wave is played, without anything travelling |
| `INTERLUDE` | a round of its own, under #20 and #21 |
| `HULL` | a persistent mark or capability, not a round |
| `NO` | with the reason in the cell — most often *it is travel* |

## It Takes Two — seven chapters, seven discarded mechanics

Josef Fares' rule was that a repeated mechanic stops being special, so every
chapter throws its abilities away and issues new ones. That is the single most
transferable idea in either game, and it is not a mechanic — it is a *policy*,
and the interlude is where we already keep it.

| Chapter | Cody holds | May holds | What it is really doing | To Neon Spore |
|---|---|---|---|---|
| The Shed | nails, thrown into surfaces | a hammer that swings off nails | one player *creates the anchor*, the other *spends it* | `FIELD` — this is the pod already. Worth reading as confirmation, not as new work |
| The Tree | a sap gun | matches | one player *marks*, the other *triggers*; neither mark nor trigger alone does anything | `FIELD` — the strongest row in the table. A creature that must be marked by one and fired on by the other is two commands with no shared button, and nothing moves |
| Rose's Room | resize, huge or tiny | walks on white surfaces, ignoring gravity | each player's *world rules* differ, so they see the same room as two different rooms | `INTERLUDE` — this is THE EDGE's premise (one space, two projections). Confirms it |
| Cuckoo Clock | rewind and fast-forward time | drops a clone, teleports to it | time itself is a per-player resource | `NO` on the field — the tick counter is the lockstep. Two devices that disagree about time is precisely the desync the whole `net` package exists to catch |
| Snow Globe | attracts blue, repels red | attracts red, repels blue | **the same control, inverted between the two** | `FIELD` — cheap and strong. The colour that one shields is the colour the other must not shoot; already half-built in the two-colour waves |
| Garden | plant transformations | a scythe and a water gun | one player *prepares ground*, the other *grows on it* — a two-step with a wait in it | `INTERLUDE` — a round where a scar is watered shut over several beats. Close to THE PATCH |
| The Attic | a cymbal, thrown or raised as a shield | a voice that pushes objects | *sound as a physical force*, and one of them is a shield | `HULL` — the cymbal-as-directional-shield is the shield we have. The voice half is out: rule 4, the game never reads a microphone |

### The twenty-five minigames

They are competitive, optional, on side paths, and they are the one part of the
game that is *not* co-op — whack-a-mole, tug of war, chess, volleyball, laser
tennis, a horse derby, slot cars.

`NO`, and it is worth saying why rather than leaving it off the page. Every one
of them is two people racing at the same task on one screen. This game's two
players do not have one screen and do not have the same information — that is
the whole premise — so a competitive minigame here would have to first *give
them the same view*, which is the one thing the design will not do. The idea
comes back only as **THE VAULT** and **THE ACCORD** already do it: same task,
different halves of the information, and they win or lose together.

## Split Fiction — eight levels, twelve side stories

Structurally the same, one level up: eight main levels alternating between
Mio's science fiction and Zoe's fantasy, each with a one-off mechanic, plus
twelve optional side stories behind portals, each with a mechanic of its own.

| Level or story | The mechanic | To Neon Spore |
|---|---|---|
| Neon Revenge | Mio a gravity-defying katana, Zoe a gravity whip that moves objects | `NO` — both are traversal. The *whip* half survives as one player moving something the other must then hit, which is the pod again |
| Getaway Car | Zoe drives, Mio shoots | `INTERLUDE` — the cleanest driver/gunner split in either game, and it is the pilot/navigator split we already have. A round where one aims and the other only chooses *when* |
| Colour-coded triggers and shield busters | every interactable is pink-for-Mio or green-for-Zoe; a shield needs both blasters | `FIELD` — already the colour rule, and the *shield buster* is the argument for a target that needs both players in the same beat |
| The oarfish and the tree form | Mio underwater, Zoe as a tree; each opens the other's path | `INTERLUDE` — two players in different media, neither able to enter the other's. Very close to THE WELL |
| Collapsing Star (side) | a star pulses energy waves at a fixed interval; you move between them and raise barriers | `FIELD` — **the best row on this page.** A wave on a clock, survived by shielding on the beat, and nothing travels. It is a boss, and it is nearly THE VANE with a metronome |
| Legend of the Sandfish (side) | thumpers distract a sand creature so you can cross | `FIELD` — a decoy. One player spends something to make a creature look away from the column the other is working in |
| Slopes of War (side) | a competitive downhill trick run | `NO` — travel, and competitive |
| Gameshow (side) | a host sets tasks, the crowd watches, deaths are cheered | `INTERLUDE` — the *framing* transfers even though nothing else does: a round with a voice setting the task is a way to teach a mechanic without a tutorial |
| Moon Market (side) | find three cat spirits, return them to a gate | `INTERLUDE` — a fetch round. Weak here: nothing travels, so "fetch" has to become "identify", which is THE VAULT |
| Notebook (side) | a narrator draws the terrain in as you go | `INTERLUDE` — the terrain arriving late is a real idea for a round where one player *is* the narrator and draws the other's floor |
| Kites, Mountain Hike, Space Escape, Train Heist, Farmlife, Birthday Cake (side) | grappling, wall-running, wingsuits, water skis, vehicles | `NO` — all travel, all of it the player's own body |

## What actually comes out of this

Six rows, and they are the only ones worth a lane. Everything else on this page
is either already built, already queued under another name, or refused.

1. **Mark and trigger** (The Tree). One player marks a creature, the other
   fires; neither alone does anything. Two commands, no shared button, nothing
   moves. This is the strongest new *field* mechanic on the page.
2. **Inverted controls** (Snow Globe). The same control with its polarity
   swapped between the two players. Cheap, and it makes a sentence like
   "column four, red" ambiguous in exactly the productive way.
3. **A wave on a metronome** (Collapsing Star). A boss that pulses at a fixed
   interval, survived by shielding on the beat rather than by aiming. Fits the
   96 BPM clock the game already runs on.
4. **A decoy** (Legend of the Sandfish). Something one player spends to make a
   creature stop attending to a column.
5. **A round where the floor arrives late** (Notebook). One player is told what
   to draw, the other lives in it. This is a real interlude and it has no
   equivalent in `docs/spec/interludes.md` yet.
6. **Discard the mechanic every round** (the policy, from both games). Already
   our interlude doctrine. This page is the outside evidence that it works, and
   that eleven unbuilt interludes is not too many.

Two things are refused on this page rather than left unmentioned, because a
refusal with a reason is worth more than a silence: **anything using a voice as
a force** (rule 4 — the game never reads a microphone), and **every competitive
minigame** (the two players do not share a view, and giving them one would cost
the premise).

## Sources

Read August 2026, all public:

- [Split Fiction — Wikipedia](https://en.wikipedia.org/wiki/Split_Fiction)
- [It Takes Two — Wikipedia](https://en.wikipedia.org/wiki/It_Takes_Two_(video_game))
- [It Takes Two walkthrough: every chapter, the co-op abilities, all 25 minigames](https://9puz.com/2374-it-takes-two-walkthrough/)
- [Split Fiction Wiki — Chapters](https://split-fiction.fandom.com/wiki/Chapters)
- [Split Fiction Wiki — Sidestories](https://splitfiction.wiki.fextralife.com/Sidestories)
- [All levels in Split Fiction](https://gamerant.com/all-levels-split-fiction-chapter-list/)
- [Split Fiction: all 12 side stories, ranked](https://www.dualshockers.com/split-fiction-side-stories-ranked/)
