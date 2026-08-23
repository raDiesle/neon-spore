# Shape sheet

```bash
bun run --cwd tools/shape-sheet build
```

Writes `shape-sheet.svg` — every silhouette in the game, drawn from the same
functions the canvas calls.

That sharing is the point. `packages/content/src/shapes.ts` returns SVG path
data, and `new Path2D(d)` accepts it unchanged, so a shape parameter cannot
drift between the sheet and the game: a change shows up in both or in neither.
The sheet is where you judge a silhouette, because a creature is 26 px wide in
play and you cannot see anything at that size.

Time is frozen at `t = 0`. The contours wobble, and a sheet that animated would
be useless for comparing one revision against the next.

The hull appears twice, passive and armed. That pair is the reason the tool
exists: spec 5.8 insists a successful deflection be unmissable, and the armed
hull has to differ in *silhouette* — the shield is a lobe of the contour, not
something laid on top of it.

Proportions in the hull cells are illustrative. The game derives them from the
tile size, so judge the shape here, not the pixels.
