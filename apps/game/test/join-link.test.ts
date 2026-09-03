import { describe, expect, test } from "bun:test";
import { roomRequested } from "../src/join.js";

/**
 * A link that carries a room is how the second phone gets in when the two
 * players are in two cities rather than one kitchen. It is a delivery
 * mechanism for a code and nothing more, so it must accept exactly what a
 * person could have typed into the box and refuse everything else — a link
 * that quietly rounds a wrong code into a valid one puts somebody in a
 * stranger's room.
 */
describe("roomRequested", () => {
  test("a plain game URL asks for no room", () => {
    for (const url of [
      "http://localhost:4173/",
      "http://localhost:4173/?menu=1",
      "http://localhost:4173/#room",
      "https://neon-spore.example/?relay=ws://localhost:8787",
    ]) {
      expect(roomRequested(url)).toBe("");
    }
  });

  test("a whole code is taken", () => {
    expect(roomRequested("https://neon-spore.example/?room=ACDE")).toBe("ACDE");
  });

  test("what a person would type is what it accepts", () => {
    // Lower case off a keyboard that autocapitalises nothing, and the spacing
    // somebody puts in when they copy a code out of a message by hand.
    expect(roomRequested("https://neon-spore.example/?room=acde")).toBe("ACDE");
    expect(roomRequested("https://neon-spore.example/?room=A-C%20D%20E")).toBe("ACDE");
  });

  test("half a code is no code", () => {
    // Truncated by a chat app that ate the end of the link, or typed short.
    expect(roomRequested("https://neon-spore.example/?room=ACD")).toBe("");
    expect(roomRequested("https://neon-spore.example/?room=")).toBe("");
  });

  test("characters the alphabet dropped cannot smuggle a room in", () => {
    // O, I, S, B and Z are absent so a misheard code is never a valid one.
    // Four of them are not three-quarters of a room, they are nothing.
    expect(roomRequested("https://neon-spore.example/?room=OIBZ")).toBe("");
    // And they are skipped rather than counted: A O C D E is ACDE, the code
    // the speaker meant, not "AOCD".
    expect(roomRequested("https://neon-spore.example/?room=AOCDE")).toBe("ACDE");
  });
});
