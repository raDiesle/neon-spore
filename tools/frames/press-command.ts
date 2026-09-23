import { SNAKE_TURNS } from "@neon-spore/sim";
import { PICKS } from "./press.js";

/**
 * What one `--press` actually sends, once the line has been taken apart.
 *
 * Split out of `press.ts` when PINBALL's two verbs took that file past its
 * 250-line limit, along the seam it already had: next door is the *command
 * line* — which controls exist, whose seat each is, and how a comma-separated
 * run of them is read — and this is the one function that turns a control and
 * its value into the command the simulation hears. The two tables that only
 * this function reads came with it.
 */

/** The four lanes THE PULSE's arrows come down, as the words a person says —
 * which are the lane names themselves, so this is a guard rather than a map. */
const PULSE_LANES_BY_WORD = new Set(["left", "down", "up", "right"]);

/** Which way an `aim` steps, as the four words a person would say. */
const AIM_STEPS: Record<string, { dcol: -1 | 0 | 1; drow: -1 | 0 | 1 }> = {
  left: { dcol: -1, drow: 0 },
  right: { dcol: 1, drow: 0 },
  up: { dcol: 0, drow: -1 },
  down: { dcol: 0, drow: 1 },
};

/**
 * **The two words a grip or a tap may name instead of a number.**
 *
 * An id is dealt by `world.nextId` as bodies arrive, and a caller outside the
 * page cannot know what it has reached: a jumped-to wave starts counting from
 * wherever the run before it left off, so `grip=1` was a guess and usually the
 * wrong one. It cost a lane the one picture that would have shown THE MAGNET
 * being killed, and the guess is silent — a grip on a body that is not there is
 * dropped rather than refused (`sim/grip.ts`).
 *
 * So the choice is made where the field can be seen. `first` is the body that
 * arrived earliest and `lowest` is the one nearest the hull, which is the one a
 * pair would actually reach for and the one a photograph usually wants.
 * `capture.ts` reads `world.creatures` in the page and fills the id in.
 */

export function commandFor(
  kind: string,
  argument: string | undefined,
  one: string,
  whole: string,
): { kind: string } & Record<string, unknown> {
  const needs = (): string => {
    if (argument === undefined) {
      throw new Error(`--press ${whole}: "${one}" — ${kind} takes a value, as ${kind}=…`);
    }
    return argument;
  };
  const column = (): number => {
    const col = Number(needs());
    if (!Number.isInteger(col) || col < 0) {
      throw new Error(`--press ${whole}: "${one}" — a column is a whole number, from 0`);
    }
    return col;
  };

  switch (kind) {
    case "cannonCol":
      return { kind, col: column() };
    case "shieldCol":
      return { kind, col: column() };
    case "fire": {
      const color = needs();
      if (color !== "red" && color !== "cyan") {
        throw new Error(`--press ${whole}: "${one}" — a shot is red or cyan`);
      }
      return { kind, color };
    }
    case "grip":
    case "tap": {
      const id = Number(needs());
      if (!Number.isInteger(id)) {
        throw new Error(
          `--press ${whole}: "${one}" — ${kind} takes a creature's id, or ` +
            `${Object.keys(PICKS).join(" or ")} to have the page choose one`,
        );
      }
      return { kind, id };
    }
    case "prime": {
      const color = needs();
      if (color !== "red" && color !== "cyan") {
        throw new Error(`--press ${whole}: "${one}" — a thumb is on red or on cyan`);
      }
      return { kind, on: true, color };
    }
    case "aim": {
      const step = AIM_STEPS[needs()];
      if (!step) {
        throw new Error(
          `--press ${whole}: "${one}" — the sights step ${Object.keys(AIM_STEPS).join(", ")}`,
        );
      }
      return { kind, ...step };
    }
    case "pulseStep": {
      const lane = needs();
      if (!PULSE_LANES_BY_WORD.has(lane)) {
        throw new Error(`--press ${whole}: "${one}" — a lane is left, down, up or right`);
      }
      return { kind, lane };
    }
    case "valve": {
      // THE GAUGE's two buttons are one command with a direction, held until
      // a second press lets go of it (`sim/command-round.ts`).
      const way = needs();
      if (way === "off") return { kind, on: false, dir: 1 };
      if (way !== "left" && way !== "right") {
        throw new Error(`--press ${whole}: "${one}" — a valve turns left or right, or goes off`);
      }
      return { kind, on: true, dir: way === "left" ? -1 : 1 };
    }
    case "snakeTurn": {
      // SNAKE's steering, the navigator's: a quarter turn from wherever the
      // body is already going, never a heading (`sim/command-round.ts`).
      const dir = SNAKE_TURNS.find((d) => d === needs());
      if (!dir) {
        throw new Error(`--press ${whole}: "${one}" — a snake turns ${SNAKE_TURNS.join(" or ")}`);
      }
      return { kind, dir };
    }
    case "mawTake":
      // The same command the ship's own maw sends; only the seat differs, and
      // the seat is on the press already (`content/src/control-command.ts`).
      if (argument !== undefined) {
        throw new Error(`--press ${whole}: "${one}" — ${kind} takes no value`);
      }
      return { kind: "intake" };
    default: {
      // `guard`, `intake`, `salvo`, `reach`, `latch`, `launch`, SNAKE's two
      // and THE SCOUT's `scoutMaw`: a press with nothing to say about itself.
      // Her tap is a moment rather than a hold — the mouth stands open for
      // `scoutMawTicks` by itself — which is why the pilot's three are next
      // door in `scout-press.ts` and this one is here.
      if (argument !== undefined) {
        throw new Error(`--press ${whole}: "${one}" — ${kind} takes no value`);
      }
      return { kind };
    }
  }
}
