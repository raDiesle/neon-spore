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
lists to keep in step. The `SHIP` tab holds what is left of it: the capability
numbers, each read off a named `SimConfig` field, so a mechanic that is removed
takes its field with it and the list stops typechecking.

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

## What is not built yet

A third tab lists the rest of the bestiary — the thirteen creatures of which
three exist, the seven newly accepted ones — and the eleven bosses. Each is
marked built or not built. Built names are bright and unbuilt ones dim, because
the tab is mostly things that do not exist and the exceptions are what should
stand out.

None of it is typed into the editor. The server parses the two spec files on
every request and the editor renders what comes back, so there is no second
copy of the list to keep in step, and a name renamed in the spec is renamed
here. Whether something counts as built is derived the same way — the
simulation's own creature table is the only thing that decides it, not a flag
somebody set.

**A row that has more to say says it.** The table cell is a label; the design
is the paragraph the spec spends on that name further down the page. A panel
that shows the first and drops the second gives the Jammer as one sentence
where `bestiary.md` argues it in four. So every entry the spec says more about
carries `FULL TEXT`, shut, naming the file and section it opens; a boss opens
its whole write-up, tables and all. `EXPAND ALL` at the top of a panel opens
every one of them at once, for the reading where you want the tab rather than
an entry. The markdown is rendered rather than shown raw —
`packages/render` stays a link's text, not a URL beside it — by
`src/markdown.ts`, which handles what the spec actually writes and is tested
against a document stub in `test/markdown.test.ts`.

Which paragraph belongs to which name is not guessed twice: a block that opens
`**The Jammer — …**` goes to the Jammer, and a block with no bold lead of its
own stays with the block above it, which is how "Two requirements, unchanged
from the original draft" stays attached to The Blind One.

What it is for: the palette answers what you can place, and this answers what
the wave you are writing is eventually going to sit inside. A wave built around
a mechanic that does not exist yet is worth knowing about while you are writing
it, not afterwards.

One caution, in the spec's own words: a name here is a label on an unbuilt
design and costs one edit to change. Nothing in the simulation depends on it.

## The spec itself

`SPEC` is every file in `docs/spec/`, read off disk and rendered, one expander
each with its opening line as the summary.

It is the catch-all, and it exists because a parse is a choice about what to
keep. The other tabs turn the design into entries with a name and a badge, and
the naming rules, the categories, the names that were examined and rejected and
the ceiling on how many silhouettes stay distinct over a voice channel are none
of them an entry. Neither is the whole of overview, structure, graphics or
latency. Rather than grow a panel for each, the tab hands over the files: the
server reads the directory, so a spec file added tomorrow appears here without
anything being added to a list.

Nothing on it is editable. The spec is argued over in the repository; this is
the copy you read while writing a wave, so the answer to "what does the spec
say about this" does not need a second window.

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

`▶ MAIN MENU` in the header opens the game — this tree's source, bundled by
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

## Still to build

From the original brief, in rough order of how much they would add:

- **Recording** — inputs out as a replay test case (`packages/sim/src/replay.ts`).
  This was the brief's real promise: what you play by hand becomes a test.
- **Transport** — speed 0–300 %, single tick.
- **Hitboxes** — draw the box a shot actually tests against.
- **Latency and packet loss** — once there is a network layer to simulate.
- **Figures** — the layer above entries (`docs/spec/wave-design.md` 8.1). The
  grid is flat on purpose until that data structure exists in `content/`.
