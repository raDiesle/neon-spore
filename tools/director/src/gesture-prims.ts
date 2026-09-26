/**
 * What a GESTURES figure is drawn in: the viewBox, the primitives and the
 * director's own colours as literals — an SVG attribute cannot read a CSS
 * variable. Its own file so the phone half and the timeline half can share it
 * without importing each other.
 */

export const VIEW_W = 320;
export const VIEW_H = 170;

export type Prim =
  | {
      t: "rect";
      x: number;
      y: number;
      w: number;
      h: number;
      rx?: number;
      fill: string;
      stroke?: string;
      dash?: boolean;
      op?: number;
      tf?: string;
    }
  | {
      t: "circle";
      cx: number;
      cy: number;
      r: number;
      fill: string;
      stroke?: string;
      sw?: number;
      op?: number;
      dash?: boolean;
      tf?: string;
    }
  | {
      t: "line";
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stroke: string;
      sw?: number;
      dash?: boolean;
      op?: number;
      tf?: string;
    }
  | {
      t: "path";
      d: string;
      stroke: string;
      fill?: string;
      sw?: number;
      dash?: boolean;
      op?: number;
      tf?: string;
    }
  | {
      t: "text";
      x: number;
      y: number;
      text: string;
      fill: string;
      size: number;
      anchor?: "start" | "middle" | "end";
      tf?: string;
    };

export const INK = {
  bg: "#07060f",
  panel: "#0e0a22",
  line: "#241b4f",
  ink: "#f2e9dc",
  dim: "#7a6fa8",
  gold: "#ffc24b",
  cyan: "#2fe0f0",
  red: "#ff5470",
  blue: "#5b8cff",
  green: "#3ddc84",
} as const;
