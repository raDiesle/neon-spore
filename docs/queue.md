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

**On the reference sheets, and there are two of them on purpose.**

`docs/reference/20-surface-designs-concept.png` is the target: twenty surfaces
as they should read — fish scale, reptile armour, beetle shell, butterfly
wing, octopus, frog, snake, sea urchin, coral, nautilus, jellyfish, diatom,
dragonfly eye, lobster, starfish, perlmutt, pinecone, sand dollar,
caterpillar, spore pod. Each carries three words naming what it is made of
(*thick plates · irregular · natural*), and those words are the brief for a
skin more than the picture is.

`docs/reference/20-surface-designs.svg` is the same twenty attempted in SVG,
and **the distance between the two files is the most useful thing in either.**
The SVG version is honest about where a vector surface falls down: most of its
spheres are one uniform lattice tiled across a circle, with a single glow laid
over the top. The concept sheet is not tiled at all — its plates change size
across the body, thin toward the rim, catch the light individually, and break
their own pattern. Compare 09 CORAL in the two files: branching structure in
one, wavy stripes in the other. Or 10 NAUTILUS: a chambered spiral, against a
plain sphere with a swoosh on it.

So the failure mode has a picture now, and it is the one every lane in this
block is warned about in its own words — *one lattice at two scales* is not
two materials. A surface reads when its elements vary with position on the
body and are lit individually. That is what the light lane exists for, and it
is why a pattern lane that composes `litPass` will beat one that does not.

Neither file is art to copy in: a fixed illustration cannot wrap a contour
re-sampled from `contourAt` every frame, so every skin here is generated in
contour space or it slides off its body within a second. The owner also linked
three svgrepo files as further reference. **No lane fetches a URL and no lane
vendors a third-party file** — that carries a licence, which is the owner's
call and not a lane's.

## A REFUSAL AND A BACKLOG ITEM LOOK THE SAME IN THE DIRECTOR
_claude/burn-refused-status-y4 · tools/director/src/backlog.ts_
**Asked for by the owner.**

The half the ideas lane could not reach, and it reached the right conclusion
about it. `docs/spec/ideas.md`'s deferred entries now carry a real paragraph
each — what the idea was, what it collided with, what survives. But the
director files that whole section under PARKED as *DELIBERATELY DEFERRED* with
a group note reading *not rejected, not queued*, sitting in the same tab as
`docs/parked.md`'s backlog. So a decision somebody made and closed reads as a
thing nobody has got to yet.

The owner called them refused; the page says the opposite in its own note. One
of the two is wrong and the file is the authority: these were looked at and
turned down. THE CONDUCTOR is the nuance — deferred rather than rejected, and
its own paragraph says so — so the group cannot simply be relabelled REFUSED
either. What is needed is a status a reader can tell apart from *waiting*, with
room for *turned down* and *deferred for a stated reason* to differ.

Nothing in `docs/spec/ideas.md` changes; that lane just finished it.

Finished when `bun run check` is green, a refused idea is visibly not a backlog
item, the deferred-rather-than-rejected case is still distinguishable, and the
commit carries `Check: in the director, can you tell an idea that was turned
down from one nobody has started?`

Model `sonnet`, effort `think`. Read `tools/director/src/backlog.ts`'s group
note and `docs/spec/ideas.md`'s deferred section first.

## THE TWO THINGS A PLAYER WATCHES ALL GAME HAVE EACH HAD EXACTLY ONE ANSWER
_claude/burn-versus-mechanics-v6 · tools/versus/candidates/cannon-shot/ tools/versus/candidates/shield-ward/_
**Asked for by the owner.**

The owner asked whether alternative animations exist for things the game
already does — *how the cannon shoots, how the deflect shield works* — and how
to see and test them. The answer today is **no, and there is nowhere to look**,
which is worth writing down because three pages come close enough to be
mistaken for it. POSES draws the shipped cannon and the shipped guard, frozen
at authored moments, by the real renderer — that is the current answer, not a
choice between answers. SHAPES now shows one body against every skin and every
motion, but those are *creature* looks; nothing on that page is the ship.
VERSUS is the machinery built for exactly this question and holds one
candidate, a warm hull colour.

So the mechanism exists and the two things a player actually stares at all game
are not in it.

**Two slots, `cannon:shot` and `shield:ward`.** Two candidates each, beside
whatever ships. They must differ in *kind* rather than in degree: the
catalogue's NOTCH pair is the model, where one answer says the thing with a
feature small enough to vanish at 26 px and the other says it with the whole
mass, so the vote is a measurement whichever way it goes. Two candidates that
fail the same way teach nothing and are one candidate with a rounding error.
Each `claim` passes the one-sentence test `.claude/skills/new-wave` applies to
a wave.

**First find out whether the look is even patchable, and say so before
building.** A `Variant` patches fields onto an exported record the draw path
reads every call — including a whole function, which is how a candidate
`OwnMotion` works. If the shot and the ward are drawn from numbers written
inline in the draw call, there is no record to patch and no vote to hold. Then
the lifting is the first commit: pull those numbers into one exported record
per mechanic, change nothing on screen, prove it with `frame.test.ts`, and land
that before a single candidate exists. Say in the report which of the two it
was, because *the answer is the interesting half of this lane* — it is the same
question for every future mechanic slot.

**What the two slots are arguing about, so the candidates are not decoration.**
The shot is a thing leaving the ship and arriving somewhere; the failure it can
have is reading as a flash at the muzzle with no travel. The ward is a thing
*catching* something; its failure is reading as a wall that was always there,
so the catch is invisible unless you were already watching what hit it. Aim
each pair at its own failure.

Finished when `bun run check` is green, `bun run versus` lists both slots with
their readers, each slot draws two moving phones that differ visibly at 380 px
in the director's VERSUS tab, no lifted record changes what the game draws, and
the commit carries `Check: versus cannon:shot — does either alternative read as
something leaving the ship, rather than as a brighter flash where it started?`
and `Check: versus shield:ward — can you tell the shield caught something
without watching the thing that hit it?`

Model `opus`, effort `think hard`. Whether the look is a record or is inline is
the decision, and it is worth more than the candidates. Read `docs/versus.md`,
`tools/versus/variant.ts` and `tools/versus/candidates/ship-hull.warm/` first,
then whatever in `packages/render` draws the shot and the guard.

## A BODY SHADES THE HULL AND NOTHING ELSE, INCLUDING THE BODY BELOW IT
_claude/burn-depth-cast-d4 · packages/render/src/cast-shadow.ts packages/render/test/cast-shadow.test.ts_
**Asked for by the owner.**

**The light lane has landed, and it left one thing pointing the wrong way.**
`KEY` now lives in `packages/content/src/light.ts` and the hull and the rocks
are lit from it — read it, do not re-derive it. But `contact-shadow.ts` still
drops its ellipse straight underneath a body, which implies a lamp directly
overhead, and that is now the only surface on the field disagreeing with the
one direction. It is a thirteenth direction in a tree that just spent a lane
getting to one. Fix it in this lane, since a contact shadow and a cast shadow
are the same fact at two distances, and say in the commit whether the offset
ellipse still reads as *contact* or starts reading as a second body.

Behind `burn-depth-light-d3`, which brings the light into the game — you
cannot cast a shadow without a direction, and the direction must be the one
constant everything else uses.

A body near the hull now throws a shadow onto it. The owner wants the other
half: **bodies shading each other**, so the field reads as objects in a space
rather than as sprites on a plane. It is the right ask and one thing about it
has to be settled first, because it is not obvious and it is not cosmetic.

**The light is upper left, and that is the problem.** `light.ts` fixes `KEY` at
upper left for a stated reason — the hull's own aura sits low and even, so a
lit shoulder up and left argues least with the glow. Screen axes, y down. So a
shadow falls **down and to the right**. On the field, down is toward the hull.

Which means **a body shadows the body below it — the one nearer the hull, the
one about to cost the pair something.** The more urgent body is darkened by the
less urgent one. That is exactly backwards from what the pair needs, and it is
a consequence of a direction chosen for a card, on a page with no hull and no
falling.

So the first question this lane answers is **whether the game's light is the
card's light.** Three honest answers and the lane picks one with a reason:

- **Keep upper left and accept it**, if the darkening is small enough that a
  body's colour still reads — the callout is red-or-cyan, and a shadow is a
  value change rather than a hue change, so there is room. Measure it.
- **Give the game its own direction**, high and near-frontal, so shadows fall
  short and mostly sideways and no body is buried by the one above it. Then
  `light.ts`'s comment is right about cards and the game's constant is right
  about the field, and both say why.
- **Cast onto the hull and the rocks only**, and not between creatures at all.
  The weakest for realism and the strongest for the thing the game is: no
  creature ever gets harder to read because of another one.

**The rule that outranks the look.** A creature's red-or-cyan is a gameplay
fact the pair says out loud across a two-second delay. **A shadow may never
make a body hard to name or hard to see.** Not "it looks a bit dark" — the
failure is a pair calling a column wrong because one body was under another.
Put a floor on it and test the floor: a shaded body's colour must stay on the
right side of whatever distinguishes red from cyan, at 26 px, at the deepest
shadow the system can produce.

**And rocks are the free case.** A meteor is inert, carries no colour and is
already the one body with volume. A rock shadowing a creature, or a creature
shadowing a rock, costs the pair nothing and buys the whole effect. If the
measurement above goes badly, **ship that much** — inert bodies cast and
receive, living bodies only cast onto the hull — and say so as the finding.

Nothing here changes the simulation: shadows are drawing, `hashWorld` is
untouched, and two devices that disagree about a shadow still agree about the
world. Cost matters — this is per pair of nearby bodies per frame, so bound it
by distance the way `contact-shadow.ts` bounds itself by rows, and do not
allocate a gradient per pair per frame.

Finished when `bun run check` and `bun run test:determinism` are green,
`frame.test.ts` passes, the light's direction for the game is decided and
written down once with its reason, a test proves a shaded body stays nameable
at the deepest shadow, and the commit carries `Check: does a body in another's
shadow still read as the colour it is?`

Model `opus`, effort `think hard`. The direction is the judgement and the
drawing is arithmetic — a shadow that falls toward the hull darkens exactly the
bodies the pair most needs to read. Read `packages/render/src/contact-shadow.ts`,
`depth.ts`, `tools/director/src/skins/light.ts` and `docs/alive.md` first.

## A CHECK A COMMAND CAN SETTLE SHOULD NEVER REACH THE LIST
_claude/burn-land-autorun-s17 · tools/land/run.ts tools/checks/run.ts_
**Asked for by the owner.**

`bun run checks --run` exists, and the director has a `▶ RUN THE COMMANDS`
button beside it, and both are manual. That is the mistake: a check whose
trailer names a repository command needs no person at all, so it should be
**decided at the landing** and never appear on a list a person reads.

The owner said it plainly, and the code agrees — `bun run land` already
imports `parseLog` from `tools/checks/trailers.js` and prints
*"N check(s) landed with it"*, so at the moment of the fast-forward it knows
exactly which checks it just created. `runCommand` in `tools/checks/repo.ts`
already runs one and `run.ts` already records a `PASS`. Everything needed is
built; the two halves have simply never been joined.

So: after the fast-forward, run the runnable ones **among the checks this
landing added**, record their verdicts, and print what happened.

**Only the new ones, and that distinction is the whole design.** `--run` today
runs every outstanding runnable check in the backlog. Doing that on every
landing would re-run the same eight commands thirty times an afternoon, and a
step that slow gets skipped, which is how it stops being automatic. The
landing settles what the landing created; the backlog stays a manual sweep.

**What this changes about the list is the point of it.** `bun run checks`
becomes purely *things that need an eye* — no mixed list, no scanning past
eight rows a machine could have answered. That directly serves the shorter,
clearer report the restatement lane is already queued to build, and the two
should be read together.

**A failure must not block the landing, and must be loud.** The tree was green
before the fast-forward; a `relay:check` that fails afterwards is a finding
about the code, not a reason to unwind a landing that has already happened.
Record the `FAIL`, say so in the closing lines with the command that failed,
and leave it on the list where a person will see it. Never silently pass, and
never leave a failure looking like it was not run.

**Two things to be careful of.** A command may take a long time or need
something the machine has not got — `bun run relay:check` wants a wrangler on
a port — so a command that cannot start is *not run* rather than failed, and
must say which of the two it was. And landing is the one step in this
arrangement that must stay reliable: if running a check can hang, it needs a
timeout, and the landing has to survive the timeout rather than inherit it.

Finished when `bun run check` is green, landing a commit whose trailer names a
command settles that check without anybody asking, a failing command is
reported loudly and does not unwind the landing, an unrunnable one is
distinguished from a failing one, and `bun run checks` afterwards lists only
what still needs a person.

No `Check:` trailer — the whole lane is about things a command decides.

Model `sonnet`, effort `think hard`. Read `tools/land/run.ts` around its
`parseLog` call, `runCommand` in `tools/checks/repo.ts`, and `runAll` in
`tools/checks/run.ts` first — all three halves exist and this joins them.

## NINETEEN GROUPS OF DIALS SIT BESIDE THE ONE WAVE YOU ARE EDITING
_claude/burn-director-ship-split-s16 · tools/director/src/ship.ts tools/director/src/ship-fields.ts tools/director/index.html_
**Asked for by the owner.**

The left column runs WAVE, then SHIP, and SHIP is the whole of `SimConfig` —
nineteen groups from AIM down to PLUMBING, one of which is literally labelled
*not a dial a person turns*. None of it belongs to the wave in front of you.
`aimMillis` is the same number on wave 3 and wave 30; so is the hull's repair
rate, the beat, the score. They are beside the wave because that is where the
panel was built, not because that is where they are needed.

**The cost is not space, it is attention.** A column that shows everything all
the time teaches you to scroll past it, and then the thing you actually needed
is scrolled past too. The owner edits a wave and reads nineteen headings that
have nothing to do with it, every time.

**So the column holds what belongs to this wave, and the rest moves behind a
button on the topbar.** The split is not by taste; ask of each group *does
changing this change the wave in front of me, or the game everywhere?*

- **Stays** — the wave's own entries and its metadata, and any group that is
  about something the current wave actually contains. If the wave has a warden,
  WARDEN belongs beside it; if it has none, those dials are noise. The same for
  VANE, MIRROR, QUEEN, and for THE GAUGE, which is an interlude's round and
  only matters in a gap that carries one. **Show a boss's group when the wave
  holds that boss**, and the panel stops being a list and starts being an
  answer.
- **Moves** — everything global: AIM, GUARD, MAW, POD, LANCE, GRIP, HULL,
  RADAR, THE BEAT, THE FORK, BRIEFING, THROB, SCORE. These are the ship, and
  the ship is the same ship on every wave.
- **Moves and stays moved** — PLUMBING. Its own label says nobody turns it.

**One thing must not be lost in the move.** `FIELD_GROUP` is a
`Record<keyof SimConfig, GroupName>`, which is why adding a config field is a
hard typecheck failure until the director is told where it goes — a lane
discovered that today by hitting it. That exhaustiveness is the reason no
tunable can be added and left unreachable in the tool that tunes it, so
**whatever shape the split takes, every field must still be reachable and the
Record must stay exhaustive.** A group that is hidden is not a group that is
gone, and a "show everything" escape hatch has to exist for the day something
is missing.

**And the topbar is getting crowded**, so this is a place to be careful rather
than quick: the director already has tabs, a checks sheet, a backlog sheet and
a states control. One more button is fine; a second row is a different
problem, and if this needs one, say so instead of building it.

Finished when `bun run check` is green, the left column shows the wave and only
what the wave contains, the ship's global dials are one click away and all of
them are reachable, `FIELD_GROUP` is still exhaustive, and the commit carries
`Check: with a wave open, is everything in the left column about that wave?`

Model `sonnet`, effort `think hard`. The judgement is which groups are about a
wave and which are about the ship, and the boss groups are the interesting
case — they are global numbers that only matter contextually, which is exactly
the line this lane is drawing. Read `ship-fields.ts`'s `GROUP_ORDER` and
`ship.ts` first.

## A RELOAD KEEPS THE PLACE AND FORGETS EVERYTHING ELSE
_claude/burn-director-session-s15 · tools/director/src/session.ts tools/director/src/main.ts tools/director/index.html_
**Asked for by the owner.**

The owner works in the director while lanes land behind them, so the page
reloads under them several times an hour — and every reload costs them the tab
they were on, the wave they were looking at, and a dialog asking whether they
meant to lose changes. Fifty-odd checks are waiting on that person looking at
things. Friction here is not a nicety; it is the tax on the one activity
nothing else in this repository can do.

**And the owner has drawn the line through the middle of it, so read this
before the rest:** *whenever I reload, I don't want my director settings stored
without me having saved them — it should ignore and reset what it was before.*
Asked which half of this lane that killed, they said: **keep the place, drop
the state.**

So the lane is two rules and they point in opposite directions on purpose.

**Where you were is navigation, and it survives.** Which tab, and which wave
index, in `location.hash` or a query string, written with
`history.replaceState` on every change so it never grows a history entry per
click, and read once on load. That buys three things and only one of them was
asked for: a reload returns you where you were; back and forward start working;
and a link now names a place, so `?tab=shapes&wave=7` can be sent to a phone or
pasted into a `Check:` trailer's *where* row. That last one compounds — every
check written from now on could point at exactly the thing rather than
describing the route to it.

Keep the vocabulary small and stable: a tab name and an index, nothing that
needs escaping, nothing that breaks when a panel is renamed. **An unknown or
malformed value must fall back silently to the default** rather than throwing —
a URL outlives the code that wrote it, and a link from three weeks ago should
open the page rather than a blank screen.

**Everything else is a setting, and it resets.** The director starts from what
ships, every single load: default dials, default skin, default motion, LIT off,
no recovered draft, nothing carried over from the last session by any route.
Not a prompt offering yesterday's work back — *nothing*. The reason is that a
page which quietly hands back state the owner did not save is a page whose
every judgement is about the wrong thing, and this director exists almost
entirely to be judged from. A wave that looks wrong has to be a wave that is
wrong, not one still wearing an experiment from Tuesday.

**A place is not a setting, and the boundary is worth stating in the file.**
The test is whether the value changes what is drawn or what would ship. A tab
name and a wave index say *which thing you are looking at*; a dial value, a
skin pick and an edited wave say *what it looks like*. The first goes in the
URL. The second does not go anywhere. Write that sentence into
`session.ts`'s header, because the next lane that wants to remember the SHAPES
skin bar across a reload will read it and stop.

**Explicit save already has a shape in this tree, and it is the only shape.**
`tuning.ts`'s preset bar writes to `localStorage` on a `+ SAVE` press and
restores only when a named preset is clicked — the owner's rule, already
implemented, before it was stated. Nothing in this lane adds a second
mechanism, and nothing in it writes storage at all.

**So `beforeunload` stays, and the old brief was wrong to plan its removal.**
It was going to go because a recovered draft meant nothing was lost by
reloading. Drafts are not recovered any more, so the warning is once again the
only thing between a reload and a lost edit, and `store.dirty` is honest about
when it fires. Leave it exactly as it is.

**Audit while you are in there, and report rather than fix.** Grep the whole
director for `localStorage` and `sessionStorage` and say in the commit what
each remaining call is and whether it is behind an explicit press. Two are
known — the tuning presets, which are, and the brush-hints toggle in
`main.ts`, which is a UI preference set by a deliberate click. If a third
turns up that restores editable state on its own, name it in the report; it is
somebody's lane, not a thing to fix inside this one.

Finished when `bun run check` is green, a reload returns to the same tab and
wave, back and forward work, an unknown URL value opens the default page
rather than failing, every dial and every picked skin or motion is back at its
default after a reload, no new storage key exists anywhere in the director,
`beforeunload` is untouched, and the commit carries `Check: after a reload, are
you back on the same tab and wave with every setting back at its default?`

Model `sonnet`, effort `think hard`. The judgement is the line between a place
and a setting, and it is now decided — spend the thinking on stating it so the
next lane cannot cross it by accident. Read `tools/director/src/main.ts`,
`bindTabs` and `tools/director/src/tuning.ts` first.

## A RESTATEMENT IS A FILE PER COMMIT, NOT A LINE IN A SHARED ONE
_claude/burn-restated-split-p2 · docs/checks tools/checks/restated.ts tools/checks/run.ts tools/director/src/checks-page.ts_
**Asked for by the owner.**

**Behind `claude/burn-director-session-s15`**, which puts the director's place in the URL — a link cannot point at a tab until a tab has an address.

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

**And while the parser is being rewritten, it gains the two fields the owner
asked for and loses the length nobody asked for.** The list is read on a phone,
in the two minutes before a laptop closes, and trailers written this year have
run to a thousand characters. The skill's `Check:` section now demands one
sentence and puts the detail in fields; this is the half that makes the fields
exist.

- **`before` and `after` become real fields**, parsed and printed beside
  `subject` / `changed` / `decide` / `where`. They are *what to put beside
  what* — `before: SCALE`, `after: MOUNTED SCALE`, naming the buttons that
  select each — because a look judged alone is judged against memory, and
  memory prefers whatever it saw last. `before: nothing, this is new` is a
  legitimate value and must be accepted rather than read as missing.
- **If either names a file under `docs/checks/`, print it as an image path**,
  so a lane that captured the same frame either side of its change has
  somewhere to put the pair.
- **`where` becomes a link, and the director renders it as one.** The owner
  reads this list to decide what to go and look at, so the row that says where
  should *take them there*: once `s15` has put the tab and the wave in the URL,
  a `where` naming a director place is a URL, and `⚑ TO CHECK` prints it as an
  anchor with `target="_blank"` so a click opens the thing beside the list
  rather than instead of it. A `where` that is a shell command stays a command
  — not everything is a page — so the field holds one or the other and the
  renderer tells them apart rather than guessing.
- **Two bulk buttons on `⚑ TO CHECK`, and they must not look alike.** The
  owner asked for a *tested all* button, and it is the right tool for a page
  read in one sitting: you look at eight cards, they are all fine, and ticking
  them one at a time is the reason none of them get ticked. It writes `PASS`,
  and it must say how many it is about to pass. Beside it a second, plainer
  control writes `CLEARED` — the verdict that means *nobody looked and this is
  closed anyway*, which the ledger gained when a backlog of forty-nine was
  reset in one sweep. **Do not let one button do both.** `PASS` is a claim
  about the game and `CLEARED` is a decision about the list, and a control that
  blurs them fills `docs/verified.md` with sentences that are not true.
- **The report gets shorter, not longer.** Today it prints the trailer, a
  derived hint and five restatement fields for every one of fifty-odd entries.
  Lead with the question and where to stand; put the rest behind a flag. Say in
  the commit what the default prints now and why that is the half a person
  actually acts on.

Finished when the parser reads a directory rather than a document, when the
existing entries are split without losing their keying, when a replayed commit
carries its restatement with it, when `before`/`after` are parsed and printed,
when the default report is materially shorter than today's, and when the skill
tells a lane to write `docs/checks/<sha>.md` in its second commit. The keying
stays exact — sha plus trailer text, word for word.
## A SHELL THAT COMES OFF IN PIECES, AND A COLOUR NOBODY KNEW UNTIL IT DOES
_claude/burn-creature-shell-g1 · packages/sim/src/shell.ts packages/sim/src/shell-round.ts packages/sim/test/shell.test.ts packages/content/src/creatures.ts packages/content/src/briefings.ts packages/content/src/waves.ts_
**Asked for by the owner.**

The owner's creature, and most of it is already agreed and half of it is
already built. `docs/spec/systems.md` §5.6 asks for exactly this — *hits cut
real pieces out of it*, *3–6 splinters fly off*, and **the meteor craters to a
hard core that further hits only spark against**. `holes` exists in
`packages/sim`: `bullet-hit.ts` increments it against `cfg.maxHoles`,
`hash.ts` pushes it, and render places crater `k` from the id. That machinery
is built and shipped, for rocks. This lane gives it to a creature and adds the
one thing rocks do not have: something alive underneath.

**The shape of it.** A body that takes several shots. Each hit breaks a piece
out where it was struck, with a small burst at the break. **Two pieces**, and
the owner is right that two beats three. The pieces are column-wide slices, so
their number *is* the body's width on a seven-column field — three is a lot of
the field spoken for, two is proportionate. Two hits also brings the phase
reversal sooner, which matters because the reversal is the design and a shell
phase that outlasts the pair's interest in it has buried its own point. And
two has a virtue three does not: the players can take one slice each, so they
are symmetric right up to the instant the shell is gone and one of them
becomes the only one who can finish it. When the last is gone the core is
exposed — a plain creature in a plain colour,
which **nobody knew until the shell came off**, and which then needs the
matching shot like any other body.

**The two phases divide the work differently, and that is the point of it.**
Breaking the shell is colour-blind: either shot chips it, so either player can
work on it and neither has to be told which. Killing the core is
colour-locked: one specific player must finish it, and until the shell is off
nobody knows which. So an arrival that starts as *anyone, keep hitting it*
turns into *you, now, and only you* — and the turn happens at a moment the
pair cannot plan for. Read `docs/spec/couplings.md` before settling the
timings; that reversal is the whole design and everything else serves it.

**The constraint the owner found, and it is the sharp one.** The cannon fires
straight up, so a bullet meets whatever is lowest in its column first. A shell
stacked in rows would make its upper pieces permanently unreachable — the
lower ones would armour them, and the creature would be unkillable rather than
hard. **So the pieces divide the body vertically, not horizontally**: each is
a full-height slice, and every column of the body has exactly one piece in
front of it. Getting this wrong produces a creature that passes every test and
cannot be killed on a phone, so put the reasoning in the commit and make the
test prove it — fire up each column in turn and assert every piece is
reachable.

**Explicitly not in this lane**, and both are good ideas that belong after it:
a broken piece that keeps falling as a rock (the `Moulting` idea in
`docs/spec/ideas.md` proposes exactly that, and it turns one arrival into
cannon-then-shield in that order — real, and a second mechanic); and any
change to the meteor's own cratering. Do not touch `rock-impact.ts`.

**The rules that are not negotiable**, and this is the first lane of the run
inside `packages/sim`, so read `CLAUDE.md` twice: no `Math.random`, no
`Date.now`, no DOM, integers only with sub-tile values in thousandths, and
`sim` never imports `render`. Every new field on the creature goes into
`hashWorld` — see `docs/decisions.md` #23, which made *hashed* the default and
named the only four exceptions. A shell segment count that two devices
disagree about is a desync that reads like a network bug.

Follow `.claude/skills/new-creature`, which carries the control-visibility
entry, the state machine and the replay test this needs — **including its §5,
which is new: a creature gets one wave that is about it and one briefing card
before that wave.** Both are this lane's, not a follow-up's.

The wave's sentence names the **mistake the creature exists to punish**, never
the creature: THE RUNT is *"The one where a shot that lands is the mistake."*
Here that sentence is about the reversal — an arrival that starts as *anyone,
keep hitting it* and becomes *you, now, and only you* — and if the sentence
cannot be written, the reversal is not landing and the creature is not ready.

The card is three texts. `both` says what the thing is; `p1` and `p2` say what
each seat does about it, and **they must differ**, because for most of this
creature's life neither player knows which of them will have to finish it. That
asymmetry is the card's job: it is the one place the pair is told that the
answer is currently unknown to both of them.

Finished when `bun run check` and `bun run test:determinism` are green, a
replay test kills one from both seats and proves the colour lock only applies
after the shell is gone, the reachability test above passes, and the commit
carries `Check: does the switch from "anyone hit it" to "only you, now" land
as a moment, or does the pair miss that it happened — a wave with one, played
from both seats`.

Model `opus`, effort `ultrathink`. The unpick test says so: this is a premise
about how a creature can be layered, it goes in the hash, and it is expensive
to unpick months later. Think about the two-phase reversal before any code —
the code is the easy half. Read `docs/spec/systems.md` §5.6, `docs/spec/bestiary.md`
and `packages/sim/src/bullet-hit.ts` first.

## A PIECE COMES OFF A BODY AND NOTHING DRAWS THE BREAK
_claude/burn-creature-shell-draw-g2 · packages/render/src/shell-draw.ts packages/render/test/shell-draw.test.ts_
**Asked for by the owner.**

Behind g1, which owns the state this reads.

Two pieces come off, and the break is the whole feel of the creature and the sim cannot express it: a
piece leaves, an edge is raw where it left, and there is a burst at the
break. The owner's reference is a meteorite striking the ship — but with no
fixed form, the shot *loosens a chunk* rather than punching a neat hole.

`packages/render/src/craters.ts` already draws pits with lit rims and shadowed
floors, `rock-impact.ts` already draws a strike, and `effects-spark.ts` and
`sparks.ts` already throw particles. Read all four before drawing anything —
§5.6 asks for splinters and a broken edge that *glows briefly*, and three of
those four already do a version of it. Do not import the meteor's own
functions if it means changing them; a creature is not a rock and the two
should be able to diverge.

**The state that outlives a frame goes in `Effects` and is cleared in
`Effects.reset()`** — `packages/render/test/restart.test.ts` fails if a field
is added and not cleared, and that is correct rather than an obstacle:
`world.beat`, `world.tick` and `world.nextId` all restart at 0, which is how a
crack once came to show before the rock that made it.

**The thing to get right is the raw edge, not the burst.** A burst is cheap
and every game has one; what says *a piece came off this body* is that the
silhouette is now wrong in a specific place — the contour is interrupted, and
the interruption keeps its shape as the body sways. A body that loses a piece
and stays a clean closed blob has lost nothing.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, `restart.test.ts` passes unweakened, and the commit
carries `Check: does a piece coming off read as broken away, or as a hole
appearing — one at 26 px on a phone, and again beside a meteor for contrast`.

Model `sonnet`, effort `think hard`. Read `craters.ts`, `rock-impact.ts` and
`docs/spec/graphics.md` first.

## THREE MOUTHS ABOVE THE SHIP, ONE OF THEM GOES SOMEWHERE
_claude/burn-boss-maze-b1 · packages/sim/src/maze.ts packages/sim/src/maze-round.ts packages/sim/test/maze.test.ts packages/content/src/maze-rounds.ts_
**Asked for by the owner.**

The owner's boss. Three entrances open above the ship, one path through the
tangle behind them actually reaches the thing worth hitting, and the pair has
to find which before the clock runs out and then fire into it. A shot down the
right mouth travels the path and lands; a shot down a wrong one finds something
it should not have, and the ship pays for it.

**It is a boss and not an interlude, and that is decided rather than open.**
The owner called it a boss and the rules agree: `docs/spec/interludes.md` says
in its own words that passing and failing leave by the same door — *no hull, no
score, no scar* — and that the one thing an interlude must never do is end the
run. A round whose failure damages the ship cannot be an interlude. It can be a
boss, and there is a precedent that is almost exactly this shape: **THE
MIRROR** replaces the field with its own choreography, and answers a wrong
input with a rock out of its own body into whichever column the cannon is
standing in — *the ordinary hull breach every missed rock already is: a crater,
a crack, and damage that stays.* Read `mirror.ts` and `mirror-round.ts` before
designing anything; this round's failure should arrive through the same door
rather than inventing a second kind of damage.

**The one thing that decides whether this is worth building.** A labyrinth both
players can see is a solo puzzle with an audience — one person traces the path,
says "left one", and the other presses. That is not this game. **The tangle has
to be split across the two screens**, so neither can trace it alone and the
answer only exists in the sentence between them. Three ways it could split, and
picking one *is* the design work:

- by **region** — each sees half the tangle, and the path crosses the seam, so
  one reads the first half and the other must recognise where it comes out;
- by **layer** — one sees the walls and the other sees which junctions are
  open, so both are looking at the same place and neither sees a path;
- by **end** — one sees the three mouths, the other sees the target and what
  lies beside it, so the pilot knows where to shoot and only the navigator
  knows what happens next.

The third is the closest to `THE SPLICE` in `docs/spec/ideas.md` — *a nest of
tangled cable, two ends, and the colour on the wrong device* — so read that
entry and say in the commit whether this is a different round or that one
wearing a different coat. If it is that one, say so and build it under its own
name rather than shipping a near-duplicate.

**And one ambiguity that must be settled, not guessed.** "The shooting moves
the path" reads two ways: either the shot *travels* an existing fixed path, or
firing *shifts* the tangle so the path changes under the pair. The first is a
quiz; the second is a system, and much better — but it is also a different
round, because a maze that moves cannot be memorised and the pressure comes
from tracking rather than from reading. Decide it, write down which and why,
and note the other in the commit for the orchestrator to park.

**The rules that are not negotiable.** `sim` never imports `render`; no
`Math.random`, no `Date.now`, no DOM; integers, sub-tile values in thousandths.
The tangle, the chosen mouth and the shot's position along the path all go into
`hashWorld` — decision 23 made hashed the default and named the only
exceptions, and two devices that disagree about which mouth is open are two
devices playing different bosses. The rounds are **authored, not generated**:
`mirror.ts` says *nothing here is random — the rounds are authored in the
director, so the whole fight is the same fight on both devices*, and that is
the pattern to copy.

The no-travel rule does not forbid the shot. `docs/decisions.md` #21 says that
rule is about the field, and this is a boss with its own picture — the same
licence THE MIRROR already takes.

Finished when `bun run check` and `bun run test:determinism` are green, a
replay test plays a round from both seats and proves neither can find the path
alone, a wrong mouth breaches the hull through the existing door, and the
commit carries `Check: does the pair actually have to talk, or does one of
them just read it out — play a round from both seats and try to solve it in
silence`.

Model `opus`, effort `ultrathink`. The split is the whole design and the maze
is arithmetic; a labyrinth that one player can solve alone is a boss that
teaches the pair to stop talking, which is the one failure this game cannot
absorb. Read `docs/spec/couplings.md`, `docs/spec/bosses.md`, `mirror.ts` and
`docs/spec/ideas.md`'s `THE SPLICE` first.

## A TANGLE IS ONLY A PUZZLE IF IT CANNOT BE TRACED BY EYE
_claude/burn-boss-maze-draw-b2 · packages/render/src/maze-draw.ts packages/render/test/maze-draw.test.ts_
**Asked for by the owner.**

Behind b1, which owns the state this reads.

The picture is the round. Three mouths above the hull, a tangle behind them,
and — on whichever screen the split gives it to — the thing worth hitting.

**The drawn difficulty is the real difficulty, and it is measurable.** The
catalogue already carries this exact problem and its answer: THE SPLICE's card
in `docs/asset-catalogue.md` has an outstanding check asking whether its tangle
is *genuinely unfollowable, or whether you can get from one end to the other by
eye* — and it says the round dies if a player can trace the strand anyway. Same
here, and worse, because there are three strands and only one matters. Count
the crossings and say the number in the commit; a tangle that reads as a tangle
at card size may be a diagram at phone size, which is the size that counts.

The shot travelling the path is the moment the round pays off, so it is drawn
rather than teleported: it enters a mouth, is out of sight inside, and either
arrives or does not. **Where it goes wrong must be legible** — a shot that
simply fails to arrive teaches nothing, and the pair has to learn something
from a wrong answer or the round is a coin toss with extra steps.

State that outlives a frame goes in `Effects` and is cleared in
`Effects.reset()`; `packages/render/test/restart.test.ts` fails if a field is
added and not cleared, which is correct rather than an obstacle.

Finished when `bun run check` is green, `frame.test.ts` passes through the
strict canvas stub, `restart.test.ts` passes unweakened, and the commit carries
`Check: at phone size, is the tangle unfollowable by eye, or can you trace a
mouth to the target without talking — the director, the maze round, at 380 px`.

Model `sonnet`, effort `think hard`. Read `docs/spec/graphics.md`,
`packages/render/src/mirror.ts` and the SPLICE entry in
`docs/asset-catalogue.md` first.

## A CHECK THAT LANDED YESTERDAY HAS NO "BEFORE" AND COULD HAVE
_claude/burn-frames-f1 · tools/frames/capture.ts tools/frames/run.ts_
**Asked for by the owner.**

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
