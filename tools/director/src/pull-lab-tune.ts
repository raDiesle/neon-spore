import { choice } from "./field-try-bar.js";

/**
 * **What the PULL LAB is tried on, and how loud**: the choices the owner
 * asked for on 12 October 2026, after seeing the drop in a real wave — *not
 * enough attraction … the slow effect has same colour … increase the size of
 * the full pull control altogether, maybe double*. THE LAMPREY's first pull
 * to try it on (`pull-lab-scene.ts`), the whole control bigger, and THE
 * SLOW's light at what ships and at shares either side of it. The colour was
 * a choice here too, of six, until the owner took ACID YELLOW the same day
 * and it went into the game (`goo-style.ts`).
 */

export type LabScene = "lamprey-p2" | "lamprey-p1" | "empty";

export interface LabTune {
  scene: LabScene;
  size: number;
  slow: number;
}

export function freshTune(scene: LabScene = "lamprey-p2"): LabTune {
  return { scene, size: 2, slow: 0.8 };
}

export const LAB_SCENES: readonly [string, LabScene][] = [
  ["THE LAMPREY · HEAD (P2)", "lamprey-p2"],
  ["THE LAMPREY · TAIL (P1)", "lamprey-p1"],
  ["EMPTY FIELD", "empty"],
];

/** The bar's three choices; `scene` hears a change of scene, which the lab rebuilds for. */
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
