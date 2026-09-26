import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

/**
 * What a baked sprite costs the game's bundle — the only bytes it ships, since
 * the picture is painted at load (`packages/render/src/sprite-bake.ts`).
 * `bun run sprite` prints it; `test/sprite-bytes.test.ts` holds every sprite
 * under `SPRITE_BYTES_CEILING`.
 */

/** Per sprite: the shipped drawing's module and export, and the baked one's. */
export const BYTES: Record<string, { shipped: [string, string]; baked: [string, string] }> = {
  "instar-egg": {
    shipped: ["instar-eggs.ts", "drawEgg"],
    baked: ["instar-egg-baked.ts", "drawBakedEgg"],
  },
  "instar-nest": {
    shipped: ["instar-eggs.ts", "drawNests"],
    baked: ["instar-nest-baked.ts", "drawBakedNests"],
  },
  "instar-hide": {
    shipped: ["instar-hide.ts", "drawScales"],
    baked: ["instar-hide-baked.ts", "drawBakedScales"],
  },
  "instar-moult": {
    shipped: ["instar-moult.ts", "drawMoult"],
    baked: ["instar-moult-baked.ts", "drawBakedPale"],
  },
  "instar-seam": {
    shipped: ["instar-profile.ts", "drawProfile"],
    baked: ["instar-seam-baked.ts", "drawBakedSeam"],
  },
  "instar-wing": {
    shipped: ["instar-wings.ts", "drawWing"],
    baked: ["instar-wing-baked.ts", "drawBakedMembrane"],
  },
};

/**
 * The most a sprite may add, gzipped, beside the drawing it is offered
 * against. Past it, the detail is better shipped as a picture
 * (`docs/raster.md`) or the sprite split in two.
 */
export const SPRITE_BYTES_CEILING = 3072;

const src = resolve(import.meta.dir, "../../../packages/render/src");

/** Minified and gzipped bytes of a bundle that uses `uses`, render's own imports included. */
async function weigh(dir: string, uses: [string, string][]): Promise<[number, number]> {
  const entry = join(dir, `e${uses.length}.ts`);
  const lines = uses.map(
    ([file, name], i) => `import { ${name} as u${i} } from "${join(src, file)}";`,
  );
  await Bun.write(
    entry,
    `${lines.join("\n")}\n(globalThis as any).__u = [${uses.map((_, i) => `u${i}`).join(", ")}];\n`,
  );
  const built = await Bun.build({ entrypoints: [entry], target: "browser", minify: true });
  if (!built.success) throw new Error(built.logs.join("\n"));
  const text = await (built.outputs[0] as Blob).text();
  return [text.length, Bun.gzipSync(text).length];
}

/** What sprite `name` adds beside its shipped drawing: [minified, gzipped] bytes. */
export async function spriteBytes(name: string): Promise<[number, number]> {
  const pair = BYTES[name];
  if (!pair) throw new Error(`no BYTES row for ${name}`);
  const dir = await mkdtemp(join(tmpdir(), "sprite-"));
  try {
    const [minS, gzS] = await weigh(dir, [pair.shipped]);
    const [minB, gzB] = await weigh(dir, [pair.shipped, pair.baked]);
    return [minB - minS, gzB - gzS];
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
