import {
  type MimicState,
  midCol,
  mimicDraws,
  mimicFiring,
  mimicStep,
  type World,
} from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import type { Layout } from "./layout.js";
import { mimicChart, mimicPictureBox, mimicTileAt } from "./mimic-board.js";
import { mimicPose } from "./mimic-pose.js";
import { CORE } from "./mimic-shape.js";

/**
 * **What THE MIMIC is asking for**, page forty-six of the readings. The two
 * screens are not drawn the same (`mimic-board.ts`), and the words follow
 * the drawing: each is said only where its seat can act on it, and `cueSeen`
 * keeps it there.
 *
 * **`TILES`, a call, to the seat that can see the picture**, framed round
 * it with half a tile to spare on every side, so the frame never touches
 * the squares inside it (the owner, 3 October 2026: *more space from the
 * scanner box*): a word to say aloud, THE GAUGE's `CALL`
 * (`boss-cue-read-w.ts`), never a colour or a count.
 *
 * **`TAP` to the seat that owes the picture**, for the whole window, over
 * the top of the board and unframed — the painter is not shown where the
 * picture stands, so no frame on its screen may point anywhere. A split says
 * both pairs at once, one of each to each seat.
 *
 * **`TAP` on the core while it is bare**, to either seat, ringing it. Its
 * colour is never named. Nothing is said while it slaps into shape, sits
 * mottled, flinches, rolls, clenches or falls.
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
  const board = mimicChart(l, cfg);
  // Over each seat's own half on a split, whichever has peeled, so a word never jumps.
  const split = mimicStep(s)?.ask === "split";
  for (const drawer of [1, 2] as const) {
    if (!mimicDraws(s, drawer)) continue;
    const reader: 1 | 2 = drawer === 1 ? 2 : 1;
    const box = mimicPictureBox(l, cfg, s.signs[drawer - 1] ?? -1, s.origins[drawer - 1] ?? 0);
    if (box !== null) {
      const room = l.tile * SPARE;
      out.push({
        ...markAt(reader, "CALL", "TILES", box.x, box.y, l, pictureSeed(s, drawer)),
        halfW: box.w / 2 + room,
        halfH: box.h / 2 + room,
      });
    }
    const share = split ? (drawer === 1 ? 0.25 : 0.75) : 0.5;
    const x = board.left + board.cols * board.tile * share;
    const y = board.top + board.tile * 0.5;
    out.push({ ...markAt(drawer, "PRESS", "TAP", x, y, l, 232 + drawer), framed: false });
  }
  return out;
}

/**
 * The reader's frame's seed: a picture that changes is a new mark, not the
 * old one moved, so the seed is where it stands and what it is.
 */
function pictureSeed(s: MimicState, drawer: 1 | 2): number {
  const at = (s.origins[drawer - 1] ?? 0) + 200 * (s.signs[drawer - 1] ?? 0);
  return 240 + drawer + 2 * at;
}

/** How much room the reader's frame leaves round the picture, in tiles. */
const SPARE = 0.5;
