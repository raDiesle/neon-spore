import { describe, expect, it } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { CREATURES } from "@neon-spore/content";
import { BOSS_KINDS } from "@neon-spore/sim";

/**
 * **The catalogue of marks and controls names every shared piece** — the
 * owner, 29 September 2026: *make all those controls reusable … and we have
 * this catalogue documentation to know all the graphical and control
 * elements we can choose from* (`docs/controls-catalogue.md`).
 *
 * Two ways a piece escapes it, and one test each:
 *
 * - a file the page lists grows a function, a constant or a class the page
 *   does not name (a type is the function's, and goes with it);
 * - a file becomes shared — three bosses or creatures import it — and is on
 *   neither the page nor `NOT_MARKS` below.
 *
 * `NOT_MARKS` is what every body is drawn with and no thumb is asked with: a
 * palette, a layout, a curve, a clock. A file goes on it with the reason it
 * asks nothing of a player; a file that does ask goes on the page.
 */

const NOT_MARKS: Readonly<Record<string, string>> = {
  "palette.ts": "colour",
  "layout.ts": "the field's geometry",
  "hex.ts": "colour arithmetic",
  "glow.ts": "light on a stroke",
  "touch.ts": "where a press lands, not what is drawn",
  "touch-field.ts": "the same",
  "desk-seat.ts": "whose hand a desk's one mouse is, not what is drawn",
  "spline.ts": "a curve",
  "arc-from-top.ts": "a curve: the arc a ring is stroked along, whatever the ring says",
  "ease.ts": "a curve",
  "key-light.ts": "a body's light",
  "field-flip.ts": "which way up the field is",
  "heartbeat.ts": "a curve",
  "bolt-stop.ts": "where a bolt is drawn to end, not what a thumb is asked",
  "core-stop.ts": "where a bolt meets a core and its body, not what a thumb is asked",
  "effects-boss.ts": "where a boss's transients live",
  "effects.ts": "where every transient lives",
  "view-role.ts": "which seat sees what",
  "view-role-clocks.ts": "the same, for the choreographed",
  "view-role-clocks-b.ts": "the same",
  "view-role-clocks-c.ts": "the same",
  "hull-shock.ts": "the ship's own hit",
  "hull-frame.ts": "the ship",
  "hull.ts": "the ship",
  "renderer.ts": "the frame",
  "outline-drift.ts": "a body's contour moving",
  "motion-life.ts": "how much a body is allowed to move",
  "outline-parts.ts": "the same",
  "solid-motion.ts": "a body's depth",
  "solid-haze.ts": "the same",
  "solid-tube-draw.ts": "the same",
  "seat-skin.ts": "the ship's seat colour",
  "band.ts": "the band, whose buttons are `controls.ts`",
  "field.ts": "the field",
  "lobe-shell.ts": "a body's lobes",
  "idle-drift.ts": "a body at rest",
  "idle-drift-parts.ts": "the same",
  "painted-strips.ts": "a body's paint",
  "sprite-burst.ts": "a burst",
  "meteor.ts": "a meteor's body",
  "hud.ts": "the hud",
  "ship-air.ts": "the ship",
  "hash.ts": "a seed from an id",
  "pods.ts": "the pods",
  "creature-place.ts": "where a body stands",
  "depth.ts": "a body's depth",
  "baked.ts": "a cache",
  "rock-size.ts": "a rock's size",
  "backdrop.ts": "the background",
  "creature-body-in.ts": "a body",
  "creature-body.ts": "a body",
  "creature-tint.ts": "a body's colour",
  "seat-name.ts": "a seat's name",
  "gradient-slot.ts": "a cache",
  "tile-seed.ts": "a seed",
  "shatter.ts": "a body breaking",
  "text-drop.ts": "a word's shadow",
  "wave-intro.ts": "a wave's opening",
  "opening-fx.ts": "the same",
  "well.ts": "the well",
  "torch.ts": "a torch's body",
  "shield.ts": "the shield, whose control is `controls.ts`",
  "touch-hold.ts": "where a hold lands",
  "touch-ship.ts": "where a press on the ship lands",
  "eye.ts": "an eye's body, THE WARDEN's and THE LID's",
  "ship-top-rows.ts": "where the alarm bands are written",
};

const DOC = readFileSync(new URL("../../../docs/controls-catalogue.md", import.meta.url), "utf8");
const SRC = new URL("../src/", import.meta.url);
const FILES = readdirSync(SRC).filter((f) => f.endsWith(".ts"));

/** The files in the page's **Shared** column: the second cell of each table row. */
const LISTED = [...DOC.matchAll(/^\| [^|]+ \| `([a-z0-9-]+\.ts)` \|/gm)].map((m) => m[1] as string);

function exportsOf(file: string): string[] {
  const source = readFileSync(new URL(file, SRC), "utf8");
  return [...source.matchAll(/^export (?:function|const|class) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map(
    (m) => m[1] as string,
  );
}

const KINDS: readonly string[] = [...BOSS_KINDS, ...Object.keys(CREATURES)];
const kindOf = (f: string) => KINDS.find((k) => f === `${k}.ts` || f.startsWith(`${k}-`));

/** Each file outside a body's own prefix, with the bodies that import it. */
function sharedFiles(): string[] {
  const users = new Map<string, Set<string>>();
  for (const f of FILES) {
    const kind = kindOf(f);
    if (kind === undefined) continue;
    const source = readFileSync(new URL(f, SRC), "utf8");
    for (const m of source.matchAll(/from "\.\/([a-z0-9-]+)\.js"/g)) {
      const dep = `${m[1]}.ts`;
      if (kindOf(dep) !== undefined) continue;
      const set = users.get(dep) ?? new Set<string>();
      set.add(kind);
      users.set(dep, set);
    }
  }
  return [...users].filter(([, s]) => s.size >= 3).map(([f]) => f);
}

describe("the catalogue of marks and controls", () => {
  it("lists files that exist", () => {
    expect(LISTED.length).toBeGreaterThan(20);
    expect(LISTED.filter((f) => !existsSync(new URL(f, SRC)))).toEqual([]);
  });

  it("names every export of every file it lists", () => {
    const missing = [...new Set(LISTED)].flatMap((f) =>
      exportsOf(f)
        .filter((name) => !DOC.includes(`\`${name}\``))
        .map((name) => `${f}: ${name}`),
    );
    expect(missing).toEqual([]);
  });

  it("has every file three bodies share, or knows why it is not a mark", () => {
    const loose = sharedFiles().filter((f) => !LISTED.includes(f) && NOT_MARKS[f] === undefined);
    expect(loose.sort()).toEqual([]);
  });

  it("keeps no reason for a file that is on the page, or gone", () => {
    const stale = Object.keys(NOT_MARKS).filter(
      (f) => LISTED.includes(f) || !existsSync(new URL(f, SRC)),
    );
    expect(stale).toEqual([]);
  });
});
