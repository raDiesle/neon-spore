import { lampreyBoss, midCol, mimicBoss, mimicShapeSize } from "@neon-spore/sim";
import type { HelperDef } from "./helpers-def.js";

/**
 * ONE BOSS'S OWN, page four: the rest of `view-role-clocks-c.ts`, THE HASP
 * to THE TRAPEZE, and THE GAUGE's marks (`gauge.ts`). Out of
 * `helpers-bosses-c.ts` on line count, in the same shape.
 */
/** THE HASP's first clasp and the latch's rail beside it: on the whole field the latch is a hair. */
const ON_THE_LATCH: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) + 0.8, row: 8.3 }),
  span: 5,
};

/** THE LAMPREY's head, the teeth in its mouth, and the top of its tail: on the whole field the eel is a sliver. */
const ON_THE_EEL: HelperDef["zoom"] = {
  at: (w) => {
    const l = lampreyBoss(w);
    if (l === null) return { col: midCol(w.cfg), row: 4 };
    return { col: l.col + 0.5 + (0.2 * l.tailX) / 1000, row: l.row + 0.1 + (0.2 * l.tailY) / 1000 };
  },
  span: 4,
};

/** THE MIMIC's frame round the picture the navigator paints, which is the one the pilot reads. */
const ON_THE_SIGN: HelperDef["zoom"] = {
  at: (w) => {
    const m = mimicBoss(w);
    const sign = m?.signs[1] ?? -1;
    if (m === null || sign < 0) return { col: midCol(w.cfg), row: 6 };
    const origin = m.origins[1] ?? 0;
    const { w: across, h: down } = mimicShapeSize(sign);
    const [c0, r0] = [origin % w.cfg.cols, Math.floor(origin / w.cfg.cols)];
    return { col: c0 + (across - 1) / 2, row: r0 + (down - 1) / 2 + 0.3 };
  },
  span: 5,
};

/** THE RATCHET's catch and the rack beside it, at the pawl's height (`ratchet-shape.ts`). */
const ON_THE_CATCH: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) - 0.9, row: 5.5 }),
  span: 4.5,
};

/** THE SPOOL across its barrel, the brake's rail at the end it drifts toward (`spool-shape.ts`). */
const ON_THE_SPOOL: HelperDef["zoom"] = {
  at: (w) => ({ col: midCol(w.cfg) - 0.9, row: 2.5 }),
  span: 7,
};

export const CLOCK_D_ROWS: HelperDef[] = [
  {
    name: "THE HASP'S LATCH AND WHEEL",
    where: "beside the door, and across its face",
    seat: "P1: the latch, its bar and the heat climbing it — P2: the wheel, how far it has come and whether it is free. The clasps are on both",
    says:
      "Hold it, I'm winding. The pilot never sees that there is a wheel, and the " +
      "navigator never sees the hand that makes it seize, so the gap between them " +
      "is said out loud.",
    source: "hasp-draw.ts, hasp-grip.ts",
    pose: "HASP · THE LATCH UNDER A THUMB",
    role: "p1",
    zoom: ON_THE_LATCH,
    lookAt: "the latch carried down beside the door, and no wheel turning on it",
  },
  {
    name: "THE LAMPREY'S LIT TOOTH",
    where: "the ring round the tooth the worker's hand is on",
    seat: "the worker: the ring full — the holder: faint. The eel and both knobs are on both",
    says:
      "That one's yours. The tail the holder keeps is the body the worker's tooth " +
      "is on, so each seat can say what the other is asked for.",
    source: "lamprey-draw.ts",
    pose: "LAMPREY · THE LIT TOOTH",
    role: "p2",
    zoom: ON_THE_EEL,
    lookAt: "the full ring round the lit tooth",
  },
  {
    name: "THE MIMIC'S SIGN",
    where: "the picture over the board, and the tiles painted under it",
    seat: "the seat not painting: the picture, each tile marked right or wrong — the painter: its own paint, unmarked",
    says:
      "Two along, red. THE QUEEN's two marks on their side: the screen that can see " +
      "the picture is never the hand that can paint it.",
    source: "mimic-board.ts",
    pose: "THE MIMIC · SIGN",
    role: "p1",
    zoom: ON_THE_SIGN,
    lookAt: "the picture the navigator must paint, on the pilot's screen",
  },
  {
    name: "THE RATCHET'S CATCH",
    where: "the catch's rail beside the rack",
    seat: "P2: the catch, its bar and the glow while it is set — P1: the pawl's pad. The rack and every tooth are on both",
    says:
      "Set. The pilot presses when he believes the navigator is holding, and only " +
      "ever hears it: her hold is never drawn on his screen.",
    source: "ratchet-draw.ts, ratchet-grip.ts",
    pose: "RATCHET · THE CATCH UNDER A THUMB",
    role: "p2",
    zoom: ON_THE_CATCH,
    lookAt: "the catch held down and glowing beside the rack",
  },
  {
    name: "THE SPOOL'S BRAKE AND ZONE",
    where: "the brake's rail, and the gauge beside the spool",
    seat: "P1: the brake, the knob at his depth — P2: the zone and where the line is against it. The spool and the line's speed are on both",
    says:
      "Slower — slower — hold. The pilot feels a depth and is told nothing of what " +
      "it is worth; the navigator has the zone and no brake to feel.",
    source: "spool-brake.ts, spool-draw.ts",
    pose: "SPOOL · THE BRAKE UNDER A THUMB",
    role: "p1",
    zoom: ON_THE_SPOOL,
    lookAt: "the brake's knob at its depth, and no zone drawn",
  },
  {
    name: "THE TRAPEZE'S HANDS",
    where: "on the boom: the freeze ring and the draw's track",
    seat: "each seat its own hand's mark full, the partner's faint. The boom, the flag and the spindle are on both",
    says:
      "Yours is the ring, mine the swipe. Both see the flag swing, so each times its " +
      "own hand off it and can say what the other is asked for.",
    source: "trapeze-draw.ts",
    pose: "TRAPEZE · THE LEFT ZONE OPEN",
    role: "p1",
    lookAt: "P1's own mark full on the boom, and the partner's faint",
  },
  {
    name: "THE GAUGE'S MARKS",
    where: "the wound on the band, where the needle has to be stopped",
    seat: "P2 only — P1 has the valve and the same picture without the wound",
    says:
      "I cannot see it, tell me. The pilot turns the valve on the navigator's word, " +
      "and his screen is not a different picture, only one with the wound left out.",
    source: "gauge.ts, gauge-wound.ts",
    pose: "GAUGE · THE BAND WOUND, ASKING A THUMB",
    role: "p2",
    lookAt: "the wound open on the band",
  },
];
