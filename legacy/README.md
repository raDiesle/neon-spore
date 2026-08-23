# Legacy

Reference material from the concept phase. **Never imported by the code.**

| File | What it is |
|---|---|
| `raster-prototype.html` | the playable raster prototype, one file, Canvas 2D, no libraries. The thing `packages/` is being ported from. |
| `style-guide.html` | the visual reference: hull as one membrane, cannon and shield as lobes of it, five creature silhouettes, the contour maths |

Missing: `signal-bloom-prototyp.html`, the free-flight prototype. It exists in
David's local files and should be added here for comparison — decision 2 in
`docs/decisions.md` keeps it as the fallback.

The style guide is a live document: open it in a browser, drag the cannon,
switch shield variants, copy the values. The contour functions in it
(`blobPath`, `hullRadiusMul`, `bumpAdd`, `catmullRomToBezierPath`) are the ones
to port into `packages/content` as pure functions.
