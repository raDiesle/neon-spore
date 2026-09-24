import { bossSpec, parseBoss, parseBossJson, parseCreature } from "./boss.js";
import { parseAt } from "./crop.js";
import { parseFault } from "./fault.js";
import { parseHand } from "./hand.js";
import { parseHoldFlag } from "./hold.js";
import { parseOpening } from "./opening.js";
import { parsePress } from "./press.js";
import type { FrameSpec, HoldSpec, PressSpec } from "./spec.js";
import { DEFAULT_UNTIL_TICKS, parseUntil } from "./until-flags.js";
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
 * **Every `--press` on the command line, not the first one**, for the reason
 * above and found the same way.
 *
 * This flag was read with one `after("press")`, so a capture written as
 * `--press 300:1:cannonCol=5 --press 320:2:fire=red` ran with one of the two
 * and dropped the other without a word. The lane that drew THE HUSK lost two
 * captures and a read through `press-command.ts` to it, looking for a verb
 * that was never wrong: what came back was a wave playing itself, which is
 * exactly what a capture of a wave nobody pressed anything into looks like.
 *
 * Two flags is the natural way to write a line of gestures — it is how
 * `--hold` is written, one neighbour along — and the comma form goes on
 * working unchanged, because `parsePress` splits on commas and every value is
 * put through it. They are concatenated and `tickLine` sorts the lot, so the
 * order the flags are typed in never has to be the order they are sent.
 */
export function collectPresses(argv: readonly string[], wave: number): PressSpec[] {
  // `argv[i + 1] ?? ""` rather than a skip: `--press` at the end of the line
  // is a flag with nothing after it, and `parsePress` refuses an empty value
  // by name. A silent skip there would be this file's own bug again.
  return argv.flatMap((a, i) => (a === "--press" ? parsePress(argv[i + 1] ?? "", wave) : []));
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

  // The wave is read before the presses and not after, because a press is
  // checked against the panel *this* wave is played on: whose thumb a maw is
  // under is a fact about the set, not about the command (`press.ts`).
  const waveValue = after("wave") ?? "";
  if (!waveValue) {
    throw new Error(
      '--wave is required: --wave N (the number the HUD prints) or --wave "NAME". A frame of ' +
        "the wrong wave proves nothing, so this tool will not pick one for you.",
    );
  }
  const wave = resolveWaveFlag(waveValue, waves);

  // Every `--hold`, not the first: two hands on one body is a gesture this
  // field has (`collectHolds` above). A value carrying `@TICK` comes back as a
  // press instead, so the wheel can be turned before the shot rather than
  // after it.
  const { hold, pressed } = collectHolds(argv);
  // And every `--press`, for the same reason and found the same way
  // (`collectPresses` above).
  const line = tickLine(collectPresses(argv, wave), pressed);
  const press = line.length > 0 ? line : undefined;

  // This phone's own finger on the ship, which no command can put there
  // (`hand.ts`). The muzzle is checked against the seat here, where both
  // flags are in hand.
  const handValue = after("hand");
  const hand = handValue === undefined ? undefined : parseHand(handValue, seat);
  if (hand === undefined && argv.includes("--hand-over")) {
    throw new Error("--hand-over says how the hand rests; it needs --hand to say where");
  }

  const atValue = after("at");
  // A phone other than 390x844, for what only a short or a narrow one shows —
  // the side bars a short screen stood the hull between had no picture (`page.ts`).
  const size = after("size");
  const [vw, vh] = (size ?? "").split("x").map(Number);
  if (size !== undefined && !(vw! > 0 && vh! > 0))
    throw new Error(`--size ${size}: WxH, e.g. 390x660`);

  // What ends the first run: a number, or something happening. `--ticks` is
  // read for whether it was *written* and not only for its value, because the
  // two flags disagree about where the picture is and a default cannot be told
  // from a choice (`until.ts`).
  const until = parseUntil(after("until"), flag("until-ticks", DEFAULT_UNTIL_TICKS), {
    ticks: argv.includes("--ticks"),
    opening: parseOpening(after("opening")),
    // Raw, so `--until-back` written without `--until` is refused by name
    // rather than quietly doing nothing (`until.ts`).
    back: after("until-back"),
    on: after("until-on"),
  });

  const spec: FrameSpec = {
    wave,
    ticks: flag("ticks", 120),
    until,
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
    hand,
    ...(argv.includes("--hand-over") ? { handOver: true } : {}),
    // Zero by default, which is what every capture before this flag existed
    // did: one painted frame per photograph, and nothing that lives in painted
    // seconds ever moving.
    settle: flag("settle", 0),
    at: atValue === undefined ? undefined : parseAt(atValue),
    zoom: flag("zoom", 1),
    ...(size === undefined ? {} : { viewport: { width: vw!, height: vh! } }),
    // Undefined rather than 0, so a wave whose boss has no rounds is only
    // refused when somebody actually asked for one.
    ...(argv.includes("--boss-round") ? { bossRound: flag("boss-round", 0) } : {}),
    press,
    opening: parseOpening(after("opening")),
    // A fault the wave need not carry, written on the world where `startWave`
    // would have left it. Undefined is every capture this tool has ever taken:
    // the wave's own fault, or none (`fault.ts`).
    fault: parseFault(after("fault")),
    // And the boss's own fields, for the same reason one flag up: a state a
    // run of correct presses deep is a state nobody could photograph twice
    // (`boss.ts`). Three flags, one list: `--boss` writes scalars, `--boss-json`
    // writes a list or a shape whole, and `--creature` writes the body the boss
    // is drawn as — half of BULB QUEEN's fight is in her petals and not in her
    // state, so the two land together or not at all.
    boss: bossSpec(
      parseBoss(after("boss")),
      parseBossJson(after("boss-json")),
      parseCreature(after("creature")),
    ),
    // Undefined rather than 0, so `--opening guide` on a film of one page is
    // not refused for a flag nobody wrote.
    ...(argv.includes("--guide-page") ? { guidePage: flag("guide-page", 0) } : {}),
  };

  // A press past the picture is a press nobody ever sees, and silently
  // clamping it would produce a frame that looks like the shot missed. Under
  // `--until` the picture's tick is not known until the run reaches it, so the
  // line the presses have to fit inside is how far it will look. A strip goes
  // on past `--ticks`, one `--stride` a frame, and a press inside it is heard
  // by the frame it falls in (`pressesByFrame`), so the line is the last frame.
  const strip = ((spec.frames ?? 1) - 1) * (spec.strideTicks ?? 0);
  const end = until ? until.cap : spec.ticks + strip;
  const said =
    strip > 0
      ? `the last frame, tick ${end} (--ticks ${spec.ticks}, then ${(spec.frames ?? 1) - 1} × --stride ${spec.strideTicks})`
      : `--ticks ${spec.ticks}`;
  const late = (press ?? []).find((one) => one.tick > end);
  if (late) {
    throw new Error(
      until
        ? `--press: a press at tick ${late.tick} is past --until-ticks ${end}, so the run stops ` +
            "looking before it lands. Raise --until-ticks, or move the press earlier"
        : `--press: a press at tick ${late.tick} is after ${said}, so the picture is ` +
            "taken before it lands. Raise --ticks, or move the press earlier",
    );
  }

  return { spec, waveValue };
}
