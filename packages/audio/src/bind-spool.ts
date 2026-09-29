import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type SpoolSimEvent = Extract<SimEvent, { type: `spool${string}` }>;

/** Whether an event is THE SPOOL's, so a page of the chain can hand it over whole. */
export function isSpoolEvent(e: SimEvent): e is SpoolSimEvent {
  return e.type.startsWith("spool");
}

/**
 * THE SPOOL's twenty-one, in a file of their own so the page that routes them
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
 *
 * **The story's nine borrow the spool's own twelve**, pitched down (§21 rows
 * S1–S3): each state opens on the slip's jerk, is answered on a sound the
 * line already makes when it runs right, and runs out on the rock's — the
 * hull hit itself is the breach's own heavy sound on top.
 */
export function spoolCue(e: SpoolSimEvent, cols: number): Cue {
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
    // THE INSTAR's own knock, *not yours*: a refused thumb sounds the same on
    // every boss, as its mark looks the same (`render/mark-feedback.ts`).
    case "spoolRefuse":
      return { id: "boss.instarRefuse", pan };
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
    case "spoolSnag":
      return { id: "boss.spoolSlip", pan, pitch: 0.8 };
    case "spoolFree":
      return { id: "boss.spoolLet", pan, pitch: 0.9 };
    case "spoolSnap":
      return { id: "boss.spoolRock", pan, pitch: 0.8 };
    case "spoolWhip":
      return { id: "boss.spoolSlip", pan, pitch: 0.7 };
    case "spoolDamp":
      return { id: "boss.spoolGrip", pan, pitch: 0.85 };
    case "spoolLash":
      return { id: "boss.spoolRock", pan, pitch: 0.7 };
    case "spoolFray":
      return { id: "boss.spoolLeg", pan, pitch: 0.8 };
    case "spoolFeather":
      return { id: "boss.spoolRib", pan, pitch: 0.9 };
    case "spoolStrand":
      return { id: "boss.spoolRock", pan, pitch: 0.9 };
  }
}
