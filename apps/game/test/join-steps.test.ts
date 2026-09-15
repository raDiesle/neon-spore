import { describe, expect, test } from "bun:test";
import { type LinkStatus, SOLO_STATUS } from "@neon-spore/net";
import {
  type JoinMode,
  type JoinStep,
  joinStep,
  stepBack,
  stepLede,
  stepTitle,
} from "../src/join-steps.js";

const html = await Bun.file(Bun.fileURLToPath(new URL("../index.html", import.meta.url))).text();
const join = await Bun.file(Bun.fileURLToPath(new URL("../src/join.ts", import.meta.url))).text();
const shell = await Bun.file(Bun.fileURLToPath(new URL("../src/shell.ts", import.meta.url))).text();

/**
 * The room screen walked one step at a time.
 *
 * Two people meeting for the first time read this screen to each other down a
 * voice call, and it used to be the whole workflow at once — a name, a code, a
 * code box, two seats, JOIN, CREATE ROOM, START, SEND LINK, WHAT THIS IS. The
 * rule that made it four pages is pure and is here; the sheet it paints onto is
 * `join-step-view.ts`, which is a DOM binding and has no test of its own.
 */

const at = (over: Partial<LinkStatus>): LinkStatus => ({ ...SOLO_STATUS, ...over });

/** A room this device opened, still alone in it. */
const alone = at({ state: "waiting", room: "ACDE", peers: 1 });
/** The same room once the other phone has arrived. */
const both = at({ state: "ready", room: "ACDE", player: 1, peers: 2 });

const STEPS: JoinStep[] = ["pick", "name", "code", "room"];
const MODES: JoinMode[] = ["join", "create"];

describe("which step", () => {
  test("starts at the choice between joining and creating", () => {
    expect(joinStep("", true, SOLO_STATUS)).toBe("pick");
    // Even mid-room: a mode is what a press sets, and nothing else reaches here.
    expect(joinStep("", true, both)).toBe("pick");
  });

  test("asks an unnamed device for a name before anything else it could do", () => {
    // The device that reaches this field walked in on a link and never passed
    // the menu, so it is asked over the top of a room it is already in.
    for (const mode of MODES) {
      expect(joinStep(mode, false, SOLO_STATUS), mode).toBe("name");
      expect(joinStep(mode, false, both), mode).toBe("name");
    }
  });

  test("puts a joiner on the code field until they commit one", () => {
    expect(joinStep("join", true, SOLO_STATUS)).toBe("code");
    // Whatever the room answers — a seat, or that it is full — is step 4's to
    // say, because that is where the words for it are.
    expect(joinStep("join", true, at({ state: "connecting", room: "ACDE" }))).toBe("room");
    expect(joinStep("join", true, at({ state: "full", room: "ACDE", peers: 2 }))).toBe("room");
  });

  test("holds a creator on the code until the other phone arrives", () => {
    // The creator's step 3 is the code held up to be read down a phone line,
    // and the only way this device knows it has been read is the second seat.
    expect(joinStep("create", true, alone)).toBe("code");
    expect(joinStep("create", true, both)).toBe("room");
  });
});

describe("what a step says", () => {
  test("every step has a heading and all four differ", () => {
    for (const mode of MODES) {
      const said = STEPS.map((step) => stepTitle(step, mode));
      for (const title of said) expect(title.length, `${mode}`).toBeGreaterThan(2);
      expect(new Set(said).size, `${mode}`).toBe(said.length);
    }
  });

  test("tells a creator to read the code out, and down a voice call", () => {
    // The two sentences the whole meeting turns on, written at the person
    // holding the phone rather than about the system.
    const said = stepLede("code", "create", alone);
    expect(said).toContain("voice call");
    expect(said).toContain("read this out");
  });

  test("tells a joiner the code is one they were told, not one they were sent", () => {
    const said = stepLede("code", "join", SOLO_STATUS);
    expect(said).toContain("Type in the code you were told");
    expect(said).not.toBe(stepLede("code", "create", alone));
  });

  test("says the wait on the room step, and nothing once both are there", () => {
    expect(stepLede("room", "join", at({ state: "connecting", room: "ACDE" }))).toContain(
      "Waiting",
    );
    // The room's own sentence (`join-words.ts`'s `explain`) takes over there.
    expect(stepLede("room", "join", both)).toBe("");
  });
});

describe("the way back off a step", () => {
  test("is the menu from the first step and nowhere else", () => {
    expect(stepBack("pick", SOLO_STATUS)).toBe("menu");
    expect(stepBack("code", SOLO_STATUS)).toBe("back");
    expect(stepBack("name", SOLO_STATUS)).toBe("back");
  });

  test("is LEAVE ROOM, with its confirm, for every step that holds a room", () => {
    // Backing out of a room hangs up on the other player, so it can never be
    // the quiet arrow the stepless steps get.
    for (const step of STEPS) expect(stepBack(step, both), step).toBe("leave");
    expect(stepBack("code", alone)).toBe("leave");
  });
});

describe("what came off the screen", () => {
  test("SEND LINK and WHAT THIS IS are gone, markup and binding both", () => {
    // Both were a second way to do something the voice call already does, on
    // the one screen that has to stay short enough to read aloud.
    for (const id of ["joinShare", "joinWhat"]) {
      expect(html, id).not.toContain(id);
      expect(join, id).not.toContain(id);
      expect(shell, id).not.toContain(id);
    }
    expect(join).not.toContain("shareRoom");
  });

  test("but a link into a room still opens one, for a link sent yesterday", () => {
    expect(join).toContain("roomRequested");
  });

  test("and every step the rule can name has a block to be painted into", () => {
    for (const id of ["joinPick", "joinStepName", "joinStepCode", "joinStepRoom"]) {
      expect(html, id).toContain(`id="${id}"`);
    }
  });
});
