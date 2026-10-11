import { describe, expect, test } from "bun:test";
import { bindMapPause } from "../src/map-pause.js";

/** A section that keeps the one listener it is given, and a document that has it. */
function fakeDoc() {
  let heard: ((e: { target: unknown }) => void) | null = null;
  let capture = false;
  const section = {
    addEventListener: (_: string, fn: (e: { target: unknown }) => void, c: boolean) => {
      heard = fn;
      capture = c;
    },
  };
  const doc = { querySelector: () => section } as unknown as Document;
  const press = (inTransport: boolean) =>
    heard?.({
      target: { closest: (sel: string) => (inTransport && sel === ".map-transport" ? {} : null) },
    });
  return { doc, press, capture: () => capture };
}

describe("touching the map editor", () => {
  test("pauses the field, before anything under the press is heard", () => {
    const { doc, press, capture } = fakeDoc();
    let paused = 0;
    bindMapPause({ pause: () => paused++ }, doc);
    press(false);
    expect(paused).toBe(1);
    expect(capture()).toBe(true);
  });

  test("leaves the map's own ⏸ and ↺ to do what they say", () => {
    const { doc, press } = fakeDoc();
    let paused = 0;
    bindMapPause({ pause: () => paused++ }, doc);
    press(true);
    expect(paused).toBe(0);
  });
});
