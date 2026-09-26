/**
 * THE KEEL's sixteen, in a file of their own for `boss-gorge.ts`' reason.
 *
 * The boss is **a spine of six segments arched over the field**, and
 * everything here is the sound of bone and cartilage rather than metal: the
 * enter is the spine settling, a long low creak; the light is a joint waking,
 * one bright tick; the lock is it seating, a dry knock pitched up as the loose
 * ones run out. The miss is the joint going dull, the slip a segment working
 * loose again, a soft rattle. The split is the midpoint parting, the socket its
 * flash, the shut its seating; the socket's hit and the rock's are the hull's
 * dull strike. The dim is the spine going quiet before the fast run, the rigid
 * a held creak, the throw the tail flicking, the rock out a bolt through
 * stone, the straight the spine easing flat, and the out the field clearing.
 * Low and soft under the band, or short and high above it, as ever
 * (`docs/spec/audio.md` §1).
 */

import { after, air, glint, noise, soft, sub, swell, thud, tick } from "../grain.js";
import type { SoundDef } from "../types.js";

export const BOSS_KEEL_SOUNDS: SoundDef[] = [
  {
    id: "boss.keelEnter",
    family: "boss",
    blurb: "A long spine settling over the field: a low creak.",
    status: "bound",
    use: "THE KEEL arriving, every joint loose.",
    level: 0.4,
    layers: [swell(52, 1.1, 0.12), after(0.2, thud(170, 80, 0.14, 0.26))],
  },
  {
    id: "boss.keelLight",
    family: "boss",
    blurb: "One bright tick: a joint waking.",
    status: "bound",
    use: "A joint lit, on one half of the spine or in the middle.",
    level: 0.36,
    layers: [glint(1700, 0.3, 0.14), after(0.04, tick(0.1, 0, 2600))],
  },
  {
    id: "boss.keelLock",
    family: "boss",
    blurb: "A dry knock: a joint seating.",
    status: "bound",
    use: "A lit joint tapped by the right seat. Pitched up as the loose ones run out.",
    level: 0.4,
    layers: [tick(0.22, 0, 2400), after(0.01, thud(240, 120, 0.08, 0.3))],
  },
  {
    id: "boss.keelMiss",
    family: "boss",
    blurb: "The joint going dull again: a soft low tap.",
    status: "bound",
    use: "A lit joint's window ran out untapped.",
    level: 0.32,
    layers: [thud(150, 90, 0.1, 0.22), after(0.05, soft(0.5, sub(58, 0.3, 0.2)))],
  },
  {
    id: "boss.keelSlip",
    family: "boss",
    blurb: "A segment working loose again: a short rattle.",
    status: "bound",
    use: "A joint missed in the fast run, and its segment loose again.",
    level: 0.34,
    layers: [
      noise(0.3, { type: "bandpass", freq: 260, toFreq: 180, q: 1.2 }, 0.01, 0.12, 0.2),
      after(0.08, thud(140, 80, 0.1, 0.2)),
    ],
  },
  {
    id: "boss.keelSplit",
    family: "boss",
    blurb: "The midpoint parting: a low tear opening onto quiet.",
    status: "bound",
    use: "Two segments left loose — the middle of the spine opens.",
    level: 0.46,
    layers: [air(3400, 6400, 0.4, 0.14, 1.5), after(0.16, sub(48, 0.6, 0.36))],
  },
  {
    id: "boss.keelSocket",
    family: "boss",
    blurb: "The socket flashing its colour: two quick high glints.",
    status: "bound",
    use: "The open middle flashing, waiting for its colour.",
    level: 0.38,
    layers: [glint(2600, 0.2, 0.14), after(0.1, glint(3000, 0.2, 0.12))],
  },
  {
    id: "boss.keelShut",
    family: "boss",
    blurb: "The socket seating: a clean knock and a low settle.",
    status: "bound",
    use: "The socket shot in its colour — one joint locked for free.",
    level: 0.44,
    layers: [
      tick(0.24, 0, 2600),
      after(0.02, thud(200, 90, 0.12, 0.3)),
      after(0.1, sub(56, 0.4, 0.26)),
    ],
  },
  {
    id: "boss.keelSocketHit",
    family: "boss",
    blurb: "The socket's lash on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the socket in time — a hit on the hull, and it flashes again.",
    level: 0.46,
    layers: [thud(230, 105, 0.12, 0.34), after(0.04, sub(46, 0.4, 0.36))],
  },
  {
    id: "boss.keelDim",
    family: "boss",
    blurb: "The whole spine going quiet: a soft low fall.",
    status: "bound",
    use: "Every joint locked; the spine dims before the fast run.",
    level: 0.36,
    layers: [sub(54, 0.7, 0.3), after(0.1, soft(0.6, swell(60, 0.6, 0.06)))],
  },
  {
    id: "boss.keelRigid",
    family: "boss",
    blurb: "The spine held stiff: a tight, short creak.",
    status: "bound",
    use: "The fast run over — the spine goes rigid for a beat.",
    level: 0.38,
    layers: [thud(260, 200, 0.14, 0.24), after(0.06, sub(62, 0.3, 0.22))],
  },
  {
    id: "boss.keelThrow",
    family: "boss",
    blurb: "The tail flicking: a quick whoosh downward.",
    status: "bound",
    use: "The tail throwing its one rock down its own column.",
    level: 0.4,
    layers: [air(4200, 3400, 0.3, 0.14, 1.5), after(0.04, thud(180, 100, 0.08, 0.2))],
  },
  {
    id: "boss.keelRockOut",
    family: "boss",
    blurb: "The bolt through the rock: short and bright, then grit.",
    status: "bound",
    use: "The rock shot out, in either colour.",
    level: 0.4,
    layers: [glint(2600, 0.28, 0.18), after(0.04, air(2400, 800, 0.22, 0.12, 1.5))],
  },
  {
    id: "boss.keelRockHit",
    family: "boss",
    blurb: "The rock arriving on the hull: a dull, heavy strike.",
    status: "bound",
    use: "Nobody shot the rock — a hit on the hull.",
    level: 0.46,
    layers: [thud(210, 95, 0.14, 0.34), after(0.05, sub(44, 0.45, 0.36))],
  },
  {
    id: "boss.keelStraight",
    family: "boss",
    blurb: "The spine easing flat: a long, soft exhale.",
    status: "bound",
    use: "The fight won — the spine lies straight.",
    level: 0.4,
    layers: [sub(50, 0.8, 0.3), after(0.1, soft(0.5, air(4000, 6000, 0.7, 0.1, 1.5)))],
  },
  {
    id: "boss.keelOut",
    family: "boss",
    blurb: "The straight spine drifting away, and the field clearing.",
    status: "bound",
    use: "THE KEEL gone — then the wave-end light.",
    level: 0.5,
    // The same shape as THE MANTLE's own out (`sounds/boss-mantle.ts`).
    layers: [
      sub(50, 0.5, 0.35),
      after(0.1, air(4000, 6800, 0.6, 0.14, 1.5)),
      after(0.4, glint(3000, 0.5, 0.14)),
      after(0.5, air(4200, 8800, 0.9, 0.16, 1.5)),
    ],
  },
];
