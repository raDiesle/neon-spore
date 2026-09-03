import { readdir, rm } from "node:fs/promises";
import { buildDateToday } from "../../tools/build-stamp.js";

/**
 * What `bun build ./index.html --outdir=dist --minify --sourcemap` used to be,
 * as a script. The flags are unchanged; the reason for the file is `define` —
 * the build date has to be computed before it can be substituted, and a shell
 * one-liner that computes a date is a different one-liner on every platform.
 *
 * `tools/director/build.ts` is the same shape for the same reason.
 *
 * It also copies `public/`, which the bundler does not see: the manifest, the
 * icons and the service worker are named by a phone rather than imported by the
 * page, so nothing links them into the graph and they would simply not ship.
 */

const here = new URL("./", import.meta.url);
const distDir = Bun.fileURLToPath(new URL("./dist/", here));
const publicDir = Bun.fileURLToPath(new URL("./public/", here));
const indexHtml = Bun.fileURLToPath(new URL("./index.html", here));

/**
 * The service worker's cache name. Every build gets its own, so activating a
 * new worker deletes the last one's store — a cache under a name that never
 * changes is how a game ships a fix that nobody receives.
 */
const swVersion = `${buildDateToday()}-${Date.now().toString(36)}`;

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

for (const name of await readdir(publicDir)) {
  const file = Bun.file(`${publicDir}${name}`);
  // `sw.js` is the one file that is rewritten on the way through, and only in
  // the one place. Everything else is copied byte for byte.
  if (name === "sw.js") {
    await Bun.write(
      `${distDir}${name}`,
      (await file.text()).replaceAll("__SW_VERSION__", swVersion),
    );
  } else {
    await Bun.write(`${distDir}${name}`, file);
  }
  console.log(`game public: ${distDir}${name}`);
}

/**
 * The three head links that name a copied file, added to the built page.
 *
 * They cannot be written in `index.html`: the bundler follows every
 * `<link href>`, hashes what it finds and rewrites the href, and a manifest
 * under a hashed name is one no phone looks for — worse, the icon paths inside
 * it would still name the plain files, so half the pair would move and half
 * would not. Written here they name exactly what the loop above copied.
 */
const HEAD_LINKS = [
  '<link rel="manifest" href="/manifest.webmanifest">',
  '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
  '<link rel="icon" href="/icon-192.png" type="image/png">',
].join("");

const builtPage = `${distDir}index.html`;
const page = await Bun.file(builtPage).text();
if (!page.includes("</head>")) {
  console.error("built index.html has no </head> to add the manifest to");
  process.exit(1);
}
await Bun.write(builtPage, page.replace("</head>", `${HEAD_LINKS}</head>`));

console.log(`game build: ${distDir} (${buildDateToday()}, sw ${swVersion})`);
