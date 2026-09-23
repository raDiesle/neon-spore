import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, SceneRun } from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * THE CURTAIN's rehearsal, run and watched. Its own file since 23 September 2026, when
 * `scene-films.test.ts` reached four times the size ceiling with one block per
 * film; THE HIVE's (`scene-hive.test.ts`) is the shape every film's now has.
 * The sweep in `scenes.test.ts` fails when the *scene format* changes; this
 * fails when a *creature's rule* changes underneath a film written against it.
 */

describe("the rehearsal for THE CURTAIN", () => {
  it("bounces a shot off the cloth, drops a soft lobe, shoves and lets the sheet roll back, bares the core and hits it once, then lifts the hem under the jam that hit leaves", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theCurtain");
    const run = new SceneRun(sceneScript("theCurtain", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theCurtain.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "bounce") seen.push(`bounce ${e.col} @${run.world.beat}`);
        else if (e.type === "curtainLobeOff")
          seen.push(`lobeOff ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "curtainShove")
          seen.push(`shove ${e.col} ${e.stride} @${run.world.beat}`);
        else if (e.type === "curtainReroll") seen.push(`reroll ${e.col} @${run.world.beat}`);
        else if (e.type === "curtainCoreHit")
          seen.push(`coreHit ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "curtainShadow")
          seen.push(`shadow ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "curtainPin") seen.push(`pin ${e.col} ${e.beats} @${run.world.beat}`);
        else if (e.type === "curtainLift") seen.push(`lift ${e.col} @${run.world.beat}`);
        else if (e.type === "curtainFire" || e.type === "curtainTear" || e.type === "curtainOut") {
          seen.push(e.type);
        }
      }
    }
    // Seed 64 puts the core under the cannon's column in cyan. A bolt into
    // the cloth at beat eight bounces; the same column's lobe is soft from
    // beat twelve and the next bolt takes it. One shove, the hand off, and
    // the sheet rolls back four beats later; then four shoves two beats
    // apart bare the core on beat thirty-four, the own-colour bolt lands the
    // beat after, the nearest lobe drops and the core drifts under the
    // fabric in red. It never fires: the hit lands before its count.
    //
    // The same hit jams the rail for six beats, which is the fight's second
    // state and the one the film was written for a second time: the pilot lets
    // the sheet go, takes the hem instead, and carries it to the top on beat
    // thirty-eight. The gap stays open until he drops it — there is no second
    // core hit in this film, because the core drifted to a column no authored
    // one reaches (`mapCol`) and a page spent sliding the cannon there would be
    // a page about the cannon.
    expect(seen).toEqual([
      "bounce 5 @8",
      "lobeOff 5 6 @14",
      "shove 3 1 @18",
      "reroll 2 @23",
      "shove 3 1 @28",
      "shove 4 1 @30",
      "shove 5 1 @32",
      "shove 6 1 @34",
      "coreHit 5 2 @35",
      "lobeOff 6 5 @35",
      "shadow 9 red @35",
      "pin 9 6 @35",
      "lift 9 @38",
    ]);
    expect(run.world.creatures.filter((c) => c.kind !== "curtain")).toHaveLength(0);
  });
});
