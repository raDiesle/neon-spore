import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE KEEL's sixteen, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Everything pans to where it happens**, unlike THE MANTLE's: the whole
 * question of this boss is which half of the screen the joint sits on, so a
 * joint lighting on the left is heard on the left. The socket, the dim, the
 * rigid hold and the end come from the middle because that is where they are.
 *
 * **The lock is pitched up per joint seated**, so how far the pair are along
 * can be heard without either of them counting.
 */
export function keelCue(e: Extract<SimEvent, { type: `keel${string}` }>, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "keelEnter":
      return { id: "boss.keelEnter", pan };
    case "keelLight":
      return { id: "boss.keelLight", pan };
    case "keelLock":
      // Higher as the loose ones run out: the spine getting stiffer reads as
      // the knock rising.
      return { id: "boss.keelLock", pan, pitch: 1 + Math.max(0, 6 - e.loose) * 0.04 };
    case "keelMiss":
      return { id: "boss.keelMiss", pan };
    case "keelSlip":
      return { id: "boss.keelSlip", pan };
    case "keelSplit":
      return { id: "boss.keelSplit", pan };
    case "keelSocket":
      return { id: "boss.keelSocket", pan };
    case "keelShut":
      return { id: "boss.keelShut", pan };
    case "keelSocketHit":
      return { id: "boss.keelSocketHit", pan };
    case "keelDim":
      return { id: "boss.keelDim", pan };
    case "keelRigid":
      return { id: "boss.keelRigid", pan };
    case "keelThrow":
      return { id: "boss.keelThrow", pan };
    case "keelRockOut":
      return { id: "boss.keelRockOut", pan };
    case "keelRockHit":
      return { id: "boss.keelRockHit", pan };
    case "keelStraight":
      return { id: "boss.keelStraight", pan };
    case "keelOut":
      return { id: "boss.keelOut", pan };
  }
}
