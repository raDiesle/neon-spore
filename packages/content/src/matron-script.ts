import type { MatronStep } from "@neon-spore/sim";

/**
 * **FINALE's script: THE MATRON's four clutches** (`sim/matron.ts`), the
 * owner's boss of 16 October 2026 about everything the tutorial arc taught,
 * the pods most of all.
 *
 * Named rather than written out on the wave, THE INSTAR's reason
 * (`instar-script.ts`): a clutch is a list of throws authored to be read down
 * a page, and the director writes the name back (`serialize-boss.ts`).
 *
 * Each clutch is one lesson of the arc again, around her pods: the two
 * colours, then rocks for the shield, then torches, then all of it with a
 * third pod. A throw is `at` beats after the clutch is hung, `offset` columns
 * from the middle. The rings grow with the clutch, because the pair has more
 * to answer around each pod as they go.
 */
export const MATRON_SCRIPT: readonly MatronStep[] = [
  // The two colours, the arc's first lesson.
  {
    beats: 24,
    pods: [-3, 3],
    throws: [
      { at: 2, offset: -1, what: "red" },
      { at: 5, offset: 1, what: "cyan" },
      { at: 9, offset: 4, what: "red" },
      { at: 13, offset: -4, what: "cyan" },
      { at: 17, offset: 0, what: "red" },
    ],
  },
  // Rocks for the shield; a rock in a pod's column stops the shot at it.
  {
    beats: 24,
    pods: [-4, 2],
    throws: [
      { at: 2, offset: 0, what: "rock" },
      { at: 5, offset: -2, what: "red" },
      { at: 8, offset: 3, what: "rock" },
      { at: 12, offset: -1, what: "cyan" },
      { at: 16, offset: -3, what: "rock" },
    ],
  },
  // Torches, the fastest thing the arc taught.
  {
    beats: 28,
    pods: [-1, 3],
    throws: [
      { at: 3, offset: -4, what: "torch" },
      { at: 6, offset: 2, what: "red" },
      { at: 11, offset: 1, what: "torch" },
      { at: 15, offset: -3, what: "cyan" },
    ],
  },
  // Everything at once, and a third pod.
  {
    beats: 32,
    pods: [-4, 0, 4],
    throws: [
      { at: 1, offset: -2, what: "red" },
      { at: 3, offset: 2, what: "rock" },
      { at: 6, offset: 0, what: "cyan" },
      { at: 9, offset: -3, what: "torch" },
      { at: 12, offset: 3, what: "red" },
      { at: 15, offset: -1, what: "rock" },
      { at: 18, offset: 4, what: "cyan" },
      { at: 22, offset: 1, what: "torch" },
    ],
  },
];
