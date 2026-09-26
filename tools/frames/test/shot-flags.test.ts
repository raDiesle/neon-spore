import { describe, expect, it } from "bun:test";
import { WAVES } from "@neon-spore/content";
import { portIn } from "../director-serve.js";
import { readShotFlags } from "../shot-flags.js";

/**
 * The half of `bun run shot` that needs no browser and no server: what a
 * command line asked for, and the one line a started director has to print
 * before anything can be photographed off it.
 *
 * Both are silent failures otherwise. A flag read wrong photographs a real
 * page in the wrong state — a picture that proves the wrong thing
 * convincingly — and a startup line that stops matching hangs for a minute and
 * then says the director never started, which is true and useless.
 */

const shot = (...args: string[]): ReturnType<typeof readShotFlags> =>
  readShotFlags(["#stage", "out.png", ...args]);

describe("readShotFlags", () => {
  it("takes the element and the file off the front, before any flag", () => {
    const flags = shot();
    expect(flags.selector).toBe("#stage");
    expect(flags.out).toBe("out.png");
  });

  /** The defaults are the director at a desk: its own port, its own size. */
  it("stands at the director's own port and viewport with nothing said", () => {
    const flags = shot();
    expect(flags.port).toBe("4174");
    expect(flags.path).toBe("");
    expect(flags.viewport).toEqual({ width: 1240, height: 900 });
    expect(flags.scale).toBe(2);
    expect(flags.serve).toBe(false);
    expect(flags.at).toBeNull();
  });

  it("reads a viewport as WxH, for something a phone shows", () => {
    expect(shot("--size", "390x844").viewport).toEqual({ width: 390, height: 844 });
  });

  /**
   * `--serve` is a switch and not a value: it takes no argument, so an
   * `indexOf` that read the next word would have swallowed whatever flag came
   * after it.
   */
  it("reads --serve as a switch, and leaves the flag after it alone", () => {
    const flags = shot("--serve", "--scale", "6");
    expect(flags.serve).toBe(true);
    expect(flags.scale).toBe(6);
  });

  it("gathers the presses, fills and holds into one reach", () => {
    const flags = shot(
      "--open",
      "▣ DOCUMENTATION",
      "--inner",
      "WORDINGS",
      "--click",
      ".cell",
      "--nth",
      "4",
      "--hold",
      "Control",
    );
    expect(flags.reach).toMatchObject({
      open: "▣ DOCUMENTATION",
      inner: "WORDINGS",
      click: ".cell",
      nth: 4,
      hold: "Control",
    });
  });

  /**
   * The director's `?wave=` is an index into `WAVES`, and a name is what a
   * caller knows — the filter route reached the first row instead.
   */
  it("opens the director on a wave named by name, id or the HUD's number", () => {
    const at = WAVES.findIndex((w) => w.name === "THE REPRISE");
    expect(shot("--wave", "THE REPRISE").path).toBe(`/?wave=${at}`);
    expect(shot("--wave", "theReprise").path).toBe(`/?wave=${at}`);
    expect(shot("--wave", String(at + 1)).path).toBe(`/?wave=${at}`);
  });

  it("refuses a wave that matches nothing, and a --path beside a --wave", () => {
    expect(() => shot("--wave", "THE NOTHING")).toThrow("no wave with that name");
    expect(() => shot("--wave", "THE REPRISE", "--path", "/?play=1")).toThrow("--path");
  });

  it("reads a crop in the element's own pixels", () => {
    expect(shot("--at", "120,400,150,150").at).toEqual({
      x: 120,
      y: 400,
      width: 150,
      height: 150,
    });
  });
});

describe("portIn", () => {
  it("reads the port off the supervisor's own startup line", () => {
    expect(portIn("director (hot) on http://localhost:40225\n")).toBe("40225");
  });

  it("answers null while the line has not been printed yet", () => {
    expect(portIn("")).toBeNull();
    expect(portIn("$ bun run dev:once\nstarting…\n")).toBeNull();
  });
});
