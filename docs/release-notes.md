# Release notes

What each landing changed, newest first. `bun run land` writes an entry here
the moment `main` moves, one per commit, from the commit's own subject and its
first paragraph.

**Read-only.** Nothing in this file is ticked, answered or deleted, and nothing
is waiting on anybody — it is a record of what happened, not a list of what is
owed. Entries are never edited by hand either: an entry that reads wrong is a
commit message that read wrong, and the history is where that lives.

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
