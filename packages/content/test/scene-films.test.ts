import { describe, expect, it } from "bun:test";
import {
  type BossEntry,
  DEFAULT_CONFIG,
  diastoleChamberCol,
  primeChargeMilli,
  SceneRun,
  type SimEvent,
  type SpawnEntry,
} from "@neon-spore/sim";
import { sceneScript } from "../src/scene-script.js";
import { SCENES } from "../src/scenes.js";
import { WAVES } from "../src/waves.js";

/**
 * One film at a time, each with its own world and its own question.
 *
 * The sweep in `scenes.test.ts` walks every scene and asks the same thing of
 * all of them, and it fails when the *scene format* changes. These fail when a
 * *creature's rule* changes underneath a film that was written against it,
 * which is a different question asked at a different time, and the two halves
 * are added to at different rates. That is the whole argument for the cut.
 */

/**
 * **A strip that goes where the body is.**
 *
 * Every other column in a film is authored: `actCol` puts a `SceneAct`'s `col`
 * through `mapCol`, which on the eleven columns the game ships reaches 0, 2,
 * 3, 5, 7, 8 and 10 and nothing else. A shield authored into the gaps cannot
 * be written at all, and a body standing in one of them goes past whatever was
 * written instead — which is what stopped THE VOLLEY's rehearsal being written.
 *
 * So the column is resolved out of the world, the way a grip's id and a lid
 * cord's id already are, and these are the two halves of that: it lands on the
 * body even in a column no author could have named, and an empty field leaves
 * the press exactly as written rather than quietly moving it somewhere.
 */
describe("a strip act aimed at a body", () => {
  /** A film of one press, on a field holding whatever is passed in. */
  function run(queue: SpawnEntry[], atBody: boolean, authored: number): SceneRun {
    const cfg = { ...DEFAULT_CONFIG, briefings: false };
    return new SceneRun({
      cfg,
      seed: 1,
      wave: 0,
      queue,
      pods: [],
      hasLance: true,
      faults: [],
      boss: null,
      commands: [
        {
          tick: PRESS,
          player: 1,
          command: { kind: "shieldCol", col: authored },
          ...(atBody ? { atBody: true as const } : {}),
        },
      ],
      ticks: 600,
    });
  }

  /** Column 4 is one `mapCol` never reaches on an eleven-column field. */
  const UNREACHABLE = 4;
  /** After the first beat, so the arrival is standing there to be answered. */
  const PRESS = 100;

  function advanceTo(scene: SceneRun, tick: number): void {
    const events: SimEvent[] = [];
    for (let i = 0; i <= tick; i++) scene.advance(events);
  }

  it("lands in a column no authored one could have named", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], true, 0);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.creatures[0]?.col).toBe(UNREACHABLE);
    expect(scene.world.shieldCol).toBe(UNREACHABLE);
  });

  it("leaves the press where it was written when the field is empty", () => {
    const scene = run([], true, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });

  it("changes nothing for an ordinary strip act", () => {
    const scene = run([{ beat: 0, col: UNREACHABLE, kind: "slick", color: "red" }], false, 2);
    advanceTo(scene, PRESS + 1);
    expect(scene.world.shieldCol).toBe(2);
  });
});

/**
 * **A strip that goes where the boss is answered from** — the same hole in
 * `mapCol`, with no body on the field to find. THE DIASTOLE's left chamber
 * hangs over column 4, which no authored column reaches, and its film is a
 * cannon under that chamber; `bossAnswerCol` (`sim/boss-answer.ts`) is what
 * the press and the ghost thumb both ask. One half each: it lands on the
 * boss's column, and a boss with no answer leaves the press as written.
 */
describe("a strip act aimed at the boss", () => {
  function run(boss: BossEntry | null, atBoss: boolean, authored: number): SceneRun {
    const cfg = { ...DEFAULT_CONFIG, briefings: false };
    return new SceneRun({
      cfg,
      seed: 1,
      wave: 0,
      queue: [],
      pods: [],
      hasLance: true,
      faults: [],
      boss,
      commands: [
        {
          tick: 100,
          player: 1,
          command: { kind: "cannonCol", col: authored },
          ...(atBoss ? { atBoss: true as const } : {}),
        },
      ],
      ticks: 600,
    });
  }

  it("lands under THE DIASTOLE's left chamber, a column no authored one reaches", () => {
    const scene = run({ kind: "diastole" }, true, 2);
    for (let i = 0; i <= 101; i++) scene.advance([]);
    expect(scene.world.cannonCol).toBe(diastoleChamberCol(DEFAULT_CONFIG, -1));
    expect(scene.world.cannonCol).toBe(4);
  });

  it("leaves the press where it was written under a boss with no answer", () => {
    const scene = run({ kind: "baton" }, true, 2);
    for (let i = 0; i <= 101; i++) scene.advance([]);
    expect(scene.world.cannonCol).toBe(2);
  });
});

/**
 * THE THROB's film says its rule twice — a shot wasted and a shot landing —
 * and neither half is staged: both bolts arrive at the same half of a turning
 * body, and what separates them is which trigger was pressed.
 *
 * The scene's two act ticks are chosen against `throbSpinBeats`, and that
 * choice is written in the file as a comment doing arithmetic (beats 9.75 to
 * 11.25). A comment is not a mechanism. Change the turn or the window and one
 * of these two shots stops meaning what the page over it says, silently, in a
 * film nobody re-watches once it is written.
 */
describe("the rehearsal for THE THROB", () => {
  it("wastes one shot on the trigger that turned away and lands the next", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThrob");
    const run = new SceneRun(sceneScript("theThrob", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    for (let t = 0; t < SCENES.theThrob.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
    }
    const rejected = seen.findIndex((e) => e.type === "reject");
    const destroyed = seen.findIndex((e) => e.type === "destroy");
    expect(
      rejected,
      "the first bolt is not refused — the half it arrives at still takes red",
    ).toBeGreaterThan(-1);
    expect(destroyed, "the second bolt does not land — cyan is not the half round").toBeGreaterThan(
      -1,
    );
    expect(rejected, "the film lands its shot before it loses one").toBeLessThan(destroyed);
    expect(run.world.creatures).toHaveLength(0);
  });
});

/**
 * **THE LEAK's rehearsal, and the two halves prose could not hold apart.**
 *
 * The wave's three strings say *the lobe fills nothing*. What a pair has to see
 * is the ring round the button **not closing** under a thumb that stays down,
 * and then that same thumb lifting and a bolt going out — read as one sentence
 * those are a dead trigger, and watched in that order they are a lost weapon on
 * a panel that still works. That is the whole reason the wave has a film at
 * all, and it is the half a caption cannot assert.
 *
 * So this asserts it. The hold runs from tick 360 to 660, which is five beats
 * where `lancePrimeBeats` is three: on any other wave the lobe would be full at
 * 540 and the column alight. Here the fill is nought at every tick of it, and
 * the lift still owes its ordinary shot — `sim/lance.ts` is emphatic that the
 * press starts a hold and the lift fires, because a fault that swallowed the
 * press would have taken the trigger rather than the beam.
 *
 * Change `lancePrimeBeats`, or let the fault reach the press, and one of the
 * two pages over this stops meaning what it says — silently, in a film nobody
 * re-watches once it is written. That is `theThrob`'s argument above, one wave
 * along.
 */
describe("the rehearsal for THE LEAK", () => {
  it("fills nothing under a five-beat hold, and still fires on the lift", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLeak");
    const run = new SceneRun(sceneScript("theLeak", wave, DEFAULT_CONFIG));
    const seen: SimEvent[] = [];
    const spent: SimEvent[] = [];
    let fullest = 0;
    let destroyedByLift = -1;
    for (let t = 0; t < SCENES.theLeak.ticks - 1; t++) {
      spent.length = 0;
      run.advance(spent);
      seen.push(...spent);
      // The held page, and a beat either side of the lift: the fill is what is
      // being watched and it must never leave nought.
      if (run.world.tick >= 360 && run.world.tick <= 660) {
        fullest = Math.max(fullest, primeChargeMilli(run.world));
      }
      // The first body the film takes, and which tick took it. The bolt leaves
      // on the lift and travels, so this is after 660 rather than on it.
      if (destroyedByLift === -1 && spent.some((e) => e.type === "destroy")) {
        destroyedByLift = run.world.tick;
      }
    }
    expect(fullest, "the lobe filled under a hold on the wave where it cannot").toBe(0);
    expect(
      destroyedByLift,
      "no body was taken at all — the lift owes an ordinary shot",
    ).toBeGreaterThan(660);
    // Before the two taps that follow it, so what took this one was the lift.
    expect(destroyedByLift, "the first body waited for a tap").toBeLessThan(840);
    // Three bodies, three shots — which is the page the pilot reads last.
    expect(seen.filter((e) => e.type === "destroy")).toHaveLength(3);
    expect(run.world.creatures).toHaveLength(0);
  });
});

/**
 * THE DIASTOLE's film is a count against the boss's own clock: two red shots
 * on the left's contractions, then a beam held to land on the fifteenth beat
 * of the count that starts when the right wakes. Every one of those ticks is
 * arithmetic written in the file as a comment, and a comment is not a
 * mechanism — a bolt that got slower or a fill that got longer would leave
 * the pages saying things the picture no longer does, silently.
 */
describe("the rehearsal for THE DIASTOLE", () => {
  it("takes the left twice on its own count, then both at once off the bridge", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theDiastole");
    const run = new SceneRun(sceneScript("theDiastole", wave, DEFAULT_CONFIG));
    const phases: string[] = [];
    for (let t = 0; t < SCENES.theDiastole.ticks - 1; t++) {
      run.advance([]);
      const boss = run.world.boss;
      if (boss === null || boss.kind !== "diastole") throw new Error("no twin lobe");
      const now = `${boss.phase} ${boss.leftHits}/${boss.rightHits}`;
      if (phases[phases.length - 1] !== now) phases.push(now);
    }
    // The phase turns on the beat after the hit that earns it, both times.
    expect(phases).toEqual(["one 3/3", "one 2/3", "one 1/3", "two 1/3", "two 0/2", "alone 0/2"]);
  });
});

describe("the rehearsal for THE BATON", () => {
  it("launches once unanswered, then passes the bead three sockets down", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theBaton");
    const run = new SceneRun(sceneScript("theBaton", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theBaton.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "batonLaunch" || e.type === "batonRelit" || e.type === "batonLanded") {
          seen.push(`${e.type} ${e.socket}`);
        }
      }
    }
    // The first launch comes back to the socket it left; the three after it
    // each land one lower, and the film ends with the last still in the air.
    expect(seen).toEqual([
      "batonLaunch 0",
      "batonRelit 0",
      "batonLaunch 0",
      "batonLanded 1",
      "batonLaunch 1",
      "batonLanded 2",
      "batonLaunch 2",
    ]);
    const boss = run.world.boss;
    expect(boss?.kind === "baton" && boss.beads.length === 1 && boss.beads[0]?.struck).toBe(true);
  });
});

describe("the rehearsal for THE THROAT", () => {
  it("clears one body, lets one be swallowed, then chokes a ring with a gum", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theThroat");
    const run = new SceneRun(sceneScript("theThroat", wave, DEFAULT_CONFIG));
    const flungAt: number[] = [];
    let slackAt = -1;
    for (let t = 0; t < SCENES.theThroat.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) if (e.type === "gumFlung") flungAt.push(run.world.beat);
      const b = run.world.boss;
      if (slackAt < 0 && b?.kind === "throat" && b.slack > 0) slackAt = run.world.beat;
    }
    const boss = run.world.boss;
    if (boss?.kind !== "throat") throw new Error("no throat");
    // The red creature is shot before the inhale at beat 12; only the rock is
    // ever swallowed, on the inhale at 18.
    expect(boss.fedBeat).toBe(18);
    // The gum flies for one beat and chokes on the next; the mouth is sliding
    // by the end of the film with one ring gone.
    expect(flungAt).toEqual([26]);
    expect(slackAt).toBe(27);
    expect(boss.slack).toBe(1);
    expect(boss.phase).toBe("slide");
  });
});

describe("the rehearsal for THE UNDERTOW", () => {
  it("scars one lobe left alone, takes three with the maw, and plates the far one of a pair", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theUndertow");
    const run = new SceneRun(sceneScript("theUndertow", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theUndertow.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "undertowTaken" || e.type === "undertowScar") {
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        }
      }
    }
    // The first lobe is nobody's: its breach widens to `undertowWideMilli` on
    // the fourth beat and puts a second lobe up next door, and both withdraw
    // and scar — the film's first lesson is the spread and not one column. The
    // next two are taken the beat they stand, the cannon slid under each by
    // `atBoss`; of the pair the maw takes the near one and the plated far one
    // withdraws.
    expect(seen).toEqual([
      "undertowScar 9 @11",
      "undertowScar 10 @15",
      "undertowTaken 7 @21",
      "undertowTaken 5 @27",
      "undertowTaken 3 @33",
      "undertowScar 7 @38",
    ]);
    expect(run.world.shieldCol).toBe(7);
    expect(run.world.cannonCol).toBe(3);
  });
});

describe("the rehearsal for THE CANDLE", () => {
  it("dims the glow three times, feeds it once from the faced column, and ends it on the pull and the beam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theCandle");
    const run = new SceneRun(sceneScript("theCandle", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theCandle.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "candleDim" || e.type === "candleFed") {
          seen.push(`${e.type} ${e.col} ${e.left} @${run.world.beat}`);
        } else if (e.type === "candleLast" || e.type === "candleOut") {
          seen.push(`${e.type} @${run.world.beat}`);
        }
      }
    }
    // Three bolts from under the glow, each slid there by `atBoss` after it
    // drifted; the third brings it to two and it eats. The fourth is fired from
    // the column it faces — the one authored slide in the film — and is put
    // back on the glow at the muzzle. Then two clean ones with the cannon slid
    // clear, the last of which stops it.
    //
    // And then the trigger stops counting, which is the whole of what this
    // film's last page is for: the pilot pulls the flame down off the wick
    // (`candleWick`) and only then does the beam reach what is left. A film
    // that ended on the beam alone ran for a day after the phases landed and
    // showed a boss that never went out.
    expect(seen).toEqual([
      "candleDim 5 4 @6",
      "candleDim 3 3 @12",
      "candleDim 4 2 @15",
      "candleFed 3 3 @20",
      "candleDim 6 2 @27",
      "candleDim 5 1 @30",
      "candleLast @30",
      "candleDim 5 0 @35",
      "candleOut @35",
    ]);
    // Out, and gone: the two black beats have passed and the light is back
    // before the loop turns over.
    expect(run.world.boss).toBeNull();
  });
});

describe("the rehearsal for THE GORGE", () => {
  it("swallows a stray, fills and pierces two intakes, and spits the stray back to be broken", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theGorge");
    const run = new SceneRun(sceneScript("theGorge", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theGorge.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "gorgeSwallow")
          seen.push(`swallow ${e.col} ${e.color} ${e.beads} @${run.world.beat}`);
        else if (e.type === "gorgeEmptied")
          seen.push(`emptied ${e.col} ${e.beads} @${run.world.beat}`);
        else if (e.type === "gorgeFull") seen.push(`full ${e.col} @${run.world.beat}`);
        else if (e.type === "gorgeRupture")
          seen.push(`rupture ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "gorgeSpit") seen.push(`spit ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "gorgeVent" || e.type === "gorgeMouth") seen.push(e.type);
        else if (e.type === "destroy") seen.push(`destroy ${e.kind} ${e.col} @${run.world.beat}`);
      }
    }
    // The stray red into the middle intake first; three cyan into the one
    // player 1 picked, a red taking one back out, two more cyan to full and
    // the fifth through it; four red into the next and the fifth through
    // that; then the twice-pierced sack spits the stray down the middle,
    // where its own colour breaks it. Nothing vents and the mouth never opens.
    expect(seen).toEqual([
      "swallow 5 red 1 @5",
      "swallow 3 cyan 1 @14",
      "swallow 3 cyan 2 @15",
      "swallow 3 cyan 3 @16",
      "emptied 3 2 @20",
      "swallow 3 cyan 3 @23",
      "swallow 3 cyan 4 @24",
      "full 3 @24",
      "rupture 3 6 @27",
      "swallow 7 red 1 @34",
      "swallow 7 red 2 @35",
      "swallow 7 red 3 @36",
      "swallow 7 red 4 @37",
      "full 7 @37",
      "rupture 7 5 @39",
      "spit 5 red @40",
      "destroy slick 5 @50",
    ]);
  });
});

describe("the rehearsal for THE CURTAIN", () => {
  it("bounces a shot off the cloth, drops a soft lobe, shoves and lets the sheet roll back, then bares the core and hits it once", () => {
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
    ]);
    expect(run.world.creatures.filter((c) => c.kind !== "curtain")).toHaveLength(0);
  });
});

describe("the rehearsal for THE TASTER", () => {
  it("tastes three reds, thickens on a fourth, loses a blade to two cyans and a second to one, then grows three at once in red", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theTaster");
    const run = new SceneRun(sceneScript("theTaster", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theTaster.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "tasterSet") seen.push(`set ${e.col} ${e.color} @${run.world.beat}`);
        else if (e.type === "tasterThick")
          seen.push(`thick ${e.col} ${e.layers} @${run.world.beat}`);
        else if (e.type === "tasterPare") seen.push(`pare ${e.col} ${e.layers} @${run.world.beat}`);
        else if (e.type === "tasterShear") seen.push(`shear ${e.col} ${e.left} @${run.world.beat}`);
        else if (e.type === "tasterGrow") seen.push(`grow ${e.col} @${run.world.beat}`);
        else if (
          e.type === "tasterCrest" ||
          e.type === "tasterLift" ||
          e.type === "tasterTaste" ||
          e.type === "tasterClose" ||
          e.type === "tasterRefused" ||
          e.type === "tasterOut"
        ) {
          seen.push(e.type);
        }
      }
    }
    // Three reds are in the muzzle before the middle blade sets on beat five,
    // so it sets red; a fourth red thickens it; a cyan pares it and a second
    // takes it off. The next blade over, on column 6, set red on beat nine
    // and one cyan takes it on beat twenty-three. Two gone, the fan grows
    // three at once — and every set the film shows is red, four to three on
    // the ledger, never a dead heat and never the rng. Nothing is cut, tasted
    // again, closed, refused or out.
    expect(seen).toEqual([
      "grow 5 @1",
      "fire 5 red @1",
      "fire 5 red @3",
      "fire 5 red @3",
      "set 5 red @5",
      "grow 6 @5",
      "set 6 red @9",
      "grow 4 @9",
      "fire 5 red @10",
      "thick 5 2 @11",
      "set 4 red @13",
      "grow 7 @13",
      "fire 5 cyan @13",
      "pare 5 1 @14",
      "fire 5 cyan @16",
      "set 7 red @17",
      "grow 3 @17",
      "shear 5 3 @17",
      "set 3 red @21",
      "grow 8 @21",
      "fire 6 cyan @22",
      "shear 6 3 @23",
      "grow 2 @24",
      "grow 9 @24",
      "set 8 red @25",
      "grow 1 @25",
      "set 2 red @28",
      "set 9 red @28",
      "grow 10 @28",
      "grow 0 @28",
      "set 1 red @29",
    ]);
    expect(run.world.cannonCol).toBe(6);
    expect(run.world.creatures).toHaveLength(0);
  });
});

describe("the rehearsal for THE SINEW", () => {
  it("parts two fibres on two authored sums, snaps on a third over the top, and the plate turns the rock", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theSinew");
    const run = new SceneRun(sceneScript("theSinew", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theSinew.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "sinewGrip" || e.type === "sinewRelease")
          seen.push(`${e.type} ${e.player} @${run.world.beat}`);
        else if (e.type === "sinewPart") seen.push(`part ${e.fibres} @${run.world.beat}`);
        else if (e.type === "sinewSnap") seen.push(`snap ${e.rocks} @${run.world.beat}`);
        else if (e.type === "sinewRock") seen.push(`rock ${e.col} @${run.world.beat}`);
        else if (e.type === "deflect" || e.type === "breach")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "sinewEnter" || e.type === "sinewFall" || e.type === "sinewOut")
          seen.push(`${e.type} @${run.world.beat}`);
        else if (e.type === "sinewCrush" || e.type === "waveFailed") seen.push(e.type);
      }
    }
    // Both hands take hold a beat before the sum enters the zone; four beats
    // in, a fibre parts and the hands let go. Again against the rolled zone.
    // The third pull is both reaches at once, over the top of any zone the
    // band allows, and the snap throws both hands off on the beat it is read
    // and sheds one rock at the mass's right — turned by the plate carried
    // under it and the trigger, on the shield's row. No fall, no crush, no
    // hull.
    expect(seen).toEqual([
      "sinewGrip 1 @10",
      "sinewGrip 2 @10",
      "sinewEnter @11",
      "part 5 @15",
      "sinewRelease 1 @15",
      "sinewRelease 2 @15",
      "sinewGrip 1 @19",
      "sinewGrip 2 @19",
      "sinewEnter @20",
      "part 4 @24",
      "sinewRelease 1 @24",
      "sinewRelease 2 @24",
      "sinewGrip 1 @25",
      "sinewGrip 2 @25",
      "sinewRelease 1 @26",
      "sinewRelease 2 @26",
      "snap 1 @26",
      "rock 6 @26",
      "deflect 6 @32",
    ]);
    expect(run.world.creatures).toHaveLength(0);
    expect(run.world.boss?.kind).toBe("sinew");
  });
});

describe("the rehearsal for THE LEDGER", () => {
  it("lands two hits of the seed's colours, wards both returns in the socket, and the second whips the seam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLedger");
    const run = new SceneRun(sceneScript("theLedger", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLedger.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.color} ${e.col} @${run.world.beat}`);
        else if (e.type === "ledgerSeam") seen.push(`seam ${e.seam} ${e.color} @${run.world.beat}`);
        else if (e.type === "ledgerBead") seen.push(`bead ${e.col} ${e.beats} @${run.world.beat}`);
        else if (e.type === "ledgerWard" || e.type === "ledgerSocket")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "ledgerWhip") seen.push(`whip ${e.seam} @${run.world.beat}`);
        else if (
          e.type === "ledgerBill" ||
          e.type === "ledgerRefused" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Cyan up the seam, which the seed rolled; the return four beats later,
    // warded in the socket, walks it a column. Red, which the hit rolled, and
    // the second return three beats later is warded where the socket walked
    // to — the strip is `atBoss` — and whips the seam a third notch for no
    // bill. Nothing refused, nothing billed, no hull.
    expect(seen).toEqual([
      "fire cyan 5 @8",
      "seam 1 red @9",
      "bead 5 4 @9",
      "ledgerWard 5 @13",
      "ledgerSocket 6 @13",
      "fire red 5 @19",
      "seam 2 cyan @20",
      "bead 6 3 @20",
      "ledgerWard 6 @23",
      "whip 3 @23",
      "seam 3 red @23",
      "ledgerSocket 7 @23",
    ]);
    expect(run.world.creatures).toHaveLength(0);
    expect(run.world.boss?.kind).toBe("ledger");
  });
});

describe("the rehearsal for THE SURGE", () => {
  it("vents two notches with both thumbs off together, and loses the charge between them to a thumb off alone", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theSurge");
    const run = new SceneRun(sceneScript("theSurge", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theSurge.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "surgeGrip" || e.type === "surgeRelease")
          seen.push(`${e.type} ${e.player} @${run.world.beat}`);
        else if (e.type === "surgeVent")
          seen.push(`vent ${e.notches} row ${e.row} @${run.world.beat}`);
        else if (e.type === "surgeNear" || e.type === "surgeLost")
          seen.push(`${e.type} @${run.world.beat}`);
        else if (
          e.type === "surgeBurst" ||
          e.type === "surgeGum" ||
          e.type === "surgeEvert" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // The pilot's thumb, then the navigator's; the pressure enters the first
    // band at 700 and the field slows; both off eight ticks apart at 1100,
    // the first notch. The second hold the pilot leaves alone at 800, the
    // navigator two beats later — lost. The third is the first again at the
    // second notch, 1400. No burst, no gum, no eversion, no hull.
    expect(seen).toEqual([
      "surgeGrip 1 @2",
      "surgeGrip 2 @3",
      "surgeNear @6",
      "surgeRelease 1 @8",
      "surgeRelease 2 @8",
      "vent 1 row 4 @8",
      "surgeGrip 1 @12",
      "surgeGrip 2 @12",
      "surgeRelease 1 @16",
      "surgeRelease 2 @18",
      "surgeLost @18",
      "surgeGrip 1 @19",
      "surgeGrip 2 @19",
      "surgeNear @25",
      "surgeRelease 1 @26",
      "surgeRelease 2 @26",
      "vent 2 row 5 @26",
    ]);
  });
});

describe("the rehearsal for THE LEAD", () => {
  it("misses where it is, hits four times where it will be, wards the run's litter, and stands the beam in the pass", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theLead");
    const run = new SceneRun(sceneScript("theLead", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theLead.ticks - 1; t++) {
      run.advance([]);
      for (const e of run.world.events) {
        if (e.type === "fire")
          seen.push(`fire ${e.col}${e.lance ? " beam" : ""} @${run.world.beat}`);
        else if (e.type === "leadMiss" || e.type === "leadTorch" || e.type === "leadRock")
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "leadReverse") seen.push(`reverse ${e.dir} @${run.world.beat}`);
        else if (e.type === "leadHit") seen.push(`hit ${e.col} ${e.segments} @${run.world.beat}`);
        else if (e.type === "deflect") seen.push(`deflect ${e.kind} ${e.col} @${run.world.beat}`);
        else if (
          e.type === "leadStill" ||
          e.type === "leadPass" ||
          e.type === "leadDown" ||
          e.type === "leadOut"
        )
          seen.push(`${e.type} ${e.col} @${run.world.beat}`);
        else if (e.type === "leadWall" || e.type === "breach" || e.type === "waveFailed")
          seen.push(e.type);
      }
    }
    // Column 7 is where it stands on beat 2 and column 9 where it is judged:
    // a miss, and it turns. Then four `atBoss` shots, each two beats ahead —
    // 6 at the walk, 0, 8 and 10 at the run — with the run's two torches
    // warded where they land and its first rock's column never shot through.
    // Still at the right wall, the beam standing in 8 as the pass comes
    // through, and the rock at 2 warded after it is down. No wall, no hull.
    expect(seen).toEqual([
      "fire 7 @2",
      "leadMiss 7 @4",
      "reverse -1 @4",
      "fire 6 @5",
      "hit 6 4 @7",
      "leadRock 2 @8",
      "fire 0 @8",
      "leadTorch 4 @9",
      "hit 0 3 @10",
      "deflect torch 4.5 @10",
      "leadTorch 2 @12",
      "leadRock 6 @12",
      "fire 8 @12",
      "deflect torch 2.5 @13",
      "fire 10 @13",
      "hit 8 2 @14",
      "hit 10 1 @15",
      "leadStill 10 @15",
      "fire 8 beam @19",
      "leadPass 10 @20",
      "leadDown 7 @20",
      "deflect meteor 2 @21",
      "leadOut 7 @23",
    ]);
  });
});

describe("the rehearsal for THE SCUTTLE", () => {
  it("lets one part go, strikes nineteen where they hang with the twins shot at the top, and holds the last under the beam", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theScuttle");
    const run = new SceneRun(sceneScript("theScuttle", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theScuttle.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color}${e.lance ? " beam" : ""} @${b}`);
        else if (e.type === "scuttleLoose")
          seen.push(`loose ${e.col}${e.live ? " live" : ""} @${b}`);
        else if (e.type === "scuttleThrow") seen.push(`thrown ${e.col} ${e.left} @${b}`);
        else if (e.type === "scuttleStruck") seen.push(`struck ${e.col} ${e.left} @${b}`);
        else if (e.type === "destroy" || e.type === "deflect")
          seen.push(`${e.type} ${e.kind} ${e.col} @${b}`);
        else if (
          e.type === "scuttleRebuff" ||
          e.type === "scuttleWind" ||
          e.type === "scuttleDown" ||
          e.type === "scuttleOut"
        )
          seen.push(`${e.type} ${e.col} @${b}`);
        else if (
          e.type === "scuttleSlack" ||
          e.type === "reject" ||
          e.type === "hole" ||
          e.type === "podLoose" ||
          e.type === "podLost" ||
          e.type === "breach" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // The rock over 5 hangs three beats and is thrown, and is warded on beat
    // 20; every other part is struck the beat after it comes loose, in the
    // column the strip found and the colour the navigator sees — cyan on the
    // red body over 8 first, for the rebuff. From twelve left a twin hangs
    // beside the live one and is thrown at the cadence, each shot at the top
    // of its column in the gap; both pods are struck where they hang, at
    // eleven and two left. The beam stands under the wind-up on beat 41, a
    // beat before the throw, and the frame is out three beats on. No pod is
    // freed, nothing is rejected, no strike is blocked, no hull.
    expect(seen).toEqual([
      "loose 5 live @4",
      "thrown 5 20 @7",
      "loose 7 live @7",
      "fire 7 cyan @7",
      "struck 7 19 @8",
      "loose 8 live @9",
      "fire 8 cyan @9",
      "fire 8 red @10",
      "scuttleRebuff 8 @10",
      "struck 8 18 @11",
      "loose 3 live @12",
      "fire 3 cyan @12",
      "struck 3 17 @13",
      "loose 3 live @14",
      "fire 3 red @14",
      "struck 3 16 @15",
      "loose 8 live @16",
      "fire 8 cyan @16",
      "struck 8 15 @17",
      "loose 6 live @18",
      "fire 6 red @18",
      "struck 6 14 @19",
      "loose 5 live @20",
      "deflect meteor 5 @20",
      "fire 5 red @20",
      "struck 5 13 @21",
      "loose 2 live @22",
      "fire 2 cyan @22",
      "struck 2 12 @23",
      "loose 3 live @24",
      "loose 7 @24",
      "fire 3 cyan @24",
      "struck 3 11 @25",
      "thrown 7 10 @27",
      "loose 5 live @27",
      "loose 4 @27",
      "fire 5 red @27",
      "fire 7 cyan @28",
      "struck 5 9 @28",
      "destroy bulb 7 @29",
      "thrown 4 8 @30",
      "loose 2 live @30",
      "loose 7 @30",
      "fire 2 red @30",
      "fire 4 cyan @31",
      "struck 2 7 @31",
      "thrown 7 6 @32",
      "loose 8 live @32",
      "loose 6 @32",
      "destroy bulb 4 @32",
      "fire 8 cyan @32",
      "fire 7 cyan @33",
      "struck 8 5 @33",
      "thrown 6 4 @34",
      "loose 2 live @34",
      "loose 6 @34",
      "destroy bulb 7 @34",
      "fire 2 cyan @34",
      "fire 6 cyan @35",
      "struck 2 3 @35",
      "thrown 6 2 @36",
      "loose 4 live @36",
      "destroy bulb 6 @36",
      "fire 4 cyan @36",
      "fire 6 red @37",
      "struck 4 1 @37",
      "scuttleWind 4 @38",
      "destroy slick 6 @38",
      "fire 4 cyan beam @41",
      "scuttleDown 4 @41",
      "scuttleOut 2 @44",
    ]);
  });
});

describe("the rehearsal for THE ANTIPHON", () => {
  it("hardens on the wrong candidate first, pits six organs where they stand with what was rejected shot as it falls, and bursts on their own ship", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theAntiphon");
    const run = new SceneRun(sceneScript("theAntiphon", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    for (let t = 0; t < SCENES.theAntiphon.ticks - 1; t++) {
      run.advance([]);
      const b = run.world.beat;
      for (const e of run.world.events) {
        if (e.type === "fire") seen.push(`fire ${e.col} ${e.color} @${b}`);
        else if (e.type === "antiphonGrow") seen.push(`grow ${e.shape} @${e.col} b${b}`);
        else if (e.type === "antiphonPit") seen.push(`pit ${e.shape} ${e.pits} @${e.col} b${b}`);
        else if (e.type === "antiphonHarden") seen.push(`harden rail ${e.rail} @${e.col} b${b}`);
        else if (e.type === "antiphonSpill") seen.push(`spill ${e.color} @${e.col} b${b}`);
        else if (e.type === "destroy") seen.push(`destroy ${e.kind} ${e.col} @${b}`);
        else if (
          e.type === "antiphonStill" ||
          e.type === "antiphonShip" ||
          e.type === "antiphonBurst" ||
          e.type === "antiphonOut"
        )
          seen.push(`${e.type.slice(8).toLowerCase()} @${e.col} b${b}`);
        else if (
          e.type === "antiphonSink" ||
          e.type === "reject" ||
          e.type === "hole" ||
          e.type === "breach" ||
          e.type === "deflect" ||
          e.type === "waveFailed"
        )
          seen.push(e.type);
      }
    }
    // Every organ a pit, every rejected candidate destroyed where it fell,
    // nothing sunk, nothing rejected by a body, nothing through the hull.
    expect(seen).toEqual([
      "grow 10 @9 b2",
      "fire 8 red @6",
      "harden rail 4 @8 b7",
      "grow 4 @9 b9",
      "fire 9 cyan @13",
      "pit 4 1 @9 b14",
      "grow 7 @3 b16",
      "fire 3 cyan @20",
      "pit 7 2 @3 b21",
      "grow 14 @9 b23",
      "fire 9 cyan @27",
      "pit 14 3 @9 b28",
      "spill red @3 b28",
      "spill cyan @7 b28",
      "spill red @10 b28",
      "fire 3 red @29",
      "grow 11 @0 b30",
      "destroy slick 3 @30",
      "fire 7 cyan @31",
      "destroy bulb 7 @32",
      "fire 10 red @33",
      "destroy slick 10 @34",
      "fire 0 cyan @34",
      "pit 11 4 @0 b35",
      "spill cyan @7 b35",
      "spill cyan @5 b35",
      "spill red @1 b35",
      "fire 7 cyan @36",
      "grow 15 @3 b37",
      "grow 12 @5 b37",
      "destroy bulb 7 @37",
      "fire 5 cyan @38",
      "destroy bulb 5 @39",
      "fire 1 red @40",
      "destroy slick 1 @41",
      "fire 3 red @41",
      "pit 15 5 @3 b42",
      "fire 5 cyan @42",
      "pit 12 6 @5 b44",
      "spill cyan @0 b44",
      "spill red @8 b44",
      "spill cyan @10 b44",
      "spill red @9 b44",
      "fire 0 cyan @45",
      "still @5 b46",
      "destroy bulb 0 @46",
      "fire 8 red @47",
      "destroy slick 8 @48",
      "fire 10 cyan @49",
      "ship @6 b50",
      "destroy bulb 10 @50",
      "fire 9 red @51",
      "destroy slick 9 @51",
      "fire 6 red @54",
      "burst @6 b55",
      "out @5 b58",
    ]);
  });
});

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

describe("the rehearsal for THE SCOUT", () => {
  it("flies arena one whole and the first trip of arena two, and touches nothing that moves", () => {
    const wave = WAVES.findIndex((w) => w.guide?.scene === "theScout");
    const run = new SceneRun(sceneScript("theScout", wave, DEFAULT_CONFIG));
    const seen: string[] = [];
    let last = "";
    for (let t = 0; t < SCENES.theScout.ticks - 1; t++) {
      run.advance([]);
      const boss = run.world.boss?.kind === "scout" ? run.world.boss : null;
      if (boss === null) throw new Error(`no scout at tick ${run.world.tick}`);
      const now = `arena ${boss.arena} ${boss.phase} carrying ${boss.carrying.join(",")} banked ${boss.banked.join(",")}`;
      if (now !== last) seen.push(`${now} @${run.world.beat}`);
      last = now;
      for (const e of run.world.events)
        if (e.type === "breach" || e.type === "waveFailed") seen.push(e.type);
    }
    // Four motes picked in a loop and banked together on beat 16, and the
    // second arena opens the same beat; three of its column come home on 24.
    // Nothing moving is touched: no breach, no wave failed.
    expect(seen).toEqual([
      "arena 0 lead carrying  banked  @0",
      "arena 0 play carrying  banked  @4",
      "arena 0 play carrying 2 banked  @6",
      "arena 0 play carrying 2,0 banked  @9",
      "arena 0 play carrying 2,0,1 banked  @12",
      "arena 0 play carrying 2,0,1,3 banked  @14",
      "arena 0 play carrying  banked 2,0,1,3 @16",
      "arena 1 play carrying  banked  @16",
      "arena 1 play carrying 0 banked  @18",
      "arena 1 play carrying 0,1 banked  @21",
      "arena 1 play carrying 0,1,2 banked  @21",
      "arena 1 play carrying  banked 0,1,2 @24",
    ]);
  });
});
