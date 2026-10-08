import type { BoltStops } from "../src/bolt-stop.js";
import { drawCapstan } from "../src/capstan-draw.js";
import { CapstanFx } from "../src/capstan-fx.js";
import { drawGovernor } from "../src/governor-draw.js";
import { GovernorFx } from "../src/governor-fx.js";
import { drawGrindstone } from "../src/grindstone-draw.js";
import { GrindstoneFx } from "../src/grindstone-fx.js";
import { GripVerdicts } from "../src/grip-verdict.js";
import { drawHalter } from "../src/halter-draw.js";
import { drawKeel } from "../src/keel-draw.js";
import { KeelFx } from "../src/keel-fx.js";
import type { Layout } from "../src/layout.js";
import { drawPlumb } from "../src/plumb-draw.js";
import { PlumbFx } from "../src/plumb-fx.js";
import { drawRime } from "../src/rime-draw.js";
import { RimeFx } from "../src/rime-fx.js";
import { drawSling } from "../src/sling-draw.js";
import { SlingFx } from "../src/sling-fx.js";
import { stubCanvas } from "./canvas-stub.js";
import * as capstan from "./capstan-harness.js";
import * as curtain from "./curtain-harness.js";
import * as governor from "./governor-harness.js";
import * as grindstone from "./grindstone-harness.js";
import * as halter from "./halter-harness.js";
import * as keel from "./keel-harness.js";
import * as plumb from "./plumb-harness.js";
import * as rime from "./rime-harness.js";
import * as scuttle from "./scuttle-harness.js";
import * as sling from "./sling-harness.js";
import * as taster from "./taster-harness.js";

/**
 * The rows of `core-stop.test.ts`: every boss whose shot is a core over the
 * middle column, stood and drawn through its own drawer with the bolts'
 * stops, its core open on a cyan fire step or shut. THE FLUE had a row until
 * its rework of 5 October 2026: it has no core now, and the simulation
 * stops every shot at its row itself (`sim/flue-shot.ts`).
 */

const paper = () => stubCanvas().ctx as unknown as CanvasRenderingContext2D;

export interface Row {
  name: string;
  /** The boss stood and drawn with `stops`, its core open on a cyan fire step or shut. */
  draw(stops: BoltStops, l: Layout, open: boolean): void;
  /**
   * Whether the body stands over the column beside the middle one while the
   * core is open; a boss hung from one point over the middle column does not.
   */
  wide: boolean;
  /** Whether the body lies edge to edge across the field, so no column goes past it. */
  spans?: boolean;
  /**
   * A step that asks for a part `offset` columns off the middle instead of
   * the core (`sim/core-verdict.ts`'s `aside`), drawn lit for a cyan bolt.
   */
  aside?: {
    offset: number;
    draw(stops: BoltStops, l: Layout): void;
    /** Nothing is drawn in that column to meet, so the bolt stops at row 0, where it is judged: a look owed. */
    unmet?: boolean;
  };
}

export const ROWS: Row[] = [
  {
    name: "THE GOVERNOR",
    draw(stops, l, open) {
      const world = governor.stood();
      const needle = open ? governor.downNeedle() : 0;
      const s = governor.posed(world, open ? governor.FIRE : governor.TAP, needle, (g) => {
        g.hubLit = open;
      });
      const clock = { beat: world.beat, beatPhase: 0.5, time: 0, lead: 0 };
      drawGovernor(paper(), l, world, s, clock, new GovernorFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE CAPSTAN",
    draw(stops, l, open) {
      const world = capstan.stood();
      const s = capstan.posed(world, capstan.FIRE, (c) => {
        c.bared = open;
      });
      drawCapstan(paper(), l, world, s, world.beat, 0.5, 0, new CapstanFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE CURTAIN",
    // The core hangs in the field's own rows; the sheet over the others is a
    // creature, which the simulation stops a bolt on, so only the core is met.
    draw(stops, l, open) {
      const world = curtain.stood(open);
      curtain.draw(world, stops, l);
    },
    wide: false,
  },
  {
    name: "THE GRINDSTONE",
    draw(stops, l, open) {
      const world = grindstone.stood();
      const s = grindstone.posed(world, grindstone.FIRE, (g) => {
        g.locked = open;
      });
      drawGrindstone(paper(), l, world, s, world.beat, 0.5, 0, new GrindstoneFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE HALTER",
    draw(stops, l, open) {
      const world = halter.stood();
      const s = halter.posed(world, halter.FIRE, (h) => {
        h.bared = open;
      });
      drawHalter(paper(), l, world, s, world.beat, 0.5, 0, new GripVerdicts(), stops);
    },
    wide: true,
  },
  {
    name: "THE KEEL",
    // The socket is the one part of the spine with a colour; the marrow and
    // the rock want either, and are `keel-stop.test.ts`'s.
    draw(stops, l, open) {
      const world = keel.stood();
      const s = keel.body(world);
      if (open) keel.socket(s, world);
      drawKeel(paper(), l, world, s, world.beat, 0.5, 0, new KeelFx(), stops);
    },
    wide: true,
    spans: true,
  },
  {
    name: "THE PLUMB",
    draw(stops, l, open) {
      const world = plumb.stood();
      const s = plumb.posed(world, plumb.FIRE, (p) => {
        p.coreLit = open;
      });
      drawPlumb(paper(), l, world, s, world.beat, 0.5, 0, new PlumbFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE RIME",
    draw(stops, l, open) {
      const world = rime.stood();
      const s = rime.posed(world, rime.FIRE, (r) => {
        r.bared = open;
      });
      drawRime(paper(), l, world, s, world.beat, 0.5, 0, new RimeFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE SCUTTLE",
    // The live part is the core, and hangs wherever its socket is: here the
    // middle column's, in cyan. Shut is nothing loose, the frame's armour.
    draw(stops, l, open) {
      const world = scuttle.stood();
      if (open) scuttle.live(world);
      scuttle.draw(world, stops, l);
    },
    wide: true,
  },
  {
    name: "THE SLING",
    draw(stops, l, open) {
      const world = sling.stood();
      const s = sling.posed(world, sling.FIRE, (g) => {
        g.yokeLit = open;
      });
      drawSling(paper(), l, world, s, world.beat, 0.5, 0, new SlingFx(), stops);
    },
    wide: false,
  },
  {
    name: "THE TASTER",
    // Every blade stands up out of the crest, so the crest's underside is
    // what a bolt meets up any column of the fan: the middle blade edged red
    // is the core, an uncoloured edge its armour.
    draw(stops, l, open) {
      const world = taster.stood(open);
      taster.draw(world, stops, l);
    },
    wide: true,
    spans: true,
  },
];
