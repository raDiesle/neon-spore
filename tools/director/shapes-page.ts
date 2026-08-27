/**
 * Build the shape catalogue into one self-contained page.
 *
 * `bun run shapes:page`. Two files come out of it, both in `dist/` and neither
 * committed — a minified bundle is not a thing a diff can read, which is what
 * `shape-sheet.svg` is for:
 *
 *   `shapes.html`     opens in any browser, offline, on its own
 *   `shapes.body.html` the same page without the document around it, which is
 *                     what a cloud session publishes when the human it is
 *                     talking to is holding a phone and cannot run the director
 *
 * The geometry is compiled in rather than sampled out: the page calls the same
 * `pointsAt` the game calls, so a contour here is the contour, not an
 * animation of one somebody exported. Nothing is fetched but the two faces.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CATALOGUE, MOTIONS } from "@neon-spore/shape-sheet";

const OUT = resolve(import.meta.dir, "dist");

/**
 * The game's own palette, not a new one. `render/src/palette.ts` is the source
 * of every colour on the field, and a catalogue that judged shapes against
 * different colours would be judging them somewhere they never appear.
 */
const HEAD = `<title>Neon Spore Shape Drafts</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root {
  --void: #07060F;
  --panel: #0E0A22;
  --rule: #241B4F;
  --draft: #2FE0F0;
  --free: #FFC24A;
  --motion: #C05CFF;
  --taken: #7A6FA8;
  --text: #F2E9DC;
  --dim: #7A6FA8;
  --display: "Chakra Petch", "Trebuchet MS", sans-serif;
  --mono: "IBM Plex Mono", "Courier New", ui-monospace, monospace;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--void);
  color: var(--text);
  font-family: var(--mono);
  font-size: 13px;
  line-height: 1.55;
  -webkit-text-size-adjust: 100%;
}
.wrap { max-width: 1180px; margin: 0 auto; padding: 0 18px 96px; }
header {
  position: sticky;
  top: 0;
  z-index: 2;
  background: linear-gradient(var(--void) 74%, transparent);
  padding: 22px 0 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px 18px;
}
h1 {
  font-family: var(--display);
  font-size: 19px;
  font-weight: 600;
  letter-spacing: 0.14em;
  margin: 0;
  text-transform: uppercase;
}
.lede { color: var(--dim); margin: 0 0 26px; max-width: 62ch; }
.lede b { color: var(--text); font-weight: 500; }
button {
  font: inherit;
  letter-spacing: 0.16em;
  color: var(--text);
  background: transparent;
  border: 1px solid var(--rule);
  border-radius: 2px;
  padding: 4px 14px;
  cursor: pointer;
  margin-left: auto;
}
button:hover { border-color: var(--draft); color: var(--draft); }
button:focus-visible { outline: 2px solid var(--draft); outline-offset: 2px; }
h2 {
  font-family: var(--display);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  margin: 46px 0 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--rule);
  display: flex;
  gap: 12px;
  align-items: baseline;
}
h2 .n { color: var(--dim); font-family: var(--mono); letter-spacing: 0; font-weight: 400; }
h2 .rest { color: var(--dim); font-family: var(--mono); font-size: 11px; letter-spacing: 0;
  font-weight: 400; text-transform: none; margin-left: auto; text-align: right; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(232px, 1fr));
  gap: 18px;
  margin-top: 22px;
}
.card { margin: 0; display: flex; flex-direction: column; gap: 10px; }
.card.spans { grid-column: 1 / -1; }
.stage {
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 3px;
  display: grid;
  place-items: center;
  padding: 6px;
}
.stage svg { width: 100%; height: 132px; display: block; }
.head { display: flex; align-items: baseline; gap: 8px; }
.name { font-family: var(--display); letter-spacing: 0.1em; font-weight: 600; }
.stamp {
  font-size: 9px;
  letter-spacing: 0.18em;
  padding: 1px 6px;
  border: 1px solid currentColor;
  border-radius: 2px;
  margin-left: auto;
}
.is-draft .name, .is-draft .stamp { color: var(--draft); }
.is-free .name, .is-free .stamp { color: var(--free); }
.is-motion .name, .is-motion .stamp { color: var(--motion); }
.is-taken .name, .is-taken .stamp { color: var(--taken); }
figcaption { display: flex; flex-direction: column; gap: 6px; }
figcaption p { margin: 0; }
.suggest { color: var(--text); }
.blurb { color: var(--dim); }
.figures { color: var(--rule); filter: brightness(1.7); font-size: 11px; }
@media (max-width: 520px) {
  .grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  .stage svg { height: 112px; }
  .figures { display: none; }
}
</style>`;

const SECTIONS = [
  {
    id: "drafts",
    title: "Drafts",
    rest: "drawn at an idea in ideas.md · offered, not accepted",
  },
  {
    id: "motions",
    title: "Spare motions",
    rest: "nine ways a body moves · nothing carries them yet",
  },
  { id: "free", title: "Free", rest: "a picture with no behaviour behind it" },
  { id: "taken", title: "Taken", rest: "what the game already draws" },
];

const BODY = `<div class="wrap">
<header>
  <h1>Shape drafts</h1>
  <button id="pause" type="button" aria-pressed="false">PAUSE</button>
</header>
<p class="lede">Every contour that has been drawn, moving the way the field would move
it — the same <b>pointsAt</b> the game calls, so this is the shape and not a picture of
it. A <b>draft</b> is a silhouette offered to an idea the design has not worked out; it
leaves by being claimed, or by being cut. Nothing here is in the game.</p>
${SECTIONS.map(
  (s) => `<h2>${s.title}<span class="n" data-count="${s.id}">0</span>
  <span class="rest">${s.rest}</span></h2>
<div class="grid" id="${s.id}"></div>`,
).join("\n")}
</div>`;

const bundle = await Bun.build({
  entrypoints: [resolve(import.meta.dir, "src/shapes-page-app.ts")],
  target: "browser",
  minify: true,
});
if (!bundle.success) {
  for (const log of bundle.logs) console.error(log);
  throw new Error("the shapes page did not bundle");
}
const js = await bundle.outputs[0]!.text();

export const page = `${HEAD}
${BODY}
<script type="module">
${js}
</script>`;

const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${page}
</html>`;

if (import.meta.main) {
  await mkdir(OUT, { recursive: true });
  await writeFile(resolve(OUT, "shapes.html"), document, "utf8");
  await writeFile(resolve(OUT, "shapes.body.html"), page, "utf8");
  const shapes = CATALOGUE.length;
  console.log(`wrote ${OUT}/shapes.html — ${shapes} shapes, ${MOTIONS.length} spare motions`);
  console.log(`wrote ${OUT}/shapes.body.html — the same page, for publishing`);
}
