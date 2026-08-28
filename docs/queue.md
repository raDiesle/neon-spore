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

**Every entry says who wanted it, on its own line under the branch.** Either
**Asked for by the owner.** or **Proposed by the run.**, those two words and no
third option — a run that has read a spec file and found a gap is proposing,
however obvious the gap. That label is the first sort key: the owner asks are
worked before anything the run thought of, and a new entry that cannot honestly
carry the first label is filed below every entry that can.

The label is not a ranking of quality. Several of the proposed entries below
are better ideas than the reports above them, and that is exactly why the
labelling exists — designing is more enjoyable than fixing, so work the run
invented rises on its own unless something holds it down.

**A lane may not change what the game already draws.** CLAUDE.md's *A look is
offered, never replaced* binds every entry in this file: a new colour, a new
animation or a different shape is written as an alternative on the NOT BUILT
YET pages, beside the shipped one, and the owner decides by looking. A brief
that would replace a look outright is a brief that has been written wrong, and
the three narrow exemptions are named there rather than here.

**What the owner asked for outranks what a run decided to do next.** The
order is not a judgement about which work is better; it is about where the
work came from. A brief that can point at something the owner said — *CILIA is
slow*, *shadow and light in the game*, *I cannot tell what combines with what*
— goes above one derived from a spec file, a `--candidates` sweep or a session
noticing a gap while it was passing. Both are legitimate work and the second
kind is often the more interesting, which is exactly why it drifts to the top
on its own if nothing holds it down.

So a run refilling this file sorts on that first and on everything else
second, and a new entry that cannot name an owner ask is filed below every one
that can, however obvious it feels while writing it. A lane whose brief does
not say where it came from is a lane nobody can sort later.

The italic line under each heading is `branch · the paths that lane owns`. Two
lanes may not own the same path. The files everything wants — `config.ts`,
`world.ts`, `canvas2d.ts`, `apps/game/src/main.ts` — are owned by nobody: add
to one in a single contiguous region and expect to replay over somebody else.

## A METEOR THROWS A SHADOW ONTO THE SHIP, AND IT GATHERS AS IT FALLS
_claude/burn-meteor-shadow · packages/render/src/contact-shadow.ts packages/render/test/contact-shadow.test.ts_
**Asked for by the owner.**

Their words: *i was expecting that meteor around last 1/4 of screen falling
down let a shadow fall down which can be seen on the ship surface skin. and the
more it reaches the ship, the natural shadow behavior let the shadow move more
and more in vertical direction right below the meteor.*

**This is an extension, not a new system.** `contact-shadow.ts` already puts
one soft ellipse on `l.hullY` for a body about to hit, already sizes it off
`depth.ts` rather than duplicating the arithmetic, already leans it because
`KEY` is upper left, and already refuses a column that carries a scar. Read its
header before writing a line: every one of those is a decision with a reason,
and none of them is up for renegotiation here.

What the owner is asking for is the **offset**, and it is the one part real
light gets right and this file currently does not: a caster far from a surface
throws its shadow far to the side, and a caster about to touch throws it
directly underneath. So the lean is not a constant — it is proportional to the
gap, and it goes to zero at contact. That is the whole lane.

Two things to get right and to say the numbers for in the commit. **Where it
starts**: the owner says the last quarter of the screen, so the shadow appears
as the body enters that band rather than at the top of the field, and it should
not pop — it fades in over the entry. **What it does at the end**: at contact
the ellipse is directly under the body, smallest and darkest, which is what
sells the distance.

Nothing here may read `hull-frame.ts`'s lobes — the header says why, and the
answer is still no.

Finished when `bun run check` is green, `contact-shadow.test.ts` covers the
offset at both ends of the fall (far → leaning, contact → centred) and still
proves the scar exclusion, and the commit carries
`Check: does the shadow sliding under the meteor as it falls read as the rock
getting closer, or just as a shadow moving`.

Model `sonnet`, effort `think hard`. Read `packages/render/src/cast-shadow.ts`,
`packages/render/src/depth.ts` and `docs/spec/graphics.md`. Think about the
gap-to-offset curve before the code: linear is the obvious guess and is
probably wrong at the near end, which is the end the eye is on.

## A METEOR SHOULD LOOK LIKE A ROCK, AND THIS ONE IS PINK
_claude/burn-meteor-look · packages/render/src/meteor.ts packages/render/test/meteor.test.ts_
**Asked for by the owner.**

Their words: *i want you improve the meteor visuals. it should look like a
meteor. maybe you want to use existing crater skin and improve further. also
the shape of meteor has a lot of pinks, its not natural for a meteor.*

**The pink is a defect, and the first job is to find it rather than to paint
over it.** The body's own fill is `#8A8F9C` and `PALETTE.rock` is `#C7CBD6` —
both cool greys, neither of them pink. The prime suspect is one line in
`packages/content/src/light.ts`: `rock: "value+hue"`, which makes the rock the
one thing on the field whose *hue* the key light is allowed to move. Every
other body is `"value"`, and `key-light.ts` explains why that keeps a red body
red. Confirm it before changing it — take a frame, sample the pixels, and say
in the commit which pass actually put the pink there. The `halo` call at the
bottom of `meteor.ts` is the second suspect.

Under CLAUDE.md's *A look is offered, never replaced* this is the **third
exemption**: a meteor reading as pink is wrong rather than unlovely, so it is
repaired on the field and not offered beside itself. The commit says that
sentence in its own words — that is the guard against the exemption eating the
rule.

**The improvement half is the other exemption — the owner asked by name.** They
point at `tools/director/src/skins/crater.ts`, which already draws lit-rim,
dark-floor craters that vary across the body and are lit individually. That is
the reference. It is not a file to import: a skin card is not the field, and
`meteor.ts` draws at field size on a rolling body. What transfers is the
*approach* — pits that vary with position and catch the key light — against
what is there now, which is `c.holes` flat dark circles at a fixed radius with
a half-alpha stroke.

Do not touch the silhouette. The contour is what the pair calls out, and
`docs/spec/graphics.md` is the constraint on how much a rock may read as
anything else.

Finished when `bun run check` is green, `frame.test.ts` still passes through
the strict canvas stub, and the commit carries two trailers:
`Check: is the meteor grey now, at speed, against the field's own violet`
and
`Check: does the meteor read as a rock rather than as a circle with dots on it
— at 26 px on a phone, beside a bulb for contrast`.

Model `sonnet`, effort `think hard`. Read `packages/render/src/key-light.ts`,
`packages/content/src/light.ts` and `tools/director/src/skins/crater.ts`.
Behind the shadow lane if both run: they do not share a path, but they share
the frame the owner will judge.

## THE DIRECTOR DRAWS "TAP TO RESTART" AND NOTHING IS LISTENING
_claude/burn-director-sheet-close · tools/director/src/stage.ts tools/director/test/stage.test.ts_
**Asked for by the owner.**

Their words: *when on desktop pc in director, i open "sheet", i cannot close it
again. the click on the screen seems not to work. also i guess my expectation
is, if i click "sheet" again, it toggles to hide.*

**Already diagnosed — do not re-derive it, verify it and fix it.** `▣ SHEET`
(`#endRun`, bound at `tools/director/src/stage.ts:198`) calls `endRun(world)`,
sets `running = false` and paints once. The after-run screen that comes up is
the game's own, drawn by `packages/render/src/balance.ts`, and line 65 of that
file writes **"tap to restart"** onto it.

In the game there is an input layer that honours those words. In the director
there is not: `stage.ts` binds `click` on `#playBtn`, `#restart`, `#ackBrief`,
`#endRun` and the role buttons, and **binds nothing on the stage canvas at
all**. So the screen instructs the reader to do something the director never
listens for. It is not a mouse-versus-touch problem and it is not desktop-only;
the handler is absent, so no pointer of any kind can dismiss it.

Two fixes and the owner named both, so do both.

**The canvas honours its own instruction.** A click on `#stage` while the run
is over restarts it — the same thing `#restart` already does. That is the
literal repair: the text stops lying.

**And `▣ SHEET` toggles.** Pressed once it ends the run and shows the sheet;
pressed again it puts it away and the stage comes back. Today the second press
re-ends an already-ended run, which is why the button reads as dead. The label
may want to say which way it will go, the way the other toggles on this page
do — that part is a judgement, and the commit says which way it went and why.

Neither half touches the game. `balance.ts` is drawing exactly what it should
and is not edited here; this is the director failing to wire a screen it chose
to show. Say that sentence in the commit — it is what keeps the fix out of
`packages/render`.

Finished when `bun run check` is green, a test covers both dismissals (a click
on the stage after the run ends, and a second press of `▣ SHEET`), and the
commit carries
`Check: after ▣ SHEET, does clicking the stage bring the field back, and does a
second press of ▣ SHEET do the same`.

Model `sonnet`, effort `think`. Read `tools/director/src/stage.ts` and
`packages/render/src/balance.ts`. This is a tool fix, not a look: nothing the
game draws changes.

