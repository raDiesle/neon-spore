import { choice } from "./field-try-bar.js";
import { GOO_COLOURS, type GooColour } from "./pull-lab-colours.js";

/**
 * **What the PULL LAB is tried on, and how loud**: the four choices the
 * owner asked for on 12 October 2026, after seeing the drop in a real wave —
 * *not enough attraction … the slow effect has same colour … increase the
 * size of the full pull control altogether, maybe double*. THE LAMPREY's
 * first pull to try it on (`pull-lab-scene.ts`), the neon it glows in
 * (`pull-lab-colours.ts`), the whole control bigger, and THE SLOW's light at
 * what ships and at shares either side of it.
 */

export type LabScene = "lamprey-p2" | "lamprey-p1" | "empty";

export interface LabTune {
  scene: LabScene;
  colour: GooColour;
  size: number;
  slow: number;
}

export function freshTune(scene: LabScene = "lamprey-p2"): LabTune {
  return { scene, colour: GOO_COLOURS[0] as GooColour, size: 2, slow: 0.8 };
}

export const LAB_SCENES: readonly [string, LabScene][] = [
  ["THE LAMPREY · HEAD (P2)", "lamprey-p2"],
  ["THE LAMPREY · TAIL (P1)", "lamprey-p1"],
  ["EMPTY FIELD", "empty"],
];

/** The bar's four choices; `scene` hears a change of scene, which the lab rebuilds for. */
export function tuneChoices(t: LabTune, scene: () => void): HTMLElement[] {
  return [
    choice(
      LAB_SCENES,
      t.scene,
      (v) => {
        t.scene = v;
        scene();
      },
      "ON",
    ),
    choice(
      GOO_COLOURS.map((c) => [c.label, c] as [string, GooColour]),
      t.colour,
      (v) => {
        t.colour = v;
      },
      "COLOUR",
    ),
    choice(
      [
        ["1×", 1],
        ["1½×", 1.5],
        ["2×", 2],
        ["2½×", 2.5],
      ],
      t.size,
      (v) => {
        t.size = v;
      },
      "SIZE",
    ),
    choice(
      [
        ["100%", 1],
        ["80% · SHIPS", 0.8],
        ["65%", 0.65],
        ["50%", 0.5],
      ],
      t.slow,
      (v) => {
        t.slow = v;
      },
      "SLOW",
    ),
  ];
}
