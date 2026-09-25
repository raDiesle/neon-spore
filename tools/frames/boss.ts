/**
 * `--boss <key>=<value>[,…]`, `--boss-json '{…}'` and `--creature <key>=<value>`
 * — the installed boss's own fields and its body's, written on the world from
 * outside it. Read off the command line here; written in the page next door
 * (`boss-install.ts`).
 *
 * **A boss's later phases are a run of correct presses deep**, and that is what
 * made most of them unphotographable. THE THROAT's eversion needs five gums
 * flung into a walking mouth; THE BATON's shed socket needs a handover missed.
 * Three lanes in a row landed a look and said in the commit message that its
 * most important frame had never been seen — the sag, the limp rings, the
 * eversion — and each one fell back to arithmetic in a test, which is the right
 * proof of geometry and no proof at all of how a thing reads.
 *
 * This is `--fault`'s argument said about a boss (`fault.ts`): a state no wave
 * reaches took a scratch script to photograph, the picture that came back was
 * real, and nobody could take it again.
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
 * **And half of a boss is not in `world.boss` at all**, which is what
 * `--creature` is for (21 September 2026). A boss that stands on the field is
 * drawn as a body like any other, linked to its state by `creatureId`, and the
 * fields that decide what the fight looks like are split across the two:
 * BULB QUEEN's phase is read off `queen.petals` **every beat** (`enterPhase`,
 * sim/boss.ts) and her row off `startPetals` minus them, so `--boss phase=1`
 * was undone on the first beat after it was written and her BROOD could not be
 * photographed from the game at all. The flag that reaches the body is the same
 * flag said about the other object: `--creature petals=6`.
 *
 * `now` is the one word with a meaning of its own, for any numeric field: it is
 * `world.beat` — and a `"now"` at the top level of `--boss-json` is the same
 * word, so the flags read alike. Inside a list it is left as it is: a list
 * of beats written by hand is not a state anybody has wanted a picture of, and
 * a substitution that reached into one would be a rule nobody could see. A phase written with `phaseBeat=0` at tick 900 is a phase that
 * began seven beats ago, and for every boss in the game that is a phase already
 * over — which is a picture of nothing, convincingly.
 */

/** One field of the installed boss, or of its body, as it crosses into the page. */
export interface BossField {
  key: string;
  /**
   * `null` is the literal `now` — `world.beat`, resolved in the page. A list or
   * a plain object arrives only from `--boss-json`; the other two make scalars.
   */
  value: unknown;
  /** Absent for the boss's own state; `"creature"` for the body it is drawn as. */
  where?: "creature";
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
  return scalars("--boss", value, undefined);
}

/**
 * `--creature <value>` off the command line — the boss's body, not a body the
 * caller picks out of the field. There is one per boss and the boss names it,
 * so the flag takes fields and no way to say which creature: a flag that could
 * address any of them would be a flag that needs an id nobody can read off a
 * picture.
 */
export function parseCreature(value: string | undefined): BossSpec | undefined {
  return scalars("--creature", value, "creature");
}

/** The shared body of the two scalar flags: names, values, and nothing else. */
function scalars(
  flag: string,
  value: string | undefined,
  where: "creature" | undefined,
): BossSpec | undefined {
  if (value === undefined) return undefined;
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== "");
  if (parts.length === 0) {
    throw new Error(`${flag} <key>=<value>[,<key>=<value>…] — e.g. ${flag} slack=5,phase=everts`);
  }
  return parts.map((part) => {
    const cut = part.indexOf("=");
    if (cut <= 0) {
      throw new Error(`${flag} ${JSON.stringify(part)}: a field and a value, as key=value`);
    }
    const key = part.slice(0, cut).trim();
    const text = part.slice(cut + 1).trim();
    if (text === "") throw new Error(`${flag} ${key}=: a value, and not an empty one`);
    return { key, value: read(flag, key, text), ...(where ? { where } : {}) };
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
 * The three flags as one list, in the order they are written on the world.
 *
 * A key in both `--boss` and `--boss-json` is **refused**: the scalar and the
 * whole are two people's intentions about one field, and a capture that quietly
 * took the second would be a picture of a state nobody asked for. A key shared
 * with `--creature` is no clash at all — those are two objects, and a boss and
 * its body having a field of the same name is a coincidence of spelling.
 */
export function bossSpec(
  scalarFields?: BossSpec,
  whole?: BossSpec,
  creature?: BossSpec,
): BossSpec | undefined {
  if (scalarFields === undefined && whole === undefined && creature === undefined) return undefined;
  const all = [...(scalarFields ?? []), ...(whole ?? []), ...(creature ?? [])];
  const seen = new Set<string>();
  for (const one of all) {
    const name = `${one.where ?? "boss"}.${one.key}`;
    if (seen.has(name)) {
      throw new Error(`--boss ${one.key}: written by --boss and --boss-json both, so which?`);
    }
    seen.add(name);
  }
  return all;
}

/** A value's own kind, off how it is written. Everything else is a string. */
function read(flag: string, key: string, text: string): number | string | boolean | null {
  if (text === "now") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    if (!Number.isFinite(n)) throw new Error(`${flag} ${key}=${text}: not a number after all`);
    return n;
  }
  return text;
}
