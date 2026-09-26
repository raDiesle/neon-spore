import { WAVES } from "@neon-spore/content";
import { parseAt } from "./crop.js";
import type { Reach } from "./shot-state.js";
import { usage } from "./shot-usage.js";
import { resolveWaveFlag } from "./wave.js";

/**
 * READING `bun run shot`'s COMMAND LINE — every flag it takes, and the
 * argument for each one beside where it is read.
 *
 * Its own file for the reason `shot-state.ts` was: `shot.ts` sits on the
 * 250-line ceiling and each flag costs a dozen lines of *why*, so the next one
 * has nowhere to go. That seam was reaching a state; this one is the one left
 * — reading what was asked for, which needs no browser, versus taking the
 * picture, which is nothing but one. `--serve` was the flag that found it.
 *
 * Each argument stays with its flag rather than moving to `shot-usage.ts`,
 * which is only the list: the reasons here are what stops a flag being added
 * twice under two names, and they are read by whoever is about to add one.
 */

/** What one invocation asked for: the element, the file, and every flag. */
export interface ShotFlags {
  /** The element to photograph, and the PNG to write. */
  selector: string;
  out: string;
  /** The presses, fills and holds that get the page into the state — `shot-state.ts`. */
  reach: Reach;
  /** Milliseconds to settle before the shot, for an animation. */
  settle: number;
  /** Something on the page that says it is ready, waited for before the settle. */
  until: string | undefined;
  /** Start a director of this tree's own rather than using `port`. */
  serve: boolean;
  port: string;
  /** What that port is asked for — the game keeps its field behind `?play=1`. */
  path: string;
  viewport: { width: number; height: number };
  /** The device scale factor, which with `at` is the crop's magnification. */
  scale: number;
  /** A rectangle inside the element, in its own CSS pixels, or null for all of it. */
  at: ReturnType<typeof parseAt> | null;
}

export function readShotFlags(argv: readonly string[]): ShotFlags {
  const args = [...argv];
  const flag = (name: string): string | undefined => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  const positional = args.filter((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  const [selector, out] = positional;

  if (!selector || !out) usage();

  const tab = flag("tab");
  /**
   * A tab *inside* the sheet `--open` just opened. `--tab` presses NOT BUILT
   * YET's own strip and nothing else, so every other sheet's rooms —
   * DOCUMENTATION's four, and the three inside CONTROLS — were unreachable and
   * each wanted a hand-rolled Playwright script again. That is the friction
   * `shot.ts` was written to stop, so it is a flag.
   */
  const inner = flag("inner");
  // A state only a held key reveals cannot be photographed by pressing buttons:
  // the palette says what Ctrl-click would do only while Ctrl is down
  // (`tools/director/src/palette.ts`). One flag rather than a second script.
  const hold = flag("hold");
  /**
   * A CSS selector pressed before the shot. `--open`, `--tab` and `--inner`
   * reach a sheet by the label on its button, and nothing reached a panel that
   * only exists once something on the *map* is selected: the rows under a cell
   * are built from the arrival in it, so THE FENCE's GAPS and CRACKS chips
   * could not be photographed at all. That is the friction this file was
   * written to end, said again about a different panel, so it is a flag rather
   * than a fifth throwaway script.
   *
   * A selector and not a label, because a cell carries a picture rather than a
   * word — `.cell:nth-of-type(4)` is the only handle a map square has.
   */
  const click = flag("click");
  /**
   * Which of the matches `--click` presses, counting from 1. A map is a grid of
   * identical squares and the only thing that tells two of them apart is their
   * order, so a selector alone reaches the first fence on a wave and no other.
   * Default 1, which is what a selector on its own has always meant.
   */
  const nth = Number(flag("nth") ?? 1);
  const open = flag("open");
  const settle = Number(flag("wait") ?? 2500);
  /**
   * `--until <selector>`: wait for something on the page to *say* it is ready
   * before the timed settle starts. A page that reaches its state on its own
   * clock — a VERSUS pair running tick by tick to a `--freeze` — cannot be
   * waited for by guessing a number of milliseconds; the guess was short every
   * time the page had more to do first, and the picture was of the wrong
   * moment with nothing to say so.
   */
  const until = flag("until");
  /**
   * `--serve`: start a director of this tree's own, use its port, and stop it
   * again — for a caller who has no way to leave one running.
   *
   * That is every session in a sandbox: CLAUDE.md forbids starting a server with
   * a backgrounded shell command, and `.claude/launch.json` is a person at a desk
   * pressing a button. Without this, a lane that changed the director — which is
   * where every look is decided — could not photograph its own work, and wrote a
   * throwaway that spawned `dev:once` instead. `versus-shot.ts` held the only
   * copy of that spawn for months; it is `director-serve.ts` now, and both use
   * it. It costs a build and a startup, so `--port` stays the way to point at a
   * director that is already up.
   */
  const serve = args.includes("--serve");
  const port = flag("port") ?? "4174";
  /**
   * The viewport. The director is a desk tool and 1240x900 is what it is judged
   * at, but `--port` already points this at anything the tree serves — and the
   * game is a portrait phone. A picture of a phone screen taken 1240 px wide is
   * a picture of a layout nobody will ever see.
   */
  const [vw, vh] = (flag("size") ?? "1240x900").split("x").map(Number);
  /**
   * What to ask that port for. The director is one page and has always been the
   * bare origin, but `--port` points this at anything the tree serves — and the
   * game keeps its field behind `?play=1`, so a shot of it without this is a
   * picture of the main menu.
   */
  const path = wavePath(flag("wave"), flag("path"));
  /**
   * `--at x,y,w,h`, a rectangle inside the element, in its own CSS pixels.
   *
   * The element is the unit this tool photographs, and some of them are not the
   * size of the thing being judged: the map's `#grid` is twenty-five beats tall
   * and a change to what one *cell* draws arrives as a stamp somewhere in four
   * thousand pixels of empty board. `bun run frames` has had this flag since the
   * eyelid lane could not see its own work; the same argument applies here, and
   * the parser is `crop.ts`'s rather than a second copy of it.
   */
  const at = flag("at") === undefined ? null : parseAt(flag("at") as string);
  /**
   * `--type "#waveFilter=boss"`, a field to fill before the shot.
   *
   * A page that only *has* a state once somebody has typed into it cannot be
   * photographed by pressing buttons — the wave list under a filter
   * (`tools/director/src/rail-filter.ts`) is the first, and it is the same
   * argument `--hold` already makes about a state only a held key reveals.
   * `fill` rather than `press`, because what the page listens for is `input`.
   */
  const typed = flag("type");
  /**
   * `--select ".versus-rate=0.25"`, a picker to turn before the shot.
   *
   * `--type` is `locator.fill` and throws on a `<select>`, so a state that only a
   * dropdown reaches was out of reach entirely. VERSUS's own rate picker is the
   * one that paid for this: at 0.25× a thrust that burns for one beat of a
   * two-second replay stretches past the whole window, so every frame carries it
   * — and finding one frame that did had cost about thirty-five shots ranked by
   * PNG file size.
   */
  const select = flag("select");
  /**
   * `--scale 6`, the device scale factor, default 2.
   *
   * `--at` clips a rectangle out of the frame and the magnification is only
   * ever this number — so a crop the size of a creature came back as a body
   * ninety pixels wide, which is not a picture a session can correct a look
   * from. The ghost interior lane took five shots at 2x before finding that the
   * flag it wanted did not exist. A creature is judged at 26 px on a phone and
   * at six times that on a desk, and both are the same frame at a different
   * scale factor; the browser paints it, and nothing is stretched.
   */
  const scale = Number(flag("scale") ?? 2);

  return {
    selector: selector as string,
    out: out as string,
    reach: { open, tab, inner, click, nth, type: typed, select, hold },
    settle,
    until,
    serve,
    port,
    path,
    viewport: { width: vw || 1240, height: vh || 900 },
    scale,
    at,
  };
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
