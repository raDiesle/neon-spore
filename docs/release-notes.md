# Release notes

What each landing changed, newest first. `bun run land` writes an entry here
the moment `main` moves, one per commit, from the commit's own subject and its
first paragraph.

**Read-only.** Nothing in this file is ticked, answered or deleted, and nothing
is waiting on anybody — it is a record of what happened, not a list of what is
owed. Entries are never edited by hand either: an entry that reads wrong is a
commit message that read wrong, and the history is where that lives.

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
