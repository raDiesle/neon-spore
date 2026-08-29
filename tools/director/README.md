# Director Mode

One screen where a wave is placed, played and judged. Desktop only — it is not
the game, and it carries controls no player's phone has.

```bash
bun run dev
```

Bundles and serves on the fly, with hot reload — editing anything under
`tools/director`, `packages/sim`, `packages/render` or `packages/content`
shows up without a restart. Runs on 4174 — next to the game preview on 4173,
and deliberately out of the 3000s, where a `bun --hot` whose own port is taken
will wander. It refuses to start beside a stranger on that port, retires an
older copy of itself, and exits after an hour of silence.

It moves for exactly one thing: a director serving a **different checkout**.
That one is not a stale copy of itself — retiring it would take down an editor
writing another tree's `waves.ts` — so this one steps onto a port derived from
its own tree's path instead (`tools/ports.ts`) and prints it. `bun run
dev:once` takes a port the OS picks, for a second editor beside one already
running in the same tree.

## What it is for

Not the placing. A `WaveEntry` is four fields and typing one is faster than
clicking it. The editor earns its keep on the question the data cannot answer:
**does the cannon have time to get there.** So the stage runs the shipping
renderer against a real `World`, through `computeStage`, in the same
phone-shaped rectangle the device draws into. A second drawing of the same
numbers would answer nothing.

There is no bestiary panel; the palette is the bestiary. Each brush is a card
carrying the silhouette `tools/shape-sheet` draws and the blurb off `CREATURES`,
so picking a creature and reading what it does are one act rather than two
lists to keep in step. The `SHIP` tab holds what is left of it: nine mechanics
worth a hand-written sentence, and every other `SimConfig` field grouped and
shown beside them. `src/ship-fields.ts` sorts every field into its group
through a `Record<keyof SimConfig, GroupName>`, so this cuts both ways now —
a mechanic that is *removed* takes its field with it and the list stops
typechecking, the way it always did, and a field that *lands* and is left out
of that map fails the same build rather than landing invisible. That second
half is why this file exists: `briefings`, `forkBetweenWaves`, `interludes` and
`shotChargeBeats` shipped and stayed invisible here for a day before anyone
noticed.

## The layout

Three columns: the wave list on the left, the field in the middle, the
authoring panel on the right behind a `WAVE` / `SHIP` / `PLANNED` tab bar. The
field takes
the full height of its column at the aspect the renderer uses, so it is the
field the device draws rather than a thumbnail of it — which is the whole
argument for having a stage at all. It is also the one column that does not
scroll, because a field that slides out from under you answers nothing.

## The grid

Beats down, the **seven authored columns** across — not `cfg.cols`. A wave is
written against seven and `mapCol` remaps it onto whatever field it is played
on; editing against the real eleven would let you place a creature in a column
no authored wave can express.

A brush rather than a cell that cycles: authoring means putting the same thing
in several columns, and a cycle makes that six clicks instead of one. Painting
what is already there removes it, so the brush is its own eraser.

Only the rock names a `kind`. Everything else is named by its colour and the
silhouette follows — the rule in `packages/content/src/creatures.ts`.

Moving a wave up or down the list rebuilds the stage to reflect its new position.

## The grid is the field

The row being played carries a mark that moves with the simulation, so the
correspondence between a row of shapes and a moment in a wave is not something
you hold in your head.

A beat number is a button: it replays the wave from the start up to that beat
and holds it there. Replaying rather than jumping is the point — the wave is a
seeded sequence, so the state at beat twelve is only reachable by playing the
twelve beats before it.

The column headers name the field column each authored column lands in. Only
seven of the eleven are reachable, which is what spreading seven across eleven
means, and a header that says so is cheaper than remembering it.

A click inside the field places the current brush there: at the beat the field
is holding, in the authored column nearest to where you clicked. It holds that
beat afterwards rather than restarting, so you see what you just put down. A
click in the band or the radar strip is not a placement — those are controls,
not the field.

## NOT BUILT YET

`◇ NOT BUILT YET` in the header opens a full-screen sheet over the editor:
everything the design has agreed to and the game does not have. `Esc` closes
it, and the stage keeps running underneath.

Full screen rather than a fourth column, because it is not something consulted
while placing a creature. It is what you read *before* deciding what the next
wave is for, and a 300 px column is the wrong shape for a paragraph.

**Grouped by what a thing would become, not by which file it was written in.**
That is the whole point of the rearrangement. The rail used to carry a tab per
spec file — CREATURES, ACCEPTED, BOSSES, CONCEPTS — with built and unbuilt
mixed in each, which is the wrong axis for the one question this page exists to
answer: *what is left to build, and what could it be made of.* So a creature
idea sits with the creatures whether `bestiary.md` or `ideas.md` was where
somebody wrote it down.

| Tab | What is in it |
|---|---|
| `BESTIARY` | every creature with a name and no code: the first thirteen, everything accepted since, and the creature ideas |
| `SHAPES` | the contour catalogue — see below |
| `MECHANICS` | couplings, assist forms, systems and the mechanic ideas |
| `CONTROLS` | what a player's own hands would do differently |
| `BOSSES` | the act order, minus the ones that exist |
| `PARKED` | deferred on purpose, or examined and turned down with the reason |
| `SPEC` | every file in `docs/spec/`, verbatim |

**Anything built is not on this page at all.** A creature that exists is in the
brush palette; a capability that exists is on `SHIP`. Each group says how many
it left out rather than dropping them silently, because a bestiary showing ten
of thirteen and not saying so reads as a bestiary of ten.

Whether something counts as built is derived, never flagged: the simulation's
own creature table decides it for a creature, and for a spec section the
heading's own tail does — allowing for the fact that the spec does not write
that tail the same way twice, so "the pod, built" and "keep watch, built" count
as built while "partly built" stays, work half done being work.

**Which section an idea belongs to is a heading in the spec.** `ideas.md`
carries `### Creatures`, `### Mechanics` and `### Controls`, and the page reads
them. Filing an idea differently is one edit there; there is no name-to-section
table here to go stale.

**A row shows the shape drawn at it.** `tools/shape-sheet/src/drafts/` holds a
contour drawn *at* a named idea, each one carrying the name of the idea it was
offered to, and the frame beside a row is that join. It was one-sided before:
a row got a picture only where the spec's name happened to match a contour the
game already draws, which on a page of unbuilt things is almost never — so the
twenty ideas that do have a shape drawn at them showed nothing, and the shape
sat on the SHAPES tab beside the other shapes rather than beside the idea,
which is the one place it answers a question. The line under the paragraph is
the draft's own argument for being that shape: the Echo is two bodies because
the pair never sees one at the same moment.

The draft **animates** and a contour the game already draws does not, and that
difference is the point. A draft is a proposal, and whether its lobes swing or
only shiver is most of what a person is being asked to accept; a built name has
a simulation behind it, and a card is not where its motion is judged.

A frame with a question mark in it is a name nobody has drawn anything at. The
empty frame is deliberate — a gap where a picture will go has to look different
from a picture that failed to draw, the same arrangement the SOUND sheet makes.
`tools/director/test/concept-art.test.ts` holds the join to the spec's own
spelling: renaming an idea in `ideas.md` is one edit, and without the test the
shape drawn at it would go quietly back to being a picture beside other
pictures.

**A row that has more to say says it — and a row about a mechanic shows it.**
`⌒ ON THE FIELD`, shut under an entry, opens the idea drawn *where it
happens*: a phone-shaped frame at 380 × 820, the tile a device actually gets,
with the unbuilt body standing in a lane at the size the game would draw it.

The frame is the game. It is `frameWorld` — `Canvas2DRenderer` against a real
`World`, the same arrangement GAME MECHANICS makes — so the hull, the band, the radar
strip and every creature the scene *spawns* are the shipping renderer's, not an
impression of one. Only the unbuilt bodies are drawn on top, in bone rather
than in any of the field's own colours, because cyan is a bulb and red is a
slick and a proposal must not wear a kind it has not been given. What is built
is drawn by the game; what is proposed is drawn as a proposal.

**Nothing scales it.** A card fits a shape to its frame, and fitting is exactly
what destroys the only question worth asking about a silhouette — the SHAPES
tab shows the Symbiosis parting beautifully at 132 px and cannot tell you
whether it parts at 26. So the frame is cut at the phone's own width and drawn
at it, one CSS pixel to one device pixel, and the sheet scrolls instead.

A scene is a *placement*, in `tools/shape-sheet/src/scenes/`: which contour
stands in which column and row, what the simulation should put beside it, and
one line saying what the picture claims. The mark vocabulary is deliberately
three — a tether down a column, a scar at one, a lane called out — because a
fourth kind is how a catalogue turns into a drawing program.
`test/scenes.test.ts` holds the join to the spec's spelling, holds every body
inside the field, and builds each scene's world to check the creatures actually
landed on the rows they were asked for: the spawn arithmetic reads a rule in
`beat.ts` that it does not own.

**A row that has more to say says it.** The table cell is a label; the design
is the paragraph the spec spends on that name further down the page. A panel
that shows the first and drops the second gives the Jammer as one sentence
where `bestiary.md` argues it in four. So every entry the spec says more about
carries `FULL TEXT`, shut, naming the file and section it opens; a boss opens
its whole write-up, tables and all. `EXPAND ALL` opens a whole tab's worth at
once. The markdown is rendered rather than shown raw — `packages/render` stays
a link's text, not a URL beside it — by `src/markdown.ts`, which handles what
the spec actually writes and is tested against a document stub in
`test/markdown.test.ts`.

Which paragraph belongs to which name is not guessed twice: a block that opens
`**The Jammer — …**` goes to the Jammer, and a block with no bold lead of its
own stays with the block above it, which is how "Two requirements, unchanged
from the original draft" stays attached to The Blind One.

One caution, in the spec's own words: a name here is a label on an unbuilt
design and costs one edit to change. Nothing in the simulation depends on it.

## GAME MECHANICS

`▣ GAME MECHANICS` is the third full-screen sheet, and the only one whose own
tab is pictures rather than prose. It also holds the four things that used to
have topbar buttons of their own — CONTROL SETS, SHIP, DEMOS — and TUNING,
which used to sit in the wave panel while its own note said it was the run and
not the wave.

The other two are lists of sentences, and a sentence is the slowest possible
way to learn what something looks like. Most of what the spec argues about is
visual: the shield is *passively useless*, one of the queen's two marks is a
*lie that looks identical*, a rock full of craters is *no closer to breaking*.
Each of those is a picture a reader has to build for themselves, and two
readers build two different ones. So every row here is that state, drawn.

**A real frame, not a screenshot.** `Canvas2DRenderer` against a real `World`
through `computeStage` — the same code the phone runs and the same code the
stage in the middle of the editor runs — cut down to the part of the phone the
state is about. A captured screenshot is the game as it was on the day somebody
remembered to take one, and it goes silently wrong the first time a lobe or a
colour moves; this one cannot be out of date, because it is not a picture of
the game, it is the game drawn once.

**A pose never sets a field it could reach.** `until` and `runUntil` in
`src/pose-kit.ts` run the simulation forward until the state arrives, so the
queen's mark is open because her own phase clock opened it and the rock
deflected because the trigger was down on the beat it landed. A boss posed by
assignment would be a frame the game cannot produce, and a reference picture of
an impossible moment is worse than none. `test/poses.test.ts` builds every one
of them, so a pose that can no longer reach its own state fails there rather
than showing something else under a label that says bloom.

Grouped as CONTROLS, MECHANICS, CREATURES, BOSSES — the hands first and the
field after them, because a state is easier to read once you know which control
answers it. The two radar rows are the same moment on the two seats, which is
the one thing a screenshot of the test view can never show: the test view has
both halves, and that is the arrangement no player is ever in.

The renderer eases — the shield swells towards armed, the maw travels through
flat, the cannon glides to its column — so a single frame catches all three at
zero. Each pose is drawn a few dozen times with a long `dt` first and only the
last frame is kept: the easing settled, and the last tick's events still fresh,
so a deflection is drawn with its flash on.

## TO CHECK

`⚑ TO CHECK` in the header is the other full-screen sheet: what landed on
`main` that a sandbox could not look at. It goes gold and carries a count when
something is waiting, which is the whole point — a list nobody is told about is
a list nobody reads.

The list is **derived from the history**, not kept beside it. A commit that
leaves something unlooked-at says so in a `Check:` trailer, and this page joins
those against `docs/verified.md`, which holds the one thing nothing can derive:
whether a person looked. `▶ RUN` appears on a check whose trailer names one of
this repository's own commands, `✓ TESTED` and `✗ FAILED` record a verdict, and
`▶ NEXT` steps down the list one at a time, because going through them is what
this is for rather than reading them.

A green command records its own pass. A red one records nothing — what a
failing command wants is a fix, and closing it would take away the chance for
the same check to go green once the fix lands.

Underneath, the branches. One row per name whether it sits here, on origin or
both; a branch whose work is on `main` and whose checks are all decided is
spent, and `🗑 DELETE` takes the worktree, the branch and origin's copy. Nothing
is forced, so a worktree with edits in it stops the whole thing and says so.

`bun run checks` is the same list in a terminal, and `docs/verification.md` is
the argument for the arrangement.

## The shape catalogue

`SHAPES` is the other half of a pair. A creature in the bestiary is a behaviour
and a name with **no picture**; a contour tuned in `legacy/style-guide.html` and
never claimed is a picture with **no behaviour**. Putting the two on one screen
is what lets a concept be handed a shape.

Free ones first, then the taken ones with the creature that carries each. Free
today: two creature contours the setting outgrew — five sharp lobes with a
nervous shiver, and the one contour taller than it is wide — the burning rock
that survives only as the shape the flare clones, and three of the four shield
ideas the style guide drew, the fourth having become the lobe of the hull the
game actually has.

They **animate**, unlike the still thumbnail beside a bestiary row. This is the
one place motion is the question: whether a lobe swings or only shivers is most
of what tells two blobs apart at 26 px, and there is no simulation behind this
page to take the frames from. The contours come from `tools/shape-sheet`, so
they are sampled through the same radius functions the canvas calls and a spare
shape is judged against the built ones on equal terms.

A free shape lives in `tools/shape-sheet/src/catalogue.ts` rather than in
`packages/content`, because content is what the game ships and a contour no
creature carries is not content yet. It becomes content the day something
claims it.

**Nothing on the page writes anything.** Handing a shape to a concept is a
decision, and decisions are not made by an editor.

## The balance sheet

`BALANCE` is the screen after the run, as numbers, moving while the wave plays.
It is the one tab that is not about the wave being edited but about the pair
playing it: one shared SYNC percentage over every **joint moment** — a rock at
the hull, a pod at the maw, a shot at a colour — and the wards, timing, colour
and pod rows underneath it. Nothing on it can be read backwards to say who
missed, which is a rule from `docs/spec/structure.md` 7.2 rather than a
presentation choice.

`▣ SHEET` under the field ends the run, so the drawn version — the one the
phone shows — appears on the stage. It has to be a button: the director holds
the hull (`hullInvulnerable`), so no run here ever ends on its own, and a
screen that can only be reached by dying is a screen nobody tunes. `↺ WAVE`
starts over and clears the sheet.

## Playing the stage

The stage answers a finger the way the phone does — the same `touch.ts` the
game calls, so what is drawn and what answers a press cannot drift apart. Drag
the cannon and shield strips, press the trigger, the maw and the two colours,
and **press and hold anything falling** to grip it: it keeps
`gripSlowPermille` of its speed for as long as the button is down, and both
hands compound. The mouse is player 1's hand; `G` is player 2's, on whatever
is nearest the hull, which is the only way to see the other player's grip and
the word that names it from one keyboard.

It used to place a creature instead, and held the wave still while it did.
Placing lives on the beat grid beside it, where a column and a beat are both
already visible.

## The game, and its main menu

`▶ MAIN MENU`, in GAME MECHANICS' own header rather than the topbar, opens the
game — this tree's source, bundled by
this same server on `/game`, so it needs no preview running beside it — with
`?menu` set. That flag is the whole arrangement: the game itself opens straight
onto the field, because a title screen in front of a wave somebody wants to
look at is a tap they did not ask for, and the director is the door for the
times they do want it. From the menu: the first wave, any of the authored waves
by the sentence it exists for, the room screen, the tuning panel, the seat, and
the keys.

It is a hot bundle of the working tree, like `bun run dev:game` — **not** what a
check is read off. That is still `bun run preview`, on its own port, answering
`/__preview`.

## Saving

`SAVE` writes `packages/content/src/waves.ts` and Biome formats it. The header
and both interfaces are kept byte for byte; only the `WAVES` array is
regenerated. You review the result as a `git diff`, like any other change.

`tools/director/test/serialize.test.ts` holds the writer to the repository's own
formatting: it asserts that serializing the waves that are already in the file
reproduces the file exactly.

A wave without a name, a sentence, a hint or a single entry does not save. The
sentence is the one-sentence test from `docs/spec/wave-design.md`, applied at
the moment the wave is made rather than in review.

## Tuning

The sliders belong to the run, never to the wave, and are not written to
`waves.ts`. They are here because a wave is not separable from the tempo it
arrives at — `THE WALL` is a different wave at 70 BPM than at 96. The named
presets answer decision #10, which wanted a second guard window comparable side
by side instead of edited into the source.

## Pair

`PAIR`, at the top of the `TUNING` tab, is `packages/sim/src/config-pair.ts`'s
three switches — `briefings`, `forkBetweenWaves`, `interludes` — plus
`shotChargeBeats` beside them for the reason `config-shot.ts` gives it its own
line rather than a place inside `PairConfig`. All four are off or zero in
`DEFAULT_CONFIG`, on purpose: a determinism run, a shape sheet and
`relay:check` all want the wave rather than the lesson (docs/decisions.md).
Nobody had carried that decision through to the one caller that is a person
looking at the game, so the wave's opening, THE FORK, THE GAUGE and the
cannon's wind-up were all built, tested, and invisible here.

One `cfg`, so the checkboxes are global rather than per-panel — `src/pair-panel.ts`
is bound the same way `bindTuning` is, and flipping one replays the wave on the
stage under the new run. Turning `briefings` on freezes the stage on whichever
wave is open until its opening has been read: a press on the stage carries the
introduction past, and then steps the guide — player one's half, player two's,
away — so one screen walks through what two phones show at once. On the phone
the introduction is not pressed at all; here it is, because this is where a
wave is restarted twenty times in an afternoon. THE FORK's own lance button is already live in the `TEST` role
(`touch.ts` — the director never had to add it), so priming it with the mouse
and firing with `E` crosses the fork the same way a phone would.

The `WAVE` tab's own `BRIEFING` line answers the other half of the same
question: what the wave being edited actually puts in front of a pair — its
introduction, and then the guide written in the `GUIDE` section right below,
or nothing. `src/wave-opening.ts` reads that off the store's live entry, so an
edit not yet saved shows there immediately. `✎ GUIDES` lists every wave that
carries one, and `◇ NOT BUILT YET → GUIDES` holds both screens of each side by
side — those pages ask the shipped waves, this line asks the stage.

## MUSIC

The last tab of the SOUND sheet, and the only one that is not a catalogue.

`docs/spec/systems.md` 5.3 says the game has no soundtrack, and section 1 of
`docs/spec/audio.md` says why: talking is the control scheme, and music under a
conversation is music under the control scheme. That was decided with nothing
to listen to. So the tab holds six pieces — `packages/audio/src/music/` — that
would have to be better than silence for the question to be worth reopening.

Each row plays, loops, and says what a minute of it costs the conversation. The
roll beside it is the same picture the sound plots make, at the scale of half a
minute: time across, frequency up, the speech band in red, a dashed gold line
where it comes back to the top. A piece with anything in the red is one the
pair hears instead of each other; all six currently read `0.00s per minute`,
which is the only reason there is anything to argue about.

Nothing here is wired to the game and nothing can be. Taking one is a decision
made elsewhere — in the spec first, and then in `mixer.ts`.

## Still to build

From the original brief, in rough order of how much they would add:

- **Recording** — inputs out as a replay test case (`packages/sim/src/replay.ts`).
  This was the brief's real promise: what you play by hand becomes a test.
- **Transport** — speed 0–300 %, single tick.
- **Hitboxes** — draw the box a shot actually tests against.
- **Latency and packet loss** — once there is a network layer to simulate.
- **Figures** — the layer above entries (`docs/spec/wave-design.md` 8.1). The
  grid is flat on purpose until that data structure exists in `content/`.
