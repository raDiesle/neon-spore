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

## THE CANNON LAYS THE SHOT LIKE A HEN LAYS AN EGG
_claude/burn-cannon-egg · tools/versus/candidates/cannon-shot packages/render/test_
**Asked for by the owner.** Said in German; translated here, because everything
written down in this repository is English:

> It should look as though a hen is pressing out an egg. So the shot should be
> pushed out somewhat slowly as it is expelled, so that you can see the
> animation. The round circle on top of the cannon is obsolete — instead it
> should look like a bulge towards the ship, like a chicken's bottom/cloaca,
> where the egg is pressed out and pops free.

**And they said where it goes, in the same breath: not onto the field.** This
is a candidate, offered beside the shipped shot, and the owner decides by
looking. `tools/versus/candidates/cannon-shot` already holds `pip` and
`streak`, so this is a third one beside them and the vote is the mechanism —
`docs/versus.md` has it. Nothing in `packages/render/src` changes. A lane that
finds itself editing `muzzle.ts` or `cannon-maw.ts` has misread this entry.

### The two halves, and they are separable

**The bulge.** The round circle sitting on top of the cannon goes, and what
replaces it is a swelling on the side that faces the ship — a cloaca rather
than a port. It is not a hole the shot comes out of; it is a body part that
distends. So it is *not* symmetrical, it has a direction, and the direction is
towards the ship. Draw it as the contour it is: this repository's whole visual
grammar is closed contours with lobes (`blobPath`, `hullRadiusMul`), and a
bulge is exactly a lobe that grows.

**The laying.** The shot does not appear, it is pressed. Slowly enough that a
player sees it happen — the owner said so explicitly, and *slowly* is the whole
request, so a candidate that is merely a different shape has answered half of
it. The arc worth building is the one an egg actually has: the bulge swells and
strains while nothing leaves, the shot emerges gradually and stretches the
contour around itself, then it clears and the bulge relaxes. The interesting
beat is the relaxation, which is the part that says *effort* rather than
*flash*, and it is the part a first attempt leaves out.

### The one thing that would make this a different entry

**It is a render candidate and may not change when the shot becomes live.**
`packages/sim/src/shot-charge.ts` decides that, two devices have to agree on
it, and a candidate cannot touch it. So the laying is drawn over the timing
the game already has: the shot leaves when it leaves, and the animation is what
is drawn around that moment.

If the animation turns out to need the shot to genuinely leave later — if
drawing it over today's timing looks like a fast shot with a slow decoration
glued to it — **stop and report that**, because slowing the shot itself is a
balance decision the owner has not made, and it is a separate entry with the
sim in it. Say which of the two it turned out to be. That sentence is the most
useful thing this lane can produce.

Finished when `bun run check` is green, the candidate stands beside `pip` and
`streak` in the versus tool, and neither the shipped cannon nor anything in
`packages/render/src` has moved.

`Check:` write one, badged `concept`, and make it a comparison — the owner is
being asked whether this is worth building, not whether it is correct. `before`
is the shipped shot, `after` is the candidate by the name you give it.

Model `sonnet`, effort `think hard`, spent on the timing rather than the
outline: read `docs/versus.md` and both existing candidates first, and get the
strain-then-release arc right before drawing anything, because a bulge with no
effort in it is a circle in a different place.

## THE TEACHING DOCUMENT DESCRIBES A GAME THAT WAS NEVER BUILT
_claude/burn-teaching-reconcile · docs/teaching.md docs/INDEX.md_
**Asked for by the owner.** Asked whether to retire it or reconcile it, and
they chose:

> yes reconcile teaching.md
>
> In the future, i plan to create nicer guide introduction in waves with nice
> animations and less text.

**So this is not a rename and it is not a deletion.** `docs/teaching.md`
specifies THE CALL — designed 27 August 2026, scored by three judges, dealt
subject cards, a `taught` memory, an ordering — and none of it was built. What
shipped is the introduction and the guide: a wave opens on its number, name and
sentence, then carries its own help inline, and there are no subjects, no
dealing order and no memory. The document still describes the other thing, in
the present tense, beside code that contradicts every noun in it.

### The three things the rewrite has to keep apart

**What the game does.** Written as what it is, in the vocabulary that shipped —
introduction, guide, the two halves, both seats acking. `docs/spec/briefings.md`
is the spec and already says this; teaching.md must not become a second,
drifting copy of it. Cross-reference rather than restate, and say which file
owns which question.

**What was designed and not built.** THE CALL's reasoning is worth keeping —
three shapes scored by three judges is work nobody should redo — but it must be
unmistakably marked as a design that was not taken, with one honest sentence
about *why* the game went the other way. The next session reading this file has
to be unable to mistake it for a description of the game.

**Where the owner is going.** Quoted above and it is the load-bearing part: the
guide becomes animation and short text rather than paragraphs. Write that down
as the direction, because it is already why `Wave.guide` is an object with
named parts rather than three strings — an animation arrives as a key beside
the words and no wave file has to move. Say that connection explicitly; it is
the difference between a doc that dates and one that tells the next session
where the room was left for them.

**And the words that shipped are a placeholder.** Today's guides are prose
because prose is what the cards were. Under the owner's direction they are the
first draft of something shorter with a picture beside it, and the document
should say so rather than presenting the current wording as settled.

### Two things this lane may not do

**It may not rename the vocabulary and call it done.** That was the original
queue entry and it was wrong: renaming THE CALL's nouns to the shipped ones
would turn a design document into a false description of a shipped feature,
which is worse than either honest option.

**It may not change any wave's guide text.** Shortening the words is the
owner's own step-by-step work, said in as many words, and a lane that improves
the prose on the way past has spent a decision that was not its to spend.

`docs/INDEX.md` is included so the row describing this file can say what it now
is. Nothing else in the repository changes.

Finished when `bun run check` is green, `docs/teaching.md` cannot be mistaken
for a description of the shipped game, the design that was not taken is
preserved and marked as such, and the owner's direction is written down where
the next session will read it.

**No `Check:` trailer.** This is a document, and there is no half of it a
player could go and look at. Do not invent one.

Model `sonnet`, effort `think`. Read `docs/spec/briefings.md` and
`packages/content/src/wave-types.ts`'s `guide` doc comment before rewriting
anything, so the two files agree and neither restates the other.

## EVERY PANEL IN THE DIRECTOR MINIMIZES, AND CLAUDE CAN DO IT TOO
_claude/burn-director-minimize · tools/director/index.html tools/director/src/panels.ts tools/director/src/main.ts tools/director/test/panels.test.ts_
**Asked for by the owner**, from the browser a session drives:

> in the browser opened by claude i see there is not enough space for the game
> screen. if only the game screen is relevant, and not editing functionalities,
> I suggest we introduce minimizing to every panel of the director, which I and
> claude can minimize - depending on what is currently relevant.

**This is the third time the same pressure has shown up**, and the first two
were solved by deleting things: `8719a42` took LEDGER out to give the field the
room it was using, and `4aa770e` folded Briefings and the balance sheet into
buttons. Both worked and neither generalises — the next panel that is in the
way needs another decision from the owner. A panel that can be put away is the
general answer, and it is why this entry is worth more than its size.

### One mechanism, not fourteen

The director's panels are `<h2>` headings inside sections in
`tools/director/index.html`, styled from the one inline `<style>` block. So the
work is a single mechanism applied to all of them, not a control added
panel-by-panel: a heading gets a way to collapse what is under it, and every
panel gets it by virtue of being a panel. A lane that hand-writes a toggle per
section has built the thing that rots the first time a panel is added.

**Decide what "every panel" means and say it in the commit.** The field itself
is not a panel and must never collapse; the transport row under it probably is
not either. Everything the owner would call an editing functionality is. Where
that line falls is the lane's call, and the reader of the commit should be able
to tell why a given thing did or did not get a handle.

### The half that is easy to drop: Claude can do it too

The owner said *which I and claude can minimize*, and the second half is not
decoration. A session driving this page has no hands — it opens the director
headlessly to look at one wave, and the panels it wants out of the way are in
the way of the very screenshot it is taking. So the mechanism needs a way in
that is not a mouse. Two obvious shapes and the lane picks, saying which:

- a URL parameter, so the page opens with the right things already away and one
  navigation is the whole gesture;
- a named handle on the page a driver can call, the way
  `window.neonSpore` already exists for exactly this reason in the game.

A URL parameter is likely the better one — it survives a reload, it needs no
round trip, and it is the same string a person can bookmark.

**And the owner's choice has to stick.** They minimize a panel because it is
not relevant *today*, so it should still be minimized after a reload. Persist
it in the browser rather than in the URL for the human's case, and let the URL
parameter override, so a session's request does not permanently rearrange the
owner's window.

### What must not happen

**The field must not move when a panel collapses and reopens.** A stage that
jumps by four pixels every time something is put away is worse than a cramped
one, because the thing being judged is motion. If the layout cannot hold the
field still, say so rather than shipping the jump.

**No panel may become unreachable.** A collapsed panel still shows its heading
and can be opened again — collapse is not deletion, and a panel that vanishes
without a handle is a feature nobody can undo.

Finished when `bun run check` is green, every panel that should have one has a
handle, the owner's collapsed panels survive a reload, a session can open the
director with panels already away without touching a mouse, and the field does
not shift when a panel opens or closes.

`Check: with the editing panels put away, is the director's field big enough to judge a wave — and does anything shift under you when you open one again`

Model `sonnet`, effort `think hard`, spent on the one mechanism rather than on
the styling. Read `tools/director/index.html`'s `<style>` block and the stage
column before writing, and see `docs/verification.md` for how the earlier two
space fixes were judged.

## A BOSS BELONGS TO ITS WAVE, AND NEITHER CAN BE ADDED OR TAKEN AWAY
_claude/burn-boss-fixed · tools/director/src/boss.ts tools/director/src/rail.ts tools/director/test packages/content/test/waves.test.ts_
**Asked for by the owner**, of the wave configuration:

> the wave configuration: we dont need the option to add a boss or remove it.
> instead a boss wave is not deletable or duplicates of boss cannot exist.

**The rule under both halves: a boss exists exactly once, and the wave it is
on is the wave it is.** A boss is not a thing placed on a wave the way a rock
is — `boss.ts` says so already, in its own words: *she is not placed at a beat,
she is the whole wave.* The editor contradicts that by offering to add one to
any wave and take it off again, and the wave list contradicts it by letting a
boss wave be copied or deleted like any other.

### What is there now

`bindBossPanel` (`tools/director/src/boss.ts`) draws a bar of buttons —
`REMOVE BOSS`, and `+ BULB QUEEN`, `+ THE MIRROR`, `+ THE WARDEN`, `+ THE VANE`
for whichever the wave is not carrying. `setBoss` writes or clears
`wave.boss` outright. In the wave list, `rail.ts:177` duplicates the current
wave with `copyWave` and `rail.ts:184` deletes it, neither asking what the wave
is.

So today a session or a slip can produce two waves both carrying THE WARDEN, or
none carrying it at all, and nothing anywhere says that is wrong.

### What it becomes

**The bar of add/remove buttons goes.** What stays is everything below it —
the boss's own editor, its cycles, THE MIRROR's rounds, the queen's petals.
Editing a boss is the point of that panel; choosing whether the wave has one is
not a question the tool should be asking.

**A boss wave cannot be deleted**, and **duplicating one may not produce a
second copy of that boss.** The second has two honest answers and the lane
picks one, saying which in the commit: refuse the duplication outright, or copy
the wave *without* the boss so the copy is an ordinary wave. Refusing is
simpler and matches the owner's sentence most closely; copying-without is
kinder to somebody who wanted the wave's spawn pattern. Either is defensible —
what is not defensible is a second wave carrying the same boss.

**Say what happens to the control that is now gone, on screen.** A button
vanishing is fine; a button vanishing and leaving a person wondering how to
make a boss wave is not. One line in the panel saying a boss belongs to its
wave costs nothing and answers it.

### Where the invariant actually belongs

**A disabled button is not an invariant.** The tool is one way to edit these
waves and the files are another, so the rule wants a test where the data is:
in `packages/content/test/waves.test.ts`, beside the one-sentence test and the
guide test it already has — **every boss kind appears on at most one wave.**
That is the assertion that survives somebody editing a wave file by hand, and
it is what makes the buttons' removal a statement rather than a preference.

**And if a new boss is ever added, it arrives with its wave**, the same way
`.claude/skills/new-creature` now says a creature arrives with a wave and a
guide. Worth one line in that skill if the shape fits; if it does not, say so
rather than forcing it.

### What must not change

Nothing about how a boss *plays*, nothing in `packages/sim`, and no wave's
content. This is the editor being made to agree with a rule the game already
lives by — say that in the commit, because it is what keeps it from reading as
a feature removal.

Finished when `bun run check` is green, the boss panel offers no way to add or
remove a boss, a boss wave cannot be deleted, duplicating one cannot produce a
second copy of that boss, and a test in `content` fails if two waves ever carry
the same one.

`Check: in the wave list, try to delete or duplicate a boss wave — does the tool stop you, and does the boss panel still let you edit the boss itself`

Model `sonnet`, effort `think`. Read `tools/director/src/boss.ts` and
`rail.ts`'s duplicate and delete before writing. The thinking goes on where the
rule lives — the buttons are the symptom and the test in `content` is the fix.

## THE TOPBAR AND THE WAVE PANEL BOTH SHED INTO ONE RENAMED PAGE
_claude/burn-topbar-fold · tools/director/index.html tools/director/src/states-page.ts tools/director/src/controlsets-page.ts tools/director/src/ship.ts tools/director/src/demo-panel.ts tools/director/src/main.ts tools/director/src/tuning.ts tools/director/src/rail.ts tools/director/test_
**Asked for by the owner:**

> topbar:
> move "control sets", "Ship", "Demos", "Main Menu" buttons and contents into
> "States" page. rename "States" to be something like "Game Documentation"

**The topbar has nine buttons and is the third place this month that ran out of
room** — the field lost LEDGER for the same reason, and a whole entry below
this one asks for every panel to be collapsible. This is the same pressure with
a different answer: four of the nine are not *tools*, they are **reference** —
what a control set contains, what the ship's dials are, what a mechanic looks
like demonstrated, and the game itself. They belong together behind one door.

### What is there now

`▣ STATES` is a full-screen shell (`#states`, `statesBody`, `states-page.ts`)
whose subtitle already describes reference material: *every state the game can
be held in, drawn — a real frame of the shipping renderer*. The four to fold in
are `⎈ CONTROL SETS` (`controlsets-page.ts`), `⚙ SHIP` (`ship.ts`),
`▶ DEMOS` (`demo-panel.ts`), and `▶ MAIN MENU`.

**`NOT BUILT YET` already has the shape to copy** — `#backlogTabs`, a row of
tab buttons over one body. The renamed page becomes the same thing with a tab
per section, so nothing has to be invented and the two big pages behave alike.

**MAIN MENU is the odd one and needs a decision.** It is not a panel — it is an
`<a href="/game?menu=1" target="_blank">`, a link out to the running game. There
is no content to move, so folding it in means the page carries the link. Do not
turn it into a tab that opens an empty body; put it where a reader looking for
*how do I just play it* would find it, and say in the commit where that was.

### The name

**GAME MECHANICS.** The owner first said *something like game documentation*
and then chose this instead, so it is decided rather than suggested: use it
exactly, and do not shorten it. It is renamed everywhere it appears:
the button, the page header, and any prose in `index.html` or the director's
`README.md` that calls it STATES.

### What must not change

**Every folded page keeps working exactly as it does**, including the one trap
`controlsets-page.ts` documents in its own `setWorld` comment: it poses a real
*shipped* wave on purpose, because the band reads the wave index. That comment
must survive the move, and the behaviour with it.

**Nothing about what any of those pages draws changes.** This is four doors
becoming one door with four rooms behind it. A lane that improves a page while
moving it has spent a decision that was not its to spend — put it in the
report.

**And the topbar keeps five buttons**, so check the ones that remain still fit
and still read as a row. If the point was room, the commit should be able to
say how much room was won.

### And TUNING leaves the wave panel for the same page

Added by the owner after the rest of this entry, in the same breath as it:

> move the "tuning" configuration away from wave panel to "topbar" -
> "states"/"game documentation"

**It is folded into this lane rather than queued separately** because it is the
same file, the same page and the same tab shell, and two lanes restructuring
`index.html` at once is a conflict nobody would enjoy.

**Its own note already argues for the move.** Under the sliders, `index.html`
says: *Tuning is the run, not the wave. It is never written to waves.ts — saved
presets live in this browser.* So it has been sitting in the wave panel while
telling the reader it has nothing to do with the wave. Moving it is the panel
finally agreeing with its own footnote, and that sentence should survive the
move.

**One honest tension, named and not resolved by the lane.** The other four
sections are reference — they describe what the game *is*. Tuning is a live
control that changes the run underneath you. Putting a control inside a page
called GAME MECHANICS is a slight lie, and the lane may not rename the page
to fix it, because the owner chose that name. Give tuning its own tab, keep the
note that says what it is, and if the mismatch still reads badly once it is
built, **say so in the report** rather than inventing a different name.

**And expect wind-up to be gone.** `claude/burn-windup-alternative` takes
cannon wind-up out of these sliders and moves it to the alternatives page. If
that lane has landed first, do not go looking for the slider; if it has not,
move what is there and let it replay.

Finished when `bun run check` is green, the topbar no longer carries CONTROL
SETS, SHIP, DEMOS or MAIN MENU, the wave panel no longer carries TUNING, all
five are reachable from the renamed page, nothing they draw has changed, and no
text anywhere still calls the page STATES.

`Check: with four buttons gone from the top bar, can you still find the control sets, the ship's dials, the demos and the way into the game — and does the bar read as less crowded`

Model `sonnet`, effort `think`. Read `tools/director/index.html`'s `#backlog`
block for the tab pattern to copy, and each of the four pages' own entry point
before moving anything.

**Expect to replay.** `index.html` is wanted by the alternatives lane above and
by the panel-minimize entry; both were written before this one and neither
works in the topbar.

## THE FORK RETIRES, AND EVERY GUIDE ENDS ON TWO CIRCLES HELD UNTIL READY
_claude/burn-ready-circles · packages/sim/src/fork.ts packages/sim/src/briefing.ts packages/sim/src/commands.ts packages/sim/src/step.ts packages/sim/src/world.ts packages/sim/src/hash.ts packages/sim/src/events.ts packages/sim/src/wave-start.ts packages/sim/src/config-pair.ts packages/sim/src/config.ts packages/sim/src/index.ts packages/sim/src/hull.ts packages/sim/test packages/render/src/briefing.ts packages/render/src/hud.ts packages/render/test packages/content/src/mechanics.ts packages/content/src/mechanics-table.ts packages/content/src/waves-demo.ts packages/audio/src/bind.ts apps/game/src/briefing.ts tools/director/src/pair-panel.ts tools/director/src/ship-fields.ts tools/director/src/ship.ts docs/spec/briefings.md docs/spec/systems.md_
**Asked for by the owner:**

> remove "the fork" logic and state in the flow. I dont need this to be a
> separate config.
>
> Instead i want its idea to be there for every wave in the step when a guide
> card is shown. players must hold down a circle in the middle. they will see
> also circle for other player. when one player is hoding the circle, it fills
> up like a loading indicator. when it reaches full for one player it says
> inside of circle or above below "ready". when both players tapped long enough
> so circles are both ready, the wave will start playing.
>
> like that players can say if they read the guide description ( had enough
> time) and are ready to start playing the wave.
>
> this mechanic should be consistent for all waves, which have a guide/card
> enabled.

**This is a replacement, not a deletion.** THE FORK's idea — *the pair decides
when to go, and no clock decides it for them* — is kept and moved to where it
belongs, which is the end of the thing the pair is actually reading. What goes
is a second gate at the same seam with its own config switch.

### What THE FORK is today, so the lane knows what it is dismantling

A gate between waves, crossed only while player 1 holds the lance and player 2
presses a colour, behind `cfg.forkBetweenWaves`. `packages/sim/src/fork.ts`
argues three things and **two of them survive the move**:

- **There is no timeout, deliberately.** *A clock that eventually started the
  wave anyway would make the wait decorative — the pair would learn its length
  and stop committing.* The ready gate inherits this exactly: it waits forever.
- **It is not a free repair bay.** The hull stops regenerating while a fork is
  open (`regenerateHull` in `world.ts`), so standing and talking is not the
  cheapest way to play. **This is the rule most likely to be dropped by
  accident.** Decide whether the ready gate pauses regeneration too, and say
  which in the commit — a guide the pair can sit behind while the hull heals is
  the same exploit through a new door.
- **THE FORK first, then the card**, with a long argument about not stacking two
  "both of you press something" gates back to back. That argument dies with the
  fork, and its dying *is* the point of this entry: there is now one gate, at
  the end of the reading, which is what the second half of that comment wished
  for.

`fork.ts` is deleted, not emptied, and its two surviving paragraphs move into
whichever file now owns the gate. Do not lose that prose — it is the reasoning
somebody will otherwise re-derive.

### What replaces the guide's dismissal

Today a guide holds until both seats have acked, one press each. That becomes:
**each seat holds a circle, the circle fills, it says READY when full, and the
wave starts when both are ready.**

**Each screen shows both circles — yours and theirs.** The owner asked for this
in as many words, and it is the part that makes the gesture two-player rather
than two solo ones: you can see your partner is still reading, or that they
finished a while ago and are waiting on you. A screen that draws only its own
circle has built the same feature with the meaning taken out.

**The fill lives in the simulation, in the hash, counted in ticks.** It decides
when the wave starts, so two devices must agree on it to the tick — unlike the
introduction's few seconds, which the app counts precisely because nothing
depends on them. Integers, rule 3, and `bun run test:determinism` is the guard.

**Does letting go reset the fill, or pause it?** Not settled by what the owner
said, and it is the one real design question in the lane. There is a precedent
pulling one way: THE WARDEN's pull **accumulates**, and `config-boss.ts` says
why — *the question the fight asks is when the other player can spare their
hand, never whether they can hold it steady on a phone.* That reasoning is
about a fight, and this is not one; a reset is arguably right here, because the
gesture means *I have read it* and a slip costs nothing but a second. **Follow
the warden unless there is a reason not to, and write the reason down either
way** — this is exactly the kind of choice that is invisible six months later.

**Only waves that carry a guide.** A wave with none runs its introduction and
begins. The owner said so, and it also means the gate appears where there is
something to have read, which is what makes it mean anything.

### The two integrations that will be missed

~~The director's test role puts one person in both seats.~~ **Answered by the
owner below: in test mode one press completes both circles.** Left here so the
question is visible with its answer beside it rather than looking unasked.

**A desk has no thumb to hold.** The keyboard path already sends the guide's
dismissal; a hold-to-fill needs a key held rather than pressed, per seat, and
the game and the director copy each other's layout deliberately. Do not leave
the PC unable to start a wave.

### The owner's three clarifications, given after the rest of this entry

**The press target is the whole screen, not the circle.** Their words: *the
circles should start completing if player presses anywhere on the screen.* So
the circle is an **indicator**, never a button — it shows how far your hold has
got and it is not a thing you have to hit. That matches what the guide already
does today, whose *hit area is the whole screen* for the reason
`packages/render/src/briefing.ts` gives in as many words: there is exactly one
thing to do here and nowhere else to press, so a target the size of the stage
is one nobody has to look for. Do not shrink that target to the drawn circle —
it would be a regression dressed as precision.

**In test mode one press completes both circles.** Their words: *in test mode,
it completes both circles.* One person at a desk is both seats, so the gate
must not ask them for two simultaneous holds. This settles the question this
entry raised about the director's test role — it is answered, not open.

**A wave with no guide gets the breath and nothing else.** Their words: *In
case there is a wave with no guide card, yes there is just the automatic
breath, where its showing wave name description and number - then the wave
sequences start.* So the introduction alone, on its timer, and straight into
play. **No circles appear on a wave that carries no guide** — the gate exists
because there was something to read.

**And the rest between waves is not lost**, which was the worry that prompted
the question: the owner pointed out that wave 13 carries a guide, so the pause
is still there wherever a wave teaches something. Where a wave teaches nothing,
the breath is the pause, and that is the intended shape rather than an
oversight.

### What is retired

`forkBetweenWaves` in both configs, `fork.ts`, the `forkWait` event, the `fork`
entry in `mechanics.ts` and `mechanics-table.ts`, its switch in the director's
ship fields, its sound in `packages/audio`, and whatever `waves-demo.ts` uses
it for. `tools/orphans` and `bun run check` are the guards against leaving a
corpse. **Several files matching "fork" are false positives** — a forked
*shape* in `scars.ts`, `contact-shadow.ts` and the vein skins has nothing to do
with this. Check before touching.

### The rule this is exempt from

It changes what a player sees, which *a look is offered, never replaced* would
normally send to a candidate page. Exempt under the first named exemption: the
owner asked for it by name, in the words above. That covers this gesture and
nothing else — do not improve any other look on the way past.

Finished when `bun run check` is green, `bun run test:determinism` passes,
nothing named `fork` remains outside the false positives, every wave carrying a
guide ends it on two circles that fill and say READY, both circles are visible
on both screens, and the wave starts only when both are full.

`Check: at the end of a guide, do two circles fill as you and your partner each hold one — can you see theirs filling as well as your own, and does the wave wait until both say READY`

Model `opus`, effort `ultrathink`, spent on the gate's rules before any
drawing: what the fill is counted in, what letting go does, and what the
single-handed director does. Read `packages/sim/src/fork.ts` whole — including
the comment — then `packages/sim/src/briefing.ts`, before deleting anything.

## CANNON WIND-UP LEAVES THE TUNING SLIDERS AND BECOMES AN ALTERNATIVE
_claude/burn-windup-alternative · tools/versus/candidates tools/director/src/ship-fields.ts tools/director/src/ship.ts packages/content/src/mechanics-table.ts docs/versus.md_
**Asked for by the owner:**

> wave - "tuning" - "Cannon wind-up" should be moved to "not build yet" -
> "alternatives". once decided it will always be the new animation of shooting
> with its delay.

**Read the second sentence as the decision it is.** Wind-up stops being a dial
somebody might set per run and becomes a *proposal*: either the game's shots
work this way from now on, or they do not. That is exactly what the
alternatives page is for — the owner looks at both and picks — and it is why a
slider was the wrong home. A slider says *choose a value for today*; this is
one question with one answer.

### What wind-up is, and why it is not like the other candidates

`shotChargeBeats` (`packages/sim/src/config-shot.ts`, default `0`, off). With
it set, a press does not fire: the shot leaves on the next point of a grid
measured in beats, and player 1 can watch it happen. It is exposed as a run
tuning slider in the director's TUNING section and as the `windup` mechanic in
`mechanics-table.ts`.

**And here is the difficulty this whole entry turns on.** Every candidate in
`tools/versus/candidates` today — `pip`, `streak`, `heave`, `tick`, `warm` — is
a **patch to a record the draw path reads**. Wind-up is not. It changes *when
the shot leaves*, which is simulation: it is in the hash, two devices must
agree on it, and it changes the game's timing rather than its picture. So it
cannot be dropped into the candidates folder beside the others and be shown by
the same machinery.

**That is the lane's real question, and it must not be answered by force.**
Roughly two shapes, and there may be a third:

- **The versus page learns to carry a candidate that is a config value**, drawn
  as two live worlds run with different configs rather than two draw records.
  Honest, and more work than it sounds — two worlds mean two simulations at
  tempo, side by side, both firing.
- **Wind-up is shown some other way** and the alternatives page only carries
  looks. Then the entry is about where an owner decides a *rule*, which the
  repository may not have a home for yet.

**Read `docs/versus.md` before choosing, and if neither shape fits, stop and
report rather than bending the candidates folder around a thing it was not
built for.** A candidates mechanism that quietly handles two unrelated kinds of
thing is worse than a second mechanism honestly named.

### It is already on in the real game, which the ask does not know

`apps/game/src/main.ts:44` builds its config with `shotChargeBeats: 0.5`. So
**every player of the actual game already shoots with the wind-up**, and has
been. It is off in `DEFAULT_CONFIG` for a stated and good reason — every
headless replay keeps its timing to the tick — and on in the app for a stated
and good reason, which the comment above that line gives: *a shot that is laid
over half a beat is a press player 1 can see, where a press that was instantly
a bullet reached him only as a result.*

**This changes what the entry is asking for and the lane must not paper over
it.** The owner wrote *once decided it will always be the new animation of
shooting with its delay*, which reads as though wind-up is a thing not yet
switched on. It is switched on. So the honest options are different from the
ones above:

- **Tell the owner and stop.** They may simply not have known, in which case
  the ask may dissolve — there is nothing to decide, only a slider to remove
  from a place it does not belong.
- **Or the alternative is the other direction**: the page offers the shot
  *without* the wind-up beside the shipped one *with* it, which is a real
  comparison and the reverse of what the entry assumed.

**Whichever, the tuning slider still leaves the wave panel**, because the owner
is right that it is not a per-run dial. That half of the ask holds either way.

Found by the lane building the cannon candidate, which needed to know how long
the shot's window actually is.

### Its neighbour, which is not a coincidence

`claude/burn-cannon-egg` puts the hen-and-egg shot animation in the same
candidates folder, and that entry forbids the candidate from slowing the shot
— because the shot's timing is a balance decision the owner had not made.
**This entry may be that decision arriving.** If wind-up is adopted, a shot
that leaves on the next grid point is a shot with a sanctioned delay in front
of it, which is exactly the room an egg being pressed out needs.

Do not merge the two lanes and do not make either depend on the other. But say
in the commit whether the two candidates can be looked at together, because the
owner will want to judge the egg *with* the delay if the delay is going to
exist.

### What must not change

**No default moves.** `shotChargeBeats` stays `0` until the owner decides by
looking; this lane offers the alternative, it does not adopt it. The game as
shipped fires exactly as it does today.

**The mechanic entry stays honest.** `windup` in `mechanics-table.ts` describes
a run mechanic with a switch; if it is no longer a run tuning, that entry says
what it now is rather than being left describing a slider that has gone.

Finished when `bun run check` is green, the TUNING sliders no longer offer
cannon wind-up, the alternatives page offers it as a thing to decide, the
shipped default is untouched, and the commit says how a rule-shaped candidate is
shown differently from a look-shaped one.

`Check: on the alternatives page, can you see a shot with the wind-up beside a shot without it, both firing, and tell which one you want the game to have`

Model `sonnet`, effort `think hard`, spent on where a rule-shaped alternative
lives rather than on the drawing. Read `docs/versus.md`,
`tools/versus/candidates/index.ts` and `packages/sim/src/shot-charge.ts` whole
before deciding anything.

## THE THINGS YOU TOUCH ON THE FIELD ARE A KIND OF CONTROL, AND NOTHING NAMES THEM
_claude/burn-controls-page · tools/director/src/controlsets-page.ts tools/director/src/backlog-page.ts tools/director/index.html docs/spec/controls.md tools/director/test_
**Asked for by the owner**, in the same message that settled THE WARDEN's pull:

> behalte die aktuelle alte Mechanik nur halten in "not done yet" irgendwo
> fest. vielleicht ein neuer Tab in control panels (wir benennen in in
> "controls" um. dann können wir auch alternative in screen controls hier
> dokumentieren und ggf testen.
>
> wichtig, dass alle in screen controllen (nicht control panels unten im
> screen) auch in der game mechanics Seite dokumentiert werden

Translated: *keep the current old mechanic — hold only — recorded somewhere in
"not done yet". Perhaps a new tab in control panels, which we rename to
"controls". Then we can document alternative in-screen controls there too, and
test them if need be. Important: every in-screen control (not the control
panels at the bottom of the screen) must also be documented on the game
mechanics page.*

### The distinction the owner is drawing, because it is the whole entry

**There are two kinds of control and the repository only has a word for one.**

- **Panel controls** — the buttons in the strip below the field. SHIELD, SUCK,
  the lance, the guard. These have a name (`CONTROL_SETS`), a page, a picker on
  the wave, and a test.
- **In-screen controls** — the things you touch *on the field itself*. THE
  WARDEN's PULL circle. THE MAZE's handle on its string. The grip on a falling
  creature. The guide's whole-screen press. The ready circles that
  `claude/burn-ready-circles` adds. **These are not written down anywhere as a
  category.** Each was built by whichever lane needed it, and the only way to
  find out what exists is to read `packages/render/src/touch.ts`.

That is why the owner had to ask what PULL does, and why *"it says pull, but
when i click with mouse and move mouse, nothing happens"* took two lanes to
answer. The category is real, it is growing fast — three of them arrived this
week — and it has no home.

### What to build

**Rename the CONTROL SETS page to CONTROLS**, and let it hold both kinds. The
owner named the rename and the reason: one page about how the pair touches the
game, rather than one page about half of it.

**Add the in-screen controls to it, each named and described**: where it
appears, which seat may use it, what the gesture is (press, hold, grab and
drag), and what it does. Derive what you can from the code rather than
retyping it — a hand-kept list beside a growing category is the failure mode
`docs/spec/briefings.md` has already been through twice.

**A tab for alternatives that were tried**, which is where THE WARDEN's
hold-only tear goes when the pull replaces it. The owner asked for it to be
kept rather than deleted, and *"ggf testen"* — possibly tested — means this is
adjacent to the alternatives page, not a graveyard. Do not build a testing
mechanism here; note in the report whether the versus machinery could serve it.

**And every in-screen control appears on the GAME MECHANICS page too.** That is
the owner's *wichtig*, and it is a different audience: the CONTROLS page is
where you go to ask about controls, GAME MECHANICS is where somebody reads what
the game is and should not have to know to ask. **One source, two readers** —
if the same list is typed twice it will disagree with itself within a month.

### The one that will be got wrong

**`packages/render/src/touch.ts` is the truth about what exists**, and it is
the file every recent lane has touched. The list must come from there or from
something derived from it — never from a lane's memory of what it built. If
`touch.ts` cannot be read as data, say so in the report rather than
hand-writing the list and calling it done; a documentation page that quietly
drifts from the code is worse than no page, because it is believed.

### Sequencing

**After `claude/burn-topbar-fold`**, which renames STATES to GAME MECHANICS and
folds CONTROL SETS into it. This entry then renames and fills what that one
moved. Expect to replay over it, and read the page as it is rather than as this
entry describes it.

**`claude/burn-tether-pull` writes one paragraph into this page** — the
hold-only mechanic it retires. If it lands first, the paragraph is already
somewhere in the backlog and this lane gives it its proper home.

Finished when `bun run check` is green, the page is called CONTROLS and covers
both kinds of control, every in-screen control the game has is named there and
on the GAME MECHANICS page from one source, and the retired hold-only tether is
recorded rather than lost.

`Check: on the controls page, can you find every thing you can touch on the field itself — what it looks like, whose it is, and whether you press it, hold it or drag it`

Model `sonnet`, effort `think hard`, spent on where the list comes from rather
than on the page. Read `packages/render/src/touch.ts` whole first —
if the in-screen controls cannot be derived from it, that is the finding and it
changes the shape of the whole entry.

## THE WHEEL IS STILL TYPED AS A TANGLE
_claude/burn-maze-tangle-type · packages/sim/src/maze-wheel.ts packages/sim/src/entries.ts packages/sim/src/index.ts packages/sim/src/hash.ts packages/sim/src/wave-start.ts packages/content/src/maze-rounds.ts_
**Proposed by the run.** The last thread of the maze conversion, reported by
`claude/burn-maze-probe-rename` as outside its five files.

`packages/sim/src/maze-wheel.ts` ends with `export type MazeTangle =
MazeWheel;` — a compatibility alias named after the thing the wheel replaced —
and the callers still speak of tangles: `entries.ts` types a wave's rounds as
`MazeTangle[]` and its comment calls them *the tangles, in order*, with
`hash.ts` and `wave-start.ts` carrying the same word in prose.

**This is the same defect one level up from the one just fixed.** `mazeProbe`'s
`row` and `lane` were renamed because a name describing the old shape reads as
correct and is therefore worse than no name. The type is that, for the whole
authored round.

**Rename it and delete the alias.** An alias kept "for compatibility" inside a
repository with one author and a linear history is compatibility with nobody —
it is only a second name for the same type, which is exactly what the rename is
trying to remove.

**Read each sentence before rewriting it.** Some of the prose about tangles is
describing the old lattice's behaviour and has no subject any more; that goes
rather than gets reworded. `packages/sim/src/maze.ts`'s header deliberately
keeps its own history of what it replaced — **leave that alone**, it is the
argument, not a leftover.

`packages/sim` is lockstep, so `bun run test:determinism` passes before this
lands. A type rename should not touch the hash, and if it appears to, stop.

Nothing a player could look at changes: **zero `Check:` trailers**.

Finished when `bun run check` is green, `bun run test:determinism` passes,
`MazeTangle` does not exist, and the word *tangle* survives only in
`packages/sim/src/maze.ts`'s deliberate account of what the wheel replaced.

Model `sonnet`, effort `think`. Read `packages/sim/src/maze-wheel.ts` and
`entries.ts`. Small; the care is in telling live prose from history.

## THE BACKLOG STILL HAS AN INTERLUDES TAB FOR A CATEGORY THAT IS GONE
_claude/burn-interlude-tab · docs/spec/ideas.md tools/director/src/backlog.ts tools/director/src/backlog-page.ts tools/director/index.html tools/director/test/backlog.test.ts_
**Proposed by the run.** The third item of `THE GAUGE'S CONVERSION LEFT THREE
THINGS IT COULD NOT REACH`, which its lane correctly stopped on and which the
landing then retired along with the two halves that *were* done. Re-queued so it
does not vanish — that is the second time today a landing has retired an entry
whose work was not finished.

**The word survives in four coupled places** and they have to move together:

- `docs/spec/ideas.md:513` has the heading `### Interludes`.
- `tools/director/src/backlog.ts:218` passes the literal string `"Interludes"`
  to `fromIdeas`, beside the label `INTERLUDE IDEAS` and a subtitle reading
  *"rounds that are not the field, each with its own controls and picture"*.
- `backlog-page.ts` builds the tab from that group.
- `tools/director/index.html` carries the `INTERLUDES` tab button and its
  `sheet-interludes` page.

**A spec heading is an interface here, not a label.** `sections.ts` parses spec
headings by shape and `fromIdeas` matches this one by exact text, so renaming
the heading alone silently empties the tab rather than erroring. That is why
the previous lane stopped: at the time, `index.html` belonged to a concurrent
lane. It is free now.

**The subtitle is already right and says what the new word should be** —
*rounds that are not the field, each with its own controls and picture*. That is
a description of a **round**, which is what these became. So the rename is
mostly deciding between *rounds* and *bosses*, and the honest answer is probably
*rounds*: they are bosses now in how they are reached, but the ideas in that
section are about what a round *is*.

**Read the ideas under the heading before renaming it.** If any of them
describe the reaching mechanism rather than the round — a thing that happens
*between* waves — that idea has lost its subject and goes, rather than getting
reworded into something that no longer makes sense.

**Check nothing else parses that heading.** `grep -rn "Interludes" tools docs`
before you start; the group key, the label, the subtitle and the tab id are four
different strings and only some of them are load-bearing.

This is a tool and a spec fix: nothing the game draws changes, so **zero
`Check:` trailers**.

Finished when `bun run check` is green, the tab is named for what the section
now contains, the tab is not empty, and `grep -rn "nterlude" tools docs/spec`
finds nothing outside `docs/decisions.md`'s rewritten entries and the spec's own
account of what was replaced.

Model `sonnet`, effort `think`. Read `tools/director/src/backlog.ts` around
`fromIdeas` and `docs/spec/ideas.md` from line 513 to the next heading. Small,
and the care is in not emptying the tab silently.

## THE CARD TOOLTIP IS ON THE WRONG THING
_claude/burn-card-tooltip-place · tools/director/src/rail.ts tools/director/src/card-waves.ts tools/director/index.html tools/director/src/stage-transport.ts_
**Asked for by the owner.** A `FAIL` on `bf4c72d` with the fix named in it.

> the tooltip for all cards should not be on the list of waves, but on the
> waves configuration i suggest to have it on the "card" button below the game
> screen.

**What landed and what they rejected.** A lane put the card names on the wave
*list's* mark — hover a row, see its cards, click to open the CARDS sheet. The
owner does not want it on the list. They want it on the **wave's own
configuration**, and they name where: the `✓ CARD` button in the transport row
under the field.

**So this is a move, not an addition.** Take it off the list row and put it on
the card control. `cardsForWave(waveIndex)` already exists and is the right
call; only its reader changes.

**Mind what `✓ CARD` already is.** It is a *dismiss* — it pushes `{kind:
"brief"}` for both seats, and the stage freezes on the first wave without it.
Hanging a tooltip on it is fine; changing what pressing it does is not.

**Note the neighbouring entry.** `THE STAGE IS THE BUTTON, AND ✓ CARD IS ONE
CONTROL TOO MANY` proposes retiring that button entirely. If both are worked,
this one is meaningless afterwards — read that entry first and say in the
report whether these should be one lane.

Finished when `bun run check` is green, the wave list's rows no longer carry the
card tooltip, the card control names the current wave's cards, and the commit
carries

`Check: with a wave open, does the card button under the field tell you which cards this wave raises, without you opening a sheet`

Model `sonnet`, effort `think`. Read `tools/director/src/rail.ts`'s mark and
`card-waves.ts`. Small; the care is in not disturbing the dismiss.

## THE FALLING SHADOW STILL DOES NOT READ, AND THE STATES PAGE SHOULD SHOW IT
_claude/burn-shadow-states · tools/director/src/states-page.ts packages/render/src/contact-shadow.ts docs/checks/_
**Asked for by the owner.** A `FAIL` on `d892bae`, and the second half is a
request for tooling rather than for the effect.

> i still dont see it, add some screenshots on the "States" section for docu

**Two things, and the second may explain the first.** The lane that landed this
made the shadow's lean proportional to the gap so it gathers under the rock as
it falls. The owner cannot see it. Either the effect is too subtle at tempo, or
it is right and there is no way to look at it — a shadow mid-fall is one frame
out of a fall nobody can pause.

**Do the second half first.** The STATES page exists to show a thing in each of
its states side by side, which is exactly what a shadow through a fall needs:
the same rock at the top of its last quarter, halfway, and at contact, in one
row. If the effect is working, that picture proves it and the check can be
answered. If it is not, the same picture is the evidence for changing it.

**Only then touch the effect, and only if the picture says to.** If the three
frames show a shadow that does gather and the owner still cannot see it in
play, that is a finding about tempo rather than about the curve — report it.

Finished when `bun run check` is green, the STATES page shows a falling
shadow's stages side by side, and the commit carries

`Check: on the STATES page, do the three stages of a falling shadow show it gathering under the rock — and now that you can see it side by side, does it read in play?`

Model `sonnet`, effort `think hard`. Read `tools/director/src/states-page.ts`
and `packages/render/src/contact-shadow.ts`'s header. The thinking goes on
choosing the three moments — the wrong three make a working effect look broken.

## THE SHIELD THROWS SPARKS OUTWARD, SO YOU CAN SEE IT IS CHARGED
_claude/burn-shield-arcs · tools/versus/candidates/shield-charge packages/render/test_
**Asked for by the owner**, for the alternatives page:

> "not build yet": eine bessere animation vom schild, das nach außen weg (weg
> vom schiff) ein paar kleine miniblitze feuert, damit man die statische ladung
> und energie besser versteht und das schild mehr sichtbar macht. etwa wie bei
> einer starken entladung von einem strommast

*A better animation for the shield, firing a few small mini-lightning-bolts
outward — away from the ship — so that the static charge and energy are easier
to understand and the shield is more visible. Something like a strong discharge
from an electricity pylon.*

**A candidate, not a change.** It goes beside the shipped shield on the
ALTERNATIVES page and the owner decides by looking. Nothing in
`packages/render/src` moves. The page is now a flat contact sheet, so it will
sit there animating next to today's shield with no dropdown to operate — which
is exactly the comparison this needs.

### What is being asked for, precisely

**Two problems, one gesture.** The owner names both: the shield is *hard to
see*, and it does not read as *charged*. Small arcs answer both at once — a
thing that throws sparks is obviously present and obviously energised — which
is why this is one candidate and not two.

**Outward, away from the ship.** Said explicitly and it is the whole character
of it. A discharge that arcs inward reads as damage, as something leaking into
the hull; one that throws outward reads as a field pushing back. Same effect,
opposite meaning.

**The reference is a pylon**, which is worth taking literally: not a soft glow,
not a halo. A pylon discharge is sudden, thin, branched, gone — a few of them,
irregularly, rather than a steady crackle. *Ein paar kleine* — a few small
ones. A candidate that fires constantly has answered a different request and
will read as noise over a field the pair is trying to watch.

### Two things that will be got wrong

**Anything that outlives a frame belongs in `Effects` and is cleared in
`Effects.reset()`.** A spark with a lifetime is precisely that. `world.beat`,
`world.tick` and `world.nextId` all restart at zero on a fresh wave, so render
state cached against them is read by the next run as its own — that is how a
crack once showed before the rock that made it.
`packages/render/test/restart.test.ts` fails if a new field is added and not
cleared, and it is not optional bookkeeping.

**Do not quietly make it a readout.** The guard's arming window just got a
signal of its own — the button fades as the window closes — and a shield whose
arcs varied with that state would be a second signal for one state, invented by
a lane rather than asked for. **The arcs say the shield exists and is
charged, and nothing more.** If tying them to a real state seems better, that
is a separate proposal and it goes in the report, not in the candidate.

### Where it lives

`tools/versus/candidates/shield-ward` already holds `heave` and `tick`, which
are about the *moment of deflection*. This is about the shield's ongoing
presence, so it is probably its own slot — `shield-charge` — rather than a
third sibling of those two. The lane decides and says which in the commit, and
either way `tools/versus/test/distinct.test.ts` is the guard: a candidate that
does not visibly differ from its neighbours is not a candidate.

Finished when `bun run check` is green, the candidate stands on the
ALTERNATIVES page beside the shipped shield, it throws a few thin arcs outward
on its own, nothing in `packages/render/src` has moved, and nothing it draws
survives a wave restart.

`Check: beside today's shield, does the sparking one read as charged and hold its energy — or does it just look busy over a field you are trying to watch`

Model `sonnet`, effort `think`, spent on the rhythm rather than the shape: how
often an arc fires, and how briefly, is what decides between *a pylon* and
*static on a screen*. Read `docs/versus.md` and one existing candidate before
writing.

## THE DIRECTOR SHIPS WITH THE GAME, AND HAS TO WORK ON A PHONE
_claude/burn-director-ship · apps/game/package.json tools/director/build.ts tools/director/index.html tools/director/server.ts tools/director/src/main.ts tools/director/test package.json_
**Asked for by the owner:**

> wenn die production app/build ausgeführt wird, möchte ich auch dass die
> director app version ausgeliefert wird. sie soll auch auf mobile gut
> anschaubar und bedienbar sein.

*When the production app/build is run, I want the director app version to be
shipped too. It should also be good to look at and to operate on mobile.*

### The thing that decides this entry: half the director cannot ship

`bun run build` is `bun build ./index.html --outdir=dist` in `apps/game` — a
static bundle. The director is not that. `tools/director/server.ts` is a live
server with **POST routes that write to the working copy**: saving `waves.ts`,
deciding a check, running a check, sweeping worktrees. None of that can exist
in a shipped build, because there is no repository behind it.

**So a shipped director is a read-only director, and the entry is mostly about
saying which half that is.** Go through the pages and decide, for each, whether
it survives: the stage and the wave list, the shapes, the alternatives, the
backlog, GAME MECHANICS — these read data and should work. Saving, the check
ledger's decide-and-run, the worktree sweep — these cannot.

**A control that is present and does nothing is worse than one that is
absent.** Whatever cannot work must not be drawn, or must say plainly that it
is read-only. A save button that silently fails on a phone is the single worst
outcome available here, because the owner will believe a wave was saved.

**And its data comes from a different place.** In development the director
reads waves from its own server; shipped, it reads the compiled content the
same way the game does. That is simpler, not harder, but it means the shipped
director shows what was **built**, not what is on disk — say so on the page,
once, so nobody mistakes it for an editor.

### On a phone

**The director is desktop-shaped**, and this is the larger half of the work. It
assumes a wide window with several columns; the owner is asking for it to be
*good to look at and to operate* on a phone, which is not the same as fitting.

**`claude/burn-director-minimize` is the natural companion** and is already
queued — every panel collapsible, addressable without a mouse. A phone is the
case where collapsing stops being a convenience. Do not build that here; if it
has landed, use it, and if it has not, say in the report whether this lane
should have waited for it.

**Touch, not hover.** Anything that only reveals itself on hover is invisible
on a phone. The stage already accepts pointer events and the game itself is
portrait-first, so the field is the easy part; the panels are not.

### One thing to put to the owner rather than decide

**Shipping the director publishes what it shows.** It surfaces the queue, the
parked ideas, the outstanding checks, the specification and the backlog — the
project's own working material. That is very likely fine, since it is their
project and their build, but it is a door being opened and they should open it
knowingly rather than discover it. **Say it in the report, do not act on it,
and do not add authentication nobody asked for.**

Finished when `bun run build` produces the director beside the game, the
shipped director opens on a phone and can be read and operated, nothing that
cannot work is offered, and the page says once that it shows what was built
rather than what is on disk.

`Check: open the shipped build's director on your phone — can you read a wave and move around it, and is it clear which things you cannot change from there`

Model `sonnet`, effort `think hard`, spent on the read-only boundary before any
layout: which pages survive, and what happens to the controls that do not. Read
`tools/director/server.ts` whole and `apps/game/package.json` first.
