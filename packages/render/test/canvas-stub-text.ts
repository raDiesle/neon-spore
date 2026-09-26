import { fail, nums } from "./canvas-stub-check.js";
import { StubState } from "./canvas-stub-state.js";

/** Where one `fillText` landed: its top-left corner and its size. */
export interface TextBox {
  text: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * **Where the words land**: `measureText`, the two text calls, and the boxes
 * `texts` collects when a test asks — the text-box recording, cut out of
 * `canvas-stub.ts` on 26 September 2026 when THE THROAT's lane gave it the
 * first `strokeText` in `render/` and the file was 692 lines.
 */
export class StubText extends StubState {
  /**
   * Every word drawn, as the box it occupies, when a test asks for it. Unset
   * by default; assign an array to start collecting. The box is the glyphs'
   * own — the baseline `fillText` was given, an ascent of eight tenths of the
   * font's size above it, and the width `measureText` answers, all put through
   * the context's own transform — so two texts that overlap here overlap on
   * the phone.
   */
  texts?: TextBox[];

  /**
   * Six tenths of the font's size per character — Courier's advance, and the
   * game sets nothing else. It used to answer six pixels a character whatever
   * the font said, which made every plate sized off a measurement about half
   * as wide as the real one; a test asking whether two boxes overlap was
   * answering for a picture the phone never draws.
   */
  measureText(text: string): { width: number } {
    const px = /(\d+(?:\.\d+)?)px/.exec(this.font);
    return { width: text.length * 0.6 * (px ? Number(px[1]) : 10) };
  }

  // A rim under letters, always followed by the `fillText` that records the
  // box, so it is counted and checked and never recorded a second time.
  strokeText(text: string, x: number, y: number): void {
    nums("strokeText", [x, y]);
    if (/NaN|undefined/.test(text)) fail("strokeText", `text reads "${text}"`);
    this.calls++;
    this.mark("strokeText", undefined, [x, y]);
  }
  fillText(text: string, x: number, y: number): void {
    nums("fillText", [x, y]);
    if (/NaN|undefined/.test(text)) fail("fillText", `text reads "${text}"`);
    this.calls++;
    this.mark("fillText", undefined, [x, y]);
    if (this.texts) {
      const width = this.measureText(text).width;
      const px = /(\d+(?:\.\d+)?)px/.exec(this.font);
      const size = px ? Number(px[1]) : 10;
      const left =
        this.textAlign === "center" ? x - width / 2 : this.textAlign === "right" ? x - width : x;
      // Through the transform, so the box is where the word lands rather than
      // where the caller counted from (`m` above).
      const [a0, b0, c0, d0] = this.m;
      const sx = Math.hypot(a0, b0);
      const sy = Math.hypot(c0, d0);
      const p = this.at(left, y - size * 0.8);
      this.texts.push({ text, x: p.x, y: p.y, w: width * sx, h: size * sy });
    }
  }
}
