import type { World } from "@neon-spore/sim";
import type { BodiesUnder } from "../src/creature-under.js";

/**
 * What `creatureAt` asks of a field, read off a world at a phase and a seat,
 * on the flat hull — the shape every hit test of a body in a test is built
 * from, so the world's own `beat` and `cfg` are the ones a balloon's glide is
 * counted by (`glidePhase`).
 */
export function under(world: World, beatPhase: number, seat: 1 | 2): BodiesUnder {
  return {
    creatures: world.creatures,
    beatPhase,
    beat: world.beat,
    cfg: world.cfg,
    seat,
    skinY: null,
  };
}
