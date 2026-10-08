import { type ValvePhase, type ValveState, valveLeaking, type World } from "@neon-spore/sim";
import { CUE_FRAME_WIDE, cueAimAt, cueFrame } from "./boss-cue-frame.js";
import type { BossCue } from "./boss-cue-shape.js";
import { fieldX } from "./field-flip.js";
import type { Layout } from "./layout.js";
import { valveLivePinCircle, valveSocketCircle, valveWheelCircle } from "./valve-grip.js";
import { valveSparkNow } from "./valve-spark.js";

/**
 * **What THE VALVE is asking for**: page forty-two of the readings. Both
 * screens draw the whole drum (`valve-draw.ts`), so nothing a word could
 * stand on is a secret, and `cueSeen` keeps each word to the seat it is for.
 * Every word stands on the circle its grip answers at (`valve-grip.ts`), so
 * the word and the thumb land in the same place.
 *
 * **`TURN` on the wheel, to the pilot, while it is his to turn** and not yet
 * on its mark. Once it holds, the word goes: the pilot's part is to keep it
 * there, and a word saying *turn* would move it off.
 *
 * **`TAP` / `TO FREEZE THE WHEEL` on the socket, to the navigator, while the
 * wheel holds** — the
 * one tap that counts is hers (`sim/valve-hand.ts`), and the pilot's there
 * does nothing, so nothing is said to him.
 *
 * **`PULL` on the live pin while frozen, to either seat**: either thumb may
 * draw it (§25, *Colour*). The depth is not said; the plate hanging long is.
 *
 * **`FIRE` at the hull under the spark while it falls, ahead of the rest**,
 * to either seat, since either colour takes it — a spark left alone is the
 * blow this boss lands. It rings the spark where it has fallen to
 * (`valveSparkNow`), THE SEAM's rock's size, having no halo of its own.
 *
 * **The story between the pins says its own words, on the socket and to
 * either seat**, since every one of its four is either thumb's
 * (`sim/valve-story.ts`) and the socket is where the pin is pressed outside
 * the freeze (`valvePinHandle`): `TAP` while the jet blows — an edge, which
 * caps it — `HOLD` for the brace and for the seal, which count both thumbs
 * down together, and `RUB` while the film is on, the back and forth THE
 * RIME's lens asks for (`boss-cue-read-zg.ts`).
 */

/** The story's word in each of its phases, on the socket to either seat. */
const STORY: Partial<Record<ValvePhase, { kind: BossCue["kind"]; word: string; seed: number }>> = {
  jet: { kind: "PRESS", word: "TAP", seed: 184 },
  brace: { kind: "HOLD", word: "HOLD", seed: 185 },
  wipe: { kind: "CARRY", word: "RUB", seed: 186 },
  seal: { kind: "HOLD", word: "HOLD", seed: 187 },
};

export function valveCues(
  l: Layout,
  world: World,
  s: ValveState,
  beatPhase: number,
): readonly BossCue[] {
  const frame = cueFrame(l, CUE_FRAME_WIDE);
  const { cfg, beat } = world;
  const out: BossCue[] = [];
  if (valveLeaking(s)) {
    const x = fieldX(l, s.sparkCol);
    const aim = cueAimAt(l, valveSparkNow(l, world, s, beat, beatPhase));
    out.push({ seat: null, kind: "PRESS", word: "FIRE", x, y: l.hullY, ...frame, aim, seed: 180 });
  }
  if (s.phase === "turn") {
    const { x, y } = valveWheelCircle(l, cfg, s, beat, beatPhase);
    out.push({ seat: 1, kind: "TURN", word: "TURN", x, y, ...frame, seed: 181 });
  }
  if (s.phase === "hold") {
    const { x, y } = valveSocketCircle(l, cfg, s, beat, beatPhase);
    out.push({
      seat: 2,
      kind: "PRESS",
      word: "TAP",
      why: "TO FREEZE THE WHEEL",
      x,
      y,
      ...frame,
      seed: 182,
    });
  }
  const pin = valveLivePinCircle(l, cfg, s, beat, beatPhase);
  if (pin !== null) {
    out.push({ seat: null, kind: "HOLD", word: "PULL", x: pin.x, y: pin.y, ...frame, seed: 183 });
  }
  const story = STORY[s.phase];
  if (story !== undefined) {
    const { x, y } = valveSocketCircle(l, cfg, s, beat, beatPhase);
    out.push({ seat: null, ...story, x, y, ...frame });
  }
  return out;
}
