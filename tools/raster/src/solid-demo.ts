import type { Anchor, Ring } from "@neon-spore/content";
import { breath, chainAt, type Part, type Skin } from "@neon-spore/render";

/**
 * The test rig the solid sheet turns: not a boss, only the parts a boss is
 * made of — a long body, a head resting on it, two fins either side of it
 * and a tail that curls away in depth, so every cue a turn has to get right
 * is on one body: the painter's order, the haze, the contact, the near end
 * swelling, the far fin going behind.
 *
 * The fins and the eyes hang off anchors (`solid-anchor.ts`): each fin is
 * authored about its shoulder and beats by turning it, and the eyes are
 * authored about the head, so a nod of the head carries them with it.
 *
 * Authored side-on in pixels about its own middle, head to the left.
 */

const BODY: Skin = { base: "#3A2380", lift: "#9C82FF", sheen: "#F3DEFF" };
const HEAD: Skin = { base: "#7A2E1C", lift: "#FF8A4C", sheen: "#FFE3C8" };
const FIN: Skin = { base: "#1D4A66", lift: "#5FD3F0", sheen: "#E4FBFF" };

/** The rig at `t` seconds: breathing, the tail following through. */
export function demoRig(t: number): Part[] {
  const b = breath(t, 3.4, 0.35, 11);
  const body: Ring[] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    const x = -110 + u * 230;
    const swell = Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 0.7;
    const wave = chainAt((s) => Math.sin(s * 1.9), t, i, 0.09, 1.02) * 6;
    body.push({ c: { x, y: wave, z: 0 }, r: 18 + 38 * swell * (1 + b * 0.04) });
  }
  const tail = (from: number, to: number): Ring[] => {
    const rings: Ring[] = [];
    for (let i = from; i <= to; i++) {
      const u = i / 10;
      const a = u * 2.1 + chainAt((s) => Math.sin(s * 1.9) * 0.25, t, i, 0.12, 1.05);
      rings.push({
        c: { x: 120 + Math.sin(a) * 70, y: -Math.cos(a) * 30 + 30, z: -u * 90 },
        r: 18 * (1 - u * 0.8),
      });
    }
    return rings;
  };
  // The fins beat on the breath, each about its own shoulder.
  const flap = 0.25 * b;
  const fin = (side: 1 | -1): { rings: Ring[]; anchor: Anchor } => ({
    rings: [0, 1, 2, 3].map((i) => ({
      c: { x: i * 18, y: -i * 16, z: side * i * 16 },
      r: 12 - i * 2.4,
    })),
    anchor: { at: { x: 10, y: -30, z: side * 30 }, roll: side * flap },
  });
  const head: Anchor = { at: { x: -128, y: -6 + b * 2, z: 0 }, pitch: -0.12 * b };
  return [
    { kind: "tube", rings: body, skin: BODY },
    { kind: "tube", rings: tail(0, 5), skin: BODY },
    { kind: "tube", rings: tail(5, 10), skin: BODY },
    { kind: "tube", ...fin(1), skin: FIN },
    { kind: "tube", ...fin(-1), skin: FIN },
    { kind: "ball", c: { x: 0, y: 0, z: 0 }, r: 34, skin: HEAD, rests: 0, anchor: head },
    { kind: "ball", c: { x: -18, y: -12, z: 20 }, r: 8, skin: FIN, rests: 5, anchor: head },
    { kind: "ball", c: { x: -18, y: -12, z: -20 }, r: 8, skin: FIN, rests: 5, anchor: head },
  ];
}
