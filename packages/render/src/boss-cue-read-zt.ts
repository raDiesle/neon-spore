import { type MimicState, midCol, mimicDraws, mimicFiring, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueFrame, markAt } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { mimicPad } from "./mimic-pad.js";
import { mimicPose, mimicSignAt } from "./mimic-pose.js";
import { CORE } from "./mimic-shape.js";

/**
 * **What THE MIMIC is asking for**, page forty-six of the readings. The two
 * screens are not drawn the same (`mimic-draw.ts`), and the words follow the
 * drawing: each is said only where its seat can act on it, and `cueSeen`
 * keeps it there.
 *
 * **`SIGN`, a call, to the seat that can see it**, over the sign on its
 * skin: a word to say aloud, THE GAUGE's `CALL` (`boss-cue-read-w.ts`), never
 * the sign's name — which of the five it is, is the thing the pair has to
 * agree a word for.
 *
 * **`DRAW` on the pad, to the seat that owes the sign**, for the whole of
 * the window — the stroke is a thumb carried across the glass, and the pad
 * is where it is heard (`mimicPad`). A split says both pairs at once, one of
 * each to each seat: the loudest half-minute the game asks for.
 *
 * **`FIRE` at the hull under the middle column while the core is bare**, to
 * either seat, ringing the core. Its colour is never named. Nothing is said
 * while it slaps into shape, wears a wrong sign, flinches, rolls, clenches or
 * falls.
 */
export function mimicCues(
  l: Layout,
  world: World,
  s: MimicState,
  beatPhase: number,
): readonly BossCue[] {
  const cfg = world.cfg;
  const p = mimicPose(l, cfg, s, world.beat, beatPhase);
  if (mimicFiring(s)) {
    const x = fieldX(l, midCol(cfg));
    const aim = { x: p.x, y: p.y, r: CORE * p.r };
    const frame = cueFrame(l, CUE_FRAME_WIDE);
    return [{ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 230 }];
  }
  const out: BossCue[] = [];
  const split = p.split > 0;
  const pad = mimicPad(l);
  for (const drawer of [1, 2] as const) {
    if (!mimicDraws(s, drawer)) continue;
    const reader: 1 | 2 = drawer === 1 ? 2 : 1;
    const at = mimicSignAt(l, p, split, drawer);
    out.push(markAt(reader, "CALL", "SIGN", at.x, at.y, l, 230 + drawer));
    const x = split ? at.x : pad.x + pad.w / 2;
    out.push(markAt(drawer, "CARRY", "DRAW", x, pad.y + pad.h * 0.4, l, 232 + drawer));
  }
  return out;
}
