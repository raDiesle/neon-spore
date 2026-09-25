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

/** `TO_THE_END` from `sim/fault-placed.ts`: a pencil with no end written. Zero
 * rather than a large number, and spelled here for `FaultKind`'s reason — what
 * crosses into the page is JSON, sometimes into a build that is not this tree's. */
export const TO_THE_END = 0;

/**
 * `MALFUNCTION_KINDS` from `packages/sim/src/malfunction.ts`, spelled out.
 *
 * It said `leak` until 15 September 2026, which was a kind the owner took back
 * off the list, and it did not say `leech` or `limpet`, which are the two he
 * added — so the flag refused the only two faults anybody wanted a picture of
 * and accepted one the simulation no longer knows. A list spelled out in a
 * second file is a list that goes stale; `placed.test.ts` beside this one is
 * what notices now.
 */
export const FAULT_FLAG_KINDS = [
  "cannon",
  "shield",
  "steer",
  "codex",
  "handover",
  "leech",
  "limpet",
  "flip",
  "dark",
] as const;
type FaultKind = (typeof FAULT_FLAG_KINDS)[number];

/** `MALFUNCTION_COLORS`, likewise. What a runaway cannon loads. */
const COLORS = ["red", "cyan", "alternating"] as const;
type FaultColor = (typeof COLORS)[number];

/**
 * **What goes in `world.faults`**: one `PlacedFault`, as JSON.
 *
 * It used to go on `world.malfunction`, a single field holding the wave's one
 * fault for the whole of itself. That field is gone — a fault is a pencil on
 * the map now, with a beat it enters on and a number of beats it holds, and a
 * wave may carry several (`sim/fault-placed.ts`). So `at` and `beats` are no
 * longer THE HANDOVER's alone: every kind takes them, which is the same thing
 * the director's own two boxes say under every fault brush.
 *
 * `beats: 0` is `TO_THE_END` and is what a flag naming no length means.
 */
export interface FaultOnWorld {
  kind: FaultKind;
  color?: FaultColor;
  /** Whose screen THE FLIP turns, and nothing else reads it (`sim/flip.ts`). */
  seat?: 1 | 2;
  at: number;
  beats: number;
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
  if (!FAULT_FLAG_KINDS.includes(kind as FaultKind)) {
    throw new Error(`--fault ${JSON.stringify(value)}: one of ${FAULT_FLAG_KINDS.join(", ")}`);
  }
  const named: FaultKind = kind as FaultKind;

  if (named === "handover") {
    // All three optional: `--fault handover` is a pencil from the first beat to
    // the last, at the shipped period.
    const [at, held, every] = rest === "" ? [] : numbers(rest, ["at", "beats", "every"], named);
    return {
      malfunction: {
        kind: named,
        at: at ?? 0,
        beats: held ?? TO_THE_END,
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
      malfunction: { kind: named, color: color as FaultColor, at: 0, beats: TO_THE_END },
      ...(every === undefined ? {} : { everyBeats: beats(every, "every") }),
    };
  }

  if (named === "flip") {
    // The seat is required and not defaulted, for the colour's reason one kind
    // up: which screen is turned is the whole of what this fault says, and a
    // picture of the other one is a picture of a different wave.
    const [which, at, held] = rest.split(",").map((p) => p.trim());
    if (which !== "1" && which !== "2") {
      throw new Error("--fault flip:<1|2>[,<at>,<beats>] — whose screen is turned, 1 or 2");
    }
    return {
      malfunction: {
        kind: named,
        seat: which === "2" ? 2 : 1,
        at: at === undefined ? 0 : beats(at, "at"),
        beats: held === undefined ? TO_THE_END : beats(held, "beats"),
      },
    };
  }

  if (named === "shield") {
    return {
      malfunction: { kind: named, at: 0, beats: TO_THE_END },
      ...(rest === "" ? {} : { everyBeats: numbers(rest, ["every"], named)[0] }),
    };
  }

  // **Every other kind takes the pencil's own two numbers**, which is what a
  // fault is since 15 September 2026. THE CODEX, THE STEER, THE LEECH, THE
  // LIMPET and THE DARK all mean the same thing by them — enters on this beat, holds for
  // this many — and a flag that refused them would be a flag that could not
  // photograph the one thing a placed fault does that a whole-wave one could
  // not: start in the middle and stop.
  const [at, held] = rest === "" ? [] : numbers(rest, ["at", "beats"], named);
  return { malfunction: { kind: named, at: at ?? 0, beats: held ?? TO_THE_END } };
}

/**
 * Put the fault on the world's list, where `startWave` would have left the
 * wave's own.
 *
 * **Before the opening lets go**, because the opening reads it: a handover's
 * countdown is drawn over the field from the first beat, and a fault installed
 * after the briefing would be a wave that acquired one halfway through its own.
 *
 * It **replaces** whatever the wave placed rather than adding to it. Two
 * pencils at once is a legal wave (`sim/fault-placed.ts`) and it is not what
 * `--fault` means: the flag exists to photograph a fault on a wave that does
 * not carry one, and a picture with the wave's own fault still running under it
 * is a picture of something nobody asked for.
 */
export async function installFault(page: Page, fault: FaultSpec): Promise<void> {
  await page.evaluate((one) => {
    const ns = window.neonSpore;
    if (!ns) throw new Error("window.neonSpore missing before a fault");
    if (!Array.isArray(ns.world.faults)) {
      throw new Error(
        "this build has no world.faults — --fault needs a commit at or after the one that made a " +
          "fault a pencil on the map, and a before/after pair cannot set it on its parent",
      );
    }
    ns.world.faults = [one.malfunction];
    if (one.everyBeats !== undefined) {
      if (!ns.world.cfg) {
        throw new Error("this build has no world.cfg — --fault cannot name a period on it");
      }
      ns.world.cfg.malfunctionEveryBeats = one.everyBeats;
    }
  }, fault);
}
