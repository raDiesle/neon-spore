# Queue

The ordered work an unattended run walks. First in the file is next to be done.

It is not the outstanding list — `bun run checks` derives that from the
`Check:` trailers, and every row of it is an obligation somebody incurred by
landing something. It is not `docs/parked.md` either, which is ideas nobody
has decided on. This is the middle one: **decided, not yet done**.

An entry leaves by being **deleted**, once its branch is on `main`. Nothing
here is ticked, and nothing here records progress — a lane is done when its
branch is an ancestor of the trunk, which git can be asked and a file cannot.
`bun run burn` asks. `docs/autonomous.md` has the rest.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

## TWO CREATURES THAT MOVE LIKE A THIRD
_claude/burn-own-motion-b10 · packages/content/src/own-motion.ts_

`own-motion.ts` falls back to `TILT_RIPPLE` for anything that is not a bulb,
so the Runt twitches like a slick and the Throb tilts like one. The Throb's is
nearly load-bearing: its swell is what tells the pair when to fire, and a body
that also tilts is a body saying two things at once.

Taken off `docs/parked.md`. It is the one copy of how a body sways, so this is
a small file and two entries in it. Finished when both read as themselves on
`bun run shapes` — which is also the tool the two outstanding creature checks
point at, so this lane may discharge them rather than merely serving them.

## THERE IS NO WAY TO OFFER A SECOND ANSWER TO A SHAPE THE GAME ALREADY HAS
_claude/burn-versus-v1 · tools/versus/variant.ts tools/versus/seed.ts tools/versus/run.ts tools/versus/README.md tools/versus/candidates/index.ts tools/versus/candidates/ship-hull.warm/ tools/versus/test/variants.test.ts package.json_

A draft shape gets two cards on the SHAPES tab — NOTCH 1 beside NOTCH 2, turning on the same clock — and a shape the game already draws gets one, forever, because there is nowhere for a second answer to live. This lane builds that place: `Variant` and `Patch` (a `target` that is the live exported object, a `where` naming its file and symbol as prose the prompt can act on, and a `fields` partial that may hold numbers, strings or a whole replacement function), `apply()`/`restore()`, `seedRandom()`, the `VARIANTS` registry assembled the way `tools/shape-sheet/src/drafts/index.ts` assembles DRAFTS, `bun run versus` printing the open slots with each patched symbol's readers derived by grep, and one worked candidate — `ship:hull-skin` / `warm`, patching `OWN_SKIN` in `packages/render/src/hull.ts` — as the fixture everything else is written against. Make it a plain directory with a `test/` beside it, exactly like `tools/checks`, `tools/burn` and `tools/land`: no `package.json`, no `bun install`, and `tsconfig.json` already includes `tools/**/*.ts`. Finished when `bun run versus` names the open slot and its readers, and `tools/versus/test/variants.test.ts` proves four things: every patch restores every field it touched; every target is reference-identical to what the game's own accessor returns (`expect(livingSilhouette("bulb")).toBe(BULB)`); every candidate in a slot patches the same set of targets and fields, and no field appears in two open slots; and every candidate survives a whole frame through `packages/render/test/canvas-stub.ts` with any `poseAt` patch also held against spec 5.8's quarter-tile lane limit — because a candidate that can win a vote and then fail `bun run check` at adoption has failed at the worst possible moment. Two traps worth knowing before you start: `purity.test.ts`'s COPIES sweep globs `tools/**/*.ts`, so a candidate `poseAt` that keeps `t * 1.9` fails `livingMotion`'s row and the escape is a named local const, not a weakened pattern; and `PALETTE` is `as const`, so a palette target needs a cast in `apply()` rather than a widened type on the record.

Model `opus`, effort `ultrathink`. Read `docs/versus.md` first — it is the design this lane implements.

## TWO PHONES, ONE WORLD, ONE FRAME
_claude/burn-versus-pair-v2 · tools/director/src/versus-page.ts tools/director/src/versus-pair.ts tools/director/src/backlog-page.ts tools/director/src/checks-api.ts tools/director/index.html_

A VERSUS tab on the backlog sheet, mounted the way `card-page.ts` mounts CARDS — the button and the page built in JS before `bindTabs` runs, lazy-drawn on first click, riding the sheet's existing header and Esc — showing one slot at a time as two live `Canvas2DRenderer`s at `resize({ width: 380, height: 820, dpr })`, uncapped and never scaled to fit a column. The hard part is one invariant and everything in this lane serves it: **the two sides must differ only by the patch.** One `World`, stepped once per frame from a `Pose` in `POSE_GROUPS` via `pose.build()` and `step()`; one `ViewState` object handed to both renderers so the tick, the beat phase, the time, the `dt` and the events are literally the same object; `Math.random` seeded to the same value at the top of each side and restored in a `finally`, because `sparks.ts` and `deflect.ts` randomise four values per spawn each and without it two identical looks draw different pixels. Then the guard that proves it: after the first settled frame, hash both canvases' `getImageData`, and a candidate with a non-empty patch whose two sides are byte-identical gets no vote buttons and a loud `THE SWAP DID NOT TAKE — or this candidate is the current one` in their place. Side by side is the default and BLINK is one toggle away — the two canvases stacked in perfect registration, both drawn every frame, opacity alternating at 1 Hz with a corner tag naming which is showing — because blink is how a small difference is actually caught and it is also the answer on a window too narrow for two 380 px phones. Play/pause, a rate multiplier, and a `2×` button labelled `2× — NOT TRUE SIZE` on the button itself and never the default. Finished when the hull-skin slot draws two moving phones that differ in exactly one way, the name of the candidate on the right is visible while the reason is being typed, and the swap-did-not-take banner appears if you point the pair at a candidate whose fields match the record. The four small edits: four lines in `backlog-page.ts` beside the existing shapes/cards hooks, a contiguous CSS block in `index.html`, and `head`/`dirty` added to `ChecksView` in `checks-api.ts` from `git rev-parse --short HEAD` and `git status --porcelain` — no new route; `/api/checks` is already fetched. Check first that a browser-side import of `../../versus/variant.js` bundles: `checks-api.ts` crosses out of `src/` but only on the server side.

Model `opus`, effort `think hard`. Read `docs/versus.md` first — it is the design this lane implements.

## THE PROMPT IS THE ONLY THING A VOTE LEAVES BEHIND
_claude/burn-versus-prompt-v3 · tools/versus/prompt.ts tools/versus/test/prompt.test.ts_

A vote writes no file, no git, no localStorage and no server call — the code is the record, and after the prompt runs `main` holds one version and no candidates. So the whole decision rides on one string, and this lane builds it: a pure function from a `Variant`, the current values read off the live records before any patch is applied, the head sha, and the sentence a person typed, to the literal text in this plan's template. It lives in `tools/versus/` rather than the director because it is string-shaped, needs no DOM, and is the part most worth testing. The hard part to think about is a session pasting this three weeks late: every field carries its own `old -> new` so a left-hand value that has drifted stops the whole prompt instead of silently reverting somebody's later edit to `rx`, and the instruction is to name which value disagreed rather than to work out which is newer. Three derivations rather than three sentences somebody remembers: any patch whose `where.file` starts with `packages/content/` appends `bun run shapes` to the check step and both committed sheets to the staging list — `tools/shape-sheet/shape-sheet.svg` is committed and says `9 lobes` for BULB today, and nothing in `bun run check` would notice it becoming a lie; every patched symbol emits a `git grep -n "\bSYMBOL\b" -- packages apps tools` **with no predicted result**, because the one place proposal 3's prompt was wrong was a sentence claiming what that grep would return; and deletion is always `git rm -r` on the candidate's whole directory plus the named import line and the named array entry, never on the file you can see. Finished when `tools/versus/test/prompt.test.ts` asserts the adopt and keep forms for a fixture variant, that the keep form differs from the adopt form only in the five ways the template names, that a content-targeting patch carries the shapes step and a render-targeting one does not, and that no emitted prompt ever contains the words `packages/sim`.

Model `opus`, effort `think hard`. Read `docs/versus.md` first — it is the design this lane implements.

## THE CATALOGUE'S ARROW POINTS ONE WAY, AND A TAKEN SHAPE CAN STILL BE WRONG
_claude/burn-versus-docs-v4 · docs/verification.md docs/asset-catalogue.md CLAUDE.md_

`docs/asset-catalogue.md` says the direction of travel is one way — a draft that is claimed becomes taken, and nothing goes back — which was true while the only open question was what to draw. It is not true any more: the same page already runs NOTCH 1 against NOTCH 2 on one clock and says a single draft in that position quietly becomes the answer by being the only thing on the page, and that argument applies with more force to a shape the game has been drawing for months. Write decision 23 in `docs/decisions.md` (why a candidate is a patch in `tools/`, why the game's import graph is the enforcement rather than a rule anyone follows, why the vote persists as nothing, and a `Reconsider if:` that names the case where it breaks — more than one person voting, or a look whose difference only shows on a device this machine is not), one `##` section in `docs/asset-catalogue.md` on where a vote sits beside DRAFT / FREE / TAKEN, one paragraph in `docs/verification.md` giving the `Check: versus <slot> — …` trailer its shape at both ends, and in `CLAUDE.md` one `bun run versus` row in Commands plus a short Conventions paragraph saying a replacement look is voted on before it is adopted. Two rules that must land here or they land nowhere: a slot not decided by the end of the session that opened it goes to `docs/parked.md` as three sentences and its candidate directories are `git rm`'d — nobody incurred an obligation by opening a slot, so nothing else forces the decision; and a session landing candidates writes the opening `Check:` naming the slot, so a slot's whole life sits on `bun run checks` and `⚑ TO CHECK` rather than on a second list. Finished when `bun run check` is green — and be careful with `asset-catalogue.md`: `tools/shape-sheet/test/drafts.test.ts` reads its status sentence and counts the catalogue, so add a section and touch neither the blockquote nor the counts.

Model `sonnet`, effort `think`. Read `docs/versus.md` first — it is the design this lane implements.

## THE HULL IS ON SCREEN EVERY FRAME AND HAS ONLY EVER HAD ONE ANSWER
_claude/burn-versus-slots-v5 · tools/versus/candidates/_

The mechanism now exists and has been looked through once, so this is the lane that fills it — and it goes last on purpose, because a candidate authored before anybody has watched the pair run is a candidate authored blind. Three slots, all of them things a player looks at constantly and none of them needing a lifting commit: a second candidate in `ship:hull-skin` so the first vote is a genuine three-way (current, warm, and one more), `creature:bulb` and `creature:slick` as separate slots each patching the silhouette record and its own-motion together, and `palette:ammo-pair` patching `PALETTE`'s six red and cyan tokens as one slot because a vote on cyan alone is a vote on something nobody ever sees alone. Think hard about what makes two candidates a real choice rather than a nudge and its twin: each `claim` has to pass the one-sentence test `.claude/skills/new-wave` already applies to a wave, and two candidates whose failure modes are the *same* failure mode teach nothing — the catalogue's own NOTCH pair is the model, where one says the direction with a feature small enough to vanish at 26 px and the other says it with the whole mass, so whichever way it goes the result is a measurement. Every candidate is a directory under `tools/versus/candidates/` holding `variant.ts`, so removal is `git rm -r` regardless of what it grew. Finished when each slot draws two moving phones that differ visibly at 380 px, `bun run versus` lists three open slots with their readers, and the landing commit carries one `Check: versus <slot> — …` per slot pointing at the director's VERSUS tab. Do not open a slot that patches `SWAY_PUMP` or `TILT_RIPPLE` until `claude/burn-own-motion-b10` has landed — that lane owns `own-motion.ts` and a vote taken against a record about to move is a vote against nothing.

**Behind the mechanism lanes, not beside them.** It adds entries to
`tools/versus/candidates/index.ts`, which the first lane creates and owns — a
candidate authored before the registry exists is a candidate authored against
a guess.

Model `sonnet`, effort `think hard`. Read `docs/versus.md` first — it is the design this lane implements.

## THE SHOT IS LAID, NOT FIRED
_claude/burn-shot-delay-s1 · packages/sim/src/shot-charge.ts packages/render/src/cannon-maw.ts docs/spec/systems.md_

Today player 2 presses and a bullet exists; player 1 sees only the result.
Give the cannon a wind-up — the fire opening swells, the skin parts, and the
shot is *extruded* rather than fired — and the press becomes something the
other player can see happening. That is the same thing THE OTHER HAND bought
and it is bought again here for free, because the tell is already on screen.

**Quantised to the beat, not to milliseconds.** The shot leaves on the next
half-beat after the press, so a delay becomes a rhythm and "on the three" stops
being approximately true. A number in `SimConfig`, default 0, so the owner
compares by moving a slider rather than by rebuilding, and so every existing
replay keeps its timing. Finished when the charge is world state, in
`hashWorld`, drawn through the vocabulary `maw.ts` already has, and the owner
can feel every value between 0 and a beat.

## THE SWALLOW LEAVES THE FIELD, AND SPENDS ITSELF DOWNWARDS
_claude/burn-swallow-s2 · packages/render/src/swallow.ts packages/render/src/maw.ts packages/sim/src/pods.ts_

Three things about taking a pod in, reported by the owner, and the first is a
bug: the downward part of the motion is drawn past the edge of the field.
Nothing clips it — there is no `clip()` anywhere in `drawInhale` or `maw.ts`,
so the shape simply goes where the arithmetic sends it.

The second is the shape itself. It should spend less of itself vertically and
more across, and round out on the inside, at roughly the same volume — a mouth
that widens rather than a throat that stretches. The third is a rule: a
power-up should be drawn all the way to the **centre** before it activates,
rather than counting as taken the moment it is swallowed.

Finished when the swallow stays inside the field at every phase, reads as
width rather than descent, and a power-up's effect begins at the centre. The
last of those is sim timing and belongs in `hashWorld` if it becomes state.

## TWO FILES AT THE CEILING, AND EVERYTHING WANTS TO ADD TO THEM
_claude/burn-teach-split-t1 · packages/sim/src/world.ts packages/sim/src/beat.ts packages/sim/src/step.ts packages/sim/src/wave-start.ts packages/sim/src/index.ts_

`packages/sim/src/world.ts` and `packages/sim/src/beat.ts` are both **exactly 249 lines** against CLAUDE.md's ~250 ceiling, and every lane after this one edits both. Split them first, with no behaviour change at all.

Two cuts, each with a precedent in the file's own history. `beat.ts` splits along the seam it already has a comment for: `onBeat` is the shape of a beat, `startWave` (and its private `installWarden`) is the shape of a wave beginning — move the second pair into `packages/sim/src/wave-start.ts`, which leaves `beat.ts` around 145 lines. `world.ts` splits the way `commands.ts` was already split out of it ("`step` is the shape of a tick and this is the shape of a command"): `step`, `regenerateHull` and `progressWave` go to `packages/sim/src/step.ts`, and `world.ts` keeps the `World` interface, `MILLI`, `createWorld` and `hullPercent`. Re-export from the old paths so no import site in `sim`, `render`, `content`, `apps` or `tools` has to move, or move them all — either is fine, but say which in the commit.

The one judgement is where to cut and it has a precedent, so behaviour must not change: this is a constraint, not a decision. Finished when `bun run check` is green, every file is under 250 lines, and `git diff --stat` shows no line of logic altered — only moved.

Model `sonnet`, effort `think`. Think about which callers import `startWave` and `step` by name before you move anything; a missed re-export is the only way this lane can cost a second turn.

Model `sonnet`, effort `think`. Read `docs/teaching.md` first — it is the design this lane implements.

## FOUR FIELDS THE FINGERPRINT HAS NEVER SEEN, AND THE ONE ABOUT TO BE BRANCHED ON
_claude/burn-teach-hash-t2 · packages/sim/src/hash.ts packages/sim/test/hash.test.ts_

`world.guardTick`, `world.intakeTick`, `world.wardUntilTick` and `world.lastFireTick` are not in `hashWorld`. Check it: `hash.ts` pushes `cannonCol`, `shieldCol`, the grips and `primeTick`, and none of the four. That is cosmetic today, because nothing branches world evolution on them. It stops being cosmetic in the next lane, where a call's `need` is `guard` or `fire(color)` and the **simulation decides whether the field advances** by reading them — a device that disagrees about `guardTick` then disagrees about whether the world ticked, which is a desync that reads like a network bug.

Push all four, in canonical order, beside `primeTick`. Then a test that two worlds differing only in one of the four differ in fingerprint — the shape `briefing.test.ts` already has for the card. Check as you go that nothing pins a hash number: `docs/decisions.md` #19 says replay tests compare two runs and never pin a number, so this should break nothing, and if something does pin one, that is the real finding and it goes in the commit message.

Why `opus` on five lines: `docs/choosing-a-model.md` §5 names "a field added to a hash two devices compare" as the expensive-to-unpick category by name. The cost of being wrong here is not the five lines, it is the ordering and the omission.

Finished when `bun test` and `bun run test:determinism` are green and the new test fails if any one of the four pushes is deleted.

Model `opus`, effort `think hard`. Think hard about whether the four are the whole list — walk `World` field by field and say in the commit which fields are deliberately still out and why.

Model `opus`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.

## THE SPEC SAYS TO BUILD EIGHT PANEL SCENES, AND NOBODY SHOULD
_claude/burn-teach-spec-t3 · docs/spec/calls.md docs/spec/briefings.md docs/parked.md docs/INDEX.md_

Write the design down before it is built, because the thing it replaces is currently an instruction sitting in the spec.

**`docs/spec/calls.md`, new.** THE CALL: a teaching wave is an ordinary `Wave` plus `lesson?: LessonId` from a closed list of three; the script is `CALLS: Record<LessonId, Call[]>` in content, a `Record` over a closed list so a lesson shipping without a script is a type error, exactly the discipline `BRIEFINGS` already uses. A call's `beat` is a **`waveBeat`**, always. The freeze is `onBeat`'s field half, not a fourth early return in `step`, and the reason is that the release is the real play. The `need` vocabulary and the anchor vocabulary, both closed lists. The two escalation stages, 16 beats and 32. And the rule that earns a test: **a call never resolves to the same subject on both screens**, with `beats` the single exemption because systems.md 5.2 lists the shared clock as the row of the split table that is deliberately not split.

**`docs/decisions.md` #23.** Why a lesson is a field on `Wave` against #18 (choreography is not derivable; `boss: { kind: "mirror", rounds }` already sits there; the derivable half — whether a lesson has been taught — stays derived as a bit in `world.brief`). Why the freeze is inside `onBeat`. Why there is no timeout and no SKIP button. A `Reconsider if:` naming the case where it breaks: a pair who reliably lock-pick a `cannonIn` gate by stepping columns, which is cheaper than talking and is not closed by anything here.

**`docs/spec/briefings.md`.** Strike §3.2 — the eight scene functions, the `Field` split out of `Layout`, the panel-sized `hull-frame.ts` — and say what replaced it and why: its own load-bearing requirement is satisfied by never building a diagram. Restate §1's "Before wave" column, now stale by three. Narrow §3.7 to the rail mark. Leave §3.1, §3.3–§3.6 alone: the card survives unchanged.

**`docs/parked.md`, two sections.** First: **waves 1–3 can be cleared in silence.** `drawCreatures` in `canvas2d.ts:188` is unconditional, so once a body is on the field both screens have it in full, and only the 6-beat radar lead is one-sided. The teaching waves are authored so no call ever claims otherwise — every line is about a *strip* or a *control*, never about a body — but the residual is real and the strongest version of this ships with one body in FIRST STEP or TWO COLOURS made genuinely one-sided. That is a change to the shipped information model and it is not decided, so it is parked and not queued. Second: **`forgetBriefings` fires on every room join.** It is called from exactly one place, `startTogether()` in `apps/game/src/main.ts`, which runs on `link.onStart` — so the "returning pair" skip is session-scoped, and a pair who put their phones down and picked them up tomorrow pay the full tax again. The save file briefings.md §3.6 already names is the answer and nothing here builds it.

Finished when `bun run check` is green and `docs/INDEX.md` lists the new page.

Model `sonnet`, effort `think`. The decisions are made in this plan; the work is writing them so a session three months out does not re-open them. Do not invent mechanism the other lanes have not been told to build.

Model `sonnet`, effort `think`. Read `docs/teaching.md` first — it is the design this lane implements.

## THE FIELD STOPS ON AN AUTHORED BEAT AND THE CLOCK DOES NOT
_claude/burn-teach-call-t4 · packages/sim/src/call.ts packages/sim/src/commands.ts packages/sim/src/hull.ts packages/sim/src/briefing.ts packages/sim/src/events.ts packages/sim/test/call.test.ts packages/sim/test/purity.test.ts packages/audio/src/bind.ts packages/audio/src/catalogue.ts packages/audio/test/bind.test.ts_

The mechanism. Sixteen files, but nine of them are one or two lines each and the mechanism itself is one new file — `packages/sim/src/call.ts`. Read `docs/spec/calls.md` (lane 3) first; it is the design this implements.

**State.** `world.call: { lesson, index, sinceBeat, latch, p1Col, p2Col, stage } | null` — seven integers. `p1Col`/`p2Col` are `cannonCol`/`shieldCol` as they stood at the last beat boundary, and they exist because `cannonIn(n)` means "rested across a beat boundary", which needs a remembered previous column. `stage` is 0 / 1 / 2 for the escalation. Plus `world.lesson: number` (a `LESSONS` index or -1) and a `taught` integer added to the `Briefings` interface — put it there rather than beside it, and `forgetBriefings`, which already does `world.brief = newBriefings()`, clears it for free. Every one of these into `hashWorld`, beside `world.brief` and `world.interlude`, for the identical reason both are there: **a call decides whether the field advances**.

**The freeze.** `callHolds(world)` guards only the spawn/fall/boss/pod/hull block inside `onBeat`; `world.waveBeat` does not increment and `world.beat` does, because `beatMetronome` is already `onBeat`'s first line and was factored out for exactly this. Commands, bullets, grips and the metronome all keep running — the release is the real play. `cleared` gains `&& world.call === null` so a wave whose lesson is unfinished cannot clear out from under it. `startWave` installs the lesson and clears any call.

**The needs.** `cannonIn(col)`, `shieldIn(col)`, `guard`, `fire(color)`, `gone`, `none`. Both halves must be true **on the same tick** — THE FORK's overlap rule, evaluated in sim from the world, not raced between two arrivals. `guard` and `fire` are latched in the bitfield because they are instants; that is why lane 2 had to land first.

**The escalation, and this is where D2's best idea is repurposed.** Split `applyCommand` into a hold check plus `runCommand`. At 16 beats unanswered, `stage` goes to 1 and the other seat's line stops being redacted. At 32, `stage` goes to 2 and the ship **performs the outstanding half itself** through `runCommand`, so it can never demonstrate a gesture a player cannot make and the band draws itself being pressed with no new code. Do **not** add `seatFor`: `applyCommand` ignores `timed.player` for everything but `grip`, the script authors which half is whose, and a `seatFor` in sim would be a second copy of a rule that already lives in `render/src/touch.ts` as a hit test no regex can match.

**The hull, and this is the bug two designs walked into.** `applyHullDamage` honours `cfg.hullInvulnerable`, but `breachHull` pushes the `Scar` and the `breach` event **outside** that guard (`hull.ts:254-255`). So: guard `applyHullDamage` on `world.lesson >= 0` as well — world state, hashed, never a mid-run mutation of `cfg`, which `hashWorld` does not cover at all. Keep pushing the event, so the crack draws and the impact sounds. And clear `world.scars` in `startWave` when entering or leaving a lesson wave, so three teaching cracks do not walk into FIRST STEP.

**Forced tail.** One new `SimEvent`, `{ type: "call"; index: number; open: boolean }`. `packages/audio/test/bind.test.ts` reads the union out of `events.ts` and requires a sound for every member, so this is a checked addition, not an optional one: a cue in `bind.ts`, an entry in `catalogue.ts`, a sample in the test's `SAMPLES` map. Two people looking at two phones need to hear that the other screen changed.

**Purity.** One new `COPIES` row for `callHolds`, so a second hold cannot be spelled out by hand in `beat.ts`.

**Tests.** `packages/sim/test/call.test.ts` runs a whole lesson headless with `{ ...DEFAULT_CONFIG, ...PAIR_ON }` — and note that `test:determinism` does **not** cover this for free: the gate is `cfg.briefings`, off in `DEFAULT_CONFIG`, so the determinism run plays the teaching waves as plain short waves with no call in them. Prove: the field holds and the clock does not; a satisfied need passes without drawing; both halves are needed; a sweep does not trip `cannonIn`; the two escalation stages fire at 16 and 32; the hull takes no damage and leaves no lasting scar; and two worlds disagreeing about a call disagree about their fingerprints.

`startWave` takes `lesson` with a `null` default so no existing call site breaks and this lane stays green on its own. Finished when `bun run check` and `bun run test:determinism` are green.

Model `opus`, effort `ultrathink`. **ultrathink about what two devices can disagree about while a call is open** — that is the part that is expensive to unpick later, and it is why this is the one `ultrathink` in the batch. In particular: whether every field that decides the release is in `hashWorld`, and whether a command already in flight from `inputDelayTicks` ago can land on a tick where one device thinks a call is open and the other does not.

**Behind t1 and t2, not beside them.** The files this lane's work lives in —
`world.ts`, `beat.ts`, `hash.ts` and whatever t1's split leaves behind — are
being reshaped by those two first. It adds to them; it does not own them.
Starting it early means authoring against a layout that is about to change.

Model `opus`, effort `ultrathink`. Read `docs/teaching.md` first — it is the design this lane implements.

## SEVEN WORDS A SCREEN, AND THE THREE WAVES THEY BELONG TO
_claude/burn-teach-script-t5 · packages/content/src/calls.ts packages/content/src/wave-types.ts packages/content/src/waves.ts packages/content/src/interludes.ts packages/content/src/queue.ts packages/content/src/index.ts packages/content/test/calls.test.ts apps/game/src/waves.ts tools/director/src/serialize.ts tools/director/src/rail.ts tools/director/src/stage.ts tools/director/test/serialize.test.ts_

The words and the waves. `theThreeWaves` in the plan this lane came from has every entry, every call, every beat and every line already decided — author them, do not re-decide them.

**`calls.ts`, new.** `CALLS: Record<LessonId, Call[]>` over the closed list in `sim/call.ts`, so a lesson shipping without a script is a type error. `buildLesson(waveIndex)` beside it, the sibling of `buildBoss`, and a `callsFor` that remaps a call's authored columns through **`mapCol`** — a call's `col` and the entry it points at must not be able to land in different columns on an 11-column field, and `mapCol` is called, never re-derived.

**`waves.ts`.** WAVE 0 · ONE OF YOU CAN SEE IT, WAVE 1 · COLUMN AND BEAT, WAVE 2 · WHAT TO CALL THEM, at indices 0, 1, 2. Each has its one sentence (`docs/spec/wave-design.md` 8.3) and none of them is padding. `wave-types.ts` gains `lesson?: LessonId` with the comment saying why it is not the `briefings:` field decision #18 refused.

**`interludes.ts`.** `GAPS[10]` becomes `GAPS[13]`. Three insertions shift every index by three, and `interludeDue` compares `interludeDone !== wave`, so getting this wrong opens THE GAUGE in front of the wrong wave with nothing failing.

**The director is forced, not optional.** `serialize.ts` regenerates `waves.ts` field by field and silently drops anything it does not know, and `serialize.test.ts` compares its output against the real file — so the moment a `lesson:` field exists, that test **fails** until `serializeWave` round-trips it. Match Biome's formatting exactly, the way `textField` already does. Add a rail mark for a teaching wave beside the way `♛` marks a boss, and thread `buildLesson` through `stage.ts` and the two `startWave` calls in `apps/game/src/waves.ts`.

**`packages/content/test/calls.test.ts` is the only defence against this becoming the wall of text it replaces.** Four assertions, three of them lifted straight from `render/test/briefing.test.ts` which already runs them over `BRIEFINGS`: no line over **seven words**; no line empty; no call telling both screens the same thing; and **no call resolving to the same subject on both screens**, with `beats` the single exemption. Plus one of its own: every authored `col` is `<= AUTHORED_COL_MAX`, so nobody types a real column into a call.

Two authoring rules that are not negotiable and are easy to break. **Every line is about a strip or a control, never about a body** — "only your strip has this" stays true forever, "only you can see it" is false in five beats, because `drawCreatures` is unconditional. And **anything both screens would carry belongs in `hint`, not in a call**; the banner already shows `hint` on both for 5.5 s.

Finished when `bun run check` is green, `bun run dev` shows the three waves in the rail with their marks, and a save round-trip through the director leaves `waves.ts` byte-identical.

Model `sonnet`, effort `think hard`. **Think hard about the word count and the anchor rule before you write a single line** — those are the two things that will slip, and the test has to be written first so they cannot.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.

## A BRACKET, FIVE WORDS, AND A CHEVRON POINTING AT THE OTHER PHONE
_claude/burn-teach-draw-t6 · packages/render/src/call.ts packages/render/src/redact.ts packages/render/src/briefing.ts packages/render/src/canvas2d.ts packages/render/src/index.ts packages/render/test/call.test.ts_

The picture, and it is small on purpose: **nothing here animates anything the game does not already draw.** The blip hanging on the strip is `drawRadar` with `waveBeat` frozen — `field.ts:135` derives height as `q.beat - (world.waveBeat - 1)`, so the animation *is* the radar, held still, and this lane writes none of it. The lobe sliding under the target is the real membrane, the real `Glide`, the real `blobPath`. The shot, the pop, the crater, the deflection flash and the crack are all real events through the existing `Effects`, because bullets and the hull keep working during a freeze. What this lane draws is the pointer.

**`call.ts`, new, ~120 lines.** `drawCall(ctx, layout, world, role, call)` — a pure function of a `Call`, exactly as `drawBriefing` is a pure function of the world, so it holds nothing across frames, `Effects.reset()` gains nothing to clear and `restart.test.ts` stays green without an edit. Anchor resolution per role against `Layout`: `beats` and `hull` (both screens); `column(n)` and `body` (both — `drawGrid` and `drawCreatures` are not role-gated); `strip` (this screen's own radar strip, role-relative by construction); `radar(n)` (real on the owner's screen); `fire(color)` (p2 and `test`, off `layout.fireButtons`); `trigger`, `maw`, `lance` (p1 and `test`); `cannon`, `shield` (off `showsCannon` / `showsShield`); `mark(n)`, an amber column marker standing on the grid on one named screen only — the `pod` amber this game already spends on "here, this is the thing"; and **`elsewhere`**, which is not a place on this screen at all: a chevron at the stage edge pointing at the other phone, with the other seat's line beneath it as grey word-shaped bars.

**`redact.ts`, new.** Lift `redact()` out of `briefing.ts:146` into its own file with two callers, so they cannot drift. It is the piece the card already invented and explained: a single grey bar says "something is hidden", a row of word-shaped bars says "they are holding a sentence you need", which is the thing that makes somebody read theirs out loud. A chevron turns it into a direction.

**Format discipline, drawn.** One line, in the seat's own colour, beside its bracket — never in a panel, never centred, because the eye has to go to the thing. At 375 px portrait that is one line of 11 px Courier and a 2 px bracket. The bracket breathes on `beatPhase`, which is already in `ViewState` and identical on both devices, so even the pointer is on the beat. On the `test` role, stack both halves prefixed `1·` and `2·` so a desk tester and the director see the whole of what the pair sees between them, and resolve `elsewhere` to nothing there.

**Wiring.** One contiguous line in `canvas2d.ts`, over the pause overlay and under the card, drawn from `CALLS` via the helper the content lane exports. `canvas2d.ts` is owned by nobody — add in one region and expect to replay over somebody else.

**Test.** `packages/render/test/call.test.ts`: every call in the catalogue, every role, through the strict canvas stub that refuses what a real canvas refuses — including a screen too narrow for a word, and a `radar(n)` anchor on the screen that does not own that strip. Build `Call` fixtures by hand so the file is complete before the catalogue is.

**Land after the content lane**, which owns the catalogue the wiring line reads; if both finish together, rebase onto it and the wiring is your last commit.

Finished when `bun run check` is green, `bun run preview` shows a call on both seats at 375 px, and `restart.test.ts` is untouched.

Model `sonnet`, effort `think hard`. **Think hard about `elsewhere`** — it is the one anchor with judgement in it, and it is what turns "my screen is missing something" into "ask them". Everything else on this list is a bracket.

Model `sonnet`, effort `think hard`. Read `docs/teaching.md` first — it is the design this lane implements.
