# Where a session's time goes

Rough statistics, kept over days, so the bottlenecks in ordinary work become
visible. The owner asked for this on 10 September 2026: *"tasks take a lot of
time, I like to know the bottlenecks."*

**One `##` entry per lane**, written in the commit that lands it, with the
minutes read off commit timestamps, file modification times and the tools'
own durations — never instrumented, and rounded to five. The point is the
shape of the distribution across sessions, not precision. The rows are the
same every time so they can be compared:

- **reading** — finding the seam: the queue entry, the files it names, the
  pattern the last lane used, the docs.
- **writing** — code, tests, comments, candidates.
- **looking** — seeing the result: `versus:shot`, `bun run frames`, the
  browser pane, and the correcting that follows a picture.
- **friction** — commands that failed, hung or answered the wrong thing and
  had to be worked around or fixed before the work could go on.
- **landing** — `check:fast`, the commit, `bun run land`, and every rebase
  conflict or red full check between the first attempt and the trunk moving.

End each entry with the one bottleneck, in a sentence.

## 2026-09-18 — boss-hints — BULB QUEEN says four words

The first of the per-boss cue lanes, and the hardest of them to get right: her
whole difficulty is a column one seat can see and the other cannot, so every
word had to be placed against what its own screen is already shown. `FIRE` on
the mark that is really open, on the navigator only; `MOVE` on the cannon for
the whole bloom and never taken away when he is right; `MOVE` on the plate and
`GUARD` riding the torch down. Her rehearsal lost the page that said the verb
the field now says.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the entry and the brief, `queen-mark.ts`, `boss.ts`, all three cue readings, `view-role.ts`'s two queen predicates, `queen-figure.ts`, the control table for which seat fires |
| writing | 35 | the reading with its argument, six cases in a new test file, the page off the film, the spec paragraph |
| looking | 10 | one frame of her open, cropped to read the two lines |
| friction | 5 | the op-count budget red on four rows; remeasured with `MEASURE` and moved with the reason |
| landing | 15 | `format`, `check:fast` twice — a minute each — the commit, `bun run land --keep` |

**The bottleneck was reading.** The code is forty lines; deciding that a word
must *not* disappear when the pilot is under the right mark took longer than
writing all of it, and it is the only decision in the lane that could have
quietly ruined the boss.

## 2026-09-18 — boss-hints — the full page says which page is not full

The cut this entry asked for had already been made, inside THE FILAMENT's lane
and as friction rather than as the queued work: `effects-spark-silent-boss-b.ts`
exists and carries THE FILAMENT's ten. What was missing was the sign — both
first pages are full, neither said so, and the boss skill still sent a lane to
them by name. Each first page now names its second, and the skill's row names
the `-b` files.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, both spark pages, both ingest pages, `effects-spark-silent.ts`'s spread, the release note that did the cut |
| writing | 5 | two header paragraphs and the skill's row |
| looking | 0 | nothing the game draws moved |
| friction | 0 | none |
| landing | 10 | `check:fast` — the full run, 71 seconds — the commit, `bun run land --keep` |

**The bottleneck was reading**, and it was the whole lane: the work was done,
by a lane that did it as friction on the way to something else, and finding
that out cost more than the sign that was actually missing.

## 2026-09-18 — boss-hints — a claim written ahead of the work says so

A take commit turned `main` red by backticking a scene file its own lane had
not written yet. The rule existed in `docs/queue.md`'s preamble and nowhere the
boss ledger could be read from, and the failure it caused was a bare `doc →
path` list that reads like a typo. The ledger's preamble now says it in one
paragraph, and the drift list carries the convention as its last line.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `doc-drift.test.ts` whole, the ledger's preamble |
| writing | 10 | the paragraph, the `UNWRITTEN` line and the comment that dates it |
| looking | 5 | a throwaway document with one bad path in it, to read the failure a session would meet |
| friction | 0 | none |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` |

**The bottleneck was looking**, and it was the right place to spend it: the
whole fix is a sentence nobody reads until the test fails, so the test had to
be failed on purpose to see what it actually prints.

## 2026-09-18 — boss-hints — `versus drop` reads the directories

`drop` imported the registry, which imports every candidate in the slot, before
it removed any of them — so the last step of the by-hand sequence `adopt` itself
prints could not run on the tree those steps leave. The slot is now read off its
directory names (`candidatesIn`), `adopt` loads the registry where it needs it,
and `DECIDED.md`'s prose moved into `decided-md.ts` because the file was over
the ceiling.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `decide.ts` whole, `registry.ts`'s `discover`, `run.ts`'s lazy imports, where `slotDir` lived |
| writing | 30 | `candidatesIn`/`slotsOnDisk`/`slotOfDir`, the lazy `slotOf`, the `decided-md.ts` split, five tests, two doc paragraphs |
| looking | 0 | nothing the game draws moved |
| friction | 5 | the heredoc guard on a doubled backslash, rewritten through `chr(92)` |
| landing | 10 | `bun run index` for the new file's row, `check:fast` twice, the commit, `bun run land --keep` |

**The bottleneck was writing**, and most of it was the split: the fix is four
functions, but `decide.ts` came out of it at 258 lines and the honest seam was
the half that writes prose about a decision rather than source.

## 2026-09-18 — boss-hints — a boss's list can be photographed

`--boss` writes scalars and refuses arrays by design, so the states that most
need a picture — THE BATON's thread, THE UNDERTOW's breaches, THE TASTER's
blades, THE GORGE's intakes — could not be reached by the tool that exists to
take pictures. `--boss-json '{…}'` writes a list or a shape whole, the two
flags compose into one spec, a field written by both is refused, and the page
holds a list to its own length rather than drawing a boss with fewer sockets
than the simulation has.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `boss.ts`'s header and its page-side checks, `flags.ts`, the existing flag test |
| writing | 30 | the parser, the merge, the three new branches in the page's check, eleven tests, the headers |
| looking | 5 | THE BATON with ten sockets dark — a state a wave never reaches in 120 ticks, rendered in one command |
| friction | 5 | `run.ts` hit the 250-line ceiling on a three-line doc paragraph; folded into the paragraph above it and queued the file |
| landing | 10 | `format`, `check:fast` twice, the commit, `bun run land --keep` |

**The bottleneck was writing.** The parser was ten minutes; the page's type
check was the rest, because a list that is written short is a picture of a
boss the simulation cannot have, and that had to be refused by name.

## 2026-09-18 — boss-hints — the three handle bosses speak in the cue's voice

THE SINEW, THE SURGE and THE ANTIPHON wrote their own word beside each handle,
in `handle-draw.ts`'s type at `handle-draw.ts`'s size, under both handles — so
a pair met two prompt systems in one fight. The word is a `BossCue` now, built
where the ring is drawn because the ring's place is a whip, a swell and a sink
no reading can see, and drawn by a hand split out of `boss-cue-draw.ts`. Two
rules came with it: the cue is only on the seat that can act, and a kind line
that repeats its verb is not drawn — which is the objection that had kept these
three out.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the entry, `boss-cue.ts` and its four readings, `decisions.md` #34, the three grip files and where their geometry comes from |
| writing | 45 | `boss-cue-text.ts`, the three call sites, seven tests across three frame files, the sweep's exemptions deleted, the spec's *Not yet* rewritten |
| looking | 10 | one SINEW frame: CARRY over PULL on the pilot's handle and nothing on the navigator's |
| friction | 5 | the first count was wrong twice — a cue is two lines, and on THE SURGE both of them said HOLD |
| landing | 10 | `index`, `format`, `check:fast`, the commit, `bun run land --keep` |

**The bottleneck was reading.** The entry asked for the word to become a
`BossCue`, and the whole question was where it could be built without the
reading guessing at a ring's place — an hour of the tree to decide three lines.

## 2026-09-18 — boss-hints — the name registry's workerd is raised before its first case

`names.test.ts` raised a real workerd lazily, so the boot was charged to
whichever case reached the worker first — and under the full check's shards
that boot goes past the five seconds a case is allowed, which read as all
fourteen of them timing out on a diff that touched nothing under
`apps/server`. The budget the room files already run on moved to `relay.ts`,
beside the raise it is a budget for, and this file now awaits `mf.ready` in a
`beforeAll` given it, the way `room.test.ts` and `room-seat.test.ts` do.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `relay.ts`, `shard.ts`'s two numbers, and `phone.ts`, which turned out to have written the rule down already |
| writing | 10 | the hook, the constant's move and the paragraph saying why the shard-scheduling option was refused |
| looking | 0 | nothing is drawn |
| friction | 0 | — |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` |

**The bottleneck was reading.** The fix was three lines; finding that the
pattern already existed two files away, under a constant named for phones, was
the whole of the work.

## 2026-09-18 — boss-hints — a rehearsal's picture starts under the band

A film was laid out in the whole box less the nav bar, so the corner plate stood
*over* row 0 and everything hung off it — THE ORRERY's top arc, THE TASTER's
crest, a boss cue's word — was drawn behind the band. The band's foot now comes
off the film's playable height the way the bar's already did, so the picture is
squeezed rather than slid, and `filmLayout` returns two layouts: the page, which
the band still spans whole, and the picture, which starts below it.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `guide-film.ts`, `layout.ts`'s `computeStage`/`computeLayout`, `guide-look.ts`, `round-header.ts`, and which fixtures hang over row 0 |
| writing | 40 | the split layout and its reasoning, the translate in `guide-scene.ts`, the geometry test on both seats, and `pageSwitch` when the file went over the ceiling |
| looking | 25 | `bun run frames` on THE TASTER and THE ORRERY, twice each — only the PNG showed that the first clamp had inverted the cue on THE SCUTTLE |
| friction | 10 | the line limit twice: the first trim of comments bought one line at a time before the real seam, the switch's own clock, was taken |
| landing | 15 | `format`, `check:fast` twice, `queue done`, the commit, `bun run land --keep` |

**The bottleneck was looking.** Nothing in the tests could say the picture was
whole — a clamp that reads correctly puts a word in the band on one boss and
upside down on another — so every attempt cost a render and an eye.

## 2026-09-18 — boss-hints — every boss wave says which kind of boss it is

One authored field beside `boss`, two values, on all thirty-three boss waves: a
picker in the director under the wave's prose, a line in the serializer, and the
table in `bosses.md` where the judgement can be argued with. The field is
authored and not derived because both directions of the obvious rule are wrong —
THE MAZE and THE MIRROR are special on the standard panel and THE INSTAR is
normal on a panel of its own.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `wave-types.ts`, the rail and its markup, `serialize.ts`, `fault-fields.ts` for the picker pattern, `fake-dom.ts` for how the director is driven in a test |
| writing | 35 | the field and its reasoning, thirty-three authored lines, the invariant, the serializer line, `boss-type-field.ts` and its four tests, the section in `bosses.md` |
| looking | 0 | the director's own server starts the main checkout and not this worktree, so the picker is proved by the fake DOM rather than by an eye |
| friction | 20 | one line per boss wave took three act files over the 250-line ceiling at once, and two of them had to hand a wave to the page after them before anything else could land |
| landing | 10 | `index`, `format`, `check:fast`, `queue done`, the commit, `bun run land --keep` |

The bottleneck was the ceiling: a field that costs one line per wave costs three
files a split, and the split has to keep the order of the waves — which is why
each page handed its last wave to the page after it rather than taking a new
file.

## 2026-09-18 — boss-hints — the cue's words come out from under the plate

The kind line stopped at the top of the canvas, which in a rehearsal is 94
pixels inside the tutorial band, so a boss whose mark stands high drew PRESS or
HOLD under the plate. The clamp is `headerTop`'s, the same drop a round's header
takes — and the fix turned out to be bigger than the entry: on four bosses the
*mark itself* is in the band, so pushing the kind line clear put it below its
own verb, and on three of those the verb was under the plate as well. Both lines
take the floor now, and the kind line goes under the verb when there is no room
over it.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `boss-cue-draw.ts`, `round-header.ts`, `guide-scene.ts`'s `clearTop`, `guide-film.ts`, and the sweep's own header for the rule about labels on bodies |
| writing | 30 | the two-line clamp and its reasoning, three cases in `boss-cue.test.ts`, the sweep widened to all fourteen cue words with the two handle hints named |
| looking | 10 | THE SCUTTLE's second page shot twice, which is what showed PRESS alone under the plate with its verb still hidden and sent the clamp back for a second pass |
| friction | 5 | the sweep turned up a wave at a time — SCUTTLE, then ANTIPHON, then DIASTOLE, then CANDLE — because a text filter cannot tell whose word it is |
| landing | 10 | `format` after lint, `check:fast`, `queue done`, the commit, `bun run land --keep` |

The bottleneck was the picture: three arrangements passed every test and only
the frame showed which one a pair could actually read — a lone PRESS under the
plate with its verb behind it is green and wrong.

## 2026-09-18 — boss-hints — two prose reasons that were about the wrong thing

`STILL_PROSE` carries a reason per unfilmed wave and no test reads one, so they
go stale quietly. THE ORRERY's had already been rewritten by the lane that
filmed it; THE HIVE's and THE INSTAR's still said the look was undrawn, and both
are drawn. What is actually in the way is different in each case, and neither
was the look: THE HIVE cannot be won as it stands, so no honest film of it can
be stepped, and THE INSTAR's body says its own verbs, so the open question is
whether it wants a film at all. The two stale counts in the file's own comments
went with them.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry against the tree — THE ORRERY was already done, `render/` has nine INSTAR files and three HIVE files, `bosses.md` §11.14 for what the film waits on |
| writing | 10 | the two reasons, the two counts in the opening comments |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, `queue done`, the commit, `bun run land --keep` |

The bottleneck was that a third of the entry was already stale when it was
claimed, because the lane that filmed THE ORRERY landed between the entry being
written and being taken — a per-wave reason is worth re-derived before it is
rewritten.

## 2026-09-18 — boss-hints — THE INSTAR's page catches up with THE INSTAR

Two queue entries, one page. `docs/spec/bosses.md` said nothing of the boss was
built and listed THE INSTAR as in hand *and* as built at once, because the first
lane wrote both and the second landed hours later without taking either down.
Every claim was checked against the tree — the hit test, the director's row and
pose, the controls row, the eleven events — and every one had landed; the one
still-true clause, that the guide's rehearsal is three strings and not a film,
is all the paragraph now says.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | §11.32's look section and its tail, `render/handles.ts`, the director's two INSTAR files, `docs/spec/controls.md`, both silent lists, to prove each claim landed |
| writing | 15 | the contents' *Still in hand* block, the rewritten tail, the sounds sentence split back out of it |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, two `queue done`, the commit, `bun run land --keep` |

The bottleneck was that a *What is not built* paragraph is written by the lane
that cannot yet see the next one land, so it is stale within hours and nothing
in the check notices: the only way through it was to read every claim against
the tree one at a time.

## 2026-09-18 — boss-hints — a task per boss, three times over

The owner answered the three asks — THE INSTAR, THE STARE and THE REPRISE are
all normal, which settles that the tag is about the shape of play and not the
panel — and asked for the three enhancement themes as a task per boss wave.
Ninety-five entries generated from the tree itself, six umbrella entries taken
out from under them, and the three briefs written once in the skill so they can
be corrected once.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the boss roster again off the tree, because three films had landed from other lanes since the morning and the stale-reason entry was about four waves and is now about three |
| writing | 35 | `.claude/skills/new-boss` section 6 with the three briefs, the generator, the ninety-five entries, the tag entry's answer, the rewritten stale-reason entry |
| looking | 0 | nothing visible moved |
| friction | 10 | the first generator repeated three paragraphs thirty-three times; a second pass moved the prose into the skill and left the entries as facts and a pointer |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was deciding what an entry is for when there are ninety-five of
them: a per-boss entry that restates the brief is thirty-three copies of a
paragraph that will be corrected in one of them and stale in the other
thirty-two, so what each one carries is its own boss's facts and a pointer.

## 2026-09-18 — boss-hints — nine lanes queued off one message, and the look standard

The owner's four asks for the recent bosses turned into queue entries: the
special/normal tag with its classification and the three it cannot call, the
cue on the fifteen bosses that have none, states that change between gestures,
gestures that are not on the panel, the graphics survey against THE INSTAR, the
first boss to lose its rehearsal, and one stale reason four waves carry.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `wave-types.ts` for where a tag sits, `rail.ts` for the wave details panel, the boss roster with its control sets, §11.32 for what THE INSTAR's look actually has, `scenes-prose.test.ts`'s reasons |
| writing | 30 | nine queue entries, the five-point look standard in `.claude/skills/new-boss` §5 |
| looking | 0 | nothing visible moved |
| friction | 5 | a scratch script under `tools/` cannot resolve `@neon-spore/content`, so the roster came out of a throwaway test file |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was sizing rather than writing: *a graphics task per new boss*
is twelve lanes, and twelve look briefs cannot be written honestly without
twelve pictures — so the entry that went in is the survey that takes them and
leaves the twelve behind it.

## 2026-09-17 — boss-hints — the briefings give the words back

The other half of #34: what the fight now says, the rehearsal stops saying.
Nine boss films read page by page against the twelve cues; five pages turned
out to hold nothing but a verb. Four kept their tick and their seat and were
rewritten, one came out, and four whole films had nothing to take.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the nine films' pages and acts, `scenes.test.ts` and `scene-pages.test.ts` for what a removal would break, `guide-hand.ts` for what a page's seat actually is |
| writing | 25 | the five sites and their comments, `briefings.md`'s new section and table, the skill's new rule and checklist line, the ledger paragraph, a queue entry |
| looking | 5 | one PNG of THE BATON's rewritten page |
| friction | 10 | the first pass deleted all five pages, and four of them would have dropped a pilot's grip or trigger onto the navigator's screen where no hand is drawn — found by reading `guide-hand.ts`, not by a test |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was a rule that reads simpler than it is: *a page that only
names a gesture comes out* is true of the words and false of the page, because
a page's seat is which screen the film shows. Nothing in `packages/content`
says so, and every test stayed green through the wrong version of the change.

## 2026-09-17 — boss-hints — the other six bosses, and what the cue must not say

The second half of #34's picture: THE THROAT, THE LEDGER, THE LEAD, THE
SCUTTLE, THE DIASTOLE and THE ORRERY. Half the work was deciding where the cue
has to stay **silent** — all six are fights whose difficulty is a number the
pair says out loud, and a word on the right beat would answer it — so three of
the eleven new cases assert that nothing is drawn at all.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | six design headers, their states, and each one's `showsX` split — the question every time was which half of the picture this seat was given |
| writing | 35 | `boss-cue-read-c.ts`, the switch that replaced the narrower chain, `BossCue.framed`, two geometry exports (`diastoleY`, `scuttleLockBox`), eleven cases, the spec's second table |
| looking | 10 | THE SCUTTLE twice: the first frame drew a second lock over the one her screen already had, and the word landed inside it |
| friction | 5 | an unused parameter warning and `bun run crop` refusing a fractional zoom |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the picture, and it earned its ten minutes: nothing in the
code could have told me THE SCUTTLE already wears a target lock on exactly the
column the cue wanted to mark. One frame, and the fix — `framed: false`, borrow
the box that is already there — is now the rule for every boss that marks its
own places.

## 2026-09-17 — boss-hints — the field says one word, on six bosses

`decisions.md` #34 turned into a picture. A pure reading of `World` —
`boss-cue.ts` and its two readings — a `target-lock` frame in rock grey with
the verb under it and the kind of action over it, drawn from `frame-field.ts`
on the seat that can act, for THE CANDLE, THE GORGE, THE CURTAIN, THE TASTER,
THE UNDERTOW and THE BATON. Nothing was added to `packages/sim`, to `hashWorld`
or to the wire.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the six bosses' state and predicates, their `showsX` splits, the geometry each mark had to hang off, `choir-prompt.ts` and `roles.md` for whose thumb is whose |
| writing | 45 | four render files, two small exports refactored out of existing draws (`candleGlowY`, `beadPoint`), nineteen test cases, the spec's *cue, as built* table, the skill and `instar.ts`'s reversed refusal |
| looking | 5 | one frame of THE CURTAIN on the navigator's screen: `CARRY` over the frame, `SHOVE` under it |
| friction | 5 | `import`s unsorted and `docs/INDEX.md` out of date — both the standing two-command fix, neither a surprise |
| landing | 10 | `check:fast` twice, the queue entry, the commit, `bun run land --keep` |

The bottleneck was reading six fights well enough to know *which* beat wants a
word: the cue is only worth having where something is owed, and THE GORGE — a
boss whose whole rule is *stop shooting* — had to be read twice before it was
clear that its cue must be silent for a whole movement.

## 2026-09-17 — boss-hints — the second brief, read against the engine

A twenty-boss brief from the same source as the first, arriving after fourteen
of the fifteen had shipped. Four things in it are not on the page: the cue the
owner asked for the same day, a scene layer above the step list, four gestures
the union has not got, and `StepBack` again. One of the twenty categories is
worth a boss and it is written as §17 THE FILAMENT; the other nineteen are on
the page or in the game under another name, and the table says which.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the brief against the page's own four corrections, the refused-by-name sheet, the primitive library, `instar.ts`'s design paragraphs |
| writing | 25 | `decisions.md` #34, the second-brief section, the category table, §17, five library rows, the contents and the collision ledger |
| looking | 0 | nothing drawn — a spec lane |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was telling a new category from a re-skin: nineteen of the
twenty had an ancestor somewhere, and finding each one meant reading a shipped
creature rather than the boss page.

## 2026-09-17 — boss-hints — MECHANICS off NOT BUILT YET

The owner asked for the page to go. It was a second rendering of `systems.md`
and `ideas.md`, both of which the SPEC room already reads whole, and taking it
off took three parsers, one API read, four tests and the fifth of the five
places a new concept has to reach — that place existed because the page kept a
hand-written shortlist, and the boss page derives every entry from a heading it
has just read.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `backlog.ts` and its four callers, `concept-places.ts`'s argument for the five, the tab wiring in `backlog-tabs.ts` |
| writing | 10 | the page's removal, the idea group deleted, `buildBacklog` down to two arguments, the four tests |
| looking | 5 | the sheet opened on BOSSES in the browser pane, one frame |
| friction | 10 | the trunk was already red — `e2c4b2c7` named a scene file no lane has written — repaired here and queued |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

The bottleneck was inherited rather than earned: `bun run check:fast` failed on
somebody else's ledger row before it said anything about this lane's diff, and
the first reading of that failure was spent proving it was not mine.

## 2026-09-17 — boss-implementation — THE CURTAIN, the rehearsal

The third boss film written after its look, and the first whose every act is
the pilot's hand on the boss: ten pages over 2400 ticks, a bounce, a lobe
off, a shove, a carry of four, the core bared and hit, the drift. The same
commit repairs THE GORGE's landing, which had left its film test and §3.2's
count out.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `curtain.ts`, `curtain-step.ts`, the grip and carry in `scene-script.ts`, the seed's reach and reroll |
| writing | 15 | the scene, the registry, the prose list, the two film tests, §3.2, the §11.24 paragraph |
| looking | 15 | eighty seeds probed for a core under the cannon with a soft lobe over it, four runs of the acts against the sheet's glide, one frame |
| friction | 10 | `scene:` put on the wave instead of in its guide, a bolt fired into the glide taking a lobe and the core firing back, the GORGE test block found missing from its landing |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the sheet's clock against the hand's: a bolt a beat early
meets cloth still gliding, and the only way to find the beat was to run the
acts and read the events.

## 2026-09-17 — boss-implementation — THE GORGE, the rehearsal

The second boss film written after its look, and the one that cut the scene
list in two: thirteen pages over 3180 ticks, a stray bead, a wrong colour,
two intakes pierced and the stray spat back and broken.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `gorge.ts` and `gorge-step.ts` for what a shot does at each count, the spit rule, `mapCol`, the body-page rule in `scene-pages.test.ts` |
| writing | 10 | the scene, `scenes-choreographed.ts` and the split, the film test, §3.2's count, the §11.23 paragraph |
| looking | 5 | one probe against the scene's own run, two frames off `bun run frames --opening guide` |
| friction | 5 | two captions a character over, a page about the spat body that had to run six beats for the body to reach the middle of the screen, a blank line the director's round-trip refused, `scenes.ts` at its 250th line |
| landing | 5 | `check:fast`, `bun run index` for two rows, the commit, `bun run land --keep` |

The bottleneck was the tests catching the small things one at a time — the
caption length, the body's row, the blank line — each a run of the suite.

## 2026-09-17 — boss-implementation — THE CANDLE, the rehearsal

The wave's guide had been prose only since the boss landed. A twelve-page
film over one loop of 2400 ticks: the dark, three dims under a drifting
glow, one shot eaten from the faced column, two clean ones and the beam.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the new-tutorial skill, `scene-aim.ts` and `boss-answer.ts`, THE UNDERTOW's film and its test, the candle's step for what moves on which beat |
| writing | 10 | the scene, the `bossAnswerCol` line for the glow, the two tests, §3.2's count, the §11.22 paragraph |
| looking | 5 | three probe scripts against the scene's own run — which seed keeps the face reachable and the glow off it at the two ticks the film needs — and one frame off `bun run frames --opening guide` |
| friction | 5 | the first `atBoss` act slid to column 0 because no line in `boss-answer.ts` answered for the candle; the beam held while the glow was still drifting missed it, so the film keeps the beam for the last step |
| landing | 5 | `check:fast`, `bun run index` for the new file's row, the commit, `bun run land --keep` |

The bottleneck was the drift: the glow moves every three beats and a bolt
takes just over one to land, so every fire in the film had to be placed
inside a window that a seed decides, and the seed was found by search.

## 2026-09-17 — boss-implementation — THE CANDLE, corner light first

The design's step 1 as a look: the dark rolling in from the corner light's
side over the four beats rather than falling evenly, and the SLOW over the
flash beat put to the owner as a question.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `candle-dark.ts`, `corner-light.ts`, the design's §14 table and its SLOW paragraph, `candle-frame.test.ts`'s helpers, what the canvas stub logs |
| writing | 20 | the front in `candle-dark.ts`, the per-column alpha through `drawLit`'s runs, the test that reads the black's alpha back off the log, the write-up, the queue's question |
| looking | 10 | the browser route once: the preview restarted for the build, THE CANDLE reached by wave index, one frame two beats into the dark |
| friction | 5 | unpausing the hidden tab let the run catch up ten beats before the paint; the world was set and painted in one synchronous block instead |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was small this time: the picture, again, for the preview
that has to be rebuilt and the tab that runs ahead when unpaused.

## 2026-09-17 — boss-implementation — THE UNDERTOW, the plate's hole and step 11

The plate a tall lobe takes drawn as a hole in the outline, and a cannon slid
off in time closing the plate — in the sim as the design says, and on the
pilot's screen as the bow running down.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `hull.ts`'s crater clip, `craters.ts`, `crater-geom.ts`, `scars.ts`, `undertow-draw.ts`, `effects-boss.ts`, the harness's `onTick` |
| writing | 40 | `plate-gap.ts`, the seam split off `undertow-draw.ts`, `undertow-fx.ts`, the step's `seat` branch and `undertowClosed`, the bind, the silent lists, two tests, the write-up |
| looking | 20 | the browser route three times: the first build was stale, the second had the seat's glow in the hull's own colour on the hull, invisible; the rim flare replaced it |
| friction | 10 | the preview had exited with the tab still holding its page; the tab is hidden in the pane so the run held itself and painted the pause veil until `document.hidden` was overridden; `undertow-step.ts` four lines over 250 |
| landing | 10 | `check:fast` red on `docs/INDEX.md` for three new files, `bun run index`, the commit, `bun run land --keep` |

The bottleneck was the picture: a preview that builds once has to be
restarted for every change, and a tab the pane hides holds the run paused.

## 2026-09-17 — boss-implementation — THE UNDERTOW, the plate taken

Steps 9 and 10 as a fact: a tall lobe withdrawing takes the plate, its
column's and the neighbour's, marked on the scar and hashed.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the design's beat list, `undertow.ts`, `undertow-step.ts`, `hull-damage.ts`, `hull-types.ts`, the scar fixture, `craters.ts`'s header for what a hole in the outline already is |
| writing | 10 | `Scar.plate`, the hash part, `scarHull`'s flag, `undertowPlateBeside` called from both the widening and the withdrawal, the event's `tall`, two tests, the write-up |
| looking | 0 | nothing moved on screen |
| friction | 5 | the new export missing from `boss-surface.ts` as well as the barrel; the event check written after `beats()` had cleared it |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was deciding where a plate lives: on the boss it would go
with the boss, and the design says the rest of the run, so it is a scar.

## 2026-09-17 — boss-implementation — THE BATON, the thread

Step 12's picture: the arm one segment long, hanging by a thread. The sim
remembers the beat it came down to one socket, the look thins everything
above the last socket.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `baton-draw.ts`, `baton-step.ts`'s landing, `opening.ts`'s driven loop, the page handle |
| writing | 5 | `threadBeat` and `batonOneSegment`, the hash row, the config field, the spine split in two widths, the husks, two tests, the write-up |
| looking | 5 | the frame from the preview page: reach `passing`, set the one-segment state by hand, unpause for one paint, crop the canvas |
| friction | 5 | `bun run frames --boss` refuses arrays, so the state had to be set in the page; the page stayed paused under a `hidden` hold the built-in browser never lifted, and the first capture was a wave lost while the world ran |
| landing | 5 | `check:fast`, the commit, `bun run land --keep`, the ledger mark |

The bottleneck was the picture: a boss state the frames tool cannot set is a
boss state that costs a browser, a hand-built world and a hold to find.

## 2026-09-17 — versus — the lost screen's plates shut

`lost:screen` / `shut` onto the field, by the owner's pick; `bleedout`, `hold`
and `spall` cleared with the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/versus.md`'s adopt section, the README's by-hand steps, `lost-look.ts`, both paints |
| writing | 15 | the move, the record, three headers, the ledger entry, the test's comment |
| looking | 10 | the STATES card — the `--tab STATES` guess failed, `--open "▣ DOCUMENTATION" --inner STATES` is the way in |
| friction | 10 | `adopt` refused on the shipped `words`; `drop` failed twice, on the moved file and on the three siblings importing `plates`, and ran against the shipped `lost-shutters.ts` restored for its length |
| landing | 10 | `bun run index`, `check:fast`, the commit, `bun run land --keep` |

The bottleneck was `drop` loading a registry that no longer resolved: taking
a function by hand means the tree is mid-move when the command runs, and it
imports every candidate in the slot before it removes any of them.

## 2026-09-17 — boss-implementation — THE BATON, the crossing

The merged bead's final flight, the design's step 13: `baton-cross.ts`, the
`crossing` stage eleven beats long owing an act a beat in turn, the miss that
sends the bead back up a relit arm, the drop that opens both locks, two
sounds, six tests, §11.18's paragraph and its three departures.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | the files were open from the look lane |
| writing | 5 | the crossing file, the press and step branches, the sounds, the tests |
| looking | 0 | nothing visible moved: the bead is drawn as it was, only longer in the air |
| friction | 5 | four tests red — `world.events` is cleared every tick, so a count is kept on the state instead; and the launch lock held player 1 through the pod's fall, so the drop opens both locks |
| landing | 5 | `check:fast`, the index, the commit, `bun run land --keep` |

The bottleneck was the lock outliving the crossing: his last act locked him
for the beat the pod fell in, and the maw could not open under it.

## 2026-09-17 — boss-implementation — THE BATON, the second bead's look

The look half of the second bead: `baton-bead-draw.ts` split off
`baton-draw.ts`, the twin drawn a little smaller and with a dark pupil so
which bead is going is a shape and what to shoot is a colour, the merged bead
a third larger with a second halo and an outer ring, two frame tests per
screen, a PNG with both beads lit, §11.18's *What it draws*.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | the drawing file was already open from the sim lane |
| writing | 5 | the bead file, the two tests, the paragraph |
| looking | 5 | a probe to find launch ticks that reach the twin, one PNG |
| friction | 5 | the first probe's shots struck nothing; a second probe over every launch phase showed every one strikes, so the fault was the probe's and not the game's |
| landing | 5 | `check:fast`, the index, the commit, `bun run land --keep` |

The bottleneck was reaching the twin in a frame at all: the press list has
to make three real handovers first, and the first attempt at it struck
nothing.

## 2026-09-17 — boss-implementation — THE BATON, the second bead

The design's step 9 as a simulation lane: after `batonTwinAfter` dark
sockets a second bead lights in the top socket in the other colour, the one
trigger sends whichever bead has sat longest (`batonLaunchable`), a bolt
takes the lowest unstruck bead in its column, the lead alone swings the arm
and the other rides it, a bead in the last socket waits for the one above it
and the two merge. `BatonState.beads` in place of the arm-level bead fields,
`stillBeat` so a turn is never counted while the other bead flies, two events
and their sounds, `baton-bead.ts` and `baton-pair.ts` split off the two files
that went over, nine new tests and §11.18's paragraph.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the design's steps 9–13, `baton-step.ts`, the frame test's helpers |
| writing | 10 | the bead list, the launch order, the lead's column model, the twin, the merge, the tests, the paragraph |
| looking | 0 | nothing visible moved — the twin is drawn as the first is, one socket up |
| friction | 5 | the sitting bead settling home during the other's flight, found with a probe; a merge sound in the speech band; two files over 250 |
| landing | 5 | `check:fast` three times, the index, the commit, `bun run land --keep` |

The bottleneck was the turn clock: with two beads the shipped settle rule
made a fight that could not be won, and it took a probe printing every
handover to see the two beads ping-pong between the top two sockets.

## 2026-09-17 — boss-implementation — THE BATON, the shot is the act

The two smallest of §11.18's *not built*, as one simulation lane: the design's
step 7 — *a shot at a creature is her turn spent* — and the beam meeting the
bead. `batonShotSpends` locks player 2 from the tick any shot of hers leaves
(`bullets.ts`, `lance-burn.ts`), so the wrong colour and a bolt at nothing
cost the beat too and the strike no longer sets the lock itself; `burnColumn`
asks `batonBeadAlong` beside the body and the pod, the way a bolt does. Four
tests, the §11.18 paragraph, the director's note, the ledger claim on `main`.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the design's beat list, `baton-press.ts`, the bullet sweep and the beam's, the lance test's prime helper |
| writing | 15 | the spend, the two call sites, the beam's third stop, four tests, §11.18, the note |
| looking | 0 | nothing visible moved — the grey panel already draws the lock |
| friction | 5 | the render test that had the lock spent on the hit, which `check:fast` did not reach and `land` did |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` twice |

The bottleneck was deciding where the act *is* — the press, the bolt leaving
or the hit — before a line was written; the code followed in a quarter hour.

## 2026-09-17 — boss-implementation — THE ANTIPHON, the turn under a hand

The third lane of the boss that grows a thing nobody has a word for: the
design's one concept that wants no time effect. `antiphonOrgan` is a
`DragTarget` heard from either seat (`sim/antiphon-hand.ts`), `turnTicks`
counts while a thumb rests and stops when it lifts, the contour is drawn
turned on the organ and never on the rail, and the handle — the organ's own
circle, a grip mark, the word — is the first in the game on one screen only
(`render/antiphon-grip.ts`). Threaded through `Field` and its fourteen
builders, the frames tool, the director's card and pose, and `controls.md`.
The lane was cut by a context compaction between its halves.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | THE SURGE's hand and grip as the pattern, `Field` and every builder, the frames hold list, the director's card and pose files |
| writing | 30 | the sim half and its six tests; the shape's `turn`, the grip, the handle chain, the two render tests, fourteen `antiphon:` lines, the director's two files, `controls.md`, §11.31 |
| looking | 10 | three frames — the grip missing under a growing organ, the hold too short to see a turn — and the two things they moved |
| friction | 5 | the barrel edit that missed one page, a test that expected the turn a tick before the grow, the config field the director's table wanted |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the fourteen places a `Field` is built by hand: every
required field on it is a fourteen-file edit, and the compiler is the only
thing that finds the fourteenth.

## 2026-09-17 — boss-implementation — THE ANTIPHON, the look

The second lane of the boss that grows a thing nobody has a word for. Four
draft creatures from the shape sheet became the heads of its four families
of contours (`content/antiphon-contours.ts`); the body, the organ under the
pilot's screen, the rail of candidates on the gunner's, the window thread,
the pits, the ship and its decoys, the still and the eruption are drawn in
`render/antiphon-shape.ts`, `antiphon-draw.ts` and `antiphon-fx.ts`, and
nineteen frame tests prove every state on all three screens and the split
both ways. The lane was cut in two by a shutdown and picked up an hour later.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE SCUTTLE's shape/draw/fx pattern, the drafts' status and `suggests` rules, `view-role-clocks-b.ts` |
| writing | 20 | the contours, the three render files, the effects wiring, the frame test, §11.31's *The look* |
| looking | 5 | two frames — the rail clipped at the right edge, the body too pale — and the numbers they moved |
| friction | 5 | three guards that fire only in the full check, one at a time: a taken draft keeps no `suggests`, the catalogue counts drafts, `cols / 2` is `midCol` |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the guards that only the full `bun test` runs — the
concept-art test, the drafts count and the copies table — each found by a
separate red run after the work was thought done, because `check:fast` reaches
only the tests a diff touches and a look's diff does not touch those.

## 2026-09-17 — queue-scratch-guards — the scratch directory out of the guards too

The second half of the typecheck item, queued an hour after the first landed
and found the same way: a probe wrote `60 / cfg.bpm` and `copies.test.ts`
failed the lane over a re-derived rule in a git-ignored throwaway. Three walks
reached the directory and each had its own chain of exclusions. `source-scan.ts`
— which already owns `ROOT` and `stripNonCode` so two guards cannot disagree
about what counts as code — now owns the list of what they never read, and
`copies.test.ts` and `tree-walk.test.ts` both ask it. `counted` in the size
hook, which `limits.test.ts` and the after-edit warning share, skips the
directory for its own reason: a throwaway asked to split at 250 lines is a
warning at the worst possible moment.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the four walkers, `counted`, `tree-walk.test.ts`'s `.claude` guard, which of them reach `tools/**` |
| writing | 10 | `UNREAD` and `read`, three call sites, two tests in the probe package |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 10 | `check:fast`, then the whole `bun run check` with the awful probe still there, the commit, `land --keep` |

The bottleneck was that the first fix was aimed at the symptom — one config
file — rather than at the shape: four walks over one tree, each deciding for
itself what it does not read, is a defect that was always going to be found
twice.

## 2026-09-17 — queue-unverified-stare — THE STARE's rhythm counted rather than watched

The second unverified entry from a cloud session's landings, asking whether
four beats of warning is long enough to say *it is you* and whether the looks
grow into something survivable. Nothing of the eye is drawn either, so the
questions were put to the wave instead: the cycle walked out beat by beat
against the arrivals in `act-7c.ts`, and a rock's fall measured rather than
assumed. Survivable, with six beats to spare in the worst case. The warning is
2.50 seconds and not the three the config and the spec both claimed, which puts
it under `latency.md`'s own four-second rule for anything that has to be
announced — and the tell is nothing but an announcement. That went to the queue
with its options rather than into the number, along with a ceiling no wave is
long enough to reach.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `config-stare.ts`, `stare-step.ts`, §11.16, `latency.md`, THE STARE's wave |
| writing | 15 | the probe, five comment corrections, the spec's two, three queue entries |
| looking | 10 | three probe runs and the cycle read against the wave's fifteen arrivals |
| friction | 5 | the fall trace stopped at the first body that landed, because a lost wave freezes the field; `copies.test.ts` failed on the probe's own `60 / cfg.bpm` |
| landing | 5 | `check:fast`, the commit, `land --keep` |

The bottleneck was the same one as the lane before it: with no picture, every
question an eye would have answered at a glance had to be turned into a
measurement first, and the measurement needs a wave that does not stop at the
first mistake.

## 2026-09-17 — queue-scratch-typecheck — the scratch directory taken out of the typecheck

The queue item the lane before it wrote, found by being bitten: `tsconfig.json`
includes `tools/**` and nothing excluded `tools/probe/scratch`, so a probe left
behind failed the typecheck in a file `git status` cannot show. One line in the
`exclude` list, the sentence in `tools/probe/run.ts` that was half true made
whole, and two tests in the probe package's own suite so that tidying the list
cannot quietly undo it. Proved the way the entry asked: a deliberately red
probe — an unguarded index, an implicit any, an unused import — left in the
directory while `bunx tsc --noEmit` and `bun run check:fast` both ran green.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `tsconfig.json`, `.gitignore`, `run.ts`'s header, the probe package's existing test |
| writing | 10 | the exclude line, the comment, two tests, the deliberately loose probe |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

The bottleneck was nothing; the item was written with its own proof in it,
which is what made it a fifteen-minute lane rather than a rediscovery.

## 2026-09-17 — boss-implementation — THE SCUTTLE, the simulation

Lane one of the eighth boss off the choreographed list: a frame of
twenty-one sockets over the top of the field, a part coming loose on a
cadence and thrown as an ordinary arrival, the live part struck off while it
hangs, twins and a faster cadence as the frame thins, a pod that buys a beat,
the wind-up under THE SLOW that only the standing beam ends, and the collapse.
Every event silent until the look lane draws it.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | §15 of the design, THE LEAD's files as the pattern, `pod-intake.ts`, `spawn.ts`, `hull-damage.ts` for the three hooks |
| writing | 45 | six sim files and eleven wirings, the audio family, the director's sheet, the content, the fixture, fourteen tests, §11.30 |
| looking | 0 | nothing visible moved |
| friction | 10 | three files at the ceiling (`bosses-clocks.ts`, `sound-link-none.ts`, `entries.ts`) each wanted a second page or a re-export before a line would fit; a wind sound over the speech-band budget; `tsc -p packages/sim` with no tsconfig there |
| landing | 5 | `check:fast`, the commit, `land --keep` |

The bottleneck was the ceiling: a fifteenth boss is a line in twenty files,
and three of them had no line left, so a third of the writing was pages cut
rather than boss written.

## 2026-09-17 — boss-implementation — three boss tables cut before the next boss

The queue item THE LEAD's landing found: the director's choreographed field
and note tables at 240 lines each and `sim/wave-boss.ts` at 250 exactly, with
the next boss's dozen fields, paragraph and branch about to land on the wall.
Each cut along a seam the tree already had — a second page from THE LEDGER
on for the two tables, spread in place so the readers and the exhaustiveness
checks are untouched; the choreographed bosses' install branches to
`wave-boss-clocks.ts` behind a `CLOCK_KINDS` guard, `boss-draw-clocks.ts`'s
shape made for entries. A refactor, not a look.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two tables' block boundaries, `wave-boss.ts`, `boss-draw-clocks.ts` for the guard's shape |
| writing | 15 | the two `-b` pages and the spreads, `wave-boss-clocks.ts` and the guard, the header comments, the skill's file table, the spec pointer, three index lines |
| looking | 0 | nothing visible moved |
| friction | 5 | `bun run queue done 3` refused a number for a taken item and asked for the title; a first cut returned a boolean and lost the union's narrowing for the queen's branch below it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

The bottleneck was the guard: a function that installs and returns whether it
did is one line at the call site and gives the branches under it a widened
type — a type predicate over a kinds list costs twelve lines and keeps them.

## 2026-09-17 — boss-implementation — THE LEAD, the look

Lane two of the seventh boss: a long rock ridge above row 0, a stalk of
beads standing out of it a bead a segment with a pale organ at the tip, the
split by seat — the stalk at its column on a mound with the target lock on
the navigator's screen and never a tilt, in the middle of the pilot's on a
sill leaning the way the body goes and never the column — white bolts over
each flight's column on both, grey and upright on the still, lying over on
the pass, gone and fading when the beam has it. Three render files, the
family of fourteen read above the loop with a spring, a whip and a tumbling
bead, eighteen frame tests, §11.29.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE SURGE's draw, shape and fx files as the pattern, `target-lock.ts`, the canvas stub for what a frame test can count |
| writing | 10 | `lead-shape.ts`, `lead-draw.ts`, `lead-fx.ts`, the two role predicates, the arm in `boss-draw-clocks.ts`, the slot in `effects-boss.ts`, the silent lists' reasons, the frame test, the write-up |
| looking | 5 | two `bun run frames` of the pilot's screen and their crops: the full stalk stood up into the HUD's pills and was shortened by a third |
| friction | 5 | a `downBeat` set before beat zero read as a body that stands, so the fade test was arranged on a world stepped further; `strokeGlow` owns the alpha, so the fade went into the colours |
| landing | 5 | `check:fast`, the commit, `land --keep` |

The bottleneck was the frame test's arrangement: a past beat the world has
never seen is a negative number the state reads as *never*, and the test
was red for the picture being right.

## 2026-09-17 — boss-implementation — THE LEAD, the simulation

Lane one of the seventh boss off the choreographed list, straight after THE
SURGE's look. A body pacing the top of the field with a stalk of five
segments; a bolt out of the top hangs a beat in the air and is judged against
the column the body is in *then*, one segment a hit, a turn-round on a beat
every shot missed; a run with a torch behind and a rock ahead from the
fourth segment, the lean forecasting the wall turn from the second, a still
on the last and a pass only the standing beam ends. Six sim files and
fourteen wired in, a new act page, fourteen sounds, the director's sheet,
nineteen tests, §11.29.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the design's §11, THE SURGE's and THE LEDGER's sim files as the pattern, `bullets.ts` and `lance-burn.ts` for where a bolt leaves the top, the audio band test |
| writing | 60 | six sim files, the wiring across sixteen, the wave and its guide, the sounds and their binder, the director's fields and notes, nineteen tests, the write-up |
| looking | 0 | nothing to look at: a fixture with no picture yet |
| friction | 20 | a test helper that placed the body where a running body no longer was, three times; the down's sound over the speech band twice; `wave-boss.ts` and `bosses-clocks.ts` each over the ceiling by a handful of lines; a context compaction mid-lane |
| landing | 10 | `check:fast`, the commit, `land --keep` |

The bottleneck was the ceilings: two barrels and an installer at 250 lines
each cost a cut or a shortened comment before a boss with six files of its
own could be wired in, and the director's two tables are next.

## 2026-09-17 — boss-implementation — THE SURGE, the look

Lane two of the sixth boss: a ribbed bulb over the middle of the field with a
seam round its equator, the gauge on the seam read by seat — notches on the
pilot's screen, pressure on the navigator's — a grip mark on each flank, the
whole bulb one hit circle for both thumbs, the pinch on a burst, the fold
through the equator on the last vent. Five render files, the family of twelve
read above the loop, the field's `surge` slot threaded through the game, the
director and the frames tool, two tests, §11.28.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE SINEW's five render files and two tests as the pattern, the handle ring and hint, `hold.ts` |
| writing | 15 | five render files, the predicate pair, the field slot in eleven test literals and four fillers, the pose and the control card, two tests, the write-up |
| looking | 5 | one frame with both thumbs on |
| friction | 5 | `hold.ts` read a table before it was declared, twice; a context compaction between the source and its tests |
| landing | 15 | `check:fast`, the row `controls.md` was missing, the commit, `land --keep`; then a rebase onto a `main` that had landed THE LEDGER's look under the lane — three render files, each the same three lists grown from both ends |

The bottleneck was the field's `surge` slot: a nullable field on `Field` is
a literal in eleven test files and four fillers, every one edited by hand
for a boss whose hit test is one function.

## 2026-09-17 — boss-implementation — THE SURGE, the simulation

Lane one of the sixth boss off the choreographed list, straight after THE
SINEW's look. A bulb under the field with a thumb-glass per seat: both thumbs
on feed it, one lifts and it leaks, both lifted inside `surgeWindowMilli` of
each other vent it a notch down the seam; the pressure band narrows a notch at
a time, a burst over it sends gums down the bulb's columns and throws both
hands off, from the third notch it holds what it has and the two windows have
to agree twice; the last notch everts it and the wave is done. Twelve events,
a wave, the audio, the director's sheet, the silent lists, §11.27.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE SINEW's own files as the pattern, one lane earlier, and the design's twelve steps |
| writing | 10 | seven sim files and their threading, nineteen tests, the wave and its guide, twelve sounds, eighteen dials, the write-up |
| looking | 0 | nothing to see yet |
| friction | 5 | a doc edit aimed at a test file and stopped short; one sound's noise sat in the speech band; two stale counts in `audio.md` |
| landing | 20 | `check:fast`, the index, the commit, `land --keep`; then a rebase onto a `main` that had landed THE LEDGER under the lane — twenty-six files conflicted, every one the same list grown from both ends, and the two director files the pair of bosses had pushed over 250 were cut along the seam the other lane had already used |

The bottleneck was two bosses landing on the same lists an hour apart, and then a third landing (THE BATON's film) under the resolved tree before `land` had finished checking it, so the same two documents were resolved twice:
twenty-six files that each wanted both names, none of them hard, all of them
by hand — and §11.27 and wave 77 belonged to the other one by the time this
one arrived, so every number the write-up had was one off.

## 2026-09-17 — boss-implementation — THE SINEW, the look

Lane two of the fifth boss off the choreographed list, the same afternoon as
its simulation. A fan of fibres from the top edge down to a lobed mass, a
collar of strain band the tendon runs through with the zone on the pilot's
screen and the sum on the navigator's, a handle either side on the shipped
SINEW tether, the snap's whip and flash, the fall and the two landings; the
hit test for the pair; the director's two rows and their pose; `--hold` for
the frames tool.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE CURTAIN's draw, fx and frame test as the pattern, `handle-draw.ts`, `tether-sinew.ts`, the balloon's rows and pose |
| writing | 10 | seven render files, an arm in `boss-draw-clocks.ts`, a transient in `effects-boss.ts`, the Field's thirteenth field and its sites, two tests, two director rows, a pose, the spec |
| looking | 5 | one frame with both hands on the pull |
| friction | 5 | the mass built its outline from a text spline and `path-text.test.ts` refused it; `--hold` did not know the pair, so the tool learned it |
| landing | 10 | `check:fast` twice, the index, the commit; then a rebase onto a `main` that had split `view-role.ts` and `effects.ts` under the lane, and the look moved to the new seams |

The bottleneck was the one that was not the boss: a `Field` grew a field and
thirteen sites had to be told, before a line of the look could typecheck —
and then `main` cut `boss-draw.ts` along the same line this lane had, one
commit earlier, so the cut was thrown away and the arm re-hung on theirs.

## 2026-09-17 — queue-band-axes — a grid axis gets out from under the plate

Half one of the split the owner answered on 17 September: a chart drops as a
block, a label on a body stays where it is, and the lost screen shrinks inside
its page. THE FLEET's chart drops under the band now the way THE PULSE's header
does, and THE WISP's lattice — which *is* the field and cannot drop — moves its
letters to the first row that clears the plate and leaves the numbers above it
undrawn. The lost screen is half two and is not in this commit.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the entry and its answer, `headerLift`, the four chart drawers, `drawAxes`, and how a film's layout relates to the stage's band |
| writing | 40 | the lift threaded through the chart, the axes moved inside the lattice, a sweep widened for THE FLEET, a new one written for THE WISP, and `coord-axes.ts` cut off the end of a file that went two lines over |
| looking | 15 | both rehearsals photographed — the chart clear of the plate with its clock still in open water, and the letters hanging off row two |
| friction | 10 | the sweep stops at the first failure and its first failure is the chrome's own words, so a throwaway pass that collected everything was needed before anything could be fixed |
| landing | 10 | `check:fast` twice, the index, the commit |

The bottleneck was that the axes cleared the plate by the wrong measure first:
the condition compared a baseline where the eye reads a cap, so the letters
stayed exactly where they were and the test went on failing with the code
already right.

## 2026-09-17 — queue-lost-shut — the sentence the screen was picked on, drawn

The shipped lost screen's plates draw *back* off the field; the sentence the
owner picked it on said they slide in and close on everything but the column
it hit. He answered the disagreement with *turn it round, through VERSUS*, so
`shut` is that screen as a candidate: plates that meet at the seam and one
ragged lit slot in the breach column, torn widest at the hull.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry and its answer, `lost-shutters.ts`, `lost-look.ts`'s tension, and the three candidates already in the slot |
| writing | 25 | the paint, the index, the registry, and the shipped file's note pointed at the answer instead of at the question |
| looking | 30 | four `versus:shot` frames — a straight-railed first drawing, a taper that made it a tear, and a black column in the open field that only the mid-transit frame showed |
| friction | 0 | — |
| landing | 10 | `check:fast`, the index, the commit |

The bottleneck was looking, and it earned every minute: two of the three
defects were invisible to `bun run check` and one of them — `evenodd` filling
the slot's own outline where neither plate covered anything — was invisible in
the settled frame too and only appeared in the half second of transit.

## 2026-09-17 — queue-imports-timeout — a cap for the case that spawns

`tools/imports/test/imports.test.ts` hands a pruned file to three `bunx biome`
children and ran under bun's five-second default, so a busy machine turned it
red with nothing wrong in the code. It has a `SPAWN_TIMEOUT_MS` of its own now,
thirty seconds, the number `canvas-stub.ts` chose for the same reason.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, the file, and `canvas-stub.ts`'s note on why each file calls `setDefaultTimeout` for itself |
| writing | 10 | the constant, the call, and the paragraph saying which failure it is for |
| looking | 0 | nothing is drawn |
| friction | 0 | — |
| landing | 10 | `check:fast`, the commit |

The bottleneck was not the fix but the sweep after it: nine more tests spawn a
child with no cap, which is a queue entry rather than this lane, because a git
call and a wrangler do not want the same number.

## 2026-09-17 — queue-the-crystal-steps — one axis at a time

The craft crossed on a diagonal, a column and a row every beat, which is the
carom's motion and reads as drift rather than as a machine holding station. It
holds a column for four beats and crosses two in two now (`crystalFallBeats`,
`crystalSlideBeats`), so the plate the pair agreed on stays true for four beats
and the move off it is a dash rather than a slide nobody called.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `crystal.ts`'s step, `crossField`, the hash chain's position seam, and what `scene-pages.test.ts` asks of a body-anchored page |
| writing | 45 | the two fields, the leg counter, the hash tail, the wave's spacing, the rehearsal's retiming, and the tests that move with all of it |
| looking | 15 | a strip of eight beats and a probe of twenty-two: four down, two across, and the hull on beat twenty-one |
| friction | 20 | `hash-creature-late.ts` went five lines over the ceiling and had to be cut before the field could go in; the director's wave serializer then silently dropped the comment I had written inside the wave object |
| landing | 20 | `check:fast` three times — the index, the bestiary's stale numbers, and one timeout under load that passed alone |

The bottleneck was that this one field could not simply be added: the file it
belonged in was full, and the file it was *about* — a wave — is generated, so
the reasoning had to find a third home before anything would go green.

## 2026-09-16 — queue-frames-until — a capture can be asked for a moment

`--ticks` is an absolute `world.tick`, which is the right primitive and the
wrong question: the lane that photographed a breach spent three sweeps of
fourteen frames finding the tick the hull broke on. `--until breach` drives the
wave until the simulation says so and photographs from there; `--events` prints
what fired and when, which is that sweep, taken once and for free.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `capture.ts`'s first advance, `pressPlan`'s rule, and when `world.events` is cleared — the top of every step, which is what decided the loop |
| writing | 30 | `until.ts`, `reach.ts`, the driver's log and early stop, the flag, twelve cases |
| looking | 10 | `--until breach` on wave 3: the frame is the instant the skin broke, and a strip on the paint clock is the scar opening |
| friction | 5 | two files at the 250-line ceiling before a field could be added, so `press-spec.ts` and `reach.ts` came out of them first |
| landing | 10 | `check:fast`, the index, the commit |

The bottleneck was writing, and a third of it was the two splits the ceiling
asked for before a line of the feature could land. The rule that earned its
comment is the small one: `world.events` is cleared at the top of every step,
so a run of six ticks asked afterwards has five ticks of events already thrown
away — which is why the loop steps one tick at a time and paints in runs, and
why the log is free for every capture rather than a mode.

*Measured: the rows above are the session's own estimate, read off the previous landing and this one.*

## 2026-09-16 — queue-a-ring-round-a-body — the ring takes the body's shape

`bodyRing` answered with one radius, from `creatureRadius`, which is a scalar.
Every living body is a lobed blob wider than it is tall, so the tutorial's ring
stood well clear above and below a slick and hugged its two ends — and
`AnchorPoint` has carried the optional `rx` for this since a round's slab
needed one. `creature-axes.ts` is the new half of `creatureRadius`: both
half-axes, taken from `livingScale`, the same call `drawLiving` scales a
contour by.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `creature-place.ts`'s scaling, `hasOwnBody`/`wornKind`, and which callers ring a body — `grip.ts` and `lock-mark.ts` do it at 1.5x and 2.05x and are clear either way |
| writing | 20 | the new file, both callers, three cases over it |
| looking | 10 | `bun run frames . --wave "FIRST STEP" --opening guide` and the crop: the ring is an ellipse round the slick now, evenly clear |
| friction | 5 | my own test spawned a kind called `rock`, which the game does not have — the rocks are `meteor` and its tiers |
| landing | 10 | `check:fast`, the commit |

The bottleneck was writing, and the length is the prose rather than the code:
the rule that matters is that a half-width must not be re-derived at a ring,
because the day a contour is retuned it is the ring that quietly stops fitting,
and that took longer to write down than the five lines it guards.

*Measured: the rows above are the session's own estimate, read off the previous landing and this one.*

## 2026-09-16 — queue-canvas-stub-roundrect — the stub takes the corner list

`roundRect` takes one radius or up to four, every browser honours the list, and
`canvas-stub.ts` took the number only — so a shape round at the top and
near-square at the foot could not be drawn by anything the tests hold. TIDE's
crest wanted exactly that and had been written with one radius and a comment
pointing here.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the stub's `nums`/`drew` split, both `roundRect`s, and what the crest was working around |
| writing | 10 | `radii`, the two signatures, four cases over it, and the crest restored |
| looking | 5 | `bun run versus:shot guide:chrome tide` — the candidate draws, and the corners are a foot radius apart |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit |

The bottleneck was writing, and most of it was the test rather than the fix:
the fix is one helper and two signatures. What the test had to say is the part
worth having — a stub that refuses what the browser takes costs a shape nobody
can draw, and one that takes what the browser refuses costs a green test on a
frame that throws in the game, so the empty list, the fifth radius and the
negative one are all held.

*Measured: the rows above are the session's own estimate, read off the previous landing at 21:35 and this one.*

## 2026-09-16 — director-party-games-page — PARTY GAMES, and the machinery under it

The owner's second removal of the evening, and the last study page on the
sheet. The tab and its page, and then everything that existed only to serve it:
`whole-doc.ts`, `docs-api.ts`, the `DOC_ROUTES` table, the route block in
`server.ts` and the bake loop in `build.ts`.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | what still called `renderWholeDoc` and `DOC_ROUTES` once this page went, and whether `renderMarkdown` had another caller — it does |
| writing | 5 | the removals, the comments left where the tab and the route block were, and `build-imports.test.ts` rewritten around the rule rather than the file it used to name |
| looking | 0 | — `bun run build:director` run to the end, which is the check that matters here: it exits, and `dist/api/` is backlog, notes and waves |
| friction | 0 | none; the tab-count floor went red again and that is the test doing its job |
| landing | 5 | `check:fast`, `bun run index`, the commit |

The bottleneck was reading, and it is the same five minutes the page before it
cost — a page is nine places. What is worth saying is the shape of the second
removal against the first: taking BORROWED off left the machinery standing with
one caller, and taking PARTY GAMES off left it with none, so the second lane is
larger than the first by exactly the renderer, the reader, the table and two
route blocks. A page is cheap to remove until it is the last of its kind.

*Measured: the rows above are the session's own estimate, read off the previous landing at 21:30 and this one.*

## 2026-09-16 — director-borrowed-page — BORROWED comes off the sheet

The owner asked for the page to go. The tab, its page, its reader, its route
and its row in the README, with the study itself left in `docs/` — the same
answer TOWER DEFENCE got.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | every reference to the page: the tab bar, `docs-api.ts`, `whole-doc.ts`, two tests and the README |
| writing | 5 | the removals, and the comment left in the bar saying what was there and why it went |
| looking | 0 | — a tab removed, and `sheet.test.ts` is what pairs the bar with its pages |
| friction | 0 | none |
| landing | 5 | one red `check:fast` on the tab-count floor, then the commit |

The bottleneck was reading, and it is the cost of a page rather than of this
page: a tab is nine places, and only two of them are the thing anybody would
call the page. The one that went red is the one worth keeping — `sheet.test.ts`
counts the tabs so an empty slice cannot read as no tabs, and that floor has to
be walked down every time the owner takes one off.

*Measured: the rows above are the session's own estimate, read off the previous landing at 21:26 and this one.*

## 2026-09-16 — queue-reconciling-a-diverged-trunk — the push reconciles itself

The queue's own item, filed after it cost three hand-resolutions in one day:
`bun run push` refused when two sessions had both pushed and left a person to
run the rebase and settle four records by hand. It is the landing's replay
pointed at the other pair of branches now — `reconcile.ts` — with the release
notes as the fourth resolver and the ledger's merge shared between them.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `replay.ts`, `ledger-merge.ts`, `refusal.ts`, `state.ts`'s `trunkTree`, and `replay-repo.test.ts` for the shape of the proof |
| writing | 20 | `record-merge.ts` out of the ledger's, `notes-merge.ts`, `reconcile.ts`, `push.ts`'s two passes, and ten tests over the two |
| looking | 0 | — nothing drawn |
| friction | 0 | none; one test wrote two different headings for the entry two sides shared and the merge refused, which is the merge being right |
| landing | 5 | `check:fast`, `bun run index`, the commit |

The bottleneck was writing, and the shape of it is worth saying: the merge was
the small half. `mergeNotes` is four lines because the ledger's merge was
already the general one wearing a specific name — the work was proving the
wiring, and that needs a bare origin, three clones and a real `git rebase`,
because every defect this could have has the same symptom as the defect it
fixes and none of them is visible from a string.

*Measured: the rows above are the session's own estimate, read off the take commit at 21:19 and the landing.*

## 2026-09-16 — queue-a-well-wave-never-ends — the boss nothing took off the world

The queue's own finding from the lane before it: wave 70 of the shipped
campaign could be cleared and not passed, because `beat.ts` would not end a
wave while any boss was still installed and THE WELL is never taken off one.
`bossHoldsWave` is the question it asks now, `well.test.ts` compares the two
worlds on when they end as well as on what is in them, and the case that names
the defect stands on its own.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `beat.ts`'s clear test, `wave-end.ts`'s `roundSpent`, `vane.ts` for the boss that must not be let off |
| writing | 10 | the predicate and its paragraph, two test cases, the spec and `well.ts` |
| looking | 0 | — nothing drawn |
| friction | 10 | a probe confounded twice (`hullInvulnerable` keeps every body alive; the count is `balance.wavesCleared`), a stray `tools/probe/scratch.ts` red in the typecheck, and biome's import order |
| landing | 5 | `check:fast`, the commit, `bun run land` |

The bottleneck was friction, and all of it was the probe rather than the fix:
the fix is one predicate and one `||`, and the ten minutes went on making a
live world say something unambiguous. Two runs of wave 70, with the boss and
without, were identical until every body was deleted the instant it spawned —
until then the hull was eating them at different rates and neither run cleared,
which reads exactly like the defect and is not it. A claim about *ending* needs
a world with nothing else left to be about.

*Measured: the rows above are the session's own estimate, read off the take commit at 21:09 and the landing.*

## 2026-09-16 — queue-the-echo — THE REPRISE, the look

The second half of the queue's *THE ECHO, his way*: the mechanism drawn. The
field's top edge torn open at the middle column, one tooth in the tear for
every body the running echo still owes, and a swallow as each one is sent. The
idea it came from leaves `ideas.md` built, and the draft drawn at it goes to
`retired.ts` with what happened to it.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the boss draw pass, `Effects` and its four verbs, `beatbox-count.ts` as the count's precedent, the draft the queue item names |
| writing | 70 | three render files, the branch, the roster test, the spec section, the retirement and its argument |
| looking | 35 | four rounds of `bun run frames` on the same tick — the first drawing read as a slug with two eyes, and the tally took three tries to stop reading as a face or as bookends |
| friction | 20 | the draft's count and its `Status:` line, the backlog's canary and the ideas page all move when one idea ships |
| landing | 15 | `bun run index`, `check:fast`, the commit |

The bottleneck was looking, and it was the right place to spend it: the picture
was wrong in a way no test could have said, and the measured half — sixteen
render passes that drew a body neither screen may draw — was found and closed
in one edit because the frame test could count calls. Drawn closed the shape
read as a creature, which `forms/anchored.ts` warns about at the top of the
file that defines it; reading that warning after drawing it rather than before
cost two of the four rounds.

## 2026-09-16 — queue-the-echo — THE REPRISE, the simulation half

The queue's *THE ECHO, his way*, first of its two halves: the wave sent again
unseen. Built under the name THE REPRISE — `echo` is already a creature kind
and a shipped wave name, and the entry says the working name may go. The
mechanism, the flag on the body, the wave and the guide landed; the mechanism's
own picture and its count are the half still to come.

| activity | minutes | what it was |
|---|---|---|
| reading | 40 | the boss union end to end — install, step, hash, entry — and `beat.ts`'s clear test, which is why a boss has to take itself off |
| writing | 70 | two files, the cut in `spawn.ts`, the wave, the spec section, two test files |
| looking | 0 | — nothing of it is drawn yet, and that is the point of the half |
| friction | 15 | ten totality errors from one appended name, two of them tools; a wave authored in eleven columns that is written in seven |
| landing | 20 | `bun run index`, `baseline:blank`, the briefings counts, `check`, the commit |

The bottleneck was reading, and it bought the design: `beat.ts` holds a wave
open while `world.boss` is not null, so the only way a wave under this boss
ends is for the mechanism to take itself off when its script is spent — a
question that would have been found by a hanging wave an hour later otherwise.
THE WELL, which never clears itself, is filed in the queue for exactly that.

## 2026-09-15 — queued-tasks — a shot never goes through a body

The queue's *A shot never goes through a body*, which is the owner's rule of 14
September: five kinds were skipped by the sweep outright and a bolt flew past
them to whatever was above.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `shot-reach.ts`'s five paragraphs, and the three marks the game already draws for a refused shot |
| writing | 35 | one event, one branch, a new file, two test files, the spec's own rule |
| looking | 25 | four sheets of a bolt climbing at a gum, three of them up the wrong column |
| friction | 10 | `bullet-hit.ts` went over 250 lines twice, and the audio's two coverage tests wanted the new event in three tables |
| landing | 10 | `check:fast`, `bun run index`, the commit |

The bottleneck was looking, and every minute of it was one mistake: a wave is
authored in seven columns and played in eleven, so `--press cannonCol=1` put the
cannon under a column the gum was not in and three sheets showed a bolt sailing
past a body it was never aimed at. `buildQueue` says where a body actually is,
and asking it first would have cost twenty seconds.

## 2026-09-15 — queued-tasks — THE LEECH and THE LIMPET, the simulation half

The queue's two entries for the clingers, which ask for the bodies to move under
the malfunction brush the lane before this one built. The rule landed; the
picture did not, and both entries stay open with what is left in `docs/parked.md`.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `cling.ts`, the siren's own word table, and the six points the owner wrote |
| writing | 55 | `harpoon.ts`, the two kinds, four world fields, and seven cases |
| looking | 0 | — nothing drawn yet |
| friction | 30 | twenty-five red tests from one cause, and two edges the first draft got wrong |
| landing | 15 | `bun run index`, `check:fast`, the parked note, the commit |

The bottleneck was friction and it was all one mistake made twice: the same two
bodies arrive two ways now, and the first draft let both steppers act on both.
The creature's fuse ran under the fault's count, a fault reeled in a body a wave
had spawned, and a spent placement fired a fresh one the next tick. An id on the
world saying *which body this fault fired* settled all three, and it is the thing
I should have written first — the moment a second way to make something exists,
the question *whose is this one* has an answer that has to be stored.

## 2026-09-15 — queued-tasks — a malfunction is a pencil on the map

The queue's *A malfunction is a pencil on the map, with a beat it starts and one
it ends*, in the two commits the entry asked for: the shape first, the director
on top. Sixty-odd files.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | thirty call sites of `world.malfunction`, and `handover.ts`, which owned the only window there was |
| writing | 120 | two new modules, five faults re-grounded, the brush, the mark, the symbol filter, and sixteen test files swept |
| looking | 20 | the palette's new group, the rail's four pressable glyphs, and a pencil painted on beat 4 |
| friction | 15 | `main.ts` and `paint.ts` both hit 250 lines; the `after-sim-edit` hook ran the suite mid-refactor three times |
| landing | 25 | `check:fast` eight times, `bun run index` four, two commits |

The bottleneck was the sweep, and it was unavoidable: `world.malfunction` was one
nullable field read in thirty places, and every one of them had to become a
question about the beat rather than about the wave. What made it survivable was
that four of the five faults already asked *is my kind on* through a function of
their own — so the change landed inside `faultOn` and those four files moved one
line each.

## 2026-09-15 — queued-tasks — the URL stops naming a tab that is not there

The queue's *The editor's tab bar holds no tabs*, filed two hours earlier by the
lane that took the last tab out. `Place.tab`, `KNOWN_TABS`, `DEFAULT_TAB` and
`bindPlace`'s whole tab half are gone, and `?tab=` is no longer written.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, which had already named every file and every symbol |
| writing | 20 | four files, and the two test files that hold the round trip |
| looking | 5 | a fresh load and a saved `?tab=tuning&wave=4` link, in a browser |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

The bottleneck was nothing, and that is the entry's doing: it was written by the
lane that made the mess, an hour after making it, while every symbol was still in
front of it — so this one read a list rather than searching for one.

## 2026-09-15 — queued-tasks — THE VOLLEY wears the ward, and turns clear of the ship

The owner, mid-turn: put a shield-like graphic on the volley so it is clear the
shield bounces it, and the bounce is too late — it goes inside the cannon.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `ward.ts`, `volley.ts`, `hull-frame.ts`, `hull-shape.ts`, `rock-impact.ts` — four candidate causes before the right one |
| writing | 30 | the band, the membrane rule, one line of `volleyReturn`, two cases rewritten |
| looking | 45 | five sheets of the ward beat by beat, two measurements of the drawn crest, and the meteor's own timing |
| friction | 10 | the first meteor capture used the wrong column, so nothing was warded and the sheet said nothing |
| landing | 10 | `bun run index`, `check:fast` three times, the commit |

The bottleneck was looking, and there was no way round it: three plausible causes
for one symptom — the membrane stacking, the bounce effect's own height, and the
row the turn is drawn from — and only a frame every nine ticks could say which.
Two of the three turned out to be real and the third (the meteor's bounce) was
already correct, which is a thing no amount of reading would have settled.

## 2026-09-15 — queued-tasks — the wave arrows paint what they open

The owner, mid-turn: the arrows leave the wave page blank until WAVE is pressed,
and why is there a WAVE button at all — put the wave's number there instead.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `tabs.ts`, `place.ts` and `session.ts`, to find what the bar still owes the URL |
| writing | 20 | one selector, the number and its rule, two cases, one queue entry |
| looking | 10 | four steps and a step back, driven in a browser, and one shot of the bar |
| friction | 0 | — |
| landing | 10 | `main.ts` came back over 250 lines; `check:fast`, the commit |

The bottleneck was nothing, and the bug was four characters: `bindTabs` was wired
to every button in `#tabs`, and the arrows live in `#tabs`. A press ran the tab
switcher with no tab name, so it looked for a page called `tab-undefined`, found
none, and turned the open one off — which is a whole-panel failure produced by a
selector that was right on the day it was written and stopped being right when
something that is not a tab joined the bar.

## 2026-09-15 — queued-tasks — the field is not cut off, and RUN is a column

The owner, mid-turn, on a monitor he had just switched to: the first and last
column of the field are cut off, put the buttons in a strip of their own between
WAVE and GAME, give me a difficulty picker, and move MAIN MENU to the topbar.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the column machinery — two copies of the track list, a phone sheet, and a stage sized by one dimension |
| writing | 45 | the strip, the picker, the fit rule, four documents' worth of notes |
| looking | 25 | four throwaways: the canvas against its box at four sizes, the picker driven both ways, the phone view, and three shots |
| friction | 5 | `MEDIUM · 96 BPM` came back cut off at 120 px, and the picker arrived in the browser's own white |
| landing | 10 | `index`, `check:fast`, the commit |

The bottleneck was diagnosis, and it paid for itself twice over: the owner's own
explanation of the cut was the layout, and the layout was not the cause — the
canvas is sized off the column's *height* alone, so it is wider than the column
on any tall window and `overflow: hidden` crops the difference. Measuring it
(727 px of canvas in a 439 px box at 1440p) is what turned a guess into a
one-line rule, and is also what showed that moving the buttons out — which frees
height — would have made the cut *worse* on its own.

## 2026-09-15 — queued-tasks — THE LEAK becomes STANDARD 5

The queue's *THE LEAK is a rung of the standard ladder, not a malfunction*, which
had been waiting on the owner since 14 September for one answer: is the beamless
full panel the fifth rung or the sixth. He said the fifth. Twenty-three files.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the ladder's own tests, which are what decided the shape — a rung must hold a control back, so STANDARD 5 reduces nothing |
| writing | 60 | one field, one world field, the hash, five call sites, sixteen waves pinned, four cases, three documents |
| looking | 15 | the cyan lobe under a long hold on THE LANCE and on THE LEAK, and a probe of the fill every twenty ticks |
| friction | 15 | the act files came back out of the serializer in its own field order, not the one a script inserted; `wave-start.ts` went over 250 lines |
| landing | 15 | `bun run index`, `check:fast` four times, the commit |

The bottleneck was the tests that already existed. Two of them settled the design
before a line was written — *a reduction that holds nothing back is the full panel
under a second name* meant the new rung could not use `reduces`, and *the first
wave on a panel has a guide* meant pinning sixteen waves moved which wave
introduces STANDARD and which introduces the rung, both of which turned out to
have the guide they needed already. That is the argument for writing a rule as a
test: it answered a question a year later that nobody was in the room for.

## 2026-09-15 — queued-tasks — the tagline reads in one line on an Android

The queue's *The tagline wraps on a 360 px phone*, which had sat on the owner's
answer since 14 September. He picked the letter-spacing out of four ways to buy
the 18 px: 0.22em to 0.18em, no word and no type size touched.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry's own table, and which rule of `menu.css` the class is |
| writing | 10 | one declaration, the note over it, the stale claim in `menu-view.ts`, one case |
| looking | 15 | a throwaway measuring the line boxes at four widths, then the 360 px frame |
| friction | 5 | the throwaway measured zero: a first visit stands on the intro, not the menu |
| landing | 10 | `check:fast`, the commit, `land --keep` |

The bottleneck was looking, and it was worth it: the decision is a number against
another number, and the only honest way to hold it is a browser that lays the
string out — one line at 360, 375 and 390, two at 320. The case that landed is the
spacing rather than the width, because the runner has no DOM; the width is in the
note over the rule, where the next person to retype the sentence will read it.

## 2026-09-15 — queued-tasks — `bun run sheet`, a strip of frames as one picture

The queue's *A strip of frames has no contact sheet*, which this lane filed
three hours earlier after writing the throwaway twice. A grid in a page,
photographed: a window onto a band of each frame rather than the whole of it
shrunk, every frame inlined as a data URL, and the caption off `--every`.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `crop.ts`, which is the same idea for one picture and the shape to follow |
| writing | 30 | the command and nine cases |
| looking | 5 | one sheet of the frames already on disk |
| friction | 0 | — |
| landing | 10 | `check:fast`, `bun run index`, the commit |

The bottleneck was nothing: the throwaway had already been written twice and
debugged both times, so what was left was naming the flags and holding the two
mistakes in cases. Which is the argument for the queue — the expensive half of
this was paid by the lane that met the problem, and the entry carried it.

## 2026-09-15 — queued-tasks — the intro is about the two of you, and it is slower

The owner, mid-turn, twice: the scene should be about a co-op game with shared
controls where talking is mandatory, *how the game looks or what is shown on
the mobile is not relevant*; and the text should stand long enough to follow.
So the two phones came out of the picture and one board with a seam down it
went in, the script became four sentences on their own clock, and the scene
runs 19.6 seconds instead of 10.5.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the eight files the scene is made of, and what VERSUS can and cannot pair |
| writing | 55 | the script, the board, the picture around it, the sentences that hold, and the cases for all of it |
| looking | 30 | four runs of twenty-one frames and three contact sheets — the composition was wrong twice before it was right |
| friction | 5 | the strict canvas caught a negative radius the moment the shield's rail was turned round, which is the test doing its job rather than friction — counted because it cost a run |
| landing | 15 | `check`, `bun run index`, the commit |

The bottleneck was composition, and it is the half no test can hold: the first
draft gave the board every pixel under the two heads and drew a mostly empty
board; the second centred each of them in its own half of the window and drew
two pictures with a hole between them. What fixed it was treating the heads and
the board as one group and centring that — one line of arithmetic, found by
looking at a strip of frames rather than by reasoning about a layout.

## 2026-09-15 — queued-tasks — a game's tempo is fixed once it is made

The queue's *A game's tempo is fixed once it is made; NEW GAME is the way to
another*, the owner's own rule of the same day. The gear on a partner's row,
the page behind it, the three tempi, the two-step in front of each and the
wish a join carried — all off. The room refuses a tempo after beat zero, and a
NEW GAME with somebody already on the list starts their record over.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the entry, and then every door onto the level page — which turned out to be one, the gear, so the page went with it |
| writing | 60 | fourteen files thinner, one guard, one edge in `join.ts`, `pair-tempo.test.ts` rewritten around the new rule and four cases moved or added |
| looking | 5 | one `menu-shot` of the PLAY page |
| friction | 10 | four rounds of `lint` after removals — an unused import, an unused constant, two sorts; and one heredoc the guard refused, which is the rule this lane wrote down two commits ago |
| landing | 20 | `check:fast` three times, `relay:check:all`, `bun run index`, the commit |

The bottleneck was finding out how much was load-bearing. The entry asked for
a gear and a page to come off; what came off was a page nothing else could
reach, three rows, their two-step, a `MenuPage`, a `MenuDom` verb, two
`MenuBindings` fields, a parameter on `link.join` and the field behind it —
each one dead only once the one above it had gone, and each found by the
typecheck rather than by reading. Removing a feature is cheap; finding its
edge is the work.

## 2026-09-15 — queued-tasks — the first meeting with a keyboard over it

The queue's *Unverified at a80777a5*, both halves. The keyboard half is
answered: a thumb in the field with the window cut to what an iPhone leaves
above the keys still has the question, the field, THAT IS ME, the line about
logging in and the whole LOG IN block, and the sheet scrolls. The sign-in half
is not, and it is an entry of its own now: there is no rig, and signing in by
hand wants a Google account and a mailbox.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `hello.ts`, `sign-in.ts`, `syncName`, and what `apps/server/test/signed.ts` already fakes |
| writing | 15 | one throwaway, and the entry for what is left |
| looking | 10 | three shots of the sheet — arrival, keyboard, typed |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

The bottleneck was deciding what a keyboard *is* to a headless browser. There
is no on-screen keyboard to raise, and waiting for one would have been waiting
for nothing — but what a keyboard does to a page is take the bottom of the
viewport, and that is one call. The answer was worth having: the screen was
built so the optional half would not be covered, and with 336 points gone it
still is not.

## 2026-09-15 — queued-tasks — the opening scene, seen moving

The queue's *Unverified at 7693db1b*. The scene was corrected off two headless
stills by a session that could not watch it; this is a phone photographed every
800 ms across the whole 10.5 seconds, with the frame loop running at its own
rate, laid out as two contact sheets. Nothing is wrong with it: both shouts
cross, each act follows the shout that asked for it, and the scene ends by
itself and hands over to the name screen. The entry is out, and the tool the
throwaway should have been is in.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `intro.ts`, `intro-scene.ts` and its 10.5 seconds |
| writing | 20 | two throwaways — the watcher and the sheet |
| looking | 20 | one run of sixteen frames, and three sheets of them |
| friction | 10 | the first sheet was sixteen broken-image icons: a page made with `setContent` has no origin, so a `file://` image in it never loads and every frame has to go in as a data URL |
| landing | 5 | the queue entry, the commit |

The bottleneck was that a session cannot watch anything. It reads pictures one
at a time, and sixteen phone-sized ones is most of what a turn has — so seeing
*motion* means building one picture out of many first, and the second half of
that is a window rather than a shrink: the whole phone at thumbnail size shows
nothing moving, and a band of it at a readable width shows everything.

## 2026-09-15 — queued-tasks — ‹ WAVE ›: the wave column opens the next one

The queue's *Two arrows at the top of the WAVE column open the previous and
the next wave*, the owner's own ask. Two buttons in the bar the WAVE tab
already stands in, `[` and `]` for the same step, disabled at both ends, each
saying by number and name which wave it opens.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry, `rail.ts`, and which of the director's three keyboard listeners was the right place for two keys — none of them: `keys.ts` is the stage's play keyboard and has no store |
| writing | 35 | the step, the arrows, the keys, the split that kept `rail.ts` under the limit, one shared `isTyping`, five cases and two verbs on the fake DOM |
| looking | 5 | one `bun run shot` of the bar |
| friction | 5 | `bun run imports:sort` twice, both times after `lint` asked for it — the command exists and is in `docs/commands.md`; it is `format` not doing it that keeps surprising a lane |
| landing | 10 | `check:fast` twice, the commit |

The bottleneck was the line limit arriving mid-change: the arrows took
`rail.ts` to 283 and the ceiling test caught it after the work was done rather
than before it was placed. The split was cheap because the seam was obvious —
`rail.ts` is the wave being edited and `rail-steps.ts` is *which* wave that is
— but a file at 238 lines is a file that should be split before anything is
added to it, not after.

## 2026-09-15 — queued-tasks — `room-shot --then-wave` carries both phones past the room

The queue's *`room-shot` stops at THE ROOM: the wave against the other seat
has no rig*. The walk three sessions wrote as a throwaway is a flag: both
phones hold READY, the creator jumps to the wave, and its PLAY page — read
out of a second tab of the same context — says the partner's row at that wave.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the entry, the tool, `room-phones.ts`, and the two numberings a wave has between `jumpToWave`, `reachedWith` and `partnerRow` |
| writing | 30 | four phone verbs, the flag and its parse, the walk, two cases |
| looking | 10 | one full run with a wrangler, a preview and two phones |
| friction | 5 | `bun run format` leaves the import sort alone on purpose and `lint` still asks for it — `bun run imports:sort` is the command, and it is in `docs/commands.md` where it was not looked for |
| landing | 10 | `check:fast`, the commit |

The bottleneck was which number a wave is. `jumpToWave` counts from 0 with
`world.wave`, a partner's record keeps that same 0, and the row a person reads
says one more — so a flag can be right in three ways and wrong for the reader.
`menu-stamps.ts` had already settled it for `--partners`, in a comment written
by somebody who had made the mistake: a flag takes the number on the screen.

## 2026-09-15 — queued-tasks — `room.ts` keeps the sockets and nothing else

The queue's *`room.ts` is at the line limit again, and `route`'s acts are the
piece to move*. The file was at exactly 250 after two trims. The five acts it
handed the switch split in two along the line the file itself is drawn on: the
two about sockets stayed, the three about what the room remembers went to
`room-acts.ts`, and the six remembered facts went with their writes to
`room-memory.ts`. 197 lines.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry, `room.ts` whole, and the two siblings whose docblocks say why a thing was taken out of it before |
| writing | 35 | the memory class, the three acts, and `room.ts` around them |
| looking | 0 | nothing is drawn |
| friction | 0 | — |
| landing | 15 | `bun test apps/server`, `relay:check:all`, `bun run index`, `check:fast`, the commit |

The bottleneck was choosing the seam rather than cutting it. The entry offered
handing the acts the room behind an interface, and two files in the package
already say in their own docblocks why that is not done here — a function given
a copy of what it needs cannot change the field beside it. What the acts
actually needed was somewhere for the fields to live that was not the room, and
once the memory existed the acts were nine lines with nothing left to decide.

## 2026-09-15 — queued-tasks — the server package is typechecked once, by itself

The queue's *A pure test pulls a server `src` file into the root typecheck,
without its types*. The root config excluded `apps/server/src` and took
`apps/server/test`, so a test that imported a `src` file dragged it into a
program with no workerd globals. The root now excludes the whole package and
`apps/server`'s own `tsconfig` takes `src`, `test` and `dev.ts`.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, the two configs, what the server's tests import |
| writing | 25 | the two config lines, the two helpers the merged type set caught, and six cases over `seat.ts`'s tag half |
| looking | 0 | nothing is drawn |
| friction | 0 | — |
| landing | 10 | `typecheck`, `bun test apps/server`, `check:fast`, the commit |

The bottleneck was the type sets meeting: putting `bun` and
`@cloudflare/workers-types` in one program let workerd's `Blob` and
`CryptoKey` win over Bun's, and four errors arrived in two test helpers that
had nothing to do with the change. They are four lines and a comment each,
which is cheaper than the alternative — workerd's globals over every package
in the repository — by a margin nothing needed measuring to see.

## 2026-09-15 — queued-tasks — a long edit script goes in by path

The queue's *The Bash tool refuses a long quoted heredoc*. A command that
failed and was worked around, written down where the next lane meets it: the
rule beside the `git commit -F` one in `.claude/skills/lane`, and why it is
not the shell's fault in `docs/working-with-claude.md`'s *who answered?*
section.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue listing, the entry, the skill's install section and the amendment the document ends its newest run of on |
| writing | 10 | two paragraphs |
| looking | 0 | nothing is drawn |
| friction | 0 | — |
| landing | 10 | `check:fast`, the commit |

The bottleneck was reading: the whole item is two paragraphs, and finding the
two sentences they belong after took longer than writing them.

## 2026-09-15 — queue-tasks — the room screen is four steps, one question each

The rest of step 4's first half, from the queue's *PLAY is a list of partners to
continue with, and the room is a step-by-step* — the owner's own ask, and the
first exemption under *a look is offered, never replaced*. The TWO DEVICES sheet
was the whole workflow at once — a name field, a code, a code box, two seat
pills, JOIN, CREATE ROOM, START, SEND LINK and WHAT THIS IS, with CSS deciding
which half was reachable. It is four steps now and a step asks one thing. The
pair read this screen to each other down a voice call; a screen read aloud has
to be short.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry, `join.ts` and its four neighbours, what `.in-room` and `.unnamed` were standing in for, and every reference to the two buttons coming off |
| writing | 50 | the step rule and its sentences, the sheet that paints them, the markup, the CSS, nineteen cases, and two files split back under the line limit |
| looking | 15 | `menu-shot` of step 1 and of both halves of step 3 |
| friction | 20 | `menu-shot`'s trail stopped at the menu and could not reach the screen NEW GAME opens — fixed rather than worked around, which is the twenty |
| landing | 20 | `bun run check` twice, `bun run index` twice, the commit |

The bottleneck was the tool: three of the four steps are behind a press on a
screen the menu hands over to, and a trail that only looked inside `#menu`
could photograph exactly one of them. `.on` stays on the menu's own page after
the menu closes — the class marks which page is current, not whether the menu
is up — so the fix was to ask whether the page has a box rather than whether it
has the class, and then to fall through to whichever overlay is drawn over the
field. A throwaway script would have taken five minutes and left the next lane
in the same place.

## 2026-09-15 — queue-tasks — the tempo is on the pair's row, behind a gear

Step 2's first half, from the queue's *PLAY is a list of partners to continue
with, and the room is a step-by-step* — the owner's own ask, and the first
exemption under *a look is offered, never replaced*. Every partner's row carries
a gear at its right end; it opens the same three tempi DIFFICULTY opens, saying
TEMPO WITH ADA and marking the level that pair plays at, and the answer is
written against their record rather than against this device.

Most of the lane was the half nobody could see from the entry. A tempo is not a
thing a device holds: the room keeps its own in Durable Object storage and hands
it to both phones on `welcome`, and the run takes *that*. So a choice made on
the PLAY page, where there is no socket, is a wish — and `link.join(room,
wanted)` is where the wish is carried, sent once on the welcome and only when it
differs from what the room already holds. That is the wire, so it is
**unverified**: no two browsers in one room here.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | how a level actually reaches a run — `link.ts`, `room-tally.ts`, `shell.ts`, `main.ts` — which is not what the entry assumed |
| writing | 45 | the gear and its wrapper, `menu-tempo.ts`, the pair's record, the join that carries a tempo, eleven cases, and four files split back under the line limit |
| looking | 10 | `menu-shot` of the PLAY page and of the page the gear opens |
| friction | 5 | none worth the name — the sharder fixed an hour earlier is why |
| landing | 15 | `bun run check`, `bun run index`, the commit |

The bottleneck was writing, and half of it was the line limit: the gear added
about sixty lines across five files that were all within twenty of 250, so the
level page went to `menu-pages.ts`, whose tempo the page is standing for went
to `menu-tempo.ts`, and the PLAY page's list of pairs went to `pairing.ts`,
where it always belonged.

## 2026-09-15 — queue-tasks — a shard is capped by files, and a killed one says so

Found and queued an hour earlier in this session, then worked, because nothing
could land until it was: `bun run check` and `check:fast` were red in every
cloud session, on diffs with nothing wrong with them.

`✗ shard 1/2 — 73 files, 0 tests, 0 failed` reads as a suite that ran nothing.
It was a process that died — `exit 137`, `SIGKILL`, 7.4 GB of anonymous RSS and
the memory cgroup's OOM killer, with no report written and its whole result
gone. How many shards there were and how many ran at once were one number, so a
machine with *fewer* cores was handed *more* files per process, which is
backwards: four cores dealt two bins of about seventy-five where sixteen cores
deal eight of about forty-eight. The two numbers are separate now — the bin is
capped at forty files because a `bun test` process does not give a finished
file's memory back, and the pool is as wide as `defaultShards()` says. And a
shard that takes a signal names it, which is the line that would have made this
a minute's work instead of an afternoon's.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `shard.ts`, `shards.ts` and their tests, and `dmesg` for what actually killed it |
| writing | 20 | the cap, the bin count, the pool, the signal line, seven cases and two documents |
| looking | 0 | nothing is drawn |
| friction | 25 | finding it at all: two `check:fast` runs, a four-shard run, the 73 files alone, and a reproducer that reports exit codes — the shard's own output said nothing |
| landing | 15 | the whole suite through the new sharder, twice, and the commit |

The bottleneck was friction, and all of it was one missing word: the shard
printed no signal, so a killed process and an empty suite looked the same, and
every step of narrowing it down was another run of the suite. 458 files in 12
shards of forty, two at a time, 9514 tests green in 82 s — on a machine that
could not finish `bun run check` at all this morning.

## 2026-09-15 — queue-tasks — the seat leaves the PLAY page for the rig

Step 3 of the queue's *PLAY is a list of partners to continue with, and the
room is a step-by-step* — the owner's own ask, and the first exemption under
*a look is offered, never replaced*. The seat cards sat under the PLAY page's
rows and were a control a pair could never use: the room deals the seats by
arrival order, so the block was drawn locked every time two phones were in one,
and BOTH — one device taking both bands — is the rig and not a pair at all.
They are on the rig's page now, under its four rows, where the only person who
can press them already is.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `menu-entries.ts`, `menu-view.ts`, `menu-link.ts`, `menu-seats.ts` and `join-words.ts`, to find where a pair reads its seat once the cards are gone |
| writing | 10 | the move, the three comments that described the old home, and the test that holds the new one |
| looking | 5 | `menu-shot` of PLAY and of TESTING |
| friction | 20 | `check:fast` red on a diff with nothing wrong with it — one of its two shards dying silently, run down to four shards and a queue entry |
| landing | 10 | the scoped tests at `--shards 4`, the commit |

The bottleneck was friction, and none of it was the work: `bun run check:fast`
is red in this sandbox for a reason that has nothing to do with any lane's
diff, and finding that out cost more than the change did. It is queued.

## 2026-09-15 — queue-tasks — release asks the trunk which claims it holds

Found by being bitten by it an hour earlier, queued in that turn and worked in
this one. `bun run queue take` in a cloud session writes the `Taken:` line onto
the `main` ref and leaves the working tree alone — that is what a clone with no
worktree on the trunk needs. `release` then asked *the working copy* whether the
item was marked, found nothing there, and left the line standing on `main`: the
branch went, the line stayed, and `bun run queue status` reported an item as
taken by a branch that no longer existed.

Two halves, and the second is the one that would have bitten again: the trunk's
copy is what is asked now (`trunkTaken`), and the line is taken out of this
checkout's copy as well as the trunk's (`alsoHere`) — because every lane that
finishes an item is holding its own `docs/queue.md`, and a line removed only on
the trunk comes back the moment `bun run land` rebases the lane over the
give-back. Proved on the repository itself: the entry was in exactly the broken
state, and the release cleared it.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `claim.ts`, `repo.ts`, `edit.ts` and `run.ts`'s release, to find which copy the question was being asked of |
| writing | 10 | `takenIn`, `trunkTaken`, `alsoHere`, the release wiring, and a temporary repository shaped like a cloud session to hold them |
| looking | 0 | nothing is drawn |
| friction | 0 | none — this lane *was* the friction, closed |
| landing | 5 | `bun run check`, the commit |

The bottleneck was writing, and most of it was the fixture: proving a claim
that only exists on a ref needs a repository with a lane standing beside a
trunk nothing has checked out, which is four lines of `git` and the whole of
why the bug was invisible to every test the tool already had.

## 2026-09-15 — queue-tasks — the PLAY page is a list of people

Step 1 of the queue's *PLAY is a list of partners to continue with, and the
room is a step-by-step* — the owner's own ask, and the first exemption under *a
look is offered, never replaced*. The page was CONTINUE, DIFFICULTY, REJOIN and
OPEN A ROOM; it is now one row per person this device has played with, NEW GAME
under them, and REJOIN gone — it was one row for the most recent partner, which
is what the list is four of.

Most of the lane was deciding how much of a five-step workflow one landing is.
Steps 4 and 5 are the room screen and a timer, and both want two browsers
against a wrangler; step 2's gear is the other half of taking DIFFICULTY off
the page. So the cut is step 1, and CONTINUE and DIFFICULTY stay at the bottom
of the page rather than leaving it — until the room screen has the ready holds
and the level they are the only start and the only way to change the tempo, and
a page that lost both would be a workflow half-moved rather than a piece
landed.

The store is the half that had to be right: a partner is a record now — the
name, the wave the two of them reached, the tempo they played it at — because a
wave number is a fact about the pair and `progress.ts`'s one `furthest` cannot
tell two evenings with two different people apart. A list written by a build
that stored plain names reads as those names at wave zero, which is what they
were. `waves.ts` writes the wave against whoever the last status put in the
other seat, and nothing at all off the wire.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, and `pairing.ts`, `progress.ts`, `menu-entries.ts`, `menu-link.ts`, `menu.ts`, `menu-rows.ts`, `menu-seats.ts` and both tests before cutting the scope |
| writing | 5 | `partners.ts` and its test, the row painting, `menu-shot --partners`, `menu-stamps.ts` |
| looking | 5 | two shots of the PLAY page, one of them to see the wave on the row |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, the commit |

The bottleneck was reading, and it was the right place for it: the entry is
five steps in one item, and the minutes went on working out which of them a
session that cannot run two browsers should touch at all.

## 2026-09-15 — queue-tasks — menu-shot types into a field

The queue's *`bun run menu-shot` cannot type, so a field's own states need a
throwaway*. A trail is presses, so every page whose state is *which page is
open* had a picture and every screen that reads what has been typed had only
its empty one — and the first meeting's press is dark until the field holds a
name it could keep, so the half that matters was the half the camera could not
reach.

`--type "#helloName=DAVID"`, repeatable, applied after the trail and before the
settle. The parsing is in `menu-trail.ts` beside `parseTrail`, which is already
the half of this tool that opens no browser and already the half that has a
test; the filling is `fill()`, which fires the `input` event the paint hangs
off. Split on the first `=` and no other, so a value may carry one and an
attribute selector may not — every field the menu has is reachable by id, and a
name with an `=` in it is a name somebody will want a picture of.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry, `menu-shot.ts` and `menu-trail.ts` whole, `hello.ts` for the field's id |
| writing | 5 | `parseTyping`, `noSuchField`, the flag's repeatable reader, seven test cases, the two doc lines |
| looking | 5 | two shots of the first meeting, empty and filled, each behind its own preview build |
| friction | 0 | none |
| landing | 10 | `bun run check`, the commit |

The bottleneck was looking, and it is the preview build rather than the shot:
the tool builds `dist/` before every picture, so the empty state and the filled
state cost two builds to compare when they differ by one flag.

## 2026-09-15 — queue-tasks — the first visit is asked what it is called

The queue's *After the intro, a first visit asks for a name and offers a
sign-in*. Both halves already existed and both were met too late: a name was
asked for on the room screen, which a first-timer reaches only once they are
already opening a room, and the sign-in was a row on SETTINGS, which is a page
nobody opens on the way to play. So they are met between the intro closing and
the menu coming up, on a device with no name — one question, the same
`claimName` behind it, and under it the Google button and the email field
`signInRow` already builds, with `syncName` filling the field when it answers.

A DOM sheet rather than a canvas scene, because the optional half is a popup
and an input. It is drawn in the menu's own furniture — the sky, the scroll,
the `.setting` block — by naming `#hello` beside `#menu` in seventeen
selectors rather than by writing a second house style: the palette tokens are
declared on the menu's rule and nowhere else, so an element outside it has no
colours at all.

The picture is what earned its place. Two defects nothing else would have
caught were in the first frame: the ☰ sits at `z-index: 21` against this
screen's 20, so it was pressable and the menu it opens would have stood in
front of the one question the device had been asked; and nothing held the run,
so the field played on behind the sheet for as long as somebody took to think
of a name. The chrome steps aside the way it does for the intro, and the hold
is the menu's own.

`menu-shot` had to learn about this screen either way — it stamps the intro
away and waits for `#menu.on`, which this change would have left it hanging
on — so it stamps a name too, and `--first-visit` leaves that one off to
photograph the screen itself.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry and the eight files it names, plus `menu.css`'s token block and what `menu-contrast.test.ts` holds about it |
| writing | 10 | `hello.ts`, `takeName` shared with `join-name.ts`, the widened selectors, the shell's three lines, the test, `--first-visit` |
| looking | 5 | three shots — the screen, the screen after the two fixes, the menu still landing on itself — and a scratch script for the one state the camera cannot reach |
| friction | 5 | a long heredoc refused by the Bash guard (already queued), `autocomplete` not being an `AutoFill`, and three rounds of shaving a comment to keep `shell.ts` at 250 lines |
| landing | 10 | two full `bun run check` runs at about three minutes each, `bun run index`, the commit |

The bottleneck was landing, and it is the check's two shards rather than
anything this lane did — but the five minutes of looking is the row that paid:
both real defects were in a frame, neither was in a test, and the second frame
is the only reason either is fixed.

## 2026-09-14 — queue-tasks — versus:shot drives the lifted startDirector

`Unverified at 2c528788` said the second caller of the lifted `startDirector`
could not be proved, because no VERSUS slot is open in this tree and so nothing
could be photographed. Every step of that caller is proved except the last one,
and the last one is not what the lifting put at risk.

The run: `versus:shot` starts a director on a port of the OS's choosing, reads
the port off the supervisor's line, hands it to `bun run shot --port` with the
candidate's query string, and `shot` opens `/versus.html?slot=…&name=…` off it.
The page is served and renders — its no-slot state, which `versus-page.ts`
calls *a correct state and not a broken one*, and which has no `.versus-stage`
in it, so the shot ends on `no element matches .versus-stage`. The one step
never taken is the camera against a real candidate, which is the page's
content rather than the plumbing under it, and which the next lane to open a
slot takes for free.

The entry is out because the run is what found the leak the landing before this
one fixed — a director that outlived its own stop — which is a better answer
than the picture would have been.

A candidate was not invented to take that picture. A VERSUS slot is a look put
to the owner to choose between, and one written as a test fixture is a thing he
then has to judge.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-shot.ts`, `director-serve.ts`, and what the versus page does with a slot that is not there |
| writing | 0 | none — no code needed changing for this one |
| looking | 10 | the run, and the process tree after it |
| friction | 0 | none |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was reading: establishing that the missing step belonged to the
page and not to the lifting took longer than running the tool did.

## 2026-09-14 — queue-tasks — a stopped director went on serving, and said nothing

Found by running `bun run versus:shot` to check the entry above it, and then
asking `ps` whether the director had gone. It had not: `stop()` had returned,
the port still answered 200, and the server was reparented to init and holding
it until its own idle exit two and a half minutes later. Every `--serve` shot
and every `versus:shot` in this repository has been doing that.

Two faults in a row, and each hid the other. `tools/running.ts` caught SIGINT
and SIGTERM to tidy its own file, which — because a listener on a signal turns
off the death that signal would be — had to `process.exit(0)`; registered
first, it exited first, so the supervisor's handler never ran at all.
`supervise.ts`'s handler was `child.kill(); process.exit(0)`, which leaves
before the kernel has delivered the kill, so it would not have worked either.
Both proved separately: the supervisor's own test fails on the old code with no
`announce` in play, and the pinned path leaked with the supervisor already
fixed.

`director-serve.ts` said *`Bun.spawn`'s kill takes the tree*, which is not a
thing a kill does and is the sentence that made this invisible for as long as
it lasted. It now says which three links pass the signal on and that two of
them were broken.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the supervisor, `running.ts`, and `director-serve.ts`'s account of what its stop does |
| writing | 15 | the two fixes, two tests, and the corrected comment |
| looking | 25 | five process-tree experiments: `bun --hot` under a bare signal, the supervisor under one, the pinned path, the `bun run` path, and the whole tool again at the end |
| friction | 5 | a `pkill` pattern that matched the shell running it, and one lint rule about a placeholder inside a plain string |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was looking, and there was no way round it: every step of this
is a fact about processes that only `ps` can answer, and the first four
experiments each ruled out a link that turned out to be innocent.

## 2026-09-14 — queue-tasks — the front page checked, and the tagline does wrap

`Unverified at b7c3055e` named three things. Two hold. The front page is PLAY
and SETTINGS, with LEAVE ROOM the third only while there is a room, which is
what `menu-view.ts` says it should be. WHAT THIS IS opens the scene, takes the
menu down while it plays and puts it back — on the front page rather than on
SETTINGS, which is `menu.ts:150` handing `open()` in as the way back, and is
the right end for a row a person presses once.

The third does not. The tagline is one line at 390 px and at 375 px and two
lines at 360 px and below — every Galaxy and every Pixel — against a comment
saying it is *the first version of it a phone reads in one line*. Measured at
six widths, then each way out of it measured too, because the fix is the
owner's sentence and his letter-spacing: an entry that only said *it wraps*
would have handed him the same afternoon back. Queued with the four options
and what each clears.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the tagline's own comment, and where `openIntro` is handed its way back |
| writing | 10 | two probes, and the queue entry with its table |
| looking | 15 | six widths, then eight variants at two of them |
| friction | 0 | none |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was looking, and it bought the thing worth having: the wrap took
one run to find and the other seven runs are what turn it into a question the
owner can answer in a word.

## 2026-09-14 — queue-tasks — the CONTROLS landing checked, with the tool that could not

No code. `Unverified at ff67ba6f` said a real phone's SETTINGS with no CONTROLS
row on it had not been seen, and named the reason: headless Chromium at 390 px
is a fine pointer, so no capture could show it. The lane before this one took
that reason away, so this is the entry opened on a machine that can.

All three callers of `atADesk()` asked in both contexts, off the preview. As a
thumb: no CONTROLS row on SETTINGS, no splash trail, no keyboard hint over the
field. As a mouse: the row, the page behind it reading *the game is played on a
phone held upright, with a thumb*, the trail and the hint. Both directions, so
the row is gated rather than gone.

It is an emulated coarse pointer and not a handset — the same media query in
the same engine, which is what `atADesk()` reads and all it reads. The entry
went out rather than being narrowed, because the thing it said could not be
shown can be shown now, and the two callers it did not name were checked while
the browser was up.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, and which marker each of the three callers leaves in the document |
| writing | 5 | the probe that asks all three in both contexts |
| looking | 10 | the run, and one capture of the phone's SETTINGS for the owner |
| friction | 0 | none |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was looking, which is the entry's whole subject: it existed
because looking was impossible, and it closed in ten minutes once it was not.

## 2026-09-14 — queue-tasks — `bun run menu-shot` opens a phone, not a phone-sized desk

The finding the CONTROLS lane wrote an hour earlier, and the one it could not
work around: the tool opened a 390x844 viewport, which is the right size, in a
plain desktop context, which is the wrong pointer. Headless Chromium answers
`pointer: fine` and `hover: hover` at any width, so everything the app decides
by `atADesk()` photographed in its desk form under a picture that read as a
phone.

Two options on the context — `hasTouch` and `isMobile` — and the question the
entry left open was which way round the default goes. The phone, because that
is what the menu is: `--desk` is the exception's flag. The decision is
`menu-device.ts` rather than two words inline, for the reason the test says —
the failure has no symptom, so the only thing that would have caught it is a
row quietly present in a picture taken to prove it absent.

The entry asked for one before-and-after of the same page, in case `isMobile`'s
viewport-meta behaviour moved the layout. It moves nothing here: `innerWidth`,
`innerHeight`, `devicePixelRatio` and `#menu`'s box are identical in both
contexts, and every SETTINGS row keeps its x and its size. The only difference
is the CONTROLS row, which is the behaviour under test.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, the tool, `at-a-desk.ts` and its test, and how `shot-flags.ts` splits reading a command line from using it |
| writing | 15 | `menu-device.ts` and its five cases, the flag, the usage line, the line that now says which device the picture is of |
| looking | 15 | SETTINGS as both, and then a probe that asked the page the two media queries and read back every row's box, because two PNGs of a breathing spore cannot be diffed |
| friction | 0 | none — the browser came up first time and the preview was already built |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was looking, and it was the right place for it: the whole entry
is about a picture that lied, so the proof had to be geometry read off the page
rather than a second picture to squint at.

## 2026-09-14 — queue-tasks — CONTROLS is a desk door, and stops teaching the rig

The owner's fourth ask of the day. SETTINGS offers CONTROLS only where there is
a mouse and a keyboard, and the page has stopped teaching the keys that are the
rig talking to a run rather than a seat talking to a ship — the grip and its
carries, W's two seats in one press, the guide's hold, the wave arrows, pause.
`keys-desk.ts` already drew that line for itself; the page follows it now. Every
one of those keys still works. ESC stays, because closing what you are reading
is not a rig key.

`pointer: fine` was asked in two places with two copies of the query and two
guards; it is `at-a-desk.ts` and one function, which is what made a third caller
worth having rather than a third copy.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, the page and its seven cases, where `pointer: fine` is already asked, and what `keys-desk.ts` means by *what is not here is not a control* |
| writing | 30 | the shared question and its five cases, the row gated and returning null, the desk section rewritten, three cases in `controls-page.test.ts` turned over and one added |
| looking | 10 | one shot of SETTINGS, which is where the tool's own fault showed: headless Chromium at 390 px is a phone-sized desk, so the row a phone will not have is in the picture — queued |
| friction | 5 | that, and the runner having no `window` for a function whose whole job is to ask one — stood up in the test rather than stubbed around |
| landing | 15 | `check:fast`, the commit, `land` |

The bottleneck was writing, but the thing worth noting is the looking: the
picture could not prove the change, and the tests could. A lane that had gone
by the picture alone would have concluded the row was still there.

## 2026-09-14 — queue-tasks — `bun run shot --serve` starts the director it photographs

The finding the last lane wrote. `bun run shot` took a `--port` and expected
somebody to already be serving on it, which nobody in a sandbox can be —
CLAUDE.md forbids backgrounding a server and `.claude/launch.json` is a person
at a desk. The piece that starts one was written and correct and private to
`versus-shot.ts`, with a paragraph on why each line of it is what it is; it is
`director-serve.ts` now, and `--serve` starts one, uses its port and stops it.

The flag had nowhere to go: `shot.ts` was on the 250-line ceiling, the same
wall that produced `shot-state.ts` the last time. The seam left was reading the
command line against taking the picture, so `shot-flags.ts` is the flags and
their arguments, and `shot.ts` is 146 lines of browser.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-shot.ts`'s spawn and the three faults its comment records, `shot.ts`'s flag block, what `flags.ts` next door already is |
| writing | 30 | the lifted module, `--serve`, the flag block moved into a reader with a typed result, eight cases for it and the startup line |
| looking | 5 | one shot of the director's TUNING sheet through `--serve`, which is the whole proof |
| friction | 0 | — |
| landing | 15 | `check:fast`, the commit, `land` |

The bottleneck was writing, and most of it was the split rather than the
feature: the flag itself is four lines, and the ceiling it hit cost half an
hour. That is the right trade and it is worth saying which half was which.

## 2026-09-14 — queue-tasks — the director loses three rooms and TUNING gets a door

DOCUMENTATION is four rooms and every one of them is reference: WORDINGS
leading, then STATES, CONTROLS, STYLE. GUIDES, SPEC and DEMOS are gone with
their ten files, their `/api/spec` route and its reader, and the dead CSS
underneath them. TUNING left for a topbar button of its own and took the
ship's dials with it — they are the same `SimConfig` its sliders write, so
they read under the sliders as what the numbers being moved currently are.
The markup above `#mech-tuning` had carried a note apologising for a live
control sitting under a heading meaning *reference*; the fix for a note
explaining an exception is to stop making the exception.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the sheet's markup and its nine tabs, who imports each guide file and whether `guide-waves`/`guide-order` are reached from anywhere else, what `DOC_ROUTES` actually holds (the two studies, not the spec), `mountSheet`, and the lazy-room ordering rule |
| writing | 45 | five pages cut out of the markup, the new sheet built from two of them, ten files deleted, the route and its reader, the rooms rewired with STATES made lazy and WORDINGS eager, the CSS shell shared rather than copied, three cases in `sheet.test.ts` |
| looking | 20 | the new TUNING sheet and the reopened DOCUMENTATION, which is how the empty `#pairPanel` was found — a div with nothing in it under a heading, for as long as the section had existed |
| friction | 10 | nothing can photograph the director without a server somebody else started, and the piece that starts one is private to `versus-shot.ts`; a throwaway copy of it took the two pictures — queued |
| landing | 20 | `check:fast`, the full `check`, the commit |

The bottleneck was writing, and the reason is worth naming: a removal is only
as small as the number of files that mention the thing removed, and eight of
the fifteen edits here were a doc comment or an index row saying *the SHIP tab*
about something that is no longer a tab.

## 2026-09-14 — queue-tasks — a tool that photographs a page of the menu

The finding the last lane wrote, done in the same sitting because the three
items left behind it all move rows on that menu. `bun run menu-shot <out.png>
--page "SETTINGS > CONTROLS"` starts its own preview, arrives as a device that
has already met the intro, waits for `#menu.on`, presses its way down and
photographs `#menu`. Two things made it a tool rather than a flag on
`bun run shot`: that one wants a server somebody else started, which a session
forbidden to background one cannot give it, and the intro stamp has to be
written before the first navigation or the capture times out on a hidden
element with nothing saying why.

`--page` is the words a thumb would press, in order, because a `MenuPage` name
is a thing only the source knows — and a trail that has gone stale fails by
listing what *is* on the page, which is the one thing the caller cannot see.
`TESTING` is the three presses on the spore, the one page no button reaches.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `shot.ts`'s flags and what it assumes about a server, `serve.ts`'s `startPreview`, `browser.ts`'s launch and its profile argument, how `frames` suppresses the field's own opening |
| writing | 25 | the script, the trail parser beside it, eight cases for the parser, the command line in `docs/commands.md` and two rows in the file map |
| looking | 15 | four runs against the real menu: the front page, the keys two floors down, the rig behind the spore, and one deliberate miss to read the failure |
| friction | 5 | the first match took a row's whole `textContent` — marker, label and description run together with no space — so every trail past the front page failed on a name nobody would type |
| landing | 10 | `check:fast`, the commit, `land` |

The bottleneck was writing, which is the shape a tool lane should have: the
thing it replaces was two throwaways, and the only part that needed a browser
to settle was which string a button answers to.

## 2026-09-14 — queue-tasks — HOW TO PLAY leaves the menu and the tagline is his

The queue's second item, in the same cloud session. The front page is three
rows now — PLAY, SETTINGS, and LEAVE ROOM while there is a room — and HOW TO
PLAY's page went with its row: two paragraphs, two seat cards and a boxed rule
that described in prose what the intro scene shows. WHAT THIS IS, which sat at
the top of that page, is a row on SETTINGS above CONTROLS, so the only thing in
the game that answers *what is this* did not leave with the page pointing at
it. The tagline is the owner's own sentence cut to what fits: the line it
replaces was 417 px against a 354 px box and had wrapped on every phone since
it was written; this one is 325 px and reads in one line.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue entry, the four menu files it names, the two tests, what `.lead`, `.job` and `.rule` are used by elsewhere, and how `openIntro` reaches the page from the shell |
| writing | 30 | the row and page removed, WHAT THIS IS rebuilt on SETTINGS, `openIntro` moved into `SettingsHooks`, the switches split into `menu-toggles.ts`, `menu-front.test.ts` turned over |
| looking | 20 | a throwaway to open the preview and photograph `#menu`, twice: the front page, then the tagline measured against its box, then SETTINGS |
| friction | 10 | there is no tool that photographs the game's menu, so both throwaways were hand-rolled — queued; and the split was found by the line-limit test rather than before it |
| landing | 30 | `check:fast` three times — one red on formatting, one red on the 256-line file — then `land`'s full check red on three drift tests `check:fast` never reaches: a new file's path in a queue entry, and an INDEX row still saying *four rows* |

The bottleneck was looking: the one thing a queue entry cannot tell you is
whether the sentence it asks for fits, and finding out cost a build, a browser
and a script that does not exist yet. Landing came second, and for a reason
worth naming: the three tests that held this lane up all read `docs/`, which
this lane changed, and none of them is in what `check:fast` runs.

## 2026-09-14 — queue-tasks — the intro becomes one scene and loses its stepper

The queue's first item, in a cloud session. Six pages with a BACK, a NEXT and
a page count became one animation: two people, two phones, `SHOOT NOW` and a
finger on fire, `MOVE THE SHIELD` and a shield sliding, and a press anywhere —
or the scene running out — closes it. Four pages' worth of figures (the field,
the panel, the boss, the endless run) went with the stepper, `intro-figure.ts`
and `intro-page.ts` with them, and what is left is five small files: the words,
the picture's one clock, the two phones, the two controls and the people.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the six pages and their three tests, the host's turn logic, what `accentFor` and `stickTag` were for, the silhouette registry before drawing a person |
| writing | 55 | the scene, the shout, the two screens, the two controls, the player, and three tests rewritten to one scene |
| looking | 35 | four rounds of preview-and-shoot: the phones clipped by the picture's own scale, a void between a head and the phone under it, a panel that read as a phone inside a phone, a tag over the listener and then over the answer |
| friction | 5 | the preview gives its port up after ten idle minutes and had to be restarted mid-shoot; the file map needed four rows written and four stale ones corrected by hand |
| landing | 20 | `check:fast` twice, the full `check`, the commit |

The bottleneck was looking: nothing about a composition of two phones, two
heads and a bubble crossing between them can be decided without a frame, and
each frame costs a build, a browser and a wait.

## 2026-09-14 — queued-items — seven of the owner's asks, queued for cold sessions

No code. The owner said, in two messages, what four things should become —
the intro as one scene, HOW TO PLAY gone and the tagline reworded, three
director rooms gone and TUNING on the topbar with SHIP folded in, and PLAY as
a list of partners in front of a step-by-step room screen, CONTROLS only at
a desk and only the two seats' keys, the tutorial announcing itself (local
only), a name and an optional sign-in straight after the intro — and the lane
wrote each as a queue entry a cold session can act on: the files it reaches,
what already exists (the intro's once-per-device memory, the level on the
wire) and what does not (progress kept per partner, a seat pick that
crosses to the other phone, which timer gives the wait up). About 50 min
across the five.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the intro's three files, the menu's rows and pages, the room screen and its timers, the director's nine tabs and who imports each, the CONTROLS page and its test, the guide's plate and nav and the tutorial skill, the name and sign-in files |
| writing | 25 | seven entries, one retitled under eighty characters |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 5 | `check:fast`, five commits, `land` five times — once refused by doc-drift for a file named as an option |

The bottleneck was reading: naming the files a removal drags with it in the
director took a grep per file, and the room screen's timeout has two
candidates the entry had to name rather than one.

## 2026-09-14 — queued-items — a bun below the pin is named at the door

The queue's one item, found by the lane before this one on this same machine:
bun 1.3.8 against a pin of 1.4.2, green through 2533 tests and dead in the
landing's frozen install with a message naming neither. The comparison and
the two commands through now live in `tools/hooks/bun-pin.ts`, read twice: the
session-start hook says them at the first line of any session on such a bun,
on stdout so the session reads them, and `bun run land` refuses on them
before anything moves. The hook's importable parts moved out from under its
`await main()`, behind `import.meta.main`, so a test importing `WANTED` no
longer runs the hook. About 20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `run.ts`, `session-start.ts`, the two tests, the wiring |
| writing | 10 | `bun-pin.ts`, the hook, the refusal, two tests, `cloud-session.md` |
| looking | 0 | nothing drawn |
| friction | 0 | `queue done 1` wanted the title in words — as it should |
| landing | 5 | `check:fast`, the commit, the second bun the refusal now names, `land` |

The bottleneck was none this time; the lane's own subject — the second bun —
is what its landing needs, and the refusal it wrote is the line that says so.

## 2026-09-14 — queued-items — the way back in, watched against a live relay

The queue's one item: BACK INTO THE GAME had landed from a session that could
not press it. Two browsers against a local wrangler, a room opened, both seats
on the field, one of them reloaded — the button takes it back to the same room
with the same seat and the same partner named, and both press START back onto
the field together; with the room emptied it lands on the room screen's
ordinary WAITING line, which is what `last-room.ts` promised it would. The
watching found one thing wrong, on every device rather than a rejoining one:
`#menu .rejoin` sets `display: grid`, which beats the browser's own
`[hidden]`, so the button drew on a phone that had never been in a room, with
nothing where the code goes. One rule fixes it and `menu-hidden.test.ts` asks
the same question of every class the menu toggles. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `last-room.ts`, `menu-rejoin.ts`, `menu-link.ts`, `shell.ts` |
| writing | 5 | the one CSS rule and the test that reads the sheet back |
| looking | 5 | two browsers through a room, a reload, a rejoin, an emptied room |
| friction | 10 | the relay would not start before a build; the pane dropped both tabs; a bun below the pin |
| landing | 10 | `check:fast`, the commit, a second bun, `land` |

The bottleneck was this machine's bun: 1.3.8 against `.bun-version`'s 1.4.2,
which cannot read `bun.lock` at all. Nothing said so — `bun install` ignored
the lockfile and rewrote it, `check:fast` was green on 2533 tests — until
`bun run land` stopped after the rebase on a frozen install, naming neither
the pin nor the fix. It is queued.

## 2026-09-14 — queue-tasks — a command for the import names a split strands

The queue's own item: biome offers only an unsafe fix for an unused import,
the guard blocks it because that fix takes the doc comment above a statement
with it, and the narrow half — a specifier out of a list, the statement
standing — was missing. `bun run imports` is that half. biome picks the files
and has the last word; `tools/imports/` decides where to cut, and a name is
kept unless it is written nowhere outside a comment, so a use in a string, a
type position or a template hole all keep it. A statement whose every name is
unused is printed, never deleted. Proved on `packages/sim/src/hash.ts` with
two names stranded by hand: the command put the file back byte for byte.
About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `guard.ts`, biome's reporters and what its ranges mean |
| writing | 30 | the scanner, the cut, the command, nine tests |
| looking | 0 | nothing drawn |
| friction | 20 | biome's ranges, typescript 7's missing parser, `check --write` |
| landing | 10 | the 250-line split, `check:fast`, the commit, `land` |

The bottleneck was biome's own diagnostics: a run of unused specifiers is
reported as one range that spans the *used* names between them, so the
linter's output could not say which names to cut and the decision had to be
made from the file itself — with `--only=correctness/noUndeclaredVariables`
afterwards as the only check biome can still give.

## 2026-09-14 — queue-items — the board file joins the save token it was said to be in

Found while reading the save for the item before: `waves-acts.ts` said the
pinball board file was "read into the token and written on a save exactly
like an act", commit e14019fe's message said the same, and `wavesToken`
hashed the acts and nothing else — a board edited on disk under an open page
went under that page's next save. The board file is hashed now, both
comments say what is true, and a case in `wave-save.test.ts` changes the
copy's board file after the token is taken and expects the 409. The case
was run once against the old token to see it fail. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | read with the item before |
| writing | 5 | one line in the hash, two comments, one case |
| looking | 0 | — |
| friction | 5 | a `git checkout --` meant for a probe took the real edit with it |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was my own probe: reverting a file to prove the case bites
reverted the change under test as well, and it had to be made twice.

## 2026-09-14 — queue-items — the save test writes a copy of the act files, not the tree

Found by a red shard: `waves-memo.test.ts`'s "unchanged act files are read
once" failed under `check:fast` and passed alone, three runs out of four.
`wave-save.test.ts` was saving into the checked-in act files, and a shard
beside it hashed them between two of the writes. `shard.ts`'s premise — every
writer takes a `mkdtemp` of its own — now holds: `wavesToken`, `writeWaves`
and `saveWaves` take the set of files they work on, with the real tree as
the default, and the test copies the acts and the board file into a temp
tree with the repository's `biome.json`. Biome is spawned by path from the
repository's `node_modules` — `bun x biome` in a tree without one downloads
the package, ten seconds. A last case holds the real files' mtimes still
across a save. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the memo, the save, `shard.ts`'s premise, the token's history |
| writing | 10 | `WaveFiles`, the threading, the copied tree, seven cases |
| looking | 0 | — |
| friction | 5 | `bun x biome` from a temp tree downloading the package |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was reading: whether the race was the memo's or the save's
took the history of both files to settle.

## 2026-09-14 — queue-items — `next` and `take` refuse the entry the format test would

The fourth item this sitting queued for itself. `bun run queue` had listed an
87-character title under *Entries a cold session could not act on* and then
`take` claimed it without a word; the first `check:fast` after that failed on
the test that parses `docs/queue.md`, and the entry could not be retitled —
`done` and the `Taken:` line match by title. The per-entry checks are now
`problemsWith`, in a `problems.ts` of their own because `queue.ts` went past
250 lines carrying them, and `refuseUnlessWhole` says every problem before a
branch is made; `problemsIn` keeps only the duplicate-title check, which is
between two entries. Three cases beside the old ones. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | the lane's own finding |
| writing | 5 | `problemsWith`, the refusal, three cases, the split |
| looking | 0 | — |
| friction | 5 | the shell tool eating backslashes out of a heredoc, twice; the file-size test |
| landing | 5 | `check:fast` three times, `index`, the commit, `land` |

The bottleneck was the shell tool: a heredoc with an escaped newline in it
arrives with a real one, and the file has to be repaired with an editor.

## 2026-09-14 — queue-items — the port reader gets a test, and the test finds two holes

The lane before this one made `bun run frames` print the build's stderr when
`preview:once` died without a port, and nothing tested it: the loop lived
inside the function that spawns the real server. Lifted into `previewUrlFrom`,
given two streams, and tested with streams made from strings. The second case
written — a URL split across chunks — failed at once: the pattern took
`http://127.0.0.1:4` as the whole address when the pipe handed over a chunk
ending there, so the address now has to be followed by the ` — pid` the
server prints after it. And the thirty-second deadline was checked only
between reads, so a build printing nothing held `read()` open for as long
as it liked; the read is raced against the clock now, and the sixth case
holds it. One real frame taken through the changed reader. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `serve.ts`, `preview.ts`'s own line, `page-said.test.ts` for the idiom |
| writing | 10 | the lift, the race, the pattern, six cases |
| looking | 5 | one `frames` run against the real server |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was nothing in particular; the test paid for itself on its
second case.

## 2026-09-14 — queue-items — `isMount` is called where it was written out

The second item the dead-export scan queued: `gyre.ts` exported `isMount`
with a paragraph on why the kind is the whole of the test, and both places
that needed it — the beat's fall loop and `wornKind` — tested `c.kind` by
hand instead. Both call it now, and `COPIES` has the row, so a third copy
fails `copies.test.ts`. The row's first pattern caught `kinds.ts`'s per-kind
fall table, which tests a bare `kind` beside `"gyre"` and `"wisp"` and is the
table describing every kind rather than this rule again; the pattern is a
body's `c.kind` now, which is the shape both copies had. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | found in the item before |
| writing | 5 | two calls, one import, one row and its comment |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | the edit hook's own run of the table, `check:fast`, the commit, `land` |

The bottleneck was the table's pattern, which had to say which of the two
shapes of the same words is the rule.

## 2026-09-14 — queue-items — a second `PANEL_PLAN` and three dead exports gone

The queue was empty, so the tree was scanned for exports referenced from no
other file — a short script over every `.ts` under `packages`, `apps` and
`tools`, tests included — and the five hits that were used nowhere at all
were read in place. Three were plain dead code (`crawlerHead`,
`wispNextIndex`, `pulseLaneTint`); one was a second copy of the panel's
arrangement in `ship-gland.ts`, left from the day GLAND was taken in by hand
and drawn by nothing; the fifth, `isMount`, turned out to have two
hand-written twins and became its own queue item. Both were queued in this
tree and the first was drained. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the scan, `git grep` for each name, `f1104684` for where the copy came from |
| writing | 5 | four deletions and one comment |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the reading: telling a dead export from one exported on
purpose for its type takes a look at each, and there were three hundred of
the second kind for five of the first.

## 2026-09-14 — queue-items — HANDOVER · HULL watched over one exchange

The second unverified entry: whether the two lobes trading height on the hull
read as the ship handing the panels over, or as one signal too many over a
band that has already changed colour. Eight real frames of THE HANDOVER on
the navigator's seat, thirty-eight ticks apart from the first beat of the
hold — one turn of the four-beat exchange — and the hull band of four of them
magnified; one frame of the pilot's seat at the same beat for the skin. The
right lobe stands, the two meet at one height a beat later, the left stands a
beat after that, and the whole thing is under a tile high beside the
countdown plate: it reads as the ship breathing the trade rather than as a
fourth voice, and on the pilot's phone it is amber with the rest of that ship.
Nothing changed in code. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover-hull.ts`, THE HANDOVER's `at` and `beats`, the frames tool's `--fault` and `--stride` |
| writing | 0 | nothing |
| looking | 10 | two `frames` runs, five crops |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the looking, which is what the entry was.

## 2026-09-14 — queue-items — THE LEAK watched, and the picture it needed

The first of the two unverified entries a cloud session left: whether a pair
can cross the field on THE LEAK and take three bodies at the far wall before
they land, with no lance. Answered two ways. A probe (`tools/probe/scratch`,
not kept) played the wave with a scripted pair whose pilot arrives late and
whose navigator taps slowly: a body falls a row a beat over fifteen rows, so
the far column has about fourteen beats from its first body to its landing,
and a pilot six beats late with a navigator tapping every two beats still
takes all sixteen. Then a real strip of frames at the second figure, the three
red standing in column eight with the cannon still at column three — the
crossing the entry asked about. The frame-cost half of the entry is not owed:
a lane never runs `perf`, and the baseline tolerates a row it has never seen.
The one thing fixed: `bun run frames` in a worktree without its `bun install`
died with "preview:once exited before printing its port" and nothing else,
and the build's own "Could not resolve @firebase/app" was on a stderr nobody
read; `startPreview` now puts that stderr's tail in the error. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `act-9.ts`, the fault's row, `commands.ts` for what a cannon move costs (nothing — the column is a jump), the probe rig |
| writing | 10 | two probes, the stderr line in `tools/frames/serve.ts` |
| looking | 10 | the frames strip at beat 12, the p1 seat |
| friction | 5 | `frames` failed twice before `bun install` in this worktree explained it |
| landing | 5 | `check:fast`, the commit, `land` |

The bottleneck was the tool hiding the reason it stopped: the answer to the
entry took a ten-line probe, and the picture took three runs.

## 2026-09-14 — queue-tasks — the stale mark stops firing on the trunk's ledgers

Found while confirming the queue held nothing a cloud session could work: both
remaining entries were marked stale against a commit of this session's own that
had touched none of their code. `staleness` asked git for the newest commit on
*every* file an entry names, and both name `docs/queue.md`, `docs/time-log.md`
and `docs/INDEX.md` — files every landing writes by rule, a time-log row being
required of each lane and a queue claim of each. So an entry naming one was
stale from the next landing onward, permanently. `BOOKKEEPING` now takes those
out before the log is asked, unless they are all an entry has, in which case
they are what it is judged on. The marks on the two live entries did not go
away — both are genuinely stale — but they now name the commit that touched the
wave and the handover rather than one that wrote a release note. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `stale.ts`, the two entries' `Files:` lines, and the git log that proved the flagged commit touched none of their subject |
| writing | 15 | `BOOKKEEPING`, `substantive`, four fixture entries, a ledger-only commit in the fixture repo, four tests |
| looking | 0 | nothing drawn |
| friction | 5 | the fixture's new commit moved `main`'s head, so an existing assertion comparing against `rev-parse main` had to name the code commit instead; biome reflowed an import |
| landing | 5 | the two new tests run against a reverted `stale.ts` to prove they fail, `check:fast`, the commit, `land` |

The bottleneck was proof rather than code: the fix is two small functions, and
the work was showing the tests go red without it and that the marks left on the
real queue are true ones.

## 2026-09-14 — queue-tasks — the blanking pass leaves `perf`

The queue item this lane's own predecessor wrote, and the owner left the choice
of the three ways out to the lane. Picked the second: `fillUnmeasured`'s writing
half moved from `bun run perf --unmeasured` to `bun run baseline:blank`
(`tools/perf/blank.ts`), because the rule that closed it to cloud sessions is
about a measuring run that never finishes honestly on a runner, and this
operation opens no browser, takes no reading, and can only blank a row whose
figures already describe a wave that does not exist. The flag is gone rather
than kept beside it — leaving it reachable under a name spelled `perf` is what
made the item — and typing the old thing now prints where it went before any
browser starts. The director's `MARK_ARGS` moved with it, under a new test that
the script it names is a file that exists. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the item's three options, `perf/run.ts`'s flag branch, `waves-baseline.ts`'s spawn, every live mention of the old flag |
| writing | 20 | `blank.ts`, the redirect stub, the script entry, the existence guard, and six documents |
| looking | 0 | nothing drawn |
| friction | 5 | biome caught an `import type` and a long line the first check:fast; `bun run index` wanted a line written for the new file by hand |
| landing | 10 | `check:fast` twice, `bun run index`, the commit, `land` |

The bottleneck was the documents, not the code: the move itself is one file and
one script entry, and six places across `docs/` and `CLAUDE.md` asserted the old
command — three of which had been written earlier the same day by the lane
before this one.

## 2026-09-14 — queue-tasks — the baseline tolerates a wave it has never seen

Queue item that asked the owner a question, so the turn began by putting it to
him: should `bun run land` write the unmeasured rows, or should the baseline
test stop requiring a row for a wave it has never seen? He picked the second.
`baseline.test.ts` now matches rows to waves by `id` rather than by their place
in the array — which is what lets the file be missing one without every row
after the gap reading as the wrong wave — and three new tests say the gap is
tolerated, reported as `new`, and moves nobody else's verdict. The prose that
asserted the old rule was in six places. Found on the way: the *stale row* case
is still closed to a cloud session, and is queued. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `baseline.test.ts`, `unmeasured.ts`, `shape.ts`, `compare.ts`, `land/run.ts`, the new-wave skill |
| writing | 20 | the id lookup, three tests, and six sites of prose — `performance.md`, `cloud-session.md`, `CLAUDE.md`, two code comments, the new queue entry |
| looking | 0 | nothing drawn |
| friction | 5 | the first gap test dropped the baseline's last row, which is THE LEAK's unmeasured one, so it read `unmeasured` before it could read the absence |
| landing | 5 | `bun test tools/perf tools/director`, the typecheck, `check:fast` |

The bottleneck was reading: the decision itself was one sentence, but knowing
which of the two options was honest meant tracing how `land` orders its check
against its writes, and that is what turned up the wrinkle the queue entry had
wrong.

## 2026-09-12 — relay-dev-kill — stopping `dev.ts` stops the wrangler under it

Queue item from the lane before: killing `apps/server/dev.ts` left wrangler
and two `workerd` running. `dev.ts` now spawns wrangler's own `cli.js` under
`node` as a direct child, no `npx` and no shell between, and forwards a stop;
a test starts the relay on a free port, kills the tree and finds the port
silent. Along the way the other half of the orphan turned out to be Git
Bash's `$!` being an MSYS pid, which a `taskkill /T` cannot walk — written
into the net-change skill. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `dev.ts`, wrangler's bin shim, `test/relay.ts`, the existing server tests |
| writing | 5 | the spawn, two exported helpers, the test, the skill paragraph |
| looking | 0 | a probe script's own lines |
| friction | 5 | one URL segment wrong in the `cli.js` path; a tree kill on an MSYS pid that left `workerd` up again |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — finding out which pid a tree kill needs on Windows.

## 2026-09-12 — relay-verified — the reconnect, against a real Durable Object

Queue item: the two scheduler tests' reconnect was unverified against a real
relay. A wrangler was started on this tree's port and all four
`relay:check`s run against it — plain, `--split`, `--full`, `--rejoin` — in
one foreground script that killed the wrangler at the end. All four held:
in step, the split caught at tick 300, the third device told the room is full,
and the dropped seat came back in step. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the net-change skill, `apps/server/dev.ts` |
| writing | 0 | nothing — a verification |
| looking | 0 | the checks' own lines |
| friction | 5 | the tree kill left wrangler's node and two `workerd` alive; found and killed by pid, queued |
| landing | 0 | one commit of two documents, `bun run land --keep` |

Bottleneck: friction — stopping wrangler cleanly took longer than running the
four checks.

## 2026-09-12 — director-here — a worktree's director from a session opened in the main checkout

Queue item: `preview_start` started the main checkout's director from a
worktree. A probe launched through `.claude/launch.json` showed the harness
starts an entry in the directory the *session* opened in — right for a
session opened in its worktree, wrong for one that made the worktree after
opening in `main`. So: `bun run here` writes the tree to serve into the git
directory every checkout shares, `supervise.ts --here` binds to it, and
`director-here` is the launch entry. Checked live: its log's `editing` line
named this worktree. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `supervise.ts`, `tree-moves.ts`, the lane skill, what the harness passes a launched process |
| writing | 5 | `here.ts`, the flag, two scripts, the entry, seven tests, the skill and commands docs |
| looking | 0 | the server's own log line, not a picture |
| friction | 0 | one lint warning for a comma operator |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — one probe launch answered the question the queue item
guessed at (where the harness starts a process), and the design followed from
the answer.

## 2026-09-12 — copies-sweep — seven rules the simulation owned were written out again elsewhere

Queue item: nothing had swept for a re-derived rule since the copies table
reached 46 rows. One grep per config field that a second package reads found
seven — the tempo as seconds (fifteen copies across four packages), the tempo
as ticks, the fault's firing beat, SNAKE's trigger rest, the pinball lane's
floor, THE GAUGE's clock and the countdown's slots. Each got the function in
`sim`, its callers, and a row in `copies-table.ts`; the table is 53 rows.
About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the config fields render, content, audio and the director read; which barrel exports each module |
| writing | 5 | seven helpers, thirty-six files converted by one script, seven rows |
| looking | 0 | nothing drawn changed |
| friction | 0 | a heredoc turned a regex's backslash-n into a newline — one retry |
| landing | 5 | the copies test, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — finding which of five barrels a new sim export has to
be threaded through takes longer than writing the export.

## 2026-09-12 — path-text-sweep — the rest of render's contours reach the canvas as numbers

Queue item: fifty-six render call sites still built a `Path2D` from spline
text. Forty-five went mechanically to `splinePath` (a balanced-paren rewrite,
one script), the odd ones by hand — the warden's two loops on one path, the
shell's sealed piece, the queen's mark outline returning a path and its
points — and a test now refuses a new text caller outside a one-file allow
list. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the fifty-six sites, which are regular and which are not, the mark outline's test |
| writing | 10 | the rewrite script, six hand cases, `path-text.test.ts`, three stale comments, `docs/performance.md` |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 5 | render, shape-sheet and director tests, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: none worth the name — the sweep was mechanical once the first
round had settled the forms.

## 2026-09-12 — bosses-page-summary — the NOT BUILT YET boss page, cut to what fits

Owner's ask: drastically summarise the boss page's ideas — no names or shapes
talk, nothing that duplicates a built thing, nothing counted on the beat, the
gestures and control splits kept. `ideas.md`'s Bosses went from five entries to
four (THE VANE is built) and Rounds from fifteen to seven, each a few lines
with what each seat's screen shows; the two director tests that join a drawn
shape to an idea now read the act order too, so a built boss's bullet can go.
About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two sections, the director's parser, which names the drafts and scenes are joined to |
| writing | 5 | the two sections rewritten; `party-games.md`'s promotion paragraph |
| looking | 0 | — |
| friction | 5 | THE VANE's cut broke the shape join twice — the act order hides a built row — until the join read the roster |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: the bold names are load-bearing — the director parses them and
five drafts point at them — so the summary keeps them as handles where the
owner asked for none.

## 2026-09-12 — render-test-time — two fifths of a drawn frame was text

Queue item: `packages/render` was seventy per cent of the suite's cost, and
its top four cases were `briefing.test.ts`'s walks, already thinned to every
tick once. A CPU profile of one walk found four seconds of ten in `toFixed`
and `curveText` — the band and the maw building SVG path strings that
`new Path2D` parsed straight back. Those callers now write their contours
into a `Path2D` as numbers through `spline.ts`; a drawn frame went from
1.14 ms to 0.63 ms, `briefing.test.ts` from 53.8 s to 29.5 s, the suite from
273 s to 222 s of cost. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `test:profile` twice, the walk under `--cpu-prof`, the eight hot callers and `spline.ts` |
| writing | 5 | `splineSealedInto`, `tubeInto`, `blobPoints`, twelve call sites, `docs/performance.md`, the queue item for the fifty-six left |
| looking | 0 | nothing drawn changed |
| friction | 0 | — |
| landing | 10 | render and content tests, `test:profile` after, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: the profile — three runs of the whole suite at four minutes each,
before, after, and once more for the header the first `--top` cut off.

## 2026-09-12 — wave-boundary — two devices cross a wave boundary in step

Queue item: the two-device wave test stopped on the `needWave` that ends
FIRST STEP, exactly where the host takes over. It now answers the event the
way `waves.ts` does — the same calls into `content`, on the tick it arrived,
on both devices — plays CYAN through on presses counted from the tick the
wave opened, and keeps the fingerprints crossing over the seam. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `waves.ts`'s `open` and `handle`, the test's loop, CYAN as `buildQueue` maps it |
| writing | 5 | the test: `openNext`, presses by wave, the boundary branch, the assertions |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was none: the test passed on the first run.

## 2026-09-12 — opening-lockstep — a wave's opening put through the scheduler

Queue item: `briefings` is off in `DEFAULT_CONFIG`, so no two-device test had
ever sent an opening over the wire. `two-devices-opening.test.ts` plays three
— the introduction and its two acks, a stepped guide paged at each seat's own
speed with a lifted thumb emptying a circle, and a prose guide through the
gate and then the introduction — with a different delay in each hand, and
asserts both devices leave each state on the same tick, after the slower
hand's word, with the fingerprints equal on every tick between. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `briefing.ts`, `ready-gate.ts`, `guide-steps.ts`, `step.ts`'s opening branch, the two sibling tests' loops |
| writing | 5 | the test file, `relay.ts`'s note |
| looking | 0 | nothing drawn |
| friction | 0 | one run too short for the first body at 120 Hz — lengthened, not a workaround |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was reading three files to learn what a `brief` press does on
each of the three states before the first press could be scripted.

## 2026-09-12 — lockstep-transport — the scheduler says what it rests on

Queue item: the one assumption delayed lockstep cannot check — that a frame is
never lost while the `confirm` behind it arrives — was written only on a test's
wire. It is a paragraph in `lockstep.ts`'s header now and the fifth rule of the
`net-change` skill, and the header's growth pushed the file over 250 lines, so
`LockstepOptions` and the ahead limit moved to `lockstep-options.ts`. About
10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the header, `receive` and `pump`, the test's comment on the lost frame, the skill's rules |
| writing | 5 | the paragraph, the rule, the split, the INDEX row |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the line limit: a documentation paragraph cost a file split.

## 2026-09-12 — tunables-doc — every field of SimConfig named in a sheet

Queue item, claimed with `bun run queue take 1`, answered by the owner with
*only the feel numbers*: the 105 fields still on the doc-drift allowlist each
get one sentence in the sheet that describes the thing they are a dial for —
the bosses' in `bosses.md` (with a short section for THE MAZE, which had
none), the rounds' in `interludes.md`, the creatures' in `bestiary.md` under a
new heading, the shot box and the pod's in `systems.md`, depth in
`graphics.md`. The allowlist is empty and deleted, and the test now simply
fails on any `SimConfig` field no document names. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the allowlist, the doc comment of each of the 105 fields across 25 `config-*.ts` files, and where each sheet's sections end |
| writing | 10 | 279 lines of prose across five sheets, from one script; the test's header and second `it` |
| looking | 0 | nothing drawn |
| friction | 5 | the script's anchors and backslashes: three reruns for a `---` that was my own separator, a `
` that the patch turned into a real newline, and a `\b` that came out single |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was patching the patch script rather than writing the prose:
each of the three reruns cost a round trip that a first look at the anchor
lines would have saved.

## 2026-09-12 — rounds-verdict — the rounds' own second try comes out

Queue item, claimed with `bun run queue take 1`: since a hit fails the wave
and the host opens it again from the top, THE MAZE's rebuilt stage, SNAKE's
attempt started over after a pause, and THE MIRROR's same-round-again all ran
after their hit and so never ran in the game — the tests reached them only by
holding the hull. A lost stage is now the round's verdict and nothing after
it: the snake's crash is a verdict like its clock, the body stays where it
stopped and the picture keeps the bump but not the return, `repeats`, the
stun and its number are gone, and a lost maze or mirror comes off the world
once its verdict has stood, which is what a held hull sees. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three rounds' verdict paths, `wave-fail.ts` and `step.ts` for where the hold cuts in, and every reader of the snake's crash state in render |
| writing | 20 | `snake-move.ts`, `snake.ts`, `snake-open.ts`, `snake-arena.ts`, `snake-hash.ts`, `config-snake.ts`, `maze-verdict.ts`, `mirror-round.ts`; render's `snake-crash.ts`, `snake-round.ts`, `snake-panel.ts`; the three test files rewritten to say the verdict and the retry |
| looking | 0 | nothing visible moved that a still frame would show: the snake's bump is the same bump, one frame of a held field |
| friction | 5 | one tick off in a new test's expectation |
| landing | 5 | `check:fast`, the queue's done, the commit, `bun run land` |

Bottleneck: the render side — the queue item named sim files only, but the
snake's stun number and its ghost body were read by three drawing files, and
the return-to-start picture was the second try drawn, so it had to go too.

## 2026-09-12 · choke-fault — THE CHOKE becomes the steer fault

The owner's mid-turn ask: *"Choke" enemy should be same kind of control set
modifier, I guess, no brush.* Two forks asked first — the whole wave with no
tap-off, and the emitter and beam only, no strand — then the body came out:
the kind off the roster (argued in the roster comment and decision #31), its
three events, crawl, strand, silhouette, drag target, brush, field-control
row, pose, sounds and eight tests, and a third `Malfunction` kind `steer`
went in with a stateless triangle walk, a beam end on the strip's node, the
loops kept on the swelling and the node, a wave rewritten with targets timed
against the walk, and the tap-off parked on the NOT BUILT YET page. About
60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every file with `choke` in it — fifty-odd across six packages and three tools — and where the faults' beam, dead-button and picker logic live |
| writing | 30 | `sim/malfunction.ts`'s `steer` branch; `render/choke-hull.ts`, `fault-beam-ends.ts` and the strip; content's tables and the wave; the director's picker, groups and notes; the docs and the decision |
| looking | 5 | two frames, one per seat — the second showed the beam missing on player 2's screen, which was wrong, since both seats see the cannon on the hull |
| friction | 10 | three scripts that stopped on their own assertions after half their edits had applied and had to be resumed by hand; a sound the clingers played that no listed wiring file read |
| landing | 5 | `check:fast`, the index rows, the commit, `bun run land` |

Bottleneck: the removal, not the addition — a body that landed yesterday had
already been named in fifty files, and every one of them had to be read to
know which mentioned a thing that still exists.

## 2026-09-12 · malfunction B — THE LIMPET and THE LEECH

The second piece of the malfunction task: a body that falls to the shield
and cannot be evaded, and its twin on the cannon. Each takes hold of its
control and runs a fuse while the control stands still — five beats and a
heavy hit on the hull, or eight moves and it lets go — and only the seat
without the control is shown the fuse, so *move* has to be said. Two waves
with guides, six tables, a replay test for both, a frame test on every
seat, the director's brush notes, sheet paragraphs and a pose sheet. About
45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | THE CHOKE's route through sim, render, content, audio and the director; who moves which control |
| writing | 20 | `sim/cling.ts` and its config, events, state and hash; `render/cling.ts` and `cling-fuse.ts`; the waves; the tests; the director sheets |
| looking | 10 | two frames — the first lost the wave to a rock, because a wave's columns are authored on seven lanes and land on eleven |
| friction | 5 | the group-name union, three golden counts and two file ceilings, each found by a different test |
| landing | 5 | the suites, the index, the commit, `land --keep` |

Bottleneck: **writing** — six tables and four packages is what a creature
costs here, and the skill says so; the only surprise was the authoring
column map, found by a probe rather than by reading.

## 2026-09-12 · malfunction A — a fault has a visible cause

The first piece of the owner's rule *whenever there is a malfunction there
must be an indication and a visible cause*: THE JAM and THE COIL get an
emitter hanging from the top of the field from the first frame, and a beam
from it to what the fault has taken on each screen — steady on the held
trigger, flashing in the next shot's colour on the runaway gun. The guides
and the mechanic rows name it; the cannon row also stops describing the
brake that came out on 6 September. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two passes, where the band's circles come from, which seat holds GUARD and which the colours, the LANTERN recipe |
| writing | 5 | `fault-emitter.ts`, the two call sites, the guides, the mechanic rows, the bestiary |
| looking | 5 | four frames — the beam too thin at first, both colour lobes equally bright, the emitter under the test view's header |
| friction | 0 | — |
| landing | 5 | render and content tests, the index row, the commit, `land --keep` |

Bottleneck: **looking** — a beam that read as a wire at phone size, widened
twice, and the unloaded colour's beam made a thread so the next shot can be
read off it.

## 2026-09-12 · iris-in — THE COUNT wears IRIS; DIAL and FUSE to the SHAPES page

The owner's decision on `creature:countdown`. `bun run versus adopt` took
both function fields in one go; DIAL and FUSE were copied into render first
so the slot's removal did not take them, and the LIBRARY got a stage that
makes the field's three calls with a look handed in, and four cards: IRIS,
NOTCHES, DIAL, FUSE, counting down together. The count's words — guide,
blurb, mechanic, bestiary — say blades and an eye now, and the wave where
they said the hull. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | how a slot is adopted, how the volley's kept looks reached the LIBRARY, what the field's countdown row does |
| writing | 5 | two kept files, the adopt, the stage and the assets, the exports, the text sweep |
| looking | 0 | one frame of THE COUNT on the pilot's screen, sent |
| friction | 0 | `adopt` handled two fields from one file first time |
| landing | 5 | render tests, the index rows, the commit, `land --keep` |

Bottleneck: **reading** — finding that the LIBRARY, not the shape sheet's
drafts, is where a kept canvas look goes.

## 2026-09-12 · score-out — there is no point score; a run is its clock and its retries

The last piece of the owner's rule. `World.score`, the fifty-one places that
paid it and the `score*` prices come out; the balance sheet leads with the
clock, then the retries and the waves; the intro says `TRY n` on a retry;
the room and the menu remember a run as *wave · time · retries*
(`RunMark`, protocol 2, the tally taken whole). About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | who paid the score (51 sites, 8 config files), what the room's tally did field by field and why whole is right once the clock travels with the wave |
| writing | 5 | four scripts across sim, render, net, server, game, director and the tests; the NOT BUILT YET note and §7.2 |
| looking | 0 | the sheet's headline and clock are the owner's asked-for look; not drawn for an eye this lane |
| friction | 5 | a script asserted on an `import` where the file had `import type`; `RunMark` not exported from the package; three test files rewritten by hand for the three-field mark |
| landing | 5 | `check:fast`, the index rows, the commit, `land --keep` |

Bottleneck: **reading** — deciding the tally's order (wave, then retries,
then time) and what an old-wire room should still be able to say.

## 2026-09-12 · hull-out — the hull has no points, and a pod is taken or the wave is lost

The second piece of the owner's rule. `World.hullMilli`, the bar, the
regeneration, the twenty-three `damage*` fields and the mend pod come out;
a breach carries a **weight** (heavy or light, `impact.ts`) that picks the
sound and nothing else. On the owner's two answers a pod not taken in fails
the wave and a pod still hanging holds it open, and every pod names its
cargo — PURGE or WARD — so eight waves and scenes that sent a plain pod now
send one of those. Eleven guide captions were retargeted from the bar to the
retries line. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | who read `hullMilli` and `damage*` (166 files), how the mirror's own hull dims the rim, what a director brush knows about a pod |
| writing | 15 | five scripts across sim, render, content, audio, director and eighty test files; the NOT BUILT YET note and four spec sections |
| looking | 0 | the bar is gone from the corner and the run line stands where it was; nothing new drawn |
| friction | 5 | `hull.ts` landed one line over the limit after the rim's alpha came back for THE MIRROR; a `mend → ward` sweep turned the *without a ward* test into one with a ward |
| landing | 10 | `check:fast`, the index rows, the audio doc's counts, the commit, `land --keep` |

Bottleneck: **writing** — the number of places that named a hull point, more
than the difficulty of any of them.

## 2026-09-12 · wave-fail — a hit fails the wave, and the run is a clock and a count

The owner's rule, put in as a mechanic: every hull damage fails the wave, the
field holds where it was struck for `waveFailBeats`, and the same wave is
asked for again (`needWave` with `retry`). The run keeps `playTicks` and
`retries` (both in the hash), the HUD's corner reads `3:42 · 2 RETRIES`
where the points were, and the run ends after the last authored wave — the
seeded filler waves past it are gone. `applyHullDamage` no longer drains a
point; the hull's figure, bar, regeneration, mend pod and score come out in
the next lane. Fifty-six sim tests read the hull's points as their tell for a
hit and now read `retries`; the ones about what a round does *after* a hit
hold the hull with `hullInvulnerable`. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | every path into `applyHullDamage`, how the opening hold shapes `step`, who hosts `needWave` (game, replay, director), what a rehearsal does with a hit |
| writing | 35 | `wave-fail.ts` and `config-run.ts`, the step hold, the host's retry and finish line, the HUD line, the sound, and the test rewrite across 30 files |
| looking | 0 | nothing visible moved that a frame would show — the corner's text, and the field standing still |
| friction | 15 | the mechanical `hullMilli → retries` pass hit THE MIRROR's own hull; five round tests froze at their hit and had to be read one by one to see which were about the price and which about what comes after |
| landing | 10 | `check:fast`, the index rows, the spec note, the queue item, the commit, `land --keep` |

Bottleneck: **writing** — a fact fifty-six tests read off one number, and
each had to be reread to say whether it asserted the price or the play that
followed it.

## 2026-09-12 · guide-layout — no caption over the rail, a band two tiles shorter, a lower tutorial bar

Three things the owner asked for by name. The strip's caption
(`PLAYER 2 · SHIELD`) is gone from `gland-fluid.ts` — the cord's colour says
which control it is, and a band names nothing of the game's construction.
The solo band is two tiles shorter at phone size (`bandSoloPct` 27 → 19):
the buttons and the rail are capped by the width there and keep their size,
so what went was the flesh above and below the rail. The tutorial's bar is
86 px instead of 118 (`guide-nav.ts`), buttons 46 tall, the dots closer to
its rim. Three tests read the caption as their tell for which strips a
screen drew; they read the strip's draw now (`stripsDrawn` in the harness).
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | where the caption is painted, how the band's height reaches the rows and radii, what the nav bar's geometry is and who hit-tests it, the three tests that read the caption |
| writing | 10 | the caption out, the share, the bar, the harness helper and the three tests on it |
| looking | 5 | the guide page rendered before and after |
| friction | 5 | the bake-count rows moved by one on each seat — at the harness's stage the shorter band turns a height-limited field into a width-limited one and a halo loses a size of its own — found by running the old share against the new |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the caption had become the tell in three tests for
which panel a screen drew, and a replacement tell had to be one every strip
goes through.

## 2026-09-12 · trim-guides — a guided wave carries its lesson and nothing else

The owner's rule for the wave the pair plays: only the enemies the lesson
needs and no other kind — rocks and every special kind that are not the
lesson go, plain slicks stay only where the lesson needs a target, at the
fewest. Thirty-two guided waves trimmed, 90 entries out; a stray rock was on
most of them. `guided-entries.test.ts` holds it: a kind on a guided wave is
the one it introduces or one a table says the lesson keeps, with the reason
(THE VANE's rocks, THE JAM's lures, the fence waves' wire). The perf
baseline's rows for those waves were figures for waves that no longer exist;
`bun run perf --unmeasured` now blanks such a row instead of asking a lane
for the run it never owes. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every guided wave's entries by kind and its guide, to say for each which bodies the lesson needs |
| writing | 15 | the trim as one script over the act files, the test and its table; `--unmeasured` blanking a row whose wave changed |
| looking | 0 | — |
| friction | 5 | the director's save test round-trips the act files on disk and went red once against a hand-trimmed single-entry list it then wrote canonical |
| landing | 10 | `check:fast`, the commit, a red `land` on twenty-eight stale baseline rows, the second commit, `land --keep` |

Bottleneck: **reading** — whether a slick is a target the lesson needs or
padding is a sentence per wave, and there were thirty-two.

## 2026-09-12 · room-tests — the room tests wait for what they read, and `check:fast` reaches them

Two landings went red on `apps/server/test/room.test.ts` for lanes that had
not touched it. Why it races under a full shard run and not alone: eight
`bun test` processes on a CPU capped at half starve workerd and the test
process both, so a 60 ms quiet interval is no longer a round trip, a
count-based wait is satisfied by the `ready` a join sends before the one the
press sends, and a 150 ms silence window is crossed by the wall clock between
two lines of a test. Every bare `settle()` before a read is gone — a wait on
the message itself (`settle("welcome", (w) => w.startMs > 0)`), or a ping
fenced by its pong where the assertion is that nothing came; the shortened
windows are one 600 ms figure and the arrivals ask whether it has passed.
`tools/hooks/scope.ts` names `apps/server` for a change to `packages/net`,
`apps/server`, the game's `link*.ts` or `relay.ts`. Five green
`shard.ts room` runs in a row. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `room.test.ts`, the three commits that had widened it, `room.ts`, `seat.ts`, `start-gate.ts` for what a join and a press actually send; `scope.ts`, `fast-scope.ts` |
| writing | 15 | the `settle` predicate and the `caughtUp` fence, twenty waits named or fenced, `arriveUntil` for the two window tests, the two scope rows and their tests |
| looking | 0 | — |
| friction | 5 | a quoted heredoc the shell would not close — the script went through the editor tool instead |
| landing | 5 | `shard.ts room` five times, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a join to a full room sends a `welcome` *and* a
`ready`, and every count-based wait had to be re-read against that.

## 2026-09-12 · queue-stale — `bun run queue` says when an entry has gone stale

The owner, reading this log: the most frequent bottleneck is reading, and
half of it is an entry the tree moved out from under. The listing now marks
an entry `stale` when a file its `Files:` line names was changed on `main`
after the entry's date — with the commit's sha and subject — or is not on
`main` at all; the prompt from `queue next` opens with the same line. About
10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | `queue.ts`, `run.ts`, `repo.ts`, the ref-commit test's fixture |
| writing | 5 | `stale.ts`, its test against a fixture repository, two lines in the listing and the prompt, the preamble sentence |
| looking | 0 | `bun run queue` on the empty queue |
| friction | 5 | backslashes halved on the way into the shell, twice — the glob became a matcher without any |
| landing | 0 | `check:fast` once, green |

The bottleneck was friction: a regular expression with escapes in it does
not survive the tool's shell, and the fix was to write the glob match
without one.

## 2026-09-12 · hit-looks — a page about a body holds with it in the middle of the field

The owner: *when tutorials stop, the explained enemy should be around the
middle of the screen, not the top.* Every film's first page turned four
beats in with its body on row two or three. Now a body page holds with the
body no higher than row six (`scene-pages.test.ts`), which retimed
twenty-eight films — the body page lengthened, every later press kept a
beat and a half after its page opens where the fall left room, kills kept
before the hull, second arrivals moved after the first body's hold. THE
ECHO became one long first page, THE WISP holds after its first hop, THE
LANCE's cannon page moved in front of its body page, THE CROSSING's second
rock crosses on row six. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | every film's steps and acts, the sim's rules for the gyre, the wisp, the echo, the coil |
| writing | 30 | twenty-eight scene files, the test, the hit pop's floor |
| looking | 5 | `film.ts` per film after each edit, one real frame of FIRST STEP |
| friction | 5 | four last pages a tick short of 1.5 s, a NaN in the hit pop when a body is taken below the ship's skin |
| landing | 5 | `check:fast` twice — THE CROSSING's last page was the second red |

The bottleneck was writing: each film has its own clock, and the ones with a
route of their own — the gyre's walk, the wisp's hops, the echo's divisions,
the lance's three-beat fill — needed a probe run before a tick could be
chosen.

## 2026-09-12 · hit-looks — THE VOLLEY's gap is a cutaway planet

The owner: *make the volley look inside like a full solid planet with a
core in colour, so 3D — right now it is flat, like you cut a quarter of a
planet.* A look asked for by name, so it went straight onto the field:
`volley-cut.ts` paints the strata and the two cut faces in the sector a
ward has taken, and the LIBRARY card now draws the game's own core instead
of the living slick. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `volley.ts`, `volley-core.ts`, `volley-stone.ts`, EMBER, the library stage |
| writing | 5 | `volley-cut.ts`, `volleyGap`, the card's switch to `drawVolleyCore` |
| looking | 10 | the EMBER card at three plate counts and the film's warded ball, twice — the mantle was too dark and the lit face too grey the first time |
| friction | 5 | the director's idle exit twice between shots, and a first read of the card that mistook three plates off for two |
| landing | 0 | `check:fast` once, green |

The bottleneck was looking: the card walks four states on its own clock,
so each shot is a guess at the wait and a pixel read to know which state it
caught.

## 2026-09-12 · hit-looks — the Mine: a wisp that stands still and is tapped, designed and drawn at, not built

The owner: *a new enemy like the wisp but stationary; after some time it
damages the ship and disappears; one player cannot see it and the other
must tap its exact position; a tap on a neighbouring tile also damages the
hull — show me some idea of nice visuals.* Three forks were put to him first
(who sees and who taps, what a wrong tap costs, what the blind seat gets)
and the answers went into one idea-store entry; three shapes were drawn at
it on the SHAPES page. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/wisp.ts`, the split tables, THE BEATBOX's tap, the draft files and the forms |
| writing | 10 | the entry in `ideas.md`, three cards in `drafts/mine.ts`, the three ledgers that count cards |
| looking | 5 | the three shapes at three moments each, twice — REACHER's arms and SINKER's roots were tuned once |
| friction | 0 | — |
| landing | 5 | `check:fast` twice — the first run caught the drafts file over 250 lines and two card counts |

The bottleneck was the ledgers: four tests count the catalogue's cards
by hand, and every new draft is four sentences to write before it is green.

## 2026-09-12 · hit-looks — the tutorial's film is phone-shaped on any stage, and its plate is compact

The owner: *TEST, P1 and P2 in briefing mode should be the game's own screen
width; the ship's skin is cut vertically at top-left and top-right.* The film
was laid out across the whole stage while its columns were bound by the
height, so the hull stopped short of the band on both sides; it now stands
in the rectangle the game itself would take (`render/guide-film.ts`). The
narrower film put the corner plate over the siren's seat chip, so the plate
became a third smaller — the first item of the owner's later tutorial task,
brought forward. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `guide-scene.ts`, `layout.ts`, `canvas2d-takeover.ts`, the plate in `guide-switch.ts` |
| writing | 10 | the film rectangle, the plate's sizes, two files split off the length ceiling |
| looking | 10 | the director stage in TEST, P1 and P2 through `shot` and the pane's canvas, phone frames of two guides |
| friction | 5 | `dev:once` idled out mid-look and was restarted on a new port; `crop` takes only whole zooms |
| landing | 5 | `check:fast` twice — the first run caught the two files over 250 lines |

The bottleneck was looking: the director's stage has no `--role` flag for
`shot`, so P1 and P2 were read out of the pane's canvas by hand.

## 2026-09-12 · hit-looks — three counts for THE COUNT, offered in VERSUS

The owner: *improve the "Countdown" enemy visuals.* The shipped count is
four notches in the rim; a look is offered, not replaced, so THE COUNT's
draw became a record (`render/countdown-look.ts`) and three candidates
patch it under `creature:countdown` — DIAL, IRIS and FUSE — judged on a new
pose with three marks left. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `countdown.ts`, the body table, how a throb candidate was written, the pair and the seat probe |
| writing | 15 | the look record, the disc helper, three paints and their cards, the pose, the pose row |
| looking | 10 | seven frames of the shipped count beat by beat, then the three candidates at true size beside it |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first five frames I took were all on the two open beats, so the shipped notches looked missing until a frame per beat showed them.

## 2026-09-12 · hit-looks — the band keeps its skin and grows POLYP's threads; the beads walk the cords

The owner, from the VERSUS page: *keep current in game, but add the tiny
polyp hanging down from the skin; make the lightning pulse movement inside
the veins fluent — right now it has a stuck, jumping movement.* POLYP's
filaments moved into `render/band-filaments.ts` and are drawn over the
shipped pendants; the beads on the cords interpolate between the sixteen
points instead of standing on the nearest. `versus drop` closed the last open
slot, which left the generated registry and pose map in a form Biome
rejects and two director tests with no rows to read. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the POLYP candidate, `slime-look.ts`, `gland-cord.ts`, the registry and pose-row generators |
| writing | 10 | the filaments file, the slime record, the bead interpolation, the empty forms in both generators and the two tests, four budget tables remeasured |
| looking | 5 | the POLYP shot beside the band crop; the beads on a cord over four frames |
| friction | 5 | the last slot closed left `[\n]` and `{\n}` behind, which lint refused and the pose test could not read — both generators now print the one-line form |
| landing | 0 | `bun run land --keep` |

Bottleneck: the first tree with no open VERSUS slot — the generators had never printed an empty list.

## 2026-09-12 · hit-looks — THE THROB wears PORES and is two tiles by two

The owner, from the VERSUS page: *adopt 'CREATURE:THROB · PORES', remove
the other THROB candidates; make Throb big, of 2x2 tiles.* Asked whether
2×2 meant two lanes, he took the torch's rule. `versus adopt` moved the
paint into `render/throb-pores.ts` and closed the slot; GLOBE's paint went
with it. `colSpan("throb")` is two and `THROB_BODY_MUL` doubles the drawn
and grabbed body. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the PORES candidate, `throb.ts` and `throb-look.ts`, how a wide body is placed and sized (`span.ts`, `creature-place.ts`) |
| writing | 5 | the adopt, GLOBE removed, the span and the multiplier, the bestiary line, the versus-pose test's empty-creature-slot guard |
| looking | 5 | four frames of THE THROB on player 1's screen — two lanes lit, the body between them |
| friction | 0 | — |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** `creature-place.ts` at its line limit — the size constant's
comment was trimmed twice before the file fit.

## 2026-09-12 · hit-looks — TWIST is THE WARDEN's rope; all four ropes kept and shown as real examples; a picture on every ON THE FIELD row

The owner, from the VERSUS page: *I like all 'CREATURE:TETHER' alternatives;
I will need them for special pull mechanics later on — document it all to be
used later on, as real examples, on Documentation → Controls → On the Field;
default TWIST; images for every On the Field control.* So the three
candidates moved into render/ as `tether-{cord,sinew,twist}.ts`, the shipped
stroke became `STROKE_LOOK`, and `tether-looks.ts` holds all four with
`useTetherLook` as the switch — TWIST live. The ON THE FIELD tab names a
gallery pose per row and draws it; five poses the gallery lacked were made
(rope taut, both balloon hands, gum stuck, choke on the cannon, ready
circles); under THE WARDEN'S TETHER the same taut frame is drawn four times,
once per look. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three candidates, `tether-look.ts`, the field-controls files, pose kit, the balloon/gum/choke/briefing sims for the states a pose needs |
| writing | 15 | four render files, the looks table, `poses-field-controls.ts`, the rows and tether files, the def's `pose` field, the test, the warden budget rows |
| looking | 5 | the page in this tree's director; the four ropes at field width were hairlines, so the examples were cut close under the eye |
| friction | 5 | `bun run versus drop` loads candidates whose files had moved — imports pointed at render first; the frame-budget rows remeasured for the two-strand rope |
| landing | 0 | `bun run land --keep` |

**Bottleneck:** the four examples at a card's field width all read as one
line — the picture had to be cut to the eye's underside before the four
roots and ropes were tellable apart.

## 2026-09-12 · hit-looks — The rocks burn: BLAZE built in, COMET and SMOULDER worn by any rock, FORGE rejected

The owner, from the VERSUS page: *build into game 'CREATURE:METEOR · BLAZE';
I would like to configure also COMET to be alternative visuals for any
meteor; SMOULDER also; reject FORGE.* Asked how a rock should pick an
alternative, he chose *by the rock itself* — so the three looks are
`MeteorLook` records in `meteor-looks.ts` and each rock wears one by its own
id, two to one to one, blaze first; the grey stone stays as `STONE_LOOK` for
THE VOLLEY's ball and PINBALL's obstacles. The slot was taken by hand (the
candidates' draws were written inline) and closed with `versus drop`. About
35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four candidates, `meteor-look.ts`, `meteor.ts`, `drawRockBody`'s two other callers, `docs/versus.md` on adopting a function field |
| writing | 15 | six files moved into render/ with their imports rewritten, `meteor-looks.ts`, the pick in `drawRockBody`, the pinball exception, the pose test built by name |
| looking | 5 | one film of THE HAND: three rocks, three fires |
| friction | 5 | `versus drop` could not load a registry whose candidates imported files already moved — their imports were pointed at the new modules for the one run that deleted them |
| landing | 5 | `check:fast` (THE WISP's budget rows remeasured for one burning rock), the commit, `land --keep` |

Bottleneck: **an inline draw** — a candidate whose `body` is written in its
`index.ts` cannot be adopted by the command, so the four steps `adopt` does
were done by hand, and the drop then tripped over the files the hand had
already moved.

## 2026-09-12 · hit-looks — THE VOLLEY is a round ball with a smaller ball inside, and breaks into pieces of itself

The owner: *it should look like a basketball, such as rounded; improve the
graphics of the broken pieces; maybe change what is inside to a smaller red
or cyan only enemy so it looks harmonic with the same shape of the
basketball.* The shell is a true circle now rather than the `METEOR`
contour; what shows through a break is `volley-core.ts`, a glossy sphere of
the body's colour at half the shell's radius wearing the shell's own four
seams, breathing; and `volley-shards.ts` replaces the spray of squares with
curved fragments cut from the sector a ward took — rind and stone, some with
a burning length of seam — thrown up and out off the shield and falling on
the skin, and at the hatch a ring of the core's own skin. The simulation is
untouched: the core is a picture over the slick or bulb it will fall as, and
the hatch's burst covers the swap. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `volley.ts`, `volley-look.ts`, `volley-stone.ts`, `shatter.ts` for why its cutter does not fit a sector, `effects.ts` for where a transient is registered |
| writing | 20 | the circle, `volleyBallRadius`, `volley-core.ts`, `volley-shards.ts`, the `Effects` wiring, the spark counts, the body-draw row and its test |
| looking | 20 | four films: the first pieces landed on the shield before they were seen (lift up, pull down); the hatch strip showed no shell was left to break, so the hatch throws the core's skin instead |
| friction | 5 | `crop` refuses a fractional zoom; the frames tool's effect clock runs behind the simulation, so the pieces' flight was judged by shape and not by timing |
| landing | 5 | `check:fast` (two index rows, one body-draw assertion moved), the commit, `land --keep` |

Bottleneck: **what is there to break** — the pieces were designed for a shell
that the third ward has already taken whole, and only the film of the hatch
said so.

## 2026-09-12 · hit-looks — THE CRYSTAL is a craft with an electric field, opened by a shield anywhere under it

The owner: *it should react on the shield when in the same vertical as the
whole ship, to make it easier; add some visual before which indicates an
electrical shield around all — when shielded correctly below it the electric
shield is interrupted and the shot can hit the middle; let it fly slower;
make it look more cool, like a space ship; when hit wrong it shouldn't fall
faster, just nothing; replace the bulb and slick in the ship with anything
you like, red and cyan.* `crystalHeld` now answers for any lane of the span,
the crossing is one lane a beat, a wrong shot is caught and nothing else
happens (`crystalCatch`; the dive went to NOT BUILT YET → Mechanics), and
the body is a saucer cut from the retired `SHELL` contour with red and cyan
engine pods and a canopy in the join's colour, an electric field crawling
round the whole of it that opens across the underside while the shield
stands armed there. Found on the way: the shot was tested against the
middle of the lane the body was *going to* while it was found against the
lane it was *drawn* in, so a bolt up the visible join in the first half of a
beat was caught — `crystalMiddleLane` and `crystalUnder` read the drawn lane
now. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/crystal.ts` and its config, events and consumers, `render/crystal.ts`, `silhouettes-spare.ts` for a free contour, the shape drafts, `mid-beat.ts` and `bullets.ts` for how a shot finds a body |
| writing | 25 | the sim rule and its tests, the event rename through audio, render, director and their tests, `crystal-craft.ts`, `crystal-field.ts`, the guide, the tables, the bestiary and the NOT BUILT YET card |
| looking | 10 | three films: the pods hidden under the wing, then a shot up the middle that was caught — which was the lane defect, not the picture |
| friction | 5 | `--press` refuses a press after `--ticks`, so the whole sequence was filmed as two runs |
| landing | 5 | `check:fast` (two index rows), the commit, `land --keep` |

Bottleneck: **the drawn lane** — a body that changes lanes is found by a bolt
where it is drawn, and every rule that then asks "which column of it" has to
ask the same question; the crystal's did not, and the film is what said so.

## 2026-09-12 · hit-looks — THE COIL's rock is thrown from the dome's tile to the far wall

The owner: *the first hit by shield must have a torch falling, immediately;
the torches must release from the exact position the coil was removing its
shield, then fly in a diagonal to the farthest border; when it has a shield
it is already looking like a torch inside; text "Do not shield!".* The freed
rock used to appear at the far wall on the dome's row and fall a beat later.
`popCoil` now leaves `fromCol`/`fromRow` on the dome's tile and puts the
rock on the far wall's hull row, so the glide is the diagonal and it is
resolved on the next beat line; a transient measures the throw from the
frame the dome went (a late ward is a fast one), runs the tail from the dome
and keeps the line lit a moment after the hit, and the impact's own vertical
tail is off for it. The coil is drawn as the burning torch inside its dome.
"Do not shield!" opens player 2's half of THE COIL's guide. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/coil.ts`, `beat.ts`'s order, `hull.ts`'s arrival rule, `recoil-leap.ts`, `creatures.ts`, `torch.ts`, `rock-impact.ts` |
| writing | 10 | `popCoil`, two sim tests, `coil-flight.ts`, the tail from anywhere, `creature-body-rock.ts` (the rock bodies moved out of a full file), the wiring, four render tests, the guide line |
| looking | 5 | one film of a mid-beat ward — right first time |
| friction | 5 | the probe's `waveWorld` started a wave without its fault, so the stuck shield never armed; fixed in the tool (`tools/probe/world.ts`) |
| landing | 5 | `check:fast` twice (a guide half over 220 characters, a file at 251 lines, two index rows), the commit, `land --keep` |

Bottleneck: **deciding the timing** — a dome opened late in a beat leaves the
rock a fraction of a beat to fly, and every way of giving it a whole beat
needed either a new field on the body or a picture that ended after the
simulation had resolved it; the fast flight with a lit line behind it won.

## 2026-09-12 · hit-looks — THE CHOKE crawls along the hull to the cannon before it takes it

The owner: *when the choke hits the ship, it fast crawls to the cannon
first.* The grip was a cut — strand in its lane one frame, loops on the
cannon the next. Now the `chokeGrip` event names the body, and a transient
held with the hull-level ones draws the sac lying on the plating and surging
toward the cannon in the beat the simulation already leaves before it walks
anything, hooks reaching, with a flash as the loops go on. The landing burst
moved to the lane it fell in. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `sim/choke.ts`, `render/choke.ts`, `render-state.ts`, `canvas2d.ts`, the handed burst table |
| writing | 10 | `id` on the event, `choke-crawl.ts`, `choke-strand.ts` (the paint moved out of `choke.ts`, the crawler beside it), the wiring, four tests |
| looking | 5 | one film, cropped to the hull — right first time |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the simulation had already left the
beat the crawl needed.

## 2026-09-11 · hit-looks — THE STRAND's thread burns away like a fuse

The owner: *when all bulb and slick are destroyed there must be a nice
animation how the string is destroyed — like a fuse in the air, a bigger
effect.* The `strandBroke` event now carries every bead on the thread, and a
new body transient rebuilds the line from them, lights it at both ends and
burns it inward — sparking fronts, each raisin popping off as a front reaches
it — to a blast where the two meet, on the tile the old grey puff stood on.
About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `strand.ts`, `strand-bead.ts`, `effects-body.ts`, the burst table and both silent lists |
| writing | 10 | the event's `beads`, `drawRaisinAt`, `strand-fuse.ts` and `strand-fuse-draw.ts`, the wiring, five tests |
| looking | 5 | three films — the first too small, the second's blast too big |
| friction | 5 | the probe that planned the presses: two threads under the one I wanted rejected the shots, and the cooldown; `sinHash` re-derived once |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **getting every bead shrivelled on film** — the lit end is the
seeded rng's and hops after every shot, so the presses had to be planned by
running the wave headless first (`tools/probe`).

## 2026-09-11 · hit-looks — THE LID's cord hangs beside the eye and rides down with it

The owner: *the pull must be left or right of the enemy, then it should
glide as the lid glides.* The handle hangs a tile beside the eye on the side
toward the middle of the field (`lidSide`), and held or loose it goes down
with the body, the cord keeping its length; the tension is still the hand's
travel. The frozen anchor a September lane added is gone, and the per-beat
re-clamp it removed is back. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `lid.ts`, `handle-pull.ts`, `lid-string.ts`, `handle-place.ts`, the commit that froze the anchor and why |
| writing | 10 | `lidSide`, the rest and handle rules, `stepLidPulls` back, the two anchor fields out of the state and the hash, the render's `lidHandlePoint`, the sag's belly hanging down, three tests |
| looking | 5 | two films — one with the handle pulled off the crop, one loose then held |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the one decision was which side, and
the side with the room answered it.

## 2026-09-11 · hit-looks — THE RECOIL is thrown, not jumped

The owner: *jumping when hit is sometimes not natural and fluent — it's like
jumping.* A bounce was written mid-tick and glided over whatever was left of
the beat, so the frame of the hit jumped and a late hit crossed two rows in a
tenth of a beat. Now a struck recoil is on a throw of its own for one beat:
a parabola from where it was drawn, ending on the simulation's own place at
the fall's own speed, the colour turning along it. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `recoil.ts`'s bounce, `drawnRow`/`drawnCol`, the beat's `from` reset, where `Effects` reaches `drawCreatures` |
| writing | 15 | `recoil-leap.ts`, `Body.turn`, the placement in `creatures.ts`, the wake's end, four tests |
| looking | 10 | three films — the first two on the authored column rather than the mapped one, the bullet flying up an empty lane |
| friction | 0 | — |
| landing | 5 | `creature-place.ts` one line over its limit, `check:fast`, the commit, `land --keep` |

Bottleneck: **the column.** A wave's column is not the field's (`mapCol`),
and `press.ts` says so in its own header — two films were spent before it
was read.

## 2026-09-11 · hit-looks — What is inside a body stays inside it

The owner saw the red rind's inner animation reach past its body: a rind
wearing BURR (three lobes and knobs) drew the slick's bloom, whose veins are
sized to the slick's own ellipse, and they crossed the knobbed rim. Now every
living body's interior is clipped to the body drawn a sixth smaller
(`body-inset.ts`), so nothing inside touches the edge. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `living-draw.ts`'s order of clips, where `drawDetails` gets its radii, the BURR contour against the bloom's reach |
| writing | 10 | `body-inset.ts`, the wrap in `living-draw.ts`, a test that counts the clips per living body |
| looking | 5 | two 6-frame strips of THE RIND at zoom 3 — inset 0.9 still touched, 0.84 left a clear gap |
| friction | 5 | ten budget rows moved by one `clip` and one `save` each — remeasured with MEASURE on, every other figure checked unchanged |
| landing | 5 | `check:fast`, the two dated notes, the commit, `land --keep` |

Bottleneck: **the budget rows** — one extra clip per living body touches
every row in two budget tests, and each had to be remeasured rather than
padded.

## 2026-09-11 · hit-looks — The BESTIARY tab comes off

The owner asked whether the page was gone; it was not — an earlier lane had
only retired its idea rows. Now it is: the tab and its sheet leave the
director, the creature ideas read on MECHANICS in a group of their own, each
beside the draft drawn for it, which was already on GRAPHICS. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | what the tab still held (two empty groups, ten ideas, one prose section), every `bestiary` in the director, the concept-art join |
| writing | 5 | `index.html`, `backlog.ts` and `backlog-page.ts`, three comments, the README, the backlog tests |
| looking | 5 | two shots of the page against this tree's own director — the tab row, then the CREATURE IDEAS group with its shapes |
| friction | 0 | — |
| landing | 5 | lint red once on a line the formatter wanted folded, `check:fast`, the commit, `land --keep` |

Bottleneck: **none worth the name** — the shapes were on GRAPHICS already
through each draft's `suggests`, so the work was taking a page away without
breaking the join that page had carried.

## 2026-09-11 · hit-looks — A rock lands in the hole it makes

The owner's report: the meteor went into the ship and vanished, then jumped
up with the crater under it. The hull row's centre is under the membrane, so
the last glide ended behind the skin; and the hole stayed shut under the
stuck rock until it lifted off. Now the glide ends half-sunk in the plating,
the replay picks it up standing there, and the hole, the sparks and the
crack all show that frame. About 50 min, a compaction in the middle.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the layout numbers at 390×844, `rock-impact.ts`, `creatures.ts`'s placement, `sim/hull.ts`'s landing beat, `frame-ship.ts`'s gate, the two samplers in `hull-frame.ts`, the tests |
| writing | 15 | `rock-landing.ts` and its test, the `y0` clamp and the gate in `rock-impact.ts`, `skinSampler`, the parameter through `drawBodies` and `drawCreatures`, three doc comments |
| looking | 10 | two eight-frame strips of THE ROCK, the first with the cannon standing on the rock's column — which is what turned the surface sampler into the skin one |
| friction | 5 | no PNG joiner on the machine: a throwaway strip script against `tools/frames`'s own codec, written twice because the encoder lives in `picture.ts` and the decoder in `pixels.ts` |
| landing | 5 | `check:fast` red once on the file index, `bun run index`, the commit, `land --keep` |

Bottleneck: **reading** — the defect is three files agreeing on a height,
and finding which of the two membranes each one was asking took longer than
making them agree.

## 2026-09-11 · hit-looks — The act order names only what is built

The owner cleared THE ACT ORDER group of the NOT BUILT YET page: seven
placeholder names and THE TELL out of `bosses.md`'s order, 11.10 "In plain
words" gone with them, THE MOTHER and THE VESSEL drafts set free, a decision,
and the page's empty line saying where a built boss went. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `roster.ts`'s order parser and `isBuilt`, the drafts that suggest the names, every file naming a slot |
| writing | 15 | `bosses.md`'s head and the cut, `decisions.md` #30, four director tests, two drafts, the catalogue, `backlog.ts`'s `builtWhere`, the tab preamble |
| looking | 5 | three shots of the tab — the first against the main checkout's director on 4174, which showed yesterday's page |
| friction | 5 | The Conductor stood as unbuilt under its own name (now written as THE VANE); a draft must be offered to something, so two became free; the once-director idles out in three minutes |
| landing | 0 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a draft cannot point at nothing and a test cannot
count nothing, so removing eight names is also deciding what the two
pictures drawn for them are now.

## 2026-09-11 · hit-looks — THE COUNT

The Countdown creature out of `ideas.md` and into act 3 as THE COUNT: a disc
whose count only the pilot is drawn, open for two beats at nought, a shot off
zero costing the hull. `sim/countdown.ts`, the render's marks, the wave and
its guide, the six tables, the director's brush and ship groups, a decision,
and sixteen tests that counted things moved by one. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the ideas entry, the lure's price and the throb's colour arrangement, `bullet-hit.ts`, `spawn.ts`, the split family in `creatures-split.ts`, the COUNTDOWN draft, `nameability.ts` |
| writing | 25 | `countdown.ts` in sim and render, the silhouette, the wave, the tables, the test, `decisions.md` #29, the bestiary row, fifteen knock-on tests |
| looking | 5 | two close-ups and a seven-beat strip of the pilot's screen, one close-up of the navigator's |
| friction | 10 | a one-lobe disc has no lobe count under the nameability gate (fixed with seven shallow lobes); the draft's card name collided with the new living card; five files at 251–254 lines trimmed back to 250 |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a new kind is a name in six tables and a number in
sixteen tests, and every one of those tests wanted a sentence saying why it
moved.

## 2026-09-11 · hit-looks — Ten creature ideas leave the bestiary

The owner retired the Choke, the Glyph and the nine idea rows of bestiary 10.2
from the NOT BUILT YET page. Rows, paragraphs and the whole of 10.5 out of the
spec, a decision written, six documents that pointed at them re-pointed, the
director's tests turned round, and the page's empty-group line made one
sentence. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | how the director builds the bestiary groups (`backlog.ts`, `roster.ts`, `plain-words.ts`), every file naming the ten, the page's empty-group text |
| writing | 15 | `bestiary.md`, `decisions.md` #28, five other documents, two director tests, `backlog-page.ts` |
| looking | 5 | three shots of the tab: the two notes said "nothing here" and then "12 more", then "all 1 are" |
| friction | 5 | a Python heredoc bash refused to parse, rewritten as a file; one wrong assertion length |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — ten names were in eleven places, and each place
needed a sentence that still reads once they are gone.

## 2026-09-11 · hit-looks — `bun run shot` says what the page said

The queue's `versus:shot` item: a page that throws while loading used to
photograph as *no element matches — is the tab right?*, and with `--freeze`
as a ten-minute wait. `shot.ts` now listens to the page from the moment it
opens and prints what it said above that line, and a throw cuts the wait to
five seconds. A browser test with a page that throws. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `shot.ts`, `versus-shot.ts`, `shot-state.ts`, `page.ts`'s own listener, how `opening.test.ts` shares a browser |
| writing | 10 | `page-said.ts`, the wiring in `shot.ts` under its line limit, `page-said.test.ts` |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 10 | `queue done` by title, `check:fast`, the commit, `land --keep` twice |

Bottleneck: **landing** — half the time went on landing a 10-minute change.
The first `bun run land` ran its full check for four minutes and then went
red on one thing: the new file had no row in `docs/INDEX.md`. Writing the row
took a minute; the second full check took another four. `check:fast` had
passed a moment earlier because the index test was not among the tests it
runs for every change. Fixed in the next landing: the index test is now one
of `check:fast`'s sweeps, so a missing row is red before the commit.

## 2026-09-11 · hit-looks — THE CHOKE

A body that takes the cannon: the strip goes dead, the cannon walks wall to
wall, player 1 taps it off. Rules, six tables, a wave in act 7, the look on
the field and on the strip, its sounds, the director's rows, the bestiary
card retired. About 160 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `gum.ts` both sides, `malfunction.ts`, the strip look, the spine, `touch.ts`, the band's draw order, the frames tool's flags, nine pinned-count tests |
| writing | 75 | `sim/choke.ts` and its config and events, the codec, the six tables, `act-7a.ts`, `render/choke.ts`, `choke-coil.ts`, `choke-strip.ts`, `bind-choke.ts`, the replay and frame tests, the director rows, the bestiary |
| looking | 15 | four `bun run frames` pictures: the loops merged into a block at the first stack height, the hooks tangled once |
| friction | 30 | Python's text mode wrote CRLF into 45 files and biome refused them; a commit message in a `$(cat <<EOF)` hung bash and was written to a file; six files at the 250-line ceiling (`bind.ts`, `effects-spark.ts`, `act-7b.ts`, `events-creature.ts`, three tables), each split or trimmed; `--hold` had no lift, so the frames tool learnt `choke=up` |
| landing | 15 | `check:fast` four times over the pinned counts, the commit, `land --keep` |

Bottleneck: **friction** — a new creature touches every table the game has,
and five of them were already standing on the 250-line ceiling.

## 2026-09-11 · hit-looks — panel:band-skin opened with POLYP, VESICLE and SUCKER

Three candidates for the bed, gloss, life and slime round a button on GLAND's panel; a module cycle band-join / gland-join / band-seam that kept the VERSUS page from opening at all is broken by a leaf seam-line.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 45 | writing |
| looking | 20 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: bun run versus:shot failed with no picture and no message for twenty minutes before the in-app browser showed the cycle; the shot tool should print the page's console errors when the stage is missing.

## 2026-09-11 · hit-looks — The slime on the band is a record

drawBand called drawDrips by name; BAND_SLIME in slime-look.ts now wraps it so panel:band-skin can patch what hangs over the buttons.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Nothing worth naming: one import, one call, one new file.

## 2026-09-11 · hit-looks — GLAND's paths are held between frames

The spine's cord, stations and node and each organ's bed are cached per layout and per button, the stations are one fill instead of ten, the budget rows fell back and the frame is byte-identical.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 0 | friction |
| landing | 5 | landing |

Bottleneck: Remeasuring five budget tables is a run and a paste, but still the longest part of a small change.

## 2026-09-11 · hit-looks — GLAND is the ship

The owner picked GLAND out of ship:body; adopt refused the function fields so the six shared tool modules moved into packages/render by hand, the seven records point at them, the displaced looks are deleted, five budget tables and the baked-entry count were remeasured, and the slot closed.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 5 | looking |
| friction | 15 | friction |
| landing | 10 | landing |

Bottleneck: Closing the slot by hand: drop needs the candidates and their shared modules present to list them, so the moved files had to be restored, dropped, and removed again.

## 2026-09-11 · hit-looks — The lane question is retired

The owner said a landed lane must no longer ask whether to push, sweep or deploy; the rule, the hook message, its test, the reasoning doc and the lane skill now say: land with --keep, report, stop.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: A python heredoc with apostrophes in it broke under the Bash tool again, so the edit script went through a file.

## 2026-09-11 · hit-looks — Three burning meteors offered in VERSUS

Three new creature:meteor candidates — BLAZE (a torch's fireball round a scorched, cratered stone), COMET (rusted iron under a long plume) and SMOULDER (a black stone burning on its underside, under a column of smoke) — each shedding small pieces with their own smoke up the wake, each keeping the shot marks; shared fire and smoke helpers in tools/versus/wake.ts and wake-fire.ts.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | reading |
| writing | 40 | writing |
| looking | 35 | looking |
| friction | 20 | friction |
| landing | 10 | landing |

Bottleneck: Radial gradients painted inside the clipped stone came out flat or blank in the shots, whatever their geometry; the hot underside is a linear gradient instead, and every other gradient in the three was made concentric on the way.

## 2026-09-11 · hit-looks — THE GUM: a body that sticks to the ship and is swiped off by the seat without the cannon

A new creature and wave 44: the gum falls straight, cannot be shot, sticks to the hull and shuts the cannon in its columns; player 1 parks the cannon under it and player 2 swipes it toward the nearer wall, the wrong way spreading it a lane. Sim, render (THE WEIGHT's sac in venom green), scene, audio, director, frames tool, tests.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the balloon's handle, drag and audio files as the pattern, the tests that enumerate every kind |
| writing | 95 | sim, render, content, scene, audio binding, director pages, the sim test |
| looking | 5 | one frame of a stuck gum mid-swipe |
| friction | 20 | two heredocs broken by apostrophes, the canvas stub without transform, a dozen enumerating tests found one by one |
| landing | 15 | format, check:fast, index, perf --unmeasured, the log |

Bottleneck: The tests that enumerate every creature kind — bestiary categories, mechanics, backlog counts, sheet card counts, audio wiring lists — each found by running the whole suite rather than from one checklist.

## 2026-09-11 · hit-looks — THE CRYSTAL

THE CRYSTAL built off the bestiary's Crystal: a red slick and a cyan bulb joined at a thin middle under one shell, crossing on the carom's diagonal, opened only by the shield under the middle and the guard armed on the beat the shot of the join's colour lands; a wave, a guide film, three sounds, the director's rows. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the carom and clasp files end to end, the scene format, the audio binding tables, the file-limit list, the director's brush and ship tables |
| writing | 30 | config-crystal, crystal.ts in sim and render, events, the joined creatures file, the wave, the scene, the bindings, thirteen sim tests and a frame test, the bestiary |
| looking | 10 | six bun run frames pictures — the shell's waist too shallow at first, then the link drawn under the gliding body instead of in the shield's lane |
| friction | 5 | a heredoc turned an escaped newline into a real one and broke the edit script; two files landed on 251 lines and each lost a comment line |
| landing | 10 | two check:fast rounds fixing the twelve tests that name every kind, the commit, land --keep |

Bottleneck: writing — a creature touches forty files across four packages and the director before it can be drawn once, and every one of them is a row in a table a test reads

## 2026-09-11 · hit-looks — THE TELL removed

The boss round THE TELL and everything that hung off it — sim ladder and ring, render body and scenes, the reduced panel, the guide scene, wave 60, the director's rows, the perf baseline row — taken out; the design stays on the BOSSES page as a removed idea.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 20 | writing |
| looking | 0 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Finding every dependency of a round when 'tell' is also an ordinary English word and the Bulb Queen's own field name.

## 2026-09-11 · hit-looks — creature:rind kept, three sheds to the LIBRARY

The owner kept the shipped shed and asked for the VERSUS alternatives on the GRAPHICS page: FLAKES, POD and SLOUGH moved into packages/render beside their record, the slot dropped by hand, and a rind card built that replays the shed on the game's own burr.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Catching a half-second event on a card with a fixed-wait shot took five shots; the page clock does not start at the click.

## 2026-09-11 · hit-looks — creature:recoil — GLOBE into the game, three cages kept

Copied MOONS, FOAM and CALYX into render for the LIBRARY, adopted GLOBE with the tool, built a recoil card that spends its ribs, let two creatures share a label on the LIBRARY.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Two slots had spelled a look FOAM, and the LIBRARY test wanted labels unique across the whole page; a label is now unique under its creature.

## 2026-09-11 · hit-looks — creature:queen — SCUTES into the game, CARAPACE and FACET kept

Copied CARAPACE and FACET into render for the LIBRARY, adopted SCUTES with the tool, built a queen card that hands her contour straight to a look, remeasured the BULB QUEEN's op-count rows.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 15 | writing |
| looking | 5 | looking |
| friction | 10 | friction |
| landing | 5 | landing |

Bottleneck: A Bash heredoc holding three files failed to parse and had to be redone through the Write tool; then the op-count budget wanted the seven plates measured.

## 2026-09-11 · hit-looks — creature:mount — TAPROOT into the game, RASP kept

Moved the rooted rim into content so a package could draw it, took TAPROOT and RASP by hand, broke the record–look import cycle with mount-bearing.ts, built a mount card with a hub to face, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Both candidates imported tools/shape-sheet, which a package cannot; the rim had to move into content first and the adopt tool could not do the slot.

## 2026-09-11 · hit-looks — creature:magnet — ORE into the game, the rest gone

Adopted ORE with the tool, cut COIL's dead arch out of magnet-coil.ts and retitled it as the slab and poles ORE draws over, photographed THE MAGNET.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | reading |
| writing | 10 | writing |
| looking | 5 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Cutting the dead horseshoe: the slab shares the bevel with the arch, and the first cut took it too.

## 2026-09-11 · hit-looks — creature:lid — IRIS into the game, BEVEL kept, SHAPES renamed GRAPHICS

Adopted IRIS with the tool after copying BEVEL and the old plates into render for the LIBRARY, built the lid stage that pulls the cord on a card, renamed the tab with SHAPES kept as a synonym for the shot tool, remeasured THE LID's op-count row.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: The op-count budget: six leaves cost more fills and gradients than two plates, and the row had to be remeasured in MEASURE mode and moved before check:fast went green.

## 2026-09-11 · hit-looks — creature:veer — the rider's collar stays on the rock

Read the rider's geometry, found the 'hands' are the ruff beads sinking with the crouch, pinned them to the rock's crown, photographed the brace before and after, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 5 | writing |
| looking | 15 | looking |
| friction | 5 | friction |
| landing | 5 | landing |

Bottleneck: Catching the brace on a frame: the first two photographs were of a rock in a row that does not brace, and a probe had to say which tick to shoot.

## 2026-09-11 · hit-looks — creature:veil — ANVIL kept and thinned over the body, three clouds kept

Moved FOAM, STRATA and VORTEX into packages/render, thinned the see-through cloud until the slick reads, built a veil stage and four cards, photographed the field and the LIBRARY, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 15 | looking |
| friction | 0 | friction |
| landing | 10 | landing |

Bottleneck: Finding how much cloud to leave on player 1's screen took three frames: the near heaps are dark on dark and hardly show at game size, so the visible change is mostly the base fill going.

## 2026-09-11 · hit-looks — creature:volley — EMBER into the game, PITTED and the painted seams kept

Moved EMBER's seams into the record and PITTED beside it, built a volley stage that walks the plate count down on a card, photographed the LIBRARY and the field, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | reading |
| writing | 20 | writing |
| looking | 10 | looking |
| friction | 5 | friction |
| landing | 10 | landing |

Bottleneck: Dropping a decided slot also drops its versus-pose row, and one test reached the pose through that row — it now names the pose directly.

## 2026-09-11 · hit-looks — creature:warden — SURFACE stays, three kept on the LIBRARY

Read the three candidates and the warden record, moved their paints into packages/render beside the record, built a warden stage for the LIBRARY from the game's own body and state, photographed the cards, dropped the slot.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | reading |
| writing | 25 | writing |
| looking | 15 | looking |
| friction | 10 | friction |
| landing | 10 | landing |

Bottleneck: Photographing the LIBRARY: the browser pane cannot save a PNG and `bun run shot` needed the right flags (`--tab` opens the sheet itself; `--click` takes a CSS selector, not a Playwright one) — found by three failed runs.

## 2026-09-11 · hit-looks — the wisp wears ARMS, and SHAPES gets a LIBRARY

The owner took ARMS into the game and asked for the threads it replaced, COMB and SKIRT, to be kept on the SHAPES page because he wants more jellyfish-like bodies. The page had no place for a whole canvas-drawn look, so it got one: a fourth view, LIBRARY, whose cards are the game's own drawing code run on the game's own wisp (`tools/director/src/library`). ARMS was inline in its candidate and went in by hand; THE WISP's op-count rows moved.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate, `wisp-look.ts`, the SHAPES views, the holders panel's loop |
| writing | 25 | `wisp-arms.ts`, the library's types, stage, four assets, panel, VIEW button, test |
| looking | 10 | the LIBRARY in the director twice, one frame of THE WISP |
| friction | 5 | a canvas that is 300 wide by default hid a missing height; one heredoc too long for the shell |
| landing | 5 | check:fast, budget rows, commit, land |

Bottleneck: There was no place on the SHAPES page for a canvas-drawn look, and building one was most of the piece.

## 2026-09-11 · hit-looks — the back decided: the sea stays, one light in the corner, the beat's sweep off

The owner kept the shipped back and dropped `field:backdrop`; what he kept of NEBULA is one soft rounded light of the act's tint in the sky's bottom-right corner (`corner-light.ts`, additive like the shafts), and the beat's travelling band across the field is off for the moment, its function kept and exported with a note on how to put it back. Every op-count budget moved by the one `drawImage` a frame the light costs.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three candidates, `backdrop-look.ts`, `field.ts`'s sweep, the budget files |
| writing | 10 | `corner-light.ts`, the record's new order, the sweep's note |
| looking | 10 | three frames of THE RIND — the first two too faint to see over the violet ground |
| friction | 5 | twenty-two budget rows and the baked count moved by one |
| landing | 5 | check:fast, commit, land |

Bottleneck: A light of an act's tint laid over the ground is invisible until it is added instead, which took two pictures to see.

## 2026-09-11 · hit-looks — the rind decided: BURR

The owner picked BURR for `rind:body`. `bun run versus adopt` moved the candidate into render, but it imported the shape sheet's `studded` form by a relative path, which a package may not do; the arithmetic moved into `packages/content/src/studded.ts` and the sheet's form became a wrapper round it, the move `metaball.ts` and `body-path.ts` made before.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the adopt tool's output and the candidate's imports |
| writing | 10 | `content/studded.ts`, the sheet's wrapper, the render import |
| looking | 5 | one frame of THE RIND, cropped |
| friction | 5 | the moved file's relative import broke the typecheck; the crop tool's argument shape |
| landing | 5 | check:fast, commit, land |

Bottleneck: The adopt tool moves a file without rewriting a relative import into a tool, which cost a typecheck round.

## 2026-09-11 · hit-looks — the crater decided

The owner keeps the crater as shipped; the slot closed with nothing taken. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | nothing — the decision came in chat |
| writing | 0 | nothing |
| looking | 0 | nothing |
| friction | 0 | none |
| landing | 5 | `versus drop`, `check:fast`, the commit, `land --keep` |

Bottleneck: **landing** — there was nothing else.

## 2026-09-11 · hit-looks — the ship's body, three cards from the brief

The owner named what he wanted from three of the six ships rather than one of
them; those three went and three new cards stand in their place, built on a
wet grain-free skin, buttons grown as organs, and PLASM's bubbles and strings.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the three cards he judged, `join.ts`, `sheen.ts`, the band's draw order, the record types, the versus tests that hold a slot to one shape |
| writing | 35 | `wet.ts`, `organ.ts`, `cord.ts`, `fluid.ts`, three candidates, the DECIDED entry |
| looking | 10 | five `versus:shot` pictures: ribs beading at the rim, veins as a sea urchin twice before they read as vessels |
| friction | 5 | two long heredocs died in bash and were written through a script file; `organ.ts` over 250 lines, the cords moved to `cord.ts` |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — a brief that takes one thing from each of three
cards is three shared modules before any card can be drawn.

## 2026-09-11 · hit-looks — DOCUMENTATION → WORDINGS

A new tab: two whole phones, the pilot's and the navigator's, each a real
frame with a line from every word to the thing it names, and the words with
no place to point at under them. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the sheet's tab wiring, `pose-art.ts`, `layout.ts`, the band, lobe, siren, HUD and radar files for what each thing is called and where it stands |
| writing | 30 | the world, the callouts, the page with its label stacking, the glossary, the CSS, the test, three render exports |
| looking | 15 | two `bun run shot` rounds: labels piling up at the top of one margin, both lobe leaders on one line, the blip under the torch's alarm |
| friction | 5 | a `cat` left waiting on stdin; `bun run dev` is refused to an agent, so the director was launched by absolute path on its own port |
| landing | 5 | `main.ts` over 250 lines after one more binding — the five room bindings moved to `documentation-rooms.ts` |

Bottleneck: **writing** — laying labels beside a picture without them
piling up took a measured two-pass stack rather than a guessed one.

## 2026-09-11 · hit-looks — the torch decided

The owner keeps the torch as shipped: both torch slots dropped, the stale
queue claim closed, the branch that only ever existed as a local ref deleted.
About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | where the claimed branch lived (a local ref in the main checkout, tip already on `main`, no worktree), the two torch slots |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | `versus drop` twice, `queue done`, the tests, the commit, `land --keep` |

Bottleneck: **reading** — a `Taken:` line names a branch, not where the
branch lives, so the owner could not tell a finished claim from a lost one.

## 2026-09-11 · hit-looks — the queue: the pose map's stale rows

Nineteen rows for closed slots out of `versus-pose.ts`; `adopt` and `drop`
take a slot's row with it, and the director's test refuses a row whose slot
has no candidate. On the way, two room tests that raced under a full check.
About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `versus-pose.ts`, its test, `decide.ts`; then `room.test.ts`, `settle`, `occupiedSeats` and `pressStart` for the flakes |
| writing | 15 | `pose-row.ts` and its test, the row test, the cannon tests moved onto the pose by name, `docs/versus.md`; the two room tests |
| looking | 0 | — |
| friction | 5 | the Bash tool collapses a doubled backslash inside quoted heredocs and `node -e`, so a script that matched source text never matched — the edits went through the editor tool |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **friction** — two red `land` runs on room tests unrelated to
the lane, each a full `check` to find out.

## 2026-09-11 · hit-looks — the queue: a claim on the lane's own entry

`bun run queue take` marks an entry the trunk has not got in the working
copy instead of throwing, and a claim that fails to mark deletes the branch
it made; `repo.ts` split along its git seam into `git.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `claim.ts`, `repo.ts`, `run.ts`, `edit.ts`, the two existing tests |
| writing | 15 | `trunkHas`, the working-copy branch of `claim`, the rollback, `hasEntry`, a test repository shaped like the lane, the preamble paragraph |
| looking | 0 | — |
| friction | 0 | one assertion compared against an untrimmed `git status` line |
| landing | 5 | `queue done`, `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — the fix is ten lines and the test that proves it
in a real repository is a hundred.


## 2026-09-11 · hit-looks — the queue: shipped-looks caught up

Four sections written into `docs/shipped-looks.md` — the chute, the coil, the
dart and the echo — from the four `*-look.ts` records, the adopted paint and
`DECIDED.md`, in the file's own table form. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the file's 400 lines for its form, eight render files and four DECIDED entries for the numbers |
| writing | 10 | four tables and the paragraph under each |
| looking | 0 | nothing visible moved |
| friction | 0 | a long heredoc died in bash again — the sections were written with the tool and spliced in with awk |
| landing | 5 | `queue done`, the commit, `land --keep` |

Bottleneck: **reading** — every number in a table is in a different file
from the one that says why it is there.


## 2026-09-11 · hit-looks — the gyre slot answered

ORBIT into the game; the granules it replaced, HELIX and VORTEX all
re-authored as fillings on the SHAPES page, ORBIT beside them as the
control. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three gyre candidates and `gyre-core.ts` |
| writing | 15 | the adoption, the core stripped to its shared parts, four fillings and two helpers in `fillings/parts.ts` |
| looking | 5 | `versus:shot` before; one card each after, the helix opened up on the second look |
| friction | 0 | — |
| landing | 5 | the gyre budget rows remeasured, `check:fast` |

Bottleneck: none worth the name — the ghost lane an hour earlier had already
built the path, and this one walked it.

## 2026-09-11 · hit-looks — the ghost slot answered

SWARM into the game, the eyes made to read at the field's size, HOLLOW and
LANTERN re-authored as fillings on the SHAPES page. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three ghost candidates, `ghost-eyes.ts`, `ghost.ts`, the fillings axis and its helpers |
| writing | 10 | the adoption, the eye numbers, two fillings, the record clean-up |
| looking | 10 | `versus:shot` before, `frames . --wave` after at 8x; two rounds on each filling card |
| friction | 5 | `land` refused yesterday's lane over two parked titles a few characters past eighty |
| landing | 5 | the ghost budget rows remeasured, `check:fast` |

Bottleneck: once a slot is closed nothing shows the shipped look on its own —
`versus:shot` needs a candidate — so the eyes were checked by cropping a
wave frame, which is fine for the ghost and blind for a body that moves.

## 2026-09-10 · hit-looks — five creature slots answered

Five VERSUS slots taken into the game from one chat message, the looks he
wanted kept re-authored on the SHAPES page (three tails, two skins, one hit),
two op-count budgets remeasured. About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/versus.md`, the five slots' candidates, the tails/skins/hits registries |
| writing | 15 | four adoptions by tool and one by hand, six SHAPES entries, the record clean-ups |
| looking | 10 | `shapes:still` grew `tail:`, `tails`, `hit:` so the six could be seen; three rounds each |
| friction | 5 | `queue take` cannot claim an entry only in the lane's tree; a heredoc that swallowed three files |
| landing | 10 | two budget tables moved, `check:fast`, `land` |

Bottleneck: the SHAPES page had no terminal path to a tail or a hit, so half
the looking time went into building one before anything could be looked at.

## 2026-09-10 · claude/band-slot-after-ship-body

One question put to the owner and his answer written into the band's queue
entry, which now waits on `ship:body` instead of asking. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the entry, re-filed as a task |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 0 | folded into the next landing's check |

Bottleneck: none worth naming.

## 2026-09-10 · claude/compaction-window-and-hook

The auto-compaction window set to 300k in `.claude/settings.json`, compact
instructions at the end of `CLAUDE.md`, and a `SessionStart(compact)` hook
that restates branch, queue and parked into the fresh context. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the Claude Code docs for the setting's real name, the existing hooks and their wiring test, the queue parser |
| writing | 10 | the hook, its test, the settings, the instructions, two docs |
| looking | 0 | nothing visible moved |
| friction | 5 | one combined command hung for two minutes and was re-run as separate steps |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — a setting's name has to come from the docs, not
from memory, before it can be written into a file every session reads.

## 2026-09-10 · claude/next-and-stop-in-chat

The convention for handing a session several independent tasks — a numbered
list worked in order, `NEXT:` to queue a task mid-turn, `STOP` to interrupt —
written into `CLAUDE.md` and `docs/working-with-claude.md`. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | one bullet, one section |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475 (second landing)

`docs/choosing-a-model.md` removed with its three pointers, and
`docs/token-budget.md` rewritten for the way the work is actually done: one
session on Opus 5, tasks in sequence, compaction at about 300k. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the three files that pointed at the doc, the sessions memory |
| writing | 5 | the doc, three pointers, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **none** to speak of — a short lane.

## 2026-09-10 · claude/workflow-token-efficiency-fb8475

`CLAUDE.md` cut from 21.3 KB to 13.3 KB, a paragraph's headroom from its
ceiling, after the owner asked how to spend fewer tokens: the justifications
went back to the docs that already held them, the rarely-run scripts to a new
`docs/commands.md`, and the ceiling came down to 16 KB. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `CLAUDE.md` whole, `claude-md.test.ts`, the time log, `token-budget.md`, and each receiving doc to be sure it held what was being cut |
| writing | 10 | the file rewritten, `docs/commands.md`, two tests, an INDEX row |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — checking that every sentence removed already lived
somewhere else, which is the only thing that makes removing it safe.

## 2026-09-10 · claude/queue-what-a-hit-on-a-slick-or-a-bulb-looks-like-is-sh

A hit record per kind, the transient that draws it, two poses, and six
candidates — three strikes for the slick and three for the bulb. About
50 min from the claim to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `body-interior.ts`, `debris.ts`, `effects-break.ts`, `effects-spark.ts`, the recoil lane's candidate shape, the break pose |
| writing | 15 | `body-hit.ts`, `body-strike.ts`, the debris and sparks routed through it, a test, `poses-struck.ts`, six paints and six cards |
| looking | 20 | twenty `versus:shot` runs at eight seconds each, and what each picture asked for — petals too small, a drip drawn as a disc, spores lost in the wedges, a wave four columns wide |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking**, again — but a shot is eight seconds now rather than
two minutes, so the cost was the number of corrections rather than the wait
for each, which is the right cost to be paying.

## 2026-09-10 · claude/queue-the-players-ship-has-had-one-hull-since-the-game

Two queue entries checked against what `main` already carries: the hull
entry was answered by `ship:body`, and the band entry cannot open while that
slot holds its fields. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue, `docs/versus.md`, `DECIDED.md`, `bun run versus`'s field lists, the five `ship:body` commit messages |
| writing | 5 | one entry removed, one re-filed with an `Asks:` line |
| looking | 0 | nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entries were written before `ship:body`
existed, so most of the lane was establishing that it is the answer to one
of them and the block on the other.

## 2026-09-10 · claude/queue-the-rind-and-the-lid-have-one-look-each-and-no-r

Three sheds and three bodies for THE RIND, three armours for THE LID, a hand
on the pose, and a pair that dropped half its events. About 2 h 35 min from
the first command to the trunk moving.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue, `docs/versus.md`, the throb/crawler lane's shape, `rind-shed.ts`, `lid.ts`, the pose kit |
| writing | 50 | two look records and their shipped paint, `Pose.hand` and two poses, six candidates, then the `rind:body` seam and three more at the owner's asking |
| looking | 55 | fourteen `versus:shot` runs at two to three minutes each, reading each picture, and the tuning it asked for — POD's swing, IRIS's seam, FLAKES' colour, FACET's depth |
| friction | 20 | `--at` came back as prose (a wrong rectangle, read as a bug); the browser pane's screenshots timed out on the pair; no way to magnify a PNG already taken, so a throwaway script |
| landing | 15 | `check:fast` red on a file one line over; first `land` refused on four conflicts with thirteen commits landed meanwhile; second red on `docs/INDEX.md` rows; third landed |

Bottleneck: **looking**. A picture of one candidate costs two to three minutes
of director start-up and browser, and a candidate needs two or three pictures
before it is right — more than a third of the lane was waiting for
screenshots. The pair's own frame rate is not the cost; the start-up is.

## 2026-09-10 · claude/queue-bun-run-check-is-red-on-main-a-claim-the-shapes

A test that was green on Windows and red on Linux by the last digit of a
float, settled by saying what the sheet actually does. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `candidates.test.ts`, `drawn-size.ts`, `shape-fit.ts`, `drawn-size.test.ts`'s premise, the git log around dce50590 |
| writing | 5 | the two cases in `candidates.test.ts` and a paragraph in `drawn-size.ts` |
| looking | 0 | nothing visible moved |
| friction | 5 | the failure would not reproduce here — a scratch script at the root could not import `@neon-spore/content` and had to move inside the package |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — the entry named a red test that is green on this
machine, so most of the lane went into proving the diagnosis before the
three-line fix could be trusted.

## 2026-09-10 · claude/queue-bun-run-queue-take-cannot-write-its-taken-line-i

A claim written onto `main` in a clone that has nothing checked out on it.
About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `claim.ts`, `repo.ts`, `run.ts`, how `land` writes a note in a clone (`note-commit.ts`) and how it merges `docs/queue.md` (`queue-merge.ts`) |
| writing | 15 | `commitOnRef` through git plumbing, its clone-shaped test, two paragraphs of docs |
| looking | 0 | nothing visible moved |
| friction | 5 | a regex written through `sed` lost its backslashes twice; the third time it went through Python |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — deciding between the entry's two options took
finding that the landing already resolves the conflict the first one would
cause, which was in a file the entry did not name.

## 2026-09-10 · claude/queue-versus-pose-ts-is-at-the-line-ceiling-and-every

`SLOT_POSE` cut down to rows, each slot's reason moved onto the pose it names,
and a test that keeps the paragraphs from growing back. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `versus-pose.ts`, every `poses-*.ts` docstring the map pointed at, `limits.test.ts`, the scaffold's step four |
| writing | 10 | the rows-only map, one sentence on each of twenty poses, the test, the scaffold's wording |
| looking | 0 | nothing visible moved |
| friction | 5 | a heredoc that would not close on a quote inside the prose, moved to a script file; two escaped newlines the test file lost on the way in |
| landing | 5 | the director and versus tests, `check:fast`, the commit, `land --keep` |

Bottleneck: **reading** — twenty pose docstrings had to be read to know which
already argued for their slot and which did not, before a sentence could be
put on the ones that did not.

## 2026-09-10 · claude/queue-the-volley-and-the-veer-have-one-look-each-and-n

A look record each for THE VOLLEY's shell and THE VEER's rider, a pose each,
and three candidates apiece. About 1 h 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `volley.ts` and its seams and cracks, `veer-clown.ts` and the clown figure, `throb-look.ts` for the record shape, the depth skill, `versus/README.md`, the pose kit's hand |
| writing | 45 | two records and the shipped paint moved behind them, `VolleyShell.kept`, two poses and the volley's hand, six candidates, the ward test |
| looking | 15 | eight `versus:shot` runs at twelve seconds each; the pits made larger and more, the jester's horns widened into a V, the ember's scorch clipped to stone |
| friction | 10 | a heredoc that would not close, three times, on prose with quotes in it — moved to script files and to the Write tool; a `rm -rf` of the wrong glob that took six freshly written files with it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — six paints is six small programs, and each was
written against a picture of the shipped body taken first rather than blind,
which is what kept the looking short.
## 2026-09-10 · claude/queue-the-coil-and-the-tether-have-one-look-each-and-n

Two look records cut, three candidates each for THE COIL's chain and THE
WARDEN's rope, and a pose file for both. About 95 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the queue entry, `coil.ts`, `coil-jump.ts`, `tether.ts`, `clasp.ts`, `handle-draw.ts`, the sim's coil and rope rules, `carom-look.ts` as the pattern, the pose kit and three pose files, the depth skill |
| writing | 40 | `coil-look.ts`, `tether-look.ts`, the two call sites, six candidates with their paints, `poses-link.ts`, the rows |
| looking | 25 | nine `versus:shot` pictures with crops; the first coil pose collapsed its chain, the first bead answer put a dark blob on the rock and was replaced, the prongs read as Vs, the sinew's sheath filled as a chord |
| friction | 5 | no Python on this machine for a multi-file edit; a probe script at the root could not import `@neon-spore/sim` and moved inside the director |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — none of the four defects the pictures caught was
visible to `bun run check`, and each cost a shot, a crop and a re-shot; the
pose's chain in particular could only be timed by watching the beats print.

## 2026-09-10 · hit-looks

Every hit look on the VERSUS page put into the game, one body each, and both
slots closed. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the six candidates, `body-hit.ts`, `body-strike.ts`, which kills carry which kind (`wornKind`), the adopt tool |
| writing | 10 | the five moves, the seven records and `hitFor`, `of` on the kill event, the test, DECIDED |
| looking | 5 | four `bun run frames` strips to find the tick a bolt meets a bulb on wave 2; two perf runs |
| friction | 0 | no Python on this machine for the sim edit — sed did it |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **looking** — photographing a kill means guessing the tick the
bolt lands on, and it took three strips of the wrong tick before one of the
right one.

## 2026-09-10 · hit-looks (second piece: the carom capsule)

FACET taken on as a space rescue capsule: three offered on its faces, one
picked in chat and shipped, the slot closed. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four carom candidates, `carom-look.ts`, `carom.ts`, the window, the adopt and by-hand tools |
| writing | 20 | `carom-facet.ts` and `carom-marks.ts`, three paints and their indexes, the by-hand take, DECIDED, INDEX |
| looking | 10 | three `versus:shot` pictures twice over with a strip tool written in the scratchpad, one game frame, one perf run |
| friction | 5 | a heredoc with a long file died in bash and was written with the tool instead; `adopt` refuses a slot whose travel is the shipped wedge, and `drop` needs the directories still there — the DECIDED entry was written by hand |
| landing | 5 | `check:fast`, the commit, `land --keep` |

Bottleneck: **writing** — three candidates that all wear four markings is
one base and two helper files before any of the three can be drawn.

## 2026-09-12 · scheduler-tests — the failure modes `packages/net` survives, written down

Every behaviour the headers of `lockstep.ts`, `delay.ts`, `clock.ts` and
`desync.ts` claim, matched against the tests that prove it, and the eight with
nothing behind them written: a frame that arrives after its tick has been
simulated, a frame lost and sent again, the relay handing a device its own word
back, two presses from one seat on one tick, a phone that rebuilt its scheduler
while its partner kept playing, the same two rebuilding together, a pong that
overtakes one sent before it, the ahead-window measured in the caller's own
ticks, and the fingerprint ledger's depth from both sides of its boundary. The
link's failure modes have their own file now (`scheduler-faults.test.ts`), and
the ledger's tests moved out of `protocol.test.ts` into one. No defect: every
new test was checked by breaking the line it is about and watching it, and only
it, go red. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the four headers claim by claim, the 126 tests already there, `link-run.ts` and `link.ts` for what a rejoin is from each side, `start-gate.ts` for why the room throws beat zero away, `room.ts` for whether a relay can duplicate a frame |
| writing | 25 | `scheduler-faults.test.ts`, `desync.test.ts`, the two additions to `clock.test.ts` and `lockstep.test.ts`, the two queue entries |
| looking | 0 | nothing drawn |
| friction | 0 | — |
| landing | 10 | eight mutations of `src` to prove each new test bites, `check:fast`, the commit, `land` |

Bottleneck: **reading** — a documented behaviour is a sentence in a header, and
deciding whether the suite already proves one means reading every test that
touches the same field rather than searching for a name.

## 2026-09-12 · two-devices-wave — content's first wave, played to its end by two devices

FIRST STEP as `waves.ts` lists it, built the four ways `apps/game` builds a wave
and played over a delayed link with a different delay in each hand. The run stops
when the wave does — the `needWave` its clear produces, ten beats of a body
falling and about 975 ticks — and the two worlds are not compared by reaching
into both: every sixteenth tick each device fingerprints its own world, sends it
over the same wire the inputs cross, and puts the peer's through `HashLedger`, so
what the test asserts is the verdict the game would draw its DESYNC screen on.
Sixty checkpoints, sixty agreements each way, and the two hashes equal at the
end. The relay both two-device files drive is one file now
(`test/relay.ts`, carrying `hash` beside `input` and `confirm`, which is exactly
what `room.ts` relays); `packages/net` takes `@neon-spore/content` as a
devDependency to reach the wave list. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `buildQueue`/`buildPods`/`buildBoss` and how `apps/game/src/waves.ts` calls them, `startWave` and what a wave's opening holds, `wave-end.ts` for what "over" is, `determinism.test.ts` for how a readable input script is written here |
| writing | 20 | the wave test, the shared relay, the press script, the queue entry |
| looking | 0 | nothing drawn |
| friction | 5 | `@neon-spore/content` resolves nowhere until it is declared and installed, and the error names the import rather than the missing edge; `buildBoss` takes a column count the first draft did not pass, which `bun test` could not see and `tsc` could |
| landing | 10 | a fingerprint perturbed on one side to watch the ledger catch it, `check:fast`, the commit, `land` |

Bottleneck: **writing** — the script had to play the wave rather than fidget
through it, which meant choosing the beat the red shot goes out on so the run
covers the body's fall instead of ending on the first beat.

## 2026-09-12 · doc-drift — a document that names a file it has not got fails a test

`tools/index/drift.ts`' argument, applied to the spec: prose is hand-written and
worth keeping hand-written, so nothing regenerates over it, and the cost is that
it goes quietly wrong. `tools/test/doc-drift.test.ts` settles the three claims a
document makes that the tree can answer without reading the argument — 2,211
backticked paths under `docs/`, every field of `SimConfig`, and the `Files:` line
of every queue and parked entry. It caught **seven stale paths in five
documents** and **one undocumented core config field**, all fixed here. The
deciding half is `doc-paths.ts`, because the interesting question was never "is
this a path in the tree": the docs say `sim/hash.ts` and `render/glow.ts` on
purpose, so a literal check reported 147 healthy sentences and nine real misses,
and a shorthand resolver — segments in order, last segment the file name — got it
to nine. The other 138 were the docs being written the way they should be.
About 100 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `tools/index/drift.ts`, whether `tools/queue`'s own tests already checked a `Files:` path (`problemsIn` checks the shape, `stale.ts` checks the trunk when somebody runs the listing, nothing tests it), and then each of the nine misses in its own paragraph to see whether it was a rename, a removal, a hypothetical or a notation |
| writing | 40 | the test, `doc-paths.ts`, the 158-name allowlist and its header, seven doc fixes, `damageCreature`'s sentence under the damage table it belongs to, the `Asks:` entry with its three options |
| looking | 0 | nothing drawn |
| friction | 20 | three passes over the resolver before the false-positive rate was honest — `git ls-files` misses a file the same commit adds, `.gitignore`'d build outputs are not drift, fenced blocks are examples, and `docs/queue.md` quoting a field name made six undocumented fields read as documented, including the six in this lane's own entry |
| landing | 15 | five mutations of the tree to prove each check bites, the split at 258 lines, `check:fast` — which caught the new walk under `tree-walk.test.ts`' rule that anything recursing into directories names `.claude`, whatever directory it starts in — the commit, `land` |

Bottleneck: **friction** — every rule the check needed was discovered by reading
a false positive, and each one cost a full re-run over 54 documents to find the
next.

## 2026-09-12 · status-words — what the indicator may say, and the one pair of sentences that must differ

`packages/net/src/status.ts` was the only one of `net-change`'s six files with no
test, and the three functions in `apps/game/src/join-words.ts` that carry the
actual sentences — `explain`, `roomLine`, `chipText` — had none either;
`readyLine`, `seatWord` and `startButton` already had `start-press.test.ts`.
Twenty-five tests now hold what both headers claim and nothing held: the list of
eleven states is closed and this test knows all of them, no two states share a
word or a sentence, a word fits the chip, `linkIsFault` names the socket closed,
the room full and the two worlds parted **and never a stall**, `SOLO_STATUS`
reports no round trip rather than a round trip of nothing, and — the open
question 10 rule, which is why `join-words.ts` is a file at all — a quiet phone
and a dead line read differently on all three surfaces. No defect: `src` is
untouched, and each assertion was checked by breaking the line it is about.
About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `status.ts` whole, `join-words.ts` whole, what `start-press.test.ts` already covers so the new file does not repeat it, and open question 10 in both headers to find what the load-bearing claim actually is |
| writing | 20 | `packages/net/test/status.test.ts`, `apps/game/test/join-words.test.ts`, the two queue entries |
| looking | 0 | nothing drawn |
| friction | 5 | a coverage scan by file name said 262 render sources were untested, which is false — `frame.test.ts` reaches them transitively — so the scan was thrown away and the gap found by reading the package tables instead |
| landing | 10 | six mutations of `src` to prove each assertion bites, `check:fast`, the commit, `land` |

Bottleneck: **reading** — the tests worth writing were the two claims the file
headers make in prose and nothing enforces, and those are found by reading the
prose, not by looking at which exports have no assertions.

## 2026-09-12 · drop-designs-tab — the DESIGNS tab goes, and what it still held moves to MECHANICS

The NOT BUILT YET sheet's DESIGNS tab read `docs/versus.md`, `teaching.md` and
`alive.md` section by section as backlog. VERSUS is built and its file is a
manual; THE CALL is one design rather than a list; `alive.md`'s numbers were
overtaken (the bulb's depth is 0.24, the runt is retired, the throb rebuilt).
The tab, `design-docs.ts` and its test are gone; THE CALL and the three still-open
questions of `alive.md` are two entries under MECHANIC IDEAS in `ideas.md`, and
`alive.md` opens with a note saying it is a record. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the three documents against the shipped tree to see which of their claims still held |
| writing | 10 | the removal across five files, the two `ideas.md` entries, the `alive.md` preamble |
| looking | 0 | nothing drawn |
| friction | 5 | an edit script read the files in cp1252 and stopped on an em dash; rerun with `encoding="utf-8"` |
| landing | 5 | `check:fast`, the commit, `land` |

Bottleneck: **reading** — deciding what was stale meant checking each figure
in `alive.md` against `silhouettes.ts`, not just reading the file.

## 2026-09-12 · limpet-cycle — the director's dev server read `drawLimpetBody` as null

`creature-body.ts` builds its table of body draws at module load out of functions
it imports, and `cling.ts` and `creature-body-worn.ts` imported `drawLivingBody`
back from it — a cycle. The bundle entered from the table's side and never
noticed; `bun run dev` entered from `canvas2d.ts` through `cling.ts`, and the
table was built while `cling.ts` was still evaluating. `drawLivingBody` is its
own module now, and `body-table-cycle.test.ts` holds the table out of every
cycle. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `cling.ts`'s imports, who reaches `creature-body.ts` |
| writing | 10 | `creature-body-living.ts`, the four import changes, the test |
| looking | 5 | the director from this tree on 4387, console clean, the stage drawn |
| friction | 10 | `preview_start director-once` served the main checkout, as the lane skill says it does; the tree's own server was run by absolute path under `timeout` instead. A scan script's import regex matched across two lines |
| landing | 5 | lint, the index row, `check:fast`, the commit, `land` |

Bottleneck: **friction** — starting a worktree's director for a look has no
supported route; `.claude/launch.json` starts the main tree every time.

## 2026-09-12 — test-view-band — the TEST view is the game's own dimensions

The owner: the director's TEST view had a taller ship and black at both
sides, and should be the same stage and the same ship as P1, P2 and the game,
always. One band share for every role (`bandSoloPct`); `bandPct` removed with
its slider rows. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `stage.ts`, `stage-point.ts`, `layout.ts`, `panel-plan.ts`, every `bandPct` reader |
| writing | 5 | `bandHeightFor`, the field and its two slider rows, the comments, the test's wider canvas |
| looking | 10 | `bun run shot` of the GAME column in TEST and P1, then SALVAGE in TEST for both seats' lobes in the shorter band |
| friction | 5 | the browser pane's screenshot timed out twice; `bun run shot` against the tree's own director instead |
| landing | 5 | `check:fast` (one test assumed the narrower stage), the commit, `land` |

Bottleneck: **looking** — a shot of `#stage` is clipped to the wrong box, so
the column had to be photographed instead, and a `--wave` for a wave with
buttons on both seats had to be found by listing the control sets.

## 2026-09-12 · the-weight — a body two thumbs crush, and neither thumb can see the other

THE WEIGHT off `docs/spec/transfers-bosses.md`, built as the owner asked for it:
an ordinary arrival rather than the five-state boss on that page. A sac sinks a
lane a beat, no bolt reaches it and the shield has nothing to say to it, and it
gives to a hand from **each** seat on the body itself held together for
`weightCrushMs`. The hand is the ordinary `grip` — `handMeans` gains `"press"`,
the third thing a hand can be and the first worth nothing without the other
seat's — so nothing new crosses the wire. The whole creature is in what each
screen does *not* draw: a thumb brightens the body on that seat's screen and on
nothing the other phone shows, so neither player can tell whether their partner
has arrived and the only thing that lands two thumbs on one body is one of them
counting out loud. THE BALLOON is the contrast and it is drawn as one: its two
pulls are on both screens, and what the pair says there is *which*; here it is
*when*. Wave 66 in act eight teaches it in three steps, the first of which is the
pair pressing separately and losing the wave to it. About 150 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 35 | the spec's five-state boss, `grip.ts`/`hand.ts`/`grippable.ts` for what a hand already means, `balloon-pull.ts` for the only other two-hand body, `shot-reach.ts` and `hull.ts` for what an arrival can refuse, and `ViewState.role` for how a seat-private picture is drawn |
| writing | 65 | `weight.ts` in sim and in render, `config-weight.ts`, the silhouette off the slumped draft, the six tables the skill names and nine more the compiler found, the wave and its guide, 23 tests across sim and render |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 30 | `world.score` had gone from `World` on the origin/main this lane started from, so the creature's score field was deleted before it existed; `creature-kinds.ts`, `living-look.ts` and `ship-notes.ts` were all *exactly* at the 250-line wall, so one row each forced two file splits and a trim; and the shape's dent read as a third lobe on some frames, which `nameability.test.ts` caught and cost three measurements to settle |
| landing | 20 | ten table and count failures found by `check:fast` and fixed one at a time, `perf --unmeasured` for the wave's row, the commit, `land` |

Bottleneck: **friction** — three of the files a creature has to touch were at
the line limit to the row, so adding a body meant choosing two seams that had
nothing to do with the creature.

## 2026-09-13 · the-codex — a fault that takes nothing away and changes what everything means

THE CODEX off `docs/spec/ideas.md`, built as the owner asked for it: a **fault on
a wave** rather than the boss that page imagined. While its key is turned over a
bolt fired red kills what cyan kills, and nothing about the shot says so — the
bolt that leaves the muzzle is the colour the thumb pressed, it sounds like that
colour, and the lobe lights like that colour. What says the key is over is the air
across the field travelling in slow bands, on the **pilot's** screen and on
nothing the navigator sees, so the seat that can read the key cannot fire and the
seat that fires cannot read it. The key turns over every `codexHoldBeats` — four,
a bar — so it is a thing one of them keeps calling rather than a sentence said
once. Wave 67 in act eight is eight ordinary bodies in pairs that straddle the
turn, and it opens swapped. About 120 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `malfunction.ts` and the three faults already there, `fault-emitter.ts` and `fault-beam-ends.ts` for how a fault's cause is drawn, `view-role.ts` for the split, and every colour comparison in the simulation — twelve of them — to find out where a swap belongs |
| writing | 55 | `sim/codex.ts` and `render/codex.ts`, `Bullet.shown`, the swap at the muzzle, the fault's row and its wave, the spec note in the bestiary, 17 tests across sim and render |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 25 | the swap wanted twelve edits and got one: `Bullet.shown` against `Bullet.color` moved it to the muzzle, where every comparison downstream is right by construction. Then taking THE CODEX off the ideas list broke five things that read the backlog off the spec — a shape-sheet draft offered to it, a field scene drawn at it, the catalogue's draft count, and two director tests — each of which had a precedent to follow (The Mother's `free`, THE CHOIR's cut bullet) and had to be found |
| landing | 25 | `midCol` re-derived and caught by `copies-table.ts`, a guide line 34 characters too long, `mechanics.ts` one line over its limit, `perf --unmeasured` — and then the full check found a real defect in `bun run land` itself: `filesLine` hung ", and 46 more" on the end of an unverified entry's `Files:` line, which `splitFiles` reads as a path, so every truncated entry it had ever written was marked **stale** in `bun run queue` from the moment it was written. The count is in the body now, and the entry already on the trunk is repaired |

Bottleneck: **friction** — the mechanic itself was one function; what cost the
afternoon was that an idea leaving `docs/spec/ideas.md` is read by the shape
sheet, the director's backlog and two test suites, and none of them says so where
the bullet is.

## 2026-09-13 · the-cairn — a boss taken apart by hand, into the rocks it is made of

THE CAIRN off `docs/spec/transfers-bosses.md`, built as the boss that page
argues for rather than as an arrival taken out of it: seven of the field's own
two-tile rocks in one outline five columns wide, standing still, and nothing
either control does reaches it — a bolt goes up one of its lanes and **past** it.
A grip carried sideways drags one unit out of the side the finger went and it
falls as a plain rock, so the boss comes apart into the game the pair already
knows and the whole fight is rate: every answer is a rock the navigator has to be
under. The page's one open question — what stops a pair pulling nothing and
waiting — is answered without the descending pile it feared: a stack that has
stood `cairnShedBeats` lets one go itself into a column the rng drew, announced
on **player 1's screen alone**, so a pull is *you choose an edge* and a wait is
*the pile chooses the middle*. Wave 68 in act eight. About 140 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | the two design pages, `boss.ts`/`boss-state.ts`/`wave-start.ts` for how a boss is installed, `grip.ts`, `hand.ts` and `grip-push.ts` for the gesture that was already there, `span.ts` and `meteor.ts` for what size a rock actually is, and THE WEIGHT's whole diff as the pattern for a body two hands answer |
| writing | 70 | `sim/cairn.ts` and its state, the boss entry, the install, the shed clock, `render/cairn.ts` and `cairn-settle.ts`, the wave and its guide, rows in eleven tables the compiler named one at a time, 17 tests across sim and render, and the four spec pages |
| looking | 0 | nothing looked at — a cloud session cannot, and it is named below |
| friction | 20 | the design page asks for units at the size the game draws a rock **and** for a pile wider than the Warden, and the two do not both fit: seven two-tile rocks come to five tiles across, so the span came out at five and the courses at four, two and one. Finding that out cost three goes at the arithmetic before the rule that had to win was obvious. Then `isBossBody` turned out to answer two questions — *does not fall* and *takes no hand* — and this is the first body that is one and not the other |
| landing | 20 | `creature-kinds.ts`, `boss-state.ts` and `ship-notes.ts` each a row over the 250-line limit, two of them fixed by cuts `packages/content` had already drawn; a guide line seven characters too long; a bolt test whose window was so long the pile shed a rock in the middle of it |

Bottleneck: **writing** — the rules are one file and the fight is one sentence,
but a new `CreatureKind` is a row in eleven tables and a new boss is a row in
six more, and the compiler names them one at a time.

## 2026-09-13 — well-boss — THE WELL: the field turned inside out, on one phone

The owner asked for the idea on `docs/spec/ideas.md` by name, as a boss wave.
Both of the questions that page left open were answered by building it: it is a
boss rather than a modifier wave, and **one phone flips** — the pilot's, because
a well on both screens is a skin on the field with nothing for the pair to say.
Nothing in the simulation changes: `WellState` is a tag, there is no `stepWell`,
and a test plays the same wave twice from one seed, with and without the boss,
and compares the two worlds tick by tick. What changes is `packages/render`,
where five new files draw the columns as the hours of a clock, the rows as rings
closing on the ship, and the seam above it where the field's two walls meet.
Wave 69 in act eight. About 65 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the idea and the two pages that argue about it, `boss-entries.ts`/`boss-state.ts`/`wave-start.ts` for how a boss is installed, then the whole of the frame — `canvas2d.ts`, `frame-field.ts`, `frame-ship.ts`, `creature-place.ts`, `effects.ts` — because the question this boss asks is *where is a body drawn*, and the answer turned out to be `tileCX`/`tileCY` in 76 files |
| writing | 25 | `render/well.ts` and its three draw files, `sim/well.ts`, the wave and its guide, rows in nine tables the compiler named one at a time, 17 tests across sim and render, `bosses.md` 11.12, and five queue entries |
| looking | 5 | three `bun run frames` of the pilot's screen and one of the navigator's; the first said the lanes were invisible against the rings and the second that a body arriving sat on top of its own numeral |
| friction | 5 | `packages/sim` may not import `packages/content`, so the sim test authors its own queue; `effects.ts` and `ship-notes.ts` were both on the 250-line ceiling, and the second needed a cut (`ship-notes-boss.ts`) before a two-line note would fit |
| landing | 15 | the full check, the commit, and `bun run land` |

Bottleneck: **reading** — the projection itself is forty lines of trigonometry,
and finding out how much of the frame it could honestly replace meant reading
the whole field pass first. The thing that made it affordable was that a body
draw already takes an `x` and a `y` (`creature-body.ts`), so every silhouette in
the game came round the clock for nothing.

## 2026-09-13 · watch-cloud-waves — four waves the cloud landed, watched at tempo on a real machine

The cloud session that built THE WEIGHT, THE CODEX, THE CAIRN and THE WELL
could prove its tests and nothing about the frame, so it queued the four as
*unverified*. This lane opened each wave in the preview, drove it through the
testing handle, and photographed it with `bun run frames`. Two of the four
were wrong: a hand pressing THE WEIGHT was drawn on the partner's phone, giving
away the split the boss is built on; a hand pulling at THE CAIRN was drawn
under the pile and said AIM. Both fixed, both tested; THE CODEX and THE WELL
observed and left as they are. About 130 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `briefing.ts` for the intro timer and READY? gate, `keys.ts` for why ArrowRight jumped waves, `grip.ts`/`frame-field.ts` for the draw order, `boss-draw.ts`/`cairn.ts` for where the pile is clipped |
| writing | 30 | the `press`/`pull` skips in `drawGrips`, `cairn-hand.ts` drawing the ring round the standing stones from the boss pass, the `grip-beam.ts` split that kept `grip.ts` under the line, three tests and two INDEX rows |
| looking | 45 | fourteen frames across the four waves, at both seats, before and after each fix; three `bun run perf` runs the machine flagged every time |
| friction | 15 | guide pages did not turn under `send` until `advance(2)`; a `--press` at tick 60 landed on an empty field; a probe test at the repo root could not resolve `@neon-spore/content`; the cairn commit went through with `grip.ts` at 264 lines because a `tail` hid the check's exit code |
| landing | 10 | `check:fast` twice, one amend, the queue and this entry, `bun run land` |

Bottleneck: **looking** — a wave the cloud built has to be *seen*, at each
seat, in the state where the defect would show, and the only way to that state
is to drive the game there frame by frame; the fixes themselves were an hour
of the four.

## 2026-09-13 · queue-lanes — an entry reserved for a cloud or a local session, and six of them written for the cloud

The owner wants to hand work to a cloud session from his phone and keep some
for a machine with a screen, so the queue learns a `Where:` line: `cloud` or
`local`, marked in the listing, passed over by `next` and refused by name to
`take` when the session is the other kind — known by `CLAUDE_CODE_REMOTE`,
the signal the web image already sets. Then six entries for the cloud, all
his: two phones that reconnect on different waves, the menu's front page
(PLAY, one CONTINUE, TESTING behind three presses on the spore), a readable
colour scheme and face, a sign-in in place of the recovery code, nicknames
where the game says Player 1 and 2, and a difficulty. About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `queue.ts`, `run.ts`, `claim.ts` for the shape a field takes; `session-start.ts` for how a cloud session is known; then `menu-entries.ts`, `menu-link.ts`, `nickname.ts`, `names.ts`, `desync.ts`, `protocol.ts` and `config.ts`, so that each entry names real files and the right knob (falling speed is `bpm`) |
| writing | 20 | `where.ts`, the field on `Item`, the three places in `run.ts`, seven tests, the queue's preamble and `cloud-session.md`, and the six entries |
| looking | 0 | nothing drawn |
| friction | 25 | a heredoc longer than the shell would take, twice; `queue.ts` two lines over the limit; two titles over 80 characters; then `main` red under the lane — the owner's director save of FIRST STEP had broken the perf baseline's row and the lockstep test's hand-written script, and both were fixed here so the lane could land (queued: the save should do the first itself, and the test should own its wave) |
| landing | 10 | `check:fast` twice, the commit, `bun run land` twice |

Bottleneck: **friction** — a trunk that went red under the lane by a
commit no check had seen; the tool change itself was twenty minutes and the
six entries another twenty.

## 2026-09-13 · director-repeat — a cleared wave on the stage stops and asks REPEAT WAVE?

The director's stage used to rebuild the wave the instant it cleared, so the
author never saw it clear. Now it pauses under a grey veil that says REPEAT
WAVE?, and a click anywhere on the screen — or P, which the PAUSED line under
the veil still names — runs it again from the top. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `stage.ts` for `needWave` and the transport, `stage-afterrun.ts` for the injected shape a stage helper takes and its test |
| writing | 10 | `stage-repeat.ts`, the veil in `index.html` and `director-field.css`, the wiring and two trims that kept `stage.ts` on its line, five tests |
| looking | 10 | the director launched by absolute path in this tree, the wave cleared by hand through `neonSporeDirector`, the veil seen up over the stage and answered by a click and by P |
| friction | 5 | `.claude/launch.json` started the *main* checkout's director, as `working-with-claude.md` says it will; `bun run dev` is refused to a session by the guard, so the server was `tools/director/server.ts` by absolute path |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **looking** — getting a director that serves *this* tree in front
of the browser pane took as long as writing the feature.

## 2026-09-13 · meteor-reflected — a deflected rock keeps the look it fell in

The bounce off the shield, and the replayed last step of a fall, drew a grey
stone from before the rocks had looks; the field had been drawing that same
rock as a blaze, a comet or a smoulder by its own id. The deflect and breach
events now carry the body's seed and pits, and both effects draw it with
`drawRockBody` — the torch alone keeps its grey stone and ember ring. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `deflect.ts`, `rock-impact.ts` and `effects-breach.ts` for where the grey came from; `meteor-looks.ts` for how the field picks a look |
| writing | 10 | seed and holes on the two events and their three emitters, the two effects, the split of `deflect-stone.ts` and `rock-impact-state.ts` that kept both under 250 lines, four stale tests rewritten to prove the bounce's ops are `drawRockBody`'s |
| looking | 5 | THE ROCK photographed at three ticks with a guard press, the bounced rock seen orange and faceted under DEFLECTED |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — two files that were already on the line had to be
split before the fix would fit.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER, the fifth malfunction

The owner asked for a control-set malfunction that swaps the two players'
controls at a set beat and gives them back at a set beat. `docs/spec/ideas.md`
already held it as **Handover**, unbuilt over three questions, and all three are
answered by building it: the radar travels with the controls (it is the same
screen), a queued shield move survives (nothing in the simulation moves at all),
and whether it reads as exciting is still a question for a prototype. Nine beats
in, the two panels change screens; eight beats later they come home; both phones
are counted down to it and counted back out of it. The substitution is one
function called twice — the renderer seats a frame, the host seats the layout a
finger is tested against — and every per-seat fact in the game travels with it.
Wave 70 in act eight. About 90 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `malfunction.ts` and the four faults already there, `codex.ts` for the shape of a fault that takes nothing, then the whole input path — `touch.ts`, `input.ts`, `lockstep.ts` — to find out what "swap the controls" can honestly mean on a wire, which is where the line between a *panel* and an *identity* came from |
| writing | 35 | `sim/handover.ts`, `render/handover.ts` and `handover-look.ts`, the beam's own branch, three config numbers, the wave and its guide, rows in six tables the compiler named one at a time, 22 tests across sim and render, the bestiary's section, and four queue entries |
| looking | 10 | three `bun run frames` of the pilot's screen; the first said the beam was a bar down the middle column with the bodies behind it, so the fault lands on the band twice now, once for each seat's half |
| friction | 10 | four files sitting on the 250-line ceiling before the edit (`canvas2d.ts`, `mechanics.ts`, `stage.ts`, `act-8.ts`); `window` is a banned word in `packages/sim` and the window function had to be called something else; and a comment written beside the wave was deleted by the director's own serializer, which regenerates every act file below the array |
| landing | 15 | the full check, the commit, and `bun run land` |

Bottleneck: **reading** — the mechanic is thirty lines and finding out *where*
it was allowed to live took the whole input path. The thing that decided it:
`lockstep.press` refuses a press attributed to the peer, so the wire's two
identities cannot trade — only the panel can, and the simulation never learns
that anything happened.

## 2026-09-13 · queue-the-weights-guide — THE WEIGHT's rehearsal

Queue item: the wave that introduces THE WEIGHT carried three lines of prose
and no `scene`, for a lesson that is a negative. Four pages now: each seat's
thumb alone on the sac and nothing giving, both on one beat and the calipers
closing, and a second sac left alone reaching the hull. On the way, `bun run
frames --opening guide` turned out to run two film ticks per count — the
frozen `paint` wrapper dropped `dt` — which is fixed in its own commit. About
30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry, `new-tutorial`, THE BALLOON's and THE MAGNET's films, `weight.ts`, the page-position test |
| writing | 5 | `scenes/the-weight.ts`, the wiring in `scenes.ts` and `act-8.ts` |
| looking | 10 | a probe printing the film tick by tick to place the pages; the pilot's page and the crush photographed |
| friction | 10 | every guide capture came back past the moment asked for, until `freezeClocks` in `tools/frames/page.ts` was found dropping the frame's `dt` |
| landing | 5 | `check:fast`, `bun run index`, the commits, `bun run land --keep` |

Bottleneck: **friction** — a camera that photographed twice the tick it was
asked for cost as long as authoring the film.

## 2026-09-13 · queue-the-cairns-guide — THE CAIRN's rehearsal

Queue item: the wave that introduces THE CAIRN carried prose and no `scene`,
for a gesture the game had taught only on a falling rock. Five pages now: a
still thumb on the pile and nothing happening, the thumb carried right and a
rock falling, the pilot alone watching the lane the pile will drop into, the
navigator's dome under the pulled rock, and the rock nobody pulled reaching
the hull. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `cairn.ts`, `grip-push.ts`, THE HAND's film for a carry authored on a running hold, `dragSeat` |
| writing | 5 | `scenes/the-cairn.ts`, the wiring |
| looking | 5 | a probe of the film tick by tick — the first draft's carry was the navigator's and `dragSeat` sends every carry as the pilot's, so the hand became the pilot's; two pages photographed |
| friction | 0 | — |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **reading** — finding that a film's carry is always the pilot's
took the one probe run that showed the pile ignoring the hand.

## 2026-09-13 · queue-the-shape-sheets-cairn-card — the CAIRN card takes the field's stack

One stack table for THE CAIRN, in `content/cairn-shape.ts`, read by
`render/cairn.ts` and the shape sheet's `pile()` alike: four stones on the
ground, two, one. The barrel it was exported through was already at its
250-line limit, so the content barrel was split by subject like the sim's,
the shapes into `index-shapes.ts`. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `cairn.ts`'s courses, `pile.ts`'s own, `collected.ts`'s PULLED card |
| writing | 5 | `cairn-shape.ts`, the two callers, the PULLED unit pulled right |
| looking | 5 | `shapes:still all "THE CAIRN"`, rasterised and cropped — four, two, one |
| friction | 5 | `content/src/index.ts` one line over the limit; a long-axis count moved with the card |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **friction** — a barrel at its limit turned a one-line export
into a split by subject.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the menu's front page is four rows

Queue item, the owner's, six changes to the menu in one lane because each moves
a row the others move too. The front page is PLAY, HOW TO PLAY, SETTINGS and —
while there is a room — LEAVE ROOM. RESUME and CONTINUE are one row that means
all three things it can mean; CONTINUE is offered only while both phones are in
the room, and with nothing played yet it is the room's own START, so a press on
one phone cannot begin a wave on one of two. The seat cards and the room's code
moved onto the PLAY page, WHAT THIS IS moved to the top of HOW TO PLAY, and the
rig lost its row: three presses on the spore over the wordmark open it. About
55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the six menu files and the two that answer them (`shell.ts`, `link.ts`), and then `lockstep`'s ready handshake, because the honest question under item 2 is what a CONTINUE in a room is *allowed* to do |
| writing | 25 | the three lists and their keys, the PLAY page, the spore's counter, `paintLink`'s new rules, `menu-door.ts` to get `menu.ts` back under 250 lines, and 14 tests that drive the real lists rather than reading them |
| looking | 0 | none — a cloud session cannot see the page, which is what this item's own note says |
| friction | 5 | `menu.ts` was at 264 lines after the edit and had to be split before anything would build |
| landing | 15 | `check:fast`, the commit, `bun run land` — once red on THE CURTAIN, landed that morning with no look yet |

Bottleneck: **writing** — the six changes are one shape, so they land together or
not at all, and the keys are what hold the whole thing up: a row is addressed by
`setEntry` from a file that does not know which page it is drawn on, so moving a
row between pages is a rename everywhere or it is nothing.
## 2026-09-13 · queue-the-well-draws-none-of-the-fields-transients — the well draws what was placed

Every transient placed at a pixel when its event arrives — the burst table,
a breach's and a deflection's bursts, a kill's sprite, a pod's implosion —
now goes through one `put` (`wellFromFlat` on the well, identity on the
flat field) and the well's pass draws the sparks and the sprites. The half
that asks `creatureCenter` each frame is queued as its own lane. `effects.ts`
went over its limit again, so `ingest` moved to `effects-frame.ts` beside
the other three verbs. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `well-draw.ts`, `effects.ts`, `effects-ingest.ts`, `effects-breach.ts`, `effects-body.ts`, the well test |
| writing | 5 | `put` in `ingestAll` and `IngestOneCtx`, `spawnSprite`, the two draws, three tests |
| looking | 10 | strips of THE WELL around a kill and around the breach at tick 1200 — the authored columns are `mapCol`'d, so the cannon goes to column 5 for the first body |
| friction | 5 | `effects.ts` at 263 lines: `ingest` moved out as `ingestAll` |
| landing | 5 | `check:fast`, the queue entry for the other half, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **looking** — finding the tick the breach fires took a probe;
the frames tool cannot say when an event happened.

## 2026-09-13 · queue-a-crossing-rock-has-no-blip — the crossing rock's mark in the seam

A rock that will come over a side wall is now announced on the well: in the
seam, on the circle of the row it will hold, its head just past the wall on
its side and its tail back across the seam, pointing the way round it will
fly. `drawWellArrivals` moved to `well-arrivals.ts` with it, on
`well-draw.ts`'s line limit. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `radar-blip.ts`, the flat mark in `field.ts`, `rockEntryCol`, the well's polar helpers |
| writing | 10 | `well-arrivals.ts`, four tests |
| looking | 5 | THE WELL with two crossing rocks put in its queue for the picture only — the mark at one o'clock, the rock on the same circle at half past three, the second mark at eleven |
| friction | 0 | — |
| landing | 5 | `check:fast`, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: **writing** — the arc's sense: canvas angles run the other way
from the clock's, and the tail was drawn the long way round once.

## 2026-09-13 · claude/queue-the-wells-screen-answers-no-finger-on-the-field — THE WELL's screen answers a finger on the ship and on a body

The well drew the hull as a ring and the bodies round it, and `touchDown`
answered every press against the flat field, so a thumb on the drawn cannon
took nothing and a thumb on empty space took a body. `touch-well.ts` asks the
same two questions of the circle: the cannon's grab circle at its hour on the
hull ring, a body at `wellPlace` with the well's glide, the column under a
finger as the hour under it, the seam at twelve as a wall. `touch.ts` and
`touch-ship.ts` both sat at the line limit, so `lobeUnder` went to
`touch-lobe.ts` and the lift rules to `touch-hand.ts`. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `touch.ts`, `touch-ship.ts`, `well-draw.ts`'s body placement, `well.ts` |
| writing | 25 | `touch-well.ts`, the `well` marks on the holds, twelve tests |
| looking | 0 | nothing visible moves in a still frame — the change is what a press answers |
| friction | 10 | two files over the limit at once, a CRLF write, a five-argument `touchMove` the tests ran but the typecheck refused |
| landing | 10 | `check:fast` twice, `bun run index`, the queue entry for the hand ring, the commit |

Bottleneck: **writing** — the file limit: the well's answers were a fourth
file's worth on top of two files already full, and both had to be split before
the new one fitted.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — two phones that parted start again together

Queue item, the owner's, from a two-device game where a phone dropped its
socket and came back and the two of them were afterwards on different waves
with nothing on either screen saying so. Now a parted run brings the menu up on
the PLAY page on both phones, CONTINUE stops meaning *back to the field* and
starts meaning *the room's START*, and two presses stamp a fresh beat zero — on
the wave the room says the pair reached, with that wave's guide if it has one.
About 70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `link.ts` and `link-run.ts` for where a parting is noticed, `room-start.ts` and `start-gate.ts` for what a press is worth, `desync.ts` for whether a reconnect can report a false one, and `waves.ts` for what already opens a guide |
| writing | 30 | the wave on `onStart`, the room's mark actually being kept, the restart in `pressStart`, the menu opening on the parting's edge, CONTINUE's three lines, `menu-bindings.ts` to get `menu.ts` back under 250, and six tests across the app and the real Durable Object |
| looking | 0 | none — a cloud session cannot open two phones, which is what this item's own note says |
| friction | 10 | a room code with a B in it is not a room code (the alphabet drops every lookalike), which read as a hung test and took the shared relay down with it; and a wait counted off one phone's message tally applied to the other's |
| landing | 15 | `check:fast`, the commit, `bun run land` — once red on THE CURTAIN, landed that morning with no look yet |

Bottleneck: **reading** — the change is small in every file it touches and the
question underneath it is not: *what may one phone's press do to two worlds*.
The answer was already in the room — two presses and only two presses stamp a
beat zero — so the work was letting that rule run a second time rather than
writing a new one.

## 2026-09-13 · claude/queue-the-wells-guide-is-prose-and-the-picture-it-desc — THE WELL's rehearsal shows the fold

Four pages and one body: the navigator's flat field with a red body coming
down the fourth column, then the pilot's clock with the same body at four
o'clock — the seat switch is the fold, because the film lays each page out
for the seat it shows and the well is only drawn on the pilot's — then the
navigator's shot down the same lane, then the seam, the cannon carried from
one o'clock to eleven the long way round. The caption's `body` anchor placed
its ring from the flat field, so on the pilot's page it would have stood in
the empty middle; the well's body placement is now one call, `wellBodyAt`,
shared by the drawing, the finger and the caption. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the tutorial skill, THE CAIRN's film, `caption-anchor.ts`, `guide-film.ts`'s per-seat layout |
| writing | 15 | `the-well.ts`, `wellBodyAt`, the anchor's well branch, two tests |
| looking | 5 | page two through `bun run frames --opening guide --guide-page 1`: the ring on the body at four o'clock |
| friction | 10 | the fall rate (a row every two beats, not one), the hit-needs-a-page rule, a caption a character long, `startWave` taking an index |
| landing | 5 | `check:fast`, `bun run index`, the commit |

Bottleneck: **friction** — timing a film against the real fall: the page
boundaries were laid out for a row a beat and had to be doubled once the probe
showed where the body actually was.

## 2026-09-13 · claude/queue-should-the-wells-seam-cost-travel — the seam does not cost travel, decided

A question item, answered before the sitting began: the owner chose *leave
it* from the three the entry named, so THE WELL stays a pure projection and
no step limit goes into `config-boss.ts`. The item is closed and the spec's
sentence that pointed at it as an open question now records the answer. No
code. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | the sentence in `docs/spec/bosses.md` |
| looking | 0 | — |
| friction | 0 | — |
| landing | 0 | `queue done`, the commit |

Bottleneck: **none** — the answer was already in hand.

## 2026-09-13 · claude/queue-the-cairn-paints-at-two-and-a-half-times-the-run — a burning rock holds the gradients that never move

The render-perf lane on THE CAIRN. The pile was measured alone with the stub's
tally, which showed where the frame goes: seven full fires under one clip,
about 1,600 ops for the pile and a third of the run's gradients built fresh
each frame for arguments that never change. The identical half — gradients
whose every argument is `r` and a constant, held between frames — landed with
a `wave-budget.test.ts` row pinning it; the structural half is a look
question (the pile frozen per `units`) and went to the owner, and the exact
cull of clipped primitives is queued. Two log-comparison tests had to start
cold once a second draw at one radius logged fewer gradient builds than the
first. About 60 min across the break.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `cairn.ts`, the three looks, `rock-wake-fire.ts`, the render-perf skill |
| writing | 20 | `gradient-held.ts`, the four callers, the budget row, the queue entry |
| looking | 10 | the tally before and after, the ordered log diff |
| friction | 15 | a Python heredoc that ate its own backslashes; two tests comparing a warm draw to a cold one |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **friction** — the log-comparison tests were written before any
gradient outlived a frame, and finding why a warm second draw differed took
longer than the fix.

## 2026-09-13 · claude/queue-a-director-save-can-land-main-red-and-two-tests — a save marks the baseline, and the lockstep test owns its waves

Two halves. The save now runs `bun run perf --unmeasured` in a fresh `bun`
between the write and the commit — in-process it would read the `WAVES` the
director loaded at start-up, not the files just written — and offers
`tools/perf/baseline.json` to the commit, which takes it only if it moved;
`DIRECTOR_NO_COMMIT` turns both off together. The lockstep test stopped
reading `WAVES[0]` and `WAVES[1]`: it carries two small waves of its own
through `queueFromWave`, and its press script shrank from thirty-three presses
to thirteen with the wave it was actually about. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `waves-commit.ts`, `waves-api.ts`, `unmeasured.ts`, `run.ts`, the test |
| writing | 15 | `waves-baseline.ts` and its test, the wiring, the test's two waves, `performance.md` |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — the press script had to be cut back to the presses
that were about the one body, and the tick the boundary falls on found again.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the menu's colours, named and measured

Queue item, the owner's: the menu is hard to read on a phone. It was — a
tagline at 3.8:1 and a description at 2.2:1, purple on purple at ten pixels.
`menu.css` now opens with one block of named tokens, each with the job it does
and its ratio against the ground beside it, and every colour in the file is one
of them. The two the owner could not read are gone; nothing on the page is
under 8:1. The face is Space Grotesk from Google Fonts, swapped in over a real
stack, with the field's Courier left alone. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `menu.css`'s eighteen hexes and where each is used, `build.ts` for what the bundler does to a `<link href>`, and `game.css` for the line this must not cross |
| writing | 15 | the token block, the eighteen substitutions, the face and its two preconnects, and a test that measures every ink token out of the file |
| looking | 5 | `bun run build:game`, to see whether an absolute URL survives a bundler that hashes every link it can follow — it does, and the built page carries it |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the substitution is mechanical and the decision under
it is one line long: what a colour is *for*. Every token is named for a job, so
the next lane picks a value by asking what it is writing rather than by matching
a purple.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the two people's names, where P1 and P2 were

Queue item, the owner's: the game called the two seats P1 and P2 in the three
places a person reads one mid-wave, and he wanted the nicknames there. The
siren's chip says the name and grows to it, the word under a hand says it, and
a rehearsal's caption says it — by substitution on PLAYER 1 and PLAYER 2 rather
than by teaching two hundred content strings a template. The menu's seat cards
say who is sitting in each. A hyphen is a letter now, because Anne-Marie is a
name. Everywhere a name is missing, every one of them draws exactly what it
drew before. About 55 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `siren-seats.ts`'s fixed pill and the arithmetic the whole cluster hangs off it, `grip.ts`'s measured plate, `guide-caption.ts` for where a caption's words come from, and `seat-name.ts`, which had the mechanism already |
| writing | 30 | the pill sized to its label, the cluster laid out from two widths, the names threaded down four draw chains, `withNames`, the seat cards, the hyphen, and 17 tests over four pure functions |
| looking | 0 | none — a cloud session cannot see a chip, which is exactly what this one changes the size of |
| friction | 5 | `packages/render` may not import `@neon-spore/net`, so the test that measures a chip against the longest name writes the twelve out and says why |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the substitution is four lines and the geometry under
it is the work: a pill that was 34 pixels wide in six expressions, one of them
exported and read by the director.

## 2026-09-13 · claude/queue-the-map-editor-inserts-a-beat-row-and-removes-on — a beat row opened and a beat row taken out

The owner's two buttons on the map. `insertBeat` and `removeBeat` are the
edits, in `paint.ts` beside the others; the labels grew two glyphs on hover
and moved to `grid-rows.ts` when `grid.ts` went past the line limit with them
in it. A removal of a row with something on it asks in plain words first.
Checked in the browser against the worktree's own director: the glyphs show
on hover beside the number, an insert at beat 4 moved FIRST STEP's seven later
bodies down one, an empty row's remove brought them back, and the remove of a
full row asked and, refused, changed nothing. One deliberate departure from
the entry: beat 0 can be removed too, since an insert before it would
otherwise have no way back in an editor with no undo. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `paint.ts`, `grid.ts`, the map's css, the selection |
| writing | 15 | the two verbs, `grid-rows.ts`, the css, the tests |
| looking | 5 | the director in the browser, the PNG |
| friction | 0 | — |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — the label was a button, and a button may not hold
buttons, so the label and its verbs became a file of their own.

## 2026-09-13 · versus-cairn-pile — THE CAIRN's pile is a record, and two frozen piles stand beside it in VERSUS

The owner's answer to the pile question — VERSUS. `cairn.ts` split three
ways: the geometry (`cairn-units.ts`), the shipped picture (`cairn-pile.ts`)
and the record between them (`cairn-look.ts`, `CAIRN_LOOK.pile`); the tell and
the hand read the geometry file directly. Two candidates on `cairn:pile`:
STILL bakes the shipped seven fires once at one instant, BANKED bakes grey
stone once and keeps only the heat live, an ember glow inside the outline and
the seams breathing. A pose of the pile standing whole (`poses-cairn.ts`,
`CAIRN · THE PILE`, a tile crop seven wide on the middle stone) and its row.
BANKED's first shot had the glow washing every stone to white; it is a tenth
of that now and the seams carry the colour. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the candidate format from git history, the pose kit, the pose test, `baked.ts` |
| writing | 20 | the split, the two paints, the pose, the row |
| looking | 5 | the two versus shots |
| friction | 5 | a glow that made grey stone white, reshot once |
| landing | 5 | format, check:fast, index, the commit |

Bottleneck: **writing** — two bakes that are nearly the same twenty lines,
kept apart because `adopt` moves a candidate's own siblings and nothing at the
slot's level.

## 2026-09-13 · claude/queue-creaturecenter-assumes-the-flat-field-so-the-wel — creatureCenter answers for the well

`creatureCenter` and `creatureRadius` take the world now and ask `wellShown`
before placing, so every mark drawn around a body — the hand's ring, the lock
corners and their line, a shell's clasp, a rind's shed, a coil's charge —
stands on the body where THE WELL draws it, at `WELL_BODY` of its flat size.
`wellBodyAt` moved to `well-body.ts` to break the import loop with
`well-draw.ts`; the touch layer keeps `flatCenter`/`flatRadius` by name
(`creatureAt` moved to `creature-under.ts`). `drawWellBodies` draws the grips,
the lock marks — radial on the well, from the cannon lobe straight to the body
(`wellLockLink`) — and `bodies.drawOnBodies` after the bodies. The proof is a
grip by p1 in a well world whose added arcs all sit at `wellBodyAt` and none at
the tile. Thirty-odd call sites threaded the world; `strand-bead.ts` went over
the limit and lost its raisin to `strand-raisin.ts`. About 90 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the two signatures' callers, `well-draw.ts`, `lock-mark.ts`, the frame harness |
| writing | 45 | the world threaded through thirty files, `well-body.ts`, `creature-under.ts`, the radial lock link, the proof |
| looking | 5 | one `bun run frames` of the pilot's hand at six o'clock |
| friction | 15 | an import loop, a file at 250 lines, a second at 255, an unused import |
| landing | 10 | format, check:fast twice, index, the commit |

Bottleneck: **writing** — a signature that thirty files call, each with a
`cfg` in hand and no world, so the world had to be carried down through the
callers first.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — three difficulties, and the one number they move

Queue item, the owner's, with his answer to its `Asks:` — the tempo alone, and
today's game is Medium. Easy is 80, Medium is 96 and Hard is 120, all three
whole numbers of ticks to the beat. The level is stored beside the device's
progress, chosen on a page behind PLAY's DIFFICULTY row, sent to the room and
handed back on every welcome so both phones take their beat from one answer,
and changing it takes the run back to the first wave behind the same question
LEAVE ROOM is behind. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `config.ts` for the tick rate the tempo has to divide, `progress.ts` for what a device already remembers, and the wire from `protocol.ts` through the room to `link.ts` for where a pair's one answer can live |
| writing | 35 | `sim/difficulty.ts`, the level on the wire and in the room, the level on the link's status and at beat zero, the page and its three rows behind two-steps, the row that says which is on, and 14 tests across the sim, the app and the real Durable Object |
| looking | 0 | none — a cloud session cannot see a menu page, which is what most of this is |
| friction | 10 | `apps/server` depends on `@neon-spore/net` and deliberately not on the rules, so the type came out through net; and a test that opened a third phone on one room hung, because a room refuses a third socket |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — three tempi is a one-line table and everything else is
the path a chosen level takes: storage, wire, room, status, beat zero, and the
one place it may be applied, which is a run that is starting anyway.

## 2026-09-13 · claude/queue-the-wells-cannon-can-be-held-now-but-the-hands-r — the hand's ring on THE WELL's cannon

`drawShipHand` takes a `PlaceHand` now — the grab circle and the turn its
swelling stands at — and the well's ship pass calls it with `wellHandPlace`
(`well-ship.ts`): `wellCannonGrab`/`wellShieldGrab` at the world's column,
turned to the lobe's hour, so the cup, the slide arrows and the maw all sit on
the lobe the way they sit on the flat hull. The turn is a rotation about the
ring's own centre rather than a draw at the origin, so the canvas log still
finds the cup at the grab and the proof reads it there: a `Path2D.arc` at
`wellCannonGrab` with `held: true`, none without a hand. The picture needed a
preview and a synthetic `pointerdown`, which is queued as the frames tool's
gap. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `ship-hand.ts`, `well-ship.ts`, `touch-well.ts`, the canvas stub's log |
| writing | 15 | `PlaceHand`, `wellHandPlace`, the well branch's call, the proof |
| looking | 15 | a preview of this tree, a synthetic press on the lobe, one Playwright shot |
| friction | 0 | — |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **looking** — the frames tool has no flag for `view.hand`, so the
one picture the lane owed took a preview, a browser pane and a scratch script.

## 2026-09-13 · claude/queue-the-directors-stage-speaks-for-its-role-bar-whil — a round's slabs answer the seated role

`StageGauge` and `StageSnake` have no `role` of their own any more: the slabs
are placed with `layout().role`, and the layout `stage.ts` hands in is already
seated by `handedLayout`, so while THE HANDOVER has the panels traded a press
on the director's canvas is answered where the frame draws the button. The
briefing gate's `speaksFor` and `pointerSeat` stay on the role bar — those are
who is pressing, not which panel. One test stands a gauge round on a traded
handover wave and presses the call where the pilot's screen now draws it.
About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `render/handover.ts`'s line between panel and identity, the two listeners, the gauge test |
| writing | 10 | the two interfaces, `stage.ts`, the traded case in `stage-gauge.test.ts` |
| looking | 0 | none — a hit test is proved by the command it sends |
| friction | 5 | a two-line comment put `stage.ts` over the 250-line limit; the trunk had diverged from `origin/main` twice before the lane opened, once mid-turn |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **friction** — the trunk, not the task: two rebases of `main` for
a ten-minute change.

## 2026-09-13 · claude/queue-the-handover-makes-no-sound — THE HANDOVER, heard

`mixer-handover.ts` hears the trade the way the cannon's column is heard: a
`handedOver` edge between two frames, out of `Memory`, so the simulation still
emits nothing for the fault. Two sounds already in the catalogue and written
for exactly this — `assist.handOver`, a tone crossing the stereo field, on the
beat the panels change screens; `assist.takeOver`, the same crossing back, at
six tenths, on the beat they return — go from spare to bound, and the SOUND
sheet, the wiring list and the spare count follow. `NO_SUBJECT` moved to
`sound-link-none.ts` when the two reasons put `sound-link.ts` over its length.
About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `docs/spec/audio.md`, `mixer.ts`, `mixer-pulse.ts`, the spare half of the catalogue for a sound already written for a control changing hands |
| writing | 10 | the mixer file, the memory field, the two catalogue entries, four mixer tests, the document's three figures |
| looking | 0 | none — a sound is proved by the id the mixer reached for, and nobody here has speakers |
| friction | 5 | a shell heredoc that would not run; the two excuses put `sound-link.ts` over 250 lines, so the list moved out |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **reading** — finding that the catalogue already held the sound
took longer than binding it, and was worth it: nothing new was written.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER's window, authored on the wave

The owner's answer to the `Asks:` this lane filed yesterday: both shapes, and
defined for one wave over a period of beat rows. The fault's arm carries three
optional numbers now — the beat it trades on, how long it holds, and the period
after which it does it again — and a wave that names none of them plays the
game's own figures once. THE HANDOVER names nine and eight, which is what its
guide says out loud. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover.ts`'s own `bounds`, and `serialize.ts`, because a field the editor cannot write is a field it deletes the first time somebody saves a wave |
| writing | 20 | the three fields on the arm, `bounds` answering the window a beat is in or next to, the serializer, the director's three boxes, five tests and the bestiary's paragraph |
| looking | 0 | none |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit, `bun run land` |

Bottleneck: **writing** — the arithmetic is six lines and the care is in what a
blank box means: an empty field is the wave saying nothing and not a zero, which
is the difference between the game's own numbers and a trade that never ends.

## 2026-09-13 · claude/queue-bun-run-frames-cannot-photograph-a-hand-on-the-s — `--hand` on the frames tool

About 50 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `tools/frames/{capture,flags,spec}.ts`, `apps/game/src/{handle,field-input,viewport}.ts`, `render/stage-point.ts`, the lane that stubbed `setPointerCapture` by hand |
| writing | 20 | `clientOfStage` and `Geometry.toClient`, `FieldInput.shipGrab`, the handle's `shipGrab`, `tools/frames/hand.ts`, the flag and the spec, six tests |
| looking | 5 | one real `bun run frames . --wave 1 --seat p1 --hand cannon`, which showed the ring and the slide arrows on the lobe |
| friction | 10 | `main.ts` at the 250-line ceiling; two tests that pin source text (`intro.test.ts`'s destructuring line, `pointer-conversion.test.ts`'s `clientX -` rule) caught the wiring |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **writing** — the handle had to answer where the grab circle is in
screen pixels, which meant an inverse of `pointOnStage` that did not exist.

## 2026-09-13 · claude/queue-the-cairns-pile-draws-the-whole-of-each-stones-f — the pile's fire asks the clip first

About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `cairn-pile.ts`, the three looks, `rock-wake.ts` and `rock-wake-fire.ts`, the render-perf skill, `blobRadiusMul` for the flame's bound |
| writing | 15 | `rock-window.ts`, a `Window` last on every mark and through the three looks, `drawRockBody` and the pile; the proof test; the four budget rows |
| looking | 5 | the ordered log before and after, 36,782 lines to 26,648, checked as a subsequence and for every kept draw's context state |
| friction | 5 | a scratch test outside `packages/` could not resolve the workspace; the boundary case in the window test |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **writing** — a trailing parameter on five marks is small, but it
had to reach every call site in three looks without one being missed, and the
log diff is what says none was.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — THE HANDOVER's guide is a rehearsal

The fault changes the picture, so the guide had to be one: four pages, the pair's
own hands on the first two and the traded panels on the last two, with the lip of
the band counting down through the middle of it. The line that made it drawable
is that a film's page is a **device** and not a panel — `handedSeat` — so the
other seat's half arrives under a corner plate that goes on saying whose phone
this is. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `.claude/skills/new-tutorial` whole, `guide-scene.ts`, `guide-film.ts`, `caption-anchor.ts`, and the four scene tests that decide what a film may be |
| writing | 15 | the seam, the film, the wave's `scene:` line, six tests, the bestiary's paragraph |
| looking | 0 | none — a cloud session cannot watch a film, and it is queued unverified |
| friction | 10 | a caption anchored at a control the traded panel has not got would land on nothing, which set where the window opens and closes; the band draws no words, so the first test read glyphs that are not there and had to ask `bandLobes` instead |
| landing | 5 | format, index, check:fast, the queue entry, the commit |

Bottleneck: **friction** — both halves of it were the same thing: a traded page
is the other seat's screen all the way down, and anything written against the
page's own seat is written against a panel that is not there.

## 2026-09-13 · claude/queue-hull-traded-answers-the-handover-a-second-way-an — HULL · TRADED goes to VERSUS

Queue item: the shape-sheet's `HULL · TRADED` was drawn for THE HANDOVER
before it was built and never carried to VERSUS. `handover:notice` / `hull`
puts two exchanging lobes on the real hull for the length of the window,
under the shipped plate; the announcement became a patchable record and the
pose opens the pilot's phone a beat before the warning. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `handover-look.ts`, the cairn candidate's shape, `hull.ts`'s gradient and rim, the draft's `traded` |
| writing | 5 | `HANDOVER_LOOK`, `paint.ts`, `index.ts`, the pose, the `SLOT_POSE` row |
| looking | 5 | three shots: the first lobes covered the cannon's rim and read as a plate, so each lobe became its own path in the hull's own gradient |
| friction | 0 | — |
| landing | 5 | format, index, check:fast, the commit |

Bottleneck: **looking** — the draft's flat-topped bump is right on a sheet and
wrong on the hull, and only a shot said so.

## 2026-09-13 — scheduler-tests-two-devices-klxkyt — the briefings spec counts its own rehearsals

`docs/spec/briefings.md` still said *one rehearsal exists* and *FIRST STEP has
the only one* with fifty-six films in the tree. The status block and §3.2 say
what is true — all but five guided waves open on a film — and the numbers in
them are held by `scenes-prose.test.ts` rather than by a sentence nobody has a
reason to open, which is the rule this repository already plays by for a copy of
anything. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the status block, §1 and §3.2, and a count of guided waves against `SCENES` |
| writing | 10 | the two rewritten passages and four tests, one per figure the document states |
| looking | 0 | none — a document |
| friction | 0 | — |
| landing | 5 | format, check:fast, the queue entry, the commit |

Bottleneck: **writing** — the rewrite was five minutes and the test was the
point: the five waves still on prose are named in one place now, and a film
written for one of them fails here rather than leaving the sentence wrong.
## 2026-09-13 · claude/queue-unverified-at-c988cd97-nothing-drawn-changed-the — §3.2 of the briefings spec, read

Unverified item: the rewritten rehearsals section of `docs/spec/briefings.md`
read by an eye. It reads — the status block, §1's count and §3.2 agree with
each other and with the five waves the test names — so the entry comes out.
The lane also takes the finished `HULL · TRADED` entry out of the queue a
second time: another session's rebase had resolved `docs/queue.md` by keeping
its own copy, which put the item back. About 5 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the diff of `c988cd97` on `briefings.md`, the counts against each other |
| writing | 0 | — |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | the two queue removals, the commit |

Bottleneck: **landing** — two queue removals and a commit for five minutes of
reading, and one of the removals is a landing somebody else's rebase undid.

## 2026-09-13 · claude/queue-unverified-at-b5356072-the-difficulty-page-seen — three menu pages seen on a phone

Three unverified items at once: the front page, the palette and face, and
the difficulty page, each "seen on a phone". The preview served this tree,
the browser pane at 375×812 and a playwright page at 390×844 with the intro
already seen: three rows on the front door, three behind PLAY with the SURE?
question under HARD, Space Grotesk on the wordmark and monospace on the rows,
all on one screen with room under them. The pictures went to the owner; the
entries come out. The names item was released rather than closed — the chip
only carries a name once a room knows two, which is two devices. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the four entries, `menu-entries.ts` for when the fourth row shows, where names come from (`status.names`) |
| writing | 5 | a scratch playwright script that sets the intro seen and walks the three pages |
| looking | 5 | the pane at phone size, then the three PNGs |
| friction | 5 | `bun run crop` refused its arguments; the pane's zoom returns the whole frame; a coordinate tap on HARD did not land and a ref tap did |
| landing | 5 | the three removals, one release, the commit |

Bottleneck: **friction** — getting a phone-sized PNG of a page behind the
intro took a script, because `bun run shot` cannot mark the intro as seen.

## 2026-09-13 · claude/queue-a-player-signs-in-with-google-or-by-an-email-lin — a player logs in with Google or an email link

The owner asked which sign-in routes were easy and recommended, chose Firebase
Auth (Google and an email link, Apple later) and anonymous-first through the
question tool, and the queue item went from cloud-only to done here. About 75 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue item, `names.ts`, `nickname.ts`, `join-name.ts`, `menu-settings.ts`, the miniflare harness, the menu's CSS |
| writing | 35 | `sign-in.ts` on both ends, the registry around a subject, the settings row, the PLAY line, the forged-token test helper |
| looking | 10 | PLAY and SETTINGS at phone size, once with a dummy project to see the row |
| friction | 5 | miniflare's `Response` is not `tsc`'s; `[hidden]` lost to `display: grid` on a settings row |
| landing | 10 | the build, `check:fast`, the index, the commit |

Bottleneck: **writing** — two ends and a menu page for one feature; nothing
waited on anything.

## 2026-09-13 · claude/sign-in-live — the game signs in against the owner's Firebase project

The owner pasted the web config into `sign-in-config.ts`; the Worker got the
matching project id and the row was watched come alive. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — |
| writing | 5 | `wrangler.jsonc`, the config file's comment, the pasted block to Biome's shape |
| looking | 5 | PLAY and SETTINGS at phone size; a press on LOG IN WITH GOOGLE reaching `neon-spore.firebaseapp.com` |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

Bottleneck: **looking** — the popup opens only from a person's click, so the
round trip stops at the chooser for me.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — the row verbs on the row, and the map following the beat

Four asks from the owner in one prompt: the map should follow the beat that is
playing with the rows after it still on screen, BRUSH should stay put while the
map scrolls under it, a row should offer a line between rows to insert at and a
trash to remove it on hover, and a tile clicked open should keep both. About
35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `grid.ts`, `grid-rows.ts`, `grid-gestures.ts`, `selection.ts`, the map and brush stylesheets, `columns.ts` |
| writing | 10 | `grid-follow.ts`, `grid-row-acts.ts`, `grid-metrics.ts`, the ring pass in `grid.ts`, two tests, the CSS |
| looking | 5 | three headless runs over the real director — the hover, the selected row, the sticky palette, the follow at tempo |
| friction | 5 | a rail with an `auto` grid-row end stretched to the bottom of the map and its lower line drew under the last beat; the map column's 560px minimum then clipped the new trash strip |
| landing | 5 | `bun run index`, `check:fast`, the commit |

Bottleneck: **looking** — every one of the four asks is a thing you have to see,
and none of them can be read off a unit test.

## 2026-09-13 · claude/lost-wave-screen — a lost wave stops on a friendly screen, RETRY WAVE or QUIT

Queue item 1. The owner decided the forks through the question tool — either
phone's press answers for both, QUIT ends the run and the room stays, the
menu says who — and the screen was built over the held field, with the
guide bar's own buttons. About 80 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `wave-fail.ts`, `wave-opening.ts`, `nav-button.ts`, `briefing.ts`, `menu-link.ts`, the director's opening stage |
| writing | 35 | the two commands and the `quit` event, `lost-screen.ts`, `lost.ts`, `quit.ts`, the director's press, the spec paragraph |
| looking | 20 | the screen at phone size in the preview; QUIT to the menu's line and RETRY back into the wave, each through a real click |
| friction | 10 | `stage.ts` over 250 lines; `ui.menuBack` with no picture; the baked-growth rows; `?play=1` binds no menu, so the QUIT check had to start from wave 01's button; the intro sheet over a fresh profile |
| landing | 5 | `check:fast`, the index, the commit |

Bottleneck: **looking** — driving the world by hand stalls the live loop, so
every look at the screen was a scripted browser with its clocks frozen.

## 2026-09-13 · claude/handover-watched — THE HANDOVER watched at phone size

The unverified entry from the cloud session, opened on a machine with a
screen: the warning, the trade and the window photographed from both seats
with `bun run frames .`. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `waves/act-8.ts`, `sim/handover.ts`, the frames tool's flags |
| writing | 0 | — |
| looking | 10 | strips at ticks 500–1450 for P1, the trade instant for P2: the lip counts 2, 1, the band flips to the other seat's colours and controls, the other seat's reads come with it |
| friction | 0 | — |
| landing | 5 | the queue, the commit |

Bottleneck: **looking** — the panels coming home cannot be photographed
headless, because a wave nobody answers is lost before the window closes.

## 2026-09-13 · claude/parting-verified — two phones part and find their way back, on a wrangler and in two browsers

The cloud session's unverified entry, run for real: the four relay checks
against a local wrangler, then two browser contexts in one room, one of them
reaching into its own world. The parting found a defect the fingerprints could
not — the room screen stood over the menu's CONTINUE — fixed here. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `.claude/skills/net-change`, `dev.ts`, `link.ts`, `join.ts`, `shell.ts`, the menu's entries and the room screen's ids |
| writing | 5 | the two-phone script; `join.ts` no longer opening on a parting, `shell.ts` closing it, `join-words.ts` naming CONTINUE, the test |
| looking | 5 | `relay:check` plain, `--split`, `--full`, `--rejoin`, all in step; then the parting on two phones: menu on PLAY, one press waiting, the second press putting both on WAVE 4 at tick 0 |
| friction | 0 | — |
| landing | 5 | `check:fast`, the queue, the commit |

Bottleneck: **looking** — the first two phones through a parting could not
press CONTINUE at all, which no unit test and no relay check could have seen.

## 2026-09-13 · claude/names-on-a-phone — two twelve-character names on the siren, seen on two phones

Queue item 091f7df2, the look a cloud session could not take: two phones called
ANNE-MARIE K and JEAN-LUC PIC in one room, put on THE VEIL by a parting and a
CONTINUE, a veil on the field and the siren up. The right chip's last letters
and its ear were under the ☰, and a long name's last letter touched its glyph —
both fixed here. About 30 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the names commit, `siren.ts`, `siren-seats.ts`, `comms.ts`, `key-hint.ts`, `menu.css` for the ☰'s box |
| writing | 5 | the two-phone script for names; `SIREN_PAD` clear of the corner button, `GLYPH_ROOM`, the test that reads the button's box off `menu.css` |
| looking | 10 | three runs of the two phones: the key hint over the top row (a mouse, not the game), the chip under the ☰, then the fixed cluster |
| friction | 5 | stopping the wrangler by command line matched too widely and killed other windows; Python heredocs wrote CRLF and the formatter refused it |
| landing | 5 | `check:fast`, the queue, the commit |

Bottleneck: **looking** — the defect was a DOM button over a canvas instrument,
which nothing in either package's tests could see; the two-phone run is the
only thing that draws both.

## 2026-09-13 · claude/ready-faster — the ready gate says READY under a thumb sooner

The owner's `NEXT:` mid-turn: the circle at the end of a guide must switch to
READY much faster when pressed. `readyHoldMs` 420 → 150; the header, the spec
and the one test that counted in ticks follow. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `ready-gate.ts`, `briefing.ts`'s hold binding, `ready-circles.ts`, the config's history for the number |
| writing | 5 | the number, its two paragraphs, `ready.test.ts` counting in `FULL` rather than 20 |
| looking | 0 | — nothing a still frame shows; the sim test counts the ticks |
| friction | 0 | — |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **reading** — finding that the header already argued for a fifth of
a second while the number said 420 took longer than changing either.

## 2026-09-13 · claude/handover-window — THE HANDOVER's window and a cycle of it, looked at

The queued unverified item from a3703115: THE HANDOVER's own window (nine in,
eight long) photographed around the trade with `bun run frames`, and a wave
that keeps trading stood up with a scratch script that set the fault's
numbers on the page, six beats a cycle with a three-beat hold. The arithmetic
holds on both; whether the cycle reads as a fault and whether the plate can be
permanent furniture are the owner's, asked. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/handover.ts`'s `bounds`, `handover-look.ts`, `frames`'s `openStage` and `makeDriver` to drive a page by hand |
| writing | 5 | the scratch script, a Python stacker for six band crops, two queue entries |
| looking | 15 | thirteen frames of THE HANDOVER, sixteen of the cycle, the strip of six beats |
| friction | 5 | no wave in the tree repeats and the tool cannot be told to — queued as a `--fault` flag |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **looking** — a cycle is a thing seen across beats, and each beat
was a frame opened on its own until the crops were stacked.

## 2026-09-13 · claude/handover-guide — THE HANDOVER's rehearsal, all four pages watched

The queued unverified item from 47007bd2: the film photographed page by page
with `--guide-page`, the second across the trade at thirty-tick strides. The
band changes colour under the same corner plate, the lip counts down and then
counts out, the third page's thumb is on a button it never had. Whether that
reads as panels changing screens, and whether four pages are enough, are the
owner's, asked. One thing wrong found: the fourth page's caption sits on the
plate. Queued. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `scenes/the-handover.ts`, `turnGuide` and `heldPageNote` to learn a page holds until turned |
| writing | 5 | one queue entry, this |
| looking | 10 | seventeen frames of a held first page, eight across the trade, one of each later page |
| friction | 5 | the first strip was seventeen pictures of one frame — a page holds, and `--guide-page` is the way past it |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **looking** — the first strip had to be thrown away before the
right flag was read.

## 2026-09-13 · claude/column-tracks-test — the director's four open tracks held equal in code and stylesheet

The queued test: `OPEN_TRACKS` in `columns.ts` and `main { grid-template-columns }`
in `director-columns.css` are the same four tracks in two files, and nothing
failed when they drifted. Now `columns.test.ts` reads the stylesheet, splits
the tracks outside `minmax(…)`, and holds them equal to the code's in the
markup's own DOM order; the constant is exported for it. Tried against a
stylesheet put back to 560: fails. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two copies, `columns.test.ts`'s markup block, `map-width.test.ts` for the shape |
| writing | 5 | the export, the test, the comment that named index.html for a rule that lives in the stylesheet |
| looking | 0 | — a test, nothing drawn |
| friction | 0 | — |
| landing | 0 | `check:fast`, the commit, folded into writing |

Bottleneck: **reading** — finding where the rule actually lives (the comment
said index.html; it is `director-columns.css`).

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — THE LEAK, the fault that takes the hold

The owner asked for a modifier on the standard control set where holding a
cannon button fires no beam, introduced by a guide and a wave of its own, and
asked whether the game already had one. It did not: five faults, and every one
of them takes a *control*. THE LEAK is the sixth and the first to take a
**gesture** — the lobe fills nothing all wave, every tap still fires — with a
wave in a new act nine written on the figure THE LANCE was taught on. About
70 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `lance.ts`, `malfunction.ts`, `commands.ts`, `control-fault.ts`, the mechanics tables, `fault-beam-ends.ts`, the new-wave and new-tutorial skills |
| writing | 25 | the kind, the two lines in `lance.ts` that are the whole mechanic, the wave and its argument, the mechanic row, the director's picker, the beam ends, six tests, the bestiary and briefings sections |
| looking | 0 | nothing drawn that a picture would settle — the fault's whole face is a beam that already exists, aimed at two lobes that already exist |
| friction | 15 | `malfunction.ts` went over 250 lines and had to be split twice over (`choke.ts`, `fault-clock.ts`) before anything could land; the browser tests then sat on their whole budget because the built page cannot reach Google from here, which cost two dead `check:fast` runs before it was understood and is queued |
| landing | 10 | the index, the spec counts, `check`, the commit |

Bottleneck: **friction** — none of it was about the mechanic. Half was a file
that was already full, and half was a sandbox that cannot reach the fonts the
sign-in brought in.

## 2026-09-13 · claude/map-on-a-phone — the director's map tapped on a phone-sized viewport

The unverified item from caaf6cac: on a 375-px viewport with touch, the
tapped row alone wears the insert lines and the trash, and the palette is
`position: static`. Both held. What did not: the MAP view keeps the desktop
two-column frame, so the map is ~110 px wide beside the 250-px palette and
its panel and trash sit off the right edge — queued with the fix named.
About 25 min, most of it getting one script to tap the right cell.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `mobile-menu.ts`, `director-phone.css`, `director-brush.css` for the frame |
| writing | 5 | the queue entry |
| looking | 5 | two screenshots of the map view |
| friction | 10 | the script: a `tail` that ate the error, a wait on a hidden cell, a menu tapped shut, a cell off the right edge |
| landing | 0 | the commit, folded into writing |

Bottleneck: **friction** — four reruns of a scratch script before one tap
landed on a cell that was on the screen.

## 2026-09-13 · claude/siren-centre — the siren and both names sit top centre; the beat dots are gone

The owner asked for it by name: "show the siren with names top centered.
the beat dots helper left top we can remove anyway". `sirenCentre` now
returns the middle of the screen at the round header's height, the two seat
chips hang off it either side, and the four beat dots leave the HUD's top
left — the beat is still on the shield ring, the wisp grid and in the audio.
A test holds the cluster's reach inside `SIREN_PAD` with the longest names.
About 45 min, a third of it getting a picture with real names on it.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `siren.ts`, `siren-seats.ts`, `hud.ts`, `round-header.ts`, the net-change skill for the relay |
| writing | 15 | the move, the widened `headerTop`, the test, the four documents |
| looking | 15 | a two-phone run over a local relay, stopped by its PID, for the frame with names |
| friction | 5 | `headerTop` wanting a whole `ViewState`; Biome's import order |
| landing | 0 | check:fast and the commit, folded into writing |

Bottleneck: **looking** — names only exist over a relay, so one frame cost a
wrangler start, two headless phones and a room.

## 2026-09-13 · claude/retry-count — a retry is counted when it is taken, not on the hit

Queue item: the lost screen read `0:09 · 1 RETRY` beside a QUIT button, and
a pair that quit was recorded with a retry never taken. The count moves from
`failWave` to `startWave`, on the tick a failed wave opens again, beside the
try it becomes; the `waveFailed` event loses a number that had not changed,
and the lost screen's line index follows. Thirty-one sim tests read
`retries === 1` as "the wave was lost" and now ask `failHolds`. About 30 min,
most of it the sweep.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `wave-fail.ts`, `wave-start.ts`, `lost-screen.ts`, `waves.ts`, `opening-fx.ts` for every reader of the count |
| writing | 15 | the move, the pinning test, and a script over 31 test files |
| looking | 5 | one frame of FIRST STEP lost |
| friction | 0 | nothing failed |
| landing | 5 | two trunk rebases before the siren lane could land (origin had THE LEAK) |

Bottleneck: **writing** — a number thirty-one tests used as a flag, swept
with one script rather than by hand.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — the two VERSUS slots the owner had already decided

Queue item, written for a cloud session: the owner's answers from the VERSUS
page on 13 September 2026 — `handover:notice` takes `hull`, `cairn:pile` takes
nothing. Both applied with `bun run versus`, never by hand, so the record and
the registry moved with the code. The hull's two lobes are on the real ship
now, under the shipped plate, for the length of the window. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the two candidates' own arguments, `DECIDED.md`'s shape |
| writing | 5 | two `versus` commands, and the adopted file's closing paragraph rewritten from a question into the answer it now is |
| looking | 5 | `bun run frames` at tick 825 of THE HANDOVER, the pilot's screen, cropped to the hull |
| friction | 0 | — |
| landing | 5 | the render, versus and director tests, `queue done`, the commit |

Bottleneck: none worth the name — the tool did the work, which is the whole
argument for having it.

## 2026-09-13 · claude/scheduler-tests-two-devices-klxkyt — no perf in the cloud, and the entry that broke the trunk

Two small pieces after the VERSUS lane. The owner said *do never run perf tests
in Claude cloud*, which closes a door a cloud session was told to use nine days
ago — so the rule is written the way he said it and the collision it re-opens
is queued as a question with both ways out named. And the VERSUS landing's own
`--unverified` entry had named a file that landing deleted, which turns the
trunk red on the next check; that is fixed at the source with a test. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `docs/performance.md`'s two sections, `note-commit.ts`, the notes-repo harness |
| writing | 10 | the CLAUDE.md clause, the doc's amendment, the queued question, `--diff-filter=d` and its test |
| looking | 0 | — |
| friction | 0 | — |
| landing | 5 | the land, queue and doc tests, two commits |

Bottleneck: **writing** — most of it was the queued question, which has to name
both options well enough that the answer is one word.

## 2026-09-14 · claude/queue-tasks-kkqozz — `bun run frames --fault`, a fault at numbers no wave names

Queue item: THE HANDOVER's cycle could only be photographed by a scratch
script that wrote `world.malfunction` on the page by hand. `--fault` is now a
flag — `handover:<at>,<beats>,<every>` the director's three boxes in order,
`cannon:<colour>[,<every>]` and `shield[:<every>]` naming the fault clock a
wave leaves to the config, and the other three kinds bare — parsed in
`fault.ts` and written where `startWave` leaves a wave's own, straight after
`jumpToWave`. Checked against the built game: at tick 420 of THE HANDOVER the
plain frame is untraded and `--fault handover:4,3,6` reads THEIR PANEL — BACK
IN 3. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `flags.ts`, `spec.ts`, `page.ts`, `malfunction.ts`, `handover.ts`, `config-malfunction.ts` |
| writing | 5 | `fault.ts`, the wiring through four files, six test cases, the usage block |
| looking | 5 | three real captures — the cycle, the plain frame beside it, and the trade read off the plate |
| friction | 0 | none; `queue done 1` refusing a position rather than a title is the tool working |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the fault is a union with a different grammar per arm,
and each arm's numbers had to be found in the file that clamps them.

## 2026-09-14 · claude/queue-tasks-kkqozz — THE HANDOVER's caption goes under its ring, not over the plate

Queue item: the rehearsal's fourth page drew PLAYER 2 MOVES THE CANNON over
THEIR PANEL — BACK IN 3, covering all of it but the first two letters, because
a caption anchored on a strip stands four pixels above its ring and on this
wave that is the lip the plate sits on. `handover-look.ts` now exports the
rectangle `drawHandoverNotice` fills — and fills that one rather than a second
copy — and `guide-caption.ts` treats a box that would cover it the way it
already treats one that would cross the banner: under the ring instead. The
new case in `guide-plate-room.test.ts` names the caption and the page when the
rule is taken out. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `guide-caption.ts`, `caption-anchor.ts`, `handover-look.ts`, `guide-scene.ts`, the canvas stub's text boxes |
| writing | 5 | `plateBoxAround`, the second floor, the test's two cases |
| looking | 5 | the page photographed before and after — both texts legible in the second |
| friction | 0 | none |
| landing | 5 | the render suite, `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the plate's rectangle had to become reachable from a
test that cannot hold the rehearsal's own world, which is what turned one
exported box into two functions.

## 2026-09-14 · claude/queue-tasks-kkqozz — MAP is one column on a phone

Queue item: below 700px the BRUSH/MAP section is the whole screen and it kept
the desktop's two tracks, so on a 375px viewport the palette took its fixed
250px and the map got the ~110px left — the cell panel, the note and the row's
trash all sat off the right edge. Two rules inside the phone block: one track
for the body, `width: auto` for the palette. Measured with playwright at 375px
either side of the change: `250px 302px` with the panel running to x=574, and
one `354px` track with it ending at 312. `phone-map.test.ts` reads both rules
out of the phone block and holds the desktop's own two alongside. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `director-phone.css`, `director-brush.css`, `stylesheet-order.test.ts` |
| writing | 5 | the two rules and their paragraph, three test cases |
| looking | 10 | a probe that starts the director and drives a 375px page; measured before and after, and the shot |
| friction | 0 | none; two probe runs went to the menu overlay before the view was set directly |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — the change is two CSS lines and the only way to know it
was the right two was a browser at the width, which cost a throwaway harness.

## 2026-09-14 · claude/queue-tasks-kkqozz — a capture reaches the preview and nobody else

Queue item, and it carried an open question: whether the built game's refused
connections to Google were any of `test/opening.test.ts`'s four minutes forty,
or whether the file simply costs that here. Measured, three times on this
machine: **280 s** as it stood, **55 s** with `offline.ts` refusing every host
but the preview's at the browser, **31 s** with the menu's face out of the
bundle as well. So it was nearly all of it, and the two preconnects were worth
as much again as the stylesheet they were for.

Space Grotesk is a variable font, so Google's three weights are one 22 kB
woff2; under `src/fonts/` the bundler inlines it and the page makes no second
request at all. `captureFrames` carries out the list of what asked, and the new
case in `opening.test.ts` is that the list is empty. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `capture.ts`, `page.ts`, `browser.ts`, `index.html`, `menu.css`, `build.ts` |
| writing | 10 | `offline.ts`, the result field, the new case, the `@font-face`, the turned-over face tests |
| looking | 25 | three timed runs of the file at five minutes, one minute and half of one, plus a probe printing what a capture asks off-origin |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — the answer the entry asked for was a number, and the
only way to it was running the five-minute file again on each side.

## 2026-09-14 · claude/queue-tasks-kkqozz — THE LEAK gets a rehearsal, and it is asserted

Queue item: the wave shipped with the three strings, and what it has to show is
two pictures a sentence turns into one — a ring that does not close under a
thumb that is not moving, then that same thumb lifting with an ordinary bolt
going out. `scenes/the-leak.ts` quotes THE LANCE's film: the same three cyan in
column two, the same slide under them, the same first page in the same words.
The hold runs five beats where `lancePrimeBeats` is three, so the page stands
past the moment a lance would have come and nothing happens. The new case in
`scene-films.test.ts` holds both halves — the fill never leaves nought under
the hold, a body is taken after the lift and before the taps, and all three go
by the end; with the fault taken off the film it reads 994 instead of 0.
§3.2's two counts and `STILL_PROSE` move with it. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the new-tutorial skill, `the-lance.ts`, `the-jam.ts`, `scene-types.ts`, `scene-script.ts`, `lance.ts`, the four scene tests |
| writing | 10 | the film, the registration, the wave's `scene`, the assertion, the two counts |
| looking | 15 | three pages photographed on both seats, and a strip across the lift |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — a film is forty lines and the rules it has to satisfy are
in six files, and the one that decided the timing (a lift fires the shot the
press owes) is a paragraph in `lance.ts` rather than anything a test says.

## 2026-09-14 · claude/queue-tasks-kkqozz — a red run says what failed, under the counts

The entry this lane wrote two commits earlier, drained in the same sitting. A
run of `bun run check:fast` ended `1668 pass, 1 fail … 1 shard red` with
nothing under it: the failing case's name was inside its shard's own block,
hundreds of lines above the last thing printed, and the block still on screen
was the green shard saying `0 failed`. `firstFailure` reads the case out of the
merged junit report — file, line, and the `describe` over it — and `shard.ts`
prints it under the counts. Proved on a deliberately red shard: `first failure:
tools/check/test/zz-scratch.test.ts:4 — a group > fails on purpose`. About
20 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `shard.ts`'s summary, `shards.ts`'s tally and merge, a junit report with a real failure in it |
| writing | 10 | `firstFailure`, the printed line, two fixtures and four cases |
| looking | 5 | a scratch failing test dropped into a shard and the closing lines read |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: writing — the shape of the report had to be got from a real one
rather than guessed, and the regex has to find the case a `<failure>` hangs
under without parsing the document.

## 2026-09-14 · claude/queue-items-8b11f4 — `waves-api.ts` stops being a binary file to git

Found after the previous landing, when `git diff --stat` listed the file as
`Bin 7520 -> 8075 bytes`. `wavesToken` separates length from text with a NUL,
and the NUL was in the source as the byte itself since 2 September — so git
classed the file as binary, every diff of it printed no hunk and `grep`
skipped it. The two bytes are the escape now, the hash is the same, and
`limits.test.ts` scans every `.ts` under the three code trees and every `.md`
under `docs/` for a control byte other than tab, LF and CR; a probe file
with a NUL in it turned the case red before it was removed. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the file's history to date the byte, `limits.test.ts` for a walker to reuse |
| writing | 5 | the queue entry, the two-byte replacement, one `describe` with one case |
| looking | 0 | none |
| friction | 0 | a heredoc turned the escape back into the byte once; written through Python's `chr(92)` |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — finding *when* the byte arrived took a Python one-liner
per revision, because the shell's own `grep` cannot be handed a NUL to look
for.

## 2026-09-14 · claude/queue-items-8b11f4 — `opening.test.ts` stops reading the port its own way

Found by `bun run test:profile`, opened to see why the file was the slowest
in the suite: its `beforeAll` spawned `preview:once` and read the port off
stdout with the loop `serve.ts` had replaced that same morning — the regex
that matches an address cut short, the deadline checked between reads, no
stderr on an early exit. The block is `startPreview(root)` now, and `stop`
is the returned one, which waits for the port to go quiet rather than
returning on `kill()`. The file's own fourteen cases, against a real build,
prove it. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the profile, `opening.test.ts`'s setup, `serve.ts` and `exec.ts` for what to call |
| writing | 5 | the queue entry, eight lines in place of twenty-two |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` with the browser file in it, the commit, `bun run land --keep` |

Bottleneck: landing — `check:fast` reaches the one file in the repository
that builds the game and drives a browser, so it took thirty-four seconds
where the previous lane's took seven.

## 2026-09-14 · claude/queue-items-8b11f4 — the guard refuses a heredoc body the Bash tool would rewrite

Found by reading eight of this file's own entries: the same forty minutes,
paid a session at a time, on a doubled backslash in a heredoc body reaching
the shell as one. The queue item was written from a probe with the tool
itself, and the rule is `tools/hooks/heredoc.ts` — the bodies read with
`shell-words.ts`'s own `heredocDelimiter` and `heredocEnd`, now exported, a
refusal that names the Write or Edit tool and Python's `chr(92)`, wired into
`refusalFor` for bash only. Proved twice: nine test cases, and the hook
itself blocking a `cat <<'EOF'` carrying two backslashes while letting one
through — and then blocking this very entry, whose friction row quotes two.
About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `guard.ts`, `shell-words.ts`, the test helpers |
| writing | 10 | `heredoc.ts`, its test file, the case in `guard.test.ts`, the INDEX row |
| looking | 0 | none |
| friction | 20 | the rule's own subject: `"\\"` in the source was one backslash in JavaScript, so the first version refused every single one — and refused the Python heredoc meant to fix it; a payload dump through `guard.ts` and the Edit tool found it |
| landing | 5 | `check:fast` twice, `bun run index`, the commit, `bun run land --keep` |

Bottleneck: friction — counting backslashes across four layers (the tool,
the shell, the JavaScript string and the test's own template) is exactly
what the rule exists to stop, and it cost this lane the same twenty minutes
it charges everyone else.

## 2026-09-14 · claude/queue-spawn-ts-sits-on-the-line-and-the-next-creature — `spawn.ts` sits on the line and the next creature cannot enter

The file stood at exactly 250 lines with a header saying it grows a spread
line per creature. The per-kind spread (`dartOnSpawn` … `balloonOnSpawn`) is
`kindFieldsOnSpawn` in `spawn-fields.ts`, in the same order — the five rolls
come off `world.rng` where they always did — and the three arrivals that are
more than one body are `companionsOnSpawn` in `spawn-companions.ts`. The
rock-cross comment that had come away from its spread is back on it.
`spawn.ts` is 123 lines. Proved by a fingerprint of all 71 shipped waves at
60 beats before and after, identical, and `bun test packages/sim`. About 25
min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `spawn.ts`, `creature-types.ts`, `shell.ts`, the fingerprint probe |
| writing | 10 | the two new files, the header and imports of `spawn.ts`, the two INDEX rows |
| looking | 0 | none |
| friction | 5 | `across` typed `number` where `rock-cross.ts` wants `CrossDir`; one tsc round |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — a mechanical carve, and the only cost was moving the
comments with the lines they explain so neither file reads as a fragment.

## 2026-09-14 · claude/queue-creatures-table-ts-is-one-creature-from-its-limi — `creatures-table.ts` is one creature from its limit, and the next cut is named

The table was at 249 with eight landings in its history, each a row, and
`creatures-handed.ts`'s header had already said where the next cut was: THE
LID and THE MAGNET, "each needing a hand *and* a trigger". Those two and THE
CHOIR are `creatures-held.ts` now, named in the table where they stood so the
key order — the director's brush strip — is byte-identical, checked by
printing `Object.keys(CREATURES)` before and after. The handed header's
sentence describes a file that exists; the one comment in `render/` that named
the magnet's row follows it. The table is 184 lines. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `creatures-handed.ts`, `creatures-cling.ts`, the tests that walk the keys |
| writing | 10 | `creatures-held.ts` and its header, the three named rows, the two comment fixes, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` (the full content shard is 40 s), `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header, which has to say what the family *is* in
the game's words so the next creature answered by a hand and a trigger knows
it belongs here.

## 2026-09-14 · claude/queue-canvas2d-ts-is-on-the-line-and-grows-a-call-per — `canvas2d.ts` is on the line and grows a call per body that sticks to the ship

The renderer's `draw` was at 250 and its last four landings had each added
one call to the same run over the finished ship — the fence's burn, the
gums, the choke's coils, the clingers. That run is `drawOnShip` in
`frame-on-ship.ts` now, the fifth pass, through the `frame-passes.ts`
barrel. Proved with the stub canvas's ordered call log: every wave carrying
a gum, a choke, a limpet, a leech or a fence, both seats, 480 ticks — five
waves, ten logs of 260–334 thousand calls, hashed identical before and
after. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `canvas2d.ts`, `frame-passes.ts`, `frame-ship.ts`, `frame-harness.ts`, `canvas-stub.ts` |
| writing | 10 | `frame-on-ship.ts`, the renderer's call and imports, the barrel's header, the op-log probe, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` (the render shard is 40 s), `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: landing — two check runs of forty seconds each, which is the
render suite's own cost and not this lane's.

## 2026-09-14 · claude/queue-boss-entries-ts-is-one-boss-from-its-limit-the-t — `boss-entries.ts` is one boss from its limit; the two questions are not shapes

The file was at 249 with a header saying every boss still to come is one
more interface in it. The fifty lines that are not interfaces —
`bossFillsWave` and `BOSS_KINDS`, the wire value with its own rule about
order — are `boss-kinds.ts` now, re-exported through `entries.ts` beside the
shapes, which is the one door everything already used. The re-export's
comment said "eleven shapes"; there are twelve. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `boss-entries.ts`, the re-export block in `entries.ts`, who imports what |
| writing | 5 | `boss-kinds.ts`, the two headers, the re-export, the INDEX row |
| looking | 0 | none |
| friction | 5 | `queue take` refused the title at 81 characters; shortened and retaken |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: friction — the title limit is the right rule, and a session
should count before it writes.

## 2026-09-14 · claude/queue-living-look-ts-is-on-the-line-and-nine-of-its-rows — `living-look.ts` is on the line, and nine of its rows are one family

The table was at 250 for the second time — it grows a row per creature —
and nine of its `null` rows were saying the same sentence: a shape one
radius cannot describe, drawn by a path of its own and routed away before
the living pass. Those nine, with their comments, are `living-look-stroked.ts`
now, spread into the table where the ghost's row stood. Every one is `null`,
so `livingBodyKinds()` printed before and after is the same ten names. The
table is 196 lines. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the table, `living-look-handed.ts`, the shape sheet's use of `livingBodyKinds` |
| writing | 5 | `living-look-stroked.ts` and its header, the spread and its comment, three ordinals in moved comments, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header, which has to say the one reason all nine
share without repeating the nine reasons each row keeps.

## 2026-09-14 · claude/queue-effects-spark-ts-is-on-the-line-and-eight-of-its — `effects-spark.ts` is on the line, and eight of its cases are one family

`burstFor` was at 250, an exhaustive switch that grows a case per event, and
eight of its cases argued their colour against each other: a covering coming
off a body that is still there. Those eight and their comments are
`effects-spark-worn.ts` now, cut the way `effects-spark-handed.ts` was —
the labels stay in `burstFor` so `assertNever` still names every event. The
proof was `burstFor` itself, called on the eight events in both colours before
and after: byte-identical. The switch is 213 lines. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the switch, `effects-spark-handed.ts`, the eight events' shapes |
| writing | 5 | the cut, the new file's header, one comment sent next door, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the header's one sentence for why these eight are a
family, which the eight comments already said between them.

## 2026-09-14 · claude/queue-body-path-ts-is-on-the-line-and-the-clubbed-walk — `body-path.ts` is on the line, and the clubbed walk is four fifths of it

The router for a living body's contour was at 250, and two hundred of the
lines were one walk — the clubbed rim, its four sample constants and its
jitter. The walk is `body-path-clubbed.ts` now, the router is 65 lines and
says a walk is a file of its own, and the two importers, the sheet's card and
`docs/asset-catalogue.md` point at the new file. The one surprise was
`copies.test.ts`: the walk reads the body's radius under each club, which
was allowed inside the owner and had to become an `also` with its sentence.
The proof was `livingPoints` of the ten own-bodied kinds at four times, plus
one `clubbedPoints` on a rim the sheet might draw, hashed before and after:
identical. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the router, the walk, `index-shapes.ts`, who names `body-path.ts` |
| writing | 10 | the cut, two headers, three re-pointed mentions, the copies row and its reflowed comment, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast` twice, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: writing — the copies-table comment, which had to say why the walk
is an `also` and not an exemption, in the paragraph's own register.

## 2026-09-14 · claude/queue-scene-types-ts-is-on-the-line-again-and-sceneact — `scene-types.ts` is on the line again, and `SceneAct` is where it grows

The file's own closing comment said how it was cut the first time, and the
act had grown a gesture at a time since. `SceneAct` and its comment are
`scene-act-types.ts` now, re-exported beside the step so the six films kept
their import; the two files that read the act alone read it from its file.
Types only — `tsc` and the scenes test are the whole proof. The file is 87
lines. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the two interfaces, the step's header, who imports the file |
| writing | 5 | the cut, two headers, the closing comment, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: landing — the fast check and the land are longer than the cut.

## 2026-09-14 · claude/queue-living-draw-ts-is-on-the-line-and-the-pose-is-the — `living-draw.ts` is on the line, and the pose is the part that grows per kind

`drawLiving` was at 250, one function, and the lines that grow are the ones
that ask `look` a question about a turn. Where the body sits and which way it
faces — the own-motion's offsets and squash, the throb's spin, the dart's lean
and flip — is `livingPose` in `living-pose.ts` now, the three paragraphs
moved whole, and the draw reads the answer. The proof was the ordered canvas
op log of seven waves on both seats, 480 frames each, before and after:
identical hashes. The draw is 224 lines. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the whole function, to find the one question asked once and read three times |
| writing | 5 | `living-pose.ts` and its header, the six-line read in the draw, the INDEX row |
| looking | 0 | none |
| friction | 0 | none |
| landing | 5 | the op log twice, `check:fast`, `bun run index`, `queue done`, the commit, `bun run land --keep` |

Bottleneck: landing — the op log over seven waves and the fast check are
most of the wall time.

## 2026-09-14 · claude/queue-items-8b11f4 — `command-codec.ts` is at the limit and grows a case per `Command` kind

The decoder was 248 lines with a switch that takes one `case` per kind the
simulation learns, so the next boss verb would have put it over. The switch is
the file's one job and stayed whole; the seventy lines of field checks above
it moved to `command-fields.ts`, the colour-set paragraph with them, and
`protocol-decode.ts` takes `isTick` and `isUint32` from the sibling. The only
friction was my own split putting the decoder's doc comment on the wrong side
of the cut, found by the formatter on the first pass. The codec's test — one
accepted example per kind, every rejection — is the proof, green unchanged.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 10 |
| looking | 0 |
| friction | 5 |
| landing | 5 |

Bottleneck: writing.

## 2026-09-14 · claude/queue-items-8b11f4 — `serialize.ts` is at the limit and grows a line per `WaveEntry` field

The wave serializer was 249 lines and its own note says every new field on
`WaveEntry` is a line in `serializeEntry` in the same commit, so the next one
would have put it over. The boss had already been cut out along the
simulation's seam; the arrival and the pod went the same way, `serializeEntry`
and `serializePod` with their paragraphs moved whole into
`serialize-entry.ts`, and `serializeWave` calls them. No friction: one Python
edit, the formatter, and the round-trip test against the real act files green
unchanged is the proof.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing.

## 2026-09-14 · claude/queue-items-8b11f4 — `creatures.ts` is at the limit and grows an `if` per covering over a body

The creature pass was 248 lines. The exclusive body draw had already become
a table; what was still growing was the run of `if`s after it, one per
creature that wears something over a body — cloud, rider, crust, canopy,
shell, cage, dome, membrane — so those eight and their paragraphs moved whole
into `creature-over.ts` as one `drawOverBody`, called inside the perspective
transform where they were. The proof was the canvas op log of 480 frames of
the eight waves on both seats, sha1 identical before and after; the only
friction was one sentence that pointed "far above" at a draw now in another
file, reworded, and two sim imports the formatter would not merge.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 10 |
| looking | 5 |
| friction | 0 |
| landing | 5 |

Bottleneck: writing.

## 2026-09-14 · claude/queue-items-8b11f4 — `roster.ts` is at the limit and grows a line per kind of thing that ships

The director's roster was 248 lines, and the parts that grow were three:
`isBuilt`, a clause per thing that ships outside both tables it reads, and
the two readers of the bestiary table and the act order's paragraph, a rule
per new way the spec writes a slot. All three moved whole into
`roster-parse.ts`; `roster.ts` keeps the types, the prose attachment and
`parseRoster`, and `backlog-ideas.ts` takes `isBuilt` from the sibling. The
proof was `parseRoster` over the real spec files as JSON, sha1 identical
before and after, and `isBuilt` on seven names the same. No friction.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing.

## 2026-09-14 · claude/queue-items-8b11f4 — `room.ts` is at the limit and grows a case per client message

The Durable Object was 249 lines and its `route` switch gains a case with
every message the client learns to send. It went the way three siblings
already had: the switch and its comments are `routeClient` in
`room-route.ts`, handed the four things a message can make the room do —
relay, press, keep a level, keep a tally — as closures, so the sibling
reads no private field. `room.test.ts` drives ping, ready, level and stats
through a room and is the proof, green unchanged. No friction beyond
merging two imports of one file the formatter leaves apart.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 10 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: writing.

## 2026-09-14 · claude/queue-items-8b11f4 — `pose-kit.ts` is at the limit and grows a builder per verb a pose needs

The pose kit was 249 lines: the apparatus that puts a world into a named
state, and after it the commands spelled short, which gain a builder for
every verb a new pose presses. The builders and their paragraphs moved whole
into `pose-commands.ts` and the kit re-exports them, so the thirty-four
files that import the kit are untouched. The proof was the typecheck and the
four pose suites, ninety-three green unchanged. No friction.

| where | minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing.

## 2026-09-14 · claude/queue-items-8b11f4 — `vane-cycle.ts` is at the limit: the arm's columns are a second subject

`vane-cycle.ts` held the cycle in beats and the arm in columns, and only the
second half read a `SimConfig`. The five column functions moved to
`vane-arm.ts`, which imports the cycle back; `bosses.ts` re-exports from both
so nothing beyond it and `vane.ts` changed. Proof was the per-wave `hashWorld`
fingerprint of every shipped wave 60 beats in, identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — the check and the land run longer than the cut did.

## 2026-09-14 · claude/queue-items-8b11f4 — `maze-round.ts` is at the limit: what THE MAZE remembers is a second subject

The round held the state — `MazeState` with a paragraph per field, the fresh
install and the wipe a phase performs — beside the fight. The state moved to
`maze-state.ts`; the round, the controls, the verdict, the hash, the boss
union, the wave start and two test files import it from there, and the barrel
re-exports from both. Proof was the per-wave `hashWorld` fingerprint of every
shipped wave 60 beats in, identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: writing — nine import lines to re-point, each asserted before it was replaced.

## 2026-09-14 · claude/queue-items-8b11f4 — `join.ts` is at the limit: the code and the link are a second subject

The room screen carried four helpers about the code itself — drawn fresh,
read off a link, written into one, handed to the other phone — after the one
function that binds the chip and the sheet. They moved to `join-link.ts`, the
file `join-link.test.ts` was already named for; the screen, the shell and the
test import from there. Proof was that test and the typecheck: the screen is
a DOM binding with no headless test, and nothing about it moved.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — `check:fast` reaches the whole of `apps/game` from a change to its shell.

## 2026-09-14 · claude/queue-items-8b11f4 — `hull.ts` is at the limit: the skin is a second subject

The hull's drawing carried the palette it is painted in — `HullSkin`, the
player's own and THE MIRROR's. The three moved to `hull-skin.ts`, and
`hull.ts` re-exports them beside `hull-frame.ts`'s, so the sixteen files that
take a skin from `./hull.js` are untouched. One line slice was off by one and
tripped its own assertion before it wrote anything. Proof was the canvas op
log of THE ROCK, THE MIRROR and THE WELL, 480 frames from each seat, hashed
identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — a render change reaches every frame test, and `check:fast` runs the lot.

## 2026-09-14 · claude/queue-items-8b11f4 — `torch.ts` is at the limit: a rock's size is a second subject

The torch's picture opened with four measurements — how big a rock is and
which way it faces — that eleven of its nineteen importers took without
wanting a drawing. They moved to `rock-size.ts`, and seventeen import lines
were re-pointed by a script that split each into a size half and a drawing
half; the package index exports `torchRadius` from the new file. Proof was
the canvas op log of five rock waves, 480 frames from each seat, hashed
identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — the render suite again; the cut itself was one slice and one regex.

## 2026-09-14 · claude/queue-items-8b11f4 — `siren.ts` is at the limit: the dial is a second subject

The siren's placement, its two chips and its duty word shared a file with
ninety lines of dial. The dial moved to `siren-dial.ts` beside
`siren-seats.ts`, exporting `drawDial`, its radius as `DIAL_R` and the tick
colour the duty word borrows; `halo`, `mixHex` and `PALETTE` went with it.
Proof was the canvas op log of four waves that light the siren, 480 frames
from each seat, hashed identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — the render suite; the rename of `R` to `DIAL_R` was one regex, checked against the diff for prose it might have touched.

## 2026-09-14 · claude/queue-items-8b11f4 — `maze-heart.ts` is at the limit: the pulse is a second subject

The heart's numbers — which blood the round is on, the double thump, the
tempo from whole to hurt, the beats a wound lasts — shared a file with the
drawing of its veins, muscle, chamber and wound. They moved to
`maze-pulse.ts`, with the arithmetic that turned a `MazeState` and a beat
into `time`, `struck` and `squeeze` folded into one `heartPulse` the drawing
reads; the three files that wanted the blood alone point at the new file.
Proof was THE MAZE's canvas op log from both seats over 480 frames, hashed
identical before and after.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — the render suite; the slice was one line long once and the assertion caught it before anything was written.

## 2026-09-14 · claude/queue-items-8b11f4 — `volley-shards.ts` is at the limit: the cutting is a second subject

The shell's cutting — the `Piece` shape, the arc-sector cutter, the centring,
three cuts a sector and the rind's depth, the speed, lift and spin a piece
leaves with — shared a file with the flight and drawing of what was cut. It
moved to `volley-pieces.ts` as one `cutShell` the effect's `ingest` calls
with the sector it worked out. Proof was a scratch that ingests two wards and
two hatches and draws forty frames into the stub canvas, its op log hashed
identical before and after. The first name chosen for the sibling,
`volley-cut.ts`, was already a file — the inside of the ball — and the write
went over it before the typecheck said so; restored from git, and the scratch
had to leave the tree before `check:fast` because the purity test reads
`tools/probe/scratch/` too.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 10 |
| looking | 0 |
| friction | 5 |
| landing | 5 |

Bottleneck: friction — a sibling written over a file that already had the name; `test -e` before the write from now on.

## 2026-09-14 · claude/queue-items-8b11f4 — `hull-frame.ts` is at the limit: the mood is a second subject

The hull's geometry for one frame shared a file with sixty lines of what the
ship is doing — `HullMood` and `LobePositions`, two interfaces whose
documentation is most of their length. They moved to `hull-mood.ts` and come
back through a type re-export, so the forty files that import one of them
from `hull-frame.ts` are untouched. A type-only move: the typecheck is the
proof, and THE HAND's canvas op log from both seats over 480 frames is
identical before and after for form.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 0 |
| landing | 5 |

Bottleneck: landing — the render suite; the slice was off by the length of one doc block until the edges were read off `grep -n` rather than counted.

## 2026-09-14 · claude/queue-items-8b11f4 — `menu.ts` is at the limit: the questions it asks in place are a second subject

The menu's closure bound the four two-step questions — LEAVE ROOM's and the
three difficulties' — in the middle of opening, closing and wiring CONTINUE.
The binding moved to `menu-steps.ts` as one `bindMenuSteps(dom, b)` handing
back `cancel` and `cancelLeave`, which `close` and `paintLink` call. Two
tests read `menu.ts`'s source for the two-steps — `menu-front.test.ts` for
START AGAIN and `confirm.test.ts` for the menu asking at all — and read the
new file now; the first still reads `menu.ts` for CONTINUE.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 5 |
| landing | 5 |

Bottleneck: friction — two tests grep the source of `menu.ts` and had to be found by running them, not by the typecheck.

## 2026-09-14 · claude/queue-items-8b11f4 — `menu-view.ts` is at the limit: the rows are a second subject

The `MenuEntry` shape, the one map over all three lists, `drawEntries` and the
`setEntry`/`entryRoot` pair went into `menu-rows.ts` as `entryRows()`;
`menu-view.ts` draws each page through `rows.draw` and hands `rows.set` and
`rows.root` out on `MenuDom` unchanged, so `menu.ts` and the tests did not
move. `menu-entries.ts` imports the shape from the new file. 250 → 219 and 58.

| Where | Minutes |
|---|---|
| reading | 5 |
| writing | 5 |
| looking | 0 |
| friction | 5 |
| landing | 5 |

Bottleneck: the slice script's line assertions were checked *after* the first
file was written, so a one-line miscount left the tree half cut and the file
had to be restored from git before the second run.

## 2026-09-14 · claude/queue-items-8b11f4 — Eleven files at the limit, queued for a cloud session

The queue was empty and the owner asked for what a cloud session could take
over. Every source file at 249 or 250 lines was outlined — its top-level
declarations and its importers — and the eleven with a seam a cold session
can cut without a decision were written up, each naming the block by its
lines, the sibling it goes to, which importers move and which stay behind a
re-export, and the test that proves it. `stage.ts`, `contour-ruler.ts`,
`segmented.ts` and `land/run.ts` are one function each and were left alone.

| Where | Minutes |
|---|---|
| reading | 15 |
| writing | 10 |
| looking | 0 |
| friction | 5 |
| landing | 5 |

Bottleneck: the eleven entries would not go through a bash heredoc — the
shell stopped on an apostrophe inside it — and were written to a scratch file
and appended from there; and `Files:` may only name files already on `main`,
or the queue marks the entry stale, so each new sibling is named in the body.

## 2026-09-14 · claude/queue-tasks-kkqozz — `versus-probe.ts`: the probe's clock out of the seat decision

Queue item, one of eleven files at the 250-line limit with its cut named.
`versus-seat.ts` held sixty lines of argument about comparing two seats by
difference, then the probe's clock — `SAMPLE_EVERY`, `SAMPLES`, `MAX_SAMPLES`,
`ProbeSchedule`, `probeSchedule` — and only then the decision itself. The clock
is `versus-probe.ts` now, with its own doc; the seat file imports it and the
test re-points. 250 lines becomes 207 and 59. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `versus-seat.ts` whole, who imports `probeSchedule` |
| writing | 5 | the move, the new file's header, one import re-pointed |
| looking | 0 | nothing visible moved — a file split |
| friction | 0 | none |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the cut was named in the entry, and the whole cost was
reading enough of the file to be sure nothing else crossed it.

## 2026-09-14 · claude/queue-tasks-kkqozz — `versus-advance.ts`: the step out of the pair

Queue item, the second of eleven files at the limit. `versus-pair.ts` is a pair
of phones — two canvases, a crop window, BLINK, a settle hash, a freeze — and
`advance`, one tick of a pose's world, was inside it while four tests and the
seat probe imported it wanting no pair at all. It is `versus-advance.ts` now,
with the doc that says why a rebuilt world keeps its own events; five importers
re-point. 250 lines becomes 230 and 36. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `versus-pair.ts`'s head, the five importers |
| writing | 5 | the move, the new file's header, five imports, one now-unused `step` |
| looking | 0 | nothing visible moved — a file split |
| friction | 0 | none |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: writing — `step` stayed behind in the import list and only the
linter noticed, which is the one thing a move of this shape leaves.

## 2026-09-14 · claude/queue-tasks-kkqozz — `skins/scatter.ts`: the dart-throwing out of PORE

Queue item, the third of eleven. `pore.ts` opened with `ScatterPoint`,
`ScatterOptions` and `poissonScatter` — blue noise inside a contour, which
`sucker.ts` imported from it, so one skin read as being built out of another.
The engine is `scatter.ts` now and both skins import it; the field, the
hotspots, the bump paint and the two `PORE` skins stay. 250 lines becomes 192
and 73. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `pore.ts`'s first ninety lines, `sucker.ts`'s import |
| writing | 5 | the move, the new file's header, two imports, two doc lines that named the old home |
| looking | 0 | nothing visible moved — the same darts in the same order |
| friction | 0 | none |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — `BumpPaint` sits between the two halves of the cut and
belongs to the skin, so the move is not one contiguous span.

## 2026-09-14 · claude/queue-tasks-kkqozz — `skins/light-axis.ts`: the axis out of the passes

Queue item, the fourth of eleven. `light.ts`'s own header names the seam —
*one direction, four constructs, one line that hangs them on a body*: the four
constructs are what eleven skins import and they stay, and everything they are
built out of moves. `KEY` is defined with the axis and re-exported from
`light.ts`, because fourteen skins import that name from there and a definition
left behind would have been a cycle. 249 lines becomes 156 and 135.
About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `light.ts` whole, which names the four passes actually use, who imports `KEY` |
| writing | 5 | the move, the new file's header, nineteen exports, one re-export |
| looking | 0 | nothing visible moved — a file split |
| friction | 0 | none |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: writing — `keyAxis` reads `KEY` and `BODY`, so leaving `KEY` in
`light.ts` as the entry's wording suggests would have made the two files
import each other; a re-export keeps the name where the skins look for it.

## 2026-09-14 · claude/queue-tasks-kkqozz — `veer-clown-figure.ts`: placing the rider is not describing it

Queue item, the fifth of eleven. `veer-clown-shape.ts` held both the clown's
*shape* — four interfaces and one record of multipliers, every number a
fraction of a head or a rock — and the arithmetic that puts it on a rock of a
given centre and radius. The two are argued over by different people: the shape
by an eye, the placing by a caller. `clownFigure` and `clownLoops` are their
own file and the barrel re-exports both, so `render/veer-clown.ts`,
`render/veer-look.ts` and the shape sheet's subject import exactly what they
did. 250 lines becomes 156 and 108. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the file's tail, the barrel block, who imports the two names |
| writing | 5 | the move, the new file's header, the barrel's second export line |
| looking | 0 | nothing visible moved — a file split |
| friction | 0 | none |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the cut is clean, and the work was checking that nothing
outside `packages/content` reaches past the barrel for either name.

## 2026-09-14 · claude/queue-tasks-kkqozz — `ready-words.ts`: the sentences off the ready page's measure

Queue item, the sixth of eleven. `ready-page.ts` held the page's *measure* —
where the column's rows fall, given nothing but a layout, so a circle does not
move with the length of a wave's sentence — and the words written in them:
`label`, `ask`, `waiting` and their state. The measure is argued over in
pixels, the words in sentences, and every line of the second half is an
instruction the owner gave about how much to say. `ASK_SUB` and `LABEL_GAP` go
with the words, whose own heights they are, and the measure imports them back.
`ask` drew HOLD ANYWHERE at a literal 18 beside a constant that is 18; beside
each other now, it reads the constant. 249 lines becomes 178 and 100.
About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the file's head and tail, where the two constants are read |
| writing | 5 | the move, the new file's header, the imports, one literal turned back into its constant |
| looking | 0 | nothing visible moved — `frame.test.ts` and `guide-nav.test.ts` draw the page |
| friction | 0 | none |
| landing | 5 | `check:fast` at two and a half minutes, the commit, `bun run land --keep` |

Bottleneck: landing — this is the first of the eleven whose diff reaches
`packages/render`, so `check:fast` draws every frame rather than 90 files of
tools.

## 2026-09-14 · claude/queue-tasks-kkqozz — `sound-row.ts`: one sound is not the catalogue

Queue item, the seventh of eleven. `sound-page.ts` built both the sheet — which
family is showing, the status filter, the tabs, the legend — and one sound's
row inside it. The row is `sound-row.ts` now and takes the `Engine` it plays
through as an argument rather than reading the module-level one, which is what
kept it next door in the first place. `line` is exported with it: the page
prints its own three notes the same way, and leaving a three-line DOM helper on
the page would have had the row importing the page back. 249 lines becomes 168
and 107. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `sound-page.ts` whole, where `engine` and `line` are read |
| writing | 5 | the move, the new file's header, the engine argument, `line` exported |
| looking | 0 | nothing visible moved — a file split |
| friction | 5 | four rounds of the linter for imports the move left behind, one name at a time |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — biome reports one unused-import group per run, so a
move that strands four names costs four runs rather than one.

## 2026-09-14 · claude/queue-tasks-kkqozz — `scene-overlay.ts`: drawing a scene is not placing it

Queue item, the eighth of eleven. `scene-art.ts` decided *where* a draft's
bodies stand — the fit, the scale, the half-height a label clears, one `Placed`
each, none of it touching a context — and then drew them. The drawing is
`scene-overlay.ts` now, and the `drawMarks` re-export goes with it, so
`scene-panel.ts` asks one file for the placing and one for the picture. `TINT`
stays where a colour is decided: by the time a body reaches the overlay it
carries one, so the entry's suggestion to export it turned out not to be
needed. 249 lines becomes 176 and 93. About 15 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the file's head and tail, who imports `drawOverlay` and `drawMarks` |
| writing | 5 | the move, the new file's header, `scene-panel.ts`'s two import lines |
| looking | 0 | nothing visible moved — `scene-label.test.ts` holds the placing |
| friction | 5 | four rounds of the linter for stranded imports, one group per run |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — the same one-group-per-run linting the sound row cost,
and this move stranded six names across three packages.

## 2026-09-14 · claude/queue-tasks-kkqozz — `gyre-wheel.ts`: finding the wheels is not drawing one

Queue item, the ninth of eleven. `gyre.ts` found the wheels on the field and
looped over them — a question about a world — and then drew one, which is a
question about six constants and a context. The drawing is `gyre-wheel.ts` now
and the six shares-of-the-reach go with it, since nothing else reads them.
Proved unchanged the way the entry asked: the op log of
`runFrames(peakWorld("theGyre"), role, 480)` is byte-identical either side —
378 579 calls hashing `3ad8368583005f5a` on p1 and 381 244 hashing
`a4d37db09178fa38` on p2. 249 lines becomes 86 and 181. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `gyre.ts`'s declarations, `frame-harness.ts`'s `runFrames` and the stub's op log |
| writing | 5 | the move, the new file's header, both import blocks rewritten by hand |
| looking | 5 | the op-log hash taken before the move and again after it, two seats each |
| friction | 5 | `biome --write --unsafe` is blocked by a hook, rightly — it deletes a comment with the import under it — so the stranded imports go by hand |
| landing | 5 | `check:fast` at two and a half minutes, the commit, `bun run land --keep` |

Bottleneck: friction and looking together — a render move has to be proved
byte-identical, and the import cleanup after it cannot be automated here.

## 2026-09-14 · claude/queue-tasks-kkqozz — `perf/run-types.ts`: a run's record, apart from the verdict

Queue item, the tenth of eleven. Two thirds of `compare.ts` was the shape of a
run rather than the comparison of two — `WaveCost`, `Run`, `WaveDelta`, each
field carrying the argument for its own existence. They are `run-types.ts` now
and `compare.ts` re-exports all three, so the ten files that ask it for them
ask it still. 249 lines becomes 146 and 125. About 10 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the three interfaces and where the comparison's own doc begins |
| writing | 5 | the move, the new file's header, the re-export line |
| looking | 0 | nothing visible moved — a file split |
| friction | 0 | none; the first of these eleven that stranded no import |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: reading — the cut is between an interface and a doc paragraph that
belongs to the function under it, which is one line further down than it looks.

## 2026-09-14 · claude/queue-tasks-kkqozz — `vein-pulse-tree.ts`: growing the filaments is not lighting them

Queue item, the last of eleven. `vein-pulse.ts` grew the branching tree once in
`build()` — a walk deliberately the same shape as `vein.ts`'s, because the two
skins are on the page to be compared — and then lit it on every frame, a front
travelling out along arc length. The growing is `vein-pulse-tree.ts` now; `Lit`
stays, since only `layer` and `pulse` read it. 250 lines becomes 148 and 122.
About 15 min.

Queued on the way out: five of these eleven spent the same minutes rebuilding
import lists a move had stranded, because biome's only fix for an unused import
is the unsafe one the guard blocks — and blocks rightly, since it eats the
comment above the import.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the file's constants and types block, where `Lit` is read |
| writing | 5 | the move, the new file's header, three import lists rebuilt from real code use |
| looking | 0 | `skin-still.test.ts` mounts every skin; nothing visible moved |
| friction | 5 | the same stranded imports as the others, and a regex that matched a name inside a comment |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — deciding which names an import list still needs has to
be done against the code with the comments stripped, which is exactly the
script the queue entry above asks for.

## 2026-09-14 · claude/queue-tasks-kkqozz — BACK INTO THE GAME: a reload is not a meeting

The owner's task: two people are playing, one of them reloads, the other phone
is still in the room waiting, and the menu had no way back that did not ask
something of both of them. `last-room.ts` remembers the code on every status the
room sends and forgets it on every deliberate leave; `menu-rejoin.ts` is the top
button, in the accent's colour with the code at the room screen's own size,
above the four rows. Photographed on the built game with a room remembered a
minute ago, and pressed: the menu closes, the room screen opens on ACDE and the
link starts reaching it. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `menu.ts`, `menu-link.ts`, `menu-view.ts`, `pairing.ts`, `shell.ts`, `link.ts`, how the tests stand in for a DOM |
| writing | 20 | `last-room.ts`, `menu-rejoin.ts`, the paint, the shell's one leave door, the CSS, sixteen cases |
| looking | 15 | a probe that opens the built game with a room in storage, shoots the menu and presses the button |
| friction | 5 | the probe waited on a menu that was behind the six intro pages; the key that gates them is the finding below |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: writing — the button is twenty lines and the decisions around it
are the work: how long an offer is worth making, what it may honestly claim
about the other phone, and which leaves tear it up.

## 2026-09-14 · claude/queue-tasks-kkqozz — `format` stops sorting, and the sort gets a name

The queue's own item, reproduced first: two imports with a doc comment each,
one `biome check --write`, and the first comment stands over a blank line
while the second reads as if it were written about the other import. That is
the harm `guard.ts` blocks `--unsafe` for, arriving through the command the
guard sends a session to instead. `format` is now
`--assist-enabled=false`, which keeps the formatter and the safe lint fixes
and drops only the move; `bun run imports:sort` is the sort, on purpose, with
a diff to read. `bun run lint` is unchanged, so the order is still enforced on
`main` — it just asks rather than rewrites. Three tests run the script strings
themselves, outside the repository, so they answer for the flags. About 25 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `package.json`, `biome.json`, `imports/run.ts`, `guard.ts`'s advice |
| writing | 5 | two script lines, the commands doc, three cases |
| looking | 0 | nothing drawn |
| friction | 5 | a scratch reproduction outside the tree pulled its own biome and sorted nothing; `queue done 1` refuses a position |
| landing | 5 | `check:fast`, the commit |

Bottleneck: reading — the entry names three fixes and the one it recommends
reads two ways, and only one of them changes anything. A `format` that chains
the sort behind the formatter is still a silent sort; the fix had to be that
`format` stops sorting at all.

## 2026-09-14 · claude/queue-tasks-kkqozz — CLEAR THIS DEVICE takes the intro flag, and the sweep stops being a list

The queue's own item, and the half worth fixing first was the test: it swept a
*named list* of seven source files for `"neon-spore.…"` strings, `intro.ts` was
never on it, and so the one test written to catch a stored key nobody clears
could not see the file the uncleared key was in. A list of files to sweep has
the same failure mode as the list of keys it is checking. It is
`new Bun.Glob("*.ts")` over `apps/game/src` now, which cannot go stale, and
`neon-spore.intro` fell straight out of it — taken out and put back to watch
both cases fail with the key named. The key itself is cleared, which is the
reading the button's own sentence gives: the next person to hold the phone
meets the front door rather than the menu. About 35 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, `settings.ts`, `intro.ts`, `menu-settings.ts`'s handler, every `neon-spore.` literal in the tree |
| writing | 5 | the glob, the widened pattern, the key, two doc paragraphs |
| looking | 0 | nothing drawn |
| friction | 5 | `git checkout` to undo a one-line sed took the file's real edits with it |
| landing | 5 | `check:fast`, the commit |

Bottleneck: none worth the name — the entry had done the reading. The one trap
was the sweep's own pattern: `sign-in-config.ts` carries
`"neon-spore.firebaseapp.com"`, a host and not a key, and it is the closing
quote in the pattern that keeps it out. Widening the pattern for a hyphenated
key had to keep that.

## 2026-09-14 · claude/queue-backlog-604107 — A tutorial says it is one: the band, the flash, the welcome

The owner's item, three parts. The plate became a full-width band across the
top with a rim in the seat's colour round the picture, a press on a film page
answers with the bar flashing (`GuideStage.nudge`, a renderer hook the app
calls from `briefing.ts`), and a device's first tutorial opens under a
welcome page drawn on the canvas — intro's arrangement, on the guide's first
page instead of the menu, held on its first frame under it. Every frame is
drawn again in `guide-frame.test.ts`, on four sizes, at the loudest moment
and at rest. About 40 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the entry, the plate and nav files, `intro.ts`'s sheet, `frame.ts`'s clock, the frames tool's drive |
| writing | 15 | the band and rim, the nudge path through renderer → app, `welcome.ts`, `guide-welcome.ts`, `canvas-sheets.ts`, `nav-slab.ts`, the tests, the skill |
| looking | 10 | a film page through `bun run frames`, then the welcome through the preview — twice, because the first visit had spent its once |
| friction | 5 | `guide-nav.ts` over 250 lines, LF written into CRLF files, a queue title over 80 characters |
| landing | 5 | `check:fast`, the commit |

Bottleneck: photographing the welcome. `bun run frames` has no way to ask for
it, and in the preview the page is once per visit — the first frame under
`?wave=1` used it up before the guide was jumped to, and the second visit had
to land on the guide's first page from the door. The picture was finally taken
by a throwaway playwright script against the running preview.

## 2026-09-14 · claude/gum-swipe — THE GUM is swiped out of the field, and splashes when it lands

The owner's task. The gum stops sticking to the ship: either seat's thumb on
the falling drop, carried `gumSwipeMilli` to the left or to the right, flings
it out level along its row on the rock's crossing path, and a drop that
reaches the hull is a scarless `breach` — the hull takes it at once and a
splash runs across the whole ship in its venom (`gum-splash.ts`). The old
mechanic — the smear on the plating, the cannon under it, player 2's swipe
toward the nearer wall — is on the NOT BUILT YET page with the tree it lives
in. Sim, net, render, audio, content, the wave's rehearsal, the director's
poses and notes, the specs. About 90 min, split around THE LEAK's queue entry.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `sim/gum.ts` and its render, the grip and drag path, the rock's crossing, THE FENCE's strike and `breachUnscarred`, the rehearsal's scene |
| writing | 45 | the sim and its tests, the `gripBody` drag through net, `gum-splash.ts` and the flight look, the audio binding, the scene, the director's pose and notes, the four specs, the ideas entry |
| looking | 10 | the rehearsal's timing through a probe, the splash frame through the preview |
| friction | 15 | the heredoc the Bash tool refused, a gesture name outside the director's union, a brush note over sixty characters, two counts in `audio.md`, the act file's biome wrap |
| landing | 10 | `check:fast` twice, `bun run index`, the commit, the landing |

Bottleneck: the width of it. One mechanic touches a sim file, a render file,
an audio binding, a scene, a wave, a director pose, three notes and four specs,
and each of those has a test that names the old words — most of the friction
was finding the next place the sticking was still described after the code had
stopped doing it.

## 2026-09-15 · claude/queue-tasks-kkqozz — `relay:check:all`, and the relay a cloud session was told it had not got

Asked for queue work a cloud session can do, and most of what is waiting says
it wants *two browsers against a wrangler*. So the first question was whether
that is still true: it is not. `apps/server/dev.ts` comes up here, and all four
checks pass against a real Durable Object — in step, the split caught at tick
300, the third device told the room is full, a dropped seat back in step.
`relay:check:all` is the throwaway script two lanes have now written, as a
command: one foreground process, a `/net/health` wait, the four runs, and a
`finally` that stops the wrangler whether they passed or not.
`docs/cloud-session.md`, CLAUDE.md and the net-change skill said the sandbox had
no wrangler; they say what happened instead. About 45 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue's fifteen, which are reserved and why, the net-change skill, `dev.ts`, `check.ts` |
| writing | 15 | `all.ts`, the script entry, eight cases, three documents and a skill |
| looking | 15 | wrangler tried by hand first, then the four checks twice — once by hand, once through the new command |
| friction | 5 | the first line of a green run was bun's own echo of the command rather than the verdict |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — the whole of this lane is one question answered by
running something for two minutes, and the value is that nobody has to ask it
again.

## 2026-09-15 · claude/queue-tasks-kkqozz — the wait for the other player, and the timer that was really firing

Step 5 of the room workflow, now that a cloud session can run a relay. The
entry named two suspects and reproduced against a live Durable Object neither
of them fires: a device left silent for 24 seconds kept its seat, because
`SEAT_SILENT_MS` is only read while the room computes its seats and nobody was
making it; and `troubleOf` answers only for `lost` and `stalled`, so a phone
that is merely `waiting` never raises the card. What fires is
`RECONNECT_TRIES` — six tries at 900 ms is **5.4 seconds**, against a seat the
room holds for ten. The blackout run shows both sides: with the old budget the
partner arrives to `waiting peers=1` and the creator sits in `lost`; with the
new one both reach `ready peers=2`. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry's step 5, `seat.ts`, `room.ts`, `hold.ts`, `link-socket.ts`, `link.ts` |
| writing | 15 | `WAITING_TRIES`, the budget read at the drop, `rearm`'s argument, four cases |
| looking | 25 | four probes: a silent seat, then a cut line, then a blackout — each run twice, with the fix and without |
| friction | 5 | `link.ts` sits at exactly 250 lines, so the first shape of the fix could not be added to it at all |
| landing | 0 | `check:fast`, `relay:check:all`, the commit, `bun run land --keep` |

Bottleneck: looking — three reproductions were wrong before one discriminated,
and each costs twenty seconds of wall clock plus a wrangler start.

## 2026-09-15 · claude/queue-tasks-kkqozz — `room-shot`, and two unverified entries closed by running them

The two `Unverified` entries that wanted *two phones in one room* — the gear's
tempo arriving, and the four-step room screen walked by a creator and a joiner
— were opened against a real Durable Object and both hold. The tempo a device
carries into `link.join` reaches the other phone through the room; the
creator's page turns from READ THIS OUT to THE ROOM the moment the joiner
arrives, and both seat pills carry the two names. `room-shot` is the rig, which
three sessions had now written as a throwaway: it starts the relay and the
preview, walks both trails, prints each phone's heading and writes a PNG each.
About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the two entries, `join-steps.ts`, `menu-shot.ts`, `menu-press.ts`, `serve.ts` |
| writing | 20 | `room-shot.ts`, `relay-up.ts`, three cases, the command and its line |
| looking | 25 | the tempo probe, then the two-phone walk three times, and the four screenshots |
| friction | 5 | the commit button says ENTER THE ROOM, not JOIN — found halfway through a two-minute run, which is what the new test now catches in a second |
| landing | 0 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: looking — every question here costs a wrangler start and a build,
and the only way to shorten it was to stop writing the rig again.

## 2026-09-15 · claude/queued-tasks-f45f36 — the partner's row, and the wave written against the other seat

The last `Unverified` entry from the PLAY-as-partners landing, opened against a
real Durable Object. Two phones each remembering the other press CONTINUE GAME
WITH and land in one room — LUY4 on both, THE ROOM, YOU/BEN and ADA/YOU — so
`roomForPair` derives the same code apart. Both press START, the wave opens on
both, and one phone jumped to wave 3 writes BEN at `furthest: 2`; a fresh tab
of that phone says CONTINUE GAME WITH BEN · WAVE 3. `room-shot --via partners`
is the first walk; the second was a throwaway probe. About 60 min.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `pairing.ts`, `partners.ts`, `menu-link.ts`, `room-shot.ts` and the two files under it |
| writing | 10 | `room-phones.ts` out of `room-shot.ts`, the `--via partners` walk, the probe, two cases |
| looking | 10 | the walk once green, the probe three times, three PNGs |
| friction | 20 | wrangler would not start in a fresh worktree without `apps/game/dist`, and `room-shot` did not exit after its last line — four runs killed by hand before the orphaned preview was found holding the pipe; both fixed |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

Bottleneck: friction — a run that ends and does not exit looks exactly like
a run that has hung, and each look cost a wrangler start; the answer was one
`ps`, and it took four runs to think of it.

## 2026-09-15 · claude/queued-tasks-2-f45f36 — the seat the host picks reaches the other phone

The wire half of step 4 of the room screen. A `seat` message the room honours
only from the host and before beat zero; one persisted swap bit that every
seat lookup reads through, because a socket's tags cannot change; `host` on
the welcome, re-sent to both phones on a swap and on a tempo pick;
`Link.pickSeat` and `LinkStatus.host` on the client. Ten cases in
`room-seat.test.ts` against a real workerd, the four relay checks green.
About 15 min by the clock, 12:45 to 13:00.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `room.ts`, `seat.ts`, `room-tell.ts`, `room-start.ts`, `link.ts`, `room.test.ts`'s phone |
| writing | 5 | the protocol, the rule, the tags, the re-greet, `link-ask.ts`, `phone.ts` out of `room.test.ts`, ten cases |
| looking | 0 | nothing visible moved |
| friction | 5 | six relay tests hung on room codes with an S in them (the alphabet has none); `link.ts` and `room.ts` both over the line limit; the root typecheck pulled `seat.ts` in through a pure test |
| landing | 5 | `check:fast` four times, `relay:check:all` twice, the commit, `bun run land --keep` |

Bottleneck: friction — a refused upgrade looked like a hang for a whole
timeout, and the two files at their limit each cost a split before the
check went green.

## 2026-09-15 · claude/queued-tasks-2-f45f36 — the room screen's step 4: the host picks, both hold READY

The screen half of step 4. The two seat pills are the host's presses and the
other phone's reading; three tempi under them, the host's too; two READY
circles in DOM in place of START, the own one filling under a thumb over the
guides' `readyHoldMs`, both drawn on both phones. DIFFICULTY left the PLAY
page. Two browsers against a wrangler saw the whole of it and one PNG went
to the owner. About 15 min by the clock, 13:02 to 13:17.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `join.ts`, the step markup, `join-words.ts`, `briefing.ts`, `ready-circles.ts`, `menu-entries.ts`, `menu-link.ts` |
| writing | 5 | `join-room.ts`, `join-room-step.ts`, the markup and CSS, the tests, `holdReady`, the DIFFICULTY row out |
| looking | 5 | the two-phone probe three times, the PNG, `room-shot` once |
| friction | 5 | `#joinScreen .step button` outranked the pills' and the tempi's own rules twice — gold outlines on everything, then the own pill's gold gone |
| landing | 5 | `check:fast`, the index, the commit, `bun run land --keep` |

Bottleneck: friction — a selector one id short cost two probe runs, each a
wrangler start, before the picture matched the intent.

## 2026-09-15 — queued-tasks — THE BALLOON, three of its four points

The queue's *THE BALLOON enters at a wall, never sinks, and is a torch at the
top*. Points 2, 3 and 4 landed; point 1, the burst drawn as a balloon coming
apart, is still open and stays in the queue on its own.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry twice — once before the lane that threw itself away and once after — `spawn.ts`'s arrival fields and `popCoil`'s handoff |
| writing | 60 | `balloon-entry.ts`, `topOut`, the two config numbers, the film, and nine test cases rewritten around a body that no longer stands where it was painted |
| looking | 0 | — nothing new is drawn; the torch and the glide are bodies the game already draws |
| friction | 45 | one whole lane reverted on a failure I could not explain, and the explanation was mine |
| landing | 20 | two rounds of unused imports, a dead event to take out with its five bindings, and the stale prose in six files |

The bottleneck was friction, and all of it was one misreading. `creatureLane`
interpolates `fromCol → col` across the arrival beat, so once the balloon glided
in from a wall it was genuinely out between two columns on that beat and a bolt
up its destination column correctly missed it. I read that as a possible hole in
the shot sweep, threw the lane away and wrote the wrong claim into the queue.
Stepping the world by hand and printing `col`, `fromCol` and the beat — two
minutes — would have answered it before anything was reverted.

## 2026-09-15 — queued-tasks — MOVE CANNON! and MOVE SHIELD!

One of the five drawing jobs the parked LEECH/LIMPET entry left: the word a
harpooned control puts under the dial of the seat that cannot move it.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `duty.ts`'s table and its two clinger rows, `comms.ts`'s gate, `harpoon.ts` |
| writing | 20 | `duty-harpoon.ts` and four cases |
| looking | 0 | — the siren reads the field, so a frame proves nothing about it and the rows are checked directly |
| friction | 5 | one import block biome wanted in a different order than `format` leaves it |
| landing | 10 | `check:fast`, the commit |

The bottleneck was reading, and usefully: the first draft appended the word to
the table's, so the navigator would have read SAY MOVE · MOVE CANNON!. The
table's rows were written for these two as creatures and are right for that;
what the fault needed was a replacement on one seat, which is `fenceWord`'s
arrangement already in the same file.

## 2026-09-15 — queued-tasks — a control heating up under a harpoon

The parked LEECH/LIMPET entry's point 6: the glow that grows toward *about to
explode* while a harpooned control stands still, and starts again on every move.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `drawHull`'s passes, `HullMood`'s fields, the two seat skins, and where a lobe's x actually comes from |
| writing | 40 | `harpoon-danger.ts`, one `HullMood` field, one sim export, twelve cases |
| looking | 0 | — nothing seen yet; the pass is proved by blit counts and the picture is owed |
| friction | 10 | a first frame assertion that compared two different faults and measured the bodies rather than the glow |
| landing | 10 | `bun run index`, `imports:sort`, the commit |

The bottleneck was reading, and it was the right place for it: the ramp had to
be read straight off the world rather than eased, and finding out why — `lay`'s
own argument, two devices agreeing on the tick — took longer than writing the
pass did.

## 2026-09-15 — queued-tasks — a pencil for THE LEECH and THE LIMPET

The owner settled what these two are on 15 September 2026: *they should only
exist as brush, but once they are placed on a tile, for a defined period of
time, the malfunction is applied — I want this for all existing malfunctions.*
They were `MalfunctionKind`s with no pencil, which is a fault nobody could place.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `brushes.ts`, `brush-wave.ts`, `fault-fields.ts`'s note table, `mechanics-wave.ts` |
| writing | 10 | two brushes, two palette rows, two mechanic pairings, one test that counts |
| looking | 0 | — the palette is proved by the tests that build it, not by a frame |
| friction | 5 | the tooltip test found the gap before I did, which is what it is for |
| landing | 10 | `check:fast`, the commit |

The bottleneck was reading, and it was mostly good news: the note table, the
`at`/`beats` boxes and the emitter's beams already covered these two kinds, so
the only thing missing was the button.

## 2026-09-15 — queued-tasks — the line a harpoon is fired down

The parked entry's point 1, and the general form the owner restated on 15
September about every fault at once: *it should look like that blue enemy is
triggering or shooting it.*

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `fault-emitter.ts`, `coil-flight.ts` as the pattern for a transient, where the field pass draws the lantern |
| writing | 35 | `harpoon-line.ts`, four wirings into `Effects`, five cases |
| looking | 0 | — still owed a picture; the pass is proved by op counts |
| friction | 15 | `frame-field.ts` went sixteen lines over its ceiling, and a `save`/`restore` on every quiet frame put THE CAIRN over its op budget |
| landing | 10 | `bun run index`, `imports:sort`, the commit |

The bottleneck was friction and it was the budget test doing its job: an
unconditional `save`/`restore` in a pass most waves never use is exactly the
cost that test exists to notice, and the fix — return before it when nothing is
out and nothing is held — is better code than the version that passed by being
remeasured.

## 2026-09-15 — queued-tasks — the code, the square, the timer and the word

The parked entry's last two drawing jobs, landed together because they are one
stack of marks over one body.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `target-lock.ts`'s argument, the lure's label, `faultWindow`, where the body pass ends |
| writing | 30 | `harpoon-mark.ts`, one call in the field pass, ten cases |
| looking | 0 | — the PNG is owed and is the next thing |
| friction | 5 | `frame-field.ts` at 250 exactly, and the index wanted regenerating twice |
| landing | 10 | `check:fast`, the commit |

The bottleneck was reading, and the useful part of it was `target-lock.ts`: the
owner's own rule that four pictures for one idea is three too many meant the
square was a call rather than a rectangle, and that decided the whole file in
one line.

## 2026-09-15 — queued-tasks — the picture, and the three things it found

One PNG of a cannon under a placed leech, which is what the parked entry has
been owed since the simulation half landed. Taking it was the work.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `tools/frames/fault.ts`, `drawStuckClingers`' own placement, `fault-beam-ends.ts`'s fall-through |
| writing | 45 | the `--fault` flag rewritten for a placed fault, `harpoon-place.ts`, both passes moved to the ship pass, one beam case |
| looking | 25 | four frames and two crops, each of which found something |
| friction | 15 | `canvas2d.ts` went over its ceiling on a ten-argument call |
| landing | 10 | `check:fast`, `bun run index`, the commit |

The bottleneck was looking and every minute of it earned its keep: the first
frame showed the round already lost, the second showed the line and the word a
third of a tile to the side of the body, the third showed the lantern giving a
leech a runaway cannon's beam. None of those is reachable from a test — two of
them are *two right answers* rendered next to each other — and the commit before
this one was green.

## 2026-09-15 — queued-tasks — THE LEECH and THE LIMPET stop being creatures

The owner's ruling of 15 September 2026: *they should only exist as brush, but
once they are placed on a tile, for a defined period of time, the malfunction is
applied.*

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `CreatureDef.installed`'s own paragraph, the two waves' guides, `mechanics-handed.ts` |
| writing | 40 | two `installed` rows, two waves rewritten as pencils, four prose blocks, the parked fall on `ideas.md` |
| looking | 15 | two frames of the rewritten wave, the first of which lost the round |
| friction | 15 | four tests that each hold one end of the same fact, and a comment put inside the wave array that the director would have eaten |
| landing | 10 | `check:fast`, the full run, the commit |

The bottleneck was friction and it was the tree being right: `waveNames`,
`isInstalled`, the mechanics table's own list and the guide's length limit each
caught one end of the change, and the wave file's own header had already
written down the mistake I made inside the array.

## 2026-09-15 — queued-tasks — what the creature left behind

Every path nothing could reach once THE LEECH and THE LIMPET stopped being
creatures: the fall, the fuse, the shake, their four config numbers, their two
hashed fields, one event and one whole render file.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | a grep of thirteen symbols across five packages, and what each of them still had a caller for |
| writing | 55 | eleven source files cut, two test files rewritten, one deleted, one director pose rebuilt around a pencil |
| looking | 10 | one frame before and one after, to see the fuse lights gone and nothing else with them |
| friction | 20 | a guard dropped out of `hull.ts` by accident, which fired the body four times in three beats |
| landing | 15 | three rounds of `check:fast`, the full run, the commit |

The bottleneck was friction and it was one careless replacement: taking the
landing out of `hull.ts` took the *branch* with it, so a harpooned body fell
through to the ordinary breach, was destroyed on the beat it arrived and fired
again on the next. The rewritten frame test counted eight grips where it wanted
two, which is exactly the assertion it was given for.

## 2026-09-15 — bosses-splice-wave — THE SPLICE queued, his way

One queue entry: THE SPLICE as a boss wave of tangled straws fed in number
order, the boss ideas cut, and the BOSSES page taken off once it lands.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue's format, the old SPLICE idea, how SUCK and the maw work, what the BOSSES tab is built from |
| writing | 10 | the entry, with the three answers the owner gave through the question tool |
| looking | 0 | nothing drawn |
| friction | 5 | a title over eighty characters, which the queue's own listing caught |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading: knowing that a suck is already a shipped
control, and which files feed the tab he wants gone, is what makes the entry
one a cold session can drain.

## 2026-09-15 — bosses-splice-wave — seven more entries for the queue

The MECHANICS page cut to four ideas, and the four written up as work with
the owner's answers: destruction in VERSUS, the Mine, Moulting his way, the
Husk his way; then THE WEIGHT's duty words and a contents menu for the long
director pages.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | what the MECHANICS page draws and hides, the three ideas' text, how pods, the wisp, the lure and the duty word work |
| writing | 20 | seven entries, with the seven answers he gave through the question tool |
| looking | 0 | nothing drawn |
| friction | 10 | a heredoc the shell refused, worked around through a file; two titles over eighty characters |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading: each of the four ideas had to be checked against
what already ships before its entry could name the shipped path it rides.

## 2026-09-16 — tutorial-screen-graphics — five looks for the guide's chrome

The owner was unhappy with the tutorial screen's rounded buttons and boxes.
The band, bar and caption went behind a seam (`guide-look.ts`), a pose was
made for them, and five VERSUS candidates were drawn: spotlight, ribbon,
console, rail and coach — three of them moving the header and the buttons
to other places on the phone, the last one shaped after Clash Royale.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | how the band, bar and caption are drawn and hit, `drawNavBody`'s socket, the palette, the VERSUS row and the Pose type |
| writing | 60 | the seam, the pose, five candidates, the shared word button, the links row |
| looking | 25 | seven shots and the corrections they asked for: a stripe over a box, a leader through a ring, a socket's square on the field, a coach over the clock |
| friction | 10 | the shell refusing a heredoc with TypeScript in it, the guard refusing a doubled backslash and biome's `--unsafe`, a crop called with the wrong syntax twice |
| landing | 15 | five files over the line and split, the file index, `check:fast` twice, the commit and the landing |

The bottleneck was looking: every candidate needed a shot and one fix after
it, and the fixes were things only a picture shows.

## 2026-09-16 — bulb-queen-crane — THE CRANE on the field, the variants page removed

The owner asked for THE CRANE, one of the three flank-torch holders drafted on
the director's BULB QUEEN VARIANTS page, to be put into the game by name; the
three whole-body drafts were rejected and the queen kept as she is; and the
page went, with its twelve files.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the director draft's arm and claw, `queen-egg.ts`'s clock and the split rule, `QUEEN_FIGURE`, the budget test |
| writing | 35 | `queen-crane.ts`, the arm and claw wired round the rock in `queen-egg.ts`, the holders' removal, the comments that named them |
| looking | 25 | three runs of frames across the drop: the fingers vanished white on the rock's rim, the arm reaching in from the side found no gap and went up and over |
| friction | 10 | ␍ from python writes in three files, a tsconfig that was not there, a regex that moved one budget row of four |
| landing | 15 | the budget rows remeasured, the file index, `check:fast` twice, the sheet test's floor, the commit and the landing |

The bottleneck was looking: the draft gripped the rock from the side, and the
field has no gap between the hull's tip and the rock, so the arm had to be
redrawn to come up over it — something only a frame at the drop showed.

## 2026-09-16 — bulb-queen-crane — THE ECHO queued, his way

The owner took the *Reverse wave* idea and described his own design for it:
a boss wave whose arrivals are sent a second time invisible, a count on the
boss, a body seen only as it is beaten. Written as one queue entry, sized in
named files, so a session of its own can build it.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the idea's text, THE WELL and THE VANE as the bosses that do not fill a wave, `spawn.ts`'s cursor, the hash's rule on the queue, THE GHOST |
| writing | 10 | the entry |
| looking | 0 | nothing drawn |
| friction | 5 | a shutdown already counting down, cancelled; a title over eighty characters |
| landing | 5 | the queue parsed, `doc-drift`, lint, the commit |

The bottleneck was reading: the design touches spawning and the hash, and
the entry had to say why the echo is derived from the queue rather than
appended to it before anyone builds it the easy way.

## 2026-09-15 — queued-tasks — a balloon coming apart into pieces of itself

The one point of the owner's 14 September ruling that never got built: the end
of a balloon was the same dozen squares every kill throws. It is a break cut
from the balloon's own skin now, torn from a point on the rim.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `Debris`, `shatter`, `break-look` and the two silent lists, to find that every verb a pop needs was already written |
| writing | 40 | one new file and its test, the shreds' paint, four call sites and a seed pulled out of its fourth copy |
| looking | 45 | four rounds of `bun run frames` on a wave held through a split and a pop, at three tunings |
| friction | 20 | a hold at `1600` is not taut — `balloonTautMilli` is 2000 — so the first three captures photographed a balloon nobody was pulling hard enough |
| landing | 15 | `check:fast`, the full run, the commit |

The bottleneck was looking, and it earned every minute: the first cut was one
ring from the middle of the body, and the picture showed sixteen identical
arrowheads opening as an even ring — a shockwave, not a skin. No test could
have said so. Two rings helped and did not fix it; what fixed it was tearing
the skin from a point out on the rim, so the far side comes away in long fast
pieces and the near side in chips.

## 2026-09-16 — queued-tasks — a check that signs in, and the name in the field

The queue's *The client half of a sign-in has no rig*. The server half of the
name registry has been proved against a forged Firebase since it was written;
the client half — `idToken`, `syncName`, the field a sign-in fills — had never
run at all, because running it needed a Google account.

| activity | minutes | what it was |
|---|---|---|
| reading | 35 | `sign-in.ts`, `nickname.ts`, `hello.ts` and its source-scraping test, then `signed.ts`, `names.ts` and `relay.ts` to find that the worker is already raisable from a plain `bun test` |
| writing | 40 | the stand-in and its guard, six small branches in `sign-in.ts`, a 135-line fake document, and a four-part check that drives the shipped screen against a real workerd |
| looking | 5 | two mutations — the field fill, and the registry's subject — to find out whether the new check could go red |
| friction | 30 | a local trunk two commits ahead of an `origin` twelve ahead of it, and three conflicts in the append-only docs to reconcile before a line of work could start |
| landing | 15 | `check:fast`, `bun run index`, the commit |

The bottleneck was friction, and none of it was this lane's: the trunk had
diverged because a landing moves `main` locally and only a push moves
`origin`, so two days of cloud landings and one afternoon of local ones met in
`docs/queue.md`, `docs/time-log.md` and `docs/release-notes.md` at once. The
five minutes of looking is the number worth keeping: a mutation is the cheapest
question a new test can be asked, and both answers came back inside a minute.

## 2026-09-16 — queued-tasks — THE SPLICE, straws fed in the order the numbers say

The queue's *THE SPLICE*, first landing: the whole boss, from the vocabulary to
the picture. A children's path puzzle played by two people who can each see
half of it — the navigator reads the tangle and has no SUCK, the pilot holds
the cannon and the maw and sees a hand's width of straw over each mouth.

| activity | minutes | what it was |
|---|---|---|
| reading | 40 | the queue entry, then `mirror-round.ts`, `fleet-board.ts` and `snake.ts` for the seam a boss is cut along, `control-sets-table.ts` for what a panel owes both seats, and `scene-types.ts` for what a film may carry |
| writing | 120 | five sim files, the hash, four events, four sounds and their cue, two render files, the director's round editor, the mechanics card, the wave, the rehearsal, nine sim cases and six frame cases |
| looking | 20 | four captures at tempo — a number mid-straw on the navigator's screen, the same one arriving on the pilot's, a wrong feed and a clock running out — and the one correction they bought |
| friction | 25 | a Python edit that re-read a file it had already written and lost an import; `bind.ts` and `effects-ingest-silent.ts` both over the 250-line limit; `--press` refusing `2:intake` on a panel where the maw is player 2's |
| landing | 20 | `bun run index`, `bun run format`, two full `check:fast` runs, the commit |

The bottleneck was writing, which is what a boss costs: nothing here could be
borrowed, because THE SPLICE is the first fight whose two screens are pictures
of the *same* thing seen from opposite ends rather than two different subjects.
The twenty minutes of looking is the number worth keeping — it bought exactly
one fix, and no test could have found it: the number coming down the straw and
the label it came from were both on the screen at once, so the tangle said the
one was in two places.

## 2026-09-16 — queued-tasks — the boss ideas go, and five cards are set free

The same queue entry's second landing: the whole **BOSS IDEAS** group, which
the owner cut with THE SPLICE. Three encounters, and two of them had already
shipped as something other than the card they were written on.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `ideas.md`'s `### Bosses`, `backlog.ts`'s group list, and `concept-art.test.ts` for what a shape is joined to |
| writing | 15 | the cut, the comment saying why the page has no boss ideas, and five catalogue cards moved from `draft` to `free` on THE CODEX's precedent |
| looking | 0 | nothing on the field moved; the page this changes is the director's |
| friction | 20 | four tests red in sequence, each one a different copy of the same fact — the group set in `concepts.test.ts`, the name in `backlog.test.ts`, the shape join in `concept-art.test.ts`, the scene join in `scenes.test.ts`, then the draft count in `asset-catalogue.md` |
| landing | 10 | two `check:fast` runs and the commit |

The bottleneck was friction, and it is the honest cost of cutting a heading:
seven scenes and five contours had been drawn at those three ideas, and every
one of them was held to the heading by a test. Making `Scene.suggests` optional
is what let the drawings stay — a picture whose concept was **cut** is set
free, where one whose concept was **renamed** still has to fail loudly.

## 2026-09-16 — queued-tasks — the BOSSES page comes off the director

The same queue entry's third and last landing. The owner's words: *its not
relevant for me any longer*. THE ACT ORDER read the built bosses straight off
`bosses.md` and the ideas beside it had gone with the second landing, so what
was left was a page drawing a list nobody consults.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the four places the entry names — `backlog.ts`, `backlog-page.ts`, `backlog-api.ts`, `index.html` — and `backlog-tabs.ts` for which tab may safely lead |
| writing | 20 | the group, the page, the tab, the `Bosses` argument and two arguments the API no longer reads; `fromRoster` and `dropBuilt` deleted with their only caller; the tests rewritten around a backlog with one page |
| looking | 5 | the sheet opened in the director on this worktree's own server, to see MECHANICS lead and fill |
| friction | 5 | two sheet assertions written against `backlogBosses` and a tab-count floor set the same morning |
| landing | 10 | `bun run index`, `check:fast` and the commit |

The bottleneck was writing, and most of it was subtraction: the page was four
files wide and two helper functions deep, and the only judgement call was which
tab leads now — MECHANICS rather than GRAPHICS, because GRAPHICS draws itself
on first *click* and a sheet that opens on it would open on nothing. That pair
of `class="on"` had no test holding it together; it has one now.

## 2026-09-16 — queued-tasks — MECHANICS keeps only what is not implemented yet

The owner's rule of 15 September 2026, asked as a question and answered as a
rule: a page called NOT BUILT YET shows what is not built and nothing else. It
was carrying the couplings and the assist forms whole, and every section of
either is built or half built.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the entry, `backlog.ts`, `concepts.ts` and the five test files the cut reaches; every `suggests:` in the shape sheet, against every heading in `ideas.md` and `systems.md` |
| writing | 35 | the shortlist and the unbuilt-remainder rule; two spec reads and two groups deleted; a shared `spec-names.ts` for the two joins, and `backlog.test.ts` rewritten around a page of six groups |
| looking | 10 | the sheet opened on this worktree's own server: SYSTEMS at one, CREATURE IDEAS at three, the other four whole |
| friction | 10 | the entry sends the built halves to DOCUMENTATION → SPEC, a room taken off that sheet on 14 September; and a heredoc refused for doubling its backslashes |
| landing | 15 | `bun run index` and two stale rows in it, `check:fast`, the commit |

The bottleneck was reading, and it was the thing that would have gone wrong
silently: cutting nine creature ideas off the page orphans the nineteen
drawings made at them, because both joins that hold a drawing to its concept
were asking the *page* for the list of names. They ask the spec now — a shape
whose idea is off the page is waiting, and only a shape whose idea was renamed
is a picture of nothing.

## 2026-09-16 — queued-tasks — what 5.6 still owes, said truthfully

The first half of the destruction queue entry: the page claimed polygon
clipping, splinters and debris were all three unbuilt and the algorithm
"chosen but unimplemented", and the fracture engine had been in the game since
9 September.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `shatter.ts`, `shatter-fall.ts`, `debris.ts`, `break-look.ts`, `body-hit.ts`, `craters.ts` and the destruction skill, to find which of the three words is actually still owed |
| writing | 10 | 5.6's two closing paragraphs |
| looking | 0 | nothing visible moved — this landing is a document |
| friction | 5 | the rewrite dropped the `Not built:` marker the MECHANICS page cuts a half-built section down to, and emptied the group |
| landing | 10 | doc-drift, `check:fast`, the commit |

The bottleneck was reading, and it is the right place for it: the entry names
three words from a design written before any of it existed, and only one of
them turns out to be unbuilt in the way the page said. The break is built and
lands on the hull on purpose; what is missing is a notch in a body that keeps
falling, splinters off the cut faces, and drift — and drift is missing because
the owner asked for the opposite.

## 2026-09-16 — queued-tasks — two of destruction's three pieces, offered

The second half of the destruction queue entry: `creature:debris` / `drift` and
`creature:splinters` / `shards`, plus the seam `splinter.ts` and the bench rows
that tuned both.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `debris.ts`, `shatter.ts`, `break-look.ts`, `meteor.ts`'s pit call site — what a candidate can actually patch |
| writing | 45 | `splinter.ts`, the `splinters` field, two candidates, two bench rows, the pose rows |
| looking | 25 | `bun run breaks` four times: the drift throw twice, then the slivers at three lengths and three speeds |
| friction | 10 | splinters first placed at a share of the body's widest ray, which stood a slick's out like spines before it had broken; `reachAt` had to be exported |
| landing | 15 | the queue entry for the third piece, `check:fast`, the commit |

The bottleneck was looking, and it was the work: a splinter is two pixels wide
on a phone and the only thing that says whether it reads is the sheet. The
third piece is not here — a notch cut out of a body has no record to patch at
all, so it went to the queue naming the seam it needs rather than being faked
with a crater.

## 2026-09-16 — queued-tasks — THE WEIGHT's dials say the mechanic

The owner read CALL THE BEAT / PRESS ON THEIRS under the siren and found they
never say what the body needs. One line now, on both dials.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `duty.ts`'s whole table, `sim/weight.ts`, the mechanic's own text and the film, to find what the two words were doing instead |
| writing | 20 | the row, the comment, three stale "only" claims beside it, and the test that holds both halves |
| looking | 10 | one frame of THE WEIGHT at 90 ticks, to see the nineteen characters fit under the dial |
| friction | 15 | the rewrite put `duty.ts` at 260 lines; `fenceWord` went to `duty-fence.ts`, beside the `duty-harpoon.ts` the file already had |
| landing | 10 | `check:fast`, the frame, the commit |

The bottleneck was friction, and it was self-inflicted: the row's comment had
to carry why a protocol was the wrong thing to print, and the file had no room
for the paragraph. Splitting out the second world-picked word was the right
answer and was sitting there — `duty-harpoon.ts` had been the first.

## 2026-09-16 — queued-tasks — the impacts leave bind.ts

`bind.ts` was at exactly 250 and `limits.test.ts` fails at 251, so the next
boss with an event of its own was blocked before it started.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the whole switch and `bind-fleet.ts`, to find the group with one subject and the most lines |
| writing | 15 | `bind-impact.ts`, the dispatch, the `WIRING` row and the wiring sentence in `audio.md` |
| looking | 0 | nothing visible moved and nothing audible changed — the same six ids, the same pans, the same pitches |
| friction | 5 | two tests name the wiring files, `catalogue.test.ts`'s own list and `docs/spec/audio.md`'s sentence, and the second is checked against the first |
| landing | 10 | `check:fast`, the commit |

The bottleneck was writing, which for a cut like this is the docstring: the
group had to be worth a file, and what earns it is the rule about which two of
the six are pitched and why the other four are not. `bind.ts` is at 242, so
there is room for one more boss and not for two — the next cut is the ship's
own group, and it is now obvious where the seam is.

## 2026-09-16 — queued-tasks — a press is checked against the wave's own panel

`--press` kept its own table of which seat holds which control, and the table
had the maw down as the pilot's — true until THE CLAW moved it, and false for
two bosses since.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `press.ts`, `control-command.ts`, `controls.ts` and `control-sets.ts`, to find where the fact is already written down |
| writing | 30 | `seatsOnPanel`, the four presses no panel carries, the reordering in `flags.ts`, and the tests, which had to stop naming waves by number |
| looking | 10 | one frame of THE SPLICE from the navigator's seat with `690:2:intake` — the command the tool used to refuse |
| friction | 10 | wave 0's panel is STANDARD 1 and carries two buttons, so half the old assertions were checking a control the wave does not have |
| landing | 10 | `check:fast`, the frame, the commit |

The bottleneck was writing, and most of it was the tests: once a seat is a fact
about a panel, a test that says "a press from the wrong chair is refused" has to
say which panel it means, and the honest way to name one is by its set rather
than by an index that moves whenever a wave is inserted.

## 2026-09-16 — queued-tasks — one fake element under two fake documents

Two files called `fake-dom.ts` each held their own `FakeEl`, overlapping on
half a dozen members and diverging on the rest, and each carried its own copy
of the argument for why neither is a devDependency.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | both files end to end, and every test that imports one, to see which members are actually read |
| writing | 30 | `tools/test/fake-dom.ts` with the union, the shared argument written once, and the two installers cut back to their own document |
| looking | 0 | nothing visible moves: the game and the director draw exactly what they drew |
| friction | 0 | — |
| landing | 10 | `check:fast`, `bun run index`, the commit |

The bottleneck was writing, and the part of it that took the time was not the
class: it was deciding what each caller's doc comment says now that the
argument is somewhere else, so a reader who opens either file still learns why
there is no jsdom here without being sent away to find out.

## 2026-09-16 — queued-tasks — a hit that takes material instead of marking it

Destruction's third piece — a hit cutting a real piece out of a body — had no
seam to be offered on: a rock's craters are painted on a finished face, and a
`MeteorLook.pit` was handed neither the radius nor the clock.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `meteor.ts`, `meteor-look.ts`, `meteor-looks.ts`, `volley-pitted.ts`, `variant.ts` and the VERSUS tests, to find what a candidate can actually reach |
| writing | 45 | the hole list hoisted ahead of the paint, `r` and `time` on `pit`, the three looks exported, and the `notch` candidate that clips the stone to everything but the bites |
| looking | 20 | two `versus:shot` frames of `creature:bite` — the first took so much out that four hits left a jigsaw piece, so the bite came in and the hot lip went up |
| friction | 10 | the pose the slot opens on centred on the tile the rock is *going* to, not the one it is drawn at: `poses-field.ts` kept its own stale copy of `firstOfKind` |
| landing | 10 | `check:fast`, `bun run index`, the commit |

The bottleneck was writing, and the part that decided the shape of it was
finding that a notch cannot be cut from inside `pit` at all: the pit is painted
over a canvas that already has the field on it, so material that is gone has to
be material never laid down — which put the whole change one call earlier, at
`body`, before a stroke of the rock exists.

## 2026-09-16 — queued-tasks — THE MINE, a body a bolt cannot answer

The queue's *The Mine is an enemy, with its seeing seat set on the brush*: a
creature that stands on a tile, is drawn to one seat only, and is answered by
the other seat's finger on that exact square.

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `new-creature`'s six tables, `wisp.ts` and `beatbox-tap.ts` for the two halves this one splits, `nameability.ts` to find out what actually separates two round bodies |
| writing | 120 | `sim/mine.ts`, the `tapTile` command and its codec case, the arrival's row and seat, the silhouette, the blind seat's fuse rings, the defuse strike, the wave, the director's two rows, the bestiary section, three test files |
| looking | 15 | the wave at tempo, and the shape sheet twice over the size axis |
| friction | 35 | the nameability clash with THE LEECH — `rx` cannot separate on size because `footprint` divides by `max(rx, ry)`, so the first fix changed nothing; and three files went over 250 lines in turn |
| landing | 20 | `check`, `bun run index`, the counts in four documents, the commit |

The bottleneck was writing, and the part of it that could not be shortened was
that this creature touches every layer at once: it is the first split in the
game a *wave* chooses rather than a kind, so the seat had to be carried from
`WaveEntry` through the queue, the arrival, the body, the fingerprint, the duty
word and the drawing — seven places that each had a right answer and no shared
one to copy.

## 2026-09-16 — queued-tasks — THE MOULT, a body whose answer expires

The queue's *Moulting, his way: meteor and pod by turns, and player 2 sees what
is next*: one body that is a rock for five beats and a supply cargo for five,
all the way down, where what it is on the beat it reaches the ship is the whole
of what happens.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `new-creature`'s six tables, `pods.ts` for the mouth, `veil.ts` for a form read off a clock, `queen-glyph.ts` for the blend the owner asked for by name |
| writing | 135 | `sim/moult.ts` and `pod-intake.ts`, the arrival branch in `hull.ts`, the blended contour and the two draw paths, the navigator's ghost and pips, the wave, the film, the bestiary section, the director's four rows, two test files |
| looking | 10 | the wave probed at tempo for what each entry beat actually lands as, and the four figures authored against those numbers |
| friction | 55 | five files over 250 lines in turn (`entries.ts`, `bullet-hit.ts`, `creature-state.ts`, `wave-entry.ts`, `scenes.ts`); a first cut of the rule written against `world.beat`; eleven dead imports biome would only remove with `--unsafe`; the film retimed twice against the real simulation |
| landing | 20 | `check`, `bun run index`, `baseline:blank`, the counts in three documents, the commit |

The bottleneck was writing, and the part that could not be shortened was that
the turn had to be **composable**: a form rolled at spawn would have been an
afternoon, but a wave author has to be able to write an entry beat and know
what it lands as, so the clock had to be `waveBeat`, the wave's four figures
had to be probed against the real simulation rather than reasoned about, and
the film had to be retimed twice for the same reason.

## 2026-09-16 — task-performance-optimization — what 296 lanes say about the minutes

The owner asked for the reading of this ledger rather than another entry in it:
*"tasks take quite long time to finish, can we speed up."* The answer is
`docs/lane-speed.md`, and the queue entry the ledger's largest flat cause
earned.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the 296 entries parsed rather than read, then `token-budget.md`, `delegation-cost.md`, `performance.md`'s suite section and `.claude/settings.json` |
| writing | 5 | `docs/lane-speed.md`, the queue entry, three throwaway parsers in the scratchpad |
| looking | 0 | — nothing drawn |
| friction | 0 | `/usr/bin/time` is not on the cloud image; `date` twice instead, seconds |
| landing | 5 | `bun run check` measured rather than merely run, `bun run index`, the commit |

The bottleneck was nothing, and that is the finding: a lane that reads a file
with a script instead of with its eyes costs a quarter of an hour, while the
four longest lanes in the ledger — all creature lanes on the last two days —
cost between 210 and 245 minutes each. The ledger's own shape says the same
thing twice: 14% of lanes carry 38% of the minutes, and the per-lane mean went
from 30.7 on 14 September to 105.3 on 16 September without anything getting
slower. What changed was how much one sitting is asked to hold.

## 2026-09-16 — task-performance-optimization — the recommendations become entries and a rule

The reading of this ledger landed an hour before; this lane turns it into work
somebody can pick up. The owner asked for both halves in one sentence: *"create
tasks for my queue to apply recommendations"* and *"maybe Claude should
automatically do better splitting of tasks I gave."*

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `promptFor` in `tools/queue/claim.ts`, the four director tests that hold one fact, `doc-drift.test.ts`'s record list and its path rule, `scope.ts`'s table |
| writing | 10 | three queue entries, the split rule in `CLAUDE.md`, the table of cuts in `docs/lane-speed.md`, the docs rows in `tools/hooks/scope.ts` and their test |
| looking | 0 | — nothing drawn |
| friction | 15 | `check:fast` red on the queue entries: a `Files:` path must already exist and a proposed file may not be backticked anywhere, which nothing said; the landing then red on the same docs row written out a second time in `tools/check/test/fast-scope.test.ts`; the heredoc guard refused a regex, correctly, and the edit went through the Edit tool |
| landing | 5 | `bun run queue` to prove the entries parse, `check`, the commit |

The bottleneck was friction, and it found the thing this lane is really worth:
**a documentation change did not run the test that reads documentation.**
`scope.ts` mapped every `docs/*.md` to `tools/director` and, for the queue, to
`tools/queue` — never to `tools/test`, where `doc-drift.test.ts` lives. So the
lane an hour earlier landed a queue entry naming the file it proposed to
create, green on `check:fast`, and the full check would have refused it. The
row is fixed here and the test says so in its own case — and the fix was red
once more on the way in, a hundred seconds into the landing, because the same
mapping is written out a second time in `tools/check/test/fast-scope.test.ts`:
the *one new fact, four tables* entry this lane queued, met by the lane that
queued it. The other minutes were the same shape one level down: two entries named a mechanism that did not
exist — `doc-drift.test.ts` holds `time-log.md` to nothing on purpose, and
`tools/director/src/scenes.ts` is `scene-world.ts` — both caught by opening the
file rather than trusting the ledger's sentence about it.

## 2026-09-16 — queued-tasks — nine answers to a lost wave, none of them on the field

The queue's *A lost wave has to be seen: the hit, the ship breaking, and go
again*: the owner's own words on 16 September 2026, and his second message
asking for several variants on the VERSUS page first. Three slots, three
answers each.

| activity | minutes | what it was |
|---|---|---|
| reading | 35 | `docs/versus.md` and the README, `break-look.ts` and `debris.ts` for the seam a record that draws nothing is allowed to be, `effects-breach.ts`, `scars.ts`, `craters.ts`, `hull-shock.ts`, `lost-screen.ts`, `pose-kit.ts` |
| writing | 145 | three look records and the two drawers and one transient behind them, `breach-hue.ts`, the `lost-screen.ts` cut, nine candidate paints, two poses, three test files |
| looking | 10 | the frame of THE MOULT sent to the owner, and the three slot pages read back off `bun run versus` |
| friction | 30 | five rounds of biome's import order on files Python had edited; two candidate sentences the distinct test reads as labels rather than claims; a full `bun test` that ran past ten minutes under three parallel runs and finished in ninety-six seconds alone |
| landing | 20 | `check`, `bun run index`, `bun run versus index` three times, the queue entry, three commits |

The bottleneck was writing, and the part that could not be shortened was that a
VERSUS candidate can only patch a record — it cannot add a transient, a call
site or a parameter — so every one of the three pieces needed its *seam* built
and shipped drawing nothing before a single answer could be written. That is
three records, two drawers, one transient and one file cut in half, all of it
proving it changes no pixel, before any of the nine pictures existed.

## 2026-09-16 — task-performance-optimization — the trunk's account of the same days

Asked for more ideas, and the first one arrived by reading the trunk instead of
the ledger: the two accounts of the same six days differ by a factor of three.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `git log` over `origin/main` since 13 September — gaps between landings, author against committer dates — and `fast-scope.ts`'s sweep list |
| writing | 5 | the calendar-time section in `docs/lane-speed.md`, the queue entry for the stamp, the document sweep |
| looking | 0 | — nothing drawn |
| friction | 0 | — two test expectations moved with the new sweep, which is the sweep working |
| landing | 5 | `check`, the commit |

The bottleneck was nothing, and the finding is that this table has been the
wrong instrument all along: 3 385 minutes logged on 15 September against an
860-minute span of that day's own commits, and the ledger cannot say how much
of the gap is a second session and how much is a generous estimate — today it
would be a second session, and 15 September shows no sign of one. The rows are
an account of attention and they are worth keeping; the clock
belongs to `bun run land`, which holds both ends of it at the moment it writes
the release note and does not yet write it down.

## 2026-09-16 — queue-a-files-line-ceiling — the ceiling said before the edit, not at the red check

The queue's *A file's line ceiling is met by a red check, never before the
edit*, which `docs/lane-speed.md` had just named the largest flat cause of
friction in the ledger: 27 lanes, 375 minutes, unmoved all week.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the four new queue entries, `format-edited.ts`, `payload.ts`, `after-depth-edit.ts`, `after-sim-edit.ts`, `wiring.test.ts`, `edited.test.ts`, `limits.test.ts`, `.claude/settings.json`, the ceiling passages in `docs/lane-speed.md` |
| writing | 20 | `file-size.ts`, `after-edit-size.ts`, the constants and the scope rule cut out of `limits.test.ts`, the settings row, four describe blocks, two paragraphs in `lane-speed.md` |
| looking | 0 | — nothing drawn |
| friction | 20 | the trunk had diverged from `origin/main` and had to be rebased with two document conflicts; a worktree opened for the lane could not be written to from this session and the lane moved back; a glob written inside a block comment closed the comment and took the whole sim suite red |
| landing | 10 | `bun run index`, `check`, the queue entry, the commit |

The bottleneck was friction, and two thirds of it was paid before a line of the
work: the trunk had moved under this session while the previous lane's
landings sat unpushed, so the first thing the lane did was reconcile `main` by
hand. The lane's own mistake is the one worth keeping — `*` followed by a slash
inside a JSDoc block ends the comment, and the paragraph explaining which files
the ceiling reaches was the one that could not be written in the file that
answers it.

## 2026-09-16 — queue-the-prompt-says-nothing-about-size — the brief says how big before it says what

The queue's *The prompt `queue next` hands a session says nothing about size*.
`promptFor` said one thing about it, in its last line, as a fallback: leave
what you finished. That is the discovery at minute 180 the whole of
`docs/lane-speed.md` exists to stop.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `tools/queue/claim.ts` whole, the `promptFor` cases in `queue.test.ts`, the table of cuts in `docs/lane-speed.md` |
| writing | 10 | the size paragraph, `tools/queue/prompt.ts` and the two importers, five test cases |
| looking | 0 | — nothing drawn |
| friction | 0 | none |
| landing | 5 | `bun run index` and its line, `check`, the queue entry, the commit |

The bottleneck was nothing, and the lane is worth logging for one thing that
happened in the middle of it: the paragraph took `claim.ts` to 234 lines and
**the hook landed an hour earlier said so, on the edit**. The seam was chosen
there and then, with a four-line diff open and nothing else in the file to
weigh — who holds an item on one side, what the session holding it is told on
the other. That is the 375-minute row in the ledger being paid at its cheapest,
by the lane that queued the fix for it.

## 2026-09-16 — task-performance-optimization — fast mode is answered, and the entry comes off

One line from the owner — *"Leave 13 off"* — against the queue's own
`Asks:` question of an hour earlier, which named three options and is now
`docs/decisions.md` #32.

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — the entry was written this morning and named its own options |
| writing | 5 | decision 32, the fast-mode section rewritten around the answer, the ranked list's fifth row |
| looking | 0 | — nothing drawn |
| friction | 0 | — |
| landing | 5 | `queue done`, `check`, the commit |

The bottleneck was nothing, and the entry paid for itself the way an `Asks:` is
supposed to: the options were written down before the question was asked, so
the answer was three words and needed no second turn to interpret. What it
leaves behind is the arithmetic, which is worth keeping — the next time the
model or the mode changes, the test is one flag and ten lanes each way, and
decision 32 says what it would have to beat.

## 2026-09-16 — task-queue-work — a contents menu on the long director pages

The queue's *A contents menu on the long director pages, each heading a jump*:
the owner's ask of 15 September, on NOT BUILT YET and DOCUMENTATION.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the entry, `tabs.ts`, `backlog-page.ts`, `whole-doc.ts`, the sheet markup and both fake DOMs |
| writing | 25 | `bindContents` and its two pure halves, six `<nav>` lines, the panel's CSS, nine tests |
| looking | 15 | the six menus opened and jumped in the browser pane, then two `bun run shot` runs |
| friction | 10 | `bun run shot --open` and `--tab` both press NOT BUILT YET, so the first two shots timed out; `bun run queue take` claimed an entry whose own body says to do it with the next creature, and it had to be released |
| landing | 10 | `check:fast`, the queue entry, the commit |

The bottleneck was friction, and both halves of it were an entry read too late:
the claimed item said in its last paragraph that it should be done with the next
creature rather than on its own, and `bun run shot`'s two flags each say what
they open without either saying they overlap. Reading a queue entry to the end
before claiming it costs nothing; reading it after `take` costs a claim, a
release and a push.

## 2026-09-16 — queue-one-new-fact-four-tables — the list of places, stated once

The queue's *One new fact, four tables, found one red test at a time*: six
lanes and 165 friction minutes in this ledger where a concept's name had to be
written into five places and each one was learned from a red run.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `concepts.ts`, `concept-art.ts` and its test, `scenes.test.ts`, `backlog.test.ts`, `spec-names.ts`, the count case in `tools/shape-sheet/test/drafts.test.ts` |
| writing | 15 | `concept-places.ts` and its test, four pointers in the tests that were already there |
| looking | 0 | — nothing drawn |
| friction | 5 | two places share a prefix, so the fixture case matched one of them twice; a Python replacement written against a comment reflowed differently in the file |
| landing | 5 | `bun run index`, `check`, the queue entry, the commit |

The bottleneck was reading, and the seam the entry told this lane to check
first is what kept it short: two of the five joins already read one list
(`spec-names.ts`), so there was no module to build and nothing to merge. What
was missing was only the *list* — five rows saying where a fact has to be
written, and one test that reports all of them rather than the first. The four
checks that were there are untouched and still hold their own halves; they now
say, each in a sentence, that they are one of five.

## 2026-09-16 — task-queue-work — --tab opens the sheet, so --open need not

The queue's *`bun run shot --open` and `--tab` together wait thirty seconds and
fail*, found by the lane before this one while it was taking its own picture.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `reachState`'s four presses and `shot-usage.ts`'s list |
| writing | 10 | one guard, one usage line, a page that records presses and four tests |
| looking | 5 | the shot that failed this morning, run again with both flags |
| friction | 0 | — |
| landing | 15 | `check:fast`, the commit, `bun run land` — once red on THE CURTAIN, landed that morning with no look yet |

The bottleneck was writing, and only because the fix wanted a test and
`shot-state.ts` had never had one: the presses are four lines each, but a page
that records what it was asked to press is the thing that makes the *count* of
them assertable, which is the whole defect.

## 2026-09-16 — task-queue-work — the build-stamp scan reads all at once

The queue's *The build-stamp scan walks the whole tree inside a 5-second test*,
found when it timed out on the landing check of the lane two before this one.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the test's own three paragraphs, and `limits.test.ts` for how the other whole-tree scan does it |
| writing | 5 | the read turned into one `Promise.all`, and the paragraph saying why |
| looking | 10 | a bench script timing the walk and both reads, run both orders round, then the file timed again and an offender planted to prove it still catches one |
| friction | 0 | — |
| landing | 15 | `check:fast`, the commit, `bun run land` — once red on THE CURTAIN, landed that morning with no look yet |

The bottleneck was looking, and it was the right place to spend it: the entry
proposed a `Glob` and that would have been the wrong fix — the walk is 25 ms of
the 325 and the reads are the other 300 — so the ten minutes bought the
difference between a change that sped it up fourfold and one that changed the
line the slowness is not in.

## 2026-09-16 — task-performance-optimization — THE SCOUT, the simulation half

The owner's `NEXT:`, in his own words: *the mother ship spills out another tiny
ship, which one player can fly freely around the space… it can collect a
specific kind of power up, and it is required to collect all.* On the field
that is the one thing the game cannot have, so it is a round with its own
picture — decision 21's exemption, SNAKE's shape — and it is split in two: this
is everything that plays, and nothing of it is drawn yet.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `decisions.md` #21 and `interludes.md`, THE CLAW's set and its four controls, SNAKE and THE GAUGE end to end, `hash-coverage.test.ts`'s walker, the desk keyboard, the director's five tables |
| writing | 20 | six sim files and a config, the arenas, the wave, the panel and its four slabs, two stage listeners, twelve test cases, the spec section |
| looking | 0 | — nothing is drawn, which is the other half |
| friction | 10 | authored motes shared between two worlds by a shallow copy; a test holding the live round and comparing a field with itself; a guide half eight characters over the phone's line |
| landing | 5 | `bun run index`, `baseline:blank` for the wave numbers the insert moved, `check`, the commit |

The bottleneck was friction, and the largest piece of it was a rule rather than
a bug: **every panel gives both seats something** (`control-sets.test.ts`), and
the round as first written gave player 2 nothing to press on the argument that
their half is the sentence they say. The fix is better than the design it
replaced and it was two files away the whole time — the mother ship's mouth is
player 2's, and a mote is not *had* until the little ship is home with that
mouth open, which is THE CLAW's own rule about a catch being two hands. The
owner asked for this round to sit beside that panel; the rule the panel already
had is what made it actually sit there.

## 2026-09-16 — queue-the-ledger-estimates-its-minutes — the trunk's own account, stamped

The queue's *The ledger estimates its minutes; the trunk knows them*: this
file's rows are out against the trunk by a factor of between two and a half and
four, and every speed question the repository asks next is asked in minutes.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `notes.ts`, `note-commit.ts` whole, `unverified.ts`'s diff guard, `notes-repo.test.ts`'s temporary repository, the entry's two decisions |
| writing | 15 | `stamp.ts`, the stamping half of `note-commit.ts`, eleven pure cases and two repo-backed ones, the preamble here and the paragraph in `docs/lane-speed.md` |
| looking | 0 | — nothing drawn |
| friction | 0 | none |
| landing | 5 | `bun run index` and its line, `check`, the queue entry, the commit |

The bottleneck was reading, and the decision that took it was the guard rather
than the arithmetic: the stamp goes under **the last entry in the file**, which
is only this lane's if this lane wrote one — so the landing asks its own diff
whether it touched the ledger at all, and a lane that logged nothing is stamped
nothing. The entry's second question, whether `land` should also prefill the
empty table, is answered no in the code's own words: `land` runs at the end, and
a skeleton written then is scaffolding for a lane that has not started.

*Measured: 2 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — task-queue-work — THE BALLOON's guide says what it does now

The queue's *THE BALLOON's wave tells the pair three things the game stopped
doing*: the owner's rule of 14 September — a balloon never goes downwards —
reached the simulation and not the words beside it.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `balloon.ts`, `balloon-rub.ts` and the scene, to write three sentences that are true |
| writing | 10 | the `both` rewrite, one clause of `p2`, and `balloon.ts`'s own stale paragraph |
| looking | 15 | three frames of the opening, which is how it was found that this wave's prose is never drawn at all |
| friction | 0 | — |
| landing | 10 | `check:fast`, the queue entry, the commit |

The bottleneck was looking, and it bought the finding rather than the proof:
the entry asked for one frame of the opening, and every page of this wave's
opening is its rehearsal — a wave with a film never reaches `drawProsePage`, so
59 waves carry prose no phone shows. That is queued with the question.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — task-performance-optimization — the last two speed findings go on the list

The owner asked the same question twice — *all your suggestions of speeding up
tasks is added to queue already?* — and the honest answer the first time was
no. Two were still only in a report, which is the one place `docs/queue.md`'s
preamble says a finding may not live.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `tools/land/replay.ts` and its two resolvers, `note-commit.ts`, `pressPlan`'s header |
| writing | 5 | two queue entries |
| looking | 0 | — nothing drawn |
| friction | 0 | — two titles over 80 characters, which `bun run queue` said before the commit did |
| landing | 5 | `check:fast`, the commit |

The bottleneck was nothing, and what the reading changed is worth the entry it
is in: the first finding was going to be *two sessions at once is free*, which
is a working practice nobody can prove with `bun run check`. Opening
`replay.ts` turned it into something that can be — the landing already merges
`docs/queue.md` and `docs/INDEX.md` on its own and the time log is neither,
which is the entire measured cost of a second lane on the trunk. A practice
became a resolver, and only one of those two is work.

*Measured: 2 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — the-ledger-merges-itself — the record resolves its own conflict

Not a queue item: the friction row *a rebase against append-only docs* in
`docs/lane-speed.md`, picked up because this session had just paid it twice by
hand in the same hour.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `replay.ts`'s resolver table, `queue-merge.ts` whole, `queue-guard.ts`'s file list, the ledger's own 310 headings for uniqueness |
| writing | 15 | `ledger-merge.ts`, one line in `replay.ts`, ten pure cases and three against a real repository, the paragraph in `docs/lane-speed.md` |
| looking | 0 | — nothing drawn |
| friction | 0 | none |
| landing | 10 | `bun run index` and its two rows, `check`, the commit, `bun run land` |

The bottleneck was reading, and it was spent on one question worth the time:
whether the queue's merge could simply be pointed at a second file. It could
not — a queue entry is *meant* to be removed and a record's row never is — so
the parser is shared and the policy is not. The pure cases were checked against
a real rebase as well, because a wrong key in the resolver table passes every
string test in the tree and changes nothing about the landing.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — queue-the-flip — the seam that was not there, and the one that was

The queue's *THE FLIP, his way*, taken and given back. What landed is the piece
that stood on its own: the fault block out of `hash.ts`, which was at its
250-line ceiling with it inside.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `malfunction.ts`, `fault-placed.ts`, `fault-surface.ts`, `hash.ts`, the four tables the compiler named, `waves-demo.ts`'s argument, `tileCX`'s callers |
| writing | 20 | `flip.ts`, the kind and its seats through five tables, `hash-faults.ts` — then all but the last reverted |
| looking | 0 | — nothing drawn |
| friction | 5 | a heredoc refused for a doubled backslash, rewritten through the Edit tool |
| landing | 10 | the entry rewritten with what the attempt found, `release`, `index`, `check`, the commit |

The bottleneck was writing, and most of it was thrown away — which was the
right outcome and was reached late. The entry's split was *simulation first,
look after*, and two facts in the tree say it cannot be: `DEMONSTRATIONS` is
total over `MechanicId`, so a new kind does not typecheck until a wave names
where it can be watched, and some forty files call `tileCX`, so the mirror
cannot live there without turning the strips too. Both were findable by reading
before writing rather than after. They are in the entry now, so the next
session pays neither.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — queue-press-never-says-which-column — the number says what it points at

The queue's *`--press` never says which column it actually pressed*, first half:
the ledger's largest unfixed friction row after the ceiling and the heredoc —
a picture taken of the wrong thing, 11 lanes and 95 minutes.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `press.ts`'s header, `press-plan.ts` as the precedent, `spec.ts` for what a `PressSpec` actually carries, `mapCol` and its two constants |
| writing | 10 | `press-column.ts`, six lines in `run.ts`, ten cases against the shipped field's own numbers |
| looking | 5 | the six real sentences printed for six columns, to read them as a person would |
| friction | 0 | none |
| landing | 10 | the entry rewritten to leave its second half, `index` and its row, `check`, the commit |

The bottleneck was reading, and it bought the one thing the file had to get
right: a `PressSpec` carries its control under `command.kind`, not at the top
level, so the first draft filtered on a field that is always undefined and
would have printed nothing at all while every test about the wording passed.
The five minutes of looking were worth as much — the sentences are the whole
deliverable here, and the only way to know they read is to read them.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — release-notes-reconcile — one finding closed, a narrower one opened

No queue item of its own: another session had filed *The time log conflicts on
every rebase and nothing merges it* while this one was building the resolver,
so this closes that entry and files what it named that the resolver does not
reach.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the other session's entry against what landed, and `push.ts`'s refusal |
| writing | 5 | the narrower entry |
| looking | 0 | — nothing drawn |
| friction | 0 | none |
| landing | 5 | `queue done`, `check`, the commit |

The bottleneck was reading, and it was the right five minutes: the entry that
was removed named two files and only one of them is fixed. `docs/release-notes.md`
conflicts in a rebase the landing never runs — the trunk against `origin/main`,
which `bun run push` refuses and a person resolves — so closing the entry whole
would have thrown away a finding that cost three hand-resolutions today.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — three VERSUS answers in one message

The owner rejected `creature:bite` / `notch` and `creature:splinters` /
`shards` and took `creature:debris` / `drift`, after a question about whether a
bite lands where the bolt struck.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `rockHits` and the golden angle, `bullet-hit-shut.ts`, the candidate's own file, `tools/versus/README.md` |
| writing | 20 | three passages of `break-look.ts` that the adoption falsified, the balloon test's lost clause, the queue entry |
| looking | 0 | — nothing drawn; the owner had already seen the pairs |
| friction | 10 | a heredoc pattern missed the interface's three-space comment indent, and the queue's `Asks:` line was wrapped over two lines and refused |
| landing | 10 | two red `check:fast` runs and the commit |

The bottleneck was the writing, and none of it was the adoption — `bun run
versus` did that in three commands and under a minute. Every minute after it
went on what the three commands did not touch: the prose in `break-look.ts`
still said the pieces land on the hull and lie there, and a test asserted a
balloon's pop is lighter than a break, which `drift` made false. Adoption
rewrites five numbers and cannot know which sentences those numbers were the
subject of, so a slot taken on a record with a long header is a documentation
task wearing a one-command hat.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — guide:chrome / tide

The owner read the five candidates on the slot and asked for a sixth carrying
what he liked out of three of them, with four corrections in his own words.

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | the five candidates, `guide-look.ts`, `word-button.ts`, `nav-button.ts`, `SceneAnchor` |
| writing | 35 | `plate.ts`, `membrane.ts`, `paint.ts`, `caption.ts`, the index and its sentence |
| looking | 20 | three shots of the pose and two crops — the top band twice, the page row once |
| friction | 10 | the stub canvas refused `roundRect`'s array radius; two lint runs; a sentence with no dash in it |
| landing | 10 | `check:fast` three times and the commit |

The bottleneck was looking, and it was the fluid: the first pass read as mauve
hills rather than as a liquid, because three filled sheets at those alphas
stack into one mass. What fixed it was a thin edge line on each sheet instead
of a stronger fill — three lines that cross and part say there are three
surfaces; three fills say there is one. Worth knowing before writing the next
one: on a band under 100 px, an edge is read from its line and never from its
body.

*Measured: 3 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the guide's silent second subject

The other half of the split: a page rings what its words are about *and* what
the pair has to act on, with nothing written on the second one.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `SceneAnchor`'s ten shapes, `anchorPoint`'s branches, `creatureRadius` |
| writing | 20 | `companion.ts`, the scrim cut to two holes, the breathing ring |
| looking | 5 | one shot — the pose is the owner's own example, so it either shows it or it does not |
| friction | 5 | bare `@neon-spore/*` specifiers do not resolve in `tools/versus`, and `bun run format` does not sort imports |
| landing | 10 | `check:fast`, the commit |

The bottleneck was the writing, and the part that took it was the scrim rather
than the ring: a second pool cannot be a second radial gradient, because two of
them overlap and the far field goes to twice the darkness the owner asked to
have reduced. Cutting both holes out of one flat fill under the even-odd rule
is the answer, and it is the same move `creature:bite` / `notch` made for a
different reason — worth knowing before the next look wants two pools.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the lost screen shuts

`lost:screen` / `shutters` onto the field, by the owner's pick.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `lost-look.ts`, the candidate's paint, and the refusal that says how to take a function by hand |
| writing | 15 | the move, the record, its header, and the file's own header once the picture contradicted it |
| looking | 20 | finding a selector for one card in the STATES gallery, then the shot |
| friction | 15 | `adopt` refused on a name collision; `drop` then failed twice, once on the moved file and once on a stale registry; two tree-walking tests flaked under the sharded runner |
| landing | 10 | `bun run index`, `check:fast`, the commit |

The bottleneck was looking, and all of it was one question: how to photograph a
pose in the director's STATES room. The cards carry no id, so the selector is
`.state:has(.name:text-is('…')) .shot` — worth writing down, because three
guesses were spent on it and every later lane that shows the owner a posed
state needs the same line.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the ship bleeds down the lost screen

The owner asked for it by name: *some cool effect like alien blood is flowing
from top to bottom screen all across the full width*.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the palette's reserved colours, `sinHash`, what the lost screen already draws |
| writing | 20 | `lost-blood.ts`, and four tests that draw the real paint rather than reading what it was handed |
| looking | 10 | two shots — thin the first time, right the second |
| friction | 0 | — |
| landing | 10 | `bun run index`, `check:fast`, the commit |

The bottleneck was writing, and the useful part of it was not the rivulets: it
was noticing that `lost-look.test.ts` replaces `veil` and `words` on every one
of its tests, so until now nothing in the tree had ever drawn this screen's
real paint through the canvas stub. A whole screen was outside the rule that
everything drawn is drawn again in a test. It is inside it now.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the run's own figure, and two ideas filed

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | how a retry reaches `startWave`, what `world.retries` already counts, where it is already shown |
| writing | 15 | one line on the lost screen, and two entries in `docs/spec/ideas.md` |
| looking | 5 | one shot of the state card |
| friction | 0 | — |
| landing | 5 | `check:fast` and the commit |

The bottleneck was reading, and it bought the right answer to two of the three
asks: the score the owner wanted *already exists* — `world.retries` is in
`hashWorld`, the HUD's corner and the balance sheet both close on it — so the
work was one line and not a feature. The retry-with-the-guide option is the
opposite: it looks like a button and is a command kind, an event flag, a fact
about the wave that no `World` field carries, and nine waves where the button
would be dead. That is an idea, and it is on the sheet with its questions.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — a breach is a tear or a blow

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | both candidates, `breach-strike.ts`, how the seed is built, what the stub logs |
| writing | 25 | the two paints rehoused, `breach-either.ts`, four tests, the DECIDED entry |
| looking | 30 | hunting a real breach frame — three sweeps of `bun run frames` and a director shot |
| friction | 10 | `versus drop` refused a slot whose registry no longer had it; the pose row test |
| landing | 10 | `check:fast` twice, the commit |

The bottleneck was looking, by a long way, and it is a tool-shaped one: there
is no way to ask for *the frame the ship was hit on*. `bun run frames` takes an
absolute tick, so finding the breach is a binary search by eye across three
captures of fourteen frames each, and the answer is different for every wave.
The director's own BREACH pose is a still on the STATES card, so `--wait` moves
nothing. A `--until breach` on `frames`, stopping at the tick an event fires,
would have turned thirty minutes into one — it is in the queue.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the hole shown to have an inside

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `craters.ts`, `crater-pit.ts`, `crater-geom.ts`, the candidate, where a break is drawn |
| writing | 25 | `crystalPoints` factored out, two fields on the record, the corrected paint, three tests |
| looking | 15 | the versus shot of the candidate, then two shots of the STATES card zoomed on one hole |
| friction | 5 | a wave budget went red over one `save` on a frame with no hole in it |
| landing | 10 | `check:fast` twice, the DECIDED entry, the commit |

The bottleneck was reading, and it paid for itself twice. The crater's outline
was already walked in `craters.ts` to measure the mouth, so handing the same
walk to the look was a rename rather than a new derivation — and that outline,
passed as a clip, is what turns the owner's *the crater must stay untouched*
from a sentence in a doc comment into something the next candidate in this slot
cannot get wrong. The budget going red was the same reading paying again: the
honest fix was `drawCraters`' own guard, not a moved number.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — boss-design — the slow is allowed, and it is one line of the loop

The owner overruled the previous lane's refusal of slow motion and supplied the
condition that made the refusal wrong. `decisions.md` #33, the filter line in
`spec/transfers.md` it contradicted, and `spec/bosses-choreographed.md`
rewritten around two tools instead of one.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `loop.ts`'s `tickMs`, `interpolate.ts`, `link-run.ts`'s `InputDelay` and ahead-limit, `testing.ts`'s uneven-beat assertion, and how `packages/audio` schedules a beat — the five files that decide whether a slowed beat is implementable or a desync |
| writing | 5 | the decision entry, the filter amendment, correction 3 rewritten, the SLOW/DRAG table, fifteen per-boss paragraphs reassigned, the library split in two |
| looking | 0 | — nothing drawn |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading, and the five minutes were the whole value of the
lane: the previous one had refused the ask on a rule that turned out to forbid
the wrong thing. What settled it was `loop.ts`'s own header — *wall-clock time
exists here and nowhere below* — plus the fact that `packages/audio` binds cues
to events rather than to a clock, so the metronome slows for free. **A refusal
is worth re-reading when the owner pushes back on it**, and the distinction
that came out of the re-read — seconds versus beats, presentation versus
mechanics — is a better tool than either the original refusal or the
workaround it proposed.

*Measured: read off the previous landing at 22:02 and this one.*

## 2026-09-16 — boss-design — A Way Out at boss scale, half one

The owner asked for boss encounters that read as authored action scenes, with a
twelve-card sheet from another model attached. Too big for one sitting and split
before it was started: this half is the reading, the fifteen concepts and the
primitive library; the five signature encounters at 20+ steps are the second.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `spec/bosses.md`'s sixteen designs, `spec/controls.md`'s in-screen table, `roles.md`, `couplings.md`, `decisions.md` #20/#21/#23, `drag-targets.ts`, `slow-fall.ts`, `grippable.ts`, `loop.ts` — the last four to find out whether time can be scaled at all |
| writing | 10 | the page, and four cross-references into `INDEX.md`, `spec/README.md`, `bosses.md` and `transfers-hazelight.md` |
| looking | 0 | — nothing drawn; the shape-sheet drafts belong to the second half |
| friction | 0 | none |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading, and specifically one sentence: the brief's core ask
was slow motion, and whether it was possible at all turned on
`transfers.md`'s last line — *"a mechanism whose effect is a wobble in
wall-clock time cannot exist here at all"* — plus `slow-fall.ts`'s comment
about integers and the delayed lockstep. Finding those three took most of the
ten minutes and they rewrote the page: what the brief wanted became a body
taking more beats while the metronome holds, which is THE GRIP generalised and
already shipped. **A brief written against the wrong engine is cheap to answer
and expensive to check**, and the checking is the whole value of the half.

*Measured: read off the previous landing at 21:35 and this one.*

## 2026-09-16 — task-performance-optimization — THE STARE, the simulation half

The owner's next boss, in his own words: *when the boss looks at you, you are
not allowed to shoot or move or use shield… the rest what will happen you can
surprise me.* Built as a field boss rather than a round — the hull, the cannon
and the shield are exactly what they always are, and what is added is a clock
nobody controls. Split in two before it was started: this is everything that
plays, and nothing of the eye is drawn.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `faultSwallows` and where a press enters, THE VANE and THE WELL as bosses that bend a wave rather than being one, the fleet's plates, the audio catalogue's speech-band rule |
| writing | 25 | five sim files, the event, the sound, the wave, nine test cases, the spec section, the director's card and note |
| looking | 0 | — nothing is drawn, which is the other half |
| friction | 20 | five files over 250 lines in turn (`events.ts`, `boss.ts`, `effects-ingest-silent.ts`, `act-7b.ts`, the director's `boss.ts`), and the director's save dropping every comment inside an `entries:` array — which is a rule nothing states and a test caught |
| landing | 10 | `bun run index`, `baseline:blank` for the wave the insert moved, `imports`, `check`, the commit |

The bottleneck was friction, and all of it was one thing: **a boss is about
eight lines in each of five files that are already at their ceiling.**
`events.ts` was at 247, `effects-ingest-silent.ts` at exactly 250, `boss.ts` at
249 — so this lane spent as long splitting files as writing the boss, and every
split was one the next boss would have forced anyway. What made it bearable is
that each seam already existed in the file's own comments: the events of a boss
go next door (`events-splice.ts` said so), the dispatch that says *not the
queen* is not the queen's own beat, and an act file is a page rather than a
chapter.

*Measured: 4 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — task-performance-optimization — the intro's people go on the list, for a local session

One entry, and the owner said where it must not go: *add to queue, not picked
up by cloud session.* `docs/queue.md` already has that line — `Where: local`,
his own reservation from 13 September — so the entry uses it rather than saying
so in prose nothing enforces.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the eight `intro-*.ts` files, `content/src/intro.ts`'s beats, and the queue's own `Where:` convention |
| writing | 5 | the entry |
| looking | 0 | — the entry is *about* looking, and a cloud session may not do it |
| friction | 0 | — |
| landing | 5 | `bun run queue` to see it list as LOCAL ONLY, `check`, the commit |

The bottleneck was nothing, and the reading is what the entry is worth: two of
the four things asked for reverse decisions the code argues for out loud.
`intro-player.ts` says a person is a lobed blob *on purpose* — a stick figure
would be the one thing on the first screen that came from somewhere else — and
`intro-pair.ts` records the owner taking the phones out on 15 September. He is
overruling the first and narrowing the second, and an entry that did not say so
would send a session to re-derive both arguments and ship the thing he has now
called bad twice.

*Measured: 2 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — why wave 1's briefing looked empty

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `wave-opening.ts`, `pair-panel.ts`, `main.ts`, `guide-fields.ts`, `stage-world.ts`, `guide-prose.ts`, `guide-play.ts`, `act-1.ts`, `scenes/first-step.ts` — following one screen backwards to four separate causes |
| writing | 10 | four queue entries |
| looking | 20 | `bun run frames` for the phone's own page 1, then three `bun run shot` runs of the director: the WAVE tab, the stage as it opens, and the stage with `#briefToggle` clicked |
| friction | 15 | the third shot was the answer and the first two were the question — the stage's briefings switch is not on the WAVE tab, so the tab that owns the words does not show what they do |
| landing | 5 | the commit |

The bottleneck was looking, and it was worth it: the owner asked *how should it
look*, and the only honest answer to that is the frame. **Nothing was wrong
with the guide** — the stage ships with briefings off, so wave 1 opened on the
field and the four pages of FIRST STEP never played. The three real defects
behind it only became visible because the shot with the switch on and the shot
with it off could be put side by side.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*
## 2026-09-16 — queue-the-flip — a fault that only turns the picture

THE FLIP, the owner's sixth malfunction: one seat's field drawn about its own
middle, with every button on both panels still working. The simulation carries
one number — whose screen — and the fold itself is one column arithmetic in
render/, applied to bodies and to the marks bodies leave and to nothing else,
because mirroring the finger along with the eye would cancel the mechanic out.
Split before it was started: this half is the fault and its wave drawn plainly;
the mirror line down the field, the truth shown in the real column on a hit,
and telling the other seat are the second.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `malfunction.ts`, `fault-placed.ts`, `handover.ts`'s `handedLayout` as the precedent, `fault-beam-ends.ts`, `wave-faults.ts`, `view-role.ts`, THE WELL's and THE CODEX's waves |
| writing | 10 | `sim/flip.ts`, `render/field-flip.ts`, the fold through `centerAt`/`effects-ingest`/`radar-blip`, the wave and its guide, the brush, and the two test files |
| looking | 5 | both seats of THE FLIP at tick 900, as a pair |
| friction | 5 | an edit script's regex, and two content invariants a first draft could not know |
| landing | 5 | `index`, `baseline:blank`, `check:fast`, the commit |

The bottleneck was friction, and all of it was self-inflicted in one line: a
Python `re.sub` with `DOTALL` and a non-greedy `p1: ".*?"` matched from THE
REPRISE's guide to THE FLIP's entries and deleted everything between, which
came back as fifty-six red render tests reading *no wave carries the reprise*.
`git checkout` on the one file and a plain string replace cost two minutes; the
lesson is the skill's own — **an edit to a source file is an exact string
replace, never a pattern that can span a neighbour**. The two content
invariants were cheap by comparison and are the tests doing their job: waves
are authored against a seven-column field whatever `cfg.cols` says, and a
guide's half is 220 characters because it is read on a phone under a beat.

*Measured: read off the queue-take commit at 22:04 and this landing.*

## 2026-09-16 — creature-bite-collision — GUIDE:CHROME · TIDE, taken

| activity | minutes | what it was |
|---|---|---|
| reading | 35 | the five TIDE files and what each imports, `guide-look.ts`, `guide-nav.ts`, `guide-switch.ts`, `guide-welcome.ts`, `round-header.ts`, `fleet-chart.ts`, `hud.ts`, and the four tests that named the old functions |
| writing | 55 | five files moved and rewired, the record repointed, `guide-nav.ts` cut to its geometry, `guide-caption.ts` and `drawGuideCorner` deleted, the welcome page taught that a chrome places its own three, the run line dropped under the band, the handover floor carried across, five tests rewritten, DECIDED.md, two queue entries |
| looking | 0 | — the picture is half two |
| friction | 45 | `guide-plate-room.test.ts`: six rounds of chasing one failing sweep to the bottom, which was `canvas-stub` recording a text box before the transform |
| landing | 10 | `versus index`, `bun run index`, import sorting, `check:fast`, the commit |

The bottleneck was friction, and all of it was one thing: **a test that had
been passing by luck for as long as it existed.** `guide-plate-room.test.ts`
swept every word a rehearsal draws against the band, and the stub handed it
pre-transform coordinates — so the sweep was reading boxes that were nowhere
near where the words are, and the band's old top of 24 px happened to exclude
the ones that would have failed. Moving the band to the top of the phone
turned that luck off. Teaching the stub its own matrix took ten minutes; the
thirty-five before it went on believing the sweep and fixing the collisions it
appeared to be reporting, one at a time, each of which turned out to be a
different word in a different place than the one on screen.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — TIDE's crest and its badge

| activity | minutes | what it was |
|---|---|---|
| reading | 0 | — half one had just closed over the same five files |
| writing | 5 | the crest made a meniscus, the badge's two baselines lifted, `badgeBox` exported, the bar split into `guide-tide-bar.ts` to stay under the file limit, `test/guide-tide.test.ts` |
| looking | 5 | two frames of FIRST STEP's first page, cropped to the top 130 px at 3× |
| friction | 0 | — |
| landing | 5 | `bun run index`, `check:fast`, the commit |

The bottleneck was looking, and it was worth every minute: the first crest had
a swell of one and a half pixels, which passed its own test — the edge moves,
the depth is under the ceiling — and in the frame read as **a straight bright
bar**, which is the rounded rectangle the owner asked to be rid of, drawn more
slowly. Nothing but the picture could have said so. The swell went to two and
a half and the lobe count became the plate's width over a fixed lobe width, so
the badge ripples four times and BACK twice, and the test grew a floor under
how far the edge must travel so the next edit cannot quietly flatten it again.

*Measured: read off half one's landing at 22:44 and this one.*

## 2026-09-16 — creature-bite-collision — the repository walk, read in parallel

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry and `tools/test/tree-walk.test.ts` |
| writing | 5 | `sources`, chunked at sixty-four, and two tests for it |
| looking | 0 | — nothing visible moved |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

The bottleneck was nothing; the entry named the fix and the fix was the fix.
350 ms became 111 ms, which is the point: the test is off the edge of the cap
rather than the cap being off the edge of the test.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — boss-design — THE DIASTOLE's simulation, and THE SLOW under it

Two things in one lane on purpose. THE SLOW is what the owner reversed the
design page's own refusal for on 16 September, and nothing needed it until a
boss did; building it as a primitive with no caller would have been a mechanism
nobody had watched. THE DIASTOLE is that caller, and the two share one
argument — a span of beats played at a fraction of wall-clock rate, agreed by
two integers in the fingerprint.

| activity | minutes | what it was |
|---|---|---|
| reading | 40 | `git show --stat 805b6376` as the template for a boss's fifty-file plumbing, then the diff hunks rather than the files; `beat-clock.ts`'s argument that a beat is a label; `lance-burn.ts`'s place in `step` |
| writing | 75 | `slow.ts`, `config-slow.ts`, `diastole*.ts` (five files), `wave-boss.ts` out of `wave-start.ts`, the wave in `act-7c.ts`, the director's group and dials, 21 tests |
| looking | 0 | — the look is lane 2 and nothing drawn changed |
| friction | 25 | 20 typecheck errors from exhaustive maps a new boss kind is a member of; `hash-coverage.test.ts`'s explicit field list; a `sed -i ''` with `\s` in it that silently did nothing on BSD sed and was redone in python |
| landing | 15 | the coincidence the beam was judged one beat early on, `check`, the commit |

The bottleneck was the beat the beam is judged on, and it is worth the
paragraph. `releaseLance` runs *before* `onBeat` in `step.ts`, deliberately and
with a comment saying so, while `advanceBullets` runs after it — so on a
boundary tick the two callers of `diastoleStruck` mean different beats by the
same `world.beat`. A pair who started the fill exactly `lancePrimeBeats` before
the coincidence they had counted to was judged one beat early, which is the one
thing this boss cannot afford. `beamBeat` in `lance-burn.ts` is the fix and the
beat is handed in rather than read off the world, so the next thing to read a
beat off a beam has to say which side of `onBeat` it is on.

*Measured: 3 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — `--press` says what is in the column

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the queue entry, `press-column.ts`, `press-plan.ts`, `press.ts`'s parser, `queue.ts`, `entries.ts`, `kinds.ts`, `beat.ts`, `config-derived.ts` |
| writing | 10 | `press-standing.ts`, ten tests, the two lines in `run.ts`, the index line |
| looking | 0 | — nothing visible moved |
| friction | 0 | — |
| landing | 5 | `bun run index`, `check:fast`, the commit |

The bottleneck was reading, and it bought the shape of the answer: the entry
asked for *what is standing in that column at that beat*, and the honest answer
turned out to be smaller than it sounds. Five kinds do not hold their lane, so
a body authored into one column can be standing in another when the press
lands — which means a tool that said *this column is empty* would be lying with
more confidence than the mistake it was written to prevent. It says what the
**wave sends** instead, and asks `fallTilesPerBeat` for the window rather than
working one out, which keeps the rock tiers, the torch, the wisp and the
Warden's line out of a tool that has no business knowing them.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the director's empty BRIEFING field

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry, `wave-opening.ts`, its two calls and the panel's markup |
| writing | 5 | the heading, the paragraph, the function, the painter and the test file out |
| looking | 0 | — the change is an element that is no longer there |
| friction | 0 | — |
| landing | 5 | `bun run index`, `check:fast`, the commit |

The bottleneck was nothing. Worth noting that the deletion was caught twice on
the way out — `doc-drift.test.ts` named `docs/INDEX.md` and the queue entry's
own `Files:` line as still pointing at a file that had gone, which is exactly
the pair of stale references a deletion leaves and nobody looks for.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the GUIDES sheet, out of two documents

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the five passages, `documentation-rooms.ts`, `backlog-tabs.ts`, `versus-tab.ts`, `stage-opening.ts`, and the director's markup, to find what is actually there now |
| writing | 5 | the four passages rewritten, a fifth found and rewritten, one queue entry |
| looking | 0 | — prose |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading, and it is the whole cost of this kind of entry: a
document that describes a tab can only be corrected by opening the tool and
finding out what replaced it. Doing that turned up a fifth stale passage the
entry had not counted and three code comments naming a file that has been gone
since 14 September — queued, because a comment a writer copies a pattern from
is a different problem from a document a reader is misled by.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — boss-design — THE DIASTOLE's look, and what the first frame said

The second half of the lane above, and the first frame of it paid for itself
twice. One version had the blob's lobes deepen on the contraction, so the
squeezing chamber read as a four-pointed star against the resting one's sac —
one body doing something looked like two different bodies. The other was worse
and was not a bug: the navigator's screen through the whole of phase `one` was
two identical grey masses, and the seat that has to hold the other player's
number could not tell which chamber would become its own. Neither is a thing
a test would have said.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `vane-draw.ts` as the template for a boss above row 0, `view-role.ts`'s five predicates, `frame-harness.ts`, `boss-draw.ts`'s order |
| writing | 45 | `diastole-draw.ts`, `diastole-bridge.ts`, `showsDiastoleBeat`, `diastoleSince` in the sim, 15 frame tests |
| looking | 25 | four `bun run frames . --wave "THE DIASTOLE"` passes at both seats, magnified with `bun run crop`; the star, the loom-straight bundle and the two grey masses all came out of them |
| friction | 10 | `blobPath` is banned in `render/src` by `path-text.test.ts` and had to become `blobPoints` + `splinePath`; the draw file came out at 251 lines against a 250 limit and the bridge was cut out of it |
| landing | 10 | `check:fast`, the index rows, the commit |

The bottleneck was looking, and it should have been: a mechanic this file draws
has no shipped alternative to compare against, so the only test of whether a
still grey mass reads as *a count you cannot hear* rather than as *a bug* is a
person looking at one. Three of the four frames changed the code.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the director's stage plays the draft's guide

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `guide-prose.ts`, `guide-play.ts`, `guide-scene.ts`, `briefing.ts`, `canvas2d-takeover.ts`, `frame-ship.ts`, `renderer.ts`'s `controls` field and the director's `stage.ts` |
| writing | 20 | `ViewState.guide`, `Stated` through the play and the stage, four call sites, `stage-draft.ts`, seven tests |
| looking | 0 | — nothing shipped changed; the phone's path is the unset one |
| friction | 10 | the `COPIES` guard, twice, and `stage.ts` over its line limit |
| landing | 5 | `bun run index`, `check:fast`, the commit |

The bottleneck was friction, and both halves of it were the repository holding
the line rather than getting in the way. `copies.test.ts` caught the new
fallback written as `??` — the spelling reserved because it is how
`controlSetForWave` gets copied — and then caught it a second time in the
*comment* explaining why it was not written that way, which is the guard
reading prose exactly as it is meant to. And the two draft readers took
`stage.ts` to 260 lines, which is the split this file's own rule asks for: what
the wave being edited says about itself is a different subject from wiring a
canvas to a keyboard.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the director says which film a wave plays

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the queue entry, `guide-fields.ts`, `scene-types.ts`, `scene-step-types.ts`, the director's stylesheets and its fake DOM |
| writing | 15 | `guide-scene-note.ts`, the dimming, the stylesheet rules, six tests, one queue entry with a question |
| looking | 0 | — a panel in a tool, held by its tests rather than by a frame |
| friction | 5 | three typecheck rounds on the fake DOM — `FakeEl` is not an `HTMLElement` and its restore is called `restore` |
| landing | 5 | `bun run index`, `check:fast`, the commit |

The bottleneck was writing, and the useful part of it was deciding how little
to build. The entry offered two sizes and the smaller one is the whole of the
complaint: a reader was being told the wrong thing, and a picker would have
been a new decision on top of fixing that. The decision is queued with the
three options written out instead.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the palette's lists off its table

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the queue entry and `brushes.ts` whole, to find where the seam already was |
| writing | 5 | the lists into `brush-lists.ts`, the re-export block, two headers |
| looking | 0 | — nothing drawn changed; the rows are byte-identical |
| friction | 0 | — |
| landing | 5 | `bun run imports`, `bun run index`, `check:fast`, the commit |

The bottleneck was nothing. The one decision was which half to move, and the
entry had it backwards: it proposed moving the rows out, which would have put
the growing half in the new file and left the settled half with the room. The
lists moved instead, so the table — the thing every creature and every fault
adds a row to — is the half that got the headroom.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — four director comments stop naming a file that is gone

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `backlog-tabs.ts`, `versus-tab.ts`, `backlog-page.ts`, `session.ts`, and the sheet's own tab bar in the markup |
| writing | 5 | four comments rewritten |
| looking | 0 | — comments |
| friction | 0 | — |
| landing | 5 | `check:fast`, the commit |

The bottleneck was nothing, and the entry undercounted by one: `session.ts`
also explained itself through `guide-page.ts`, which is the shape of this
problem — a file that is deleted takes its own line out of the index and
leaves every sentence that pointed at it standing.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — boss-implementation — THE BATON's simulation

The first of a run of bosses worked one after another in one session, each
claimed on `main`'s copy of `docs/spec/bosses-choreographed.md` before it is
started so a second session working the same list can see it. This is the
simulation half; the look is the next lane.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | §10 of the design page, the DIASTOLE lane's diff as the template for a boss's plumbing, `pods.ts`'s intake and `bullets.ts`'s sweep |
| writing | 15 | `baton*.ts` (five files), `ship-verbs.ts` out of `stare.ts`, `bind-warden.ts` out of `bind.ts`, the wave in `act-7c.ts`, the director's group and dials, seven sounds, 13 tests |
| looking | 0 | — the look is the next lane and nothing drawn changed |
| friction | 5 | two sounds in the speech band with the five `pierce` permissions already spent; `hash-coverage` asking for a tuple's length; both guide halves over 220 characters |
| landing | 5 | `check:fast`, the index, the baseline, the commit |

The bottleneck was the swing: `[0, 1, 0, -1][handovers % 4]` indexed by the
handover count from the *start* of the fight, so the first flight after the
arm was allowed to swing did not swing at all and the test that asked for a
column off the base caught it. It now counts from the handover the swing
began on, so the first swung flight is a swing.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — the two alarm rows drop under a rehearsal's plate

| activity | minutes | what it was |
|---|---|---|
| reading | 25 | `round-header.ts`, `siren.ts`, `torch-alarm.ts`, `magnet-alarm.ts`, `splice-draw.ts`, `fleet-chart.ts`, `beatbox-marks.ts`, `guide-plate-room.test.ts`, and the eleven sites the entry listed |
| writing | 20 | `sirenDrop`, the two rows, `alarm-room.test.ts`, and the entry rewritten as two |
| looking | 10 | two real rehearsal frames at 9caab36c, TORCH and THE MAGNET, both seats' chrome under the band |
| friction | 10 | the new test drew nothing twice: `startWave` takes the queue as an argument rather than reading the wave, and both alarms only speak within `radarLead` beats of an arrival |
| landing | 5 | `check:fast`, the commit |

The bottleneck was reading, and it was the work: the entry's eleven sites read
as one job and are four. Two are the ship's own chrome and hang off an
instrument that had already learned to drop — this lane. One is a readout at a
fixed offset and is the `headerTop` fix the entry describes. Six are a label
glued to a body, a chart's axis, or a whole screen used as a page's subject,
and none of those has an answer that does not need the owner. Looking is also
what turned up the next entry: the row comes out from under the band and lands
under the page's own caption box.

*Measured: 4 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — boss-implementation — THE BATON's look

The second half of the first boss in the run: the arm, the sockets, the bead
and the grey panel, drawn off the state the previous lane landed. Claimed as
"look taken" on `main`'s copy of the choreographed-bosses page before it
started.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `diastole-draw.ts` and `vane-draw.ts` as the pattern, `band.ts` for where the split is, `frame-harness.ts` for what a frame test can assert |
| writing | 20 | `baton-draw.ts`, `band-lock.ts` (with `drawLock` moved out of `band.ts` to keep it under the line), the dispatch in `boss-draw.ts`, `batonLandTick` through the sim's index, 13 frame tests, the spec |
| looking | 5 | the frame tests' call counts and colours per role; one PNG at the end |
| friction | 5 | the navigator's grey asserted at the fire press, when the lock is spent where the bolt meets the bead; `tsc -p packages/render` with no tsconfig there; the index test |
| landing | 5 | `check:fast`, `bun run index`, the commit |

The bottleneck was the P2 lock's moment: the test fired and asserted grey on
the navigator's screen at once, and the seat is locked in `batonStruck`, on
the tick the bolt reaches the bead, not at the press — so the test now steps
until `struck` and past player 1's own lock before it looks.

*Measured: 2 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-16 — creature-bite-collision — a title cannot shout what the listing already says

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `tools/queue/problems.ts`, `where.ts`, `run.ts`'s listing line, and the `canvas-stub` entry against the file it describes |
| writing | 10 | the rule, two tests, the preamble's sentence, two titles cut, one entry closed |
| looking | 0 | — a command's output |
| friction | 5 | a regex written through a heredoc came out with the wrong backslashes twice; the guard hook caught the first and the test the second |
| landing | 5 | `check:fast`, the commit |

The bottleneck was friction, and it was self-inflicted: the fixture only ever
needed a plain string replace. The finding itself came free — `bun run queue
list` printed `— ASKS THE OWNER — ASKS THE OWNER` on two entries this session
wrote, which is the kind of thing only reading the listing shows.

*Measured: under a minute from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*
## 2026-09-16 — neon-spore-boss-design — THE THROAT's simulation, and the mouth that is a function

| activity | minutes | what it was |
|---|---|---|
| reading | 30 | `gum.ts`, `own-step.ts`, `cross.ts`, `rock-cross.ts`, `grip.ts`, `slow-fall.ts`, `beat.ts`'s fall loop, `creature-types.ts`, and THE DIASTOLE's own diff as the template for a boss's ~30 files of plumbing |
| writing | 55 | `config-throat.ts`, `throat.ts`, `throat-step.ts`, `throat-pull.ts`, `throat-hash.ts`, the wave and its three-part guide, 22 tests, `bosses.md` §11.19 |
| looking | 0 | — nothing is drawn yet; the gullet is the lane after this one |
| friction | 15 | `throat.ts` at 253 lines against a 250 limit; a would-be import cycle between the pull and the step; a mutation TypeScript could not narrow through; two of my own tests written against a mouth that had slid away |
| landing | 10 | `bun run index`, the doc-drift section, `check:fast`, the commit |

The bottleneck was a decision rather than a task: **whether the mouth's column
is stored and stepped, or derived from the beat.** Storing it is what every
crossing body in this game does and `crossField` is already written for it. It
is wrong here twice. The pull is decided inside `beat.ts`'s fall loop and the
hit tests run from `stepBoss` after it, so a stepped column would be read a
beat stale by one of the two — the class of bug `beamBeat` had been written to
fix the day before. And player 2's whole readout is *which column the mouth will
be in*, which is a question about a beat that has not happened and which a
stepper cannot answer at all. Deriving it took an anchor field, a reflection
over the last whole stride rather than over the wall, and a paragraph in
`throat-hash.ts` explaining why an anchor is a position.

## 2026-09-18 — boss-hints — THE FLEET says one word

The round whose whole content is a square said out loud, so the reading is
mostly an argument about what may not be said. `PRESS` / `FIRE` on the sights
while they stand on a hull nobody has fired at, the pilot's — both facts are
already on his screen — and **nothing at all** to the navigator, because the
only word her arrows could carry is the map. The cue draws no frame: the sights
are four corner brackets already, which is the cue's own picture. The film's
page that named his verb could not simply come out — his salvo is its last act
and a page is what draws the hand — so it carries the rule no picture states.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `fleet.ts` and `fleet-board.ts`, `fleet-marks.ts` for the sights, `view-role.ts`'s one fleet predicate |
| writing | 25 | page seven of the readings, five cases, the film's last page, two spec passages |
| looking | 5 | one frame, and the word was where it belonged first time |
| friction | 5 | page five was at 245 lines with the fleet in it and had to be split before anything else could land there |
| landing | 10 | `check:fast`, the commit, the land |

The bottleneck was deciding what the navigator may be told, which took longer
than writing everything she is not told.

## 2026-09-18 — boss-hints — THE VANE says two words, and nothing about the fold

The boss that bends the field, so the reading is mostly a list of what may not
be marked: a folded body, the column one came out in, the colour the housing
already wears. What is left is the shot at the bearing — `CARRY` / `MOVE` on
the cannon while the housing is split and he is not under it, `PRESS` / `FIRE`
on the mouth for as long as the opening stands — and hers does not wait for his
cannon, because the cannon is not on her screen. The film's last page could not
come out, so it carries the rule nothing draws: a shot stops at the first body
in its way.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `vane.ts`, `vane-cycle.ts`, `vane-draw.ts` for where the mouth stands |
| writing | 20 | the reading on page two, five cases, the film's last page, two spec passages |
| looking | 5 | one frame of the split open on her screen |
| friction | 5 | `vaneOpen` reads the boss off the world, so the reading's `VaneState` was an unused parameter and lint said so |
| landing | 10 | `check:fast` twice, the commit, the land |

The bottleneck was none of the code: it was deciding that the fold — the whole
of the fight — is exactly the thing the field may never write down.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-implementation — THE DIASTOLE asks for a clamp: the simulation

The first half of the queue's §6.2 item for THE DIASTOLE: a fifth phase and a
second gesture. The alone chamber's beat has to be held as well as counted —
player 1's thumb on the grey chamber, on the beat or the beat before, holds it
open two beats for the beam; a thumb on any other beat is an eight-beat spasm.
The look is the second half.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `diastole.ts` and its step, `stare-hand.ts` and `queen-hand.ts` for the hand's shape, `lance-burn.ts` for which beat the beam is judged on |
| writing | 45 | `diastole-open.ts`, `diastole-hand.ts`, `boss-hands.ts` cut out of `step.ts`, two config fields, the event, the wire, two sounds, the director's hand and pose, the guide, eleven receipts and the two documents |
| looking | 0 | nothing to see yet; the look is the next lane |
| friction | 15 | an import cycle between the hand and the step, resolved by moving `enterDiastole` up; a guide half at 233; the audio counts; `step.ts` at its limit |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the beat the beam is judged on: the fill resolves before
`onBeat` on a boundary tick, so the pilot's clamp has to be caught from the
beat before, and that rule was found by the end-to-end test rather than the
design.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — tutorial-boss-onscreen-actions — THE MIRROR reflects and holds: three gestures, the simulation half

Three gestures for one boss (`.claude/skills/new-boss` §6.2): the sequence
answered on the pair's own panel, the last round given back on the mirror's
own ship through a new `mirrorLobe` target, and a `hold` phase at no hull
that both thumbs pin together — with the target on the wire, the phase in the
hash, the cue per arm, the grip's sound and the director's group. The look
is parked.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `simon.ts`, `mirror.ts`, `mirror-round.ts`, the queen's hand as the pattern for a lobe read per seat |
| writing | 50 | `config-mirror.ts`, `mirror-hand.ts`, the `hold` phase, the `panel` reason, the receipts across net, audio, render and the director, 11 gesture tests |
| looking | 0 | nothing drawn this lane |
| friction | 10 | `step.ts` at 251 lines; two gesture tests written past the hold window; a single-round bait test that became a reflect round |
| landing | 10 | index, format, check, commit, land |

Bottleneck: the receipts — one new target and one new phase each touch net,
audio, render and the director before the simulation's own tests are worth
running.

*Measured: 0 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-hints — SNAKE says two words, both of them his

The round where neither seat can see the other's half, so the reading is
settled by what is drawn on which screen: the driver is shown the body and the
meteors and nothing else, so the only word the field could put on her wheel is
`TURN` — and *which way* is his answer, said out loud. She gets nothing. He
gets `PRESS` / `OPEN` on a point the head is one step from and `PRESS` / `FIRE`
on the enemy a shot taken now would actually reach. The second of those needed
the round's own walk in render without a second copy of it, so `snakeShotStop`
came out of `fireSnake` and onto the sim's curated surface. The film's last
page went from naming his verb to the rule nothing draws: a meteor stops the
shot.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | the entry, `snake.ts`, `snake-arena.ts`, `snake-move.ts`, `snake-draw.ts` for the arena's geometry |
| writing | 20 | the extraction, page seven's second reading, six cases, the film's last page, two spec passages |
| looking | 10 | four frames landed in `morph` or after the crash before a probe found the tick that has a cue |
| friction | 5 | `snakeCurrent` is not on the sim's surface, so the test reads the round off the state |
| landing | 10 | `check:fast`, the commit, the land |

The bottleneck was the picture, not the code: SNAKE crashes early when nobody
steers, so every frame taken by guessing a tick showed either the fold or the
verdict.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — director-contents-auto-expand — the contents menu stands open

The owner asked for the director's contents menus to be there already, the
list itself and not a CONTENTS button that opens one. The opener goes; a
`MutationObserver` on the page refills the list as the page draws.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `tabs.ts`, the sheets' CSS, the test and the fake DOM, and how the four pages draw |
| writing | 15 | `bindContents` without its opener, the observer, the label's style, the fake observer and frame, the test |
| looking | 5 | one picture of WORDINGS under DOCUMENTATION through `bun run shot` |
| friction | 5 | `--tab MECHANICS` is not the flag for a sheet; a first `check:fast` timed out one unrelated test on a busy machine and went green on the rerun |
| landing | 5 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the fake DOM: no `MutationObserver` and no frame, so both
had to be given to it before the always-open list could be tested at all.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — brush-malfunction-wave-config — a malfunction is authored on its row

The MALFUNCTION picker came off the WAVE column, which is now WAVE SETTINGS so
that the section and the thing it edits have different names. A fault is
authored in one place: the beat row it is painted on. The block under the map
carries how many rows it holds, the runaway cannon's ammunition and THE FLIP's
turned screen, and the beat column draws the window as a stripe, solid on the
row it enters.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `fault-fields.ts`, `paint-fault.ts`, `cell-panel.ts`, `grid.ts`, `sim/fault-placed.ts` for what was already placed |
| writing | 10 | the note table, the block, the row marks, the stripe, eight cases |
| looking | 10 | the director in the pane, one shot of the map column and a close crop of the stripe |
| friction | 5 | `--warm` is a name the director never defined, so the wave list's ⚠ had been grey; the pane's click sends no `pointerdown`, so the paint had to be raised by hand |
| landing | 10 | `check:fast`, the commit, the land |

The bottleneck was the picture: the number in the box is only half the feature,
and the map had to be made to agree with it before anything could be checked.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-implementation — THE DIASTOLE's clamp gets its picture: the look

The second half of the queue's §6.2 item for THE DIASTOLE: the ring on the
grey chamber for player 1's thumb, the chamber held shut on every screen, the
spasm's shudder, the word, the director's row, and the hand answered on the
field at last.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `stare-lid.ts` and `queen-grip.ts` for the model, `diastole-draw.ts` for where the squeeze is, the spark and ingest tables and their silent lists, `field-controls-queen.ts` |
| writing | 50 | `diastole-clamp.ts`, the `Field` slot through the app and the director and fourteen test fixtures, the held and spasm branches of the chamber, the two bursts and the shudder, the cue, the director's row, the spec's row, the frame test and the document |
| looking | 10 | one frame of the clamp held on the pilot's screen, cropped |
| friction | 10 | three files at their limit — `input.ts`, `field-controls-page.ts`, `effects-ingest.ts` — each a comment condensed; the pose's name carries the wave's title |
| landing | 10 | `check:fast`, the commit, `bun run land --keep` |

The bottleneck was the `Field`: a required slot on the hit test is fourteen
test fixtures and two stage builders before the first line of the look, and
that is the price the file's own header says it charges on purpose.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-hints — PINBALL says MOVE, and the round was already talking

The first boss whose reading was decided by something it already draws: its
header writes a whole sentence, addressed, on both screens, every tick — *you
fire on the bar*, *they stop the needle*, *get the cannon under it*. So the
question was not which verb to write but which one the sentence cannot say, and
there is one: the sentence stands for the whole of a flight whether the cannon
is under the ball or not, and `CARRY` / `MOVE` comes out only while it is not.
The navigator gets nothing, for a reason no earlier lane used — not a half of
the picture she is not shown, but a half the round has said out loud already.
`pinCaught` came out of the catch so the word and the floor cannot disagree.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `pinball.ts`, `pinball-controls.ts`, `pinball-round.ts` for `waiting`, `pinball-aim.ts` for the bar |
| writing | 20 | the extraction, page eight, seven cases, the film's first page, two spec passages |
| looking | 10 | a probe with three presses in it, because a round nobody plays never reaches a flight |
| friction | 5 | `pinball-board.ts` went over 250 with the new rule in it and the rule moved to `pinball-shot.ts` |
| landing | 10 | `check:fast` three times, the index, the commit, the land |

The bottleneck was deciding that a cue may be silent where a boss is loud: half
the lane was reading `waiting` and working out which of its three sentences
leaves anything for a word to add.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — brush-malfunction-wave-config — and the row says which fault

The stripe said a fault held over these rows and nothing said which one. The
name goes at the end of the row it enters on, in the strip the trash already
had, because that strip is the one place on a map where nothing can be under a
label: the beat column is the number and the `+` badge, and anything laid over
the cells hides the arrival being authored. The strip went from 22px to 70px,
which is HANDOVER and the trash beside it.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `grid-row-acts.ts`, `grid-metrics.ts`, `map-width.test.ts` for the one number the width is |
| writing | 10 | the strip, its two children, the CSS, three cases |
| looking | 5 | two shots — LIMPET on a selected row, HANDOVER on one that is not |
| friction | 5 | the worktree's dev server had gone with the landing, so the shots went through `--serve` |
| landing | 5 | `check:fast`, the commit, the land |

The bottleneck was choosing where the name could go: every obvious place on a
map is already carrying something an author put there.
## 2026-09-18 — tutorial-boss-onscreen-actions — THE MIRROR's lobes are a control: the look half of §6.2

The picture of the three gestures the simulation half landed: the mirror's
two lobes hit-tested on both screens as the pair's own grab circles turned
over, the pair's own hand cup on them flipped with the sim's carry threshold
on the readout, rings per seat under the last round, the pin and the count
under `hold`, a ring thrown off both lobes when the pin lands or is lost,
the director's entry, row, hand and `hold` pose.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `touch-ship.ts`, `touch-hand.ts`, `ship-hand.ts`, the queen's grip and its test as the pattern, `mirror-hand.ts` for the sim's exact rule |
| writing | 65 | `grip-rings.ts` split off the queen's, `mirror-grip.ts`, `mirror-grip-fx.ts`, the flip on the hand cup, `carryMilli` and `pin` on the hold, the lift that carries, `Field.mirror` in fifteen places, the director's hand, pose, entry and row, 14 render tests |
| looking | 5 | one frame of each screen |
| friction | 15 | `mirrorGesture` says `reflect` through `lead` and `show` as well, so the lobes had to be gated on `listen` twice; the two lobes overlap in one column so the seat tests moved the cannon; the `hold` pose's `want` was met before the pin landed |
| landing | 10 | index, format, check, commit, land |

Bottleneck: the per-device hand. The pair's hand cup carries the render's
swipe threshold and the sim judges the mirror's own, so the hold had to
carry `carryMilli` down to the readout, or the ring would have lit a colour
the sim would not fire.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — tutorial-boss-onscreen-actions — `--hold` reaches THE MIRROR's lobes

The landing's picture needed a thumb on each of the mirror's lobes and
`bun run frames` had no name for them. Two rows in `hold.ts`, the way THE
INSTAR's second thumb is named.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | `hold.ts`'s seat and target tables, `--boss-json`'s header |
| writing | 5 | `mirrorLobe`, `mirrorLobe2`, the id rule |
| looking | 5 | one frame of the pin on player 1's screen, and its crop |
| friction | 5 | the first crop was taken in the wrong pixels; the picture is 390 wide |
| landing | 5 | `check:fast`, the commit, the land |

The bottleneck was the flag: a state two thumbs deep has no picture until the
tool can name both thumbs.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-hints — THE SCOUT says OPEN, and it is the navigator's

The first cue for the seat that cannot move anything. The rule is the same one
everywhere — a mark stands only on something this seat is shown — and here it
points the other way: the pilot has three controls and cannot see one mote or
one hazard, so every word the field could write over his crank is a direction,
and the direction is hers to say. She gets `PRESS` / `OPEN` on the mother
ship's mouth while the little ship stands on it with the mouth shut, asked of
`scoutAtHome`, which came out of the bank so the word cannot promise a press
the round is about to refuse. It says nothing about what is aboard: a press
that banks nothing costs nothing, and a cue that came out only for a loaded
ship would report the pilot's half of the picture to her.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `scout.ts`, `scout-arena.ts`, `scout-round.ts` for the header line, `view-role.ts` for the split |
| writing | 20 | the extraction, the second reading on page eight, six cases, the film's maw page, two spec passages |
| looking | 10 | two frames: at 1.9 tiles of lift the home ring's rim cut through the word |
| friction | 0 | none — the page opened for PINBALL took the round unchanged |
| landing | 10 | `check:fast`, the commit, the land |

The bottleneck was the lift: the one number in the reading that cannot be
reasoned about had to be measured twice, because the thing the word must not
cover is the widest radius in the round.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-hints — THE PULSE is read and left silent

The first of these lanes to come back with no cue at all, and the answer is the
round rather than a shortage of effort. Its four verbs *are* four lanes, both
seats hold all four, and the only question it ever asks is which lane and now —
the lane being the word a veiled seat has to be given out loud, which is why
the round needs two people, and the moment being what the judgement is made of.
A `PRESS` on the line hands over the round's one skill along with its one
sentence. There is no third thing either: a cue may not tell a player to speak.
So nothing was added to the picture, the film keeps its four pages, and what
landed is the argument, in `boss-cue.ts` over `default` and in the spec, with a
test that keeps the round quiet on all three screens.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | the entry, `pulse.ts`, `pulse-controls.ts`, `pulse-chart.ts`, the film's four pages |
| writing | 15 | the comment over `default`, two cases, two spec passages |
| looking | 0 | none, and none was owed: nothing visible moved |
| friction | 5 | the round's first phase is `count`, not `lead`, and the case named the other round's |
| landing | 10 | `check:fast` twice, the commit, the land |

The bottleneck was making sure the silence was a finding and not a shortcut:
most of the lane was spent looking for a state in the round where a word would
not be either the lane or the moment, and there is not one.

## 2026-09-18 — boss-hints — THE DIASTOLE's two words follow the thumb

The entry asked for the whole fight and the reading had one lane of it: `BURN`
on the bridge, written for every tick of `alone`, when for most of `alone` the
beam lands on nothing. The widening is not a second word but a rule — the words
follow the clamp. No thumb, and the pilot is asked for one and she is told
nothing, because the lance is refusing until there is one; thumb down inside
its window, and the word is hers and his goes out, because what the fight wants
of his thumb then is *let go* and a `HOLD` on the ring would be the field
asking for the spasm. Window lapsed with the thumb still down: both quiet. No
page of the film comes down — all six are counts and colours — and saying that
plainly in the spec is half of what landed.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `diastole.ts`, `diastole-open.ts`, `diastole-clamp.ts`, `handle-draw.ts`, the film's six pages |
| writing | 20 | the reading, its doc, three cases, two spec passages |
| looking | 5 | one frame of the ring with `CLAMP` over it |
| friction | 5 | a lapsed-window case written at beat 0, where `beat - clampBeats` is the sentinel `-1` |
| landing | 10 | `check:fast`, the commit, the land |

The bottleneck was the third state: a clamp held past its window is neither
clamped-and-open nor unclamped, and the first version of the case built it by
subtracting the window from beat 0 and got `-1`, which the simulation reads as
*no clamp at all*.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — tutorial-boss-onscreen-actions — THE MIRROR's picture looks like something real

The copy was a hull over an empty sky; it has the ship's chamber under it now.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `band.ts`'s chamber order, `seam-line.ts`, what each pass reads off a layout |
| writing | 15 | `mirror-chamber.ts`, the blood seat skin, the chamber's depth in `mirror.ts` |
| looking | 5 | one frame of the pin on player 1's screen |
| friction | 5 | a typed index into a readonly tuple in the test |
| landing | 10 | `check:fast`, the spec paragraph, the commit, the land |

The bottleneck was reading: five passes each read a different set of layout
fields, and the flipped layout had to satisfy every one of them.

*Measured: 1 min from this lane's first commit to the trunk moving, by `bun run land`. The rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-implementation — THE GORGE asks for a pinch and a pry: the simulation

The fourth shipped boss given a hand for the queue's §6.2, and the first where
one `DragTarget` is two gestures by seat: the pilot's pinch on a full intake
holds its vent off, the navigator's pry on the mouth is the one state the
beam ends the fight in. Most of the design went into what each thumb *costs*,
because a hold that only helps is a button — the pinch restarts the count from
the lift, the pry is a four-beat window past which the mouth clenches on the
thumb and spits a bead.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | `gorge.ts`, `gorge-step.ts`, the tests, `diastole-hand.ts` as the model, the director's hand |
| writing | 45 | `gorge-hand.ts`, `gorge-pry.ts`, the vent, the clench, three sounds, the receipts, §11.23 |
| looking | 0 | nothing drawn in this lane |
| friction | 25 | the first pry rule — a pried mouth spits instead of feeding — deadlocked the director's OUT pose: the spit came due on the beat the fill finished, every cycle, found with a probe; redesigned as a window, and `gorge-step.ts` at 256 lost its spit to `gorge-pry.ts` |
| landing | 15 | `check:fast`, the index, the commit, the land |

The bottleneck was the pose that would not come: a rule that read well in
prose and could never be performed at tempo, which the director's hand found
before any player could have.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — snake-boss-graphics — SNAKE gets the ship, the band and a body out of the mouth

The last round but THE GAUGE still drawn as a slab panel over a dark plate,
brought onto the ship: the four presses are lobes on the band, the ember box
and the plate are gone, the arena is the air above the hull as wide as the
field, and the fold that used to shrink the hull into the body is replaced by
the body pushing out of the cannon's own throat, slime and all. The one thing
that cost thought was the ship's paint: the hull is an opaque skirt, so a body
drawn before it vanished and one drawn after it stood on the ship — the answer
is drawing it after, clipped to the sky above the membrane and to the mouth's
own line.

| activity | minutes | what it was |
|---|---|---|
| reading | 5 | the slab panel, `scout-round.ts` as the pattern, `hull.ts` and `muzzle.ts` for the throat |
| writing | 10 | three new files, the panel cut down, the arena regrown, three files deleted, two tests |
| looking | 5 | six frames and three crops of the mouth to find the body under the paint |
| friction | 0 | — |
| landing | 5 | the spec, the index, `check:fast`, the commit, the land |

The bottleneck was the hull's opacity: the body was drawn twice in the wrong
place before the clip above the membrane made the throat read as a hole.

## 2026-09-18 — boss-hints — one boss on the hit test, not twelve

Claimed to unblock the next one: THE GAUGE is owed a gesture on its picture
(`.claude/skills/new-boss` §6.2) and every boss with one is a nullable field on
`Field`, named again four times in `input.ts` — which stood at exactly 250
lines, so the thirteenth could not be added at all. The twelve are one field
now, `boss`, narrowed where the handle is drawn by a `bossOf` that is one line
with a row in the copies table. Nothing changed about what answers a thumb: 443
lines came out and 115 went in, and the eleven paragraphs arguing *required and
stated rather than defaulted*, one per boss, became one that keeps the argument
and lists the four sharpest cases.

| activity | minutes | what it was |
|---|---|---|
| reading | 10 | `touch-field.ts`, `input-bindings.ts`, `field-input.ts`, the twelve hit tests |
| writing | 20 | the field, `bossOf`, the copies row, thirty-two files of mechanical change |
| looking | 0 | none, and none was owed: nothing visible moved |
| friction | 10 | the copies test wants the owner to contain its own pattern, so `bossOf` had to be written in the shape it forbids elsewhere |
| landing | 10 | `check:fast` twice, the commit, the land |

The bottleneck was the one test literal that was not mechanical: `touch.test.ts`
builds a maze field as `Field & { maze: MazeState }` and reaches back through
the intersection to move the phase, so the rename had to follow it into the
body of a test three hundred lines further down.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*

## 2026-09-18 — boss-implementation — THE GORGE's two thumbs: the look

The second lane of the §6.2 item: the rings the pinch and the pry are taken
on, one seat's screen each, the pry's dial, the three bursts, the cue words
and the director's two rows. Most of the time was the `Field` threading — a
new boss the hit test reads is a field on the touch record, an accessor on
the bindings, a line in the stage, and a `null` in fifteen fixtures.

| activity | minutes | what it was |
|---|---|---|
| reading | 15 | `diastole-clamp.ts` and `mirror-grip.ts` as the models, `grip-rings.ts`, the lobe geometry, the cue reader |
| writing | 40 | `gorge-grip.ts`, the two predicates, the bursts, the cues, `field-controls-gorge.ts`, the test, §11.23 |
| looking | 5 | one frame of the pilot's pinch |
| friction | 15 | threading `gorge` through `Field` and fifteen fixtures; `input.ts` and `field-controls-page.ts` each needed two lines folded to stay at 250 |
| landing | 15 | `check:fast`, the index, the commit, the land, the queue |

The bottleneck was the `Field` fan-out: a boss the hit test reads costs a
line in every touch fixture in the suite before its own file is written.
## 2026-09-18 — tutorial-boss-onscreen-actions — THE MAZE holds the shot: the grip phase, the simulation half

The round has a third state, and the wheel is finished by two hands on the picture.

| activity | minutes | what it was |
|---|---|---|
| reading | 20 | the nine maze files, THE MIRROR's sim half as the model, the cue and the director's hand |
| writing | 35 | `maze-hand.ts`, `config-maze-grip.ts`, the round's branch, the brace, the receipts in five packages, eleven tests |
| looking | 0 | none, and none was owed: nothing visible moved |
| friction | 10 | a script that stopped at its first assertion and wrote nothing, found by a test expecting `grip` and getting `verdict` |
| landing | 10 | `check:fast`, the spec, the parked half, the commit, the land |

The bottleneck was the receipts: a new `DragTarget` and a new event touch
the wire, the audio, two silent lists, the cue, the director and four tests
before the simulation itself is reached.

*Measured: the rows above are the session's own estimate; this holds nothing before the first commit and every minute the lane spent waiting.*
