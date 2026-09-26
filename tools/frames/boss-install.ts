/**
 * Writing `--boss`, `--boss-json` and `--creature` on the world, in the page.
 *
 * Split off `boss.ts` on line count when `--creature` arrived (21 September
 * 2026), along the seam that file already had in it: everything above the cut
 * turns text into names and values and knows nothing about the boss, and
 * everything below it is the only code that has ever seen the real state.
 *
 * **The keys are checked in the page, against the boss that is actually
 * installed**, and not against a list spelled out in this tree. That is the one
 * design decision here. A second copy of a state's fields is a copy that goes
 * stale — `FAULT_FLAG_KINDS` said `leak` for a fault the simulation had stopped
 * having and did not say `leech` or `limpet`, so the flag refused the only two
 * anybody wanted a picture of. There are fourteen boss states and sixty-odd
 * creature kinds, and every new one is another. So what crosses into the page
 * is a list of names and values as JSON, and the page refuses a name the thing
 * does not have, by name, and says which names it does have.
 *
 * **The page reads and writes; this process decides.** What each field holds
 * now crosses out, `bossRefusal` (`boss-check.ts`) says whether the list may
 * be written, and only then does a second call write it — so the rule is a
 * pure function with tests of its own, and not code that only a browser runs.
 */

import type { Page } from "playwright-core";
import type { BossSpec } from "./boss.js";
import { type BossSeen, bossRefusal } from "./boss-check.js";

/**
 * Write the fields on `world.boss` and on the body it is drawn as, where a
 * fight would have left them.
 *
 * **Straight after the jump and before the opening lets go**, which is where
 * `--fault` and `--boss-round` are written and for their reason: a boss's phase
 * is drawn over the field from the first beat, so one set after the briefing
 * would be a fight that changed its mind halfway through its own introduction.
 *
 * Every field is refused or written; none is written when one is refused, so a
 * capture never comes back a picture of half a state. That matters more here
 * than it does for a fault: the phases of a boss agree with each other — a
 * slack count that has earned `everts` and a phase still reading `still` is a
 * world the simulation could not have reached — and a caller writing three
 * fields to keep them consistent gets all three or an error. It is why the two
 * flags are checked in one pass rather than one each: BULB QUEEN's phase is
 * read off her petals and her descent off `startPetals` minus them, so the
 * boss's number and the body's are one intention and land together or not.
 */
export async function installBoss(page: Page, fields: BossSpec): Promise<void> {
  const asked = fields.map((f) => ({ key: f.key, where: f.where }));
  const seen = await page.evaluate((list): BossSeen | string => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a boss field");
    const world = ns.world as unknown as {
      boss?: Record<string, unknown> | null;
      beat?: unknown;
      creatures?: readonly Record<string, unknown>[];
    };
    const boss = world.boss;
    if (!boss) return "this wave installs no boss, so it has no fields to set";
    // The body the boss is *drawn* as, which is a creature on the field like
    // any other and linked to the state by this one number and nothing else
    // (`creatureId`, sim/boss-state.ts).
    const id = boss.creatureId;
    const body =
      typeof id === "number" ? (world.creatures ?? []).find((c) => c.id === id) : undefined;
    return {
      kind: String(boss.kind),
      hasBody: body !== undefined,
      beatIsNumber: typeof world.beat === "number",
      fields: list.map((one) => {
        const on = one.where === "creature" && body !== undefined ? body : boss;
        const present = one.key in on;
        return { present, have: present ? [] : Object.keys(on).sort(), was: on[one.key] };
      }),
    };
  }, asked);
  if (typeof seen === "string") throw new Error(seen);
  const said = bossRefusal(fields, seen);
  if (said !== "") throw new Error(said);
  await page.evaluate((list) => {
    const world = window.neonSpore?.world as unknown as {
      boss: Record<string, unknown>;
      beat: unknown;
      creatures?: readonly Record<string, unknown>[];
    };
    const boss = world.boss;
    const body = (world.creatures ?? []).find((c) => c.id === boss.creatureId);
    // `now` at any depth of `--boss-json` is the beat (`boss.ts`). Spelled out
    // here rather than imported: this function crosses into the page as text.
    const resolve = (v: unknown): unknown => {
      if (v === "now") return world.beat;
      if (Array.isArray(v)) return v.map(resolve);
      if (v === null || typeof v !== "object") return v;
      const out: Record<string, unknown> = {};
      for (const [k, inner] of Object.entries(v)) out[k] = resolve(inner);
      return out;
    };
    for (const one of list) {
      const on = one.where === "creature" && body !== undefined ? body : boss;
      on[one.key] = one.value === null ? world.beat : resolve(one.value);
    }
  }, fields);
}
