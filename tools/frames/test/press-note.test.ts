import { describe, expect, it } from "bun:test";
import { pressNote } from "../report.js";

describe("pressNote", () => {
  it("says nothing when every press was heard, or none could be asked", () => {
    expect(pressNote([])).toBeNull();
    expect(pressNote([{ tick: 600, player: 2, kind: "snakeTurn", heard: true }])).toBeNull();
    expect(pressNote([{ tick: 600, player: 2, kind: "snakeTurn", heard: null }])).toBeNull();
  });

  it("names each refused press by the tick it landed on, and counts them", () => {
    const said = pressNote([
      { tick: 400, player: 1, kind: "snakeFire", heard: false },
      { tick: 600, player: 2, kind: "snakeTurn", heard: true },
    ]);
    expect(said).toContain("1 of 2");
    expect(said).toContain("400:1:snakeFire");
    expect(said).not.toContain("snakeTurn");
  });
});
