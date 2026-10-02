import {
  type OculusState,
  oculusLitStep,
  oculusPairing,
  oculusWindowBeats,
  type World,
} from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { OCULUS_KNOB, oculusLeverRadius } from "./oculus-levers.js";
import { oculusArrived, oculusLeft } from "./oculus-pose.js";
import { oculusCentre, oculusLift, oculusRadius } from "./oculus-shape.js";
import { drawFuseLine, fuseColours } from "./slow-fuse.js";
import { fuseOver } from "./slow-fuse-place.js";

/**
 * **THE OCULUS's time left, over the lens** (the owner, 2 October 2026: *i
 * want to use regular standard process indicator for bosses, to show above
 * boss - but without slow for*). THE SLOW's fuse line (`slow-fuse.ts`), the
 * same width, colours and sparks, counting the lit level's fuse down from
 * `oculusWindowBeats` — the number the simulation springs the leaves by — and
 * stood above the lens and its lever ring rather than under it, where the
 * wave falling round it needs the room.
 *
 * Only on a level, a pair to shut: a shot after one waits for the pair
 * (`beats: 0`), and a fuse would count down to nothing.
 */
export function drawOculusFuse(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  s: OculusState,
  beat: number,
  beatPhase: number,
): void {
  const step = oculusLitStep(s);
  if (step === null || !oculusPairing(s)) return;
  const lasts = oculusWindowBeats(world, step);
  if (lasts <= 0) return;
  const rest = oculusLeft(s, lasts, beat, beatPhase);
  if (rest <= 0) return;
  const cfg = world.cfg;
  const y = oculusCentre(l, cfg).y - oculusLift(l, oculusArrived(s, cfg, beat, beatPhase));
  const reach = Math.max(oculusRadius(l).rim, oculusLeverRadius(l, cfg) + OCULUS_KNOB * l.tile);
  const { body, core } = fuseColours(rest);
  drawFuseLine(ctx, l, fuseOver(l, y - reach), rest, body, core);
}
