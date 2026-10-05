import { type MimicState, midCol, mimicDraws, mimicFiring, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { mimicPictureBox, mimicTileAt } from "./mimic-board.js";
import { BAND } from "./mimic-frame-look.js";
import { mimicPose } from "./mimic-pose.js";
import { CORE } from "./mimic-shape.js";

/**
 * **What THE MIMIC is asking for**, page forty-six of the readings, and the
 * fight's only help: it has no tutorial (the owner, 5 October 2026: *instead
 * we should help text for every player during game play with the scanner
 * box*). The two screens are not drawn the same (`mimic-board.ts`), and the
 * words follow the drawing: each is said only where its seat can act on it,
 * and `cueSeen` keeps it there.
 *
 * **Both are framed round the frame** the mantle holds (`mimic-frame-look.ts`),
 * clear of its band, so the box says *these tiles* and the line under the
 * verb says whose turn it is — *very clear indicating which turn is to explain
 * and which player to place tiles*:
 *
 * - **`TILES`, a call, to the seat that can see the picture**, with
 *   `TELL P2 WHERE` (or P1): a word to say aloud, THE GAUGE's `CALL`
 *   (`boss-cue-read-w.ts`), never a colour or a count.
 * - **`TAP` to the seat that owes the picture**, with `WHERE P1 SAYS` (or P2),
 *   round the same frame on its own screen. Both see the frame, so the box
 *   points nowhere the painter was not already shown.
 *
 * A split says both pairs at once, one of each to each seat. **`TAP` on the
 * core while it is bare**, to either seat, ringing it; its colour is never
 * named. Nothing is said while it slaps into shape, sits mottled, flinches,
 * rolls, clenches or falls.
 */
export function mimicCues(
  l: Layout,
  world: World,
  s: MimicState,
  beatPhase: number,
): readonly BossCue[] {
  const cfg = world.cfg;
  if (mimicFiring(s)) {
    const p = mimicPose(l, cfg, s, world.beat, beatPhase);
    const at = mimicTileAt(l, midCol(cfg), cfg.mimicCoreRow);
    const aim = { x: p.x, y: p.y, r: CORE * p.r };
    const frame = cueFrame(l, CUE_FRAME_WIDE);
    return [{ seat: null, kind: "PRESS", word: "TAP", ...at, ...frame, aim, seed: 230 }];
  }
  const out: BossCue[] = [];
  const room = l.tile * MIMIC_CUE_SPARE;
  for (const drawer of [1, 2] as const) {
    if (!mimicDraws(s, drawer)) continue;
    const reader: 1 | 2 = drawer === 1 ? 2 : 1;
    const box = mimicPictureBox(l, cfg, s.signs[drawer - 1] ?? -1, s.origins[drawer - 1] ?? 0);
    if (box === null) continue;
    const round = { halfW: box.w / 2 + room, halfH: box.h / 2 + room };
    const seed = pictureSeed(s, drawer);
    out.push({
      ...markAt(reader, "CALL", "TILES", box.x, box.y, l, seed),
      ...round,
      why: `TELL P${drawer} WHERE`,
    });
    out.push({
      ...markAt(drawer, "PRESS", "TAP", box.x, box.y, l, seed + 1),
      ...round,
      why: `WHERE P${reader} SAYS`,
    });
  }
  return out;
}

/**
 * Each frame's seed: a picture that changes is a new mark, not the old one
 * moved, so the seed is where it stands and what it is — even for the
 * reader's, odd for the painter's.
 */
function pictureSeed(s: MimicState, drawer: 1 | 2): number {
  const at = (s.origins[drawer - 1] ?? 0) + 200 * (s.signs[drawer - 1] ?? 0);
  return 240 + 4 * at + 2 * drawer;
}

/** How much room both boxes leave round the picture's squares, in tiles: the band, and clear of it. */
export const MIMIC_CUE_SPARE = BAND + 0.35;
