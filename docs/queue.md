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
_claude/burn-versus-docs-v4 · docs/decisions.md docs/verification.md docs/asset-catalogue.md CLAUDE.md_

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
