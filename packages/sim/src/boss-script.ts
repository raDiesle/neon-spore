import type { BossState } from "./boss-union.js";
import type { World } from "./world.js";

/**
 * **Where a choreographed boss is in its script**: which step is up, out of
 * how many, and the step's own word where it has one. Read by the director's
 * stage and the game's HUD alike, so the two can never count differently.
 *
 * A choreographed boss keeps its place as `cursor` on its state and its script
 * as one list beside it. The list goes by five names — `steps` (the asks of
 * THE CYST and its kind, the poses of THE INSTAR and THE NETTLE), `marks`
 * (THE GIMBAL), `tiles` (THE FILAMENT), `thresholds` (THE MANTLE), `levels`
 * (THE FLUE, whose word is the level's weapon) — and
 * `SCRIPT_LISTS` is the one line each. A boss added later with its script under
 * a sixth name reads null here until it gains a line, and
 * `packages/content/test/boss-script.test.ts` fails on every boss wave that
 * has a `cursor` and no script.
 *
 * THE REPRISE also has a `cursor`, and it is not a choreography: it is an index
 * into the wave's own queue, echoed back. It is the one named exception.
 */
export interface BossScript {
  /** Which step is up, counting from 0; `of` once the last has landed. */
  at: number;
  /** How many steps the script has. */
  of: number;
  /** The step's own word — its ask or its pose — or null where it has none. */
  name: string | null;
}

const SCRIPT_LISTS = ["steps", "marks", "tiles", "thresholds", "levels"] as const;

/** Bosses that keep a `cursor` which is not a place in a script. */
export const NOT_A_SCRIPT: readonly BossState["kind"][] = ["reprise"];

/** The boss's script list and its place in it, or null where it has none. */
function scriptList(boss: BossState | null): { at: number; list: unknown[] } | null {
  if (boss === null || NOT_A_SCRIPT.includes(boss.kind) || !("cursor" in boss)) return null;
  const at = boss.cursor;
  if (typeof at !== "number") return null;
  for (const key of SCRIPT_LISTS) {
    if (!(key in boss)) continue;
    const list = (boss as unknown as Record<string, unknown>)[key];
    if (Array.isArray(list)) return { at, list };
  }
  return null;
}

export function bossScriptOf(boss: BossState | null): BossScript | null {
  const s = scriptList(boss);
  return s === null ? null : { at: s.at, of: s.list.length, name: stepName(s.list[s.at]) };
}

/** Every step's own word, in order — what the director's step list is written from. */
export function bossScriptNames(world: World): (string | null)[] | null {
  return scriptList(world.boss)?.list.map(stepName) ?? null;
}

export function bossScript(world: World): BossScript | null {
  return bossScriptOf(world.boss);
}

function stepName(step: unknown): string | null {
  if (typeof step !== "object" || step === null) return null;
  const s = step as { pose?: unknown; ask?: unknown; weapon?: unknown };
  if (typeof s.pose === "string") return s.pose;
  if (typeof s.ask === "string") return s.ask;
  if (typeof s.weapon === "string") return s.weapon;
  return null;
}

/** Steps still to come after the one that is up. */
export function bossScriptLeft(s: BossScript): number {
  return Math.max(0, s.of - s.at - 1);
}

/**
 * The readout, near the spec's words (`docs/spec/living-bosses.md` §3):
 * `STEP 7 / 25 · 18 TO GO · CURL`, counting from one, and `DONE` once the
 * cursor has run off the end of the script. The spec wrote `18 LEFT`; half
 * the step-by-ask bosses have an ask called `left`, and `10 LEFT · LEFT` read
 * as a stammer.
 */
export function bossScriptLabel(s: BossScript): string {
  if (s.at >= s.of) return `STEP ${s.of} / ${s.of} · DONE`;
  const head = `STEP ${s.at + 1} / ${s.of} · ${bossScriptLeft(s)} TO GO`;
  return s.name === null ? head : `${head} · ${s.name.toUpperCase()}`;
}
