import { coreRowMilli, midCol } from "@neon-spore/sim";
import type { HelperDef } from "./helpers-def.js";
import { BASTION_PORT, CHRYSALIS_HEART, HYDRA_MAW } from "./helpers-poses-cores.js";

/**
 * ONE BOSS'S OWN, page three: the bosses `view-role-clocks-c.ts` splits,
 * THE BASTION to THE GOVERNOR. Out of `helpers-bosses-b.ts` on line count,
 * in the same shape.
 */
/** Under THE HYDRA's body, where its maws hang: the core's own cut is the body alone. */
const UNDER_THE_HYDRA: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) - 0.5, row: coreRowMilli("hydra") / 1000 + 1.5 }),
  span: 5,
};

export const CLOCK_C_ROWS: HelperDef[] = [
  {
    name: "THE BASTION'S PORT",
    where: "on the core, once the last shell is lit",
    seat: "P2 only — the open port and the shut ones still to come; a port shot is a crater on both",
    says:
      "There, on the left. The pilot's hand is on the cannon and he cannot see the " +
      "port, so he slides it on the navigator's word.",
    source: "bastion-draw.ts, bastion-hull.ts",
    pose: BASTION_PORT,
    role: "p2",
    lookAt: "the open port on the core and the two shut ones",
  },
  {
    name: "THE CHRYSALIS'S HEART",
    where: "on the last skin, the pore open over the heart's column",
    seat: "P1 only — the pore and the colour the heart beats in; a pore shot is a scar on both",
    says:
      "Under here, and red. THE BASTION's port turned round: the pilot slides the " +
      "cannon under it and says the colour for the navigator to fire.",
    source: "chrysalis-draw.ts",
    pose: CHRYSALIS_HEART,
    role: "p1",
    lookAt: "the open pore and the colour beating in it",
  },
  {
    name: "THE HYDRA'S MAW AND FIRE",
    where: "on the maws of the last level",
    seat: "P2: which maw is open, jaws gaping and white heat in it — P1: the fire's colour up its throat",
    says:
      "Crossed: the navigator says where, the pilot says which colour, and each " +
      "holds the other's word. A maw quenched is a stump on both.",
    source: "hydra-draw.ts, hydra-heads.ts",
    pose: HYDRA_MAW,
    role: "p2",
    zoom: UNDER_THE_HYDRA,
    lookAt: "the one maw gaping with white heat in it",
  },
  {
    name: "THE FLUE'S EMBER",
    where: "running along the flue toward the sight",
    seat: "P1 only — on every other level the panels trade, and it is on P2's phone",
    says:
      "Now. The navigator has the trigger and cannot see the ember, so the pilot " +
      "has to call the shot. The sight, the shots left and the levels are on both.",
    source: "flue-draw.ts",
    pose: "THE FLUE · LIT",
    role: "p1",
    lookAt: "the ember in the flue's gullet",
  },
  {
    name: "THE GALL'S PINCH",
    where: "the chevrons either side of the gall on the seam",
    seat: "the seat whose half the gall sits on: full — the other: faint",
    says:
      "You, or not you, look. Both screens see the seam and the gall wherever it " +
      "jumps; each is shown its own pinch lit, so the other has to say where it went.",
    source: "gall-points.ts",
    pose: "GALL · TAPS ON THE LEFT END",
    role: "p1",
    lookAt: "the gall lit and ringed at the left end, the seam's other scars plain",
  },
  {
    name: "THE GIMBAL'S RINGS",
    where: "round the drum in its yoke",
    seat: "P1: the outer ring, its rim and teeth — P2: the inner — and each the other's mark",
    says:
      "Round to the right, a quarter, and it means two different turns in the two " +
      "seats. Neither sees the other's ring, so a ring is talked onto its mark.",
    source: "gimbal-draw.ts, gimbal-partner.ts",
    pose: "GIMBAL · THE OUTER RING UNDER A THUMB",
    role: "p1",
    lookAt: "the outer ring alone round the drum, and the mark on it",
  },
  {
    name: "THE GOVERNOR'S MARKS",
    where: "on the governor, beside the needle both seats read",
    seat: "each mark full to the seat that taps it, faint to the other",
    says: "Yours, and your partner's: each sees the other's mark without being handed it.",
    source: "governor-draw.ts",
    pose: "GOVERNOR · BOTH MARKS LIT",
    role: "p1",
    lookAt: "the full red mark P1 taps, and the faint one with a clock across the wheel",
  },
];
