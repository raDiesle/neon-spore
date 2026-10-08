/**
 * `--entry <n>:<key>=<value>[,…]` — fields merged into one of the wave's own
 * arrivals before it arrives.
 *
 * **A gesture no wave sends was unphotographable**, `--fault`'s argument said
 * about an arrival (`fault.ts`). THE BLISTER's HOLD landed with no wave that
 * sends one, and its one picture was taken by writing `gesture: "hold"` into
 * THE BLISTER's first arrival in the working tree, running `frames .` and
 * reverting by hand — an edit to a shipped wave a slip would have committed
 * (`docs/queue.md`, 8 October 2026). SWIPE, TURN and RUB meet the same wall.
 *
 * `n` counts `world.queue` from 0, which is the wave's arrivals **in the order
 * they arrive** (`queueFromWave` sorts by beat, ties in the order written).
 * The values are read exactly as `--boss`'s are (`scalars`, `boss.ts`), and
 * `now` is refused: an arrival's beat is written on the wave's own clock, not
 * on the world's. The fields are written straight after the jump, before the
 * opening lets go (`page.ts`), so the arrival spawns carrying them; a key is
 * not checked against `SpawnEntry`, whose optional fields an arrival without
 * them does not hold.
 */

import type { Page } from "playwright-core";
import { nowShift, scalars } from "./boss.js";

export interface EntrySpec {
  index: number;
  fields: { key: string; value: unknown }[];
}

/** `--entry` off the command line: an arrival's number, then its fields. */
export function parseEntry(value: string | undefined): EntrySpec | undefined {
  if (value === undefined) return undefined;
  const m = /^(\d+):(.*)$/.exec(value.trim());
  if (!m)
    throw new Error(
      `--entry ${JSON.stringify(value)}: <n>:<key>=<value>[,…] — e.g. --entry 0:gesture=hold`,
    );
  const fields = (scalars("--entry", m[2], undefined) ?? []).map(({ key, value: v }) => {
    if (v === null || nowShift(v) !== undefined) {
      throw new Error(`--entry ${key}=now: an arrival is written on the wave's clock, so a number`);
    }
    return { key, value: v };
  });
  return { index: Number(m[1]), fields };
}

/**
 * The write, done in the page. Self-contained, because it crosses into the
 * page as text: it reads the world off `window.neonSpore` and answers a
 * refusal as a sentence, or `null` when every field is written.
 */
export function writeEntry(spec: EntrySpec): string | null {
  const world = (
    globalThis as unknown as {
      window?: { neonSpore?: { world?: { queue?: Record<string, unknown>[]; spawned?: number } } };
    }
  ).window?.neonSpore?.world;
  const queue = world?.queue;
  if (!Array.isArray(queue)) return "--entry: this build's world has no queue to write into";
  const entry = queue[spec.index];
  if (!entry) {
    return `--entry ${spec.index}: this wave has ${queue.length} arrivals, counted from 0`;
  }
  if ((world?.spawned ?? 0) > spec.index) {
    return `--entry ${spec.index}: that one has already arrived, so a field written now is drawn by nobody`;
  }
  for (const f of spec.fields) entry[f.key] = f.value;
  return null;
}

/** Writes `--entry`'s fields into the page's world, or throws its refusal. */
export async function installEntry(page: Page, spec: EntrySpec): Promise<void> {
  const said = await page.evaluate(writeEntry, spec);
  if (said) throw new Error(said);
}
