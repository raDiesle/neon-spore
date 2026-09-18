/**
 * `--boss <key>=<value>[,…]` and `--boss-json '{…}'` — the installed boss's own
 * fields, written on the world from outside it.
 *
 * **A boss's later phases are a run of correct presses deep**, and that is what
 * made most of them unphotographable. THE THROAT's eversion needs five gums
 * flung into a walking mouth; THE DIASTOLE's second chamber needs the first one
 * spent on a coincidence beat; THE BATON's shed socket needs a handover missed.
 * Three lanes in a row landed a look and said in the commit message that its
 * most important frame had never been seen — the sag, the limp rings, the
 * eversion — and each one fell back to arithmetic in a test, which is the right
 * proof of geometry and no proof at all of how a thing reads.
 *
 * This is `--fault`'s argument said about a boss (`fault.ts`): a state no wave
 * reaches took a scratch script to photograph, the picture that came back was
 * real, and nobody could take it again.
 *
 * **The keys are checked in the page, against the boss that is actually
 * installed**, and not against a list spelled out here. That is deliberate and
 * it is the one design decision in the file. A second copy of a state's fields
 * is a copy that goes stale — `FAULT_FLAG_KINDS` said `leak` for a fault the
 * simulation had stopped having and did not say `leech` or `limpet`, so the
 * flag refused the only two anybody wanted a picture of. There are fourteen
 * boss states and every new one is another. So what crosses into the page is a
 * list of names and values as JSON, and the page refuses a name the boss does
 * not have, by name, and says which names it does have.
 *
 * **The type of the value already there is the rule.** A field holding a number
 * takes a number, one holding a string takes a string, one holding a boolean
 * takes `true` or `false`, and a field holding a list takes a list of the same
 * length — a shorter one would draw a boss with fewer sockets than the
 * simulation has and look like a picture of a state.
 *
 * **A list is written by `--boss-json` and never by `--boss`**, which is the one
 * thing that changed on 18 September 2026. `--boss` was scalars-only by design:
 * a flag that wrote THE BATON's socket array as text would be a flag nobody
 * could read at a glance. But the states that most need photographing *are*
 * lists — THE BATON's thread, THE UNDERTOW's breaches, THE TASTER's blades, THE
 * GORGE's intakes — and refusing them meant a look lane fell back to the
 * preview page, a world built by hand in a console and a canvas pulled out as
 * base64, which is a picture nobody can take again. So the second flag takes a
 * JSON object and assigns its fields whole. The two compose; a key written in
 * both is refused rather than silently taking one.
 *
 * `now` is the one word with a meaning of its own, for any numeric field: it is
 * `world.beat` — and a `"now"` at the top level of `--boss-json` is the same
 * word, so the two flags read alike. Inside a list it is left as it is: a list
 * of beats written by hand is not a state anybody has wanted a picture of, and
 * a substitution that reached into one would be a rule nobody could see. A phase written with `phaseBeat=0` at tick 900 is a phase that
 * began seven beats ago, and for every boss in the game that is a phase already
 * over — which is a picture of nothing, convincingly.
 */

import type { Page } from "playwright-core";

/** One field of the installed boss, as it crosses into the page. */
export interface BossField {
  key: string;
  /**
   * `null` is the literal `now` — `world.beat`, resolved in the page. A list or
   * a plain object arrives only from `--boss-json`; `--boss` makes scalars.
   */
  value: unknown;
}

export type BossSpec = BossField[];

/**
 * `--boss <value>` off the command line.
 *
 * Nothing about the boss is known here, so nothing about the boss is checked
 * here: this only turns the text into names and JSON values and refuses what
 * is not a field assignment at all. Everything else is the page's, which is
 * the only place the real state is.
 */
export function parseBoss(value: string | undefined): BossSpec | undefined {
  if (value === undefined) return undefined;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== "");
  if (parts.length === 0) {
    throw new Error("--boss <key>=<value>[,<key>=<value>…] — e.g. --boss slack=5,phase=everts");
  }
  return parts.map((part) => {
    const cut = part.indexOf("=");
    if (cut <= 0) {
      throw new Error(`--boss ${JSON.stringify(part)}: a field and a value, as key=value`);
    }
    const key = part.slice(0, cut).trim();
    const text = part.slice(cut + 1).trim();
    if (text === "") throw new Error(`--boss ${key}=: a value, and not an empty one`);
    return { key, value: read(key, text) };
  });
}

/**
 * `--boss-json '{"sockets": [1,1,0], "phaseBeat": "now"}'` off the command line.
 *
 * Nothing about the boss is known here either, for `parseBoss`'s reason: this
 * turns the text into names and values, refuses what is not an object of
 * fields, and leaves every question about the boss to the page.
 */
export function parseBossJson(value: string | undefined): BossSpec | undefined {
  if (value === undefined) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch (e) {
    throw new Error(`--boss-json: not JSON — ${(e as Error).message}`);
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`--boss-json '{"key": value, …}': an object of the boss's own fields`);
  }
  const fields = Object.entries(parsed as Record<string, unknown>);
  if (fields.length === 0) throw new Error("--boss-json '{}': a field or two, and not nothing");
  return fields.map(([key, v]) => ({ key, value: v === "now" ? null : v }));
}

/**
 * The two flags as one list, in the order they are written on the world.
 *
 * A key in both is **refused**: the scalar and the whole are two people's
 * intentions about one field, and a capture that quietly took the second would
 * be a picture of a state nobody asked for.
 */
export function bossSpec(scalars?: BossSpec, whole?: BossSpec): BossSpec | undefined {
  if (scalars === undefined && whole === undefined) return undefined;
  const all = [...(scalars ?? []), ...(whole ?? [])];
  const seen = new Set<string>();
  for (const one of all) {
    if (seen.has(one.key)) {
      throw new Error(`--boss ${one.key}: written by --boss and --boss-json both, so which?`);
    }
    seen.add(one.key);
  }
  return all;
}

/** A value's own kind, off how it is written. Everything else is a string. */
function read(key: string, text: string): number | string | boolean | null {
  if (text === "now") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    if (!Number.isFinite(n)) throw new Error(`--boss ${key}=${text}: not a number after all`);
    return n;
  }
  return text;
}

/**
 * Write the fields on `world.boss`, where a fight would have left them.
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
 * fields to keep them consistent gets all three or an error.
 */
export async function installBoss(page: Page, fields: BossSpec): Promise<void> {
  const said = await page.evaluate((list) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a boss field");
    const boss = (ns.world as { boss?: Record<string, unknown> | null }).boss;
    if (!boss) return "this wave installs no boss, so it has no fields to set";
    const have = Object.keys(boss).sort().join(", ");
    const beat = (ns.world as { beat?: unknown }).beat;
    // Checked whole before a single one is written (`installBoss`).
    for (const one of list) {
      if (!(one.key in boss)) {
        return `--boss ${one.key}: the ${String(boss.kind)} has no such field. It has ${have}`;
      }
      if (one.key === "kind") {
        return "--boss kind: which boss a wave installs is the wave's, not a flag's";
      }
      const was = boss[one.key];
      const want = one.value;
      // A list takes a list of its own length, and a shape takes a shape: both
      // arrive only from `--boss-json`, and both are the states that could not
      // be photographed at all until it existed.
      if (Array.isArray(was)) {
        if (!Array.isArray(want)) {
          return `--boss ${one.key}: that field is a list — write it whole, with --boss-json`;
        }
        if (want.length !== was.length) {
          return `--boss-json ${one.key}: that field holds ${was.length}, and ${want.length} came`;
        }
        continue;
      }
      if (was !== null && typeof was === "object") {
        if (want === null || typeof want !== "object" || Array.isArray(want)) {
          return `--boss ${one.key}: that field is a shape — write it whole, with --boss-json`;
        }
        continue;
      }
      if (Array.isArray(want) || (want !== null && typeof want === "object")) {
        return `--boss-json ${one.key}: that field holds ${typeof was}, not a list or a shape`;
      }
      const wantNumber = one.value === null || typeof one.value === "number";
      if (typeof was === "number" && !wantNumber) {
        return `--boss ${one.key}=${String(one.value)}: that field holds a number`;
      }
      if (typeof was === "string" && typeof one.value !== "string") {
        return `--boss ${one.key}=${String(one.value)}: that field holds a word, e.g. ${was}`;
      }
      if (typeof was === "boolean" && typeof one.value !== "boolean") {
        return `--boss ${one.key}=${String(one.value)}: that field holds true or false`;
      }
      if (one.value === null && typeof beat !== "number") {
        return "--boss ...=now: this build has no world.beat to read";
      }
    }
    for (const one of list) boss[one.key] = one.value === null ? beat : one.value;
    return "";
  }, fields);
  if (said !== "") throw new Error(said);
}
