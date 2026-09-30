import type { SimEvent } from "@neon-spore/sim";
import { type Cue, panForCol } from "./bind.js";

type HaspSimEvent = Extract<SimEvent, { type: `hasp${string}` }>;

/** Whether an event is THE HASP's, so a page of the chain can hand it over whole. */
export function isHaspEvent(e: SimEvent): e is HaspSimEvent {
  return e.type.startsWith("hasp");
}

/**
 * THE HASP's twenty-six, in a file of their own for `bind-gorge.ts`' reason.
 *
 * **Everything in this fight comes from the middle**, and that is the point
 * rather than a shortcut: the door stands over `midCol` and both hands are on
 * it — the latch under one thumb and the wheel under the other — so there is
 * no side for a cue to come from and nothing either seat could locate by ear.
 * What the ear is given instead is *which accident happened*: the burn and the
 * seize land on the same beat, from the same place, and they are two entirely
 * different sounds, because they are what the two seats have to say to each
 * other (`sim/hasp-step.ts`).
 *
 * **The open is pitched up per hasp**, so how far through the door is can be
 * heard rather than counted — the three clasps are drawn on it, but by the
 * last one the pilot is watching his own heat and nothing else.
 *
 * **The story between the hasps mostly borrows the door's own voice**
 * (`sim/hasp-story.ts`): ten of its twelve are sounds this fight already
 * makes, pitched so they are heard as the same door answering rather than a
 * new one arriving — the sway opens on the latch lighting, the backspin on the
 * rim coming free, and every state run out is the bolt's blow at the hull,
 * lower the later it comes. Those borrowings say the right thing: a lit clasp,
 * a rim spinning, a blow landed. **The rattle and the rust have their own**
 * (`sounds/boss-hasp-story.ts`): the rattle borrowed one knock, which said *a
 * clasp is ready* rather than *a door shaking*, and the rust borrowed the
 * seize, which tells her to let go where the rust asks her to rock.
 */
export function haspCue(e: HaspSimEvent, cols: number): Cue {
  const pan = panForCol(e.col, cols);
  switch (e.type) {
    case "haspEnter":
      return { id: "boss.haspEnter", pan };
    case "haspLit":
      return { id: "boss.haspLit", pan };
    case "haspGrip":
      return { id: "boss.haspGrip", pan };
    case "haspLet":
      return { id: "boss.haspLet", pan };
    case "haspBurn":
      return { id: "boss.haspBurn", pan };
    case "haspCool":
      return { id: "boss.haspCool", pan };
    case "haspSeize":
      return { id: "boss.haspSeize", pan };
    case "haspFree":
      return { id: "boss.haspFree", pan };
    case "haspOpen":
      // Higher as the clasps go: two left is the lowest, the last the highest.
      return { id: "boss.haspOpen", pan, pitch: 1 + Math.max(0, 2 - e.hasps) * 0.08 };
    case "haspBolt":
      return { id: "boss.haspBolt", pan };
    case "haspBoltOut":
      return { id: "boss.haspBoltOut", pan };
    case "haspBoltHit":
      return { id: "boss.haspBoltHit", pan };
    case "haspClear":
      return { id: "boss.haspClear", pan };
    case "haspOut":
      return { id: "boss.haspOut", pan };
    case "haspRattle":
      return { id: "boss.haspRattle", pan };
    case "haspHush":
      return { id: "boss.haspCool", pan, pitch: 0.9 };
    case "haspSlam":
      return { id: "boss.haspBoltHit", pan, pitch: 0.9 };
    case "haspBackspin":
      return { id: "boss.haspFree", pan, pitch: 0.7 };
    case "haspCatch":
      return { id: "boss.haspGrip", pan, pitch: 1.2 };
    case "haspSpoke":
      return { id: "boss.haspBoltHit", pan, pitch: 0.8 };
    case "haspRust":
      return { id: "boss.haspRust", pan };
    case "haspCrack":
      return { id: "boss.haspOpen", pan, pitch: 0.8 };
    case "haspBurst":
      return { id: "boss.haspBoltHit", pan, pitch: 0.7 };
    case "haspSway":
      return { id: "boss.haspLit", pan, pitch: 0.6 };
    case "haspSteady":
      return { id: "boss.haspGrip", pan, pitch: 0.8 };
    case "haspRough":
      return { id: "boss.haspBoltHit", pan, pitch: 0.6 };
  }
}
