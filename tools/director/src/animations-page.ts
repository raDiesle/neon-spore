import { detectRasterCaps } from "@neon-spore/render";
import { el } from "./dom.js";
import { drawGallery, gallerySection } from "./gallery-page.js";
import { apngCard, capsTable, DEMO_W, stripCard, waysCard, webpCard } from "./raster-cards.js";
import { hitDemo, powerupDemo } from "./raster-demos.js";
import { drawPlay, playSection } from "./raster-play.js";

/**
 * BAKED ANIMATIONS — every PNG, APNG and animated WebP example, on a page of
 * its own that opens in a new tab.
 *
 * It used to be the top half of the OTHER GRAPHICS tab, above the candidate
 * looks, and it is here for the reason the candidates moved out too: a
 * sixteen-frame burst played three ways, a looping aura, a live field and two
 * decoded probe images are five animations running the whole time the tab is
 * open, whether the thing being looked at is one of them or not. The owner
 * asked for the examples off the list and behind a button, and this is the
 * button's destination — reached from the VERSUS tab (`versus-tab.ts`)
 * through `versus-open.ts`'s `animationsUrl`.
 *
 * Nothing on this page is on the field. The hit a cannon shot lands still
 * draws the shipped procedural sparks, byte for byte, exactly as it did
 * before this page existed — CLAUDE.md's *A look is offered, never replaced*.
 */

/**
 * Copied from `assets/raster/burst.json` by hand rather than imported, so the
 * byte counts on the page are literal numbers and not a fetch this page would
 * otherwise make merely to print a label. `tools/raster/test/assets.test.ts`
 * checks the generator's own manifest against `sprite-burst.ts`'s
 * `BURST_SHEET`; if these three numbers ever drift from `burst.json` it is
 * this comment, not a test, that is out of date.
 */
const BYTES = { strip: 80_406, apng: 202_470, webp: 84_270 };

const DEMO_H = 300;

/** The static half: prose and empty mounts. `drawAnimations` fills them. */
export function mountAnimations(host: HTMLElement): void {
  host.appendChild(el("h1", "", "BAKED ANIMATIONS"));
  host.appendChild(
    el(
      "p",
      "note",
      "A look, offered for the owner to accept, improve or throw away: a baked " +
        "animation, drawn a few different ways, standing in for where the " +
        "field's own spark could one day be replaced. Nothing here is on the " +
        "field — see CLAUDE.md's *A look is offered, never replaced*.",
    ),
  );
  host.appendChild(
    el(
      "p",
      "note",
      "The same burst is already wired into the real game behind a flag — open " +
        "it with ?raster=1 to see it fire on a real hit, on the real field.",
    ),
  );

  host.appendChild(playSection());
  host.appendChild(threeWaysSection());
  host.appendChild(powerupSection());
  host.appendChild(hitSection());
  host.appendChild(capsSection());
  host.appendChild(gallerySection());
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

/** The moving half. Called once, after `mountAnimations` — this page exists
 * to run these, so there is nothing lazy left to defer them behind. */
export function drawAnimations(): void {
  drawGallery();

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
