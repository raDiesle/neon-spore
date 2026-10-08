import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type TrapezeSimEvent = Extract<SimEvent, { type: `trapeze${string}` }>;

/** Whether an event is THE TRAPEZE's, so a page of the chain can hand it over whole. */
export function isTrapezeEvent(e: SimEvent): e is TrapezeSimEvent {
  return e.type.startsWith("trapeze");
}

/**
 * THE TRAPEZE's thirteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: a push, a brake, a swipe that did nothing, a
 * call and a shot are panned to the alien, so the pair hear the swing go
 * across; the gong is panned to its side.
 *
 * **A gong rises as they add up.**
 */
export function trapezeCue(e: TrapezeSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "trapezeGong":
      return { id: "boss.trapezeGong", pan, pitch: 1 + Math.max(0, e.gongs - 1) * 0.08 };
    case "trapezeEnter":
      return { id: "boss.trapezeEnter", pan };
    case "trapezeLevel":
      return { id: "boss.trapezeLevel", pan };
    case "trapezeCall":
      return { id: "boss.trapezeCall", pan };
    case "trapezePush":
      return { id: "boss.trapezePush", pan };
    case "trapezeBrake":
      return { id: "boss.trapezeBrake", pan };
    case "trapezeWhiff":
      return { id: "boss.trapezeWhiff", pan };
    case "trapezeLock":
      return { id: "boss.trapezeLock", pan };
    case "trapezeUnlock":
      return { id: "boss.trapezeUnlock", pan };
    case "trapezeShot":
      return { id: "boss.trapezeShot", pan };
    case "trapezeMiss":
      return { id: "boss.trapezeMiss", pan };
    case "trapezeSpent":
      return { id: "boss.trapezeSpent", pan };
    case "trapezeOut":
      return { id: "boss.trapezeOut", pan };
  }
}
