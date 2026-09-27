import { spyOn } from "bun:test";
import type { BossKind, World } from "@neon-spore/sim";

/**
 * **What a row of `marks-window.test.ts` is made of**, out of that file on 27
 * September 2026 when the second six bosses' rows would have taken it past
 * 250 lines. A row names a boss and, for each function in its `*-marks.ts`
 * that draws a mark, the call that draws it lit and the simulation's window
 * it may be lit in.
 */

/** One marks function: whether a call draws it lit, and the window it may be lit in. */
export interface Mark {
  name: string;
  calls: () => readonly unknown[][];
  lit: (args: readonly unknown[]) => boolean;
  open: (world: World) => boolean;
  /** Why AUTO never reaches this mark's window: its calls are still checked, its sighting is not. */
  unreached?: string;
}

export interface Row {
  kind: BossKind;
  marks: (() => Mark)[];
}

/** Every spy a row has put up, for the test to take down after it. */
export const spies: { mockRestore: () => void }[] = [];

/** A spy on `ns[name]`, put up when the row runs; every call is lit unless `lit` says otherwise. */
export function mark<T extends object, K extends keyof T & string>(
  ns: T,
  name: K,
  open: (world: World) => boolean,
  lit: (args: readonly unknown[]) => boolean = () => true,
): () => Mark {
  return () => {
    // biome-ignore lint/suspicious/noExplicitAny: a namespace's export, spied by name
    const spy = spyOn(ns as any, name);
    spies.push(spy);
    return { name, calls: () => spy.mock.calls as unknown[][], lit, open };
  };
}

/**
 * A mark AUTO cannot reach yet, because the boss has no hand to play it that
 * far (`autopilot.test.ts` `NO_HAND`): every call it makes is still held to
 * its window, but it is not required to be seen lit. `why` names the queue
 * entry that takes the exception away.
 */
export function unreached(m: () => Mark, why: string): () => Mark {
  return () => ({ ...m(), unreached: why });
}
