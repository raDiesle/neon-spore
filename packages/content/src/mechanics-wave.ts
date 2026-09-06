/**
 * **The two mechanics a wave turns on without putting a body on the field**,
 * and the whole of `reach: "wave"`: a control that has stopped answering the
 * seat that owns it.
 *
 * Lifted out of `mechanics-table.ts` the way `mechanics-rocks.ts` and
 * `mechanics-run.ts` were before it, and along the seam the `reach` field
 * already names. Every row in that table is a body or a boss the pair is
 * *shown*; a fault is a fact about the panel, and the bestiary reads better
 * without one in the middle of it.
 *
 * **Two rows for one `Malfunction`**, and `mechanics.ts` argues that at
 * length: they are two rules, each with its own first wave and its own guide.
 *
 * `as const` rather than a type annotation, for `RUN_MECHANICS`' reason:
 * `MECHANICS` next door is `as const satisfies` and `WaveKind` is read back out
 * of it, so a spread that widened a literal would quietly change that union.
 */
export const WAVE_MECHANICS = {
  cannonFault: {
    what: "The gun fires itself, up whatever column the pilot is standing in, on every beat. Both colours go dead on the navigator's panel and one button takes their place: a tap holds the fire for two beats, and the next tap is only answered six beats after the last. So the pilot is not choosing when to shoot any more, only what the shot is pointed at — and crossing a column a shot must not go up is something they have to ask for out loud.",
    reach: "wave",
  },
  shieldFault: {
    what: "The dome comes up by itself, over whatever column the navigator has left it in, on every beat. The trigger goes dead on the pilot's panel and the same relief takes its place. Every rock the plate is standing under is warded without anybody asking — and every clasp it passes is opened without anybody asking either, whether or not the cannon is ready for the body inside.",
    reach: "wave",
  },
} as const;
