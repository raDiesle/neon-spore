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
**The seven `burn-skin-*` lanes below are one block and they are first.** The
owner asked for richer looks — more skins, more animation, offered *beside*
the ones the catalogue already has rather than replacing them. They all draw
on the NOT BUILT YET → SHAPES cards in the director and **none of them touches
`packages/render`**, which is the doctrine `tools/director/src/skins.ts`
already states in its own header: a card is where a look is decided before the
game learns to draw it. That is also why no lane in this block can break a
wave.

`skins/split-s0` is the enabling lane and the other six sit behind it. They
share `tools/director/src/skins/index.ts`, which is owned by nobody and gets
one line from each — a contiguous region, replayed over, exactly like
`config.ts`.

**On the reference sheet.** `docs/reference/20-surface-designs.svg` is the
owner's own file, handed over for this block and committed so a lane in a
fresh clone can actually open it. It is worth reading rather than glancing at:
it defines no `<pattern>` at all, and draws each of its twenty surfaces as
explicit geometry inside a clipped group, `c0` through `c19` — which is the
same thing every lane here has to do, so it is technique and not just a mood.
Its eight gradients are worth reading twice.

It is reference for *structure* — how scales overlap, how a wing's cells
divide, how a spiral's chambers fall — and **not** art to copy in. A fixed
illustration cannot wrap a contour that wobbles every frame and is re-sampled
from `contourAt`; every skin here is generated in contour space or it slides
off its body within a second. The owner also linked three svgrepo files (fish
scales, a butterfly wing, a nautilus shell) as further reference. **No lane
fetches a URL and no lane vendors a third-party file** — that carries a
licence, which is the owner's call and not a lane's. If those are ever wanted
in the tree, that is its own entry with its own licence line.

## EVERY BODY ON THE PAGE IS A FLAT SHAPE SEEN FROM EXACTLY ONE ANGLE
_claude/burn-skin-volume-s2 · tools/director/src/skins/turn.ts tools/director/src/skins/crater.ts_

Volume, and the turn that proves it. Behind s0.

**TURN** puts surface features on a body and moves them across it so the body reads as rotating rather than as a picture sliding. One thing separates the two: a feature must compress toward the silhouette edge and vanish at it, then reappear at the other, on a cosine of its own longitude — a feature that keeps its width as it crosses is a sticker, and the eye knows. Pair it with a fixed key light, so the lit side stays put while the surface moves under it. The owner asks for this on a worm turning left and right, so the rotation is not a constant spin but a slow oscillation that reverses — which is harder and better, because a reversal is exactly where a sticker gives itself away.

**CRATER** is the same machinery with a different surface: a meteorite's pitted landscape, rims catching the key light and floors in shadow, the whole field rotating with the body. `packages/render/src/craters.ts` already draws craters for the game's rock — read it for the shape of the idea and then write this one in SVG in the director. Do not import it.

Finished when `bun run check` is green, both skins are on the switcher, a feature crossing the silhouette edge narrows to nothing rather than clipping, and the commit carries a `Check:` for each asking whether it reads as a body turning or as a texture sliding under a hole.

Model `opus`, effort `ultrathink`. This is the hardest lane in the block and the only one whose failure mode is invisible in a still: both skins look correct in a screenshot and wrong in motion. Think about the foreshortening before you draw anything.

## THE LIGHT CAN BE TAKEN OFF TODAY ONLY BECAUSE NOTHING USES IT YET
_claude/burn-skin-lightswitch-s2c · tools/director/src/shapes-panel.ts_

Behind s2 and s4, and queued now because the lane that built the light asked for it by name rather than guessing.

The switcher on the SHAPES tab is exclusive: one button per entry in `SKINS`, and picking one unpicks the rest. That is why "take the light off every card at once and see whether it was doing the work" is satisfied **today** by clicking CORE — LIGHT is a skin like any other, and CORE is the honest comparison anyway, being the outward-falling gradient the light has to beat.

It stops being true the moment TURN or PLATE composes `litPass` into itself. Then the light is no longer a button, it is inside other buttons, and there is no way to remove it — so the one experiment that says whether any of it earned its place becomes impossible exactly when there is finally enough on the page to judge. The switcher needs a separate lit/unlit control, orthogonal to the skin choice.

`shapes-panel.ts` is owned by nobody and this is the lane that owns it. Keep the change small: one control, one piece of state threaded to `buildSkin`, no rework of the bar.

Finished when `bun run check` is green, every skin that composes the light can be seen with it and without it, and the commit carries `Check: with the light off, does the page lose depth or only lose brightness — the SHAPES tab, the same skin toggled, on a round body and a long one`.

Model `sonnet`, effort `think`. Read `tools/director/src/skins/light.ts` and `shapes-panel.ts` first.

## ELEVEN ANIMATIONS, AND EVERY ONE OF THEM HAPPENS IN THE PICTURE PLANE
_claude/burn-skin-depth-motion-s2b · tools/shape-sheet/src/motions/ tools/shape-sheet/src/motions.ts docs/dimensional.md_

Behind s0b, because the finding this lane exists to prove is that **motion alone cannot sell depth** — and beside s2, which is the other half of the same question. The owner asked for existing animations improved until they give an impression of three dimensions, offered in the catalogue to be picked from later. So the deliverable is variants to look at, not an essay: a written finding with nothing on a card is the trap this queue is already carrying a warning about.

**What the stack actually gives you, and it is less than it looks.** A pose is `{ dx, dy, rot, sx, sy }` — a flat affine transform with no z anywhere. So every impression of depth here is manufactured from four numbers and whatever the skin does underneath. `TURN` is the sharpest case: it is `rot: t * 0.34375`, a spin in the picture plane, which reads as a pinwheel. Nothing in the list rotates in depth, because nothing can, directly.

**The one that does work is `sx` against a fixed light, and that is why this sits behind s0b.** A body whose horizontal scale runs on a cosine while its vertical holds is, on its own, a coin flipping — or worse, a body being squashed. Add s0b's key light, which stays where it is while the body turns under it, and the same four numbers read as rotation. That pairing is the finding, and it is worth writing down precisely because each half looks like a failure alone.

**Take the existing eleven and offer a dimensional counterpart to those that have one.** Not all of them do, and saying which do not is half the result. The obvious candidates: `TURN` becomes a turn *in depth* — `sx` on a cosine with the sign of the surface crossing handled, rather than `rot`; `SWELL` becomes an approach, uniform scale with a little `dy`, which differs from inflation exactly in that an inflating body keeps its footing and an approaching one does not; `TOLL` and `CANT` become a pitch, `sy` compressing with `dy`, a body tipping away rather than leaning; `SLITHER` becomes the worm the owner asked for, a travelling `sx` wave rather than a lateral wander. Each variant sits **beside** its original in `MOTIONS`, never replacing it, because the whole point is picking between them on one page and on one clock.

**The asymmetry that sells a rotation and is always left out:** a body turning at constant angular speed does not move at constant *apparent* speed. The near half crosses fast and the far half crawls, because what you see is the cosine. A variant that eases uniformly reads as an oscillation however good its scale curve is. Get that wrong and none of the rest matters.

`motions.ts` is 234 lines against the ~250 ceiling and cannot hold eleven more, so it splits into `tools/shape-sheet/src/motions/` with a registry, the way `skins/` did and `drafts/index.ts` did before it. That is mechanical; do it first and keep it separate in the diff from anything new.

**Two things this must not quietly break.** `MOTIONS` feeds the drafts panel, so every new entry is something a person will see and has to be worth the row. And a variant that ever ships to a creature would face the nameability gate that landed as `fa0fc2a`, whose first axis is drawn aspect across a beat — an `sx` cosine takes aspect far off, so a turn is a *card* motion until something proves otherwise. Say so in `docs/dimensional.md` rather than leaving it to be discovered.

**`docs/dimensional.md` is written from what was drawn, not before it.** What the Canvas2D and SVG stack can do for depth, what it cannot, what each technique costs, and which of the eleven have no dimensional reading at all and why. One page. It is the answer to "how far can we take this without a second renderer", and it should be honest about the ceiling rather than optimistic.

Finished when `bun run check` is green, every file is under 250 lines, each variant sits beside its original on the SHAPES tab turning on the same clock, and the commit carries `Check: with the light on, does the turned body read as rotating in depth or as being squashed flat — the SHAPES tab, TURN beside TURN IN DEPTH, and then the same pair with the light off`.

Model `opus`, effort `ultrathink`. The apparent-speed asymmetry and the light pairing are the two things that decide whether this lane produced anything at all; the rest is arithmetic. Read `tools/shape-sheet/src/motions.ts` and `docs/skins.md` first.

## A SPORE HAS A HUNDRED SMALL THINGS ON ITS EDGE AND EVERY BODY HERE HAS A CLEAN OUTLINE
_claude/burn-skin-fringe-s3 · tools/director/src/skins/cilia.ts_

Behind s0.

Many small feelers at the rim and over the body, moving. The owner's word is *Fühler*, and the game is called Neon Spore, so this sits close to the fiction's centre: a body whose edge is not a line but a hundred short strands, each swaying, the whole fringe leaning against the direction the body is travelling so the motion reads as drag rather than as wind.

The strands are sampled along the contour and re-sampled every frame — the contour wobbles, so a fringe anchored to fixed coordinates slides off the body within a second. Each strand carries its own phase offset taken from its position along the contour, which gives a travelling ripple around the rim rather than a fringe flapping in unison; unison is a grass field, offset is something alive. A second, sparser set stands on the body's interior rather than its edge.

Finished when `bun run check` is green, the fringe stays welded to a wobbling contour with no slide, the lean reverses when the card's own motion reverses, and the commit carries a `Check:` on whether a hundred strands at card size read as a fringe or as fur — and whether the count is right.

Model `sonnet`, effort `think hard`. The hard part is anchoring to a contour that changes shape every frame, not the sway. Read `docs/skins.md` and `contourAt` first.

## A BODY CAN BE SOFT AND NOTHING ON THIS PAGE IS
_claude/burn-skin-soft-s5 · tools/director/src/skins/pore.ts tools/director/src/skins/sucker.ts_

Behind s0. The soft group — where the tiling group is all hard edges, this is none.

**PORE** — a frog's skin: bumps of varying size scattered without a lattice, each a small radial highlight with a shadow under it, dense in places and sparse in others so it reads as grown rather than as a pattern. The absence of a grid is the whole difference from SCALE and it is easy to lose: a Poisson-ish scatter, not a jittered grid, and a jittered grid is what you get if you are not careful.

**SUCKER** — an octopus's arm: concentric rings, largest along a spine and falling off to either side, each ring a bright annulus with a dark centre. This one has an axis where PORE has none, and that is what keeps the two apart.

Both clipped, both seeded, both re-evaluated against the wobbling contour.

Finished when `bun run check` is green, both are on the switcher, and the commit carries a `Check:` on whether PORE reads as skin or as spots.

Model `sonnet`, effort `think hard`. Read `docs/skins.md` first.

## THE GAME REFUSES A THIRD COLOUR ON A BODY AND A CARD IS NOT A BODY
_claude/burn-skin-nacre-s6 · tools/director/src/skins/nacre.ts_

Behind s0, and last of the block on purpose — it is the one whose premise needs stating before it is drawn.

Iridescence: mother-of-pearl, a butterfly's wing, a nautilus. Colour that shifts across the surface and with the body's own motion, rather than one hue at several brightnesses, which is what every skin above does.

**`docs/alive.md` refuses iridescence, and that refusal is about the field, not about this page.** In a wave a creature's red-or-cyan is a gameplay fact the pair says out loud across a two-second delay, and a third colour on it is worse than a body that is merely less alive. A catalogue card is not in a wave and nothing votes it into one. So this skin is allowed here and **is not a promise about creatures** — say exactly that in the file's header, name the constraint it would have to clear before it could ship to a body that carries ammunition colour, and do not weaken `alive.md`.

The shift must ride the body's own motion, so it changes as the card moves and holds still when the card does. A hue that cycles on a timer regardless of the shape is a screensaver.

Finished when `bun run check` is green, the skin is on the switcher, the header carries the paragraph above, and the commit carries a `Check:` asking whether the shift reads as a surface catching light or as a colour animation.

Model `opus`, effort `think hard`. The judgement is where iridescence stops being a material and starts being a rainbow, and the answer is a narrow hue range rather than a wide one. Read `docs/alive.md` and `docs/skins.md` first.

## THE FIELD IS A GRID SEEN FROM NOWHERE, AND THREE MULTIPLIERS WOULD FIX IT
_claude/burn-depth-field-d1 · packages/render/src/depth.ts packages/render/src/creature-place.ts packages/render/test/depth.test.ts_

Game-side, and the first of two lanes that are **not** in the skin block: those draw catalogue cards and may not touch `packages/render`, while these change what a player sees. Three cues, one lane, because they are one system and shipping any one alone reads as a trick.

**Perspective by row.** A body scales up as it descends, so the field has a near edge and a far one. The scale is **1.0 at the top row and grows downward** — never the reverse, and that direction is a constraint rather than a preference: `docs/spec/graphics.md`'s floor is that a body stays nameable at 20–26 px, so nothing may end up smaller than it is today. A starting value of ~1.15 at the hull was suggested and is explicitly **not** a decision — derive it against `layout.ts`'s own tile maths and say in the commit what you chose and why.

**Atmospheric perspective.** Rows near the top draw dimmer, cooler and at lower contrast than rows near the hull. This composes for free with the wash `backdrop.ts` already lays down, and it serves the brightness budget `backdrop.ts`'s own header defends — creatures stay the brightest thing on the field, and now brightest *where it matters*, which is the row about to cost the pair something.

**Draw-order occlusion.** `drawCreatures` in `creatures.ts` iterates `world.creatures` in list order, so two bodies overlapping is currently decided by spawn order. Sort by row, nearest last. On its own it is nothing; with the two above it is what makes them read as one space rather than three effects.

**The hard part, and nobody has named it yet: this lane collides with the nameability gate that landed as `fa0fc2a`.** That gate's third axis is *effective drawn radius including `sizeMul`* — the number that separates RUNT from everything else — and a row multiplier changes exactly that number, continuously, for every body on the field. So the gate must be evaluated **against the scaled radius across the whole row range**, not against the resting one, and a scale that makes a bulb at the hull collide with a throb three rows up is a scale that fails. Run `bun run shapes:report` and read the TOLD APART BY block before and after. If the gate refuses the value you want, the gate is right and the value is wrong; if the gate cannot see the row at all, that is a finding about the gate and it goes in the commit.

Everything here is render-side and must change no simulation state: a scale is a drawing decision, `creatureCenter` stays exactly linear, and nothing may enter `hashWorld`. Tunables are named fields in `SimConfig` — `config.ts` is owned by nobody, so add in one contiguous region and expect to replay. Add to `creatures.ts` the same way.

Finished when `bun run check` is green, `frame.test.ts` still passes through the strict canvas stub, a test proves the top row is unscaled and the hull row is not, the gate is green against the scaled range, and the commit carries `Check: does the field read as receding, or do the creatures just get bigger — a full wave at tempo, watching one column top to bottom`.

Model `opus`, effort `think hard`. Think hard about the gate interaction before you pick a number; it is the part that turns this from three multipliers into a decision. Read `docs/spec/graphics.md` and `packages/render/src/layout.ts` first.

## A BODY ABOUT TO HIT THE HULL CASTS NOTHING ON IT
_claude/burn-depth-shadow-d2 · packages/render/src/contact-shadow.ts packages/render/test/contact-shadow.test.ts_

Behind d1, so it inherits the row scale rather than duplicating it.

A body near the hull throws a soft dark ellipse onto it, tightening and darkening as it closes. The hull sits at a known fixed `layout.hullY`, so the geometry is arithmetic and not projection.

**It is worth more than it looks, and the second reason is the real one.** A cast shadow is the strongest "these objects exist in a space" cue available in 2D — but it is also a *gameplay* read, and one aimed at the seat that has the least information. The shield player is told how close something is, on the hull itself, where they are already looking, before it arrives. Nothing else on that screen says it. So this is judged twice: does it read as contact, and does it tell the shield player something they did not already have.

That double duty sets the constraint. It must never be mistaken for damage already taken — `scars.ts` draws on the same surface, and a soft dark ellipse and a scar competing for the same pixels is the one failure that misinforms rather than merely looking wrong. Keep it soft, keep it moving, and let a scar always win where they overlap.

Add to `canvas2d.ts` in one contiguous region — it is owned by nobody and another lane is queued to add to it. Nothing here outlives a frame, so nothing belongs in `Effects`; if that turns out to be false, whatever is cached goes in `Effects` and is cleared in `Effects.reset()`, which `restart.test.ts` will fail on if it is not.

Finished when `bun run check` is green, `frame.test.ts` passes, a test proves the ellipse tightens monotonically as the row falls and is absent when nothing is near, and the commit carries two trailers: `Check: does the shadow read as a body about to arrive, or as damage already taken — a wave with a scarred hull` and `Check: from the shield seat, does the shadow say anything the player did not already know`.

Model `sonnet`, effort `think hard`. Read `packages/render/src/layout.ts` and `scars.ts` first.

## FIVE HUNDRED LINES IN ONE FILE, AND THE DOCUMENT THAT NAMES ITS NEIGHBOURS
_claude/burn-versus-promptsplit-v3b · tools/versus/prompt.ts tools/versus/text.ts docs/versus.md_

`tools/versus/prompt.ts` landed at 511 lines against CLAUDE.md's ~250, and it landed that way deliberately: the lane that wrote it could not split it, because the seam files are enumerated by name in `docs/versus.md` **and** inside the prompt's own step 4, and it owned neither. This lane owns both, which is the whole reason it exists.

The seam is already there and needs no invention. `votePrompt` begins at line 195; everything above it — `wrap`, `row`, `named`, `count`, `list`, `quoted`, `show`, `block` — is text formatting that knows nothing about votes, and belongs in `tools/versus/text.ts`. What is left is the template and `changes`, which is the part worth reading as one piece.

Two things this must not break, and both are tested already, so the test suite is the acceptance: the adopt and keep forms still differ in exactly the five ways the template names, and `votePrompt` still throws on a patch under `packages/sim/`. Do not weaken a test to fit a split.

Then update the two places that enumerate the directory — `docs/versus.md` and step 4's own file list — so the prompt keeps telling the truth about the tree it is describing. That is the actual risk here: a prompt that lists files which are no longer there teaches a cold session to distrust it.

Finished when `bun run check` is green, every file is under 250 lines, and no test was changed to make it so.

Model `sonnet`, effort `think`. This is a move with a documentation tail, not a design.

## THE VOTE BUTTONS COPY A RECORD, AND THE PROMPT THEY SHOULD COPY NOW EXISTS
_claude/burn-versus-wire-v3c · tools/director/src/versus-page.ts_

Behind v3b, so the split settles before this reads from it.

The pair renderer landed while `prompt.ts` did not yet exist, so its vote buttons put a *record* on the clipboard — slot, winner, loser, the typed reason, every field `old -> new` — under a header saying in plain words that it is not the adoption prompt. That was the right call at the time and it is the wrong thing to ship: it is the expensive half of the vote kept warm, waiting for the cheap half.

`votePrompt(vote)` and `readCurrent(v)` are now on `main`. Replace the record with the real thing, and delete the header that apologises for it. **`readCurrent` must be called before any patch is applied** — the whole refusal mechanism rests on the left-hand values being what the shipped record actually says right now, so reading them off a patched record would emit a prompt that cheerfully reverts nothing and claims it reverted something.

Nothing else in the page changes. The vote box may want its own file — both new director files sit at exactly the 250-line ceiling — and if it does, that is this lane's to make, contiguous and small.

Finished when `bun run check` is green, a vote copies a prompt a cold session could paste, and the commit says which values `readCurrent` was called against.

Model `sonnet`, effort `think hard`. The one thing to get right is the ordering of the read against the patch. Read `tools/versus/prompt.ts` and `variant.ts` first.

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
_claude/burn-teach-call-t4 · packages/sim/src/call.ts packages/sim/src/commands.ts packages/sim/src/hull.ts packages/sim/src/briefing.ts packages/sim/src/events.ts packages/sim/test/call.test.ts packages/audio/src/bind.ts packages/audio/src/catalogue.ts packages/audio/test/bind.test.ts_

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
_claude/burn-teach-script-t5 · packages/content/src/calls.ts packages/content/src/wave-types.ts packages/content/src/waves.ts packages/content/src/queue.ts packages/content/src/index.ts packages/content/test/calls.test.ts apps/game/src/waves.ts tools/director/src/serialize.ts tools/director/src/rail.ts tools/director/src/stage.ts tools/director/test/serialize.test.ts_

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

## EVERY BODY MOVES A ROW ON THE SAME INSTANT AND NONE OF THEM ARRIVES
_claude/burn-body-land-c5 · packages/content/src/drive.ts packages/content/test/drive.test.ts_

The beat arriving in a body, and the hull's approach arriving with it. Behind lanes 3 and 4.

A new pure file in `content`, so nothing here reads a world: `Drive` (a struct of plain numbers: `beatPhase`, `moved`, `dread`, `held`, `jolt`, `shockX`, `shockY`, `scatter`) and `poseWith(motion, beats, drive)`, which composes an `OwnMotion`'s pose with the impulses. `own-motion.ts` is not touched — lane 3 owns it, and `poseWith` taking an `OwnMotion` is what keeps these two lanes from colliding.

**The landing and the gather.** With `p = beatPhase + (scatter - 0.5) * 0.08`: `land = max(0, 1 - p/0.32)^2`, `gather = max(0, (p - 0.75)/0.25)^2`, and `squash = landGain * (0.18*land - 0.07*gather)` applied volume-preserving as `sx *= 1 + squash`, `sy *= 1 - squash`, plus a small `dy`. Position stays exactly linear — `creatureCenter` is untouched, because "it lands on the three" is a statement both players act on across a two-second delay and the even glide is what makes it one. **The overshoot goes in the pose, never in the position.** `landGain` is a new named field on `OwnMotion`... which lane 3 owns, so take it as a `Record<CreatureKind, number>` in this file instead and say in the comment that it wants to move onto `OwnMotion` once the two lanes are both on `main`. Bulb 1.0, slick 0.6, runt 0.4, **throb 0.0** — and write the reason down as a rule rather than a value, because the next person raising SWAY_PUMP's pump needs it: `throbOpen` is a gameplay signal telling the pair when to fire, so the throb keeps a monopoly on beat-synchronous scale change and no other body may express the beat in size. The slick's 0.6 exists because it is the one kind whose squash could walk it toward the round three; check the direction — at maximum it goes to ~2.24, away from them, not toward.

**Dread.** `dread = clamp01((c.row - (hullRow(cfg) - 3)) / 3)`, zero until three rows out and one at the hull, scaling everything the body already does by `1 + 0.55*dread` and doubling the gather in the last row before impact. No new motion is invented; the existing one gets louder. Amplitude scaling touches no shape parameter, so it is free of nameability risk by construction — and it is not decoration: agitation is a second, peripheral channel telling the pair which lane is about to cost them, readable without reading a row number.

**The elliptical pen, and nobody in three design proposals noticed it.** `drawLiving` composes `ctx.scale(scale * sx, scale * sy)`, so a non-uniform pose strokes the outline with an elliptical pen: apparent line weight varies by direction at exactly the instant the squash peaks. This is already true today at SWAY_PUMP's +/-10%; this lane takes it to 18%, a swing `docs/spec/graphics.md` pins at 1.2-1.8 px cannot absorb. Fix it in the one contiguous region this lane adds to `creatures.ts` — compensate `lineWidth` against the geometric mean of `sx` and `sy`, or stroke outside the non-uniform transform. Say in the commit which, and that it changes the resting look slightly because the bug predates the batch.

The gate from lane 2 must be green with `landGain` at these values and red if any of them is doubled; that is the acceptance test, not an eye.

**That gate has since been built, and it says these values are red on arrival.** `claude/burn-body-gate-c2` landed the three-axis nameability test, and its finding is specifically about this lane: BULB and THROB are held apart by the **lobe axis alone**, and the lobe axis answers to the pose, because a squash is a second harmonic that competes with the nine bumps. The bulb's pump sits exactly on its ceiling — 0.10 passes, 0.11 fails — so the 0.18 squash written above fails the moment it is applied to the bulb. This is not a reason to weaken the gate; the gate is the thing that caught it. Run `bun run shapes:report` and read the TOLD APART BY block before choosing a number. The brief's own fallback is the likely answer and it lands under the ceiling: **halve every `landGain`** — bulb 0.5, slick 0.3, runt 0.2, throb still 0.0 — giving a ~0.09 squash, and let the directional gather carry the beat. If a halved gain reads as nothing, that is the finding, and the choice between a legible landing and nine countable lobes is a decision for the orchestrator, not something to resolve by widening a cap.

Finished when `bun run check` is green, `drive.test.ts` proves every impulse decays to under 1% by mid-beat and that `sx * sy` stays within 1% of 1 at every sample, and the commit carries `Check: does the unison landing read as tempo or as twelve metronomes — a full wave at tempo, then a two-body wave`.

Model `opus`, and think hard about **whether the unison is tempo or a metronome** — it is the one item in the batch with real nameability exposure, D3 itself calls its own hedges "the argument, not the evidence", and the fallback if it reads mechanical is to halve every `landGain` and let the directional gather carry the beat alone.

Model `opus`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A THING DIES AND EVERYTHING AROUND IT CARRIES ON EXACTLY AS BEFORE
_claude/burn-body-shock-c6 · packages/render/src/shock.ts packages/render/test/shock.test.ts_

The only change in the batch that makes one creature react to something that happened to another, and the largest visible motion proposed anywhere — up to 0.35 tiles, about 12 px of whole-body translation, at the most-watched instant in the game. Behind lanes 4 and 5.

Right now a kill is a silhouette vanishing behind a particle burst while its neighbours carry on unchanged, which reads as objects being deleted from a list. `Effects.ingest` already receives `destroy`, `runtHit`, `petal`, `queenDown` and `wardenDown`, and **all five already carry `col` and `row`** — check `packages/sim/src/events.ts` and confirm before building. Push `{ x, y, age: 0, life: 0.45, power }` (power 2 for the two boss deaths) into a new list, age it in `update`, and per creature accumulate `k = power * (1 - age/life)^2 * max(0, 1 - dist/(2.6*l.tile))` as a push away from the source, clamped to 0.35 tiles total. Shocks are few and short-lived, so this is a handful of multiplies per body. It feeds lane 5's `Drive` as `shockX`/`shockY`; it is pure translation, no colour and no scale.

**This is new render state that outlives a frame**, and it is the only thing in the batch that is. It goes in a list on `Effects` and **must be cleared in `Effects.reset()`**, which `Canvas2DRenderer.waveRestarted` calls on every way a wave can start over — `packages/render/test/restart.test.ts` compares structurally against a fresh `Effects` and fails if a new field is added and not cleared. That is correct behaviour, not an obstacle; `world.beat`, `world.tick` and `world.nextId` all restart at 0 and state cached against them is read by the next run as its own.

`packages/render/src/effects.ts` is 241 lines and owned by nobody — add the field, the ingest case and the reset line in one contiguous region each, and put the falloff maths in this lane's own `shock.ts` so the region in `effects.ts` stays three lines.

**The risk to watch, and it is the one failure in the batch that misinforms a player rather than looking wrong.** Three bodies flinching when one dies may read as a chain reaction and invite a wasted shot. The mitigations are the short falloff, the pure translation and the absence of any colour change — but they are arguments. This is the first thing to look at on a phone, and if it reads as damage it is worse than nothing, because it lies about the rules.

Finished when `bun run check` is green, `restart.test.ts` passes without being weakened, a test proves the list is empty after `reset()` and that a shock decays to zero within its life, and the commit carries `Check: does a neighbour's flinch read as sympathy or as damage — fire into a cluster and watch what a partner assumes`.

Model `sonnet`, `think hard` — the pattern (an `Effects` field aged in `update` and cleared in `reset`) already exists several times in the file; the hard part is the falloff radius and whether it lies, and that is named above.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A BODY UNDER A HAND SWAYS EXACTLY LIKE A FREE ONE
_claude/burn-body-held-c7 · packages/render/src/creature-drive.ts packages/render/test/creature-drive.test.ts_

What the two players do to a body, drawn on the body. Behind lanes 4 and 5.

One new file that reads the `World`, the `SimConfig` and `Effects` and hands lane 5's plain-number `Drive` to `poseWith` — so the direction of flow stays one way, render still decides nothing, and `content` stays pure. Everything it reads exists: `gripsCreature`, `gripCount`, `hullRow`, and `Effects.blocked`, which already holds a per-id countdown from 0.35.

**The hit-stop comes first, and it is the only item in this batch that makes a silhouette *more* legible.** For the first 60 ms of `blocked` — while the countdown is above 0.29 — draw the pose lerped fully to `REST`: no sway, no drift, no impulse, and quantise the `t` fed to `blobPath` so the contour freezes too. That is the clearest, stillest, most canonical look at a shape anywhere in the game, and it happens at the exact moment the player is looking hardest at that one body. D3 wanted to answer a blocked shot with *more* motion; this is the opposite and it is right.

**Then the recoil.** With `b = blocked/0.29` decaying from 1: a volume-preserving squash of about 0.18 scaled by `b*b`, a small upward `dy` because the shot came from the hull below, and amplitude scaled by `1 + 0.6*b`. The existing grey-outline branch stays; it stops being the *whole* response. A wrong-colour hit currently reads as the silhouette going grey behind a particle cloud, and `docs/spec/graphics.md` asks in its own words for a short hit-stop and a reaction proportional to its cause — there is none anywhere in the pipeline today.

**And the grip.** `grip.ts`'s own comment says the entire point of the mechanic is the *other* screen seeing that a hand is on something, and yet a held creature currently sways identically to a free one — the whole mechanic lives in a ring drawn around it. Under a hand: `sy *= 1 + 0.09*held`, `sx *= 1 - 0.09*held`, and own-motion amplitude cut by 35% — the body is stretched between the hand pulling up and the fall pulling down, and pinned rather than free. One consequence falls out for nothing: `grippedFallTiles` returns 0 for a held creature on most beats, so `moved` is 0 and it gets no landing kick — the grip becomes visible as an absence of the field's pulse, a body held out of time.

Add to `creatures.ts` in one contiguous region; it is owned by nobody after lane 4.

Finished when `bun run check` is green, a test proves the pose is exactly `REST` for the first 60 ms of a block and that every reaction returns to within 1% of the canonical pose, and the commit carries `Check: does a held body read as held from the other seat, at arm's length` and `Check: is the hit-stop visible at all, or is 60 ms below the threshold on a phone`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## THE ONE BODY THE FICTION FORBIDS FROM LOOKING ALIVE IS THE ONLY ONE WITH VOLUME
_claude/burn-body-skin-c8 · packages/render/src/creature-skin.ts packages/render/src/glow.ts packages/render/src/palette.ts_

Last on purpose, and **conditional**: build it only if the field still looks flat once the bodies are behaving. Everything before this is behaviour; this is the only lane that is decoration, and it is also the only one whose premise a judge argued might be wrong — `docs/spec/graphics.md` says liveliness at 20-26 px comes from motion with overshoot and not from detail, and the flat swatch may be a deliberate reading of that line rather than the omission three readers took it for.

The counter-evidence is in the file itself: `drawMeteor` builds a linear gradient, and the indestructible rock — the one body whose fiction requires it to look inert — is the only thing on the field with volume. A viewer currently finds more depth in the meteor than in the bulb beside it.

**Three things, and no more.** (a) `coreFill`: replace the flat `dark` swatch with a cached radial gradient in the shape's local coordinates, offset toward one implied key light shared by every body on the field, with stops `mix(dark, hex, 0.34)` -> `mix(dark, hex, 0.12)` at 0.5 -> `dark` mixed 35% toward `PALETTE.background` at the rim. The outermost stop is the whole point and it is why this is the safest interior item in the exercise: it *darkens* the body at the edge and raises the rim-to-interior contrast the lobe read depends on, instead of eroding it like every other interior proposal. Cache in a `Map` keyed by colour and shape — three colour triples times four silhouettes is at most twelve gradient objects for the life of the process. **Never construct a gradient per frame**, and never build a breathing radius through `halo()`: `haloSprite` keys on `${color}@${radius}` and allocates a canvas on a miss, which is exactly the trap `sheen.ts` guards against with `Math.round(.../4)*4`. (b) One clipped inward membrane stroke, `innerLight`'s technique from `sheen.ts` re-expressed as fractions of the body radius rather than pixel constants, so it survives at 26 px — it follows every lobe and puts a bright inner edge on each one, which should make lobes *easier* to count. (c) Widen `strokeGlow`'s `color` parameter from `string` to `string | CanvasGradient`. It is assigned straight to `ctx.strokeStyle`, so every existing caller is unaffected and there are zero extra draw calls, and a colour gradient around the loop varies apparent line weight — which is what a constant stroke weight all the way round a closed contour costs you: it is the signature of vector clip-art. **The rule is colour only, never alpha**: add named deep swatches (`redDeep`, `cyanDeep`) to `palette.ts` so all three stops are fully opaque and the rule is enforced by the palette rather than by memory, because a stop reaching zero alpha opens a hole in the outline and a silhouette with a missing bottom edge is a different word.

**Explicitly not built**: the travelling gleam (a 9 px additive dot at alpha 0.35 on a 30 px contour looks like a bullet, and D3 admits it); a second organ, or any organ at all on the runt, which draws at about 10 px — below graphics.md's own "at 11 px nothing of a figure survives" line, so everything the runt says it says with tremble amplitude and with the absence of the field's rhythm; iridescence, because a third colour on a body whose red-or-cyan is a gameplay fact the pair says out loud is worse than a body that is merely less alive; and any drifting, unmirroring or breathing of the detail dots, which are 1.0 px in radius with 0.5 px filaments. If the details are worth an entry, the entry is deleting them and letting the gradient carry the interior.

**Budget the brightness, not just the cost.** "Creatures stay the brightest thing on the field" is a ratio, and this adds light inside the rim. Drop `strokeGlow`'s pass count for creatures from 3 to 2 (an optional `passes` argument), since the inner light now carries part of the rim read. Check the result against the hull's five sheen passes and against a Simon round's green, which is the one colour in the game that must never be competed with.

Finished when `bun run check` is green, `frame.test.ts` passes with the new fills through the strict canvas stub, no gradient or halo sprite is allocated after the first frame, and the commit carries `Check: does the interior gradient survive 26 px, or is the spec right that it does not — desaturated shape sheet at 26 px, rim peak at least 2.5x the interior peak`.

Model `sonnet`, effort `think hard`. Read `docs/alive.md` first — it is the design this lane implements.

## A CHECK THAT LANDED YESTERDAY HAS NO "BEFORE" AND COULD HAVE
_claude/burn-frames-f1 · tools/frames/capture.ts tools/frames/run.ts_

The owner wants a before and after picture, or an animation, beside a check —
and for anything landing from now on the skill already asks the lane to
capture both while it still has the tree in front of it. The fifty-five that
already landed have no such thing, and it looks at first as though they never
can.

They can. Every one of them names a commit, every commit has a parent, and a
headless preview can be built and driven at either. So: `bun run frames <sha>`
checks the parent out into a scratch worktree, builds, drives the real loop to
an agreed frame, captures it, does the same at the commit itself, and writes
the pair under `docs/checks/`. For anything whose question is about *motion* —
and most of them are — the same run captures a short strip of frames rather
than one.

Two things decide whether this is worth building, and both should be settled
before it is: whether a frame can be made **comparable** across two builds (the
same wave, the same tick, the same seed, no wall-clock anywhere in the shot),
and how much of the fifty-five it can actually answer, since a check about a
sound or about two devices cannot be photographed at all. Report that number
honestly before capturing anything in bulk.

## ONE PREDICATE STANDS BETWEEN THIRTEEN CREATURES AND A PICTURE
_claude/burn-drafts-suggest-p1 · tools/shape-sheet/test/drafts.test.ts tools/shape-sheet/src/drafts/index.ts_

A draft shape names the idea it is offered to through `suggests`, and
`drafts.test.ts` resolves that name against `docs/spec/ideas.md` and
`docs/spec/bosses.md` only. The thirteen unbuilt creatures in the bestiary are
table rows rather than idea-store sections, so a draft cannot legally point at
one — which means the largest undrawn group in the repository is the one group
nobody can draw for.

Found by the lane that drew six shapes ahead of the need and then ran out of
things it was allowed to offer them to. It called it one predicate, and it is:
`roster.ts` already parses the bestiary table into named rows, so the
resolution has a second source waiting for it.

Finished when a draft can name a bestiary creature, when a name that matches
nothing still fails loudly, and when `bun run shapes:report` shows at least one
new contour offered to one of the thirteen. The rule that has to survive: a
`suggests` pointing at nothing must remain an error, because the whole value of
the field is that a drawn shape is joined to the idea it serves.

## A RESTATEMENT IS A FILE PER COMMIT, NOT A LINE IN A SHARED ONE
_claude/burn-restated-split-p2 · docs/checks tools/checks/restated.ts_

`docs/checks/restated.md` is a single file that every lane appends to, at the
end, in the same commit shape — so two lanes landing in one evening conflict
there by construction. That is the exact failure this repository diagnosed
this morning about `docs/parked.md` and fixed by taking the writing away from
lanes; the skill then recreated it here an hour later.

The fix is not to take the writing away again — a restatement has to be
written by the session that knows what changed. It is to remove the shared
append point: one file per commit, `docs/checks/<sha>.md`, which is how the
entries are keyed anyway. Two lanes then never touch the same path, and the
reader gains nothing to merge.

**And a sha is not stable, which is the other half of the problem.** A lane
that lands behind another one is replayed, so the commit it keyed its
restatement to no longer exists — the drafts lane was rebased twice tonight
and said so: its key is only correct while the landing stays a fast-forward,
and nothing would notice it going stale except the orphan report. Splitting
the file does not fix that on its own.

`bun run land` is where it can be fixed, because that is the one place both
shas are known: it rebases, so it can see what each commit was and what it
became, and rewrite the key as part of landing — the same way it already
retires the queue entry. Do that, and prove it by landing something behind
another lane and watching the key follow.

Finished when the parser reads a directory rather than a document, when the
existing entries are split without losing their keying, when a replayed commit
carries its restatement with it, and when the skill tells a lane to write
`docs/checks/<sha>.md` in its second commit. The keying stays exact — sha plus
trailer text, word for word.
