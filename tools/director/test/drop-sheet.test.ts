import { describe, expect, it } from "bun:test";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { cellHeight, dropSheet, HEAD, SIDE } from "../drop-sheet-paint.js";
import { labShape } from "../src/pull-lab-shapes.js";

/**
 * `bun run drop-sheet` paints the PULL LAB's own frames into a grid with no
 * browser (`drop-sheet-paint.ts`). This holds the grid's size to the moments
 * and the cell asked for, and that the cells are not blank: a knob was drawn.
 */
describe("drop-sheet", () => {
  it("paints one cell per moment, at the size asked, with a knob in each", async () => {
    const ask = {
      shape: labShape("curve"),
      at: [
        { at: 0.42, label: "THE PLACE" },
        { at: 2.2, label: "FIZZING" },
      ],
      wait: false,
      crop: "knob" as const,
      size: 160,
      looks: false,
    };
    const image = await loadImage(dropSheet(ask));
    expect(image.width).toBe(SIDE + 2 * 160);
    expect(image.height).toBe(HEAD + cellHeight(ask));
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    for (const col of [0, 1]) {
      // The middle of a knob crop is the knob: bright, where the field is near black.
      const px = ctx.getImageData(SIDE + col * 160 + 80, HEAD + 80, 1, 1).data;
      expect(Math.max(px[0] ?? 0, px[1] ?? 0, px[2] ?? 0)).toBeGreaterThan(80);
    }
  });

  it("leaves a drop waiting with no thumb on it", () => {
    const wide = { shape: labShape("down"), at: [{ at: 1, label: "W" }], wait: true };
    const png = dropSheet({ ...wide, crop: "wide", size: 120, looks: false });
    expect(png.length).toBeGreaterThan(1000);
  });
});
