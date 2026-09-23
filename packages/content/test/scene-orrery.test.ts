import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE ORRERY's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE ORRERY", () => {
  it("cracks the three rings on three counted beats and winds each one off, wards every rock they shed, and takes the naked core with the beam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theOrrery");
    const run = new SceneRun(sceneScript("theOrrery", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theOrrery.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      const boss = run.world.boss?.kind === "orrery" ? run.world.boss : null;
      for (const e of run.world.events) {
        if (e.type === "fire") {
          const phase = boss === null ? "gone" : boss.phase;
          seen.push(`fire ${e.col} ${e.color}${e.lance ? " lance" : ""} @${b} ${phase}`);
        } else if (e.type === "deflect") seen.push(`deflect ${e.col} @${b}`);
        else if (
          e.type === "reject" ||
          e.type === "hole" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Three shots judged on beats 12, 24 and 28, and each of them only a
    // crack: the phase read on the beat a shot leaves is the phase the
    // pilot's thumb left behind after winding the last one off, which is why
    // the second and third read `spitting` and not `seized`. The beam
    // standing on beat 32 takes the naked core in the tick it stands, so it
    // is read already out. Ten rocks turned, none through the hull, and not
    // one shot into armour or the wrong colour.
    expect(seen).toEqual([
      "fire 5 cyan @11 rings",
      "fire 5 red @23 spitting",
      "deflect 6 @27",
      "fire 5 cyan @27 spitting",
      "deflect 8 @28",
      "deflect 2 @29",
      "fire 5 red lance @32 out",
      "deflect 3 @32",
      "deflect 7 @36",
      "deflect 6 @39",
      "deflect 3 @40",
      "deflect 7 @41",
      "deflect 6 @43",
      "deflect 7 @45",
    ]);
    expect(run.world.boss).toBeNull();
    expect(run.world.creatures).toHaveLength(0);
  });
});
