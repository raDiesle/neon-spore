import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { NAME_MAX } from "@neon-spore/net";
import { opensHello } from "../src/hello.js";

/**
 * When a device is asked what it is called, and what it is asked with.
 *
 * The deciding is pure, so it is tested in a runner with no DOM — the shape
 * `intro.test.ts` takes, and for the same reason: there is one rule here worth
 * holding and it does not need a browser to hold it. The screen under it is
 * read out of the source, which is what `intro.test.ts` and `input-pc.test.ts`
 * both do with wiring nothing here can drive.
 */

const source = readFileSync(new URL("../src/hello.ts", import.meta.url), "utf8");
const shell = readFileSync(new URL("../src/shell.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../src/menu.css", import.meta.url), "utf8");
const gameCss = readFileSync(new URL("../src/game.css", import.meta.url), "utf8");

describe("when the first meeting opens", () => {
  it("opens on a device that has never given a name", () => {
    expect(opensHello("", true)).toBe(true);
  });

  it("never opens on a device that has one", () => {
    // The whole rule, in the owner's words: *a device that has one never sees
    // the screen.* Changing a name is SETTINGS' business, not a screen that
    // stands in front of the menu.
    expect(opensHello("DAVID", true)).toBe(false);
  });

  it("never opens where the menu itself would not", () => {
    // `?play=1` is the tester's door and what `tools/frames` photographs
    // through. A name field in front of either is a press neither asked for —
    // the intro's own argument (`intro.ts`).
    expect(opensHello("", false)).toBe(false);
    expect(opensHello("DAVID", false)).toBe(false);
  });
});

describe("the way it is wired", () => {
  it("stands between the intro and the menu, and hands the menu on", () => {
    expect(shell).toContain("const onward = (): void => openHello(hold, () => menu?.open());");
    expect(shell).toMatch(/p\.intro\.open\(onward\)/);
    // And on a visit with no intro to play, the same door: a device that has
    // seen the scene and has no name is still asked for one.
    expect(shell).toMatch(/else onward\(\);/);
  });

  it("lets a device with a name straight through rather than flashing a screen", () => {
    // The check is the first thing in the function and the caller is handed on
    // from inside it, so every path out of `openHello` ends somewhere.
    const opening = source.slice(source.indexOf("export function openHello"));
    expect(opening.indexOf("after();")).toBeLessThan(opening.indexOf("document.body.append"));
    expect(opening).toMatch(/if \(!opensHello\(readName\(\), true\)\) \{\s*after\(\);/);
  });

  it("takes itself out of the document when it closes", () => {
    // Seen once per device. A sheet left in the body with `display: none` on
    // it is a sheet the next screen's selectors have to know about.
    const closing = source.slice(source.indexOf("const close = (): void => {"));
    expect(closing.slice(0, closing.indexOf("};"))).toContain("root.remove();");
  });

  it("stops the world while somebody is thinking of a name", () => {
    // The screen waits on a person rather than on a clock, and the field ran
    // behind it for as long as they took. The menu's own hold, so the three
    // screens in front of the game all mean the same thing (`run-state.ts`).
    expect(shell).toContain('const hold = (on: boolean): void => p.run.hold("menu", on);');
    expect(source).toContain("hold(true);");
    // And lets go on the one way off the screen, not beside it.
    const closing = source.slice(source.indexOf("const close = (): void => {"));
    expect(closing.slice(0, closing.indexOf("};"))).toContain("hold(false);");
  });

  it("takes the chrome off the screen the way the intro does", () => {
    // The ☰ is `z-index: 21` against this screen's 20, so it is not merely
    // read over the sheet — it is pressable, and the menu it opens stands in
    // front of the one question this device has been asked.
    expect(source).toContain('document.body.dataset.hello = "on";');
    const closing = source.slice(source.indexOf("const close = (): void => {"));
    expect(closing.slice(0, closing.indexOf("};"))).toContain(
      'document.body.dataset.hello = "off";',
    );
    const stepsAside = gameCss.slice(
      gameCss.indexOf('body:is([data-intro="on"], [data-hello="on"])'),
    );
    const rule = stepsAside.slice(0, stepsAside.indexOf("}"));
    for (const chip of ["#menuChip", "#pauseBtn", "#gear", "#linkChip", "#installChip"]) {
      expect(rule, `${chip} stays up over the first meeting`).toContain(chip);
    }
  });
});

describe("what it asks, and what it offers under that", () => {
  it("asks with the same field the room screen asks with", () => {
    // A name means one thing wherever it is given, so both screens claim
    // through `takeName` rather than each doing its own half of it.
    expect(source).toContain("takeName(input.value)");
    expect(readFileSync(new URL("../src/join-name.ts", import.meta.url), "utf8")).toContain(
      'takeName(input?.value ?? "")',
    );
    // And neither lets a name through that the registry's own rules would not.
    expect(source).toContain("input.maxLength = NAME_MAX;");
    expect(NAME_MAX).toBe(12);
  });

  it("lights its one press only for a name it could keep", () => {
    expect(source).toMatch(/go\.disabled = nameProblem\(input\.value\) !== "";/);
    // Dark on arrival, so nobody presses their way past the question.
    expect(source).toContain("go.disabled = true;");
  });

  it("offers the sign-in under the name and never in front of it", () => {
    const inner = source.slice(source.indexOf('inner.append(el("h2"'));
    // The name is appended first and the optional half after it: a first-timer
    // reads a question, not a login wall.
    expect(inner.indexOf("signInRow()")).toBeGreaterThan(0);
    expect(source).toContain("Already played? Log in to get your name back.");
  });

  it("hides the optional half on a build that cannot sign anybody in", () => {
    // `signInConfigured()` false is a checkout with no Firebase project. A
    // button that cannot do its thing is worse than no button.
    expect(source).toMatch(/if \(signInConfigured\(\)\) \{/);
    const guarded = source.slice(source.indexOf("if (signInConfigured())"));
    expect(guarded).toContain("signInRow()");
    expect(guarded).toContain("onSignIn(");
  });

  it("fills the field with the name a sign-in gives back", () => {
    // What the optional half is *for*: they signed in to be told what they are
    // called. The press is still theirs — the name lands in the field.
    const synced = source.slice(source.indexOf("onSignIn("));
    expect(synced).toContain("syncName()");
    expect(synced).toContain("input.value = readName();");
  });
});

describe("what it is drawn in", () => {
  it("shares the menu's furniture rather than growing a second house style", () => {
    // The tokens are declared on the menu's own rule and nowhere else, so an
    // element outside it has no colours at all — which is why this screen is
    // named in the selector rather than given a palette of its own.
    for (const shared of ["", ".on", " .sky", " .scroll", " .inner", " .setting"]) {
      expect(css, `#hello is not in the rule for${shared || " the shell"}`).toContain(
        `:is(#menu, #hello)${shared} {`,
      );
    }
  });

  it("writes only what differs, and writes it in tokens", () => {
    const own = css.slice(css.indexOf("#hello .inner {"));
    expect(own).toContain("#hello .go {");
    expect(own).toContain("#hello .go:disabled {");
    // `menu-contrast.test.ts` measures every colour in this file out of the
    // token block; one written loose here is one nothing checks.
    expect([...own.matchAll(/#[0-9a-f]{3,8}\b/gi)].map((m) => m[0])).toEqual([]);
  });
});
