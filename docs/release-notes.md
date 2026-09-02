# Release notes

What each landing changed, newest first. `bun run land` writes an entry here
the moment `main` moves, one per commit, from the commit's own subject and its
first paragraph.

**Read-only.** Nothing in this file is ticked, answered or deleted, and nothing
is waiting on anybody — it is a record of what happened, not a list of what is
owed. Entries are never edited by hand either: an entry that reads wrong is a
commit message that read wrong, and the history is where that lives.

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
