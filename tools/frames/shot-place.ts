import { WAVES } from "@neon-spore/content";
import { type PoseRoute, STATES_PATH } from "./shot-pose.js";
import { controlsPath } from "./shot-row.js";
import { resolveWaveFlag } from "./wave.js";

/**
 * Where `bun run shot` points the browser: `--pose`, `--controls`, `--wave`
 * or `--path`, of which one may be said. Out of `shot-flags.ts` when `--pose`
 * took that file over its ceiling; every other flag there is read, and these
 * four are the ones that are resolved.
 */

/** The path the port is asked for, from whichever flag named a place. */
export function pathFor(
  pose: PoseRoute | undefined,
  flag: (name: string) => string | undefined,
  args: readonly string[],
): string {
  if (pose) return alone("--pose opens DOCUMENTATION › STATES", STATES_PATH, args);
  return placePath(flag("controls"), flag("wave"), flag("path"));
}

/**
 * `--wave "THE REPRISE"`, the director opened on that wave, which is its own
 * `?wave=` with the index worked out here (`tools/director/src/place.ts`).
 *
 * The filter route did not reach it: `--type "#waveFilter=REPRISE" --click
 * ".wave-row"` pressed the first row before the rail had re-rendered, and the
 * picture was of wave one with nothing to say so. A name, an id or the HUD's
 * number, read the way `bun run frames --wave` reads it (`wave.ts`), and a
 * name that matches nothing throws rather than opening wave one. With `--path`
 * as well it throws too: the game reads no `?wave=`, so the pair can only mean
 * a place nobody has.
 */
function wavePath(wave: string | undefined, path: string | undefined): string {
  if (wave === undefined) return path ?? "";
  if (path !== undefined) {
    throw new Error("--wave opens the director on a wave, so it takes no --path beside it");
  }
  const byId = WAVES.findIndex((w) => w.id === wave);
  return `/?wave=${byId >= 0 ? byId : resolveWaveFlag(wave, WAVES)}`;
}

/** `--controls "ON THE FIELD"`, a room of DOCUMENTATION › CONTROLS opened by
 * its URL (`shot-row.ts`), else `--wave`, else `--path`; two of them name two
 * places, so the pair throws. */
function placePath(
  controls: string | undefined,
  wave: string | undefined,
  path: string | undefined,
): string {
  if (controls === undefined) return wavePath(wave, path);
  if (wave !== undefined || path !== undefined) {
    throw new Error(
      "--controls opens a room of CONTROLS, so it takes no --wave or --path beside it",
    );
  }
  return controlsPath(controls);
}

/** `path`, when nothing else on the command line names a place: `what` already did. */
function alone(what: string, path: string, args: readonly string[]): string {
  const other = ["--controls", "--wave", "--path", "--row"].filter((f) => args.includes(f));
  if (other.length > 0) throw new Error(`${what}, so it takes no ${other.join(" or ")} beside it`);
  return path;
}
