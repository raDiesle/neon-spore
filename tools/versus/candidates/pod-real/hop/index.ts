import * as look from "../../../../../packages/render/src/pod-look.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSeed, type Moored, seedAt } from "../seed.js";

/**
 * **SMART, hopping like a pickup** — the same tumbling seed, bouncing in
 * place: it stretches as it leaves, rounds out at the top, lands and squashes
 * flat, and its stud tips flash white as it lands. A hop a beat while the
 * pod is owed, so the bounce is the clock; on the seconds when it owes
 * nothing. It never leaves its place by more than a quarter of a tile, and
 * comes back to it every hop, so the ring round it still sits round it.
 */
export const hopPod: Moored = (ctx, l, x, y, t, beatsLeft) => {
  const s = seedAt(l, x, y, t, beatsLeft);
  const u = Number.isFinite(beatsLeft) ? 1 - s.beat : (t * 1.3) % 1;
  // In the air for the first 60 % of the count, then down and squashing.
  const air = u < 0.6 ? u / 0.6 : 0;
  const lift = 4 * air * (1 - air) * l.tile * (0.18 + 0.08 * s.awake);
  const land = u >= 0.6 ? Math.sin(((u - 0.6) / 0.4) * Math.PI) : 0;
  const stretch = u < 0.6 ? 0.18 * (1 - air) ** 3 : 0;
  const sx = 1 + 0.26 * land - 0.12 * stretch;
  const sy = 1 - 0.26 * land + stretch;
  const foot = s.y + s.R;
  ctx.save();
  ctx.translate(s.x, foot);
  ctx.scale(sx, sy);
  ctx.translate(-s.x, -foot);
  s.y -= lift;
  drawSeed(ctx, s, { flash: land > 0.4 ? 0.3 : 0, spike: "thorn", skin: "stripes" });
  ctx.restore();
};

export const POD_REAL_HOP: Variant = {
  slot: "pod:real",
  name: "hop",
  sentence:
    "SMART's tumbling seed, striped like a sweet and curled with thorns, bouncing in place like a pickup — stretching up, squashing flat as it lands, a hop on every beat of its clock",
  dir: "tools/versus/candidates/pod-real/hop",
  patches: [
    patch({
      target: look.POD_LOOK,
      reached: () => look.POD_LOOK,
      where: { file: "packages/render/src/pod-look.ts", symbol: "POD_LOOK", type: "PodLook" },
      fields: { moored: hopPod },
    }),
  ],
};
