# Director Mode

One screen where a wave is placed, played and judged. Desktop only — it is not
the game, and it carries controls no player's phone has.

```bash
bun run director
```

Builds, then serves on a fixed port 4174 — next to the game preview on 4173,
and deliberately out of the 3000s, where a `bun --hot` whose own port is taken
will wander. It refuses to start beside a stranger on that port, retires an
older copy of itself, and exits after an hour of silence.

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
authoring panel on the right behind a `WAVE` / `SHIP` tab bar. The field takes
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

`alt` and `any` resolve through the seeded rng, and the seed is the **wave
index**. Moving a wave up the list therefore changes which colour every `alt`
in it comes out as, which is why the stage rebuilds after a reorder.

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
