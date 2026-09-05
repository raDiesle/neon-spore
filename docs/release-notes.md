# Release notes

What each landing changed, newest first. `bun run land` writes an entry here
the moment `main` moves, one per commit, from the commit's own subject and its
first paragraph.

**Read-only.** Nothing in this file is ticked, answered or deleted, and nothing
is waiting on anybody — it is a record of what happened, not a list of what is
owed. Entries are never edited by hand either: an entry that reads wrong is a
commit message that read wrong, and the history is where that lives.

## 2026-09-05 · 1bf073bf — THE THROB's green half is the other trigger now, and it turns faster

Half of a throb was shield plating: green, and nothing at all reached it, so half of every turn was a body the pair could only wait out. Both halves are live now and each carries one of the two ammunition colours — the authored one starts pointing at the cannon, the other is over the seam — so the turn never shuts the creature, it swaps which trigger is the right one. A shot in the colour that turned away is an ordinary colour miss. `throbSpinBeats` comes down from four to three at the same time: nothing about the turn closes the body any more, so a slow one only buys the pair time standing still with the answer already said out loud.

## 2026-09-05 · a7c62570 — Plate THE STRAND's caged beads and put a question mark over the pilot's frame

The pilot's screen already said which beads a shot could not answer, and it said it in six thin arcs at one radius — which on a field of glowing bodies reads as a halo somebody drew badly rather than as armour. Each plate is now a band with a dark face, a rim, a lit outer edge and a rivet, so a caged bead is plainly a plated one from across a phone held at arm's length. The ring still stands outside the contour at every size, so the shape inside is still the shape the pair names.

## 2026-09-05 · 4b2ef3d2 — Three refused perf runs say the baseline needs an idle machine, not a quiet hour

`bun run perf --save` was tried three times this afternoon and refused three times, by a different wave each time and with the medians moving 30% between runs an hour apart. That is the load being measured rather than the frame, so the parked entry now says what a session must have before it starts, and what to conclude if an idle machine still trips the rule.

## 2026-09-05 · b3ffc52 — Refuse a landing onto a trunk `origin` has already moved past

`bun run land` rebases the lane onto the **local** trunk and never asked `origin` where that trunk actually was. In a cloud clone the local `main` is whatever `origin` held when the container was built, and this repo lands several times a day: on 5 September 2026 a lane replayed onto a `main` sixty-six commits behind, landed cleanly onto it, and only then found that `origin/main` had eleven commits it did not — one of them a whole new creature touching the same four tables. By that point the branch was swept and the check was spent, so seven conflicts arrived on the trunk itself, at the one moment there was no lane left to fix them on. Two were resolved wrongly and each cost another three-minute `bun run check`.
## 2026-09-05 · 65981aaf — Queue what the worktree cleanup turned up, and park what would not land

Forty worktrees had accumulated because the sweep's idle clock is reset by any git command aimed at the tree, including its own probe; twenty-four of them were spent and are gone. Four findings from clearing them, and the state of the four lanes that carried work `main` did not have.

## 2026-09-05 · 6115dbb4 — Make THE CRAWLER one animal: overlapping rings, a rounded head, and wet light on it

The owner sent a picture of a real maggot with the note that the segments are attached as they belong together, with no space in between — and that is a different thing from a coupling drawn as a link. A coupling gets a connector; a single body does not. So the neck bars are gone and every ring is now nearly two tiles wide, its leading dome lying over the tucked tail of the one behind it, which needs the run painted back to front — an order `byDepth` cannot give, since every link of a worm stands on the same row. `drawCreatures` routes a crawler away the way it routes THE GYRE's hub and `drawCrawlers` paints each worm tail first.

## 2026-09-05 · aa103c42 — Keep the crawler's barrel to what asks for it from outside the sim

The rebase onto a main that had moved took `packages/sim/src/index.ts` over its limit, and the twenty-name export was the wrong thing to have written: only nine of them are asked for outside `packages/sim` — the director's two per-arrival fields, and what render needs to draw a link. The rest of `crawler.ts` is the simulation's own, and its tests reach for it there, which is what every other creature's rule file already does.

## 2026-09-05 · 81f3bd3c — Weigh a whole worm, draw one through the stub, and queue what that turned up

A new shape gets a measurement, so THE CRAWLER's wave has one: five links standing on the ship, at the phone-sized frame the busy field is weighed on, with the counts stored so a later run is a diff rather than a memory (`crawler-budget.test.ts`, beside `fleet-budget.test.ts` for that file's reason). And every link, both endings and a body half off the side of the field now go through the stub canvas that refuses what a real one refuses (`crawler-frame.test.ts`).

## 2026-09-05 · 2a791868 — Cut THE CRAWLER's mouth into its head, and stand its two endings where they happen

Four fixes to a look with no shipped alternative, all of them found by looking at a captured frame rather than at the code. The mouth was centred on the leading edge with two mandibles hooked off the front, which put half of it in open field and read as a fault rather than as a face; it is a dark hole inside the head now, which is the whole of what a mouth can be at forty pixels. The two ends wore the same grey as a plate, so a pair could not tell the one link the shield is owed from the one it can never touch — an end is darker and edged in the field's own dim now, and every plate stands out of it. The necks were half a link wide and the run read as beads on a string, which is THE STRAND's picture. And the burrow's two banks were anchored to the row the worm stood on, so they floated a tile over a hull that was visibly breaking somewhere else; they sit on `hullY` now, where the material came from.

## 2026-09-05 · 19ccd103 — THE CRAWLER: a worm that walks the ship, and the first body both controls take apart together

Every arrival since the first slick has fallen out of the top of the screen at the ship, and everything the pair has learned is a way of meeting one. THE CRAWLER is already landed. It comes over a side wall onto the row the shield covers and walks the ship lengthways, a column every other beat, and while it walks it costs the hull nothing at all — so doing nothing about it is the only way to lose to it, which inverts every wave before this one. Its head and tail are armour nothing takes off; the segments between them cycle red, cyan, plate along the body, so a colour wants the matching cannon under it and a plate wants the shield, and every third link turns the two seats round. A link taken off closes the body up behind it — where a link stands is its rank among the living, so the magnet is arithmetic rather than animation, and stripping the front of a worm feeds its tail onto the field sooner. Strip it and the ship opens a lane and the two ends go up it; let its head reach the far wall and it eats in, for as much as the pair left on it, in every column it still covers.

## 2026-09-03 · bdb4bd6a — The scan box blinks for a wisp and sweeps a row for a ghost

Both marks are the pilot's own scanner and both were asked for by name, which is the first of the look exemptions.

## 2026-09-05 · e9d4815 — THE THROB turns, and half of it is armour

It swelled and shrank on the shared beat, open one beat in four and answerable by **either** colour while it was. That asked the pair for a count and nothing else: the ammunition was never the question, so the navigator's half of the exchange was the word "now". The colour is back in it. A throb is one body cut down the middle — a slick's red or a bulb's cyan on one side, shield plating on the other — turning clockwise the whole way down, and the matching colour kills it only on the half that is pointing at the cannon. Anything into the plating is swallowed, in either colour, and is not booked as a colour mistake: the ammunition was right and the moment was not, which is the distinction `colour-armour.ts` already makes next door.

## 2026-09-05 · afaa6249 — Every split creature owes its own word under the siren, not just THE STRAND

comms.ts already knows which seat has to speak about veil, torch, veer, lure, dart, queen, wisp and ghost — this names what: COLOUR, ROCK, LANE, FAKE, SIDE, MARK, SPOT, COLUMN. strand-duty.ts becomes duty.ts, general over every flagged kind instead of one, and a seat owing more than one word at once gets all of them joined the way strand already joins its own pair.

## 2026-09-05 · 0edaf206 — THE VEER rolls one to four tiles a change, and shows the width to both seats

Every change of lane used to step exactly one column. It now rolls a fresh width from one to veerMaxDist (4) each time, so a rock that always moved a tile the shield could shadow without a word said becomes one whose call is worth making. The width costs nothing to show — it says nothing about which lane the shield stands in without the side too — so it is drawn above the arrow in the rock's own grey, on both screens, while the side stays the pilot's alone.

## 2026-09-05 · c6ddcbab — Slow THE STRAND down, give it a wave, and show each seat what it may not shoot

Six changes the owner asked for across one sitting, and together they make a creature a pair can actually play.

## 2026-09-05 · 7b4e2bc — The stub canvas logs the shape a path is made of

`StubContext.log` claimed to be the ordered log of every call and left out the one part a path is: `StubPath`'s builders went through `nums` for validation and never through the log, so `new Path2D` appeared as a count and `rect`, `moveTo`, `arc` and the rest appeared not at all.

## 2026-09-05 · 1465cfc8 — Land THE CAROM a tick early, so its brush card shows the whole rock

Every other living specimen settles exactly on a beat boundary, where a body is still drawn from the tile it left rather than the one the crop is centred on — invisible for an ordinary faller, whose from and to are a row apart. A carom crosses up to three columns a beat, so the same instant put the crop three lanes from the crust, and the palette and hover card showed a sliver of rock instead of the whole enemy. Stopping a tick early, the way THE DART and THE TORCH already do, lands it on the tile it actually occupies.

## 2026-09-05 · 4b530728 — Hang THE STRAND in a zigzag, and roll its unknown beads like a slot machine

Five changes the owner asked for, all of them about what the pair actually sees.

## 2026-09-05 · 73a541d2 — Roll THE STRAND's lit end again after every bead, so neither seat can derive it

A fixed march from one rolled end gives the creature away on the second bead. The first raisin shows the pilot which end the order started at, so from then on they know which bead is next without being told; and the navigator, who has heard one colour and can see that the beads alternate, works out all the rest from there. One exchange, and the thread answers itself.

## 2026-09-05 · 29684505 — Hang THE STRAND's thread low enough to be seen between two beads

The first frame of this creature had a thread nobody could see. Two beads stand in neighbouring columns and each is drawn about eight tenths of a tile across, so a line straight between their centres was a line behind them — on both screens, at every length. The sag is the control point of the curve rather than the dip it produces, so 0.16 of a tile was really 0.08, and the stroke was the inner weight rather than the outline one.

## 2026-09-05 · 7ed0f1e5 — THE STRAND: beads on a thread, and the first body neither seat can answer alone

Two to five slicks and bulbs threaded on one line, alternating red and cyan, and only the next one along the thread can be shot. The navigator is shown which bead is lit and no colours at all; the pilot is shown the colours and no mark — so the column crosses the room one way and the colour the other, for every bead. A shot at the wrong one swells the last shrivelled bead back to life, and when the last of them goes the thread parts.

## 2026-09-05 · fd85cb7 — THE FLEET's crossings are one fill: 192 rectangles a frame down to 60

`drawFleetChart` marked every crossing of its own lattice with a small square, in a nested loop over twelve by eleven — 132 `fillRect` every frame for the whole length of the fight, which the budget beside it measured as roughly seventy per cent of every rectangle the game drew during it.

## 2026-09-05 · 990e241 — `frame-passes.ts` is a barrel, and the four passes are two files

It sat at exactly 250 lines. THE LOCK's dotted line wanted one parameter and four lines of comment on `drawBodies`, and paying for them cost two rounds of shaving sentences out of that comment — which is the warning the limit exists to give, and the same one `act-3b.ts` records having ignored once. The next pass added to a frame would have broken the build before it drew anything.

## 2026-09-05 · 61c8240 — A landing refuses to put back work the trunk has finished

Twice on 5 September 2026 one did. `tools/land/refusal.ts`, `--settle` and the frames tests' shared browser were all on the trunk with their entries removed in the commits that closed them, and `docs/queue.md` went on listing every one of them as waiting. A session that believed the file, which is the whole point of the file, would have done them a second time — the failure the queue's own preamble records happening on 3 September, arriving by a different road.

## 2026-09-05 · 0741b1f — The same build photographed twice is the same picture

`run.ts` refuses to write a before-and-after pair whose frames match, on the argument that a picture of an unchanged field teaches nothing. It could never fire: two captures of one build at the same wave, tick and zoom came back with different digests, so the guard was a comment.

## 2026-09-05 · 397ae4f — `bun run frames .` photographs the working tree, once

The tool always took a **pair**: a commit and its parent, each in a scratch worktree, refused if the two frames match. That is right for a change to a look and it is the wrong shape for every change whose parent cannot produce the picture at all. `--boss-round` was the case that found it — the flag calls a handle the parent has not got, so the "before" side throws by design, and the only way to see THE MAZE's fourth sheet was a throwaway script that started `preview:once` and drove `captureFrames` by hand. That is the friction `shot.ts` exists to stop being paid again, and it was paid again.

## 2026-09-05 · 7885ccf — A walk of the repository is held to skipping `.claude`

The build-stamp test's `.claude` skip landed with the other half of its entry undone: **check the other tree-walking tests for the same hole.** They are checked now, and the rule is a test rather than a memory.

## 2026-09-05 · da30c59 — `--boss-round`: a fight played in rounds can be photographed past its first

`jumpToWave` puts a boss on the field at its opening round and the only thing that moves it on is *winning*, which nothing headless can do. So `bun run frames` could photograph the first of THE MAZE's five sheets and no other — and the first sheet is the one with a single way in, so the rim with five gaps and the drum coming apart on a shot lost in a dead end were held by a unit test and by nothing an eye had seen. THE MIRROR, SNAKE and PINBALL had the same hole.

## 2026-09-05 · cdbf252 — `bun run frames --at` and `--zoom`: a change the size of a creature

A body is drawn at `l.tile * 0.4`, about forty pixels on a 390 px phone, so a before-and-after of a change to its *shape* is two pictures nobody can see the change in — which by CLAUDE.md's rule is the same as sending none. The eyelid lane could not judge its own work from the frames this tool produced, and hand-rolled a throwaway that loaded both PNGs into a page, cropped a rectangle and scaled it, then deleted it. That is the friction `shot.ts` exists to stop being paid twice.

## 2026-09-05 · 809f594 — The queue stops listing work that is already on the trunk

Three entries were back in `docs/queue.md` after being removed with the work that closed them — `bun run push` explaining a refusal, `--settle`, and the frames tests' shared browser are all on `main`, and the queue went on listing them as waiting. A session that believed the file, which is the whole point of the file, would have done them again.

## 2026-09-05 · bb36a4a — The heavy breach is heard for the first time

`bind.ts` split a hull breach on `e.damage >= 8000`, which is a number in thousandths, and the event carries whole hull points. `breachHull` is called with `damageMeteor` (20), `damageCarom` (20), `damageGhostDive` (18), `damageCreature` (12) and a lure's blast share (5) — so the comparison was always false and the heavy cue, *the plate going, a long low tear with the room shaking after it*, has never played in the running game. A rock reaching the hull sounded exactly like a slick brushing it.

## 2026-09-05 · bf390f8 — A refused push says why, and where the trunk stands

`bun run push` printed `error.message.split("\n")[0]`, and git's first line on a refused push is the remote's URL — so a session that had just landed was told `✗ origin was not updated: To https://github.com/…` and nothing else. The reason is on the lines under it, along with the hint that is usually the whole answer. With none of it in hand the only way to find out is to run the push again by hand, which the repository's own guard hook refuses.

## 2026-09-05 · 87d5b2d — The frames tests take one browser between them, and say what they may spend

Twice in five full runs a case in `tools/frames/test/` failed and passed immediately in isolation. The reproduction it took to see it is four copies of that file at once on a four-core machine: two of the four failed, and the shape of the failure is worse than one slow test. A case ran past bun's five-second-plus default, bun killed the file's subprocesses along with it, and every case after that came back `ERR_CONNECTION_REFUSED` against a preview server that was no longer there. One starved test poisoned the whole file.

## 2026-09-05 · 2bb7d551 — The settle check waits for the loop to have stopped, not to be asked to

"settles without stepping the simulation" failed two runs in three on `main` with nothing else in the tree, which threw every lane out of `bun run land` at random and left the trunk unlandable until somebody drew a green run. Measured three times on one commit before the fix: fail, pass, fail.

## 2026-09-05 · 76655736 — A salvo rests exactly as long as its shell is in the air

`fleetSalvoRestBeats` was one beat and the flight is two, so a pair hammering the trigger could have two shells over the chart at once and the button came back while the last one was still climbing. It is `FLEET_SHELL_BEATS` now, at the owner's word: the trigger returns at the moment the shell lands, which makes the rest a thing the pair *watch* rather than a press that quietly did nothing.

## 2026-09-05 · f330b718 — `bun run frames` can press THE FLEET's trigger and its sights

`--press` knew every control on the field except the two this boss invented, so the one thing it exists for — a picture of the change, sent to the owner — could not be taken of a shell in the air, a burst on a square or a ship going under. It has `salvo` and `aim=left|right|up|down` now, with the seat check the round itself makes: the trigger is refused from the navigator's chair and the sights from the pilot's, here rather than in a frame that comes back empty with nothing said.

## 2026-09-05 · 6240162b — THE FLEET lobs its salvo, and the water closes over what it sinks

A shell now leaves the cannon and arcs over the chart with its shadow walking the squares underneath it, coming down into the square two beats later; the cross or the ripple appears when it lands, not when the thumb does. A hit opens as a rocket — flash, shockwave, fireball, shards; a miss stands a column of water up and lets it fall back into rings. A ship that has taken its last square rolls under a wash of rings, foam and bubbles instead of fading out, on a chart that is now moving water rather than a dark rectangle. And the round's clock says how long is left in seconds, under the bar that was the only answer before.

## 2026-09-05 · d79c43c — Every row of the briefings table names its waves, and the test insists

Row 8, "the rest of the bestiary", was the one cell the wave-number test skipped, because it named a range — `22–27` — and a range is a cell nothing can check. It had drifted inside it, further than a number: the first subject was the runt, which was retired for THE LURE, and the pods and the rock speed tiers are taught on THE PURGE and THE WARD at 30 and 31, outside the range entirely. The merge note four paragraphs below the table already said so.

## 2026-09-05 · b9a7f0f — `bun run frames --settle N` photographs what only painting moves

`advance(ticks)` steps the simulation and never paints; `paint()` moves every render effect by exactly a sixtieth of a second and never steps. So the two clocks come apart, and a capture had **one painted frame per photograph** however many ticks it ran: a strip at `--stride 3` moved the world three ticks and the sparks one frame. Anything living in painted seconds — a spark's 0.4 s, the last-step fall replay in `rock-impact.ts` — was therefore still on screen thousands of ticks later or had not started yet, and a burst at the hull was uncapturable. Four captures were spent on a colour change and not one frame of them held a single spark: the rock hung a few pixels off the skin for sixty painted frames with one second's worth of sixtieths behind it.

## 2026-09-05 · 67b6253 — THE VOLLEY's wave is watched rather than read

It shipped with three lines of prose and no `scene`, exactly as THE CAROM did two entries before it and for the same reason: what the pair has to learn is a shape, and a shape does not read off a line of text. It is the worse of the two to describe, because the thing being taught is that a control they already know does something it has never done before — every warded body in this game so far has been a rock, and a rock answered is a rock gone.

## 2026-09-05 · 5cb01ae — A scene can put the strip where the body actually is

Every column in a film was an authored one: `actCol` puts a `SceneAct`'s `col` through `mapCol`, which maps 0..6 onto the real field and, on the eleven columns the game ships, reaches 0, 2, 3, 5, 7, 8 and 10 and nothing else. For a strip that is a hole rather than a rounding — a shield authored into column 4 lands in 3 or 5, and a body standing in 4 goes straight past it.

## 2026-09-05 · 536500f — CLAUDE.md gets its headroom back, and the two missing commands

It stood at 21,991 characters against a 22,000 ceiling, which is not headroom: it is a wall the next rule to be written down walks into. `bun run sweep` landed with no line in the commands table for exactly that reason, and `bun run maze` after it. Both are in the table now.

## 2026-09-05 · afbb8e2 — The events that are not a burst move into a file of their own

`burstFor` was one exhaustive switch over the whole of `SimEvent` and the file sat at 250 lines to the line. Adding THE CHUTE's cut — one `case` and one clause of comment — pushed it over, and the only way to land that was to reword two comments belonging to other creatures until five lines came back. Every future event would have paid the same cost, by editing prose nobody meant to touch, which is how an argument written down carefully gets shortened by somebody with a different aim.

## 2026-09-05 · 59ea92c — The briefings spec's wave numbers are held against WAVES

The right-hand column of §1's table names each teaching block's wave as a number and a name — `5 · THE ROCK`, `16 · BULB QUEEN` — and nothing checked it, so every wave inserted before one of those rows moved all of them by one in silence. It was already wrong before anybody looked: the bosses row read `16–19, 23` while THE VANE had been at 27 for some time.

## 2026-09-05 · 601e50f — A hand on a ghost is not drawn on the screen the ghost is not

`drawGrips` walked `world.creatures` and put a beam, a ring and a label at `creatureCenter` for every held body, with no idea which seat the screen belonged to. A falling ghost is grippable, and player 1 is not drawn its body at all — that seat gets a band across the row and nothing whatever about the column, because anything varying across the width of the field *is* the column, given away. So a pilot who swept a thumb along the row and found the body was then handed a marker sitting exactly in the lane the creature exists to keep from them: the whole of THE GHOST undone by an assist.

## 2026-09-05 · cf150cf — A test that raises its own relay gets a budget that says why

"ends a run nobody came back to, so the next arrival starts a fresh one" failed on bun's five-second default at 5000.30 ms, with three copies of the suite running at once. It is one of four cases that stand up a second workerd of their own so `SEAT_SILENT_MS` and `RUN_OVER_MS` can be shortened, and each of them pays for a worker boot, three socket handshakes and several hundred milliseconds it then waits out on purpose. On an idle machine that is comfortably inside five seconds; a workerd starting under load is not, and the budget was never written down for it.

## 2026-09-05 · 1d6c8d4 — `bun run index` drops a row with nothing behind it

The generator completed the "## Code" table — every in-scope file with no row got one — and deliberately kept whatever text was already there, which is right for a row somebody wrote by hand. A row whose file had been *deleted* stayed too: `bun run index` reported "865 in-scope files checked" and wrote nothing while `tools/index/test/index.test.ts` failed on "every row's path exists". The tool that exists to fix the table could not fix the half the test was failing on, and the repair was a hand edit found by reading test output.

## 2026-09-05 · 1c0ba55 — A body's draw path is a table, not a chain a new line can sever

`drawCreatures` picked between torch, rock, ghost, wisp, lid and the ordinary living draw with one long `if / else if`. Adding THE VEER put a plain `if` between two of its rungs and severed it: every kind after the cut fell through to `drawLiving`, and a torch was asked for a silhouette it has not got. Four frame tests caught that one, but only because those kinds happen to throw — a kind that merely looked wrong would have shipped.

## 2026-09-05 · 3569770 — A CRLF blob in the index is now a failing test, not a lane's morning

`.gitattributes` says `* text=auto eol=lf` and that governs what a checkout writes. It does not govern what is already stored: a blob committed with carriage returns before the attribute landed stays CRLF, and every clone since writes that file out exactly as stored. One worktree got `CLAUDE.md` and `.claude/settings.json` that way while every other file in the same checkout arrived LF, and `bun run check` went red on the first command of the lane — on the size ceiling, which the 387 extra carriage returns pushed over, so the failure named the wrong cause entirely.

## 2026-09-05 · 2a079c2 — CLAUDE.md's ceiling stops counting carriage returns

The file is 21,991 characters in the repository and fits under the 22,000 ceiling, but a worktree that checks it out with CRLF measures 22,274 — and the test then says the file has grown when nothing has changed, on the first command of a lane, before a line of work has been done. One session went hunting for a paragraph to move into docs/ that did not need moving.

## 2026-09-05 · ea3cf39 — The intro is advertised rather than explained

The six pages that say what this game is were even type on a dark screen, which reads as a manual however short the sentences are. They are laid out the way a store page is now: the headline stands on a lit banner in the page's own colour, a supermarket price flash is stamped across the corner of the picture, and the picture itself comes at the reader and goes back again on a three-and-a-half second trip, with the tag half a turn behind it so the corner reads as a second plane. Six pages, six colours, none of them one of the four greens the palette reserves.
## 2026-09-05 · d2e6567d — The iris's spokes run to the margin instead of being cut dark

The dark under-stroke made the ring a black outline round the pupil and left the spokes as ticks, which was worse than the invisible bright ones it was meant to fix. Both attempts were spending the same mistake: a bar floating in the middle of a wash of its own colour has nothing to read against. Six arms running from just outside the aperture ring out past the lens's own edge do — the lids cut both of their ends, and a line the eyelid crosses is a line an eye finds. The budget rows go back to where they were before the dark pass.

## 2026-09-05 · c12f1c14 — The iris is cut into the colour, not laid on it

The spokes were a bright line on a bright field and nobody could see them at any size. A thick dark stroke under the same path makes each one a slot through the wash of the body's own colour, and the lit line over it is then a line on a dark ground — which is what the reference does with its own aperture ring. One plain stroke and one save; the budget rows moved by exactly that.

## 2026-09-05 · 5c6fc47d — An eye has an iris that turns

Offered, not shipped: this commit stays on its branch until the owner has looked at it, because it changes what the game draws and he has not chosen it yet. It is here rather than in `tools/versus/` because VERSUS patches fields on records the game already exports, and a turning iris is new geometry — the README's own line is that no shipped file grows a flag or a branch to make a candidate possible.

## 2026-09-05 · 7f830c80 — The fluid around an eye is an almond, not a ring

THE WARDEN's hole is a circle, and the pool of fluid standing outside it was sampled as one radius round a centre — so however pointed the lens inside it became, the boss was a green disc with an eye painted on it. The lens had corners and the socket THE LID wears had corners; the film between them did not.

## 2026-09-05 · d44356e9 — Each streak is a gradient along its own length, not a solid bar

Twenty-six flat strokes read as a firework: every one was the same brightness from end to end, so the eye found a spirograph rather than debris. Each is now a linear gradient from nothing at the tail to white at the tip, at a third of the width, and the length spread is wide enough that some pass the front while others fall well short of it.

## 2026-09-05 · 1ae2e3f4 — The blast reads as light rather than as a clock face

Fourteen evenly spaced bars around a hard white hoop drew a dial: the eye found the spacing before it found the fire. The streaks are now twenty-six, each with its own length, width and brightness off one integer hash, half reaching past the front and half falling short of it; the ring is a shell of light that is transparent on both sides of the front instead of a stroked circle; and the fireball spends its colour in the middle third rather than holding it halfway out, which was drawing a pale bubble with an edge.

## 2026-09-05 · c9965ba2 — A lure shot by mistake goes up, and takes the hull in three places

Firing at a lure used to cost fifteen hull two rows above the ship and leave nothing behind to look at: no scar, no breach, no picture. The only record of the worst mistake in the game was a bar moving. It now detonates where it stands — a blast over the whole stage, in the disguise's own colour, drawn last of the frame and over the ship rather than under it — and the hull breaks in `lureBlastPlaces` separate columns for it, each one an ordinary `breachHull` with its own scar, its own crack and its own burst.

## 2026-09-05 · 617ad178 — A picture of a boss past its first round cannot be taken

Queued while photographing THE MAZE: only the first of five sheets can be photographed, so the widened rim and the collapse have no captured frame.

## 2026-09-05 · 8aa23856 — The director walks THE MAZE's five stages instead of describing them

The boss panel used to say the wheel was authored elsewhere and not editable here, which left the only way to see the fifth stage being to play four. It now carries a tab per stage and draws the sheet with the game's own wall code, with every way in marked — green where it reaches the heart, red where it dead-ends — and the length of each walk written underneath.

## 2026-09-05 · c25f8ec7 — Only one way through THE MAZE, and a wrong one brings the drum down

Five stages now, and each rim has one gap more than the last — but only one gap in any of them reaches the middle. The rest open onto regions of the maze that are walled off from it, so a shot sent down one crawls a few corridors, runs out of maze and is lost. When it is, the whole wheel drifts apart over the ship and the same stage is built again from the top.

## 2026-09-05 · e8adcc18 — A dotted line runs from the cannon to the body it is locked on

The target frame says *this one is picked out* and says nothing about what picked it out — and the whole of the rule is that a bolt leaving a muzzle somewhere else entirely is going to arrive here. So the link is drawn: cannon at one end, body at the other, straight, in the grip's own amber.

## 2026-09-05 · 05dda96e — CATCH AND AIM: the wave where the hand reaches further than the cannon

THE LOCK arrived live in every wave and taught nowhere. This is its wave, and it sits between SALVAGE and FINALE because it needs the pod: nothing else in the game makes where the cannon *stands* matter for anything but a shot. A body can be answered on any beat before it lands, so a pair asked why they did not simply slide the strip would be right — a wreck cannot, because it sinks and is caught by the maw of a cannon already under it. So the cannon is pinned on the left, the bodies arrive on the right, and the hand is the only thing that reaches both.

## 2026-09-05 · 4337bac5 — Queue: bun run frames cannot magnify what it photographed

A creature is forty pixels on a phone, so a before-and-after of a change to its shape is two pictures the change is invisible in. This lane had to hand-roll a crop-and-scale throwaway to judge its own work and to send the owner something he could see.

## 2026-09-05 · 86bed29a — An eye's lids meet at a point

The eyelid was rounded: both lids left their corners steeply and had to round over to reach the crown, so the aperture read as a bulb with two nicks in it rather than as an eye. The four control points of the two cubics now sit well inboard, which leaves each corner shallow and closes the pair on a taper of about seventy degrees instead of a hundred.

## 2026-09-05 · 53b004bb — Queue: bun run frames cannot photograph a spark burst

## 2026-09-05 · 793c66e3 — A body bursts in its own colour, and a rock lands like a rock

Everything that reached the hull threw red sparks, whatever it was: a cyan bulb came apart in the colour of the shot that would never have killed it. The breach event carries the body's own colour now, and the burst is thrown in it — cyan for a cyan body, red for a red one, red still for the colourless.

## 2026-09-05 · 9464ffaa — THE RECOIL's cage burns in the colour of the body it holds

The frame was rock-grey line work around a body whose whole point is its colour. It is now lit the way the ship's own ward is (`shield.ts`): every rib and every hoop arc goes through `strokeGlow`, over an aura the width of the hoop, and the light is the creature's own red or cyan mixed into the metal rather than a colour of its own — a frame in the body's colour is one more thing saying the word the pair has to trade, instead of one more thing over the top of it. Both the glow and the aura rise with `strain`, so a cage down to its last rib visibly works harder: the count the ribs carry, said a second way for a seat reading light across a phone screen.

## 2026-09-05 · 8225aa09 — THE MAZE's heart takes its own colour, and refuses the other at the hull's cost

The owner asked for the round to turn on the colour the heart is beating in, and for the wrong one to hurt. A slick's red on the first round, a bulb's cyan on the second, red again on the third — the two colours the field already carries, so player 2 is choosing between the two she has rather than learning a third, and neither player has anything to remember: the answer is in the middle of the drum, beating, on both screens.

## 2026-09-05 · b6bd9614 — A hand held on a body aims the cannon at it

THE LOCK: while player 1's hand is on a creature, every shot the cannon puts out steers into it and lands, from whatever column it left the muzzle in. Take the hand off and a bolt already in the air stops steering and finishes its climb straight up from wherever it had got to. It is not a new gesture — it is THE GRIP, held by the seat that owns the cannon — so the price is already built in: a thumb on the field is a thumb off the strip below it, and the shot goes where the hand is instead of where the muzzle is.

## 2026-09-05 · 4af59d7c — THE VEER's clown gets a nose, and the palette gets a hue for it

The figure was built entirely grey on the argument that every colour here is already spent and that a red nose on a rock reads as "shoot me" — the one thing a body nobody can fire at must never say. The owner overruled it for one mark, because a clown whose nose is stone is not a clown anybody sees.

## 2026-09-05 · 089399a4 — THE VEER: the grin reads clear of the nose

Drawn tight under it the mouth read as a shadow rather than a mouth, which loses the only mark on the face doing work beyond "somebody is up there". The grin is struck wider and lower, the nose smaller, and the head a fraction bigger against the stone.

## 2026-09-05 · b59c52f4 — THE VEER: a rock with a clown on it that will not hold its lane

Every rock so far has been a column said once. Player 1 reads one off the strip, player 2 puts the shield there, and the number stays true until the thing lands — which is why a pair who have learned the ward park the shield and stop looking. THE VEER expires three times: it falls a row a beat like the plain tier and steps one lane to the side as it lands on rows 3, 6 and 9. The rows are fixed and both players can count them; only the side is hidden, and it is hidden from the seat that holds the shield. Player 1 gets an arrow over the rider three rows before every step, player 2 gets two dim arrows and a target lock, and the sentence that has to cross the room is a side and then a column.

## 2026-09-05 · 35615317 — capture.ts keeps to the line limit

The hold loop's own comment folded into the paragraph above it: the file was at 251 lines and `limits.test.ts` counts.

## 2026-09-05 · 296bf270 — The open eye sits square in the socket, and its corners are tapers not spikes

Two adjustments to the shape the previous commit built, both from looking at the frame. The descent moves the gap's own middle rather than the corner line, so a wide eye is centred in the hole where it used to hang in the top of it and leave the floor blank; and the lids' control points sit further out toward the corners, which shortens the taper each corner comes to. The height of the gap is still exactly linear in the tension.

## 2026-09-05 · 9e54fe15 — `--hold` sends the grab a handle is waiting for

A handle's first `drag` is the grab: it takes the origin the distance will be measured from and moves nothing (`sim/warden-rope.ts`). `--hold` sent one command carrying a distance, so it grabbed the rope at that distance and pulled it nowhere — every warden capture ever taken with this flag was a picture of a shut eye with a number beside it saying otherwise, which is the exact failure the flag's own comment says it exists to end. It is two commands now, the grab at zero and then the pull, and `FrameSpec.hold` is the list.

## 2026-09-05 · ee234422 — THE WARDEN opens an eye rather than a shutter

The owner asked for this look by name: the eye read too round, and the two halves that come apart under the pull read as boring and machined.

## 2026-09-05 · ac40e91f — THE MAZE's heart starts slow, races as it is hurt, and bleeds where it is hit

Four things the owner asked of the body in the middle, and they are one mechanism: what state it is in, and how it shows it.

## 2026-09-05 · c990c145 — The way into THE MAZE is a gap with light coming out, and the shot goes in it

Three things the owner watched and named, and they are one change: what the way in looks like, and what goes through it.

## 2026-09-05 · 6830d7e8 — The ball is big enough to hold the body, and a ward cracks what is left

Two things the owner asked for by name.

## 2026-09-05 · 850a3f80 — THE MAZE's string is tied round to the side, off the gap's landing spot

The cord was tied to the very lowest point of the rim with the handle hanging under it. That was free space while a gap could click onto any column beneath the near half of the drum; it stopped being free the moment only the bottom column counted, because the lowest point of the rim is now the one place a gap ever comes to rest. The pilot was pulling toward a spot covered by the thing he was pulling with, and the arrival he was pulling *for* was behind it.

## 2026-09-05 · e84555a6 — The ship's five gestures are written down where nothing teaches them

docs/spec/controls.md said it was FIELD_CONTROLS in prose, "kept beside it rather than typed from memory a second time", while being two rows short of it: THE MAW TAP and THE LID'S CORD were in the array, in the director's page and in the game, and in neither the table nor the paragraphs. Nothing noticed, because nothing was looking.

## 2026-09-05 · 8951036 — The middle of THE MAZE has a heart in it, and it beats

The owner's sheet has START printed in the middle. The field does not take printed words, and a plain disc said nothing about why a shot should want to get there — so what is at the end of the walk is a body, which is what he asked for: a beating heart with veins, in a slick's red or a bulb's cyan, switching every round.

## 2026-09-05 · 17d45cd — THE MAZE counts only the bottom of its rim, and gains a way in each round

Two answers from the owner, and they work on each other. A gap now clicks onto one column only — the one the drum stands over — because he asked for "the most bottom position of the maze, nearest to ship" and meant it. A gap anywhere else on the near half was over a column too, and the shot went up it and met the rim at an angle; that oblique entry is what read as wrong. The near-half check stays and is not redundant with the new one: a gap at the *top* of the drum stands over the same column, and the cosine is the only thing that tells them apart.

## 2026-09-05 · 0c80718 — A warded volley leaves the dome on the tick it is answered

The owner's report was that it still reflects too late — that it moves inside the ship first and only then turns — and there were two ways it could.

## 2026-09-05 · 4ff739f — A body is seen to land on the ship before it breaks it

Everything the shield had nothing to say to — a slick, a bulb, a carom, a mount — was taken off the field the beat it entered the ship's row, so its last drawn frame was a whole tile clear of the hull and the pair watched it burst in mid-air. The rocks already had the beat: `resolveHull` granted it to them alone, and the fall was clamped onto the hull row for them alone. Both rules belong to the body rather than to the shield now, so every kind spends the beat render/ draws it come down the last tile standing on the ship, and breaks the hull on the beat after.

## 2026-09-05 · a38bbac — THE MAZE is a maze now, and the shot walks it without touching a wall

The boss drew three plain circles with a dot on the rim. It carries the sheet the owner sent instead: seven corridors round a middle, radial walls on the eighths, one gap in the rim, and the gaps in every circle where that sheet has them. The drum is drawn wall for wall, and the shot goes in at the gap and crawls the corridors to the middle — turning where the corridor turns, never across a wall, because the route is solved from the same walls the picture is drawn from rather than typed in beside them.

## 2026-09-05 · 08b2ce6 — The queen's next torch says when, not just which side

ONE MARK IS REAL was drawn around her body, which put the ring on her shell between the two marks and touched neither — a page about one of a pair, circling the pair's gap. A caption may now point at `marks`, and `render/queen-figure.ts` places them for both the drawing and the ring so they cannot come apart. The flank the next torch drops off wears NEXT TO FALL instead of the pulsing ring the real mark wears: the target lock every picked-out body in the game wears, the words under it, and a bar that fills as the eight beats run out. A mark is a column to call and a drop is a clock to watch, and one picture was doing both. THE QUEEN · SHE OPENS is gone; the film is three pages that each name a job.

## 2026-09-05 · 9dce52c — THE WARDEN grew a skin, and its rope became possible to pick up

The rope hangs under the pupil, which walks a column or two a beat, and the press was answered under the middle of the ring, which does not — so the red ball was outside its own button for most of every cycle, and the control read as intermittent rather than as missing. Both sides now ask for the pupil's own column, and the circle a finger is answered in is 1.8 times the one that is drawn: `handleRadiusMilli` widened by `hitCircle`'s own 30% came to under thirty pixels across, which is smaller than the thumb reaching for it. The line is tied to the underside of the eye rather than to the rim, and travels with it, so the thing the rope holds open is the thing the rope comes out of.

## 2026-09-05 · f4dd355 — `bun run sweep` finishes a lane that landed and stayed

`--keep` is the landing that is not the end of anything: the trunk takes the work and the branch, the worktree and every other spent lane stay standing. The problem is what happens next. From that moment every landing refuses the lane — it carries nothing `main` has not got — so "land and clean up" had no command at all behind it, and the only way to finish one was the `git worktree remove` this tool exists to keep nobody typing.

## 2026-09-05 · ec67df8 — A wrong colour now costs the next shot as well as the one that was fired

A shot in the wrong colour used to cost nothing: the body flashed grey for a third of a second while the reload gap was half of that, so the second bolt was already loaded and the arrival died on the beat it would have died on anyway. It refuses everything for `colourArmourMs` now — the right colour included — which is the invulnerability docs/spec/structure.md has carried unbuilt since the spec was written, and the owner's reading of the old flash was the plain one: it is not long enough to hurt. Seven hundred milliseconds is twice that flash and a little over one beat, so the mistake costs the shot and the next chance to fire, and the grey body render/ draws is read off the rule rather than timed beside it.

## 2026-09-05 · 4395b15 — The maw arrives on the wave that asks for it

SHIELD, THEN CANNON was the first wave on the full panel for no reason of its own: it introduces no creature and no mechanic, and the guide hung on it was five pages about the ship's alternate touch gestures, parked there because the panel rule already forced a guide onto the wave. The owner's call is that the gestures need no teaching at all — a pair finds them — so the film is gone and the wave keeps STANDARD 4 like the three before it.

## 2026-09-05 · 0f4bcea — The band no longer says which panel it is

A named plate hung on the seam whenever a wave was played on anything but the ordinary panel, on the argument that a set is a whole panel and the surest way for that to read wrong is for it to read as the usual band with something swapped in. The owner saw it over player 2's plate and said plainly: do not show the panel name or variant in the game.

## 2026-09-05 · 4342214 — TWO COLOURS was teaching what CYAN had taught the wave before

CYAN was written in to introduce the second colour on its own, and TWO COLOURS kept the guide and the rehearsal it had when it was the wave that introduced it — so the pair was taught the same thing twice, in consecutive waves. The owner's words: the tutorial of TWO COLOURS was already done in wave CYAN before, so it is not a special wave any longer with new introduction.

## 2026-09-05 · b16dcd0 — A chute shot under its canopy comes apart into two pieces

The owner's ask: the paraglider is released from the enemy and vanishes upward, and the enemy falls a little and then goes as well. THE CAROM's whole argument is that one arrival becomes two problems, and the body under the canopy is the second of them — so its end is two things rather than the single burst at a tile every other kill in this game is.

## 2026-09-05 · de6dea1 — A deflected rock leaves at the size it arrived at

The bounce was drawn at a flat `tile * 0.4` however wide the body that came off the shield was, so a torch or an authored two-tile meteor — both of which the pair have watched fill two columns the whole way down — halved on the frame the shield turned it. `DeflectFx.spawn` takes the creature's kind alongside the span it already had, sizes the rock by `rockTileRadius` (the same rule the falling rock and its crater are drawn by, lifted out of `rockRadius` so a caller holding a tile width rather than a layout can call it instead of copying the number), and gives the torch back its ember ring — the one mark of the flame that survives a bounce, the tail being a picture of falling and there being no falling left to do.

## 2026-09-05 · 23814f2 — Queue: two flakes measured, and the hole a film cannot author around

Three findings from a session draining the queue, none of which belongs in the work that found them.

## 2026-09-05 · 700ca1e — THE CAROM's guide is watched rather than read

It shipped with three lines of prose and nothing moving, and it is the worst wave of act five to describe in a sentence: what the pair has to learn is a shape — a body crossing three lanes a beat that turns *at* the side wall rather than reflecting somewhere between two columns — and an order, the cannon opening it and the shield finishing what falls out. Neither reads off a line of text and both are one glance in a picture.

## 2026-09-05 · aeabfa0 — THE MIRROR's glyphs are drawn in the seat's own flesh

Every body a control is made of has been the seat's colour since the two screens stopped looking alike, and `drawFireButton`, `drawActionButton` and `drawStripMark` all take that colour as an argument. THE MIRROR's sequence never passed one, so the glyphs the boss played back were drawn in player one's tissue on a gold panel, on both devices — the pair is meant to recognise a glyph as the button it is about, and on player two's seat it no longer looked like one.

## 2026-09-05 · 35f69e9 — An unwarded volley hits the ship as the rock it looks like

The simulation has charged THE VOLLEY through `damageSpan` since it landed, and the scar it leaves names `kind: "volley"` — but render still asked `isMeteorKind` at the three places downstream of that, so the one body on the field that is unmistakably a rock was drawn breaching as a red burst at the hull, with no crater and no fall to watch it arrive. The breach picture, the crater and the delay that holds a crack back until its rock has landed all ask `isWardable` now, which is the rule `hull.ts` and `bullet-hit.ts` were already moved onto.

## 2026-09-05 · a4dc854 — A warded volley keeps its rim and loses its filling

The owner asked for the outer line of the basketball to stay — a skeleton, and still round. It was cutting a sector out of the whole ball, so a body warded twice was a shape with a bite taken out of it and the silhouette meant something it should not.

## 2026-09-05 · ff24d08 — A volley falls like a rock and is turned at the dome like one

Three of the owner's reports, and one answer under all of them: it stops having physics of its own.

## 2026-09-05 · 0f0354b — A second answer to what a rock is made of, offered beside the grey one

The meteor's material was inline in `drawMeteor`, so there was nowhere for a second answer to it to sit — `docs/versus.md` names the rock as the case the mechanism should be tested against and this is the seam that makes it possible. `METEOR_LOOK` (`meteor-look.ts`) carries the layers a rock is painted in — body, pit, an optional shell around it, and the halo — with the shipped stone filled in unchanged. `drawMeteor` keeps the placing, the spin and the wobble and calls into the record. Not a pixel moves.

## 2026-09-05 · 67e0b83 — A panel the pair has not held before is introduced like a new creature

A guide teaches the first wave to carry a creature, a pod, a boss or a mechanic, and a panel was the one new thing that arrived unannounced: a pair reaching STANDARD 3 is handed a button they have never seen and the wave said nothing about it. `firstOnPanel` is the question — the first *sight* of a set, not every change of one, because returning to the ordinary field after a boss round teaches nobody anything — and `content/test/waves.test.ts` fails on a wave that opens a panel in silence. All five that do carry one.

## 2026-09-04 · 2defeb3 — The panel grows a button at a time through the first eight waves

The standard panel is six buttons, and the game used to hand a pair all six on the first wave. STANDARD 1 through 4 are the same panel with buttons held back — red alone, then cyan, then the trigger, then the plate that trigger fires — and the fifth rung is the standard panel itself, which is why there are four entries rather than five.

## 2026-09-05 · c691147 — The seams are the basketball the owner drew, not four lines through the middle

He sent the SVG. What was there was an equator, a meridian and two arcs bowing off the meridian — which is what a basketball looks like when it faces you exactly, and is a cross the rest of the time. `SEAMS` in `volley-seams.ts` is his drawing instead, measured against its own rim and written down in unit coordinates: four curves, every endpoint on the circle to within a thousandth, multiplied by whatever radius the row gives the ball and by nothing else.

## 2026-09-05 · c56017a — A volley on the ship's row slid out from under the shield

The owner's report was that warding one does nothing, and it was two faults under one symptom.

## 2026-09-04 · 28db5f3 — The seams are painted on the ball rather than over it

Three faults in the first basketball, all of them the same fault: the four seams were drawn to the full radius while the rock's contour is faceted and is inside that radius almost everywhere, so they overhung the stone; the ellipse that draws the two side arcs continues whatever subpath it is called on, so the meridian ended in a tail running out to where the arc starts; and at a tenth of the radius they were thick enough to be the thing you saw instead of the rock.

## 2026-09-04 · 7d5f1cc — THE VOLLEY's shell is a basketball made of meteor

The owner asked for this one by name. The shell was a thin ring of plates with the body burning through the gaps between them; it is a ball now — the same `METEOR` contour `meteor.ts` strokes, the same unlit mid-tone, the same key light handed the rotation so the light stays put while the ball rolls under it — and the only colour on it is four seams in the colour of the body sealed inside: the equator, the meridian and the two arcs that bow away from the meridian either side, which is the pattern a basketball has.

## 2026-09-04 · 4e77c03 — A rock the shield hits back rather than away, three times

THE VOLLEY is a rock coming in on a diagonal with a slick or a bulb sealed inside it, and the first arrival the shield does not finish. A ward does not destroy it: it hits the body eight rows back up the field, knocks one plate of shell off on the way, and it falls again from higher up into a column nobody agreed on. Three wards, and at the top of the last climb — the middle of the field, in plain air, on both screens — the shell bursts and what was inside comes out as an ordinary slick or bulb, falling, with a colour, for the cannon. It is THE CAROM read backwards: opened by the shield and finished by the cannon rather than the other way about, so the pair's two controls now run in series in both orders. The count is the plating itself and there is no health bar — one plate drawn per ward still to come, THE RECOIL's cage arrangement.

## 2026-09-04 · e956a16 — Landing and pushing are two answers, not one

The lane question offered three answers and the owner wanted a fourth: land and send. So (c) `bun run land --keep` moves the *local* trunk and stops there, and (d) `bun run land --keep --push` does the same and gives `origin` the trunk too.

## 2026-09-04 · b1b484b — The lane question is asked once per commit, not once per turn

"More to come" leaves the lane clean and ahead of `main`, which is exactly the state the hook fires on, so answering it would have brought the same question back at the end of every turn until the owner gave in and landed. The commit put to him is written to the worktree's own git directory, and the question is not asked again until `HEAD` moves — new work being the thing that makes it worth asking twice. A note that cannot be read or written means one extra ask, never a lost one.

## 2026-09-04 · 81f8bec — A finished lane is offered to the owner instead of landing itself

The `Stop` hook ran `bun run land` on any turn that ended clean and ahead of `main`, so a finished turn moved the trunk, swept the worktree and wrote the remote with nobody typing anything. That closed the right gap — a lane left on a branch is a rebase that grows every day — and overshot it, because landing is where a lane's life ends and the owner wants that moment to be a question. A turn ending is also not the same as a lane being finished: usually the next prompt for it is already coming.

## 2026-09-04 · 40ed85c — The window is left unpainted rather than punched out of the body

`destination-out` takes away whatever is already on the canvas, and the body is already on it — `drawLiving` runs before the crust. So the porthole was erasing the slick along with the rock, and what the pair saw through the glass was a grey disc rather than the colour they have to call.

## 2026-09-04 · 9cb3fdf — A cracked carom throws its body out of the hatch, and the shot counts now

Six things the owner asked for, and one of them was a real defect.

## 2026-09-04 · 2e047e4 — The trunk reaches origin when a lane is cleared away, not every landing

`bun run land` pushed `origin/main` every time it moved the trunk. Landing stopped being something anybody schedules once `auto-land` took it at the end of every finished turn, so that was a push per turn — usually one commit onto a remote nobody was reading yet. The push now rides on the sweep instead: it goes when the landing actually cleared a lane away, a worktree removed or some other lane's branch deleted, which is about once per lane. The lane's own branch is not counted, because every landing there has ever been deletes it.

## 2026-09-04 · 20b996e — The opening pages were painted beside the game rather than on it

On a window wider than a phone the renderer draws into a phone-shaped stage cut out of the middle of the canvas, and hands the canvas back at the window's own origin. The intro painted straight onto that, so its six pages stood against the left edge with the field showing to their right, while SKIP and NEXT went on answering presses one stage offset away — which is why the only clicks that reached a button were the ones over the game.

## 2026-09-04 · daf82d1 — Queue: tools/frames' browser tests are flaky under a full check

## 2026-09-04 · ce03a63 — The ship lights the water above it, in its own seat's colour

The panel under the hull is the seat's colour throughout; above the hull there was none of it at all — the same cold violet sky on both devices, right up to a gold rim. This is the other half. A single gradient rises off the top of the band into the field, additive, peaking under a tenth and gone within a third of the sky: the brightest thread of the seat right against the skin, where a rim light would be spilling off it, and the tissue's own colour above that, which is what the chamber below is made of.

## 2026-09-04 · 2337517 — The first screen died on a window with no room in it

The intro gave its picture whatever was left after the title and the nav bar, and never checked that anything was. Below about 230 device pixels of height that subtraction goes past zero, and a canvas that has not been laid out — a tab drawing while hidden, which still runs its frames — is 0 wide and takes the width past zero the same way. Either one reached `plate` as a negative corner radius, which a real canvas throws `IndexSizeError` on, so the whole page died rather than drawing a squeezed one.

## 2026-09-04 · 5da0a49 — The settings page read a name that only a bundle has

`__BUILD_DATE__` is substituted by the two build scripts and by nothing else, so under a dev server the identifier is simply absent and reading it is a `ReferenceError`. The settings page read it raw, which killed `buildMenu` before it drew: the director's `/game` door — and `bun run dev:game` — opened on a runtime error whose stack pointed at the menu rather than at the build.

## 2026-09-04 · a647453 — The top of player two's chamber was a lit band where player one has a dark one

The amber hull ended in `#241000`, and that stop is now the colour the panel opens on as well, so it was drawing a brown band right under the gold rim — the one place on the screen the join was still visible. It goes a shade deeper. The slime hanging off the membrane takes the tissue's own colours rather than the ship's rim, for the same reason the spill does: a rim is the brightest thing on a seat and the drips were reading as gold rather than as slime.

## 2026-09-04 · 39eaeaf — Player two's chamber was a lit brown field, not a dark one

Gold at the same hex energy as violet is a much lighter colour — `#F8B65A` against `#A666F8` is 189 against 126 in luminance — so the first pass of the seat's tissue gave player two a panel visibly brighter than player one's, when the only thing that should differ between the two is hue. Every new stop is matched by value to the violet it stands opposite.

## 2026-09-04 · 38f38a7 — The ship and the panel are one piece, and player two's is gold throughout

The membrane between the hull and the control panel had a lit rim traced along it, and the chamber below opened on a colour of its own — a bright line with a step in value under it, which is two separate ways of saying the ship stops here and a box begins. The line is gone. The contour survives only as the shape the tissue is cut to, and the chamber's first colour is now the hull's last one, so the join has nothing in it to see; what is left saying where the ship ends is light spilling through the membrane into the top of the panel.

## 2026-09-04 · 379d00d — The crust is drawn at the width the shield has to cover

A carom is two columns wide (`colSpan`) and the rock it becomes keeps that width, but the crust was drawn at `creatureRadius` — one tile, whatever the span — so the pair saw one lane's worth of a body the shield covers two lanes of, and the picture would have doubled in size the instant it cracked. It is `rockRadius(l, spanOf(c))` now, the same two numbers `drawMeteor` reads, so nothing about the footprint changes when the shell comes off.

## 2026-09-04 · 7b38476 — A body neither the cannon nor the shield can finish on its own

THE CAROM is a slick or a bulb sealed inside a rock crust. It never falls: it comes in on a diagonal at four columns and two rows a beat and turns at the side walls of the field, twice from every column a wave can author it into, before it reaches the ship seven beats later. Whole, it is a rock and the shield has nothing to say to it — a trigger pressed at one answers nothing, whatever column the shield is in. The matching cannon cracks the crust, and what drops out is a plain meteor coming down at a row a beat, which now has to be warded. So the pair's two controls are in series for the first time, and the shot that "kills" it is what hands it to the other seat.

## 2026-09-04 · 566198e — Three films existed for an hour with no wave showing them

THE LID, THE MAZE and THE WARDEN landed written, registered and unreachable: a reconciliation with another lane dropped the three `scene:` lines that point a wave at its film, and nothing said so. Every test that walks the waves skipped them silently — including the one that runs a rehearsal tick by tick, which is the test that would otherwise have caught anything else wrong with them.

## 2026-09-04 · 11d0081 — The last three waves rehearse themselves, and a drag has two clocks

THE LID, THE WARDEN and THE MAZE are films now, on the drag machinery that landed an hour ago. Every wave in the game that carries a guide carries a rehearsal.

## 2026-09-04 · b91c222 — A rehearsal can hold a thumb down, and two more rounds have films

Five controls in this game are held rather than pressed — the lance, the gauge's two valve slabs and the bucket's two — and a film could only ever press them. An act carries `until` now, which was the grip's field and is every hold's: the press goes down on its own tick and the control's own release goes up on that one, taken from the table that knows what a control says rather than authored beside it.

## 2026-09-04 · c51539e — THE LANCE had no tutorial at all, and now it has a film

The wave trades the maw for the lance, so a control the pair has used since SALVAGE simply vanishes off the panel and one nothing has ever mentioned takes its place — and the wave carried no guide of any kind. `waves.test.ts` could not see it: the lance is a mechanic with `reach: "run"`, on from the first wave to the last and carried by no wave's entries, so no wave *introduces* it and the rule that asks for a guide could never fire.

## 2026-09-04 · 5729573 — Which Bun this project expects is said in the tree, not only in CI

It could not be told from the repository at all. The only declaration was a literal inside `.github/workflows/ci.yml`, which nothing outside GitHub reads — so a cloud session, which clones `origin` and gets whatever Bun its image ships, had no way to know what the project was tested against, and neither did anybody opening it.

## 2026-09-04 · baa0899 — A rehearsal can put a hand on a cord

Three things in this game are taken hold of and carried rather than pressed — THE LID's cord, THE MAZE's string and THE WARDEN's rope — and none of them could be written into a film at all. That is why THE LID is the last ordinary wave with no rehearsal and why two of the bosses could not be reached: the skill told authors so in as many words.

## 2026-09-04 · f4d64bd — What a renderer holds between frames is its own file

`canvas2d.ts` sat at 248 lines against a limit of 250, and a three-line getter for whether the wave was still arriving would not fit. The fix went the long way round instead — `bun run frames` painted a fixed count and hoped — and the entry that went in the queue said what it had cost: the next thing that wants to know what the renderer is in the middle of hits the same wall.

## 2026-09-04 · 6c0ff59 — The intro is neon, wet and one line a page

The owner's correction on the first version, in his own words: *colours should look neon slimy fluid cool and funny/friendly, use much shorter text, could be like advertisement.*

## 2026-09-04 · 4324d00 — Six pages that say what this game is, before anybody has chosen anything

The owner asked for it by name — *a cinematic like tutorial when entering the game first, explaining the core concept of the game* — which is the first of the three exemptions in CLAUDE.md's rule about looks: the decision is already made, so this ships rather than being offered beside the shipped screen.

## 2026-09-04 · 1e7a3a5 — A cloud session's Bun may be older than the lockfile

Three failures in this session all had one cause, and none of them said so: a container carrying Bun 1.3.11 against a `bun.lock` written by a newer one. `bun install` quietly downgraded `lockfileVersion` from 2 to 1 in the working tree, `bun install --frozen-lockfile` refused — which is the step `bun run land` takes straight after the rebase, so the landing stopped before the check ran — and every websocket case in `apps/server` timed out, because Bun's `ws` shim has no `upgrade` event for miniflare to use. Twenty-five red tests that are green on the owner's machine.

## 2026-09-04 · 23719b2 — Take the rehearsal walk's budget finding back out of the queue

It was queued because the walk took 38 seconds against a 30-second budget on a cloud session's container, so `bun run check` was red there through no fault of the tree. `The film walk is shorter, because there are twenty-six of them` landed on main in the meantime and answered it from the other end: the walk is 140 frames a page now, and the budget behind it is 60 seconds.

## 2026-09-04 · d76249a — The capture paints the arrival out without asking the page

The fix for the frozen launch animation put a `launching` getter on `Canvas2DRenderer` and carried it through the testing handle, and that getter took the file to 262 lines against a 250-line limit — a red `bun run check` that only the full suite showed. Shaving a comment to fit is exactly what the act-three item in this queue was about, so the getter comes back out.

## 2026-09-04 · 3245127 — Act three takes two files, and the order is still the order of the game

Adding one `scene:` line to a wave in act three had cost two rounds of shaving a sentence out of a comment to stay under the 250-line ceiling. That is the warning the limits test exists to give: the file was full, and the next change to it would have needed the same shave again.

## 2026-09-04 · f628d0a — A capture waits for the wave to finish arriving

Every picture `bun run frames` took of a wave with a gate had two enormous rings over the top two thirds of it, one violet and one amber, with the specimen hanging inside them. They are the wave arriving once the pair crosses the ready gate, and they run on the frame clock: the tool steps the simulation and paints once per photograph, so it handed the animation a sixtieth of a second per picture and never got past it. They were still there 2500 ticks in, and a session that cannot take an honest frame cannot show the owner anything.

## 2026-09-04 · 1f50434 — The ON THE FIELD list is checked by gesture, not by hold kind

`FIELD_CONTROLS` was kept honest by an exhaustive switch over `Hold["kind"]`, which was exactly right while one hold meant one gesture. It stopped being right the moment the cannon grew a second: a press that slides it and a lift that opens the maw are both `kind: "cannon"`, so the switch was satisfied by the first, THE MAW TAP was written by hand, and nothing would have failed if it had not been. The list is what the director's CONTROLS tab shows somebody reading the game's controls, so a silent hole in it is a control nobody can find.

## 2026-09-04 · 03d468e — One conversion says where a pointer landed, for both hosts

`inStage` turned a `PointerEvent` into stage coordinates with `e.clientX - stage.left`, which is right only because `game.css` pins the canvas to the whole window and `bindViewport` measures `window.innerWidth`. Nothing said so and nothing failed if it stopped being true — and there were five copies of it, in the field's listener, the guide's, THE GAUGE's, SNAKE's and PINBALL's. The director had the same three lines in four files and every one of them was wrong: each control was answered to the left of where it was drawn, which is what `tools/director/src/stage-point.ts` was written to stop.

## 2026-09-04 · b671a83 — Every frame test starts with the baked caches cold

The panel's sheet, the halos, the sockets and the button contours are baked once and kept in module maps, which outlive a test. So whichever run first asked for a size paid for the bake and every run after it was handed one free: `frame-budget.test.ts`'s p1 row carried fourteen `new Path2D` for a sheet that p2 — same size, same sheet, one run later — got for nothing. The rows were true for the order the loop happened to run in, and swapping the two seats would have failed the test for a reason that had nothing to do with the frame.

## 2026-09-04 · 765444d — A page with no clock behind it reports a finite age

Every screen of a wave's opening read its clock as `fx?.age ?? Infinity` — the sentinel for "this has been up for ever, so draw it finished". Right for a fade, which clamps; wrong for anything that breathes, because `Math.sin (Infinity)` is `NaN` and a `NaN` coordinate is a call a real canvas refuses. Two functions had grown a `Number.isFinite` guard of their own to stand in front of it, and the second one was written the day the guide's bar got a slime feeder.

## 2026-09-04 · 47680ec — Read the director's imports one statement at a time

The import-cycle test matched every import in a file with one regex whose body ran across newlines, so a value import naming a package — no relative specifier of its own to end on — opened a match that closed on the *next* relative `from "…"`. When that was an `import type`, the type-only edge was recorded as a runtime one: the negative lookahead had already been spent on the earlier line's keyword. Eighteen of the director's 210 files reported an edge that TypeScript erases, and `brush-cards.ts` carries a narrowed annotation that was written to get past one of them.

## 2026-09-04 · 4d3ecf8 — SHIELD, THEN CANNON teaches the other way to reach everything

The ship has been a second panel since the day it was asked for — take hold of the cannon and carry it, let go without carrying it and the maw opens, drag the plate or press it to fire it, carry the muzzle left for red or right for cyan — and nothing in the game has ever said so. Wave seven does now, one page per gesture, on the wave where the pair already owns every one of the controls those gestures reach.

## 2026-09-04 · a1433b9 — The tutorial's corner plate is bigger than the words in it

*The content is bigger than the button.* It was: the plate was sized as though a grown contour held the rectangle it is drawn around, sixteen points wider than the longest line with two rows of type filling it from edge to edge — so the end of the screen's name hung over the side of the body and the descenders sat where the curve had already closed.

## 2026-09-04 · 527213e — The film walk is shorter, because there are twenty-six of them

Every page of every rehearsal is drawn frame by frame at three roles, and the walk was two hundred and sixty frames a page — chosen when there was one film to walk. Twenty-six of them took it past half a minute. A hundred and forty still crosses the shortest page a film may have, which is what the check is for: it catches a value that is a perfectly good number and not a colour.

## 2026-09-04 · 11de2c2 — What a control says is one table, and two rounds rehearse themselves

THE FLEET and SNAKE open on films of themselves. The fleet's first two pages are the same instant on the two phones — every ship on his chart, nothing but water on hers — and then she walks the sights two squares and he fires into where they are standing. The sights open dead centre on a ship, and the film walks away from that on purpose: a salvo from the opening square would have hit without a word being said, which teaches the opposite of the wave. SNAKE shoots the enemy in the opening lane, turns late on the other seat's word, and shoots the one the turn was for.

## 2026-09-04 · bcffcd3 — THE MIRROR rehearses itself, and the rest of the bosses are queued by wave

The mirror performs two of the pair's own moves at their own ship and then asks for both of them back. The middle page is the wave: *nothing you press counts while it is still showing* is the instruction every pair breaks first, so the page that says it points at the button they are about to press, during the beats where pressing it does nothing. The verdict at the end of the film is the simulation's own `right` rather than a picture of one.

## 2026-09-04 · de41e9f — A petal comes off the queen, and the queue item that asked for it was wrong

BULB QUEEN's film has its fourth page: the cannon walks to her weak side on her second cycle and a petal comes off. It is aimed at `col + weakSide` and not at the mark her middle is showing — those are two different columns, and telling them apart is the whole of what the pair does about her.

## 2026-09-04 · f479aef — The first boss rehearses itself, and the film that cannot fire says why

BULB QUEEN opens on a film of herself: she swells and opens, the two marks under her middle appear on player 2's screen and not on player 1's, and a torch drops out of a wing on a clock of its own and takes the hull while the pair is still talking about the marks. That last page is the film's one shared page and it is spent well — the torch is the thing on her that neither screen owns, and the bar dropping is the sentence *she is doing two things at once and you are answering one of them*.

## 2026-09-04 · cf0c58d — The wisp, the gyre, the recoil and the vane rehearse themselves

Twenty-one of the game's waves now open on a film of themselves, and these four are the ones whose lesson is a place nobody can point at yet. THE WISP puts the cannon on the square two beats before the hop and lets the hop happen, which is the opposite of every reflex the pair has built up by then; its third page is on her screen rather than his because he cannot watch it arrive, and not watching is the point of having gone there. THE GYRE turns, is slowed by SUCK, and is shot inside the four beats that buys. THE RECOIL fires twice and kills nothing: each hit throws the cage two rows back up the field and turns the body over to the other colour, so the film ends inside the second undoing rather than on a corpse. THE VANE lets the arm fold one arrival right across the field and walks the cannon to where it came out.

## 2026-09-04 · 4997f90 — The two remaining pods, the echo and the ghost rehearse themselves

THE PURGE fills the field and then empties it in one frame: four bodies come down and none of them is shot at, because the only shot in the film is the one that frees the pod — which is the wave's other half, a shot spent here being a creature still coming. THE WARD ends on a page about something not happening: the shield slides into the rock's column, nobody presses anything, and the rock is turned away, because the pod is holding the trigger player 1 has been pressing since wave four. THE ECHO runs two bodies so it can show both answers — one left alone on the left of the field, dividing while the pair reads about it, and one taken on its first pass before it has ever split. THE GHOST shows the same instant on the two phones, and on player 1's the ring is drawn round nothing at all, which is exactly the picture he has.

## 2026-09-04 · 009f1c7 — Four more rehearsals, and a caption can point at a pod

SALVAGE, THE THIRD SHOT, THE CLASP and THE RIND now open on a film of themselves. SALVAGE is the first with nothing falling in it at all: a pod hangs where it was left, she shoots it loose, and the slide and the maw are one page because a wreck crosses the field in under two seconds and a film that gave them a page each would be teaching a tempo the wave has not got. THE THIRD SHOT puts the cannon under one half of the plating, chips it, moves to the other and chips that, and only then does the colour that was showing through the cracks the whole way down land. THE CLASP is the ward pointed up the field instead of down — her column, his trigger, and then the ordinary shot the pair already knows how to take. THE RIND carries the cannon to the body once and leaves it there for all three.

## 2026-09-04 · 86cddd2 — Four of act three rehearse themselves, and a film is watched by a test

THE LURE, THE THROB, THE DART and THE VEIL now open on a film of themselves. Each is built round the one thing its wave takes away. THE LURE shows the same body on the two phones — a target on his screen, a corner frame reading DO NOT SHOOT on hers — then fires at it and lets the hull pay for the shot, which is what a lure really costs. THE THROB fires twice: once while it is shut, where the bolt is swallowed, and once on the count. THE DART puts the cannon two columns over and leaves it standing there for two beats before the body arrives, because a reaction is exactly what that wave has removed. THE VEIL spends its middle page on the cloud turning colour as it falls, on its own clock, while the words about it are being read.

## 2026-09-04 · cc3214b — Four more waves rehearse themselves, and the corner is grown

The first five waves of the game now open on a film of themselves instead of on three lines of prose. TWO COLOURS fires red at a cyan bulb and lets the pair watch the shot be spent, then fires cyan; THE ROCK hands the shield across the split, her column and his trigger, and waits until the rock is nearly down before pressing it; THE HAND holds one of two rocks back with a finger on the field while the shield takes the other, then goes and gets the one that was held; TORCH shows the same instant on both phones — his strip carrying the blip that names the column, hers carrying the alarm and not the column — lets the first one through because nobody called it, and covers the second.

## 2026-09-04 · 53637df — Pin the recoil's colour crossing, and queue the frames tool's stuck launch

`recoilTurn` had no test of its own: it is read only by render, so nothing in the simulation's own suite would have noticed it answering 1 on the frame of a hit. Taken on that frame rather than through `chase`, which leaves two beats behind it — that the crossing is over inside the beat it started is the second half of what the rule promises.

## 2026-09-04 · fd55b5b — The recoil's cage blows off on the last bounce, and its colour crosses over

Three things about THE RECOIL, all asked for by name — the look exemption CLAUDE.md names first, so none of them is offered beside the shipped one.

## 2026-09-04 · 8fd8035 — The last page of a film stops on its own last tick

Three fixes to the bar and the film, all found by looking at a frame of it.

## 2026-09-04 · 8579eef — The tutorial's bar is a layer on top, and its buttons are signs

The bar under a guide is no longer a fourth row of the control panel. It is a slab of a different colour, taller, with a lit rim, a shadow it casts up onto the game and slime running out of that rim into its sockets — because it does not belong to the game and had been dressed as though it did. The three buttons carry signs instead of words: arrows grown from curves with a bead of slime hanging off each, and a loop with a bulb on its point. Their outer ring is gone, which was the socket's lip sitting outside their own stroke and reading as a second border. NEXT is much louder once the step has played — a halo that breathes, a thicker rim and a sign that grows with it. The step count beside the dots is gone; the dots said it already. TUTORIAL has moved into the corner plate and joined the line naming the screen, which is now the prominent half of it, and the line that said which of the two screens you were holding is gone.

## 2026-09-04 · 421b7e5 — A step plays again when asked, and the bar says it is the tutorial

The film under a guide's page used to start itself over every couple of seconds. It does not any more: a page plays once, stands on its last frame, and plays again when REPLAY is pressed — the middle of three buttons on the bar, because a picture restarting on its own beside words somebody is reading is movement the reader never chose. The bar now says TUTORIAL, in a lozenge cut from the same contour as the buttons, and the three of them are the panel's own buttons rather than plates: a wet socket underneath, a film of gloss over the top, a neck of slime feeding each one out of the edge above, and a body that carries its own colour. NEXT keeps its name to the last page. Whose screen the film is showing is a permanent label in the corner instead of a word that faded in and out, so a player who looks up mid-page can still find the answer. The miss and what it costs the hull are one step now rather than two. On the gate, the circles sit well below the wave's name, a press anywhere above the bar fills your own, and where the room knows what the two people are called it uses their names instead of PLAYER ONE and PLAYER TWO.

## 2026-09-04 · de37c6b — Player two's ship is amber, and the gate is two circles

Eight things the owner asked for after watching the tutorial, and one of them is not about the tutorial at all.

## 2026-09-04 · 44fbac8 — The cannon's mouth burns in the colour of the shot that just left

The opening at the top of the cannon was a flat dark disc under a white line, and it said nothing at all about the shot going through it. It now does two things it did not. It burns: from the tick a bolt leaves, the whole body glows in that bolt's own red or cyan and fades back to the hull's light over about a second and a half of beat — held at full for the first third of that, because a burn that decays from frame one is over before an eye on the other side of a phone has arrived at it. And it is made of something: a lit volume of dark jelly, a rim that is a neon tube rather than a stroke, two wet highlights drifting on their own slow clock, and a swirl low in the body that brightens under load.

## 2026-09-04 · 845ab65 — The gate is one column, and the button fills while it is held

The wave's name and its sentence sat where a standing introduction sits, a third of the way down the screen, with a hand's width of nothing between them and the button. They are hung off the button's own stack now — name, sentence, who is still reading, the two circles, READY — so the page reads as one thing. The field is still behind it, which is the point of the page; what is gone is the gap.

## 2026-09-04 · 8cf7565 — Every guide is pages now, and the director shows them

The director opened every guide with its page count at zero, which the simulation reads as "this seat is already standing at the gate" — so turning BRIEFINGS on put the ready button up and nothing else, with the old card behind it. Its stage now tells `startWave` how many pages the guide has, read off the wave being edited rather than off the list on disk, so an unsaved guide is paged the way it will be.

## 2026-09-04 · 0786d14 — The tutorial is a stack of pages, and each player turns their own

A guide that carries a rehearsal is no longer a film that runs once at a tempo nobody can keep up with. It is six pages: five steps of the rehearsal, each repeating its own animation and its own words with a short pause between turns until the player presses NEXT, and then the gate — the game's own screen with the wave's number, its name and its sentence over it, and the READY button under them. BACK goes back a page and the bar says which page this is. Each seat has its own cursor, so the two read at their own speeds and only meet at the end.

## 2026-09-04 · ef8ca39 — The cannon swallows when you let go of it without going anywhere

Player 1 had no way to open the maw on the field at all: taking hold of the cannon on the hull slid it, and the SUCK lobe in the band was the only way to reach the one control the ship's own picture is *about*. It is two gestures on one swelling now — carry it and it slides, let go without carrying it and it swallows — decided on the lift, exactly as player 2's muzzle swipe already works one seat over, and only on a panel that has a maw on it at all.

## 2026-09-04 · 340a89a — A rock lands on the ship and stands there for a beat, which is a beat the shield still has

The shield did nothing when there was no room left. A rock's last drawn tile was a replay of a body the simulation had already removed and resolved (`rock-impact.ts`), so the trigger pressed while watching the rock cross that tile arrived at nothing — and the rock sank into the hull with the press still in the air. A rock's fall now stops on the ship's row instead of carrying it past, and it stands on the plating for the one beat render/ spends drawing it arrive. That beat is a third and last time the shield is asked, and it is the one the owner was pressing on. Every tier gets the same beat, a torch's thirteen tiles included, where before a fast rock spent its whole last step as a picture of something already gone.

## 2026-09-04 · 620a1e8 — The tutorial is the game's own screen, and it comes before the wave's name

A wave with a guide now opens on it, and the wave's number, name and sentence come after — teaching first, naming second, so the pair reads FIRST STEP already knowing what a first step is. A wave with no guide is unchanged.

## 2026-09-04 · 73be5c3 — The control panel is the inside of the ship, not a box under it

Asked for by name — neon, fluid, living, slime, no sharp edges on the panel or its buttons, and integrated with the ship rather than bolted to it. It lands under the first exemption in CLAUDE.md's *A look is offered, never replaced*: the owner asked for this one, so the decision is already made.

## 2026-09-04 · 2237e82 — A click on the director's stage lands on the control it was on

The renderer draws into a phone-shaped rectangle cut out of the canvas — `computeStage`, as wide as the columns and centred — and the director built its layout from the whole canvas instead, then turned a `PointerEvent` into canvas coordinates in four separate copies of the same three lines. At the size the panel actually takes, that draws the first lobe near x=93 with a radius of 17 and answers it near x=61 with a ring of 28: the two graze, which is why a press on a button worked some of the time, and why it changed with the height of the window.

## 2026-09-04 · 3674f96 — A shot that lands sends it the wrong way

THE RECOIL: a slick or a bulb inside a sprung cage. The matching colour does not kill it — it throws the body two rows back up the field, a lane to one side the seeded rng picks, and turns it over to the other colour on the way. Three times, with one more rib of the cage split each time, and only the fourth shot finishes it. What it costs the pair is the sentence they had already agreed: the column, the colour and the row all expire on the beat their own shot landed. `docs/tower-defence.md` has carried the row since the conversion — the PvZ pole vault, inverted — and it is built now with the owner's two additions, the three bounces and the colour turning over.

## 2026-09-04 · bb48ea6 — `bun run frames --opening intro|guide` photographs the opening

`clearOpening` was unconditional: every capture this tool has ever taken advanced past the introduction and the guide on its way to the field, so the two screens a wave puts in front of a player were the one part of the game it could not photograph. That was fine while an opening was two blocks of text; a guide now carries a rehearsal that loops for a second and a half, and the lane that built it had to write a throwaway Playwright script to see its own work.

## 2026-09-04 · 4e52103 — The menu splits along its own two seams

`menu.ts` was at 249 lines and `menu-view.ts` at 242, and the menu is the part of `apps/game` that has grown every time the game learned to be a front door — so the next page added was going to push one of them over and the split would have been made under pressure.

## 2026-09-04 · f474bb9 — The director's stage cups the swelling a hand is on

The editor's stage routes a mouse through the same `touchDown` the phone uses, so every gesture on the hull already worked there — but it never filled `ViewState.hand`, and the one screen the control exists to be judged on was the one screen that said nothing about which swelling had answered. `bindStageTouch` now keeps that value and hands it back, the way `bindControls` hands the game its own, and `stage.ts` passes it into the draw.

## 2026-09-04 · badd2f2 — Wave 1's guide rehearses the wave, on two screens, in a loop

FIRST STEP's guide now carries a scene: two mini-screens above its words, the same small world drawn twice — once as player 1, once as player 2 — with a red slick falling on the radar that owns it, a ghost thumb walking the cannon into its column, crossing to the other screen and pressing RED, and the shot taking it. About a second and a half, looping. One specimen; the step sequencer, wave 2's scene, the TUTORIALS page and held poses are deliberately not here and are listed in docs/spec/briefings.md §3.2.

## 2026-09-04 · dc88319 — The CONTROLS page tells a player the ship itself is a control

Player-facing, and the one place either of them can find out: the muzzle swipe exists on no panel at all, so a list of buttons describes it nowhere. One entry beside THE FIELD and A HANDLE, which are on the page for that exact reason.

## 2026-09-04 · 003dcba — The ship answers a finger where it is drawn, not only on the strips

Both lobes are controls now. Player 1 takes hold of the cannon on the hull and slides it, and presses the shield plate to fire the guard where player 2 left it. Player 2 takes hold of the same plate and slides it, and — the one new gesture — takes hold of the muzzle, carries it left for red or right for cyan, and lets go. The press says nothing; the lift fires, and only past six tenths of a tile, so a hand that comes back to the middle fires nothing at all. Left and right are the order the two colours already stand in on their own band.

## 2026-09-04 · 1277745 — The menu's front page is the game, and the rig is one press behind TESTING

Four of the eleven rows a player read first were the test rig: PLAY with both seats on one device, the wave list, the demonstrations and the sliders. They are one entry now — TESTING — and named by what they do rather than by how the game is authored: SINGLE PLAYER, JUMP TO WAVE, JUMP TO ENEMY TYPE WAVE, TUNING. The front page is left with the game: come back, carry on, meet the other phone, learn what this is, set it up.

## 2026-09-04 · c76afce — biome stops having an opinion about the harness's launch.json

The desktop harness rewrites `.claude/launch.json` whenever it opens a worktree, and writes it with CRLF. `bun run lint` then refuses it — thirty-three lines of identical JSON differing only in `␍` — for a file nobody edited, in a tree `git status` calls clean, and it stops every landing in that worktree until somebody reads the `␍` in biome's own diff. On the night of 3 September 2026 it was the first thing a session hit.

## 2026-09-04 · fe7e977 — The music player's test reaches its private pump once, not four times

Four `lint/complexity/useLiteralKeys` warnings printed on every `bun run lint`, for `player["pump"]()`. Lint still exited 0, which is what made it worth fixing rather than urgent: every lint output in every session opened with four paragraphs of diff about something nobody was going to change, and warnings nobody will act on train people to read past warnings.

## 2026-09-04 · f4911aa — Two findings from the overnight drain, written down

Neither was worth stopping for and both cost time to work out, which is exactly what the queue is for.

## 2026-09-04 · 2707db5 — A settings page: sound, motion, buzz, your name and the way out

The one durable place for "things about me". Sound was reachable only by the `M` key, which is not a key a phone has, and the mixer already had a mute — the switch wires to that one and persists, so a player who turned it off last time meant it.

## 2026-09-04 · 603b973 — The room keeps what the pair got to, and gives up on a run nobody came back to

Two things, one shape. A seat silent past `SEAT_SILENT_MS` is evicted and its partner told, which handles one phone going away — and does nothing at all about *both* of them. The room was left holding a beat zero, no sockets and a run nobody was playing, and the next phone to arrive was handed that stamp and started from tick 0 against a game that ended half an hour ago. A room empty and quiet past a longer window has no run in it, so the arrival gets a fresh beat zero. The window is longer than the eviction one on purpose: this ends a *run*, and ending one because a lift went through a tunnel is worse than waiting. It is a `vars` override, so the test proves it without sitting still for thirty seconds — and the cost is said out loud in `runIsOver`, because that same window is how long a dead pair keeps a third phone out of their room.

## 2026-09-04 · 8b31dd0 — The room is named for the pair, so they never re-type a code

The four-character code stays the way in the **first** time. It is read aloud, and that is the game — the pair are already talking, and the code is the first sentence of the session. What this removes is the second meeting onwards: two people who have played together should not have to negotiate a code every evening.

## 2026-09-04 · 30549ae — Nicknames are unique, held by a registry, and recoverable with a code

A name is how the other phone knows who is in the other seat, so two people called DAVID in one room is the thing it must not be possible to be. Uniqueness needs somewhere to be unique *in*, and a room is the wrong place: rooms come and go, and the pair who play tomorrow are the same two people. So there is exactly one more Durable Object, holding every claimed name.

## 2026-09-04 · 74e1dfd — A nickname, asked once and carried into the room

The seat pills said HERE, which is only that somebody is there. Knowing *who* is there is the whole reason to ask, so the room screen asks the first time a device reaches it and never again — changing a name belongs on the settings page, where the rest of "things about me" will live.

## 2026-09-04 · 08ec941 — The room starts on a shared press, not a three-second timer

Beat zero was stamped the moment the second phone landed, three seconds ahead, on the ground that two people need a moment to look up from the code they were reading out and say "go". They do — but a timer cannot know whether they have, and a pair dropped onto a field mid-sentence has lost the wave before it started. This is what makes a testing session workable.

## 2026-09-04 · 6d1f5af — The two apps/game units worth testing: the run's life, and the loop's clock

Of 3 460 source lines in `apps/game`, the tests covered a URL parser, keyboard gating, the menu and the raster flag. `link.ts` and `loop.ts` were the two most valuable untested units, and both fail quietly rather than loudly.

## 2026-09-04 · 07c6cea — A wave carries a stable id, so a rename cannot break what points at it

`DEMONSTRATIONS` named its wave by string and the director can rename a wave from its own screen, so a save the owner made landed `main` red. It has already happened once: ON THE BEAT became THE THROB, HOLD IT OPEN became THE LID, and the four places naming those waves by string stayed where they were. The names were repaired at the time; the seam that produced them was not, and the next rename would have done it again.

## 2026-09-04 · 84e4841 — bun run frames can fire the cannon, so a hit effect can be photographed

`--hold` was the only way a capture pressed anything, and all four controls it accepts are *held* — none of them is a shot. So every effect that exists only because a bullet met a body (a shed layer, a shell piece, a clasp opening, a torn veil, a bare core) could not be photographed by the tool CLAUDE.md names for showing the owner something, and the lane that wanted one hand-rolled a throwaway playwright script to get it — the fifth such script `shot.ts`'s own header counts.

## 2026-09-04 · 15d13be — The phone buzzes for the two things a player must not miss

The game is played in a room where two people are talking over each other, which is the one room a sound cue is worst in. A buzz in the hand survives it.

## 2026-09-04 · c006fcd — HOW TO PLAY: the two seats, and the one rule that is the whole game

A page for the pair's first thirty seconds, before a wave's own briefing reaches them, built like the CONTROLS page beside it. It says four things and stops: there are two of you on two devices and neither screen shows what the other shows; PILOT slides the cannon, opens the maw and triggers the guard while NAVIGATOR slides the shield and fires; nothing you control travels, so there is no flying and nowhere to go; and therefore talking to each other is the control scheme.

## 2026-09-04 · 90eb768 — The menu remembers how far this device has got

The front door knew only PLAY versus RESUME, so a player who put the phone down at wave seven came back to a menu offering them wave one and a thirty-eight-row list to find their place in.

## 2026-09-04 · 12e1845 — The room's clock is a file of its own, and link.ts has room again

`link.ts` was at 250 lines, which is the limit `packages/sim/test/limits.test.ts` enforces, so the next sentence anybody added to it would have failed the check. Working the net items had already cost it two extractions and four trimmed comments to get back under, and that is not a thing to do twice.

## 2026-09-04 · b9ee2ff — relay:check compares the two worlds at a tick they both reached

`--rejoin` failed about one run in five with "the two worlds did not come back in step", A on tick 392 and B on 390, identical hashes. The verdict was `a.world.tick === b.world.tick && hashA === hashB`, read at the instant the run stopped — and delayed lockstep never promises the two devices are on the same tick at the same wall moment. It promises they simulate the same ticks with the same commands; a device may be up to `delayTicks` ahead of its peer's horizon. So the check was asking a question the protocol does not answer, and a flaky check is worse than none, because the next session reads a red one as its own doing.

## 2026-09-04 · b514665 — A build empties its output directory rather than deleting it

Both builds began with `rm(distDir, { recursive: true, force: true })`, and on Windows that fails with `EBUSY` whenever anything holds a handle on the directory node — an indexer, a file watcher, a browser that had the preview open. Everything *inside* deletes perfectly well in that state; only the directory itself is pinned. The build then stopped with an error naming a path nobody had touched, and `tools/frames/test/opening.test.ts` failed with "preview:once exited before printing its port", which points at the test rather than at the lock.

## 2026-09-04 · 6215b1b — The control-group union rule is enforced, so controlsForKinds is not dead

`CLAUDE.md`, `creatures-table.ts` and the new-creature skill all state that a wave shows the union of its creatures' control groups. Nothing checked it: `controlsForKinds` had no caller anywhere, `ControlGroup` was imported by nothing outside content, and the panel a wave shows is a named `ControlSet` on the wave rather than a union of anything.

## 2026-09-03 · f396515 — Four content invariants that nothing was checking

`Demonstration.wave` names a wave by string, `wavesUsingSet` returns names, and several tests resolve one with `WAVES.findIndex((w) => w.name === name)` — and nothing said the names were unique. A second "THE WALL", which the director can produce from its own rename screen, would point every one of those lookups at the first and be invisible to all of them.

## 2026-09-03 · e41ebe6 — LEAVE ROOM asks in place, on both doors a player presses while the game is fine

Both the room sheet's LEAVE ROOM and the menu's called `link.leave()` on a single tap, and that call drops the other player's game — one mis-tap ended a run for two people.

## 2026-09-03 · 5d2d657 — The view switch goes away on a player's device, like the rest of the test rig

P1 / P2 / TEST sat top-centre in every mode. It predates the menu's seat cards, which are how a seat is chosen now — and on a phone the room has already handed one out, so the switch was a second seat-picker floating over the field whose wrong answer is silent: `view.ts` decides what answers a touch from the mode, so a player who taps the seat their device was not given simply stops being able to play.

## 2026-09-03 · fa3c766 — PINBALL draws the panel it was handed, like its two siblings already do

`drawControls` called `slabPanel(l, controlSetForWave(view.world.wave), ...)`, re-deriving the panel from the wave *index* and ignoring the `view.controls` the host hands it. `gauge-round.ts` and `snake-panel.ts` both read the explicit set when one is given, and `band.ts` says in a comment why that fallback is the rule rather than the re-derivation.

## 2026-09-03 · b66efac — SNAKE's mouth rests as long as it stands open, so it cannot be tapped open

`snakeMawRestTicks` was 30 against a `snakeMawTicks` of 84, so a thumb pressing MAW every thirty ticks held the jaws apart for the whole round. The comment beside the rest claimed it "stops a thumb tapping it every tick from being the same as leaving it open", and at those two numbers it stopped tapping it every tick and nothing else. Widening the window from 60 to 84 for the look of the thing made the gap worse rather than making it.

## 2026-09-03 · c0116f4 — The tuning panel is called TUNING, and stops repeating the key list

Its heading read "NEON SPORE — TEST BUILD" and its footer was a paragraph of desk keys, both written when opening the game landed on the field and this panel was the whole of the chrome. TUNING is a menu entry now, reached by a player rather than only a tester, so the heading is the page's own name.

## 2026-09-03 · 5d12058 — The port rule says what claimPort does: the base first, the tree's own second

CLAUDE.md said "in a worktree the port is not 4173", and the director's paragraph said the same of 4174. `claimPort` has never worked that way: it tries the base port first, always, so a single server in a single tree answers where every document and `curl` line says it does, and the port derived from the tree's path is the fallback taken only when another checkout's copy of the same server is already holding the base. A director started in an otherwise idle worktree announces 4174, which the rule said could not happen — and a session that believed the rule probed the derived port, found nothing, and concluded twice that its own server had failed to start.

## 2026-09-03 · 916e509 — land asks git for content, not for git's opinion of a file's stat

`bun run land` refused a landing over `.claude/launch.json`, a file the lane had never touched: `git status --porcelain` reported it as ` M` while `git diff --name-only HEAD` reported nothing and `git hash-object` on the working copy gave the blob the index and HEAD both already held. Something had rewritten the file with identical bytes, which invalidates git's cached stat for that entry, and `status` reports such an entry as modified until git refreshes it — `git update-index --refresh` does not.

## 2026-09-03 · b30996b — SNAKE spits acid three tiles, crawls, and folds up when it crashes

Seven things the owner asked for by name, which is the first of the three exemptions in CLAUDE.md's "a look is offered, never replaced".

## 2026-09-03 · 26ce6e9 — Two findings from the four-item batch, written down

Both cost this session time and neither was in the file. A landing was refused for `.claude/launch.json`, whose only difference from `HEAD` was git's stat cache — `git diff` was empty and the blob matched — because `dirtyOf` reads `git status --porcelain` without a refresh, and the harness rewrites that file with identical bytes. And CLAUDE.md's flat "in a worktree the port is not 4173" is not what `claimPort` does: it tries the base port first by design, so a worktree's director with nothing else running announces 4174, and a session that believes the rule probes the derived port and thinks its server died.

## 2026-09-03 · fae5a13 — The director's stylesheet is seventeen files, cut where its comments already cut

Taking the `<style>` block out of `index.html` and letting Biome format it left one sheet of 2 985 lines — one declaration per line where the block had been written in compact one-liners, and twelve times the ~250-line ceiling every other file here keeps.

## 2026-09-03 · 312c4b2 — A card's frame is fitted with one contour per sample, not two

shapes-motion.test.ts was 2.9 s and none of it was the assertions. Most of it was not the sweep either: `transformedBounds` walks its 133 scan times twice, once to find the still box and once to move the points, and it built the contour again for the second pass. A contour sample is a metaball bisection and the most expensive thing in the file, so that was half the cost of every card the SHAPES sheet draws as well as half the test — 1743 ms of the test's fit becomes 1079 ms with the samples read twice instead of taken twice.

## 2026-09-03 · c577c2e — A detached worktree with commits on it is a lane, and lands

`bun run land` deletes the branch it just landed and leaves the worktree on `main`'s tip, detached. `auto-land.ts` then asked `git rev-parse --abbrev-ref HEAD`, read `HEAD`, and exited as "not on a lane's own branch" — so a session that kept working after its first landing committed into detachment and never landed again, with nothing said. That is the same nothing-happens failure the hooks were moved off bash to stop.

## 2026-09-03 · 9cca6c8 — The guard stands in front of PowerShell too, in PowerShell's own quoting

The PreToolUse matcher named `Bash`, and on Windows the session's primary shell is the separate PowerShell tool — the one CLAUDE.md names first. Every rule the guard holds was unenforced the moment the same command was typed into the other tool, silently, which is the failure mode the hooks were moved off bash to stop.

## 2026-09-03 · 73ce8b1 — The vote prompt is five files, and KNOWN_LONG is empty

`tools/versus/prompt.ts` was 509 lines — the longest file in the repository, twice the limit, and the only entry left in `KNOWN_LONG`. Most of it was one 315-line function whose only structure was a row of banner comments, so the step you wanted was found by scrolling and the context it read was whatever happened to be in scope.

## 2026-09-03 · 1d1204c — The SHAPES page's state is a leaf, and a test says it stays one

`shapes-pair.ts` held the page's state and re-exported `controlBar` from `shapes-controls.ts`; the control bar built the axis rows, and the axis rows imported the state back out of `shapes-pair.ts`. Two runtime cycles — `shapes-axes.ts` and `shapes-effect-axes.ts` each close one — and they worked only because everything in them is called after module evaluation. The first value read at module scope would have found an uninitialised binding.

## 2026-09-03 · f83a38a — A queen draft says only the thing it argues about

The three whole-body BULB QUEEN drafts carried twenty-five byte-identical lines each — the marks, the shell's ellipse and its three-stop gradient, the `PALETTE.rock` stroke, the two sockets and the petal row — and differed in one modifier apiece: cracks, an ember, a squeeze. An axis whose values agree only by coincidence is an axis that stops being one the first time a gradient stop is edited in one file.

## 2026-09-03 · 2c3b5cd — The director's stylesheet is a file Biome can see

`tools/director/index.html` carried 1 104 lines of CSS in a `<style>` block, and `biome.json` included `**/*.ts` alone — so the director's whole look was neither formatted nor linted, and neither were `game.css`, `menu.css` and `sw.js`. `format-edited.ts` handed all of them to Biome and had them skipped in silence, which is the hook's own comment admitting the gap.

## 2026-09-03 · 1a1e2f1 — Queue the trap this session fell into: a landed worktree cannot land again

`bun run land` deletes the branch it landed and leaves the worktree detached. `auto-land.ts` reads `HEAD` as the branch name and exits silently as "not on a lane's own branch", so a session that keeps working after its first landing commits into detachment and never lands again. No error — the same nothing-happens failure the hooks were moved off bash to stop.

## 2026-09-03 · 627784a — Five feature items stop being decisions and become tasks

Items 22 to 32 were written as user-visible features with the design questions left open, which is the one thing that stops a queue item draining: a cold session cannot answer them and the owner is not in the room. He answered five on 3 September 2026, and each entry now carries the answer where the question was.

## 2026-09-03 · cde2f73 — Section 3's grain table is held to grain.ts, the way section 4's already was

`catalogue.test.ts` holds section 4's family table against `CATALOGUE` row by row, because a table nobody checks is a document that stops being true. Section 3's grain table had no such check and had already gone stale once: `noise` was added to `grain.ts` and the table stayed nine rows long with every test green.

## 2026-09-03 · a510725 — A biome-ignore that suppresses nothing now fails the lint

`noUnusedImports` and `noTemplateCurlyInString` are errors, so a dead import or an accidental `${}` in a plain string fails `bun run lint`. One category was still only advisory: `suppressions/unused`, which Biome reports when a `biome-ignore` comment no longer suppresses anything. It is not a rule under `linter.rules` and cannot be raised there, so `apps/game/test/sw.test.ts` carried a dead `lint/security/noGlobalEval` suppression long enough that nobody noticed — a comment claiming a danger the file no longer had.

## 2026-09-03 · 692c817 — The last four hooks come off bash, and settings.json is finally read by a test

`tools/hooks/guard.ts` moved the two `PreToolUse` guards off bash in August and left the other four. `settings.json` still invoked each as `bash .claude/hooks/x.sh`, so in a PowerShell session — the primary shell on this machine — there was no formatting after an edit, no determinism run after a sim edit, no typecheck on stop and no automatic landing. Nothing errored. That is the point: the failure was that nothing happened.

## 2026-09-03 · b88474e — A claim is written on main too, where a session in its own clone can see it

The claim was a branch and nothing else, on the argument that a mark has to be committed to be seen and the session that took the item has not committed anything yet. That argument was about a mark on the *lane's* branch. Committed straight to `main`, a mark is visible the moment it is made — and on 3 September 2026 two sessions did the same six items in parallel because a local ref is nothing to a checkout that only ever sees `origin`.

## 2026-09-03 · cc8d7fd — The queue loses two more: stage.test.ts and the three loops

Both landed with the work above — `stage.test.ts` split into its two real subjects with its globals restored, and `runStageLoop` called by the two files that used to re-type it.

## 2026-09-03 · 2c838f9 — The director has one fixed-timestep loop, and a test that keeps it at one

`stage-loop.ts` was split out so the loop existed once. It did not: `raster-field.ts` carried a copy under a comment saying it was "the same fixed-timestep loop `stage.ts` runs", and `versus-pair.ts` a third with the rate and the freeze folded in. All three worked, which is the problem — the failure is a catch-up cap raised in one of them and left alone in the other two, and it shows up as one screen bursting after an away tab.

## 2026-09-03 · c397dc9 — stage.test.ts is two files, and takes its globals back down

The file was three unrelated describes under one name: `stage-afterrun.ts`, then a block that imported nothing from the director at all, then `stage-touch.ts`. It also installed a fake `document` at module scope and a fake `window` inside a helper, and removed neither — `bun test` runs every file in one process, so every file loaded after it inherited both.

## 2026-09-03 · f46400c — The queue loses the five items this lane finished, and gains one it found

## 2026-09-03 · 9c7ef66 — The director reads the wave list once per edit, not once per request

`readWaves` imported the waves barrel with a `?t=${Date.now()}` cache-buster, and Bun keeps one ES module record per distinct URL for the life of the process. A director stays up as long as a tab beats every 25 s, so that was a leaked module per `GET /api/waves` — and wrong the other way too: two GETs in the same millisecond shared a URL and therefore a module, so one of them could answer with a list from before a save. `writeWaves` did the same once per act on every save, to learn each act's current length.

## 2026-09-03 · b5705be — shape-fit.ts, the director's largest untested pure module, has a test

Of the director modules no test imported, most are DOM-bound; `shape-fit.ts` is 216 lines that touch no document, and it decides how big a frame every card on the SHAPES page gets. Its neighbour `long-axis.test.ts` covers `shapes-motion.ts`, which answers a different question.

## 2026-09-03 · d110985 — The director's whole-document routes are one table, served and baked from

`server.ts` wrote out `/api/borrowed`, `/api/tower-defence` and `/api/claude-vs-chatgpt` by hand and `build.ts` baked the same three by hand, and the two lists had nothing holding them level. They had already drifted in the readable part: the comment above the borrowed route described `/api/spec`, whose own route two blocks down had none.

## 2026-09-03 · 99972aa — The motion test parses a transform once per pose, not once per point

`shapes-motion.test.ts` took 5.9 s of the director suite and made 11 473 102 `expect()` calls, four per contour point per time sample per catalogue entry. The assertions are gone — one `expect(outside).toEqual([])` per entry now, naming the point and the moment it escaped — and that turns out to have been the smaller half: it bought 0.7 s.

## 2026-09-03 · 3d54385 — Park the half of the hook migration that did not move

`tools/hooks/guard.ts` took the two PreToolUse guards off bash. The other four hooks are still invoked as `bash .claude/hooks/x.sh`, so a session whose shell has no bash silently gets no formatting after an edit, no typecheck on stop and no automatic landing — the failure is that nothing happens, which is the same gap the guards were moved to close and the hardest kind to notice.

## 2026-09-03 · 4e4cc64 — The queue says whether anything is being worked on, in one word

`bun run queue status` prints DONE when nothing is left at all, IDLE when items are waiting and nobody is on one, and BUSY when somebody is, naming the items and the branches holding them. It exists to be asked of a machine that is about to be turned off, where "is the queue finished" has to be answerable without reading the file and judging by eye — an item can be in the file and already claimed, and an empty-looking file is not the same as nothing in flight.

## 2026-09-03 · 80e59ed — The grain table names the grain that was added, and four manifests end in a newline

`noise` went into `grain.ts` and section 3 of `docs/spec/audio.md` stayed nine rows long. Nothing failed, because that table — unlike the family table one section below it — is held against nothing. The row is back, and the check that would have caught it is queued.

## 2026-09-03 · b491814 — A queue claim survives every landing but its own

`bun run queue next` claims an item by creating `claude/queue-<slug>` off main and nothing else, so the branch carries no commits, points at main's tip, and `git branch --merged` offers it to the sweep at the end of any other lane's landing. Both sessions running on 3 September 2026 lost every claim they held within minutes of the other one landing, then did the same item twice.

## 2026-09-03 · adc7516 — The context map covers the tools, and notices a row that stopped being true

`bun run index` walked `packages` and `apps` only, so 252 files had no row and the test that fails on a missing one could not see them: all of `tools/dev`, `tools/land`, the director's own scripts, `apps/game/build.ts`. Scope now follows where source actually lives — under `src/` in a package or an app, beside its directory in a tool — and `bun run index --check` writes nothing and exits non-zero on drift.

## 2026-09-03 · bee44c4 — The command guards read arguments, in a language that has them

The two PreToolUse guards were bash scripts matching globs against the whole command line, and a glob does not know an argument from a mention of one: the rule written against `--am` refused `git commit --amend`, so a plain reword became a soft reset and a fresh commit with no guard at all on what got staged, and a commit message that quoted a refused form was refused for quoting it. Both now live in `tools/hooks/guard.ts`, which splits the line into commands and each command into its arguments — quotes, escapes and heredoc bodies are text — and asks its questions of those. `bun test` no longer needs `bash` on PATH, which is what made twelve hook tests red in PowerShell.

## 2026-09-03 · 0bb6dd5 — Queue the claim that does not hold: land sweeps other lanes' branches

`bun run queue next` claims an item by creating a branch off main, and docs/queue.md says that branch is the claim. A claim branch has no commits on it, so it reads as merged and the sweep at the end of any other lane's `bun run land` deletes it. Both sessions running today lost every claim within minutes of the other landing, then did the same item twice — and one of the two commits was thrown away at the rebase.

## 2026-09-03 · 9601bcb — The BOUND paragraph stops counting the sounds it cannot draw

`docs/spec/audio.md` said five bound sounds have no subject to draw. `sound-link.ts` holds fifteen, and has for some time — a lure, a veil, a salvo into open water and a holed hull all arrived with a written reason and nothing counted them. The number carried no argument the sentence did not already make, so it goes rather than being pinned: what matters is that the exception is written down each time, which the director's own test already holds.

## 2026-09-03 · fb67448 — The stateful half of audio is tested, and the bosses move next door

No test named `Mixer` or `MusicPlayer`, which left the one dangerous thing in the package unwatched: the mixer remembers a frame of world and sounds the difference, and `world.tick` is not monotonic, so a restart it failed to notice would be heard as the middle of the last run. `mixer.test.ts` builds worlds with `createWorld`, replaces `engine.play` with a recorder and holds the edges — the guard and maw windows, the alarm on every fourth beat, the mend, the seat gate, the duplicate cap, and a tick going backwards. `player.test.ts` gives `MusicPlayer` a fake engine with a settable clock and holds the loop arithmetic. `bind.test.ts` proved only that each creature event named *a* sound that exists, so two swapped ids passed; it now names the id each one plays.

## 2026-09-03 · 302f6b3 — Filtered noise is a grain, not a literal written twenty-nine times

`grain.ts` says a sound is a stack of grains, and then twenty-nine of the sound definitions hand-built the same six-line `{ source: "noise", ... }` object because the two named noise grains, `tick` and `air`, carry their own envelopes and these needed their own. `noise(colour, filter, attack, release, gain, wobble?)` is that layer, and calling it takes `impact.ts` from 235 lines to 212 and `motion.ts` from 220 to 216.

## 2026-09-03 · 3f37316 — A sound plays whole or not at all, and its modulators are held

The live-voice cap was read inside the engine's per-voice loop, so a multi-layer sound arriving at the ceiling played its first layers and dropped the rest — a click with no body, which is heard as a fault where the silence it was rationing towards would have been heard as room. The decision moves to `admits(liveCount, plan)` in `plan.ts`, ahead of the loop, where `bun test` can reach it: the engine has an `AudioContext` in it and cannot run headless, so every decision it makes that could be wrong belongs next door.

## 2026-09-03 · 1d91a3f — Queue the bash guard's refusal of a commit reword

The guard matches `git commit --am` to catch `--am` as short for `--all`, and `--amend` begins with those characters — so rewording the commit you have just written is refused with a message about staging another lane's work. It also matches its own text, so a message that quotes the refused form cannot be committed either. Found by hitting both; the entry says to anchor the abbreviations, match argv rather than the whole command line, and add the test the guard has never had.

## 2026-09-03 · 0fcfdfc — Six package scripts nothing could run, and the one import that broke installs

`packages/sim` and `packages/net` each declared `"build": "tsc -b"` with no `tsconfig.json` to build, so the script errored the moment it was called; the `queue`, `index`, `orphans` and `scope` scripts inside their tool packages duplicated root scripts that already call the same files by path. All six are gone. `tools/icons` reached `../frames/capture.js` relatively while declaring no dependency on it, and under Bun's isolated linker that is what left `playwright-core` unresolved for `icons` in the main tree — it imports `@neon-spore/frames/capture.js` now and declares the workspace dependency, re-locked in this commit.

## 2026-09-03 · e38e31d — A dead import is now an error, and the twenty-four already there are gone

`biome check .` reported twenty-seven warnings and exited 0, so `bun run lint`, the stop hook and `bun run land` all walked past them. `noUnusedImports` and `noTemplateCurlyInString` are `"error"` now, and `bun run lint` is clean: twenty-four dead imports removed across `sim`, `render` and the director, and the three `"${ctx.uid}"` the director's tests look for in source text are suppressed by name, because there the placeholder is the thing being asserted.

## 2026-09-03 · 4282524 — The preview server is inside the type check, and had two errors in it

The root tsconfig named `apps/game/build.ts` and `apps/server/dev.ts` by hand and missed `apps/game/preview.ts` — the one server every agent verifies against was the one root-level script tsc never looked at. `apps/*/*.ts` replaces both entries and catches all three. It found a real fault: `fetch` reads `server.port` from inside the object that defines `server`, so each waited on the other and both came out `any`. Spelling out the handler's return type breaks the cycle.

## 2026-09-03 · ad20e53 — Queue the INDEX drift nothing catches

Five rows in `docs/INDEX.md` were fixed by hand this week and `bun run index` was green over every one of them, because the generator only derives a row's text for a path that has no row yet.

## 2026-09-03 · 0eb38a2 — The audio spec is checked against the catalogue, not typed out beside it

Every number in `docs/spec/audio.md` had drifted: 190 sounds where there are 201, 137 spare where there are 125, a family table wrong in six rows of thirteen, a status paragraph naming two of the three files the test reads, and six music candidates where there are nine — `deep.ts` added TIDE, CAVERN and SILT and nothing said so. `types.ts` still said about 130 sounds and INDEX still called `themes.ts` six pieces.

## 2026-09-03 · fb8dd16 — Three documents that had stopped describing the code

`apps/server`'s own `deploy` script called the root `deploy`, which builds the director and pushes `wrangler.director.jsonc` — so the relay package's deploy never once deployed the relay. It points at `deploy:game` now, and the README says which upload is which and that `dev` prints the port its tree was given rather than fixing it at 8787.

## 2026-09-03 · 9d9c4ab — The room screen reads the seat count, instead of guessing it from the state

The room already knew how many were in it — `welcome` and `peers` carry the number and `link.ts` held it in a local `peers` — but the number stopped there, so `join-words.ts` re-derived "is the other seat filled" by listing the LinkStates a full room passes through (syncing, countdown, live, stalled). That is the room's own count copied out by hand, and CLAUDE.md names that as the thing that drifts: a state added to LinkState is one the list forgets, and the seat pill then reads WAITING at a room that has two people in it.

## 2026-09-03 · 1169d67 — Queue three nav follow-ups; spec the seat swap the owner asked to design

Off the second round of end-of-turn questions. Three go to the queue: the view switch is a second seat-picker floating over a player's field where a wrong tap sends their touches nowhere; LEAVE ROOM hangs up on the other player with no confirm; and the tuning panel still reads "TEST BUILD" with a desk-keys footer, from before the menu was the front door. Each drains with one `bun run check`.

## 2026-09-03 · 18a307c — Player 2 is the NAVIGATOR on the seat card, not a GUNNER

The seat cards and the room screen's second pill were labelled GUNNER — a synonym I coined for a role the rest of the game and the whole spec call the NAVIGATOR (`docs/spec/roles.md`, the director's states and poses). CLAUDE.md fixes the design vocabulary and forbids inventing a second word for a thing that has one, and a player reading NAVIGATOR in a briefing and GUNNER on the card they picked is the exact confusion the rule prevents.

## 2026-09-03 · ba89a9d — Queue the eight features the owner chose off the end-of-phase questions

The navigation work threw off a batch of user-visible features too big to fold into it — a shared start, nicknames, lasting rooms, stored stats, and three menu pages. Per the rule that same lane added to CLAUDE.md, they went to the owner at the end of the turn rather than onto the queue by a session's guess. He answered item by item; these eight are the ones he sent here.

## 2026-09-03 · 3b4d4e6 — The address opens the menu, and the menu is where the game is joined and left

A plain address landed on the field: no seat, no room, no way to reach either, and a chip in the corner reading SOLO — a button that reports the absence of the thing it opens. The menu is the front door now and `?play` is the way past it, which is what `tools/frames` drives so a captured frame is still the game. The seat is three cards with the job written on each rather than P1/P2/TEST; the room screen is a sheet with two seat pills that say who is actually in it; LEAVE ROOM hangs up and comes back to the menu; and a line that has gone bad puts up a card with a clock on it and the only two answers there are — keep waiting, or leave and pick this up later.

## 2026-09-03 · 388e1ee — The eye sits in a bigger pool, and it is neon green

Asked for by name, which is the exemption this lands under.

## 2026-09-03 · fa9f133 — A handle stays under the hand, and the body falls away from it

The handle was drawn at its cord's rest *today* plus the pull, so it walked down the screen a tile a beat as a lid fell and sideways as THE WARDEN's pupil drifted — out from under a thumb that had not moved. The anchor is frozen at the grab now, so the handle is anchor plus pull, which is exactly where the finger is, and the cord simply gets longer and re-angles as the body drops away.

## 2026-09-03 · 7334bd9 — THE RIND is crushed to its size and its skin is thrown off

A layer coming off a rind was a step and ten particles: the body was one size on one frame and a smaller one on the next. It is a sentence now. The silhouette it was wearing collapses onto the body it has become — the shrinking, the shrink cannon the owner asked for — while the same outline, left where it was, is thrown outward into the space around it, breaking into plates and going out in a bloom of the body's own colour. Both start on the same frame from the same contour and go opposite ways; the split is the picture.

## 2026-09-03 · 7e7eeca — The mouth is empty and the tongue flicks out of it

The owner's note was that the open mouth looked strange. The red was why: a throat and a glottis taken from the reference, which at thirty pixels was the loudest thing on the screen and read as something held in the mouth rather than as the inside of one. An open mouth is a hole, so it is drawn as one — darker than the arena floor and no colour of its own — and what says the mouth is open is the tongue coming out of it.

## 2026-09-03 · 7bbd71e — Queue the seam behind the renamed waves, which is still open

`main` repaired the four names that pointed at ON THE BEAT and HOLD IT OPEN, and left the reason they went stale: a demonstration holds its wave by a string, and the director can rewrite that string from its own screen. The next rename lands red the same way.

## 2026-09-03 · e2a8a41 — SNAKE gets the light, the shadow and the skin off the reference

The owner sent a drawing of a python and asked why the round could not look like it. Most of that drawing cannot survive here — the head is about thirty pixels long on a phone against a hundred and twenty in the reference, so its palate ridges, heat pits and twenty-unit diamond skin arrive as grey mud. What survives is what works on a shape rather than on a detail, and that is what is here: one light down the whole arena, a shadow on the floor under the body, a lit side along the back, and scales coarse enough to be a third of a tile.

## 2026-09-03 · 0a39b91 — A round that ends keeps its own picture until the next wave

THE GAUGE, SNAKE and PINBALL took themselves off the world the moment their verdict had stood, and the field came straight back — hull, grid and ship — for the three beats of rest before the next wave. On a wave that restarts into itself, which is what the director does all afternoon, that reads as PINBALL dropping out to the wrong picture and back: 300 ticks of a ship on a wave whose whole point is that there is no ship.

## 2026-09-03 · 01a93ee — PINBALL is alive, and a shot is two presses instead of three

The table's pieces were circles with a highlight on them, correct and the only screen in this game where nothing breathed. A peg is a cell now, drawn through the same `blobPath` every creature on the field is, lit from inside and haloed from outside; a block is a slab of the same tissue. The bucket was a flat trapezoid, which is a hopper and not a ship — it takes the hull's own skin now, the four-stop body ramp and the rim glow and the key light, in a bowl with two horns and no cannon, and the ball waits in its mouth between shots.

## 2026-09-03 · c3b22f6 — A room checks before it seats, and gives a lost seat back

The eight queued items on the two-device layer, worked together because the last three are one change: the version check, the seat eviction and the Durable Object's first test all live in the same twenty lines of `room.ts`. The relay is the part of this game no test had ever run, and it now has one.

## 2026-09-03 · 43b726c — A handle is carried any way at all, and never off the field

Two things the owner asked for, and they turn out to be one rule.

## 2026-09-03 · 8701a55 — THE WARDEN is open below its eye, so the shot has a way in

The body was a closed ring: a band of its own rock stood between the cannon and the one thing on it worth hitting. The rule said the shot lands and the picture said it could not, and of the two a player believes the picture.

## 2026-09-03 · 767dfcc — The wheel turns instead of teleporting, and it has a middle now

THE GYRE's six bodies never glided at all. `onBeat` writes `fromRow` and `fromCol` for every creature and only *then* skips a mount, so the two fields `carryMounts` had just filled in were overwritten with where the body now stands — from and to identical, six bodies jumping from tile to tile once a beat with nothing drawn in between. That is the whole of what "jumping pictures" was, and the guard now comes before the assignments.

## 2026-09-03 · 975815c — The names that point at waves follow the waves that were renamed

Two waves were renamed in the director and saved — ON THE BEAT became THE THROB, HOLD IT OPEN became THE LID — and four places that name a wave by string stayed where they were, so `bun run check` has been red on main since. `demonstrationWave` throws by design when a registry entry names a wave that no longer exists, which is exactly what it did.

## 2026-09-03 · a722d57 — bun run frames can photograph a thumb that is down

captureFrames drove jumpToWave, dismissBriefing, advance and paint — every verb a wave needs and none a held control needs. So the one picture of THE LID that says what the creature is, the plates parted with a hand on the cord, could not be taken with the shipped tool; the same gap covered THE WARDEN's hatch, THE MAZE's wheel mid-turn and THE LANCE's full lobe.

## 2026-09-03 · 47e3ee0 — A handle is drawn once, not three times

THE WARDEN's rope and THE LID's cord drew the same four things with the same numbers in two files — a ring that breathes and fills, a gauge arc closing round it, a faint rest mark, a rope on a half-sine sag — because lid-string.ts was written by reading tether.ts and changing the anchor. A fix to one handle's read was a fix to one of them. handle-draw.ts now holds the ring, the gauge, the rest mark, the sag and the PULL/PILOT'S word, and each file passes its own anchor and colour.

## 2026-09-03 · 07e11f2 — CI runs the check the repository defines, on a Bun it names

The workflow spelled out typecheck, lint and bun test as three steps, which is a second definition of `check` free to drift from the first. It now runs `bun run check`. bun-version was `latest`, so a Bun release could turn main red with no commit behind it — it is pinned to 1.4.0, the version in use locally. The install cache is keyed on bun.lock, and the pull_request trigger is gone: this repository takes none.

## 2026-09-03 · c95dd39 — A picture taken on a Mac finds a browser

tools/frames/chrome.ts listed four Windows paths and six Linux ones and no macOS path, and every command that takes a picture — frames, png, icons, raster, raster:verify, shot — comes through findChrome. On the Mac the owner alternates with, all six threw unless FRAMES_CHROME was set by hand. Chrome, Chromium and Edge under /Applications are on the list now, with one test row per machine so a platform going missing again fails here rather than on the machine that has none of them.

## 2026-09-03 · 3f5f1e6 — Four subjects out of one file, and a test that runs git for real

tools/land/worktree.ts held the retry policy, verified removal, the idle window and orphan directories in 315 lines, with a private git() that was gitOrDie with its arguments swapped. It is now retry.ts, worktree.ts, idle.ts and orphans.ts, every git call goes through git.ts, and orphanPaths compares paths through treeKey — on Windows git prints the case it was given and readdir prints the case on disk, so one directory reads as an orphan the sweep would then try to delete out from under a live worktree.

## 2026-09-03 · feba8a8 — One eye for THE LID and THE WARDEN, and three times the pull to open either

The owner asked for four things by name, which is the exemption this lands under rather than being offered beside the shipped look.

## 2026-09-03 · 317d230 — Weigh player 2's frame too, so the fire buttons' cached paths stay cached

The commit before this one said the budget measures both seats; it did not, because `frame-budget.test.ts` was rewritten on `main` between the measurement and the landing and this lane took `main`'s file whole rather than fighting it.

## 2026-09-03 · 6791941 — Give the boss surface its own file, so the sim barrel fits again

`index.ts` came back from the rebase at 255 lines: the ninety-two names that replaced `export * from "./bosses.js"` landed beside seven new exports main grew in the meantime — `midCol`, `msToTicks`, `guardArmed`, `mawOpen`, `ticksSinceGuard`, `podKindOf`, `removeCreature`.

## 2026-09-03 · 77bb830 — Point the queue's own file lists at the files this lane left behind

Four entries named `packages/sim/test/purity.test.ts` for the `COPIES` table, which now lives in `copies-table.ts`; a fifth said so in prose. A queue entry is read cold by a session that has read nothing else, so a path that no longer exists is the one kind of staleness that costs it a turn.

## 2026-09-03 · 8ec1983 — Stop rebuilding four constant things every frame

Four constant-input rebuilds, measured through the canvas stub over 30 frames of three scenarios — a busy wave on each seat and a pair of torches breaking the hull.

## 2026-09-03 · b035c34 — Fold the sin-hash and smoothstep copies into src/hash.ts and src/ease.ts

`Math.sin(n * 12.9898) * 43758.5453` was private to seven files in render/ and an eighth in the shape sheet, each under its own paragraph re-arguing why it is not `Rng` and not `Math.random`. `t * t * (3 - 2 * t)` was private to five files in render/ and six sites in the shape sheet, three of them clamping first and the rest trusting the caller. `sheen.ts` carried a third copy of `mixHex`, which `hex.ts` already said in a comment.

## 2026-09-03 · d4ccd66 — Split purity.test.ts and maze.test.ts, and stop sim's tests reading content

`purity.test.ts` was two guards in one 477-line file. The determinism bans stay there, the re-derived-rule table becomes `copies.test.ts` over `copies-table.ts` — the table grows by a row per finding and the check over it does not — and `stripNonCode` and `ROOT` move to `source-scan.ts`, so the two guards cannot drift into disagreeing about what counts as code.

## 2026-09-03 · 0fc8544 — Drop the export keyword from thirty-two file-local symbols; delete flare.ts

`drawFlare` was imported by nothing and its own header said it existed to be copied from; git keeps the copy source, so the file goes and the four prose mentions now describe TORCH as a spare contour instead of the flare's clone source. `draftedNames` and `MIRROR_DEFAULT` were referenced nowhere but their own definition and go with it.

## 2026-09-03 · 87fb4a0 — Trim the barrel exports nobody outside the package imports

Forty-nine names left the four package barrels: twenty-six from sim, eight from content, eight from audio, seven from net. Each was re-grepped across `apps/`, `packages/` and `tools/` for an importer, and the set of names any file actually pulls out of a barrel was collected mechanically rather than by eye. Three tests were reading a name through the barrel and now import it from the module that defines it — `POD_CATEGORY` from `creatures.ts`, `sampleOffset`/`sampleRtt` from `clock.ts`, `ROOM_ALPHABET` from `room-code.ts`. Module-level exports are untouched; only the barrels shrank.

## 2026-09-03 · 4db182c — Correct four statements in docs/shipped-looks.md and the canvas stub header

The doc still named `creatures.ts` / `drawCreature` for the slick-and-bulb pass and the `blocked > 0` branch; both moved to `living-draw.ts` / `drawLiving`. It described a bulb as one core dot plus two filament curves, where `creature-detail.ts` draws the dot and returns. It gave the trail halos as 0.85r and 0.73r, where the code computes `r * (0.85 - k * 0.12)` for k = 1 and 2 — 0.73r and 0.61r. The canvas stub's header called render the one package with no tests; it has 33 test files.

## 2026-09-03 · 9649f6f — The last five draw loops in render/ read the harness like the rest

Five frame tests still typed their own step-collect-draw-clear loop, and the copies had already drifted: one drew every second tick, one every tick, one never derived a beat phase at all. Each is now a `runFrames` call, and the loop the harness holds is the only one left in the package.

## 2026-09-03 · c22438d — A finding goes in the queue file, and nowhere else

A technical finding was written to `docs/queue.md` and then also offered as a suggested background task, which arrives as a chip the owner has to dismiss. The chip carries nothing the file does not: `bun run queue` already lists what is waiting and hands the next item out with its own branch. The rule now ends at the file.

## 2026-09-03 · f5adb66 — Thirteen copies of one draw loop become one, and six rounds get drawn

`frame.test.ts` was 1269 lines and eleven re-typings of the same twenty — step, collect `world.events`, draw every fourth tick, clear them — with the copies already disagreeing about which tick a frame falls on. The loop is now `test/frame-harness.ts` (`runFrames`), the only difference between subjects is what happens during a tick, and every subject with a picture of its own has a `*-frame.test.ts` of its own. The ghost's and the clasp's own files were two more copies and read the harness now too. Same 46 tests, same assertions.

## 2026-09-03 · c2f56b2 — An armoured eye one of you holds open while the other shoots the lens

THE LID: a body with two plates across it and a cord hanging off the bottom. Player 1 takes the cord and pulls it aside; the plates part from the middle outwards in proportion to the tension, and only while they stand fully apart does a shot of the lens's own colour land. Let go and they shut. It is THE CLASP's coupling made continuous — a clasp is opened by a moment and can be shot whenever, a lid is opened by a hold — so the pull and the shot are one instant in two hands, and the seat holding the cord has its thumb off the cannon strip for the whole of it. Nothing is hidden from either screen: what the pair has to agree on is when, not what.

## 2026-09-03 · bd94065 — The desk rig asks midCol where the ship stands, and the guard can see it

`keys.ts` parked the cannon and the shield at `Math.floor(cols / 2)` on the first keypress — the tenth copy of the middle column, and the one the `COPIES` row walked past, because its pattern demanded `cfg.` before the division and the desk rig took its count from `layout().cols`. `bindControls` already holds the config for the hit test, so it is one field to hand on: `keys.ts` calls `midCol(cfg)` now, and `layout().cols` stays what it is for — clamping a slide to the screen that is actually there.

## 2026-09-03 · 0490f52 — Queue the tenth copy of the centre column, in apps/game

`midCol` now owns `Math.floor(cfg.cols / 2)` and a purity row fails the next copy, but `keys.ts` parks the cannon at `Math.floor(cols / 2)` off a render layout with no config in reach, so the row walks past it.

## 2026-09-03 · 60bba2b — An unnamed pod is a mend, and sim is the only place that says so

`?? "mend"` stood in `sim/pods.ts`, again in `content/mechanics.ts` and a third time in the director's brushes. If the default ever changed, `mechanicsInWave` would have named a mechanic the field never produces and the guide test in `waves.test.ts` would have gone green about the wrong wave.

## 2026-09-03 · 964d201 — The middle column has a name, and the config's derived rules have a file

`Math.floor(cfg.cols / 2)` stood in ten places — the cannon's home and the shield's, where THE FLEET breaches, where THE GAUGE, SNAKE and PINBALL cost the hull, the gyre's rest column, the vane's pivot, the snake's morph. Two of them already had names. `midCol(cfg)` is the rule now, and a `COPIES` row fails the eleventh copy; an even `cols` is what those copies were waiting for, since some would have moved left and some right.

## 2026-09-03 · 3642cbb — Taking a body off the field is one function, not fourteen copies

`world.creatures = world.creatures.filter((c) => c.id !== id)` was written out eleven times and its set-shaped sibling three more — in every file that kills something, which is every creature file there is. Each new creature copied whichever of the two its neighbour had, and `bullet-hit.ts` sat at exactly its line limit with five of them in it.

## 2026-09-03 · d08c831 — One function turns milliseconds into ticks, and it divides last

`Math.round((xMs / 1000) * cfg.tickHz)` was written out across sim, render and audio, and the purity table guarded exactly one spelling of it, so the others walked past. `msToTicks(cfg, ms)` now sits beside `ticksPerBeat`, and the guard's window, the maw's, the ready hold, the veil's armour, the gyre's suck and the button's afterglow all call it.

## 2026-09-03 · 296fddd — The sim owns both of player 1's windows, and everything else asks it

"Is the shield armed" was written out four times and "is the maw open" three, each with its own arithmetic: render and audio used `<` where the sim uses `<=`, and none of the copies carried the ward term. So the button glow and the sound said "closed" one tick before `resolveHull` stopped turning rocks away, and a ward pod armed the shield in the sim while render drew it cold.

## 2026-09-03 · e7ebb42 — Testing alone is quiet: no socket, and no service worker on a local address

A cache that answers when the server has idled out serves a build that no longer exists, and the stale page reads as a bug in the code that just replaced it. That is not a hypothesis — it happened while the service worker was being written, on the preview, and cost a confused half hour chasing a fault that had already been fixed. So no local address installs one: not the director's `/game`, not the preview on 4173, not `dev:game` on 3000. Ones already there are taken off rather than merely not renewed, along with their caches, because a worker outlives the change that stopped registering it. `?pwa=1` turns one on locally for the only case that wants it, which is testing the install itself.

## 2026-09-03 · 91997f6 — Fifty technical findings from a review of every package, filed in the queue

A read-only review of sim, render, content, audio, net, the server, the game app, the director and the repo tooling, one lane per area. Nothing in the code moved; the findings went to docs/queue.md as entries a fresh session can drain alone and prove with bun run check. The ones that matter most: render and audio re-derive the guard window and disagree with the sim by one tick; a failed reconnect is counted twice, so six tries are three; a peer can fill the other phone's lockstep map without bound; the service worker caches an error page as the offline shell; the Durable Object has no test; the director's shapes-motion test spends six seconds on eleven million expects; and nineteen dead imports sit behind Biome warnings that nothing turns red on.

## 2026-09-03 · 469d9ef — The queue hands an item out, and the branch it makes is the claim

Two sessions opened on the same queue asked it the same question and got the same answer, because `next` printed item one and changed nothing. The second session found out it was duplicating work by rebasing onto it.

## 2026-09-03 · 9f0e733 — The rule about filing a finding is said once, where the queue already says it

Two sessions wrote the same rule at the same time and both landed. `docs/queue.md` and `bun run queue` arrived on main while a lane was adding a paragraph saying a finding is filed as a background task and kept out of the repository; the rebase replayed one under the other, so the file gave two answers and they disagreed on the central point — whether a finding is written down at all.

## 2026-09-03 · 2c51ff2 — A technical defect found in passing is filed as a task, not said once and lost

Dead code, a stale document, a measured slowdown, a confirmed TODO, a missing test over something that broke once: these were said in the closing block and then gone, because the rule against `docs/parked.md` correctly refuses a list the owner has to drain by hand. A background task is drained by clicking it, so it is not that list — nothing accumulates in the repository and nothing is owed.

## 2026-09-03 · 0874596 — Two phones hold a room over a real network, and the game goes on a home screen

The lay between a touch and the tick it lands on is measured now rather than configured. A tenth of a second is right for two phones on one wifi and short of the trip out to a Durable Object and back down to a handset on mobile data, where every press missed the tick it was meant for and the run lived in `stalled` — lag you can play through beats a stutter you cannot. Each device carries its own, rising the moment the link asks and giving a tick back a second when it recovers, because every command crosses the wire stamped with the tick it lands on and the two therefore never have to agree on the number.

## 2026-09-03 · 5fad0f0 — A technical finding is queued and drains itself; an idea still is not

Suggestions used to be said once in the report and then be the owner's to keep or drop. That was the right answer to a backlog of *ideas* — sixty-two entries nobody but him could decide on — and the wrong answer to the other half. A refactor stepped around, a rule re-derived instead of called, a slow path, a missing test: those need no decision at all, and saying them once meant every session found the same ones again.

## 2026-09-03 · ede4c70 — The wisp's next square is on the screen the moment it lands, and the pilot's box stops pointing

Two things the owner found by playing it.

## 2026-09-03 · 3f11fc0 — THE GHOST wears a whole outline, its eyes burn, and it leaves its last places behind it

The dashed contour is gone: at 26 px a broken line read as a shape coming apart into dots rather than as camouflage failing, and the tears inside the body and the shards thrown clear of it already say that. The eyes are a hot core in a near-black socket now, with a glow that bleeds past the socket onto the body and reaches further as the temper goes up — a bright dot on a bright body is a highlight, and a bright dot in a black hole is an eye.

## 2026-09-03 · 6b1ab3b — The palette lines say what to do about a brush, not what it looks like

The owner's pass over the sixteen: a brush is picked to be placed in a wave, and what an author is holding in mind is the answer the pair will have to find — "shot with the red cannon", "ward it, then shoot", "shoot the armour away first" — rather than the silhouette, which is already the picture beside the words.

## 2026-09-03 · 874f459 — The save's commit names the files that moved

A save may write six act files and move one wave in one of them, and the message was listing all six — which is what the release note would then say. It now asks git which of the offered paths actually changed, and both the message and the commit's pathspec are that list.

## 2026-09-03 · 411bb30 — A wave saved in the director is a wave committed

The editor's save wrote source files and left them dirty, so an afternoon of authoring arrived as one shapeless diff and any session that came along in between saw uncommitted work it had to step around. A wave placed in the editor is finished authoring at the moment the save returns, so it is committed at that moment.

## 2026-09-03 · 4500c4f — A merged tree no longer leaves the dev server showing yesterday

A hot bundler rebuilds the module whose file changed, which is right while a person saves one file at a time and wrong the moment git rewrites two hundred of them. A pull, a rebase, a landing from another worktree or a plain checkout takes a second or two to write the tree; the bundler starts on the first file and finishes against a tree that has moved underneath it, and the incremental graph it keeps from that build is half of each revision — and stays that way.

## 2026-09-03 · a43be30 — A lure is burning through, and says two words instead of four

The corner frame and the words both sit outside the contour, so the middle of a lure — the part the eye lands on — said nothing at all. Now there is a hole through it, in the shape of the body itself: the same lobes, the same seed, the same wobble clock, filled even-odd so the field and the light shafts show through the middle of the creature. Nothing else in this game is see-through in the middle. Sparks come out of it and it flashes at the mouth, in `ember`, the colour already spent on something going wrong.

## 2026-09-03 · fb2dff5 — The pilot gets a box walking the grid while a wisp is out

Player 1 had a lattice, a siren and a pip on every hop — three true things, all of them at the edges of the picture. The field in the middle was an empty grid, which is what a field with nothing on it looks like, and this is the wave where the field is not empty. The seat holding the cannon was being asked to stare at a plausible nothing.

## 2026-09-03 · 813576b — The wisp comes through in bands, with holes in it

A wisp drawn as a solid jellyfish is a solid jellyfish, and the one thing the body never said was that the other screen has nothing on it at all. The split is the whole creature.

## 2026-09-03 · 5342475 — A brush says one thing in the palette, and the whole sentence on its card

The line under a brush's name was CREATURES[kind].blurb, which is written for the first-appearance preview: three clauses, everything true about the creature. Twenty of those stacked in the strip is a wall, and the question the palette is being asked is only ever "which of these is the one I mean". Each brush now carries a short line for that — "starts bigger, shrinks when shot", "p2 does not see what is inside" — and the blurb moves to the hover card, where there is room for it and where somebody has stopped to ask.

## 2026-09-03 · 508bcee — The bulb loses the two curved strokes over its core

Inside a bulb, above the core dot, sat two mirrored quadratic strokes at half alpha. They read as stray rounded lines rather than as part of the body, so they are gone; the bulb keeps its core dot and its rim. Asked for by name, so it lands on the field rather than going to VERSUS.

## 2026-09-03 · 812a768 — A wisp jumping out of the top row no longer arcs over the letters

The apex was a flat 2.2 tiles, and a wisp may stand on row 0. Out of the top rows the body and its dotted guide line both rose through the lettered axis and off the top of the grid — over the one thing the pair reads this creature by.

## 2026-09-03 · ec070fa — The wisp's rim scallops instead of spiking, and its guide line stops running off the top

Three things the first frames of the jump showed.

## 2026-09-03 · 369c8fa — THE WISP jumps, and the tile it lands on is called before it gets there

It used to blink: a squash, a stretch into a line, two thirds of a beat of nothing, and the same run backwards into a new tile. Player 2 saw a body go out and a body come in and had to infer they were the same body — and had a dwell of two beats, 1.25 s, to read a letter and a number off the arrival and get it across the room. That is under what a spoken exchange takes, which was the intent (force a shorthand) and not the effect (a tile that expired while it was being said).

## 2026-09-03 · 0854288 — The dart wears the lure's frame, and its arrows stand clear of it

The first cut boxed the body and both arrows together, and at a tile that is thirty pixels wide the arrow tips landed on the top corner brackets and were read as part of them — which loses the one mark on the pilot's screen that carries a side. The frame is now the square a lure wears, around the body alone, and the arrows are lifted into the gap the question mark had.

## 2026-09-03 · 5b0b878 — One frame for every body the game picks out

A lure, a dart, a veil and the queen's two marks each had their own way of saying "this one is not ordinary, and the screen you are on is not the one being told" — a white ring and an exclamation, two arrows under a question mark, a question mark over a cloud, a question mark inside a mark. Four pictures for one idea, and a pair had to learn all four.

## 2026-09-03 · 94eddd8 — The ECHO brush is drawn as the two bodies it becomes

Its chip fell through to the settled-body pose every living kind gets, and drew one small bulb — a picture of a body that happens to be little, saying nothing about the one thing this brush places. So the pose now waits for the first division and photographs the pair: `ECHO_AXES[0]` is sideways precisely because two halves side by side is the plainest picture of a thing coming apart. One division and not three — eight bodies in a block is what the pair sees once they have lost the argument, and at 34 px it is a smudge.

## 2026-09-03 · 78682db — A finished lane lands itself, and says LANDED! in the chat

A lane could be green, committed and finished and still sit on its branch until somebody remembered to type `bun run land` — the one forgettable step in a history that is linear on purpose, where the cost of forgetting is a trunk that moved, a rebase that grows daily and another idle worktree. The `Stop` hook now takes that step: when a turn ends in a worktree whose branch is clean and ahead of `main`, it runs `bun run land` and prints the landing as one line in the chat. Mid-task work cannot land, by construction, because mid-task work is uncommitted.

## 2026-09-03 · 7f905de — Ctrl-click a brush and the director plays the wave it first arrives in

The palette already knew which wave first puts a brush on the field — the hover card has named it since the card replaced a title attribute — and the only way to act on that was to read the number, find it in the rail and press it. Ctrl-click (or ⌘-click, since Ctrl-click is the context menu on a Mac) now opens that wave and starts it running, so "what is a Throb" and watching one arrive are one press apart.

## 2026-09-02 · 481177a — THE GYRE: the column you were told is right for one beat

Six bodies bolted round a turning rim, alternating red and cyan. Every other creature holds one of colour and column still — a slick keeps both the whole way down, the dart moves the lane, the veil turns the colour over. This one turns them into each other: the body standing in a column *is* a different colour a beat later, so "red in four" is a true sentence with a shelf life of one beat, and the pair has to name a moment instead of a place.

## 2026-09-02 · c6800e4 — The director answers PINBALL's slabs, and a test says when it does not

FIRE and SET did nothing in the director: the round shipped without a stage listener, so the needle swept straight past a click. `stage-touch.ts` routes the canvas through the game's own touchDown, which knows about the field and nothing else, so a round's own buttons are answered by nobody unless a stage-<round>.ts names them. stage-pinball.ts names all four — the bucket's two held on THE GAUGE's valve contract, the latch and the launch pressed.

## 2026-09-02 · b282ab4 — THE RIND: the shot that lands does not close the column

A twenty-first creature, and the first that does not die to the shot that hits it. It arrives three times the size of a slick or a bulb — the authored colour says which, exactly as it does for an echo — and the matching colour takes a layer off instead of killing it: three sizes, two sheds, and an ordinary body at the end that dies to an ordinary shot. Nothing about the aim changes at any point. What changes is the habit every other aim target has taught the pair, that landed and next are the same word, and the two shots in the middle are the ones nobody fires unless somebody says so out loud.

## 2026-09-02 · ace15ba — The snake stopped ticking from tile to tile and started moving

Six notes from the owner playing it, and they are one change: the round looked like a grid being edited rather than an animal being driven.

## 2026-09-02 · e14019f — The director paints PINBALL's boards, and a save writes them back

The second boss the director edits rather than documents, and for THE FLEET's reason word for word: where the pieces are is the fight — whether there is a lane back down the middle, how far a target is from a wall the ball can bank off — and none of that is legible as forty rows of coordinates. One gesture and no modes: a press on a cell walks it through empty, peg, target peg, block, target block. The grid's size is asked of pinBoardRows rather than written down, so an author cannot paint a board the game would refuse, and pinballFault says the rest under it.

## 2026-09-02 · 31637be — PINBALL: shorten the table and lift the title off the status bar

Two defects in the first frame, both repairs rather than offered looks. The title and the line saying whose press is next were drawn at 0.055 and 0.095 of the play height, which is under the status bar — SNAKE's own numbers are 0.09 and they are where these are now. And the table was eighteen rows against boards eleven rows tall, so a third of it was empty air below the lowest piece: it is fourteen now, which leaves the return lane and nothing more.

## 2026-09-02 · ac49dcf — PINBALL: the bucket is the gun and the glove

A sixth boss, and the first body in this game under an acceleration. The ship folds into a bucket at the floor of a tall table; a ball is fired upward out of it, falls back through a field of pegs and blocks, and the same bucket has to be under it when it lands or the hull pays. Three presses in one order, alternating seats: player 2 opens the aiming sweep, player 1 stops the needle, player 2 fires on the power bar. The sweep takes six and a half seconds, which is the whole of what keeps it a conversation rather than a race — a spoken exchange here runs 2.1-3.6 s and the lockstep adds a fixed 100 ms of its own.

## 2026-09-02 · f5da274 — Prove THE ECHO's tell instead of trusting it

The strain was a pair of `ctx` calls, which no test can see: a tell wired to nothing looks exactly like a tell that is subtle, and the only thing that would have caught it is somebody watching a wave at tempo. `echoStretch` is the rule with a return value now — the angle, how far the body pulls along it and how far it necks across — and `echoStrain` is the four lines that apply it.

## 2026-09-02 · 27c2119 — THE ECHO strains before it parts, and waits longer every time

Three changes to a creature that was too quick, too regular and too quiet about what it was doing.

## 2026-09-02 · ce1aae3 — One of you drives the snake and the other one works it

The owner played the round and said what it should be instead, and this is that round. Player 2 has the whole of the steering — LEFT and RIGHT are a quarter turn each, relative, the way the arcade game has always been driven, and there is no up and down at all. Player 1 has the two things the body does when it arrives: FIRE, a shot straight out of the head, and MAW, the mouth open for half a second. Neither of them can do any part of the other's job.

## 2026-09-02 · 51f64f2 — THE ECHO: the slow one that becomes four

A twentieth creature, and the first whose urgency points forwards. It comes down one row every second beat, so the hull is never what is pressing — but one beat after it lands it divides in two, and one beat after that both halves divide again, fanning two columns apart and then one so the four end up evenly spread. One shot early is four shots late, and since a kill pays for every body the one it killed would still have become, the pair is never paid for waiting, only charged for it. The wave puts an echo beside two ordinary bodies that look far more urgent, which is the sentence it exists to make somebody say: that one first.

## 2026-09-02 · 2a5ec4a — A body that never stops, and neither of you can turn a whole corner

SNAKE, the second of the twelve rounds and the first control in the game that moves something. The ship folds into a snake, the snake never stops, and the one rule underneath it is that a turn only ever counts *across* the way the body is already going: player 1 has left and right, player 2 has up and down, so every corner is one seat and then the other, in an order they have to agree out loud. That is what makes a game famously played by one person a game for two — and it is the answer the idea store had been waiting for since the entry was written.

## 2026-09-02 · a248bdb — One of you can see the ships and the other one is holding the sights

THE FLEET, a sixth boss and the plainest split this game has drawn. A chart of squares stands over the field with a fleet hidden in it: player 1 is shown every hull and holds the only trigger, player 2 is shown water and is the only one who can move the sights. Neither can reach the other's half, so the pilot spends the fight saying a square out loud and the navigator spends it counting one. The sights step one square a press and never jump — a control that could name a square would need no telling — and the chart is lettered A to K by 1 to 10 so a square survives being said once across a voice delay. The clock is the whole of the danger: nothing here can reach the hull, and running out of time breaks it by damageFleet in the middle column.

## 2026-09-02 · 4192942 — A body one of you cannot see at all, and the other cannot aim

THE GHOST is the first creature whose secret is a place. Player 2 sees it whole; player 1 is drawn a band across the row it is standing in and nothing whatever about the column — and player 1 is the seat holding the cannon. So the sentence the pair has to say is a bare number, which nothing else in this game has ever asked for, and the handover is the mechanic: the number is worth nothing until the cannon is standing on it, and only the player who cannot check can put it there. Shot, it lets go and climbs out of the top of the field like a balloon released, on both screens — the only thing in this game that ever travels upward, and the only sight player 1 gets of the body they have been firing at.

## 2026-09-02 · 84f25a5 — A body only one of you can see, and never twice in the same tile

THE WISP is drawn on player 2's screen and on player 1's not at all — not dimmed, not ringed, simply absent — and every two beats it is standing somewhere else on the field, one tile drawn from the seeded rng. It does not fall, so it never reaches the hull and never leaves on its own: the wave stays open until it is shot, and either colour does it. The seat that can see it cannot aim; the seat holding the cannon is looking at an empty field. What crosses the room is a square.

## 2026-09-02 · ca2c05b — Every frame this tool ever took had a black box over the HUD's top corner

`showKeyHint` is gated on `pointer: fine`, and headless Chrome reports fine — so the PC key toast was over the hull bar and the siren's corner for the first six seconds of every capture, which is longer than any capture takes. It runs on a real clock and `advance` is not that clock, so it cannot be waited out once rAF is frozen; it is removed outright, after the opening lets go and before the loop stops. Matched on its own text rather than an id, because a commit and its parent both come through here and an id added today is missing from the parent — a toast cleared on one side of a before/after pair is worse than one left on both.

## 2026-09-02 · e9be3a3 — The torch's call line hung in the middle of nothing, and now it hangs off the siren

`TORCH · COLUMNS 3-4 · CALL IT` was centred on the screen, which put it under the middle of the band and away from the instrument that is actually asking for it. The siren and its two seat chips sit top right and say *a call is on and whose mouth opens*; the line says *and here is the sentence*. They are one message, so the line is now right-aligned to the siren's own right edge, directly under the cluster. The band still says where.

## 2026-09-02 · 3eaaf88 — A chipped half stood there in nothing but its own soft outline

THE SHELL with one plate off read as two unrelated things in adjacent columns: a hard grey-rimmed plate beside a bare body drawn in its own colour. The bared half now keeps the plating's grey rim, traced along the body's own contour rather than the armour's, so the pair see one armoured thing with one side opened — and the rim leaves with the last plate, which is what "no armour left" has to look like.

## 2026-09-02 · d49529b — The pilot could not see that a dart was the other seat's to answer

Player 1 was shown a dart as a body in a column, so the cannon went to that column and the reason it was the wrong one arrived a beat later as hull. The creature was working exactly as designed and the picture never said so.

## 2026-09-02 · 4aa5a67 — The save box now says it, and the browser stopped asking on the way out

The header carried the same fact twice — a gold SAVE button that looked the same either way, and a word beside it reading "saved" or "unsaved". The button carries it alone now: blue while the store is ahead of disk, green once the two agree. The status line stays for the messages a colour cannot carry — a refusal, a failed save, no server.

## 2026-09-02 · c1e35d9 — Four lists could forget a new creature, and the shape it got instead was a slick

Adding a creature kind touches upwards of thirty files, and four of the lists it has to reach failed silently when it did not. Two of them decided what the thing looked like: `livingSilhouette` ended in `: SLICK` and `livingMotion` in `: TILT_RIPPLE`, so a kind that never reached either by name was drawn as a slick that swayed like one — on both phones, with no compile error and no failing test. In a game where a shape has to mean one spoken word every time, that is the most expensive silent failure there is: the pair say "slick", both of them are looking at one, and only the simulation knows better.

## 2026-09-02 · 3928b92 — A rulebook at the root told sessions not to commit, and the chrome hid under the notch

`CONVENTIONS.md` sat beside `CLAUDE.md` at the repository root, opened with "Read this before editing. It is the whole rulebook; nothing here is optional", and then said "Do not commit." It is the aider worker's rulebook — the two disagree on purpose, because the worker's output is reviewed before it lands — but nothing in the file said so, and a session that read it obeyed the wrong one. It is now `tools/delegate/WORKER-CONVENTIONS.md`, beside the tool that feeds it to the worker, and it opens by saying who it is for.

## 2026-09-02 · 9bfd959 — The Stop hook charged 32 seconds for a docs edit, and landing forgot to push

Two hooks and one command, all of them costs a session pays on every turn.

## 2026-09-02 · 3c00381 — The wire promised to distrust a frame and then cast its commands to Command[]

`protocol.ts` opens by saying a malformed frame must fail there, where it is one dropped packet, and not three layers down where it is a desync nobody can explain. Underneath that paragraph both decoders did `m.commands as Command[]` and handed whatever arrived to the simulation. A peer on a different build, a proxy that mangled a field, or anything at all pointed at the room could send `{kind:"fire",color:"purple"}` or a column of `NaN` and watch it reach `applyCommand`.

## 2026-09-02 · a728a6f — Two phones drew different sparks, and a control could be pressed that answered nothing

Four things in render that were true by accident rather than by construction.

## 2026-09-02 · c29d5bd — A frame paid for two fills nobody sees, five clips of one path, and eight gradients it already had

Measured through the canvas stub rather than guessed at: one phone-sized frame with three creatures on the field made 66 `fillRect` calls, 7 clips against the hull's 140-segment path, 8 gradient constructions and 7 `new Path2D`, two of them from the same 6.4 KB string built twice.

## 2026-09-02 · 6d91a1f — Half of CLAUDE.md was an argument every session had already accepted

The file loaded into every session in this project had reached 537 lines and 31 KB — about 7,800 tokens — and two sections were 47% of it. Neither was rules. Both were the reasoning *for* rules, written well, at the length good reasoning takes: why a branch and its worktree do not go at the same moment, what happened the day twenty-seven checkouts stood on disk, why forty-seven unpushed commits were a trap rather than a saving.

## 2026-09-02 · 3378c2f — Eight fields could desync two phones and nothing would have said a word

`hashWorld` had grown by addition — a field went in when somebody noticed it could desync — which meant the set of fields outside it was whatever nobody had thought about yet. A throwaway script found three of them blind in one sitting: two worlds differing only in a bullet's colour, a pod's kind or the body a lure wears produced identical fingerprints. A bullet's colour decides kill from miss in `bullet-hit.ts`, so a red shot on one phone and a cyan one on the other clear different fields while both devices insist they are in step. The charge was already hashed; the same shot one tick later was not.

## 2026-09-02 · 78de4d3 — docs/parked.md comes back for the one thing it was good at: work left half-done

It was deleted because it had become a backlog, and a backlog is the one thing it must not be. Scoped to what a session actually parks, it carries a sentence nothing else can: the next session clones origin knowing only what the commit messages say, and none of them say "the other half of this is still undone".

## 2026-09-02 · b4c1d9d — The backlog was never the parked file, it is the spec the NOT BUILT YET sheet reads

Removing docs/parked.md reads as losing the backlog, and the paragraph that replaced it named the spec files without saying why they are the right home. They are the right home because they are already the page: the director's NOT BUILT YET sheet is built from ideas.md's ### sections and the rosters in bestiary.md and bosses.md, and anything the simulation has drops off it by being built. An idea filed in the spec lands on the sheet the owner decides from, beside the built things it would sit next to — which a separate file of loose ideas could not do, and which is most of why nobody opened that file.

## 2026-09-02 · 0d0d769 — Four of the five VERSUS slots were held shut by lanes that cannot land

The dead-pointer sweep turned up something that was not bookkeeping. Two documents carried standing constraints naming burn lanes as their blocker — alive.md on slots 4 and 5, versus.md on the bulb and slick slots — and the lane they waited on owned own-motion.ts in a queue that was deleted with bun run burn in decisions.md #26. A constraint whose release condition is a lane nobody can run is a slot closed permanently, and the reason it stayed closed is that the sentence naming it looked like ordinary scheduling.

## 2026-09-02 · d6204cd — Thirty-eight pointers at a queue file that was deleted months ago

docs/queue.md went with bun run burn in decisions.md #26, and thirty-eight comments across twenty-five files went on citing it — "see docs/queue.md's claude/burn-topbar-fold entry", "the split docs/queue.md's SHIP-column brief asks for". Every one sends a reader to a file that is not there, which is worse than saying nothing: it reads as a promise that the reasoning is written down somewhere, and following it costs a session a search before it works out the file is gone.

## 2026-09-02 · 6b9e43a — The parked file and its page are gone, and what was worth keeping moved to the spec

The owner has no use for it. It was one list of loose ideas standing apart from the things the ideas were about, and that separation is what made it unreadable: a control was described in parked.md while the boss it was tried on was in bosses.md, so neither page was complete and the reader had to know both existed.

## 2026-09-02 · c43e77e — The parked file gets a budget, which is what it was missing, not a ban

The previous commit read the evidence right and drew the wrong conclusion from it. Sixty-two entries in six days is an argument about rate, not about whether a session should be able to write anything down — and "suggestions go in the report and nowhere else" throws away the one thing the file is for. A cloud session starts cold with nothing but origin and the commit messages, so a finding that lives only in a transcript is lost, which is the reasoning the original rule was built on and it was never wrong.

## 2026-09-02 · b3a3cb8 — The rule that filled parked.md is gone, and so is the queue board it filled

A cloud session no longer parks what it noticed and skipped. It says so in the report and lets it go, which is what the rule was competing with in the first place.

## 2026-09-02 · 64d5cfc — Remove parked idea: a body under a hand sways exactly like a free one

## 2026-09-02 · 3dc57d8 — Remove parked idea: the one body the fiction forbids from looking alive is the only one with volume

## 2026-09-02 · 6b2e2b8 — Remove parked idea: one predicate stands between thirteen creatures and a picture

## 2026-09-02 · 90a6504 — Remove the maze re-tangling entry from parked.md

The owner decided against it.

## 2026-09-02 · 5e3c8af — Remove the four-director-files-near-the-cap entry from parked.md

Removed for now, per the owner.

## 2026-09-02 · e5252d3 — Remove the merged-wave-guides entry from parked.md

The owner decided against it.

## 2026-09-02 · c1b755d — Remove the guard-lapse peripheral-signal entry from parked.md

The owner decided against it.

## 2026-09-02 · ebaaa55 — Move Cracks in the cockpit from deferred into Mechanics

Nothing about it was ever argued down — it was only ungrounded, written for a version of the game with an aim beam and a cockpit view to crack — so it belongs with the other unworked-out ideas rather than in the list for ones that were turned down. Left "Deliberately deferred" with just THE CONDUCTOR, which really is deferred rather than refused.

## 2026-09-02 · 878f34d — Move bestiary and boss ideas out of parked.md into the spec

parked.md is for technical debt and open design questions, and its own rules already say a creature or boss idea belongs elsewhere rather than sitting scattered through the file. This moves each one to the page it actually argues about, instead of a generic parked pile, and deletes it from parked.md once it lands:

## 2026-09-01 · f2b1a4e — PARKED is read top to bottom, and every idea brings its argument with it

The tab showed seventy-five headings in four side-by-side columns and left every word of prose in `docs/parked.md`. That is the one thing the page cannot afford to drop: an entry is an offer the owner has to decide on, and the sentences under the heading — what it is, why it was skipped, where to start — are the entire content of that decision. A title and a date decide nothing.

## 2026-09-01 · fcbb29a — The queue is gone, because a file that is empty whenever you open it is furniture

Keeping `docs/queue.md` as a hand-worked list was the first cut when the machinery around it went, and it did not survive contact with a day of actual work. Four entries at breakfast, one by the afternoon, none by the evening — each picked up in a session of its own and deleted by the commit that finished it, which is exactly how it was supposed to work and exactly why there is nothing left for the file to hold.

## 2026-09-01 · 0e945fb — The boss was converted twice, and a radius function cannot draw a neck

THE BURR and THE POMMEL were the same Galaxy Defense stage boss. The first conversion used `studded`, which samples one radius per angle; a ball on a stalk has two at the same angle, and the one it cannot keep is the waist. So the necks closed, the knobs ran together into a continuous spiky rim, and the body read as a sea urchin rather than as a mace. `clubbed` walks the contour instead of sampling it, which is why THE POMMEL has stalks at all.

## 2026-09-01 · 301b07b — The lists that asked for something are gone, and landing cleans up after itself

Three arrangements went at once, and they went for the same reason. The queue in `docs/queue.md` was driven by `bun run burn`, which read it as a board of parallel lanes and joined it to git. `Check:` trailers produced an outstanding list in `bun run checks`, a sheet in the director with a verdict button on every row, a ledger in `docs/verified.md` and hand-written restatements under `docs/checks/`. `bun run handoff` derived a four-line closing block for a phone. All three were accurate, and all three asked the owner for something on every visit — which is what finished them. The owner's words: it was too error prone and seems to waste my tokens. Twenty rows stood outstanding at the end, and an abandoned obligation list is worse than none, because it looks like coverage.

## 2026-09-01 · 56107e8 — The siren gets a left and a right, and the eye gets a pupil

Four corrections from the owner, looking at the thing running.

## 2026-09-01 · c240940 — The eye moves off the enemy and becomes one siren in the corner

Five creatures each said "one of you can see this and the other cannot" in their own hand, over their own body: a shut eye above a cloud, a white ring round a lure, an arrow under a dart. A pair had to learn five markings to learn one sentence, and had to be looking *into the field* to find out they were supposed to be talking at all.

## 2026-09-01 · 440d14d — The palette was a rail beside a grid, and the map had nowhere to sit but under it

Four things the owner asked for, all of them about the BRUSH & MAP column being laid out for a palette that was too wide.

## 2026-09-01 · 6f79679 — The director's idle window was measuring how long a forgotten server lives

It exited after an hour of silence, and the hour was the wrong number because the window was refreshed by *requests* — which an open director does not make. A wave is read and thought about, not clicked through, so the page went quiet seconds after it loaded and the hour was never about anybody's attention. It was how long a server nobody wants holds a port, and a session that opens one to take a screenshot and moves on leaves exactly that. Four were found running, the oldest for the best part of an hour.

## 2026-09-01 · 2e96dd5 — The dart brush was cut in half, because it was photographed mid-diagonal

A body is drawn between the row it left and the row it is on (`drawnRow`), and at a beat boundary — which is where a settled pose stops — that is the row it left. For every other brush that is one tile of overshoot and the trim absorbs it. A dart moves two rows at a time, which is exactly the reach its crop has, so the body stood on the crop's own edge and the top half of it was outside the picture.

## 2026-09-01 · ee5fe21 — A brush is a picture of its creature on black, not a crop of the field

The thumbnails in the palette were real frames of the real renderer, which was right, and then they were cropped by a per-brush number of tiles, which was not. So each one was a bit of starfield and grid with a body somewhere in it, sized by a guess that could only be right for one shape: the clasp sat in air while the shell touched the edges, and the pod was a speck.

## 2026-09-01 · ccf5cc3 — Upgrade TypeScript from 5.7 to 7.0.2

TypeScript skipped 6 entirely and jumped straight to the native Go-ported compiler; latest on npm is 7.0.2. tsc --noEmit (root and apps/server), biome, and bun test all stay green under it.

## 2026-09-01 · 33f18b2 — Landing a branch means rebasing onto main before checking, not after

The rule already said a branch is fast-forwarded or rebased onto main before it lands, but it left unstated which order the two steps run in and what a green check even means once main has moved. Spelling it out: rebase first, so a conflict with whatever else landed surfaces on the branch while there is still time to fix it, then bun run check on the rebased tree, then fast-forward. A check run before the rebase is answering a question about a tree that no longer exists.

## 2026-09-01 · ffd109e — The veil's lightning is drawn — and `bun run frames` was photographing a random beat

Three captures in a row of a creature whose whole picture is a strike on the beat came back with no strike in them, and the second half of that sentence is the interesting one. `captureFrames` drives the world with `advance` and then asks for a screenshot — but the page's own loop is still running, and a couple of hundred milliseconds of round trip is a few dozen ticks, so the frame that lands is at whatever beat phase the loop happened to reach. The tool's own docstring promises "the same wave, tick count and viewport both times"; the tick count was the one part that was never true, and anything that only shows for part of a beat was caught or missed at random in *both* pictures, independently.

## 2026-09-01 · a3b70d5 — The veil's cloud is billows, not lobes — a lobed contour drew a spiky star

Seen in a frame: the first cloud was `blobPath` with seven shallow lobes, on the reasoning that a thunderhead is a stack of billows and a lobe is a billow. It is not. A lobed contour has one radius per angle, so its dips are notches cut inward from a circle — and a cloud's outline is the opposite, the union of overlapping heaps, which never dips between them. What drew was a spiky star.

## 2026-09-01 · bb86e0b — THE VEIL: a thundercloud only the pilot can see into, and the body inside it turns over

The design has carried a veil since the spec was translated — one of the first thirteen, a row in the information split, a row in the randomness rule, a question mark on the radar, and two sounds sitting spare in the catalogue with its name on them. None of it was built. This is that creature, in the shape the owner asked for: a thundercloud with a slick or a bulb inside it, lightning on the beat, and the body morphing from one to the other every five beats.

## 2026-09-01 · b7f1e5f — ERASE returns as a trash icon under the category rail

Removing it from the palette entirely left no quick way to empty a selected cell without a trip to the panel under the map. It comes back as one glyph button below CANNON/SHIELD/MIXED/SUCK — not a category of its own, so it never scrolls away with whichever tab is open — and it uses the same select-then-act path every other brush does: pick a cell, then this, and the cell is emptied and deselected same as a paint would leave it.

## 2026-09-01 · e0bdfd3 — A brush click paints the selected tile and lets go; the map gets its own width

Selecting and painting used to be one click on the grid, which left no way to point at an occupied cell without repainting it. Now a click on the map only selects, and a brush button paints whatever is selected — never held, never staying lit — so reaching an existing entry's own fields is a click on its cell, and changing what is there is one click on a different brush. ERASE's old toggle mode goes with it; DELETE under the map already does the same job for a selected cell, and the paragraph explaining the old dance is gone too.

## 2026-09-01 · 49a5ec8 — Brush categories become a rail of tabs beside the options, not headings above them

The stacked BRUSH panel from the last commit still read as one long scroll: every category's buttons sat inline under its own label, so reaching MIXED meant scrolling past all of CANNON and SHIELD first. Categories now sit in a narrow rail on the left with the active one's buttons beside it — the layout the owner actually asked for: brushes (categories) on the left, brush options next to them, the map below both, full width. Selection persists in localStorage the same way the per-category collapse it replaces did (brush-category.ts), and one active tab at a time is itself the accordion the categories asked for, so there is no second collapse state to keep in sync.

## 2026-09-01 · b965e9e — BRUSH stacks above MAP, and both close on their own — brush categories too

A wide map used to sit beside the palette; reaching a brush after scrolling right to the map's far columns meant scrolling all the way back for every stroke. BRUSH now sits above MAP instead (subcols.ts), and either half can put itself away independently of the whole-column collapse columns.ts already had — plus a per-category collapse (CANNON, SHIELD…) inside the palette itself, since state there has to survive palette.ts's own re-render on every brush pick.

## 2026-09-01 · 06f8739 — Five meteor buttons become one, and a rock stops being the only thing an arrival can say about itself

The palette carried METEOR, METEOR ×2 … METEOR ×5 as five separate tools. They draw the same rock: the tier *is* the fall speed, so the five buttons were one brush wearing five numbers, and a number about one arrival was being chosen by reaching for a different tool. That does not scale — the width asked for here would have made it ten — so the speed moves under the map to the panel that configures the cell you are pointing at, and the palette carries one METEOR. The torch keeps its own brush: it is not a tier, and it is the one rock the pair has a different sentence for.

## 2026-09-01 · 37dc39c — The dart says where it is going one beat early, and draws the path it will take

The arrow could only appear while the body hung, because until it landed nothing knew which way it would go next. So half of every cycle said nothing: player 2 read a word, said it, and both of them watched a beat go by with nothing on the screen to check the call against.

## 2026-09-01 · 05d3090 — A screenshot row drops CURRENT too, not just the second seat

SHIP:HULL-SKIN and CANNON:SHOT already dropped the second seat for a `screenshot` candidate; the CURRENT side stayed, so the row was still a compare rather than the single picture the owner asked for. renderScreen now builds only the candidate's own box for a screenshot row — `pair.left` is still built by `startPair` (the pair engine draws both sides every frame regardless) but never mounted, so nothing changes there; the live, two-sided path is unchanged.

## 2026-09-01 · 3ef460d — OTHER GRAPHICS shows two rows as a still, and the shield's flash joins the field

SHIP:HULL-SKIN and CANNON:SHOT now freeze on one chosen frame at one seat instead of running the full current-vs-candidate pair forever at both — a new `screenshot` field on a Variant (tools/versus/variant.ts) that versus-page.ts honours by dropping the second seat and the pause/rate/blink/ zoom bar. Freezing needed its own `Pair.freeze()` (versus-pair.ts): `setRunning(false)` stops the world but also paints hud.ts's "PAUSED" overlay on every frame after, which a documentation screenshot should not carry; `freeze()` holds `dt` at zero while leaving `running` (and so the overlay) alone, and keeps repainting the identical frame rather than cancelling the loop outright.

## 2026-09-01 · d8335ed — A click stops deleting, and the map grows a panel for what a cell is

Painting the brush already in a cell used to take it away, so the brush was its own eraser. That made the commonest gesture in the tool destructive and left no way to *point* at an entry — which is exactly what the next two lanes need, because a meteor's speed and size and how long a body stays armoured are facts about one arrival rather than about a brush, and another five buttons in a palette that is already scrolled is not where they go.

## 2026-09-01 · 0e42688 — CLAUDE VS CHATGPT joins BORROWED and TOWER DEFENCE: the third study, and the first one about the tool rather than the game

The two studies already on the NOT BUILT YET sheet read other games and ask what can reach this one. This one turns the same treatment on the thing doing the building: if the subscription paying for the agent changed from Anthropic's to OpenAI's, which of the tasks actually done here get better and which get worse.

## 2026-09-01 · 0fa0709 — The stage under the director opens on the wave, not the card

BRIEFINGS was forced on for every session, so the button under the stage read pressed before anyone touched it and every wave opened on a briefing card by default. Drop the override and let DEFAULT_CONFIG's own off default stand — a wave shows straight away, and #briefToggle turns briefings on for whoever is actually judging an opening.

## 2026-08-31 · b32c0a5 — Shell-Bulb and Shell-Slick: the armour stops being a body and becomes a coat, and the colour under it stops being a secret

THE SHELL had a silhouette of its own — five broad lobes, its own aspect, its own card on the shape sheet — and a body underneath with no colour at all until the last piece came off, drawn from the rng at that instant so nobody could know it early. Both of those are gone, and they went for the same reason: a shell that is its own shape is a shape the pair have to learn separately, and a body with no colour cannot have light coming out of its cracks.

## 2026-08-31 · ec1174f — THE DART: the first body that does not hold its lane, and the first column a player has to be told twice

Everything on the field until now fell straight down, so a column said out loud stayed true until the thing landed. A dart makes that sentence expire after one beat.

## 2026-08-31 · a85510b — The clasp becomes a lit sphere, and the ward reaches up the column to break it

Five things the owner asked for in one pass, all of them looks they named themselves rather than looks a session decided to change.

## 2026-08-31 · 683831a — GUIDES joins GAME MECHANICS as a sixth tab, one less topbar button

The topbar had two buttons for a wave's help text: GAME MECHANICS, already folding CONTROLS/SHIP/DEMOS/TUNING into one sheet, and a lone GUIDES sheet next to it. GUIDES gets no sheet of its own now — its content moved into GAME MECHANICS' own body as a GUIDES tab, and the rail's wave-list shortcut opens the sheet before clicking into that tab.

## 2026-08-31 · f22d40b — THE CLASP: the shield stops being a plate on one row and becomes a column, and the first creature that turns into another one

A slick or a bulb inside a shield of its own. Shots bounce off it, whatever colour they carried. What opens it is the ward — player 2's shield in its column, player 1's trigger — aimed *up* the field instead of down at the hull, and that is the whole idea: warding already exists, and pointing the same two halves at a creature costs no new control, no new band button and no new control group.

## 2026-08-31 · b0f379e — Hand-painted frames arrive 2.5 MB and ship at 350 KB: one command shrinks a folder and bakes the strip the game can draw

The twenty green-shield frames landed as 512 px PNGs — 2.5 MB for one animation, against 80 KB for the whole of `assets/raster`. That is thirty times the entire baked-asset budget on a portrait mobile web game, so the art was unusable in the field however good it looked in the gallery. PNG is also the worst possible container for what these actually are: a soft gradient under an alpha plane.

## 2026-08-31 · ce917fe — Director: hide the ORPHANS button when the count is zero

A red count draws the eye on purpose, but a button reading "☠ ORPHANS 0" sat in the topbar at all times with nothing to report — noise beside the count it was meant to make legible.

## 2026-08-31 · 6217321 — The TO CHECK list is empty: twenty-four verdicts recorded, and the ledger no longer says anything twice

The director's PASS buttons had written the whole outstanding list into docs/verified.md, several of them twice — pressing PASS on a row that was already recorded appends rather than replaces, so the ledger carried duplicate verdicts for the same sha and the same question. Four older pairs were sitting there from earlier days for the same reason.

## 2026-08-31 · bc462b5 — OTHER GRAPHICS grows a COLLECTED LOOKS section: hand-painted frame sequences, sorted into Shield, Scan, Explosions, Beam

Absorption (9 frames) under Explosions and Green Shield (20 frames) under Shield are the first two, played back as a plain <img> cycled on a timer — nothing here is generated or wired to the field, so there is no shipped record to vote against and no VERSUS pair needed. Scan and Beam stand with no clips yet, ready for the next drop.

## 2026-08-31 · 57e149f — Director: rename RASTER to OTHER GRAPHICS, fold ALTERNATIVES into it

Both tabs offered the same kind of thing beside what the field already draws — a baked animation, a candidate patch on a shipped record — and having one tab per idea meant two clicks to see either. OTHER GRAPHICS now carries both: the raster page's own sections, then ALTERNATIVES' intro and candidate rows appended after them. `versus-page.ts`'s `mountVersusSection` replaces `mountVersusTab`, appending its content into the host page it is handed instead of building a tab and a page of its own; `drawRaster` calls `drawVersus` so opening OTHER GRAPHICS draws both halves.

## 2026-08-31 · a72f2c4 — shield:charge grows a second candidate: flash, offered not shipped

A soft patch of light blooming above the rim, at a random spot, on its own random timer — the owner's ask, put up beside `arcs` for a look before either goes near the real game. Its own slot (`shield:flash`), not a second row under `shield:charge`: `arcs` patches SHIELD_SPARK_LOOK's jagged-line fields and `flash` patches a different record entirely, and variant.ts requires every candidate in a slot to patch the same fields.

## 2026-08-31 · e6ab449 — VERSUS: reject PIP, adopt the heave/tick merge for shield:ward

Three votes from the owner's pass over ALTERNATIVES. cannon:shot's `pip` loses outright — no tail and a hard white edge on the head never became its own event, so the shot keeps its shipped streak. shield:ward's two answers both win, combined rather than picked between: the catch takes heave's whole-body give (a long, deep press you can arrive late to, WARD_LOOK's wide slow rim) and tick's headline feature grafted on top — three hard rings on the shockwave instead of heave's single soft one.

## 2026-08-31 · f1e0d53 — bun run raster tells you to restart the dev server, so a stale atlas stops looking like a broken burst

What the owner saw after the clipping fix landed — the burst missing from PLAY IT and AS A POWERUP while it was correct in THE BURST, THREE WAYS — was a dev-server caching artifact, not a regression: `bun run raster` overwrites assets/raster/*.webp in place, at the same path. A running `bun run dev` serves that path through Bun's own HTML-bundle dev server, which watches source files for edits but has no signal that a binary file changed on disk under an unchanged import; a browser tab's own HTTP cache has the same blind spot. Both kept answering with the bytes they had already served. A production build never has this problem — `bun build` content-hashes the filename, so a changed file is a changed URL — which is exactly why the confusion only showed up in the live dev server and not in the rebuilt game bundle.

## 2026-08-31 · d73092f — The burst's spikes were clipped by the frame, not fading the way they were drawn to

The owner caught it looking at THE BURST, THREE WAYS: every spike ended in a hard square edge instead of tapering off. The gradient on each spike shaft already fades to alpha 0 at its own tip — that was never the problem. The problem was arithmetic: at the latest ease and the longest random draw, a spike's length worked out to 1.28x the frame size measured from centre, and the canvas only reaches 0.5x that before its own edge. Every long spike was being cut off mid-fade by the square it was drawn into, which reads exactly like "cut in a square" because that is what was happening.

## 2026-08-31 · 281777f — The RASTER tab opens on a playable wave, with the burst on a switch

The page showed the animation and could not answer the question that decides whether it ships. A burst on a 300 px card with nothing else moving always looks good; what nobody could see was a shot they fired killing something at 26 px, over a hull, under a HUD, at tempo, with a rock still falling.

## 2026-08-31 · 8bd8609 — BUILD: a third view on SHAPES, for composing a recipe by clicking instead of typing

Every recipe in `grown-bodies.ts` and `jelly-bodies.ts` was written by hand and judged afterwards — pick numbers, run the sheet, look, adjust, repeat. This is the same `grown()` machinery run the other way: pick a base, click parts onto it, watch it move on the real clock, nudge what is already there, and only write the recipe down once it already looks like something.

## 2026-08-31 · d268632 — Eight bodies that swim, and the first motion in the catalogue a pose cannot say

The owner looked at the fourteen grown bodies and picked out the ones that read as jellyfish, which is better information than a session could have reached alone: the parts library's most useful direction is *a body with something hanging under it*, and what those bodies were missing was the one thing a still cannot show.

## 2026-08-31 · 642b5ba — A body is a base blob and a sentence: fifty-two secondary forms, and fourteen bodies grown out of them

The catalogue has had one unit since it was written, and it was the wrong size. Every shape in `forms/` is a whole contour authored for one idea, which is right when the idea *is* a contour — `sac`, `hooked` and `pile` are each a claim about how a body is put together — and expensive when the idea is a combination. A body with three lashes on one side and a bump on the other was a new radius function. It is now a list of parts.
