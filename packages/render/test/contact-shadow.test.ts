import { describe, expect, it } from "bun:test";
import { type Creature, DEFAULT_CONFIG, NO_SHELL, type Scar } from "@neon-spore/sim";
import { contactShadowFor, drawContactShadows } from "../src/contact-shadow.js";
import { creatureCenter } from "../src/creature-place.js";
import { computeLayout } from "../src/layout.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The shadow a falling body throws on the hull below it — and the one thing
 * it must never do, which is compete with a scar for the same pixels. See
 * `contact-shadow.ts` for why the second half is proven by absence rather
 * than by draw order.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");

function creature(row: number, col = 3): Creature {
  return {
    id: 1,
    kind: "bulb",
    col,
    row,
    fromRow: row,
    color: "red",
    holes: 0,
    petals: 0,
    dragMilli: 0,
    throbOpen: false,
    shell: NO_SHELL,
  } as Creature;
}

function scar(col: number): Scar {
  return { col, beat: 0, kind: "bulb" };
}

describe("contactShadowFor", () => {
  it("is absent while a body is out of the lead window", () => {
    const farRow = CFG.rows - 1 - CFG.contactShadowLeadRows - 1;
    expect(contactShadowFor(CFG, L, creature(farRow), 0, [])).toBeNull();
  });

  it("tightens and darkens monotonically as the body falls toward the hull", () => {
    // Strictly inside the window: its own far edge is the threshold, and the
    // threshold itself casts nothing (see the "absent" test above).
    const start = CFG.rows - 1 - CFG.contactShadowLeadRows + 0.01;
    let lastRx = Number.POSITIVE_INFINITY;
    let lastAlpha = -1;
    for (let row = start; row <= CFG.rows - 1; row += 0.25) {
      const s = contactShadowFor(CFG, L, creature(row), 0, []);
      expect(s).not.toBeNull();
      if (!s) continue;
      // Tightens: the ellipse never widens as it closes in.
      expect(s.rx).toBeLessThanOrEqual(lastRx + 1e-9);
      // Darkens: alpha never falls as it closes in.
      expect(s.alpha).toBeGreaterThanOrEqual(lastAlpha - 1e-9);
      lastRx = s.rx;
      lastAlpha = s.alpha;
    }
    // And it is strictly darker at the hull than at the window's own far edge.
    const first = contactShadowFor(CFG, L, creature(start + 0.01), 0, []);
    const last = contactShadowFor(CFG, L, creature(CFG.rows - 1), 0, []);
    expect(first).not.toBeNull();
    expect(last).not.toBeNull();
    if (first && last) expect(last.alpha).toBeGreaterThan(first.alpha);
  });

  it("leans along the light, and stops leaning at the moment of contact", () => {
    const start = CFG.rows - 1 - CFG.contactShadowLeadRows + 0.01;
    const far = contactShadowFor(CFG, L, creature(start + 0.01, 5), 0, []);
    const at = contactShadowFor(CFG, L, creature(CFG.rows - 1, 5), 0, []);
    const under = creatureCenter(L, creature(CFG.rows - 1, 5), 0).x;
    expect(far).not.toBeNull();
    expect(at).not.toBeNull();
    if (!far || !at) return;
    // Away from the light, which is upper left, so to the right.
    expect(far.x).toBeGreaterThan(creatureCenter(L, creature(start + 0.01, 5), 0).x);
    // And on the body's own foot once it is there: contact means contact.
    expect(at.x).toBeCloseTo(under, 6);
  });

  it("stays a contact shadow: it never leaves the point under the body", () => {
    // The lean is what could turn this into a second body lying beside the
    // first. It does not, because it never exceeds the ellipse's own
    // half-width — so the shadow still covers the body's foot the whole way
    // down and there is no gap for an eye to read as two things.
    const start = CFG.rows - 1 - CFG.contactShadowLeadRows + 0.01;
    for (let row = start; row <= CFG.rows - 1; row += 0.1) {
      const s = contactShadowFor(CFG, L, creature(row, 5), 0, []);
      expect(s).not.toBeNull();
      if (!s) continue;
      const foot = creatureCenter(L, creature(row, 5), 0).x;
      expect(Math.abs(s.x - foot)).toBeLessThan(s.rx);
    }
  });

  it("never casts for a boss body or the tether, which never arrive", () => {
    const boss = creature(CFG.rows - 1);
    boss.kind = "warden";
    expect(contactShadowFor(CFG, L, boss, 0, [])).toBeNull();
    const tether = creature(CFG.rows - 1);
    tether.kind = "tether";
    expect(contactShadowFor(CFG, L, tether, 0, [])).toBeNull();
  });

  it("a scar always wins: no shadow is built for a scarred column or its neighbours", () => {
    const c = creature(CFG.rows - 1, 5);
    expect(contactShadowFor(CFG, L, c, 0, [scar(5)])).toBeNull();
    expect(contactShadowFor(CFG, L, c, 0, [scar(4)])).toBeNull();
    expect(contactShadowFor(CFG, L, c, 0, [scar(6)])).toBeNull();
    // A scar two columns away leaves the shadow untouched.
    expect(contactShadowFor(CFG, L, c, 0, [scar(2)])).not.toBeNull();
  });
});

describe("drawContactShadows", () => {
  it("draws nothing at all over a scarred column — there is no pixel to lose", () => {
    installCanvasGlobals();
    const { ctx } = stubCanvas();
    const creatures = [creature(CFG.rows - 1, 5)];
    const scars = [scar(5)];
    // Whatever `drawScars` painted for this column stands exactly as drawn:
    // this call makes zero draw calls of its own, in this column or any
    // other, so there is nothing here that could have overwritten it — true
    // regardless of whether this ran before or after `drawHull`.
    drawContactShadows(ctx as unknown as CanvasRenderingContext2D, L, CFG, creatures, scars, 0);
    expect(ctx.calls).toBe(0);
  });

  it("draws something when the same body has no scar to answer to", () => {
    installCanvasGlobals();
    const { ctx } = stubCanvas();
    const creatures = [creature(CFG.rows - 1, 5)];
    drawContactShadows(ctx as unknown as CanvasRenderingContext2D, L, CFG, creatures, [], 0);
    expect(ctx.calls).toBeGreaterThan(0);
  });
});
