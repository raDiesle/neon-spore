import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { captureFrames } from "../capture.js";

/**
 * The gap this landing closes: `bun run check` stayed green the whole time
 * the opening replaced `world.brief.due`, because nothing here ever drove
 * `captureFrames` against a real page — `capture.test.ts` covers only
 * `pickChrome`, which never touches a browser. This does, against the actual
 * built game, the same way `bun run frames` does, and it fails the way the
 * real bug failed: `captureFrames` throwing instead of a picture landing.
 *
 * It builds and serves *this* checkout (`preview:once`, an OS-assigned port,
 * torn down in `afterAll`) rather than a scratch worktree of some commit —
 * `run.ts` already proves the worktree machinery works, and rebuilding one
 * per test run would be the slow, indirect way to ask a much smaller
 * question: does the handle `capture.ts` drives still exist and still let a
 * wave's opening go?
 */
describe("captureFrames past a wave's opening", () => {
  let baseUrl: string;
  let stop: () => void;
  let scratchOut: string;

  beforeAll(async () => {
    const proc = Bun.spawn(["bun", "run", "--cwd", "apps/game", "preview:once"], {
      cwd: join(import.meta.dir, "../../.."),
      env: { ...process.env, PREVIEW_HOST: "127.0.0.1" },
      stdout: "pipe",
      stderr: "pipe",
    });
    const reader = proc.stdout.getReader();
    const decoder = new TextDecoder();
    let buffered = "";
    const deadline = Date.now() + 30_000;
    let url: string | null = null;
    while (!url) {
      if (Date.now() > deadline) throw new Error("preview:once never printed its port");
      const { value, done } = await reader.read();
      if (done) throw new Error("preview:once exited before printing its port");
      buffered += decoder.decode(value, { stream: true });
      const found = buffered.match(/preview \(built\) on (http:\/\/[^\s]+)/);
      if (found?.[1]) url = found[1];
    }
    reader.releaseLock();
    baseUrl = url;
    stop = () => proc.kill();
    scratchOut = await mkdtemp(join(tmpdir(), "neon-spore-frames-opening-test-"));
  }, 40_000);

  afterAll(async () => {
    stop?.();
    if (scratchOut) await rm(scratchOut, { recursive: true, force: true }).catch(() => {});
  });

  it("gets past the wave's own opening and writes a picture of the field", async () => {
    const { paths } = await captureFrames(
      baseUrl,
      { wave: 0, ticks: 60 },
      join(scratchOut, "still"),
    );
    expect(paths).toHaveLength(1);
    expect(await Bun.file(paths[0] as string).exists()).toBe(true);
  }, 30_000);

  /**
   * And the other direction, which is what `--opening` added: the two screens
   * a wave puts in front of a player were the one part of the game this tool
   * could not photograph, because `clearOpening` ran through both of them on
   * the way to every picture it ever took.
   *
   * Both of these stop somewhere the field is *held*, so what they prove is
   * that the stop happened at all — a capture that quietly ran on would come
   * back with a picture, and it would be a picture of the field.
   */
  it("stands on the introduction instead of running past it", async () => {
    const { paths } = await captureFrames(
      baseUrl,
      { wave: 0, ticks: 30, opening: "intro" },
      join(scratchOut, "intro"),
    );
    expect(paths).toHaveLength(1);
    expect(await Bun.file(paths[0] as string).exists()).toBe(true);
  }, 30_000);

  it("stands on the guide, and a strip of it counts painted frames", async () => {
    // Wave 1 carries a guide (`packages/content/src/waves/act-1.ts`), and its
    // rehearsal is drawn rather than stepped — so the strip below is four
    // paints apart on the frame clock, not four ticks apart on the world's.
    const { paths } = await captureFrames(
      baseUrl,
      { wave: 0, ticks: 6, frames: 3, strideTicks: 4, opening: "guide" },
      join(scratchOut, "guide"),
    );
    expect(paths).toHaveLength(3);
    for (const path of paths) expect(await Bun.file(path).exists()).toBe(true);
  }, 30_000);

  it("refuses a guide the wave has not got, rather than photographing the field", async () => {
    // ALTERNATING teaches nothing new, so it carries no guide: its
    // introduction passes straight onto the field and there is no second
    // screen to stand on.
    await expect(
      captureFrames(baseUrl, { wave: 2, ticks: 6, opening: "guide" }, join(scratchOut, "none")),
    ).rejects.toThrow("carries no guide");
  }, 30_000);
});
