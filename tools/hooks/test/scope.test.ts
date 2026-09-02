import { describe, expect, it } from "bun:test";
import { scopeFor } from "../scope.js";

describe("scopeFor", () => {
  it("sim is shared enough that a change asks for a full run", () => {
    expect(scopeFor(["packages/sim/src/step.ts"])).toEqual([]);
  });

  it("content is read by too many tools to scope narrowly", () => {
    expect(scopeFor(["packages/content/src/creatures.ts"])).toEqual([]);
  });

  it("root package.json changes what every workspace resolves against", () => {
    expect(scopeFor(["package.json"])).toEqual([]);
  });

  it("tsconfig changes what every file typechecks against", () => {
    expect(scopeFor(["tsconfig.json"])).toEqual([]);
  });

  it("biome.json is a full-run trigger, not a render-only one", () => {
    expect(scopeFor(["biome.json"])).toEqual([]);
  });

  it("bun.lock changes what every workspace resolves against", () => {
    expect(scopeFor(["bun.lock"])).toEqual([]);
  });

  it("render is walked by the director, the shape sheet, frames and versus", () => {
    expect(scopeFor(["packages/render/src/effects.ts"])).toEqual([
      "packages/render",
      "tools/director",
      "tools/frames",
      "tools/shape-sheet",
      "tools/versus",
    ]);
  });

  it("audio is only ever driven from the director's music page", () => {
    expect(scopeFor(["packages/audio/src/mix.ts"])).toEqual(["packages/audio", "tools/director"]);
  });

  it("net's wire format is shared with the game client", () => {
    expect(scopeFor(["packages/net/src/wire.ts"])).toEqual(["apps/game", "packages/net"]);
  });

  it("apps/server speaks net's protocol, so it scopes the same way", () => {
    expect(scopeFor(["apps/server/src/room.ts"])).toEqual(["apps/game", "packages/net"]);
  });

  it("apps/game drives the renderer, so a game change re-runs render too", () => {
    expect(scopeFor(["apps/game/src/loop.ts"])).toEqual(["apps/game", "packages/render"]);
  });

  it("a tool directory maps to itself, whatever its name", () => {
    expect(scopeFor(["tools/land/land.ts"])).toEqual(["tools/land"]);
  });

  it("docs/spec is read by the director's backlog, notes and parked parsers", () => {
    expect(scopeFor(["docs/spec/waves.md"])).toEqual(["tools/director"]);
  });

  it("a top-level docs/*.md file is read by the same director parsers", () => {
    expect(scopeFor(["docs/decisions.md"])).toEqual(["tools/director"]);
  });

  it(".claude/, README.md and CLAUDE.md carry no code a test reads", () => {
    expect(scopeFor([".claude/hooks/check-on-stop.sh"])).toEqual([]);
    expect(scopeFor(["README.md"])).toEqual([]);
    expect(scopeFor(["CLAUDE.md"])).toEqual([]);
  });

  it("an unmapped path contributes nothing on its own", () => {
    expect(scopeFor(["legacy/old-prototype.ts"])).toEqual([]);
  });

  it("one shared file in a mix forces a full run even alongside scoped ones", () => {
    expect(scopeFor(["packages/render/src/effects.ts", "packages/sim/src/step.ts"])).toEqual([]);
  });

  it("output is deduplicated and sorted", () => {
    expect(
      scopeFor([
        "packages/render/src/effects.ts",
        "apps/game/src/loop.ts",
        "packages/audio/src/mix.ts",
      ]),
    ).toEqual([
      "apps/game",
      "packages/audio",
      "packages/render",
      "tools/director",
      "tools/frames",
      "tools/shape-sheet",
      "tools/versus",
    ]);
  });
});
