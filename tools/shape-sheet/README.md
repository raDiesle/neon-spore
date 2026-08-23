# Shape sheet

```bash
bun run shapes          # both sheets
bun run shapes:report   # the numbers, no picture
```

Three views of the same silhouettes, all built from `subjects.ts`, which samples
contours through the *same* functions the canvas calls — `hullRadiusMul` for
anything that lives, `crystalRadiusMul` for the rock. That sharing is the point.
A shape parameter cannot drift between a sheet and the game: a change shows up
in both or in neither.

## `shape-sheet.svg` — the still

Every silhouette at `t = 0`. This is where you judge a shape, because a creature
is 26 px wide in play and you cannot see anything at that size. Time is frozen:
a sheet that animated would be useless for comparing one revision against the
next.

The hull appears twice, passive and armed. That pair is the reason the tool
exists: spec 5.8 insists a successful deflection be unmissable,
and the armed hull has to differ in *silhouette* — the shield is a lobe of the
contour, not something laid on top of it.

## `motion-sheet.svg` — the wobble

The same cells, onion-skinned: eight frames across one wobble period, `t = 0`
bright in cyan and the rest trailing off in violet. What you judge here is the
envelope — how far the outline breathes, whether a lobe swings or only shivers,
whether the armed hull still reads as armed at every instant and not just at
zero. One static image, so motion is something you can look at and archive.

## `report` — the numbers

```
SHAPE         W      H      AREA     LENGTH   TRAVEL  BREATH%
MANTA         146.7  87.0   7985     363.4    7.00    4.86
METEOR        90.5   90.5   5852     282.0    0.94    0.07
```

`TRAVEL` is the furthest any contour point strays from its `t = 0` position;
`BREATH%` is peak-to-peak variation in contour length. Both scan a window long
enough to contain every wobble layer's extremes.

Most shape work is nudging a parameter and asking *is that more or less than
before?* — a question a measurement answers better than a picture, and one that
goes in a diff. The meteor's 0.94 px of travel against the jelly's 12.6 is the
indestructibility fiction of docs/spec/graphics.md, stated as a number: the rock
must not read as an organism. Reach for the sheets when the question genuinely
needs an eye. Reach for this first.

Proportions between cells mean nothing — each cell is fitted to its own shape,
and the game derives real proportions from the tile size. Judge the shape, not
the pixels.
