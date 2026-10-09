import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { clearFrames } from "./frame-files.js";
import { scratchDir } from "./scratch.js";

/**
 * **A run's frames reach its output folder only once every one is taken.**
 *
 * `frames . --wave "THE BLISTER" --entry 7:gesture=hold` was refused in the
 * page (`this wave has 2 arrivals`) after `docs/frames/working` had been
 * emptied — `captureFrames` clears its prefix before it opens a tab — so the
 * frame the run before it wrote was gone, and a crop of it failed (8 October
 * 2026). Every page-side refusal (`--entry`, `--boss`, `--creature`,
 * `--boss-round`) has that order, and so does any capture that throws.
 *
 * So a capture writes into a scratch folder of its own, and only what it
 * hands back is put in `out`: each named prefix's old frames cleared first
 * (`clearFrames`, so a ten-frame run's `-08` and `-09` do not stand under an
 * eight-frame one), then the new ones copied over. A capture that throws or
 * answers `null` — the pair's `identical:` — leaves `out` as it found it, and
 * the scratch folder goes either way.
 */
export async function throughScratch<T extends { paths: readonly string[] }>(
  out: string,
  prefixes: readonly string[],
  capture: (scratch: string) => Promise<T | null>,
): Promise<{ got: T; written: string[] } | null> {
  const scratch = await scratchDir("out-");
  try {
    const got = await capture(scratch);
    if (got === null) return null;
    await mkdir(out, { recursive: true });
    for (const prefix of prefixes) await clearFrames(join(out, prefix));
    const written: string[] = [];
    for (const p of got.paths) {
      const dest = join(out, relative(scratch, p));
      await mkdir(dirname(dest), { recursive: true });
      await copyFile(p, dest);
      written.push(dest);
    }
    return { got, written };
  } finally {
    await rm(scratch, { recursive: true, force: true }).catch(() => {});
  }
}
