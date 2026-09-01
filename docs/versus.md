# VERSUS — two answers to one shape, side by side

How a candidate look is offered, compared against what the game draws today,
and adopted or refused. Designed 27 August 2026 by three independent proposals
scored by three judges under different lenses; this file is the synthesis, and
`docs/queue.md` carries the lanes that build it.

The thing it exists for is a question a still cannot answer and a card-sized
render cannot answer either: **does this read at 26 px, and does it read at
tempo.** Everything below is arranged around not lying about that.

## The decision

Build **VERSUS** (proposal 1): a candidate look is a set of field assignments patched onto records `packages/content` and `packages/render` already export, living in `tools/versus/`, which nothing in the game's import graph names. The director grows a VERSUS tab on the backlog sheet that steps **one** `World` and draws it twice in the same frame through two `Canvas2DRenderer`s at 380 × 820 CSS pixels uncapped — left is what the game draws, right is the same code with the patch applied around `draw()` and restored in a `finally` — so the only thing that can differ on screen is the patch. `Math.random` is seeded to the same value for each side of a frame, because `sparks.ts` and `deflect.ts` randomise four values per spawn each and without it two identical looks draw different pixels. A vote presses one of two buttons, `KEEP CURRENT` or `ADOPT <the one on the right>`, and writes nothing anywhere: it builds a prompt from the registry plus the current values read off the live records *before* the patch is applied, puts it on the clipboard, and renders it into a selected `<textarea>` you can read before you paste it. Three verified corrections to the proposal as submitted: `tools/versus/` is a **plain directory** with a `test/` beside it, exactly like `tools/checks`, `tools/burn`, `tools/handoff` and `tools/land` — not a workspace package, so no `bun install` and no `package.json`, and `tsconfig.json` already includes `tools/**/*.ts` so it is typechecked and linted for free; the prompt builder lives in `tools/versus/prompt.ts` rather than the director, because it is pure string work that deserves a test with no DOM in it; and there is **no** `GET /api/versus` — the head sha and the dirty flag become two fields on the `ChecksView` the director already fetches from `/api/checks`. The emitted prompt gains three things proposal 1 did not have and needed: `bun run shapes` plus the two committed SVGs in the staging list whenever a patched target lives in `packages/content` (I confirmed `tools/shape-sheet/shape-sheet.svg` is committed and contains the literal string `9 lobes` for BULB, so adopting a bulb candidate without it leaves a committed lie that `bun run check` cannot see), a `git grep` for every reader of each patched symbol emitted **with no predicted answer**, and a candidate that is a directory removed by `git rm -r` rather than a file.

## Why this one, and what was grafted from the others

VERSUS wins on the one thing the mechanism exists for. Proposal 3 is the most repo-fluent of the three and has the best-researched prompt, but its two stages cannot show two animated versions at phone size, and I checked both in the files it proposes to reuse unchanged: `tools/director/src/shape-figure.ts` computes `scale = Math.min((w - pad)/(b.x1-b.x0), (box - pad)/(b.y1-b.y0))` and fits every contour into a frame, so its card stage never draws anything at 26 px; and `tools/director/src/pose-art.ts`'s `frameWorld` draws `SETTLE = 40` frames, keeps one, and calls `renderer.dispose()`, so its field stage — the only honest-size one — puts a frozen incumbent beside a 60 fps tool-painted candidate. A moving thing beside a still thing is not an A/B of motion, and `own-motion.ts` says in its own docstring that at 26 px motion is most of what a player has. Proposal 2 dies three times over: `packages/render/alt/**` is outside every glob in `purity.test.ts`'s COPIES sweep (`packages/*/src/**`, `apps/*/src/**`, `tools/**`), so candidate draw code would sit in the one directory in the repo the re-derived-rules guard cannot see; `canvas2d.ts` is 245 lines and `effects.ts` is 241, so threading a `Looks` record through both forces splits in the two most load-bearing render files to serve a tool; and `packages/render/src/index.ts` exports none of the layer functions its sheet is made of. What I grafted, in order of value. **Proposal 3's `bun run shapes` step**, promoted from a sentence somebody remembers to a rule the builder applies: any patch whose `where.file` starts with `packages/content/` appends the command and the two SVG paths. That fixes proposal 1's one verified defect. **Proposal 3's grep, with the answer deleted** — its own prompt asserted "Nothing else reads METEOR" and I confirmed `craters.ts` (lines 125–127 and 188–192), `deflect.ts:85`, `torch.ts`, `creatures.ts` and `queen-figure.test.ts:82` all read it; emitting the command with no predicted result turns the fatal case into a working guard, and it costs one line. **Proposal 2's BLINK** — two canvases in perfect registration alternating at 1 Hz — because side by side is the weakest way to see a small difference and it is the headline mode; note that blink only works because proposal 1 seeded the random stream, so each proposal held one half of a working blink. **Proposal 2's two bundling invariants as tests** (every candidate in a slot patches the same target/field set; a target field appears in at most one open slot) and **proposal 2's expiry rule** (a slot undecided by the end of the session that opened it goes to `docs/parked.md` and its directories are `git rm`'d), which is the only real answer to silting anywhere in the three. **Proposal 3's reference-identity test**, generalised and made stronger: for every patch target, assert the game's own accessor hands back the identical object — `expect(livingSilhouette("bulb")).toBe(BULB)` — so the day somebody breaks the aliasing the monkeypatch rests on, `bun test` says so instead of the pair quietly drawing a lie. **Proposal 2's blast-radius line**, moved to where a filesystem exists: `bun run versus` prints each open slot with its derived reader list; the browser cannot derive it and should not pretend to. And **proposal 1's opening trailer** paired with proposal 3's dictated closing one, so a slot's whole life sat on one list rather than two. (That list was the `Check:` mechanic, since removed — a slot's life is now the vote and the release note it lands with. The rest of this paragraph stands.) Rejected, with reasons. A `looks-clock.ts` at 96 BPM: the pair steps a real `World`, which already has `cfg.bpm` and a beat, so the tempo question is answered natively — and `docs/parked.md`'s "The Throb's swell cannot be judged in the tool built for judging swells" is about the *shape sheet*, not this, so claiming it as discharged would be a false entry on a list whose only value is that everything on it is real. The pair gets a rate multiplier and a pause, not a new clock file. Proposal 3's `localStorage` "leaning": it is a stored decision inside a design that argues for three paragraphs that nothing should be stored, and no code can enforce the distinction between a leaning and a vote. Proposal 2's seam in shipped code, on the grounds above. And a `POST` route or a votes file, which all three proposals independently refused. Two costs I am not glossing. `Object.assign` on a live module export is a monkeypatch: I checked that nothing in `packages/content/src` or `packages/render/src` calls `Object.freeze`, that `drawLiving` reads `shape.rx` per call, that `livingMotion(kind).poseAt(t)` is a per-frame method call, and that `apps/game/src/menu-view.ts:203` destructures BULB *inside* `draw` rather than at module scope — so it works today, and the identical-pixels guard turns the day it stops into a visible refusal rather than a picture that lies. And most of the interesting cases still need a lifting commit first: `drawDetails`'s `isBulb` branch is a hardcoded if/else, `layout.ts`'s two button arrays are literals, `Sparks.burst`'s physics is inline. That is the mechanism's real price and it is why the first three slots are deliberately the ones that need no lift at all.

## The prompt a vote emits

A vote writes nothing. It builds this text, puts it on the clipboard, and
renders it into a selected textarea so it can be read before it is pasted. The
session that receives it adopts the winner and deletes the loser.

This is the literal text `ADOPT bulb-deep` puts on the clipboard for slot `creature:bulb`, with `bulb-fine` as the loser and the reason typed into the field before pressing. Every value in it was read out of the tree today: BULB is `lobes: 9, depth: 0.1, wobble: 0.055`, and `SWAY_PUMP.poseAt` is `sin(t * 1.9)` / `sin(t * 3.1)` with `dx: swing * 0.17`.

---

Neon Spore, on `main`. Two candidate looks for the bulb were drawn side by side
in the director's VERSUS tab — one world, one frame, animated, both sides
through the shipping renderer at 380 x 820 CSS pixels, uncapped — and one was
chosen by eye. Adopt the winner, remove every candidate in the slot, commit.

    slot    creature:bulb
    won     bulb-deep  -  "six deeper lobes and a slower, wider sway"
    lost    bulb-fine  -  "twelve shallow lobes, the pump doubled"
    why     six deep lobes still read as lobes at 26 px; twelve fine ones were
            a circle with a texture on it
    voted   2026-08-27, against 2576c56, tree clean

**0. BEFORE ANYTHING ELSE.** Every change below is written `old -> new`. If a
left-hand value is not what the file says right now, this prompt is stale — the
record moved after the vote, or the candidate did. Stop, and say which value
disagreed and what it says instead. Do not work out which is newer, do not
adopt the spirit of it, and do not re-run the comparison yourself.

**1. ADOPT `bulb-deep`.** Two files, both under `packages/content/src`, and
these values are the whole of it.

  (a) `silhouettes.ts`, `export const BULB: CreatureSilhouette`

          lobes    9      ->  6
          depth    0.1    ->  0.19
          wobble   0.055  ->  0.07

      `rx`, `ry` and `seed` do not change. The doc comment directly above BULB
      is the file's claim about the shape, not decoration — read it, and if
      this change makes any clause of it false, rewrite that clause. Do not
      delete it, and do not leave it standing if it is now wrong.

  (b) `own-motion.ts`, `export const SWAY_PUMP: OwnMotion` — replace the body
      of `poseAt` with exactly this, which is what the right-hand phone was
      drawing:

          poseAt(t) {
            const swing = Math.sin(t * 1.45);
            const pump = Math.sin(t * 2.6);
            return {
              dx: swing * 0.21,
              dy: 0,
              rot: swing * 0.2,
              sx: 1 + pump * 0.13,
              sy: 1 - pump * 0.13,
            };
          },

      `name` and `note` are not part of this change. Do with the note what you
      did with the comment: "slow sway, faster pump, volume held" has to still
      be true of the numbers above, and in particular the `sx`/`sy` pair has to
      still be symmetric, because that symmetry is what "volume held" means.

**2. FIND THE READERS THE VOTE DID NOT SHOW YOU.** Run both, and read the
output rather than watching it exit:

        git grep -n "\bBULB\b" -- packages apps tools
        git grep -n "\bSWAY_PUMP\b" -- packages apps tools

Every hit is a reader of a record this prompt just changed. The two files under
step 1 are the ones it changed on purpose. For each of the others decide only
this: does it draw the bulb somewhere the vote did not show — a menu, a sheet,
a card, a test that pins a number? Name what you find, in the report and in
step 7's commit body. Do not "fix" any of them, and do not add a second record so
that one of them can keep the old numbers.

**3. REGENERATE WHAT IS DERIVED FROM THEM.**

        bun run shapes

`tools/shape-sheet/shape-sheet.svg` and `tools/shape-sheet/motion-sheet.svg`
are committed files built from these records, and the first of them currently
contains the words "9 lobes". A derived artefact that is committed goes stale
in silence, so run this and stage whatever it rewrites. If it rewrites nothing,
stage nothing — that is a correct outcome, not a failure.

**4. REMOVE THE SLOT.** All of it, the winner included. "Removed" means,
exactly:

        git rm -r tools/versus/candidates/creature-bulb.deep
        git rm -r tools/versus/candidates/creature-bulb.fine

— the whole directory each time, not the one file you can see, because a
candidate may have grown a helper beside it. Then, in
`tools/versus/candidates/index.ts`, delete the two `import` lines that named
those directories and the two entries they contributed to the `VARIANTS` array.
Nothing else in the repository refers to either directory; if the typecheck
says otherwise, that is a real finding — report it, do not add an export to
satisfy it.

The winner's directory goes too. Its numbers live in `packages/content` now,
and a second copy of them in the tool is the drift this whole arrangement
exists to prevent.

If `VARIANTS` ends up empty, leave it as an empty array and leave the file.
`tools/versus/variant.ts`, `seed.ts`, `prompt.ts`, `run.ts` and
`candidates/index.ts` all stay whether or not a slot is open — they are the
seam, not scaffolding, the way `Effects` stays whether or not anything is
exploding.

**5. WHAT NOT TO DO.**

- Do not touch `packages/sim`. Nothing here is visible to the simulation and
  nothing here may become visible to it.
- Do not add a variant flag, a second silhouette, a config field, an optional
  argument or an `if` anywhere in `packages/render` or `packages/content`. The
  game drew one bulb before this and draws one bulb after it. If you find
  yourself typing the words `variant`, `candidate`, `current`, `deep` or `fine`
  into either package, the instruction has been misread.
- Do not touch `rx`, `ry`, `seed`, `sizeMul`, or `livingSilhouette` itself. The
  obvious next thought after "deeper lobes" is "and a bit bigger", and size is
  a different question that nobody voted on.

**6. CHECK.**

        bun run shapes:report
        bun run check

`shapes:report` prints BULB's geometry as numbers, and the bulb should come
back measurably deeper-lobed and less round than before — read the output, do
not just watch it exit 0. `bun run check` is the typecheck, biome and the full
suite, including `packages/content/test/own-motion.test.ts`, which holds spec
5.8's quarter-tile lane limit against the new `poseAt`, and
`packages/render/test/frame.test.ts`, which draws whole frames through a canvas
that refuses a NaN coordinate or an unparseable colour.

**7. COMMIT,** on CLAUDE.md's four conditions. Stage only these paths:

        packages/content/src/silhouettes.ts
        packages/content/src/own-motion.ts
        tools/versus/candidates/index.ts
        tools/versus/candidates/creature-bulb.deep/     (deleted)
        tools/versus/candidates/creature-bulb.fine/     (deleted)
        tools/shape-sheet/shape-sheet.svg               (if step 3 rewrote it)
        tools/shape-sheet/motion-sheet.svg              (if step 3 rewrote it)

The subject is a sentence in this history's voice. The body carries the `why`
line above verbatim and names what lost — that sentence is the only durable
record of the decision, so do not compress it to "adopt bulb-deep".

Readers step 2 turned up that the vote did not put on either phone are named
in the commit body — for this record that is the title screen, which draws
BULB's contour itself in `apps/game/src/menu-view.ts` and was never on screen.
Name it in a sentence and move on: it is a place worth glancing at, not an
obligation, and the release note carries the sentence forward on its own.

How the bulb reads on the field is not named at all. That is what the vote
was: at true size, at tempo, beside the thing it replaces.

---

**`KEEP CURRENT` emits the same text with five differences and no others:**
`won` reads `current — nothing changes in packages/content`; `lost` names every
candidate in the slot; steps 1, 2, 3 and 6's `shapes:report` line are gone, and
step 6 keeps `bun run check`; step 7 stages only `tools/versus/candidates/index.ts`
and the deleted directories. Step 0, step 4 and
step 5 are word for word the same. A keep is an adoption whose file list happens
to be empty, and making it look like a different, easier kind of job is exactly
how a decided slot survives on the sheet with a vote button still under it.

## Where to point it first

Bias the first slots to what is on screen in every frame of every wave and needs no lifting commit, because the mechanism's real price is the lift and the first three votes should not pay it.

**1. `ship:hull-skin` — `OWN_SKIN` in `packages/render/src/hull.ts`.** Four body stops, a rim, an edge and a muzzle colour, and that is the whole of a ship's appearance: the file's own comment says everything else about a hull — contour, lobes, sheen, how damage hangs off it — is the same for every ship there will ever be. It is the player's own ship, at the bottom of the field, in every frame they ever see, and `MIRROR_SKIN` sitting directly beneath it already proves a whole reskin is a pure record swap with no branch anywhere. Zero lift, highest look-count, and it is the fixture lane 1 is written against, so it is also the first vote by construction.

**2. `creature:bulb` and `creature:slick`, one slot each.** `BULB` (`lobes: 9, depth: 0.1, wobble: 0.055`) and `SLICK` (`lobes: 2, depth: 0.38, wobble: 0.02`) in `silhouettes.ts`, each patched together with its own-motion — `SWAY_PUMP` and `TILT_RIPPLE` in `own-motion.ts`. These are the two bodies a player reads on the field, at 26 px, while somebody is talking at them, and `own-motion.ts`'s own docstring makes the case better than I can: two blobs with the same lobes read as different creatures because one swings and the other shivers, and at that size that difference is most of what a player has. Both are pure record patches with no lift. The one constraint is timing — `claude/burn-own-motion-b10` is sitting in the queue owning `own-motion.ts`, so these wait for it.

**3. `palette:ammo-pair` — `PALETTE.red` / `redRim` / `redDark` and `cyan` / `cyanRim` / `cyanDark`.** Six tokens, one slot, because red and cyan are a pair: they are the two ammunition colours, every creature wears one, every button is one, every spark is one, and a vote on cyan alone is a vote on a thing nobody sees alone. No lift; the only cost is a cast in `apply()` because `PALETTE` is `as const`.

**Named, and deliberately not first.** The control band — `drawBand` and the two literal button arrays in `layout.ts` — is where the player's hands live and is looked at more than anything except the hull, but its geometry is hardcoded literals rather than a record, so it needs a lifting commit of its own before any vote is possible and should not be what proves the mechanism. And the five meteor tiers, which is the sharpest finding in the survey and the case the mechanism should be *tested against* rather than started on: `METEOR` is read directly by `craters.ts` (twice), `deflect.ts`, `torch.ts`, `creatures.ts` and `queen-figure.test.ts`, so a vote on it changes five things the pair never puts on screen — exactly the case the prompt's `git grep` step exists for, and worth running once the three easy slots have been through the whole loop.

## What this plan could not decide

**Does `tools/versus/` resolve `@neon-spore/render` as a plain directory?** There is no `node_modules` in this worktree so I could not test it. Bun hoists workspace links to the root, and `tools/checks`, `tools/burn`, `tools/handoff` and `tools/land` are all plain directories, but none of them imports a workspace package. Lane 1 tries the plain form first; if it does not resolve, it adds a minimal `tools/versus/package.json` naming render, content and sim — at the cost of a `bun install` in every fresh worktree forever, which is why it is the fallback and not the plan.

**Should BLINK be the default rather than side by side?** Judge 2 is right that blink is much better at catching a small difference and that a sheet's default is what most people use; side by side is better for a change with a large silhouette difference and is what people expect. I have set side by side as the default with blink one toggle away. It is a one-line change either way and it should be decided at the pair, on the first real vote, not now.

**Is `PALETTE` a slot or a bigger conversation?** A palette patch is honest — the pair's "only difference is the patch" claim still holds exactly — but the blast radius is the whole screen at once, and unlike a silhouette there is nothing on the field it does not touch. The mechanism supports it; whether a colour that crosses every drawing in the game should be settled by two phones and a button is a judgement about the *design process*, not about the tool.

**When do the lifting commits happen, and are they worth it?** `drawDetails`'s `isBulb` if/else, `layout.ts`'s two literal button arrays, `Sparks.burst`'s inline gravity and life, `drawTorchTail`'s retyped `rgba(255,122,47,…)` where it means `PALETTE.ember` — each becomes votable only by moving a constant or a function onto an exported record in its own prior commit, changing shipped code, reviewed on its own terms. Each leaves the codebase better and the repo has already made this move twice (`livingSilhouette`, `livingMotion`) and written down why. But it means "add a candidate" is sometimes two sessions, and the owner should decide whether to pay for any of them before the mechanism has proved itself on the three slots that need none.

**One thing the design accepts and cannot fix.** A vote cast and never pasted is gone — someone who does the expensive half, the looking, and then loses the clipboard has spent it for nothing. All three proposals argued for this from the same premises and I think they are right, but it is a trade with a losing side rather than a free win, and the mitigation is only that pressing and pasting are one gesture apart and the person is already at a terminal.

## Candidates already written, waiting for the mechanism

A lane that reaches two defensible answers should not pick one and delete the
other — the second answer is the whole input this page exists to consume. But
an unclaimed candidate does not belong in `packages/content` either, which is
what ships. Until `tools/versus/candidates/` exists, they are written here, in
numbers, so that the mechanism has something real to compare on its first day
and so that nothing is recovered from a transcript.

### `creature:throb`

**A — HOLD.** Committed, and what the game draws today. A slow single-axis
drift and nothing else: `dx: sin(t * 0.6) * 0.04, dy: 0, rot: 0, sx: 1, sy: 1`.
Deliberately the smallest motion in `own-motion.ts`, so that `throbOpen`'s
beat-driven swell is the only thing the body is saying.

**B — REST.** Zero own-motion at all. The beat's scale pulse carries the whole
tell alone.

The question between them is whether a body that is *completely* still until
the beat reads as waiting or as broken. That is an eye's question, and it is
the one the outstanding check about the Throb's swell is really asking.

### `creature:runt`

**A — TREMBLE.** Committed. Three incommensurate frequencies, no drift, no
scale change — it never completes a clean rock the way the slick and the bulb
do, which is what says "too small to glide".

**B — STARTLE.** A settle pattern rather than a continuous shiver:
`period 1.8`, `k = p < 0.72 ? 0 : exp(-(p - 0.72) * 16) * sin((p - 0.72) * 50)`,
then `dx: k * 0.05, rot: k * 0.16`.

The lane favoured A and said why: B reads as *alert and waiting* rather than
as *helpless*, and helpless is the whole job — the Runt has to make a player
hesitate. Worth putting to a vote anyway, because "which of these two is more
pitiable at 26 px" is exactly the kind of question an argument cannot settle.

### One thing neither sheet can show

`bun run shapes:report` and `bun run shapes` are byte-identical before and
after that lane, and that is not a bug in the lane. Both sample the contour
wobble in `SUBJECTS` and never call `livingMotion`, so own-motion is invisible
to them entirely; only the director's `bun run shapes:page` draws it. Anyone
comparing these candidates on the still sheet will see no difference at all
and conclude, wrongly, that there is none.

