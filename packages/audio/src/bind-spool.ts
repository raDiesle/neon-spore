import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

/**
 * THE SPOOL's eleven, in a file of their own so the page that routes them
 * stays a switch.
 *
 * **The pan says nothing about whose fault anything is, and that is on
 * purpose.** There is one spool, one line and one brake, hung over the middle
 * of the field, so almost everything here is heard in the middle; the one
 * thing that moves is the rock, which goes down the column the cannon is
 * standing in and is heard there. A fight whose whole difficulty is that
 * neither seat can see the other's half would be made easier by a stereo cue
 * that said *you* — and the design's answer to a slip is that the pair work
 * out between them whose call it was (`docs/spec/bosses.md` §11.36).
 *
 * **Two are pitched by how far through the fight it is**: the zone opening on
 * a narrower band and the rib easing. Both go up as the ribs go, so how close
 * the end is can be heard without either seat looking at the spool — and on
 * this boss neither of them is looking at it, because one is on his own thumb
 * and the other is on her own gauge.
 */
export function spoolCue(
  e: Extract<
    SimEvent,
    {
      type:
        | "spoolEnter"
        | "spoolZone"
        | "spoolLeg"
        | "spoolGrip"
        | "spoolLet"
        | "spoolSlip"
        | "spoolRock"
        | "spoolRib"
        | "spoolSlack"
        | "spoolDrift"
        | "spoolOut";
    }
  >,
  cols: number,
): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "spoolEnter":
      return { id: "boss.spoolEnter", pan };
    case "spoolZone":
      // Higher as the ribs go: four left is the lowest, the last band the highest.
      return { id: "boss.spoolZone", pan, pitch: 1 + Math.max(0, 4 - e.ribs) * 0.07 };
    case "spoolLeg":
      return { id: "boss.spoolLeg", pan };
    case "spoolGrip":
      return { id: "boss.spoolGrip", pan };
    case "spoolLet":
      return { id: "boss.spoolLet", pan };
    case "spoolSlip":
      return { id: "boss.spoolSlip", pan };
    case "spoolRock":
      return { id: "boss.spoolRock", pan };
    case "spoolRib":
      // The same reading as the zone's, one beat later and on the thing itself.
      return { id: "boss.spoolRib", pan, pitch: 1 + Math.max(0, 3 - e.ribs) * 0.07 };
    case "spoolSlack":
      return { id: "boss.spoolSlack", pan };
    case "spoolDrift":
      return { id: "boss.spoolDrift", pan };
    case "spoolOut":
      return { id: "boss.spoolOut", pan };
  }
}
