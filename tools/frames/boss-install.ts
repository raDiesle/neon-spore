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
 * **The type of the value already there is the rule.** A field holding a number
 * takes a number, one holding a string takes a string, one holding a boolean
 * takes `true` or `false`, and a field holding a list takes a list of the same
 * length — a shorter one would draw a boss with fewer sockets than the
 * simulation has and look like a picture of a state.
 */

import type { Page } from "playwright-core";
import type { BossSpec } from "./boss.js";

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
  const said = await page.evaluate((list) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a boss field");
    const world = ns.world as unknown as {
      boss?: Record<string, unknown> | null;
      beat?: unknown;
      creatures?: readonly Record<string, unknown>[];
    };
    const boss = world.boss;
    if (!boss) return "this wave installs no boss, so it has no fields to set";
    const beat = world.beat;
    // The body the boss is *drawn* as, which is a creature on the field like
    // any other and linked to the state by this one number and nothing else
    // (`creatureId`, sim/boss-state.ts).
    const id = boss.creatureId;
    const body =
      typeof id === "number" ? (world.creatures ?? []).find((c) => c.id === id) : undefined;
    const kind = String(boss.kind);
    // Checked whole before a single one is written (`installBoss`).
    for (const one of list) {
      const mine = one.where === "creature";
      const flag = mine ? "--creature" : "--boss";
      if (mine && body === undefined) {
        return `--creature ${one.key}: the ${kind} is drawn as no body on the field`;
      }
      const on = mine && body !== undefined ? body : boss;
      if (!(one.key in on)) {
        const have = Object.keys(on).sort().join(", ");
        const what = mine ? `the ${kind}'s body` : `the ${kind}`;
        return `${flag} ${one.key}: ${what} has no such field. It has ${have}`;
      }
      if (one.key === "kind" || (mine && one.key === "id")) {
        return `${flag} ${one.key}: which body a wave installs is the wave's, not a flag's`;
      }
      const was = on[one.key];
      const want = one.value;
      // A list takes a list of its own length, and a shape takes a shape: both
      // arrive only from `--boss-json`, and both are the states that could not
      // be photographed at all until it existed.
      if (Array.isArray(was)) {
        if (!Array.isArray(want)) {
          return `${flag} ${one.key}: that field is a list — write it whole, with --boss-json`;
        }
        if (want.length !== was.length) {
          return `--boss-json ${one.key}: that field holds ${was.length}, and ${want.length} came`;
        }
        continue;
      }
      if (was !== null && typeof was === "object") {
        if (want === null || typeof want !== "object" || Array.isArray(want)) {
          return `${flag} ${one.key}: that field is a shape — write it whole, with --boss-json`;
        }
        continue;
      }
      if (Array.isArray(want) || (want !== null && typeof want === "object")) {
        return `--boss-json ${one.key}: that field holds ${typeof was}, not a list or a shape`;
      }
      const wantNumber = one.value === null || typeof one.value === "number";
      if (typeof was === "number" && !wantNumber) {
        return `${flag} ${one.key}=${String(one.value)}: that field holds a number`;
      }
      if (typeof was === "string" && typeof one.value !== "string") {
        return `${flag} ${one.key}=${String(one.value)}: that field holds a word, e.g. ${was}`;
      }
      if (typeof was === "boolean" && typeof one.value !== "boolean") {
        return `${flag} ${one.key}=${String(one.value)}: that field holds true or false`;
      }
      if (one.value === null && typeof beat !== "number") {
        return `${flag} ...=now: this build has no world.beat to read`;
      }
    }
    for (const one of list) {
      const on = one.where === "creature" && body !== undefined ? body : boss;
      on[one.key] = one.value === null ? beat : one.value;
    }
    return "";
  }, fields);
  if (said !== "") throw new Error(said);
}
