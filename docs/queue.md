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

## THE ALTERNATIVES PAGE SHOWS EVERYTHING AT ONCE, AND NOTHING IS PICKED FROM A LIST
_claude/burn-versus-flat · tools/director/src/versus-page.ts tools/director/src/versus-pair.ts tools/director/src/versus-vote.ts tools/director/index.html tools/director/test_
**Asked for by the owner**, and put at the top of the queue by them. Their
words:

> i suggest for "not build yet" - "alternatives" to render almost everything
> reasonable on the screen, without me using the dropdown to iterate.
>
> the warm is just one single alternative. i dont need it to see it in
> combination with other alternatives.
>
> i suggest we get also rid of player 1 and player 2 dropdown. where player 1
> visual is equal than player 2, we just show one screen. when visual is
> different for each player we show next to it right to it another game screen.
>
> not clear what "blink" is, maybe obsolete with what i explained above.
>
> its not clear for me what "cannon: shot(2)" and "shield:ward (2)" is visual
> difference. maybe because the animation does not trigger cannon and shield so
> i can compare against?
>
> I suggest to have everything flat on the page to compare current and before.
> no need also here for the tree buttons.

**One diagnosis runs under all six.** The page is built as an *instrument* —
pick a slot, pick a candidate, pick a pose, pick a seat, pick a rate, toggle
blink, toggle zoom — and the owner does not want an instrument. They want a
contact sheet: everything laid out, shipped beside alternative, judged by
sweeping an eye across it. Every dropdown is a thing they have to operate
before they can see anything, and a comparison that has to be operated is a
comparison that does not get made.

### What the page does today, so the rewrite knows what it is removing

`tools/director/src/versus-page.ts` builds one stage and a bar of pickers over
it. `ship-hull.warm` is a slot with a single candidate; `cannon-shot` has `pip`
and `streak`; `shield-ward` has `heave` and `tick`. The `(2)` the owner is
reading is that count, and today seeing both means choosing each in turn and
remembering the first.

**BLINK is not obsolete and it is not explained.** It superimposes the shipped
side and the candidate in one grid cell and flips between them — the
astronomer's trick for finding a small difference between two nearly identical
pictures, which the eye is far better at than side-by-side comparison. That is
genuinely useful and completely unguessable from a four-letter button. So:
**either it explains itself on the page or it goes.** Decide which, and say why
in the commit. If it stays, it is per-pair and not a page-wide mode, because a
flat page has many pairs on it and one global flip is meaningless.

### The five things to build

**Everything reasonable, rendered at once.** Every candidate of every slot, on
the page, without a dropdown. *Reasonable* is the lane's judgement and the
commit says where the line was drawn — if the count grows past what a machine
can animate at tempo, say so and say what was done about it, rather than
quietly shipping a page that stutters. A stuttering comparison is a false one.

**Each alternative is compared against the shipped thing, not against the
others.** `ship-hull.warm` is one candidate and the owner says plainly they do
not need to see it combined with anything. So the unit on the page is a
**pair** — shipped on the left, this one alternative on the right — repeated
down the page. Not a matrix, not a combination, and never two candidates blended
into one picture.

**The seat dropdown goes, and the page answers the question itself.** Where a
candidate draws the same thing for both seats, show one screen. Where it draws
something different, show a second screen immediately to its right. The page
knows which case it is in — it can draw both and compare — so the owner should
never be told to go and check the other seat. **Deciding "same" honestly is the
one piece of real thinking in this lane**: two frames are the same when they
are the same, and a naive pixel compare will call two frames of a moving
animation different for reasons that have nothing to do with the seat. Say in
the commit how it was decided.

**The animation has to actually fire, and this is probably a real bug.** The
owner cannot tell `pip` from `streak`, or `heave` from `tick`, and guesses the
cannon never shoots and the shield never wards. If that is right, the page has
been asking them to compare two things neither of which happened. **Confirm it
before designing around it.** A shot candidate is only visible during a shot,
so the pose a shot candidate is shown in must fire, on a loop, forever, without
anybody pressing anything — and the same for a ward. Whatever the fix is, the
test is that the difference between two candidates is visible *without being
triggered by hand*.

**Flat, and the tree buttons go.** No slot tree, no nesting, no expanding. One
page, scrolled.

### What must not happen

**No candidate is adopted, retired or edited.** This lane changes how
alternatives are *shown*, and the shipped look does not move — CLAUDE.md's
*a look is offered, never replaced*. The vote mechanism (`versus-vote.ts`)
keeps working: it is the thing that turns a decision into a prompt, and a
prettier page that cannot record a verdict is worse than the one it replaced.

**The shipped side must really be the shipped thing**, drawn by the same path
the game draws, on every pair. The whole value is that it is the real frame.

Finished when `bun run check` is green, the page opens with every candidate
visible with no control touched, each sits beside the shipped thing it would
replace, a second screen appears only where the two seats genuinely differ, the
animations run on their own, and there is no tree and no seat dropdown left.

`Check: open the alternatives page and touch nothing — can you see every alternative beside the shipped thing, with the shots and wards actually firing, and tell which pairs differ between the two seats`

Model `sonnet`, effort `think hard`. Read `tools/director/src/versus-page.ts`
and `versus-pair.ts` whole, and `docs/versus.md` for what the page is for. The
thinking goes on two things and neither is layout: whether the animations fire
today, and how the page decides two seats see the same picture.

## THE TETHER IS PULLED, AND A LONG PULL OPENS THE WARDEN UP
_claude/burn-tether-pull · packages/sim/src/warden.ts packages/sim/src/warden-cycle.ts packages/sim/src/config-boss.ts packages/render/src/tether.ts packages/render/src/warden-fx.ts packages/sim/test/warden.test.ts docs/spec/bosses.md_
**Asked for by the owner.** Asked whether THE WARDEN's tether should follow a
finger too, since the entry above deliberately left it alone:

> yes. you click it then drag in a direction. if the string is pulled a longer
> distance the warden can be attacked

**Behind `claude/burn-grab-and-drag`, which must land first.** That lane builds
the displacement a grab reports — the origin resolved on the device whose
finger it is, the distance crossing the wire as thousandths of a tile — and
this entry is the second thing to use it. Do not invent a parallel one.

### What the tether does today, because the ask lands on top of it

A line hangs from the rim and falls at a named rock's speed. Only the player it
is **not** holding can pull it free, and the way they do it is to hold: the
hold **accumulates** over ticks (`wardenPullBeats`, `packages/sim/src/warden.ts`),
a thumb that slips loses that moment and no more, and tearing it in time takes
a plate off the ring. `config-boss.ts` says in as many words why it is time and
not steadiness:

> the question the fight asks is *when* the other player can spare their hand,
> never whether they can hold it steady on a phone

That sentence is the one thing this entry must not run over by accident. A
pull measured in distance is a pull that can be *fumbled*, and fumbling on a
phone is exactly what the current rule was written to keep out of the fight.
Whatever this lane builds, the fight must still be about the other seat's
attention rather than about their aim.

### The question the owner still has to answer, and it is the whole lane

**Does distance replace the accumulated hold, or sit beyond it?** Two readings,
both consistent with what they said, and they are different games:

- **Distance replaces time.** Tearing the tether becomes: grab it and drag it
  far enough. `wardenPullBeats` retires. Simplest to explain, and it overturns
  the decision quoted above rather than extending it.
- **Distance is a second, further threshold.** Holding still tears the line as
  it does now; dragging it *further than that* is an extra thing a player can
  choose to do, and the reward is the new one — the ring opens to attack.

The second reading is the one the owner's sentence most nearly says: *if the
string is pulled a longer distance* implies a shorter distance that already
does something. **Do not decide this alone.** If the owner has answered by the
time this is picked up, the answer is in the queue; if not, stop and ask.

### And what "can be attacked" means is the second question

The ring already loses a plate per opened eye and a plate never grows back. So
*attacked* may mean the existing plate coming off, or a window in which the
ring is shootable when it otherwise is not — today a tether is explicitly not
shootable and does not stop a shot (`packages/sim/src/bullets.ts`). Those are
different mechanics, one of them is new, and the difference is a boss's
choreography rather than a parameter. Same rule: ask rather than pick.

**Everything the drag needs is integers.** Rule 3, and `bun run
test:determinism` is the guard — a pull distance is exactly where a float gets
in. Both devices must agree on the tick a threshold is crossed.

Finished when `bun run check` is green, `bun run test:determinism` passes, the
tether follows the finger that grabbed it, a long pull does what the owner's
answer said it does, and `docs/spec/bosses.md` §11.4 describes the fight that
now exists rather than the one that used to.

Model `opus`, effort `ultrathink`, spent on the fight rather than on the input
— the input is inherited. Read `packages/sim/src/warden.ts` whole and
`docs/spec/bosses.md` §11.4 before deciding anything.

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

## FOUR TOPBAR BUTTONS FOLD INTO ONE PAGE, AND STATES IS RENAMED FOR WHAT IT HOLDS
_claude/burn-topbar-fold · tools/director/index.html tools/director/src/states-page.ts tools/director/src/controlsets-page.ts tools/director/src/ship.ts tools/director/src/demo-panel.ts tools/director/src/main.ts tools/director/test_
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

The owner suggested **GAME DOCUMENTATION** and said *something like*. Use their
words unless a shorter one is clearly better on a crowded bar — and if it is
shortened, say in the commit what and why. It is renamed everywhere it appears:
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

Finished when `bun run check` is green, the topbar no longer carries CONTROL
SETS, SHIP, DEMOS or MAIN MENU, all four are reachable from the renamed page,
nothing they draw has changed, and no text anywhere still calls the page STATES.

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

**The director's test role puts one person in both seats.** A landing this week
made the stage step a card p1 → p2 → play on presses of the field. Two circles
held by one pair of hands needs an answer there — held one after the other, or
one hand standing for both. Decide, say which, and make sure the director can
still start a wave without two people.

**A desk has no thumb to hold.** The keyboard path already sends the guide's
dismissal; a hold-to-fill needs a key held rather than pressed, per seat, and
the game and the director copy each other's layout deliberately. Do not leave
the PC unable to start a wave.

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
