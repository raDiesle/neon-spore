/**
 * A moved export renamed, when its name is the field it fills.
 *
 * A candidate writes its drawing as `export function paint` for a record's
 * `paint` field, which is the usual way to write one, and `pointRecord`
 * refused it every time: the field's own key is a use of the name in the
 * record file. Both adoptions of 1 October 2026 hit it and were renamed by
 * hand, to `paintWindow` and `paintGlobe`. That is the rename this does, and
 * only when it is that case — the name is the field and nothing else in the
 * record (`keyOnly`) — so a real clash is still the refusal it was.
 */

import { skipString } from "./take-function.js";

/** `paintGlobe` for the field `paint` and the candidate `globe`; `paintTwoTone` for `two-tone`. */
export function renamedFor(field: string, candidate: string): string {
  const name = candidate
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => (w[0] ?? "").toUpperCase() + w.slice(1))
    .join("");
  return `${field}${name}`;
}

/**
 * Whether `name` is in `src` only as an object key — the field's own in the
 * record's literal, or any other `name: …`. A use as a value, a shorthand,
 * an import or a declaration is a real clash and answers false.
 */
export function keyOnly(src: string, name: string): boolean {
  let uses = 0;
  let keys = 0;
  eachName(src, name, (at, code) => {
    uses++;
    if (isKey(code, at, name)) keys++;
  });
  return uses > 0 && uses === keys;
}

/** Whether `name` is a word anywhere in `src`'s code, outside strings and comments. */
export function usesName(src: string, name: string): boolean {
  let used = false;
  eachName(src, name, () => {
    used = true;
  });
  return used;
}

/**
 * `src` with the bare identifier `from` renamed `to` — in code only, never in
 * a string or a comment, never as a member (`x.paint`) and never as a key
 * (`paint: …`). A shorthand `{ paint }` in an object literal would change
 * the key with it, so it is written out as `paint: paintGlobe`; one in an
 * import or export list is a binding and is renamed.
 */
export function renameIdent(src: string, from: string, to: string): string {
  const cuts: [number, string][] = [];
  eachName(src, from, (at, code) => {
    if (code[at - 1] === "." || isKey(code, at, from)) return;
    const before = code.slice(0, at);
    const shorthand = /^\s*[,}]/.test(code.slice(at + from.length)) && /[{,]\s*$/.test(before);
    const list = /\b(import|export)\s*(type\s*)?\{[^}]*$/.test(before);
    cuts.push([at, shorthand && !list ? `${from}: ${to}` : to]);
  });
  let out = src;
  for (const [at, text] of cuts.reverse()) {
    out = out.slice(0, at) + text + out.slice(at + from.length);
  }
  return out;
}

/** Whether the name at `at` is a key: after a `{` or a `,`, and before a `:`. */
function isKey(code: string, at: number, name: string): boolean {
  return /^\s*:/.test(code.slice(at + name.length)) && /[{,]\s*$/.test(code.slice(0, at));
}

/** Calls `hit` with the index of every whole-word `name` outside strings and
 * comments, and the source with those blanked, so the neighbours it reads are code. */
function eachName(src: string, name: string, hit: (at: number, code: string) => void): void {
  const code = blanked(src);
  const re = new RegExp(`(?<![\\w$])${name.replace(/\$/g, "\\$")}(?![\\w$])`, "g");
  for (let m = re.exec(code); m; m = re.exec(code)) hit(m.index, code);
}

/** The source with the inside of every string and comment turned to spaces, at the same length. */
function blanked(src: string): string {
  const out = src.split("");
  const blank = (from: number, to: number): void => {
    for (let k = from; k < to && k < out.length; k++) if (out[k] !== "\n") out[k] = " ";
  };
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      const end = skipString(src, i);
      blank(i + 1, end);
      i = end;
    } else if (c === "/" && src[i + 1] === "/") {
      const end = src.indexOf("\n", i);
      const stop = end < 0 ? src.length : end;
      blank(i, stop);
      i = stop;
    } else if (c === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i) + 2;
      blank(i, end);
      i = end - 1;
    }
  }
  return out.join("");
}
