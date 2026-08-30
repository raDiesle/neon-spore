import { rm } from "node:fs/promises";
import { buildDateToday } from "../../tools/build-stamp.js";

/**
 * What `bun build ./index.html --outdir=dist --minify --sourcemap` used to be,
 * as a script. The flags are unchanged; the reason for the file is `define` —
 * the build date has to be computed before it can be substituted, and a shell
 * one-liner that computes a date is a different one-liner on every platform.
 *
 * `tools/director/build.ts` is the same shape for the same reason.
 */

const here = new URL("./", import.meta.url);
const distDir = Bun.fileURLToPath(new URL("./dist/", here));
const indexHtml = Bun.fileURLToPath(new URL("./index.html", here));

await rm(distDir, { recursive: true, force: true });

const result = await Bun.build({
  entrypoints: [indexHtml],
  outdir: distDir,
  minify: true,
  sourcemap: "linked",
  define: { __BUILD_DATE__: JSON.stringify(buildDateToday()) },
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  console.error("game build failed");
  process.exit(1);
}

for (const artifact of result.outputs) {
  console.log(`game ${artifact.kind}: ${artifact.path}`);
}
console.log(`game build: ${distDir} (${buildDateToday()})`);
