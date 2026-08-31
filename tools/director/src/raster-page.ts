import { detectRasterCaps } from "@neon-spore/render";
import { button, el } from "./checks-dom.js";
import { apngCard, capsTable, DEMO_W, stripCard, waysCard, webpCard } from "./raster-cards.js";
import { hitDemo, powerupDemo } from "./raster-demos.js";
import { drawPlay, playSection } from "./raster-play.js";

/**
 * The RASTER tab: a baked animation, offered beside the field's procedural
 * sparks — never in place of them. See CLAUDE.md's *A look is offered, never
 * replaced* and `apps/game/src/raster.ts`'s `?raster=1`, which is the same
 * atlas installed into the same class this page drives by hand.
 *
 * Mounted the way GUIDES and ALTERNATIVES are (`guide-page.ts`,
 * `versus-page.ts`): a tab button and an empty page appended to the backlog
 * sheet's own bar before `bindTabs` runs. `mountRasterTab` only writes the
 * static prose and the empty mounts the sections draw into — nothing here
 * fetches or animates. That is `drawRaster`'s job, run once on first click.
 * The card builders and the caps table live in `raster-cards.ts`, split out
 * to keep this file under the line ceiling.
 */

const TAB_ID = "raster";

/**
 * Copied from `assets/raster/burst.json` by hand rather than imported, so the
 * byte counts on the page are literal numbers and not a fetch this tab would
 * otherwise make merely to print a label. `tools/raster/test/assets.test.ts`
 * checks the generator's own manifest against `sprite-burst.ts`'s
 * `BURST_SHEET`; if these three numbers ever drift from `burst.json` it is
 * this comment, not a test, that is out of date.
 */
const BYTES = { strip: 96_332, apng: 235_934, webp: 100_068 };

const DEMO_H = 300;

export function mountRasterTab(): void {
  const tabs = document.getElementById("backlogTabs");
  const body = document.getElementById("backlogBody");
  if (!tabs || !body || document.getElementById(`sheet-${TAB_ID}`)) return;

  const tab = button("RASTER");
  tab.dataset.tab = TAB_ID;
  tabs.appendChild(tab);

  const page = el("div", "sheetpage");
  page.id = `sheet-${TAB_ID}`;

  page.appendChild(
    el(
      "p",
      "note",
      "Nothing on this page is on the field. The hit a cannon shot lands still " +
        "draws the shipped procedural sparks, byte for byte, exactly as it did " +
        "before this page existed — see CLAUDE.md's *A look is offered, never " +
        "replaced*.",
    ),
  );
  page.appendChild(
    el(
      "p",
      "note",
      "What is below is a look, offered for the owner to accept, improve or " +
        "throw away: a baked animation, drawn a few different ways, standing in " +
        "for where the field's own spark could one day be replaced.",
    ),
  );
  page.appendChild(
    el(
      "p",
      "note",
      "The same burst is already wired into the real game behind a flag — open " +
        "it with ?raster=1 to see it fire on a real hit, on the real field.",
    ),
  );

  page.appendChild(playSection());
  page.appendChild(threeWaysSection());
  page.appendChild(powerupSection());
  page.appendChild(hitSection());
  page.appendChild(capsSection());
  body.appendChild(page);
}

function threeWaysSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "THE BURST, THREE WAYS"));
  section.appendChild(
    el(
      "p",
      "note",
      "The same sixteen frames, delivered three ways, at the same drawn size. " +
        "An APNG and an animated WebP are the two formats a plain <img> can " +
        "play; the sprite strip is the one `sprite-burst.ts` actually draws " +
        "from, because it is the only one of the three whose frame number the " +
        "game controls rather than the browser's own clock.",
    ),
  );

  const row = el("div", "holder-row");
  row.id = "rasterWaysMount";
  section.appendChild(row);

  section.appendChild(
    el(
      "p",
      "note",
      "Only the strip is driven by the tick counter, not the wall clock — the " +
        "same `dt` every other effect is stepped by. That is the whole reason " +
        "the field uses it and not either of the other two: an APNG or an " +
        "animated WebP plays at its own pace on each phone, and a burst that is " +
        "halfway done on one screen and finished on the other is exactly the " +
        "split-screen this game exists to avoid.",
    ),
  );
  return section;
}

function powerupSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "AS A POWERUP"));
  section.appendChild(
    el(
      "p",
      "note",
      "The same strip, at half the field's frame rate and looping — an aura " +
        "sitting behind a pickup rather than an explosion covering one.",
    ),
  );
  const mount = el("div");
  mount.id = "rasterPowerupMount";
  section.appendChild(mount);
  return section;
}

function hitSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "WHEN A SHOT LANDS"));
  const mount = el("div");
  mount.id = "rasterHitMount";
  section.appendChild(mount);
  section.appendChild(
    el(
      "p",
      "note",
      "Hung on the same event the field's own burst is: `destroy`, in " +
        "packages/render/src/effects.ts — a cannon shot that killed the thing " +
        "it hit. The body flashes out for exactly as long as the burst covers " +
        "it, then returns.",
    ),
  );
  return section;
}

function capsSection(): HTMLElement {
  const section = el("section");
  section.appendChild(el("h2", "", "WHAT THIS BROWSER CAN DO"));
  section.appendChild(
    el(
      "p",
      "note",
      "Feature-tested by decoding two tiny probe images, not read off a " +
        "user-agent string — see `raster-caps.ts`. Nothing on the field depends " +
        "on any of this; these four flags decide what a *page* like this one " +
        "may put in an <img>.",
    ),
  );
  const mount = el("div");
  mount.id = "rasterCapsMount";
  section.appendChild(mount);
  return section;
}

let drawn = false;

/**
 * Built on first sight of the tab, not on page load — three animated canvases
 * and two decoded images are not work a session that came here to place a
 * creature on the grid should pay for. Matches the lazy draw `guide-page.ts`
 * and `versus-page.ts` already do.
 */
export function drawRaster(): void {
  if (drawn) return;
  drawn = true;

  const play = document.getElementById("rasterPlayMount");
  if (play) drawPlay(play);

  const ways = document.getElementById("rasterWaysMount");
  if (ways) {
    ways.appendChild(waysCard("APNG", `${(BYTES.apng / 1024).toFixed(0)} kB`, apngCard()));
    ways.appendChild(waysCard("ANIMATED WEBP", `${(BYTES.webp / 1024).toFixed(0)} kB`, webpCard()));
    ways.appendChild(
      waysCard("SPRITE STRIP", `${(BYTES.strip / 1024).toFixed(0)} kB`, stripCard()),
    );
  }

  const powerup = document.getElementById("rasterPowerupMount");
  if (powerup) {
    const canvas = document.createElement("canvas");
    canvas.className = "holder-shot";
    powerup.appendChild(canvas);
    powerupDemo(canvas, DEMO_W, DEMO_H);
  }

  const hit = document.getElementById("rasterHitMount");
  if (hit) {
    const canvas = document.createElement("canvas");
    canvas.className = "holder-shot";
    hit.appendChild(canvas);
    hitDemo(canvas, DEMO_W, DEMO_H);
  }

  const caps = document.getElementById("rasterCapsMount");
  if (caps) {
    caps.textContent = "checking…";
    detectRasterCaps()
      .then((flags) => {
        caps.replaceChildren(capsTable(flags));
      })
      .catch(() => {
        caps.textContent = "could not check — see the console.";
      });
  }
}
