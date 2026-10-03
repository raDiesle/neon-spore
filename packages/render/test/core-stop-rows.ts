import type { BoltStops } from "../src/bolt-stop.js";
import { drawBurgee } from "../src/burgee-draw.js";
import { BurgeeFx } from "../src/burgee-fx.js";
import { drawCapstan } from "../src/capstan-draw.js";
import { CapstanFx } from "../src/capstan-fx.js";
import { drawDavit } from "../src/davit-draw.js";
import { DavitVerdicts } from "../src/davit-verdicts.js";
import { drawFlue } from "../src/flue-draw.js";
import { FlueFx } from "../src/flue-fx.js";
import { drawGall } from "../src/gall-draw.js";
import { GallFx } from "../src/gall-fx.js";
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
import * as burgee from "./burgee-harness.js";
import { stubCanvas } from "./canvas-stub.js";
import * as capstan from "./capstan-harness.js";
import * as davit from "./davit-harness.js";
import * as flue from "./flue-harness.js";
import * as gall from "./gall-harness.js";
import * as governor from "./governor-harness.js";
import * as grindstone from "./grindstone-harness.js";
import * as halter from "./halter-harness.js";
import * as keel from "./keel-harness.js";
import * as plumb from "./plumb-harness.js";
import * as rime from "./rime-harness.js";
import * as scuttle from "./scuttle-harness.js";
import * as sling from "./sling-harness.js";

/**
 * The rows of `core-stop.test.ts`: every boss whose shot is a core over the
 * middle column, stood and drawn through its own drawer with the bolts'
 * stops, its core open on a cyan fire step or shut.
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
    name: "THE FLUE",
    draw(stops, l, open) {
      const world = flue.stood();
      const s = flue.posed(world, open ? flue.FIRE : flue.DAMPER, 0, (f) => {
        f.bared = open;
        f.vents = 2;
      });
      drawFlue(paper(), l, world, s, world.beat, 0.5, 0, new FlueFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE GOVERNOR",
    draw(stops, l, open) {
      const world = governor.stood();
      const s = governor.posed(world, open ? governor.FIRE : governor.TAP, 0, (g) => {
        g.hubLit = open;
      });
      drawGovernor(paper(), l, world, s, world.beat, 0.5, 0, new GovernorFx(), stops);
    },
    wide: true,
  },
  {
    name: "THE BURGEE",
    draw(stops, l, open) {
      const world = burgee.stood();
      const s = burgee.posed(world, open ? burgee.FIRE : burgee.CATCH, 0, (b) => {
        b.spindleLit = open;
      });
      drawBurgee(paper(), l, world, s, world.beat, 0.5, 0, new BurgeeFx(), stops);
    },
    wide: false,
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
    name: "THE DAVIT",
    draw(stops, l, open) {
      const world = davit.stood();
      const s = davit.posed(world, davit.FIRE, 0, (d) => {
        d.pivotLit = open;
      });
      drawDavit(paper(), l, world, s, world.beat, 0.5, 0, new DavitVerdicts(), stops);
    },
    wide: false,
  },
  {
    name: "THE GALL",
    draw(stops, l, open) {
      const world = gall.stood();
      const s = gall.posed(world, gall.FIRE);
      s.bared = open;
      drawGall(paper(), l, world, s, world.beat, 0.5, 0, new GallFx(), stops);
    },
    wide: true,
    spans: true,
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
];
