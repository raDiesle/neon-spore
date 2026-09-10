#!/usr/bin/env bun

/**
 * `bun run versus:shot <slot> <name> [out.png] [--freeze 1.2] [--only candidate]
 * [--rate 0.25] [--zoom 2] [--wait 3000]` — one PNG of one VERSUS candidate.
 *
 * A candidate does not appear in the game by construction, so `bun run frames`
 * cannot reach one and there was no command in this repository that produced a
 * picture of the single page a candidate exists to be looked at on. A session
 * writing one therefore could not see whether its paint drew what it thought:
 * the lane that filed this found a throb whose far half was filled over its own
 * core marks and whose rim glow was clipped at the contour, both obvious in the
 * first frame, both invisible to `bun run check` twice over.
 *
 * The workaround was thirty lines of throwaway Playwright and a `bun add -d
 * playwright` at the root that had to be reverted — the browser this repository
 * already drives lives in `tools/frames/node_modules` as `playwright-core`, and
 * nothing outside this directory can reach it. Which is exactly why this file
 * is here and not at the root.
 *
 * It starts the director on a port nobody else holds, opens the pair, and hands
 * `bun run shot` the query string. `--freeze` is the flag that makes the
 * picture repeatable rather than a sweep of `--wait` values
 * (`tools/director/src/versus-pair-freeze.ts`); `--rate` turns the pair's own
 * picker down, which is the better answer whenever a slow replay would do.
 *
 * This is the step *before* `docs/versus.md`'s "does this read at 26 px", which
 * belongs to the owner and to two real phones. This one only answers: did the
 * session write what it meant to.
 */

import { spawn } from "node:child_process";
import { root, run } from "./exec.js";
import { elementFor } from "./versus-element.js";

const argv = process.argv.slice(2);
const flag = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
const [slot, name, out] = positional;

if (!slot || !name) {
  console.error("usage: bun run versus:shot <slot> <name> [out.png]");
  console.error("       e.g. bun run versus:shot creature:throb globe shot.png --freeze 1.2");
  console.error("       --freeze  stop at this many simulated seconds — a repeatable frame");
  console.error("       --only    candidate | current, one side at true size");
  console.error("       --rate    the pair's own rate, e.g. 0.25 — better than a freeze");
  console.error("            when a slow replay is what shows the thing");
  console.error("       --zoom    the pair's magnifier, e.g. 2");
  console.error("       --wait    milliseconds to settle before the shot — with --freeze,");
  console.error("            counted from the moment the pair reports the freeze landed");
  console.error("       --at      a rectangle inside the picture, x,y,w,h, magnified —");
  console.error("            the window the pose cuts, in its own pixels; P1's, or --only's side");
  console.error("       --element which element to photograph; .versus-row for the whole");
  console.error("            candidate, notes and all. Default .versus-stage, the phones");
  process.exit(1);
}

const file = out ?? `${slot.replace(/[^a-z0-9]+/gi, "-")}-${name}.png`;
const freeze = flag("freeze");
const only = flag("only");
const rate = flag("rate");
const zoom = flag("zoom");
/**
 * How long to let the page settle before the camera fires, *after* it is
 * ready. With `--freeze` the readiness is the pair's own signal — it marks its
 * frames `data-frozen` on the tick the freeze lands (`versus-pair.ts`), and
 * `shot.ts` is told to wait for that — so this is only the moment's settle and
 * not a guess at how long a probe and a tick-by-tick run take. Two guesses
 * were made and both were short. `--wait` still overrides.
 */
const wait = flag("wait") ?? "3000";
/**
 * A rectangle inside the picture, magnified — `shot.ts`'s own `--at`, forwarded.
 *
 * It was not, and a candidate about something a *crater* wide could not be
 * looked at from here at all: the pair is two phones side by side in one
 * screenshot, so a hole in the hull arrives about twenty pixels across. The
 * escape was to take the picture and crop it somewhere else, which is the
 * friction this file exists to have ended (`crop.ts`).
 *
 * *Inside the picture* means the window the pose cuts, not the stage around
 * it — `versus-element.ts` has why the two are not the same thing on a tile
 * pose, and which one `--at` is therefore measured against.
 */
const at = flag("at");
/**
 * Which element of the page the picture is of. The pair of phones by default,
 * which is what a candidate is looked at as — but the page says things
 * *around* them that a session sometimes has to see it say: the LOOK AT line,
 * the patch list, and how much of the frame this candidate moves
 * (`versus-one.ts`). `.versus-row` is the whole candidate. Without this the
 * only way to photograph one was a throwaway copy of this file, which is the
 * friction this file exists to have ended.
 */
const element = elementFor({ element: flag("element"), at });

const query = new URLSearchParams({ slot, name });
if (freeze !== undefined) query.set("freeze", freeze);
if (only !== undefined) query.set("only", only);

/**
 * The director, on a port of the OS's choosing, read off its own startup line.
 *
 * `dev:once` rather than `dev` for the reason `CLAUDE.md` gives about every
 * server here: this must not retire a director somebody is looking at, and it
 * must not answer from one either. The port is read rather than derived —
 * `--pin` settles it and prints it, and it is also written down for
 * `bun run port` while this runs (`tools/running.ts`).
 */
async function startDirector(): Promise<{ port: string; stop: () => void }> {
  const proc = spawn("bun", ["run", "dev:once"], {
    cwd: root,
    env: { ...process.env, DIRECTOR_HOST: "127.0.0.1" },
    stdio: ["ignore", "pipe", "pipe"],
    shell: process.platform === "win32",
  });
  const deadline = Date.now() + 60_000;
  let buffered = "";
  const port = await new Promise<string>((resolve, reject) => {
    const look = (chunk: Buffer): void => {
      buffered += chunk.toString();
      const found = buffered.match(/http:\/\/localhost:(\d+)/);
      if (found?.[1]) resolve(found[1]);
      else if (Date.now() > deadline) reject(new Error("the director never printed its port"));
    };
    proc.stdout?.on("data", look);
    proc.stderr?.on("data", look);
    proc.on("exit", () => reject(new Error(`the director exited:\n${buffered.trim()}`)));
  });
  return { port, stop: () => void proc.kill() };
}

const director = await startDirector();
try {
  const args = [
    "run",
    "shot",
    element,
    file,
    "--port",
    director.port,
    "--path",
    `/versus.html?${query.toString()}`,
    "--wait",
    wait,
  ];
  // Both are turned before the settle, so the wait is spent in the state the
  // picture is of rather than on the way to it.
  if (rate !== undefined) args.push("--select", `.versus-rate=${rate}`);
  // The magnifier is a toggle rather than a picker, so it is pressed. `--zoom 2`
  // and `--zoom` mean the same thing; there is only one step.
  if (zoom !== undefined) args.push("--click", ".versus-zoom");
  if (at !== undefined) args.push("--at", at);
  // The pair says when the freeze has landed; the settle starts from there.
  if (freeze !== undefined) args.push("--until", "[data-frozen]");
  await run(["bun", ...args], root);
  console.log(`wrote ${file} — ${slot} · ${name}`);
} finally {
  director.stop();
}
