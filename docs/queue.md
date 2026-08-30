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

## COPY AND DELETE STILL DO NOTHING ON A BOSS WAVE
_claude/burn-boss-buttons-visible · tools/director/src/rail.ts tools/director/test_
**Asked for by the owner.** A `FAIL` on `ba352ba` — the very commit that was
supposed to fix this:

> yes it does nothing. i prefer you disable or hide the button, if boss wave is
> currently actively selected

**The landing claimed to have done exactly that.** `ba352ba` set `.disabled`
and a `title` on COPY and DELETE whenever the current wave carries a boss, and
its lane verified it in a browser: *BULB QUEEN — both greyed out with
explanatory titles; FIRST STEP — both plain and live.* The owner then pressed
them on a boss wave and got silence.

**So the interesting question is not what to build — it is why the verification
disagreed with the owner.** Find that before changing anything, and say it in
the commit. Two candidates worth checking first:

- **The buttons are not re-evaluated when the selection changes.** If
  `disabled` is set where the row is built rather than where the wave is
  chosen, then whichever wave was current when the bar was drawn decides the
  state forever, and clicking through to a boss wave leaves live buttons.
- **The disable landed but the refusal is what the owner met.** The guards in
  `bindAction` refuse regardless, by design, so a live-looking button on a boss
  wave does nothing — which is precisely the *silent no-op* this was meant to
  end, arriving through the half that was supposed to be the belt rather than
  the braces.

**The owner has named the acceptable outcomes: disabled or hidden.** Pick one
and say why. Given a boss wave is a state you sit in rather than pass through,
disabled with a reason reads better than a control that vanishes and reappears
— but that is a judgement and the commit should carry it.

**Keep the refusal underneath.** A disabled button is a hint, not a guarantee;
the functions must still refuse. That was right and stays.

Finished when `bun run check` is green, selecting a boss wave visibly disables
both controls the moment it is selected, and the commit says why the earlier
verification passed while the owner's did not.

`Check: click onto a boss wave in the list — do COPY and DELETE go grey the moment you land on it, and tell you why?`

Model `sonnet`, effort `think`, spent on reproducing the owner's failure before
touching the fix. Read `rail.ts`'s button binding and where the selection
changes.


## THE TOPBAR TYPES OUT THE KEYS A SECOND TIME
_claude/burn-topbar-keys-note · tools/director/index.html tools/director/src/key-help.ts tools/director/test_
**Asked for by the owner:**

> i can see on top right topbar "A/D cannon · J/L shield · I guard · S maw ·
> W/E fire · G grip (as P2) · or play the stage with the mouse". move and merge
> into "keys" button popup. if its already there, just remove it.

**It is already there, so it is a deletion.** `⌨ KEYS` renders `KEY_BINDINGS`
from `tools/director/src/keys.ts` — the one place the director's key map lives
— grouped by seat. The topbar line at `index.html:851` is a hand-typed second
copy of the same facts, which is exactly the drift `key-help.ts`'s own header
warns about: *a hand-kept copy in this file would go stale the moment a key is
added to the switch in `keys.ts` and not to a markup list beside it.* The
markup list it was worried about is sitting in the topbar.

**So: delete the line.** Do not move it, do not reformat it into the modal, and
do not add a shorter version somewhere else. The modal is the answer and it
already answers.

**One clause needs checking before it goes with the rest.** *"or play the stage
with the mouse"* is not a key binding and may not be represented in the modal
at all. Look. If it is missing, add it to the modal — **once, in the same
derived structure or plainly beside it** — because it is a real thing somebody
needs to know and the topbar was the only place saying it. If it is already
there, the whole line goes and nothing is added.

**And check what the deletion frees.** The topbar shed four buttons recently and
the row was measured before and after; this is the last long thing in it. Say in
the commit what the bar measures now.

Finished when `bun run check` is green, the topbar carries no key list, and
everything it used to say is in the modal — including the mouse.

`Check: open the director — is the key list gone from the top bar, and does the KEYS button still tell you everything it used to say, including that you can play the stage with the mouse?`

Model `sonnet`, effort `think`. Small. Read `tools/director/src/key-help.ts`'s
header first — it explains why this line should never have existed.

## TO CHECK SHOWS CONCEPTS THE OWNER DID NOT ASK TO BE SHOWN
_claude/burn-checks-implementation-only · tools/checks tools/checks/test tools/director/src/checks-page.ts tools/director/src/checks-dom.ts docs/verification.md_
**Asked for by the owner:**

> in the "to check" page, i dont want to see type "concept", only
> implementations

**The two badges answer different questions and only one of them is a queue.**
`implementation` means the game or the tool now does something differently, and
looking at it is a small obligation somebody incurred by landing. `concept`
means a proposal that nothing ships yet — a candidate beside the shipped look,
a draft offered for a decision. The first is *go and check this*; the second is
*decide whether you want this at all*, and it waits on the owner's appetite
rather than on their attention. Mixing them makes the list read as longer than
the work it represents, which is the failure the whole badge was introduced to
fix.

### What to build

**The list shows implementations.** Concepts are not deleted, not marked done,
and not silently dropped — they are simply not what this page is for. Where
they go instead is the lane's judgement, and the commit says which: a
separate section further down, a count with a way to reveal them, or nothing at
all on this page because the ALTERNATIVES page is already where a candidate is
decided. **Prefer the last if it is true** — a concept whose candidate is
sitting on a contact sheet does not need a second home, and one fewer place is
better than one more.

**Both `bun run checks` and the director's ⚑ TO CHECK.** They read the same
derivation and must not disagree; a filter in one and not the other is worse
than no filter.

**An unbadged entry is an implementation.** Restatements written before the
badge existed carry none, and they are the ordinary case. Do not hide them —
absent must not read as `concept`, or old obligations vanish from the list
without anybody deciding they should.

**Say what the counts become.** The summary line at the top is the thing the
owner reads first; if it now counts fewer rows, it should be plain about what
it is counting rather than appearing to have shrunk on its own.

Finished when `bun run check` is green, `bun run checks` and the director's page
both list implementations only, unbadged entries still appear, and no concept
has been marked or lost.

`Check: open TO CHECK — is every row something the game or the tool now does differently, with no proposals mixed in?`

Model `sonnet`, effort `think`. Read `tools/checks/restated.ts`'s `badge` field
and `run.ts`'s rendering first, then the director's own page — the filter
belongs wherever the two share their derivation, not written twice.

## THE SWEEP REPORTS SUCCESS AND LEAVES THE DIRECTORY STANDING
_claude/burn-sweep-verify · tools/checks tools/checks/test docs/verification.md_
**Asked for by the owner**, twice over — once as a rule and once as the mess it
was meant to prevent:

> this means that once code is merged to main, we should already cleanup the
> old worktree branch with no action on it and all code merged already.

**The rule already exists and the tool already tries.** What fails is the
removal itself, on Windows, quietly. `git worktree remove` refuses while
anything holds a handle inside the tree — `node_modules` after a `bun install`
is the usual culprit — and the sweep moves on to the next branch. `git worktree
prune` then drops the registry entry because the metadata is gone, and the
**directory survives with nothing pointing at it**. Git believes it is gone and
the filesystem disagrees, which is the worst of the two possible wrong answers.

**Measured, not supposed:** one day of this run left **22 directories** under
`.claude/worktrees/` while `git worktree list` knew about **2**. Each orphan is
a whole checkout at some earlier state of the trunk, several hundred megabytes
apiece with its own `node_modules`.

**Why it is worse than clutter.** A path into an orphan looks exactly like a
path into the repository — same shape, same files, plausible in every way. A
session that follows one reads superseded code and reports a result about it,
and nothing anywhere says the tree is stale. That is the same class of failure
the preview's `/__preview` handshake exists to prevent, arriving by a door
nobody covered.

### What to build

**The sweep verifies rather than fires and forgets.** After removing a
worktree, check the directory is actually gone. If it is not, retry — and if it
still is not, **say so, by path, in the output**. A sweep that silently leaves
things behind is how twenty-two accumulate; a sweep that names what it could
not remove is a person's next command.

**Retry sensibly rather than fighting.** The handle is usually transient. A
short wait and a second attempt costs nothing; a loop that fights a locked file
forever costs a session. Decide the shape and say why in the commit.

**Never delete anything with uncommitted work in it.** `git worktree remove`
without `--force` refuses to lose work and that refusal is correct — it is the
one signal that distinguishes a live lane from a landed one. Whatever this
lands must keep that guarantee, and must not reach for `--force` to make the
verification pass. If a directory cannot be removed *and* holds uncommitted
files, that is a live lane and it must be left alone and reported as such.

**Clean up what is already there.** The orphans that exist now have no registry
entry, so nothing will ever revisit them. Offer to remove directories under
`.claude/worktrees/` that git does not know about — after the same
uncommitted-work check, since an orphan can still hold work somebody wants.

Finished when `bun run check` is green, a sweep that cannot remove a directory
says which one, an orphan with no registry entry is offered for removal, and a
directory holding uncommitted work is never touched.

`Check: sweep after a landing — is the worktree's folder actually gone from disk, and if one could not be removed does the output name it?`

Model `sonnet`, effort `think`, spent on the retry and on the uncommitted-work
guarantee rather than on the deletion. Read `tools/checks`'s clean path and
`docs/verification.md`'s loop first.

## THE WAVE EDITOR EXPLAINS ITSELF AT LENGTH, AND THE FIELDS ARE TOO SMALL TO WRITE IN
_claude/burn-wave-editor-tidy · tools/director/index.html tools/director/src/guide-fields.ts tools/director/src/wave-opening.ts tools/director/src/boss.ts tools/director/src/rail.ts tools/director/src/ship.ts tools/director/test_
**Asked for by the owner**, as one list. Every item is theirs; nothing here was
inferred.

### One functional change

**A text area grows to fit what is in it.** The owner:

> in the wave editor, i want that text size in textarea grows to the length of
> lines of text that it fits. so i want not to scroll text to edit or expand the
> textarea section.

No scrolling inside a field and no dragging a corner to see the rest. A guide's
three parts are paragraphs, and a field that shows two lines of a five-line
paragraph makes editing them a chore. There are four text areas in
`index.html`; the behaviour should belong to all of them by being general
rather than applied one at a time.

### The rest is words, and there is one principle under all of it

**The editor explains itself in prose that was written when these concepts were
new, and is now clutter to somebody who uses the tool every day.** A label
should name the thing. The reasoning belongs in the spec and in the director's
own `README.md`, where it already is. Cutting it is not losing it.

**Labels, renamed exactly as given** (`guide-fields.ts` and `index.html`):

- `BOTH SCREENS — what the thing is, never the whole instruction` → **`Player 1 & Player 2`**
- `PLAYER ONE — the cannon, the shield's trigger, the maw` → **`Player 1`**
- `PLAYER TWO — the shield itself, and the two colours` → **`Player 2`**
- `CONTROL SET — this wave is not the ordinary thing` → **`Control Set`**

The owner first wrote `PLAYER 1` in capitals and has since said that was a
slip rather than a choice: *"PLAYER 1" inconsistency was not on purpose. fix.*
So all four read as title case, as above.

**Prose to remove outright:**

- The Guide blurb — *"What the pair is told after this wave's introduction and
  before it starts. Leave all three blank for a wave that introduces nothing
  new — padding a wave with a guide is the same failure as padding it with
  entries."*
- The boss line in `boss.ts` — *"This wave has no boss. A boss belongs to its
  wave and is not added or removed here — it is authored in
  `packages/content/src/waves.ts`."* **This was added today, at the
  orchestrator's request**, to explain a button that had just vanished. The
  owner has seen it and does not want it. Their tool, their call.
- The opening line in `wave-opening.ts` — *"Opens on \"WAVE n · …\" and its
  sentence, then on its guide — which waits for both seats."* Remove both
  branches of it, the guide one and the no-guide one, since they are the same
  sentence twice.

**`WHAT THIS WAVE ADDS TO THE SHIP` collapses when there is nothing to say.**
The owner: *if there is nothing special, just say "nothing special" and remove
the boring rest.* So on an ordinary wave that section is two words and no
list.

**The selected control set keeps its sentence.** They also quoted *"The field
as it is taught: slide, trigger, swallow, fire."*, which is `why` on the
default control set in `packages/content/src/control-sets.ts`. Asked whether it
should go, the owner said to **keep it**: *ok, keep text for selected control
set.* So it stays exactly as it is, and `control-sets.ts` is not touched.

### A button instead of empty fields

> if there is no guide data for a wave, a "add guide" button is shown, if
> clicked the fields appear related replacing the button.

So a wave that teaches nothing shows one button, not three empty boxes. The
button is also the answer to a question the removed blurb used to answer —
*what do I do if this wave introduces nothing* — which is why the blurb can go
without leaving a hole: the interface says it instead of explaining it.

Decide what pressing it does to the data and say so in the commit: whether it
writes an empty guide immediately or only shows the fields until something is
typed. **A wave must not end up carrying an empty guide it never wanted** —
`packages/content/test/waves.test.ts` asserts that a wave introducing nothing
does not have one, and that test must stay green.

Finished when `bun run check` is green, a text area grows to its content, the
four labels read as the owner wrote them, the four pieces of prose are gone, an
ordinary wave's ship section says nothing special, and a wave without a guide
offers a button rather than three empty fields.

`Check: open a wave with a long guide and one with none — does every field show all of its text without scrolling, and does the empty one offer a single button instead of blank boxes`

Model `sonnet`, effort `think`, spent on making the growing text area general
rather than on the words. Read `tools/director/index.html`'s four text areas and
`guide-fields.ts` before starting.

## THE LURE — A BODY THAT ONLY THE NAVIGATOR CAN SEE THROUGH
_claude/lure-disguise · packages/content/src/creatures.ts packages/content/src/mechanics-table.ts packages/content/src/silhouettes.ts packages/content/src/wave-types.ts packages/content/src/waves/act-3.ts packages/sim/src/bullet-hit.ts packages/sim/src/creature-rules.ts packages/render/src/lure-alarm.ts packages/render/src/lure-vanish.ts packages/render/src/field.ts packages/audio/src docs/spec/bestiary.md tools/director/src tools/shape-sheet/src_
**Asked for by the owner:**

> for player 1 it is shown as a slick or bulb, but player 2 will see its "the
> runt". it must be very alarming and very clear what to do. […] player 2
> needs some alerting visual shape. I suggest we take a slick or bulb shape
> and color, but there is a white circle around it and an exclamation mark
> above it, next right or left text shown, something like "Runt! Don't
> shoot!". in the radar, we can also visualize it somehow like an exclamation
> mark, maybe the name of it above (only player 2 sees it). when player 2 hits
> it, the ship will lose health. but worst is, that they will lose time, and
> player 1 wonders, why player 2 doesn't shoot.

and, settling the four questions the first draft of this entry asked:

> player 2 needs to say player 1: "do not move to this one position - i will
> anyway not shoot it". I also suggest a missing mechanic on this enemy: right
> 2 tiles before it would hit the ship, it vanishes (nice animation - surprise
> me), so it wont hit the ship. […] yes sound is always good. he can turn
> sound not so loud, just on top of other visual indicators we have already.
> yes remove runt, and the runt shape we move to "not build yet" shapes
> section.

Nothing in this entry is open. Every decision it names has been made.

### The name

**`runt` is retired and the kind is `lure`; the wave is `THE LURE`.** "Runt"
named a body that was small and helpless, and the whole point of it was that
you could see it was small. This creature is the opposite: it is a full-size
slick or bulb in every pixel player 1 owns, and its danger is that it looks
like exactly what you want. The old name would be describing something the
game no longer draws.

`lure` rather than `mimic` or `decoy` because the cost is not the disguise, it
is what the disguise *does*: it pulls the cannon into a column and holds it
there. That is the thing the pair pays for, so the noun names the trap rather
than the costume.

Wave sentence: **"The one where the shot you are waiting for must never
come."**

### The mechanic

**One creature, two pictures, and the simulation only ever holds one truth.**
The sim knows it is a `lure` from spawn — nothing about the disguise is
stored, rolled or resolved there, so both devices agree about everything that
matters and rule 3 is untouched. The disguise lives entirely in `render/`,
which already takes `field.seat` and already draws different panels for
different seats.

**What player 1 sees:** a slick or a bulb. Full size, full colour, the real
silhouette, the real own-motion, and the real radar absence — player 1's radar
carries `guard` kinds only, so there is nothing to hide there and the leak
cannot arrive by that door. Player 1 has *no* way to tell, right up to the
vanish. That is the mechanic and it has to be exact: any tell at all — a size,
a wobble frequency, a rim, a sound — and the wave is decoration.

**What player 2 sees:** the same body, plus an alarm laid over it —

- a **white ring** around the body, outside its own contour and clearly not
  part of it;
- an **exclamation mark** above it;
- a short label beside it, on whichever side keeps it on screen:
  **`LURE — DO NOT SHOOT`**.

**And on player 2's radar**, which already carries the `aim` kinds
(`radarOwner`, `showsRadar` — do not re-derive that from `controls`): the same
exclamation glyph in the creature's column, with the kind's name above it, so
player 2 knows *before* it arrives rather than at the moment the thumb is
already moving. This is the more important half of the two. A hit should
always be player 2's haste, never player 2's surprise.

**What the pair has to say.** Player 2 holds the trigger, so player 2 does not
need permission to hold fire — the sentence that has to cross the room is the
other one, and the owner wrote it: *"do not move to this one position, I will
anyway not shoot it."* Player 1 is looking at a body worth shooting and is
being asked to leave it. That is the whole coupling: the one who can see it
cannot act on it, and the one who is acting cannot see it.

**Shooting it costs the hull.** `scoreRuntPenalty` is replaced by a hull cost
— a new named field in `SimConfig`, never a literal. The score penalty goes:
two currencies for one mistake reads as bookkeeping, and the hull is the one
the pair actually feels.

**It never reaches the hull.** The lure steps down like anything else until it
is standing `lureVanishRows` above the hull — a named `SimConfig` field,
default 2, so the distance is authorable and never a literal. It **occupies**
that row for its beat, in plain sight of both players, and goes on the beat it
would step off it. The last row player 1 ever sees it in is two above the
hull, close enough that the eye is already there. It costs nothing, it damages
nothing, and the only way it can ever hurt the pair is if player 2 fires at
it.

Standing on the row rather than vanishing on the way into it is deliberate:
it buys one more beat of player 1 holding the wrong column, which is the
entire cost of this creature, and it is the beat in which player 1 is most
sure they are about to be proved right.

**So the vanish is also the reveal.** The disguise never drops and player 1 is
never shown the truth in the body itself — but they see the thing they were
waiting to shoot disappear on its own, two rows up, which nothing else in this
game does. That is the vindication: the partner was right, and it arrives as a
picture rather than as an argument. It is worth being deliberate about — a
pair who has seen it once knows that a body which is not being shot at will
resolve itself, and the mechanic survives that knowledge intact, because they
still cannot tell *which* body until the column-seconds are already spent.

**The animation.** The lane's own to design; the constraint is that it must
read as *gone on purpose*, not as *killed* and not as *dropped*. It must not
borrow the destroy burst — that would tell player 1 they somehow got it — and
it must not borrow the reject flash. It is the one moment in the wave both
screens show the same thing, so it is drawn once, identically, for both seats.
Send the owner the frame.

**The cost that actually hurts is not in the sim at all.** With the vanish,
the lure is entirely free to ignore, and that is correct — its only teeth are
player 1 holding a column for a shot that will never come while something real
falls somewhere else. That is emergent and cannot be coded, which puts the
whole weight of this mechanic on **wave authoring**. A `THE LURE` wave in
which nothing else is happening teaches the shape and costs nothing; the wave
has to put a real target in another column on a beat that makes the wasted
seconds bite. If the wave is written lazily, the entire mechanic is inert and
the lane will not be able to tell, because everything it can test will pass.

### The sound

**On player 2's device only, and quiet.** A chime both phones make would carry
the disguise straight through the speaker in a room where two people are
sitting next to each other — which is the one door the rest of this design
closes carefully. It is an addition to the visual indicators, not a
replacement for them, and it is mixed low: the alarm is already on the radar
and on the body.

It obeys `docs/spec/audio.md` like everything else — body below 300 Hz or
sparkle above 3 kHz, and `packages/audio/src/band.ts` measures it rather than
trusting the intention. A short high transient reads as alarm without ever
entering the band the voices need, and the voices are the control scheme.

### Which body it wears, and in what colour

**Authored, never rolled.** The wave entry says it: a new `wears` field on the
spawn entry, `"slick" | "bulb"`, and the entry's `color` stops being `null` —
it carries the disguise's colour, which is what player 1 is shown and what
player 2 would have fired if they had not looked. Random would be a second
place where the trap is decided, and the author cannot compose a wave against
a shape they do not know.

This touches `wave-types.ts`, whose comment currently names `runt` as one of
the two kinds that carry no colour on purpose. That comment is now wrong and
the rewrite must say why, not merely delete it.

### The wave

Replaces `THE RUNT` in `packages/content/src/waves/act-3.ts`.

    name: "THE LURE"
    sentence: "The one where the shot you are waiting for must never come."
    guide.both: "One of these is not what it looks like. Only one of you can tell."
    guide.p1:   "You will see a body worth shooting and nothing will happen. Believe your partner and move — the column you are standing in is the one you are losing."
    guide.p2:   "The ringed one is a lure. Do not fire at it, and do not wait to be asked — say the column it is in and say the column to go to instead."

Entries: a lure wearing a bulb in one column, and a real slick two or three
beats later in another, close enough that the seconds spent standing on the
lure are the seconds the slick needed. The exact beats are the author's; the
one-sentence test is what they must satisfy, and it is the part of this lane
that no test can check — the lure costs nothing if ignored, so a wave that
does not make the wasted column-seconds bite leaves the mechanic inert while
every check still passes.

### The runt's shape goes to NOT BUILT YET

Not deleted. `RUNT` in `packages/content/src/silhouettes.ts` — four shallow
lobes at `sizeMul: 0.55` — moves to the NOT BUILT YET shapes section, where it
sits as a shape nothing draws yet rather than as dead content, and stays
available if a genuinely small creature is ever wanted. Its entries in
`tools/shape-sheet/src/catalogue.ts`, `subjects.ts` and `nameability.ts` move
with it; a shape in the catalogue that no kind maps to is exactly the kind of
drift `silhouettes.ts` warns about.

**And a question in `docs/alive.md` dissolves on the way past.** That file
carries an open owner decision: the runt draws at about 10.3 px, below
`docs/spec/graphics.md`'s own line that at 11 px nothing of a figure survives,
and every proposal for runt interior work died on it. A lure has no small form
— it is a slick or a bulb at full size on both screens, and the alarm is drawn
over it rather than in it. The question stops existing rather than being
answered. Say so in the commit, and strike it from `docs/alive.md` in the same
pass so nobody spends a session on it later.

### Rules this lands under

**A look is offered, never replaced** does not hold this back, on two of its
three named exemptions at once: the owner asked for this drawing by name, and
nothing shipped is being replaced — no marking like it exists today. It lands
on the field rather than on a NOT BUILT YET card. The one part that *is* a
replacement is the runt's body disappearing from player 1's screen, and that
is the mechanic rather than a preference, which the commit should state in
that word.

**Check the alarm against `torch-alarm.ts` before drawing it.** There is
already an alarm marking in this game. Two alarms that look alike are worse
than one alarm that is ugly, and this is the check the lane owes: a white ring
and an exclamation must not read as the thing player 2 has already learned
means something else.

### Everything that moves in the same pass

- `creatures.ts` — the kind, its `controls: ["aim"]` (unchanged, and for the
  same reason: not firing has to be a restraint, which needs the trigger to
  exist), its `radar: "p2"`, its blurb.
- `mechanics-table.ts` — the row. `as const satisfies` will fail the typecheck
  until it is there, which is the point of it.
- `bullet-hit.ts` — `resolveRunt` becomes `resolveLure`; the score line becomes
  a hull line; the header comment explaining *why reaching the hull is not
  special-cased* now explains the opposite and is rewritten, not edited.
- `creature-rules.ts` / the step that walks a creature down a row — the vanish,
  and a `lureVanished` event for render and audio to hang off.
- `config.ts` (owned by nobody — one contiguous region) — the hull cost and
  `lureVanishRows`.
- `packages/sim/test/runt.test.ts` → `lure.test.ts`: shooting it costs the hull
  and removes it; the hull cost floors at zero; **it occupies the row
  `lureVanishRows` above the hull for exactly one beat and is gone on the next,
  with the hull untouched**; and the replay fingerprint.
- `packages/render/test/frame.test.ts` — the alarm and the vanish are drawn, so
  they are drawn there too, both seats, plus a lure at the field edge so the
  label's side-flip is exercised.
- `packages/render/test/restart.test.ts` — only if the vanish caches anything
  across frames. It should not; if it must, it belongs in `Effects` and is
  cleared in `Effects.reset()`.
- `packages/audio` — the cue and its speech-band assertion.
- `waves-demo.ts`, `docs/spec/bestiary.md`, `docs/alive.md`, and the director's
  brushes — a new authorable kind needs its brush in the same pass, not the
  next one.

### The check this lane owes

Two seats, at tempo, on two phones:

> on player 1's screen, is the lure genuinely indistinguishable from a real
> slick or bulb right up to the moment it goes — and on player 2's, does the
> ring and the exclamation read as *stop* within the half-second before a
> thumb moves, without being confused for the torch alarm?

and a second, because it is a different question and a still cannot answer it
either:

> does the vanish read as *gone on purpose* — and does player 1, who has just
> been told to leave a column and did not want to, feel proved right by it?

Neither half of the first can be answered from one screen at all.

### One orchestrator note

**Two things named in this spec have moved since it was written.** Shadows were
removed from the game entirely — `cast-shadow.ts` and `contact-shadow.ts` are
gone along with two `SimConfig` fields — and the director's pages were
rearranged: `STATES` is now a tab of a sheet called `GAME MECHANICS`, and the
`CONTROL SETS` page is now `CONTROLS` with its own inner tabs. Read the tree as
it is.
