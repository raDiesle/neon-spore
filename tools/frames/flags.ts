import { parseAt } from "./crop.js";
import { parseHoldFlag } from "./hold.js";
import { parseOpening } from "./opening.js";
import { parsePress } from "./press.js";
import type { FrameSpec, HoldSpec, PressSpec } from "./spec.js";
import { resolveWaveFlag, type WaveName } from "./wave.js";

/**
 * **Every `--hold` on the command line, not the first one.**
 *
 * `run.ts` read this flag with `argv.indexOf("--hold")` and took the one value
 * after it, so a second `--hold` was silently ignored — and THE BALLOON is a
 * creature whose whole gesture is *two hands at once*, the skin giving only
 * while both sides are taut on the same body (`sim/balloon-pull.ts`). Neither
 * the stretched-both-ways skin nor the split it causes could be photographed,
 * and the lane that gave that body a new skin had to argue half of it in
 * words. So the flag repeats, in argument order, and the command lists
 * `parseHoldFlag` returns are concatenated.
 *
 * A value carrying `@TICK` is a hold that joins the **press** line rather than
 * the one that runs after the wave's ticks, so the two come back separated:
 * `hold` is what `capture.ts` presses at the end with `holdTicks` to show in,
 * and `pressed` is what belongs on the sorted tick line beside `--press`.
 */
export function collectHolds(argv: readonly string[]): {
  hold?: HoldSpec[];
  pressed: PressSpec[];
} {
  const values = argv.flatMap((a, i) => (a === "--hold" ? [argv[i + 1] ?? ""] : []));
  const hold: HoldSpec[] = [];
  const pressed: PressSpec[] = [];
  for (const value of values) {
    const parsed = parseHoldFlag(value);
    for (const one of parsed.commands) {
      if (parsed.tick === undefined) hold.push(one);
      else pressed.push({ ...one, tick: parsed.tick });
    }
  }
  return { hold: hold.length > 0 ? hold : undefined, pressed };
}

/**
 * The one tick line a capture walks: the presses and the ticked holds, in the
 * order they are heard.
 *
 * Sorted here rather than in `parsePress`, because a hold and a press written
 * on the same tick have an order that matters — the hand goes on before the
 * shot is fired, which is the order they are concatenated in — and
 * `Array.prototype.sort` keeps it.
 */
export function tickLine(press: readonly PressSpec[], held: readonly PressSpec[]): PressSpec[] {
  if (press.length === 0 && held.length === 0) return [];
  return [...held, ...press].sort((a, b) => a.tick - b.tick);
}

/**
 * **The whole argument vector, read once and validated once.**
 *
 * `run.ts` used to do this inline and stood on the 250-line ceiling exactly,
 * so the next flag anybody added failed `limits.test.ts` before it did
 * anything. The seam is the one this file was already cut along: everything
 * here turns strings into a `FrameSpec`, and none of it opens a browser, a
 * worktree or a preview. What is left next door is the usage block, the wave
 * *list* — which belongs to the commit being photographed rather than to a
 * flag — and the capture itself.
 *
 * `waves` is that list, and it is the one thing this cannot read off `argv`:
 * `--wave "THE SHELL"` is one index in the tree that named it and another in
 * the next (`wave.ts`). The raw value comes back beside the spec, so a caller
 * can echo what was typed next to what it resolved to.
 */
export function parseFrameSpec(
  argv: readonly string[],
  waves: readonly WaveName[],
): { spec: FrameSpec; waveValue: string } {
  const flag = (name: string, fallback: number): number => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : Number(argv[i + 1]);
  };
  // `undefined` is "the flag is not there"; an empty string is "the flag is
  // there with nothing after it", which every parser below already refuses by
  // name. Collapsing the two would turn `--opening` at the end of a line into
  // a picture of the field — an honest-looking answer to a question nobody
  // asked.
  const after = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? undefined : (argv[i + 1] ?? "");
  };

  const seat = after("seat");
  if (seat !== undefined && seat !== "p1" && seat !== "p2" && seat !== "test") {
    throw new Error(`--seat ${seat}: one of p1, p2 or test`);
  }

  // Every `--hold`, not the first: two hands on one body is a gesture this
  // field has (`collectHolds` above). A value carrying `@TICK` comes back as a
  // press instead, so the wheel can be turned before the shot rather than
  // after it.
  const { hold, pressed } = collectHolds(argv);
  const pressValue = after("press");
  const line = tickLine(pressValue === undefined ? [] : parsePress(pressValue), pressed);
  const press = line.length > 0 ? line : undefined;

  const atValue = after("at");
  const waveValue = after("wave") ?? "";
  if (!waveValue) {
    throw new Error(
      '--wave is required: --wave N (the number the HUD prints) or --wave "NAME". A frame of ' +
        "the wrong wave proves nothing, so this tool will not pick one for you.",
    );
  }

  const spec: FrameSpec = {
    wave: resolveWaveFlag(waveValue, waves),
    ticks: flag("ticks", 120),
    frames: flag("frames", 1),
    // On the guide these two are painted frames rather than ticks, and a
    // rehearsal at 60Hz wants a wider step than a wave does — but the default
    // stays one number, because a caller who wants a strip is already writing
    // `--frames` and `--stride` next to each other.
    strideTicks: flag("stride", 4),
    seat,
    raster: argv.includes("--raster"),
    hold,
    holdTicks: flag("hold-ticks", 30),
    // Zero by default, which is what every capture before this flag existed
    // did: one painted frame per photograph, and nothing that lives in painted
    // seconds ever moving.
    settle: flag("settle", 0),
    at: atValue === undefined ? undefined : parseAt(atValue),
    zoom: flag("zoom", 1),
    // Undefined rather than 0, so a wave whose boss has no rounds is only
    // refused when somebody actually asked for one.
    ...(argv.includes("--boss-round") ? { bossRound: flag("boss-round", 0) } : {}),
    press,
    opening: parseOpening(after("opening")),
    // Undefined rather than 0, so `--opening guide` on a film of one page is
    // not refused for a flag nobody wrote.
    ...(argv.includes("--guide-page") ? { guidePage: flag("guide-page", 0) } : {}),
  };

  // A press past the picture is a press nobody ever sees, and silently
  // clamping it would produce a frame that looks like the shot missed.
  const late = (press ?? []).find((one) => one.tick > spec.ticks);
  if (late) {
    throw new Error(
      `--press: a press at tick ${late.tick} is after --ticks ${spec.ticks}, so the picture is ` +
        "taken before it lands. Raise --ticks, or move the press earlier",
    );
  }

  return { spec, waveValue };
}
