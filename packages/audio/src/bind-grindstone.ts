import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type GrindstoneSimEvent = Extract<SimEvent, { type: `grindstone${string}` }>;

/** Whether an event is THE GRINDSTONE's, so a page of the chain can hand it over whole. */
export function isGrindstoneEvent(e: SimEvent): e is GrindstoneSimEvent {
  return e.type.startsWith("grindstone");
}

/**
 * THE GRINDSTONE's fifteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Heard where they happen**: the wheel turns over `midCol`, so every one of
 * them is in the middle.
 *
 * **A shave rises as the flat comes clean, and a clear and a hit rise as they
 * add up**, so how far the pair are along can be heard without either of them
 * looking.
 *
 * **The fade is silent by design** (§33, *Presentation*): the one quiet beat
 * on the whole wheel, and what breaks it is a grind or a chord — the jaw's
 * slip, pitched up, as the caliper jars loose.
 */
export function grindstoneCue(e: GrindstoneSimEvent, cols: number): Cue | null {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "grindstoneEnter":
      return { id: "boss.grindstoneEnter", pan };
    case "grindstoneLight":
      return { id: "boss.grindstoneLight", pan };
    case "grindstoneShave":
      // Grit in thousandths of a solid flat: the less of it left, the higher the rasp.
      return { id: "boss.grindstoneShave", pan, pitch: 1 + (1000 - e.gritMilli) / 4000 };
    case "grindstoneClear":
      return { id: "boss.grindstoneClear", pan, pitch: 1 + Math.max(0, e.passes - 1) * 0.06 };
    case "grindstoneRegrit":
      return { id: "boss.grindstoneRegrit", pan };
    case "grindstoneBite":
      return { id: "boss.grindstoneBite", pan };
    case "grindstoneSlip":
      return { id: "boss.grindstoneSlip", pan };
    case "grindstoneClamp":
      return { id: "boss.grindstoneClamp", pan };
    case "grindstoneLoose":
      return { id: "boss.grindstoneLoose", pan };
    case "grindstoneHit":
      return { id: "boss.grindstoneHit", pan, pitch: 1 + Math.max(0, e.hits - 1) * 0.08 };
    case "grindstoneMiss":
      return { id: "boss.grindstoneMiss", pan };
    case "grindstoneFade":
      return null;
    case "grindstoneJar":
      return { id: "boss.grindstoneSlip", pan, pitch: 1.25 };
    case "grindstoneFree":
      return { id: "boss.grindstoneFree", pan };
    case "grindstoneOut":
      return { id: "boss.grindstoneOut", pan };
  }
}
