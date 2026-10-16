/**
 * How the lit siren is drawn — the record VERSUS can offer a second answer
 * through (`siren:look`, opened 16 October 2026, when the owner asked for
 * alternatives for the siren in both of its lit states).
 *
 * The shipped answer is `siren-shine.ts`'s beams under `siren-dial.ts`'s dial,
 * and with nothing here `drawSiren` draws exactly that. `paint` replaces both
 * — the dial and the light it throws — and is handed `torch`, which is the
 * alarm at its loudest, so one answer draws a plain call and a torch on its
 * way as two states of one instrument. The chips and the words either side
 * and under it are not its business and stay where they are. The game patches
 * nothing here.
 *
 * Its own file, importing nothing, so a candidate can reach it without pulling
 * in the siren's whole import graph.
 */
export interface SirenLook {
  /** The dial and its light, round (cx, cy), or nothing for the shipped pair. */
  paint?: (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    time: number,
    torch: boolean,
  ) => void;
}

export const SIREN_LOOK: SirenLook = { paint: undefined };
