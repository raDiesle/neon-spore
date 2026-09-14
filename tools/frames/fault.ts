/**
 * `--fault <kind>[:<numbers>]` — the wave's fault, written on the world from
 * outside it.
 *
 * **A fault is authored on a wave and nowhere else**, which is exactly what
 * made one unphotographable. Verifying THE HANDOVER's *cycle* meant a scratch
 * script that set `world.malfunction = { kind: "handover", at, beats, every }`
 * on the page by hand after `openStage`, because no wave in the tree repeats
 * the trade and the tool had no way to say so. The picture that came back was
 * real and nobody else could take it again.
 *
 * So the three boxes the director already draws — `at`, `beats`, `every` — are
 * a flag, and the same flag stands a runaway cannon or a shield up on a wave
 * that names neither. What it writes is the shape `startWave` would have
 * installed had the wave carried it, so the frame is of a wave with a fault on
 * it rather than of a field with a field written into it: the argument
 * `handle.ts` makes against setting state from outside holds for state the
 * game *reaches*, and a fault is authored before the first tick either way.
 *
 * **Structural, not `Malfunction` imported from `packages/sim`**, for
 * `spec.ts`'s reason: this drives a *built* game, sometimes one built from a
 * commit whose types are not the working tree's, and what crosses into the
 * page is JSON. The kinds are spelled here and refused by name.
 */

import type { Page } from "playwright-core";

/** `MALFUNCTION_KINDS` from `packages/sim/src/malfunction.ts`, spelled out. */
const KINDS = ["cannon", "shield", "steer", "codex", "handover", "leak"] as const;
type FaultKind = (typeof KINDS)[number];

/** `MALFUNCTION_COLORS`, likewise. What a runaway cannon loads. */
const COLORS = ["red", "cyan", "alternating"] as const;
type FaultColor = (typeof COLORS)[number];

/** What goes on `world.malfunction`: one arm of that file's union, as JSON. */
export interface FaultOnWorld {
  kind: FaultKind;
  color?: FaultColor;
  at?: number;
  beats?: number;
  every?: number;
}

export interface FaultSpec {
  malfunction: FaultOnWorld;
  /**
   * `malfunctionEveryBeats` on `world.cfg`, when the flag named a period for a
   * fault that reads the fault clock rather than carrying its own numbers.
   *
   * THE HANDOVER writes its period on itself; a runaway cannon and a self-
   * arming shield read it off the config, so "a cannon at a period the wave
   * does not name" is a different field with the same meaning. Absent unless
   * the flag asked, so a capture that names no period is the shipped clock.
   */
  everyBeats?: number;
}

/** A whole number of beats, refused by name rather than arriving as `NaN`. */
function beats(value: string, what: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(`--fault: ${what} is ${JSON.stringify(value)}, not a whole number of beats`);
  }
  return n;
}

/** The comma-separated numbers after the kind, refusing more than were asked for. */
function numbers(rest: string, names: readonly string[], kind: string): number[] {
  const parts = rest.split(",");
  if (parts.length > names.length) {
    throw new Error(
      `--fault ${kind}: ${parts.length} numbers, and ${kind} takes ${names.length} — ` +
        `${names.join(", ")} in that order`,
    );
  }
  return parts.map((p, i) => beats(p.trim(), names[i] as string));
}

/**
 * `--fault <value>` off the command line.
 *
 * Each kind is given the grammar its own arm of the union has, and is refused
 * by name when it is written with numbers it has no field for — a `beats` on a
 * shield would be a number a caller could set and never see the effect of,
 * which is the argument `Malfunction` is a union for in the first place.
 */
export function parseFault(value: string | undefined): FaultSpec | undefined {
  if (value === undefined) return undefined;
  const cut = value.indexOf(":");
  const kind = (cut === -1 ? value : value.slice(0, cut)).trim();
  const rest = cut === -1 ? "" : value.slice(cut + 1).trim();
  if (!KINDS.includes(kind as FaultKind)) {
    throw new Error(`--fault ${JSON.stringify(value)}: one of ${KINDS.join(", ")}`);
  }
  const named: FaultKind = kind as FaultKind;

  if (named === "handover") {
    // All three optional, falling back to `config-malfunction.ts` the way the
    // wave's own author's do: `--fault handover` is the shipped window.
    const [at, held, every] = rest === "" ? [] : numbers(rest, ["at", "beats", "every"], named);
    return {
      malfunction: {
        kind: named,
        ...(at === undefined ? {} : { at }),
        ...(held === undefined ? {} : { beats: held }),
        ...(every === undefined ? {} : { every }),
      },
    };
  }

  if (named === "cannon") {
    // The colour is required and not defaulted: a fault that always fired red
    // is a different wave from one whose ammunition turns over on the beat,
    // and picking one silently is a picture of a wave nobody asked for.
    const [color, every] = rest.split(",").map((p) => p.trim());
    if (!color || !COLORS.includes(color as FaultColor)) {
      throw new Error(`--fault cannon:<color>[,<every>] — a colour, one of ${COLORS.join(", ")}`);
    }
    return {
      malfunction: { kind: named, color: color as FaultColor },
      ...(every === undefined ? {} : { everyBeats: beats(every, "every") }),
    };
  }

  if (named === "shield") {
    return {
      malfunction: { kind: named },
      ...(rest === "" ? {} : { everyBeats: numbers(rest, ["every"], named)[0] }),
    };
  }

  if (rest !== "") {
    throw new Error(`--fault ${named}: ${named} carries no numbers — write it as --fault ${named}`);
  }
  return { malfunction: { kind: named } };
}

/**
 * Write the fault on the world, where `startWave` would have left the wave's
 * own.
 *
 * **Before the opening lets go**, because the opening reads it: a handover's
 * countdown is drawn over the field from the first beat, and a fault installed
 * after the briefing would be a wave that acquired one halfway through its own.
 */
export async function installFault(page: Page, fault: FaultSpec): Promise<void> {
  await page.evaluate((one) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a fault");
    if (!("malfunction" in ns.world)) {
      throw new Error(
        "this build has no world.malfunction — --fault needs a commit at or after the one that " +
          "added the mechanic, and a before/after pair cannot set it on its parent",
      );
    }
    ns.world.malfunction = one.malfunction;
    if (one.everyBeats !== undefined) {
      if (!ns.world.cfg) {
        throw new Error("this build has no world.cfg — --fault cannot name a period on it");
      }
      ns.world.cfg.malfunctionEveryBeats = one.everyBeats;
    }
  }, fault);
}
