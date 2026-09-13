import { handedOver, type World } from "@neon-spore/sim";
import type { Memory } from "./memory.js";

/**
 * THE HANDOVER, heard: the beat the panels change screens, and the beat they
 * come back.
 *
 * Every other fault is a thing that *acts* and is heard doing it — a shot
 * fired by nobody, a dome coming up unasked. This one changes what is in
 * front of the pair, and it had the plate's flash and nothing else to say so
 * (`render/handover-look.ts`). The loudest moment the fault has was silent.
 *
 * **Read off the clock, not off an event.** The trade is a `handedOver` edge
 * and the simulation emits nothing for it, on purpose: nothing in the world
 * moves for this fault, and the fault has stayed free everywhere else by
 * having every reader ask `sim/handover.ts` the same question. So this is
 * heard the way the cannon's column is — by comparing this frame's answer to
 * the last one's, out of `Memory` — and `docs/spec/audio.md` §6 is where that
 * arrangement is written down.
 *
 * **Two sounds, not one twice.** The trade and the return are the same event
 * from two ends, and one of them is a relief. `assist.handOver` is a tone
 * crossing the stereo field left to right, written for a control lent across
 * the pair before this fault existed; `assist.takeOver` is the same crossing
 * back, and it is played quieter, because what it marks is the pair's own
 * hands coming home rather than something being taken.
 *
 * **Both phones hear both**, the same way both carry the plate: a trade only
 * one of them heard would make it something that happens *to* the other one.
 */

/** The mixer's own `play` with its gain, handed over so nothing here needs an engine. */
export type Play = (id: string, pan?: number, gain?: number) => void;

/** How much quieter the return is than the trade. */
const BACK_GAIN = 0.6;

export function soundHandover(world: World, first: boolean, m: Memory, play: Play): void {
  const traded = handedOver(world);
  if (!first && traded && !m.handedOver) play("assist.handOver");
  if (!first && !traded && m.handedOver) play("assist.takeOver", undefined, BACK_GAIN);
  m.handedOver = traded;
}
