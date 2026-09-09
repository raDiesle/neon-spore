# VERSUS — two answers to one shape, side by side

How a candidate look is offered, compared against what the game draws today,
and adopted or refused. Designed 27 August 2026 by three independent proposals
scored by three judges under different lenses; this file is the synthesis, and
The lanes that build it are picked up one session at a time.

The thing it exists for is a question a still cannot answer and a card-sized
render cannot answer either: **does this read at 26 px, and does it read at
tempo.** Everything below is arranged around not lying about that.

## A candidate is static by default — 8 September 2026

**The owner's rule, and it narrows what follows rather than contradicting it.**
A candidate look is offered as a **still picture or an SVG in a fixed state**,
and it animates only when motion is the thing being judged.

This file argues at length that the question a still cannot answer is *does it
read at 26 px and at tempo*, and that argument stands — for the looks it is
about. Timing, phase offset, overshoot, a landing in unison, whether a body
survives at speed: those get the animated pair, and nothing less will do. A
colour, a contour, a material, an interior treatment, an icon or a piece of
furniture does not, and opening an animated slot for one spends the expensive
mechanism on a question a picture settles — and settles somewhere the owner can
look at it on a phone, with no game running.

What stays forbidden either way is **a still judged against something that
moves**, which is the defect proposal 3 is rejected over below. Both sides
animate, or neither does.

### A look that only exists after something moves is watched — 9 September 2026

The owner asked for the crater slot to be shown as *"full animated sequence.
several meteors from different horizontal places crashing into ship and then
removing from there"*, and it sharpens the rule above rather than bending it.
A hole in the hull is as static as a colour once it is there — but it is not
there until a rock has landed in it and rolled back off (`rock-drift.ts`), so
there is no frame of the game that carries the look until something has moved.
Two questions decide it, and both have to answer yes for a still: **is this
look on screen without an event**, and **is one instance of it the whole
question**. A crater fails both — its own candidate says it will be decided by
a hull wearing three or four holes at once — so `ship:crater` is judged live,
on `BREACH · ROCKS COMING THROUGH`, and a candidate whose look is on every
frame regardless still gets the picture.

## Photographing one — 9 September 2026

`CLAUDE.md` says to send the owner a picture, and taking one of a live pair was
a lottery. A pose with a `cadenceSeconds` rebuilds its world on its own clock,
so what was on the frame when `bun run shot` landed depended on when the browser
started and how long the bundle took: four pictures cost six `--wait` values
each, half of them an empty field or a wave already breaking against the hull.
`creature:dart` was worse — its thrust burns for one beat of a two-second
replay, so finding a usable frame took about thirty-five shots **ranked by PNG
file size**, on the reasoning that the frame with a flame on it compresses
worst.

Three flags end that, and the first two ride on `versus.html`'s own query
string:

```
bun run shot .versus-stage out.png --port <p>   --path "/versus.html?slot=creature:throb&name=globe&freeze=1.2&only=candidate"
bun run shot .versus-stage out.png --port <p> --select ".versus-rate=0.25"   --path "/versus.html?slot=creature:dart&name=ember"
```

- **`freeze=<seconds>`** stops the pair after that many *simulated* seconds. It
  is counted in the pair's own ticks and never off the wall, and while a freeze
  is pending the loop runs one tick per animation frame at a fixed `dt` — so the
  number of frames drawn before it lands is the number of ticks asked for and
  nothing else. That is what makes the held frame **byte-identical across runs**,
  which is the whole point: the moment is chosen from what the pose does rather
  than from what the browser happened to be doing. `pair.freeze()` and not
  `setRunning(false)`, so nothing wears a `hud.ts` "PAUSED" caption.
- **`only=candidate`** or **`only=current`** mounts one side at true size,
  instead of a strip of both cropped down to nothing. Both are still *built* —
  the pair steps two worlds and compares them, and the settled banner is that
  comparison.
- **`--select ".versus-rate=0.25"`** turns the pair's own rate picker down.
  Where a slow rate answers the question, it is better than a freeze: at 0.25×
  an ember burning for one beat of a two-second replay stretches past the whole
  window, so *every* frame carries it and no chosen moment is needed at all.

An unrecognised value for either query flag leaves the pair running, which is
the rule the whole page is written to — a stale camera setting must not be able
to hide the candidate. `tools/director/test/versus-freeze.test.ts` is the guard.

**`bun run versus:shot <slot> <name>` is all three in one command.** It starts
the director on a free port, reads the port off its own startup line, opens the
pair and writes the PNG, then stops the server:

```
bun run versus:shot creature:throb globe --freeze 1.2 --only candidate
bun run versus:shot creature:dart ember --rate 0.25
```

It exists because a candidate does not appear in the game by construction, so
`bun run frames` cannot reach one and a session writing a candidate had no way
to see whether its paint drew what it thought. One lane found a throb whose far
half was filled over its own core marks and whose rim glow was clipped at the
contour — both obvious in the first frame, both invisible to `bun run check`
twice over. It is the step *before* "does this read at 26 px", which still
belongs to the owner and two real phones; this one only answers whether the
session wrote what it meant to.

## The decision — 27 August 2026

What follows is the proposal as it was accepted, and two parts of it have since
changed: a candidate is a still by default (8 September 2026), and there is no
vote button and no clipboard prompt (9 September 2026, below). The rest of it
is what the tool still is.

Build **VERSUS** (proposal 1): a candidate look is a set of field assignments patched onto records `packages/content` and `packages/render` already export, living in `tools/versus/`, which nothing in the game's import graph names. The director grows a VERSUS tab on the backlog sheet that steps **one** `World` and draws it twice in the same frame through two `Canvas2DRenderer`s at 380 × 820 CSS pixels uncapped — left is what the game draws, right is the same code with the patch applied around `draw()` and restored in a `finally` — so the only thing that can differ on screen is the patch. `Math.random` is seeded to the same value for each side of a frame, because `sparks.ts` and `deflect.ts` randomise four values per spawn each and without it two identical looks draw different pixels. A vote presses one of two buttons, `KEEP CURRENT` or `ADOPT <the one on the right>`, and writes nothing anywhere: it builds a prompt from the registry plus the current values read off the live records *before* the patch is applied, puts it on the clipboard, and renders it into a selected `<textarea>` you can read before you paste it. Three verified corrections to the proposal as submitted: `tools/versus/` is a **plain directory** with a `test/` beside it, exactly like `tools/checks`, `tools/burn`, `tools/handoff` and `tools/land` — not a workspace package, so no `bun install` and no `package.json`, and `tsconfig.json` already includes `tools/**/*.ts` so it is typechecked and linted for free; the prompt builder lives in `tools/versus/prompt.ts` rather than the director, because it is pure string work that deserves a test with no DOM in it; and there is **no** `GET /api/versus` — the head sha and the dirty flag become two fields on the `ChecksView` the director already fetches from `/api/checks`. The emitted prompt gains three things proposal 1 did not have and needed: `bun run shapes` plus the two committed SVGs in the staging list whenever a patched target lives in `packages/content` (I confirmed `tools/shape-sheet/shape-sheet.svg` is committed and contains the literal string `9 lobes` for BULB, so adopting a bulb candidate without it leaves a committed lie that `bun run check` cannot see), a `git grep` for every reader of each patched symbol emitted **with no predicted answer**, and a candidate that is a directory removed by `git rm -r` rather than a file.

## Why this one, and what was grafted from the others

VERSUS wins on the one thing the mechanism exists for. Proposal 3 is the most repo-fluent of the three and has the best-researched prompt, but its two stages cannot show two animated versions at phone size, and I checked both in the files it proposes to reuse unchanged: `tools/director/src/shape-figure.ts` computes `scale = Math.min((w - pad)/(b.x1-b.x0), (box - pad)/(b.y1-b.y0))` and fits every contour into a frame, so its card stage never draws anything at 26 px; and `tools/director/src/pose-art.ts`'s `frameWorld` draws `SETTLE = 40` frames, keeps one, and calls `renderer.dispose()`, so its field stage — the only honest-size one — puts a frozen incumbent beside a 60 fps tool-painted candidate. A moving thing beside a still thing is not an A/B of motion, and `own-motion.ts` says in its own docstring that at 26 px motion is most of what a player has. Proposal 2 dies three times over: `packages/render/alt/**` is outside every glob in `purity.test.ts`'s COPIES sweep (`packages/*/src/**`, `apps/*/src/**`, `tools/**`), so candidate draw code would sit in the one directory in the repo the re-derived-rules guard cannot see; `canvas2d.ts` is 245 lines and `effects.ts` is 241, so threading a `Looks` record through both forces splits in the two most load-bearing render files to serve a tool; and `packages/render/src/index.ts` exports none of the layer functions its sheet is made of. What I grafted, in order of value. **Proposal 3's `bun run shapes` step**, promoted from a sentence somebody remembers to a rule the builder applies: any patch whose `where.file` starts with `packages/content/` appends the command and the two SVG paths. That fixes proposal 1's one verified defect. **Proposal 3's grep, with the answer deleted** — its own prompt asserted "Nothing else reads METEOR" and I confirmed `craters.ts` (lines 125–127 and 188–192), `deflect.ts:85`, `torch.ts`, `creatures.ts` and `queen-figure.test.ts:82` all read it; emitting the command with no predicted result turns the fatal case into a working guard, and it costs one line. **Proposal 2's BLINK** — two canvases in perfect registration alternating at 1 Hz — because side by side is the weakest way to see a small difference and it is the headline mode; note that blink only works because proposal 1 seeded the random stream, so each proposal held one half of a working blink. **Proposal 2's two bundling invariants as tests** (every candidate in a slot patches the same target/field set; a target field appears in at most one open slot) and **proposal 2's expiry rule** (a slot undecided by the end of the session that opened it is `git rm`'d, its argument kept in the removing commit's message), which is the only real answer to silting anywhere in the three. **Proposal 3's reference-identity test**, generalised and made stronger: for every patch target, assert the game's own accessor hands back the identical object — `expect(livingSilhouette("bulb")).toBe(BULB)` — so the day somebody breaks the aliasing the monkeypatch rests on, `bun test` says so instead of the pair quietly drawing a lie. **Proposal 2's blast-radius line**, moved to where a filesystem exists: `bun run versus` prints each open slot with its derived reader list; the browser cannot derive it and should not pretend to. And **proposal 1's opening trailer** paired with proposal 3's dictated closing one, so a slot's whole life sat on one list rather than two. (That list was the `Check:` mechanic, since removed — a slot's life is now the vote and the release note it lands with. The rest of this paragraph stands.) Rejected, with reasons. A `looks-clock.ts` at 96 BPM: the pair steps a real `World`, which already has `cfg.bpm` and a beat, so the tempo question is answered natively — and the separate complaint that the Throb's swell cannot be judged in the tool built for judging swells is about the *shape sheet*, not this, so claiming it as answered here would be claiming something the pair does not do. The pair gets a rate multiplier and a pause, not a new clock file. Proposal 3's `localStorage` "leaning": it is a stored decision inside a design that argues for three paragraphs that nothing should be stored, and no code can enforce the distinction between a leaning and a vote. Proposal 2's seam in shipped code, on the grounds above. And a `POST` route or a votes file, which all three proposals independently refused. Two costs I am not glossing. `Object.assign` on a live module export is a monkeypatch: I checked that nothing in `packages/content/src` or `packages/render/src` calls `Object.freeze`, that `drawLiving` reads `shape.rx` per call, that `livingMotion(kind).poseAt(t)` is a per-frame method call, and that `apps/game/src/menu-view.ts:203` destructures BULB *inside* `draw` rather than at module scope — so it works today, and the identical-pixels guard turns the day it stops into a visible refusal rather than a picture that lies. And most of the interesting cases still need a lifting commit first: `drawDetails`'s `isBulb` branch is a hardcoded if/else, `layout.ts`'s two button arrays are literals, `Sparks.burst`'s physics is inline. That is the mechanism's real price and it is why the first three slots are deliberately the ones that need no lift at all.

## Decided in chat — 9 September 2026

**There is no vote button, and there is no prompt.** Asked how an approved
candidate should reach the game, the owner answered that he does not need one:
he prefers to say directly, in chat, what he wants integrated and what he wants
rejected. That is how he works everywhere else on this project — he looks, and
then he says one short thing — and a button was asking him to operate a tool
where a sentence would do.

What it replaces is about a hundred and eighty lines of this file: a transcript
of the text a vote put on the clipboard for `creature:bulb` on 27 August 2026,
step by step, and the five differences a `KEEP CURRENT` made to it. That
argument was right about what the *work* was — check the record has not moved,
write the fields, remove the whole slot, record the answer — and wrong only
about who should do it. Every one of those steps is mechanical, and each of
them could go wrong quietly at the worst possible moment: the expensive half,
somebody looking at two phones at 26 px and at tempo, is already spent by the
time a session opens the file.

So the steps are a command instead:

    bun run versus adopt <slot> <name> "<why>"
    bun run versus drop  <slot> "<why not>"

`adopt` writes the winner's field values into the shipped record, removes every
directory in the slot, regenerates the registry and appends the answer to
`tools/versus/DECIDED.md`. `drop` is the same with nothing written into the
game. What survives of the prompt is the part that was load-bearing: **the
staleness refusal.** The value in the file has to be the value the live record
holds right now, and a disagreement stops the adoption and names the field
rather than guessing which of the two is newer — because a cold session cannot
know, and guessing destroys work silently. `tools/versus/record-edit.ts` holds
that, and its tests are the refusals rather than the writes.

Two things it will not do, and says so. A **function** field — a candidate
`poseAt` — is refused outright, because `toString` hands back what the
transpiler made and not how the file spells it, so writing it would mean
writing a lie into a record. And a field it cannot find at the top level of the
literal is refused rather than written to a nested field of the same name.
Both are taken by hand, and then the slot is closed with `drop` and a reason
saying it was.

The registry moved for the same reason the command exists. `candidates/index.ts`
used to hold the array, and every lane that opened a slot added an import and a
line to it — a rebase conflict between two sessions in a file neither of them
was really changing. `candidates/registry.ts` is generated from the directories
by `bun run versus index`, which is a conflict resolved by running a command.

## Where to point it first

Bias the first slots to what is on screen in every frame of every wave and needs no lifting commit, because the mechanism's real price is the lift and the first three votes should not pay it.

**1. `ship:hull-skin` — `OWN_SKIN` in `packages/render/src/hull.ts`.** Four body stops, a rim, an edge and a muzzle colour, and that is the whole of a ship's appearance: the file's own comment says everything else about a hull — contour, lobes, sheen, how damage hangs off it — is the same for every ship there will ever be. It is the player's own ship, at the bottom of the field, in every frame they ever see, and `MIRROR_SKIN` sitting directly beneath it already proves a whole reskin is a pure record swap with no branch anywhere. Zero lift, highest look-count, and it is the fixture lane 1 is written against, so it is also the first vote by construction.

**2. `creature:bulb` and `creature:slick`, one slot each.** `BULB` and `SLICK` in `silhouettes.ts` — a lobe count, a lobe depth and a wobble each, and the records themselves say what those are today — patched together with its own-motion — `SWAY_PUMP` and `TILT_RIPPLE` in `own-motion.ts`. These are the two bodies a player reads on the field, at 26 px, while somebody is talking at them, and `own-motion.ts`'s own docstring makes the case better than I can: two blobs with the same lobes read as different creatures because one swings and the other shivers, and at that size that difference is most of what a player has. Both are pure record patches with no lift. The timing constraint that used to sit on them — a lane owning `own-motion.ts` — is discharged: the rewrite onto beats has landed, and `motions.ts` carries both records beat-counted.

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
Deliberately the smallest motion in `own-motion.ts`, so that the body's own
gameplay tell is the only thing it is saying.

**B — REST.** Zero own-motion at all. The tell carries the body alone.

The question between them is whether a body that is *completely* still apart
from its tell reads as waiting or as broken. That is an eye's question.

**The tell in question has since changed.** The swell both sides were written
against is gone: a throb is half a colour and half plating now, turning
clockwise the whole way down (`sim/throb.ts`). The slot is still a live
question — a drift laid over a turn is a different judgement from a drift laid
over a pulse — but neither side above has been looked at since.

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


## How it is arranged now — 6 September 2026

The design above is unchanged in every part that decides anything: one world,
one frame, both sides through the shipping renderer at 380 × 820 uncapped, the
patch held for the length of one `draw()` and put back in a `finally`, one
seeded random stream per side per frame, and a vote that writes nothing. What
changed is **how many of those run at once**, and **what a candidate is drawn
against** — two complaints from the owner, both of them about the same page.

**The tab is called VERSUS.** It was OTHER GRAPHICS, which is the one name
nothing else in this repository uses: this document, `tools/versus/`, every
session and the owner himself say VERSUS. `tools/director/src/versus-tab.ts`.

**The tab draws nothing.** Nine open candidates meant eighteen phone-sized
renderers stepping eighteen worlds, plus five baked animations, from the moment
the tab was opened — and the owner met that as the page being too slow to use
rather than as the page being complete. The tab is now a list: one block per
slot, one card per candidate, its sentence, the records it patches, the pose it
will be judged on, and a button. The button opens `versus.html?slot=…&name=…`
in a new tab, where that one comparison is the only thing the browser is
animating (`versus-page.ts` lists, `versus-one.ts` draws, `versus-app.ts`
routes). The baked animations — every PNG, APNG and animated WebP example, the
live field they were judged on, and the hand-painted COLLECTED LOOKS — moved
behind the same kind of button for a fortnight and were then **rejected**: a
sixteen-frame burst is 80–200 kB down a phone's connection for an explosion the
field already draws procedurally for nothing, and no amount of looking at it
changes that arithmetic. The page and its six modules are gone.

The machinery underneath is not. `sprite-burst.ts`, `raster-load.ts`,
`raster-caps.ts`, `raster-probe.ts`, `apps/game/src/raster.ts`, `tools/raster`
and the assets all still ship, still pass their tests, and the real game still
plays the burst behind `?raster=1`. A rejected *look* is not a deleted
*capability*, and the owner asked for the difference written where somebody
would trip over it rather than left in a commit message — so the VERSUS tab now
opens on a PARKED: ANIMATED SPRITE SHEETS block naming every part and the one
condition for switching it back on: a graphic that earns the bytes, and a use
case the procedural renderer cannot reach. `docs/raster.md` is the long form.

`server.ts` answers `/versus.html`; `build.ts` carries it as a second HTML
entrypoint, so the static bundle gets a `dist/versus.html` a host
serves under that name. Every link is written `versus.html?…`, relative and with the
extension, because that is the one spelling both of those answer.

**Every open slot is now drawn on its own subject.** `versus-pose.ts` mapped
three slots to a pose and let everything else fall through to `SLICK ·
FALLING`, so a candidate for the crawler's pulse, the magnet's plate, the
strand's bead, the grip's ring or the band's ACTION face was compared against a
red slick that none of them touches: two identical pictures, and a vote offered
on a difference nobody could see. The owner named it exactly — *"it always
shows slick"*, and *"I can't see a difference on CRAWLER:PULSE"*, which was the
same fact twice. `poses-versus.ts` is six new poses, one per slot that had
none, and `test/versus-pose.test.ts` now asserts that no open slot resolves to
the default and that each creature slot's pose actually puts that creature on
the field.

Two of the six are worth naming because they change what a slot can be judged
on at all. `METEOR · A SHOT ARRIVING` hands the pair a world with the fourth
bolt still two tiles under the rock, so the crater opens on screen — the old
`METEOR · CRATERED` spent all four shots inside `build`, where nobody saw one
open. And `BAND · THE ACTION FACES` starts wave 13 rather than wave 0, because
wave 0's control set is `standard1` — a cannon and a red button — so no pose on
the sheet had ever drawn a GUARD or an INTAKE face, and the `panel:action-face`
slot had nothing on screen to argue about. `pose-kit.ts`'s `fresh` takes a wave
index for that one pose and says so.
