import {
  CAPSTAN_UNREAD,
  type CapstanState,
  capstanBand,
  capstanBoss,
  capstanFace,
  capstanSeatIndex,
  capstanWearer,
} from "./capstan.js";
import { capstanCracked } from "./capstan-step.js";
import { midCol } from "./config.js";
import type { Command } from "./types.js";
import type { World } from "./world.js";

/** The furthest a pull is kept either way, in thousandths of a tile: wider than any field. */
const MAX_PULL_MILLI = 20_000;

/**
 * A pull and a thumb on THE CAPSTAN, from either seat — which one steers and
 * which one rubs is the lit step's, so both readings are kept for both.
 *
 * **The pull is a handle's carry**: `capstanSteer`, `fromMilli` how far the
 * thumb has come across from where it took the drum, thousandths of a tile,
 * and a lift the thumb up — centred here, which rocks nothing and pauses the
 * rub. What is heard is the cradle **rocking over or drifting back** under
 * the steering pull.
 *
 * **The thumb is a `RubCount`** (`drag-targets-e.ts`): `capstanRub`, `id` the
 * reversals since the thumb went down, kept so only fresh ones count and a
 * count lower than the last is a fresh touch. Fresh reversals from the
 * wearing seat go into the bared face's band and nowhere else; from the
 * steering seat, or on a centred cradle, they do nothing, silently. A band
 * that is not the lit step's own stops one reversal short of bright, so it
 * cracks only once its mark lights — and loses nothing meanwhile.
 */
export function capstanHeard(world: World, player: 1 | 2, command: Command): void {
  if (command.kind !== "drag") return;
  const s = capstanBoss(world);
  if (s === null) return;
  if (command.target === "capstanSteer") pull(world, s, player, command.on, command.fromMilli);
  else if (command.target === "capstanRub") rub(world, s, player, command.on, command.id ?? 0);
}

function pull(world: World, s: CapstanState, player: 1 | 2, on: boolean, milli: number): void {
  if (!Number.isInteger(milli)) return;
  const was = capstanFace(world, s);
  s.pullMilli[capstanSeatIndex(player)] = on
    ? Math.max(-MAX_PULL_MILLI, Math.min(MAX_PULL_MILLI, milli))
    : CAPSTAN_UNREAD;
  const face = capstanFace(world, s);
  if (face === was) return;
  const col = midCol(world.cfg);
  if (face === null) world.events.push({ type: "capstanDrift", col });
  else world.events.push({ type: "capstanRock", side: face, col });
}

function rub(world: World, s: CapstanState, player: 1 | 2, on: boolean, id: number): void {
  const i = capstanSeatIndex(player);
  if (!on) {
    s.rubs[i] = 0;
    return;
  }
  const count = Math.max(0, id);
  const fresh = count >= s.rubs[i] ? count - s.rubs[i] : count;
  s.rubs[i] = count;
  const face = capstanFace(world, s);
  if (fresh === 0 || face === null || capstanWearer(world, s) !== player) return;
  s.rubbed = true;
  const threshold = world.cfg.capstanWearThreshold;
  const cap = capstanBand(s) === face ? threshold : threshold - 1;
  const was = s.wear[face];
  if (was >= cap) return;
  s.wear[face] = Math.min(cap, was + fresh);
  world.events.push({
    type: "capstanWear",
    side: face,
    wear: s.wear[face],
    col: midCol(world.cfg),
  });
  if (s.wear[face] >= threshold) capstanCracked(world, s, face);
}
