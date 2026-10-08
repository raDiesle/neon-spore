/**
 * **What to type**, one line per flag: the recipes `bun run frames --help`
 * prints. Why a flag exists is argued in the file that acts on it (the table
 * in `run.ts`'s header); this is only what somebody reaching for the command
 * needs. A next flag costs one more row here, and `test/recipes.test.ts`
 * parses every row, so a recipe that stops being a command line is a red test
 * rather than a lie in a help screen.
 */

/** A command after `bun run frames`, and what it takes a picture of. */
export interface Recipe {
  readonly argv: string;
  readonly what: string;
}

export const RECIPES: readonly Recipe[] = [
  { argv: ". --wave 19 --boss-round 3", what: "this tree, once, with no pair" },
  { argv: "<sha> --wave 21", what: "wave 21, matching the HUD's W21" },
  { argv: '<sha> --wave "THE SHELL"', what: "a wave by name — what a person has in hand" },
  { argv: "<sha> --wave 21 --ticks 240", what: "an absolute world.tick, not a count of steps" },
  { argv: ". --wave 21 --until breach", what: "the tick the hull was holed, whenever that is" },
  {
    argv: ". --wave 21 --until destroy --frames 4 --stride 0 --settle 3",
    what: "the break, as a strip",
  },
  {
    argv: ". --wave 50 --until needWave --until-back 200",
    what: "the rest before an event, not the end of it",
  },
  {
    argv: ". --wave 1 --until waveFailed --until-on 150",
    what: "the rest after one: the lost screen",
  },
  {
    argv: '. --wave "THE INSTAR" --auto both --until instarShow:step=4 --until-on 3',
    what: "the fifth show, not the first: a firing picked by the fields a miss prints",
  },
  { argv: ". --wave 21 --events", what: "what fired, and on which tick" },
  {
    argv: '. --wave "THE VISE" --auto both --until viseHit --until-on 2',
    what: "AUTO plays to a boss's receipt",
  },
  {
    argv: '. --wave "THE VISE" --auto both --auto-miss --until breach --until-ticks 6000',
    what: "an ask let run out: the blow",
  },
  { argv: "<sha> --wave 21 --frames 6 --stride 4", what: "a short strip, for motion" },
  { argv: "<sha> --wave 21 --seat p1", what: "one player's screen, not the rig's" },
  { argv: ". --wave 21 --seat p1 --size 390x660", what: "a short phone, its bars out" },
  { argv: ". --wave 3 --level hard", what: "on HARD: its tempo, and the wasted shot's ricochet" },
  { argv: '. --wave "THE CLASP" --raster', what: "the baked looks, which are off by default" },
  { argv: "<sha> --wave 20 --hold wardenTether=0,y=7000", what: "a thumb on a cord" },
  {
    argv: "<sha> --wave 21 --hold balloonLeft=-1600,id=1 --hold balloonRight=1600,id=1",
    what: "both hands",
  },
  {
    argv: "<sha> --wave 19 --ticks 360 --hold mazeString=1400@240 --press 300:2:fire=cyan",
    what: "turn, then shoot",
  },
  {
    argv: ". --wave 1 --seat p1 --hand cannon",
    what: "this phone's thumb on the lobe, and its ring",
  },
  {
    argv: ". --wave 1 --seat p2 --hand muzzle=red --hand-over",
    what: "the navigator's, carried; or resting",
  },
  { argv: "<sha> --wave 21 --press 60:1:cannonCol=3,64:2:fire=red", what: "a shot, or 90:1:salvo" },
  {
    argv: "<sha> --wave 21 --press 60:1:cannonCol=3 --press 64:2:fire=red",
    what: "the same, a flag each",
  },
  { argv: "<sha> --wave 21 --press 60:1:grip=lowest", what: "a hand on the body nearest the hull" },
  { argv: "<sha> --wave 21 --settle 8 --frames 6 --stride 0", what: "a burst, as a strip" },
  {
    argv: '<sha> --wave "THE CAIRN" --time 12.5',
    what: "the picture's clock at a movement's widest",
  },
  { argv: "<sha> --wave 21 --at 120,400,150,150 --zoom 3", what: "one body, close up" },
  { argv: "<sha> --wave 19 --boss-round 3", what: "a later sheet of THE MAZE" },
  { argv: '. --wave "THE HANDOVER" --fault handover:4,3,6', what: "a fault no wave names" },
  { argv: ". --wave 3 --fault cannon:alternating,2", what: "a runaway cannon, twice as slow" },
  {
    argv: '. --wave "THE BLISTER" --entry 0:gesture=hold --seat p2 --ticks 300',
    what: "an arrival's fields, for a gesture no wave sends yet",
  },
  {
    argv: '. --wave "THE THROAT" --boss slack=5,phase=everts,phaseBeat=now-2',
    what: "a boss's last phase, two beats in — now is the wave's first beat, not --ticks'",
  },
  {
    argv: '. --wave "THE INSTAR" --boss cursor=10,phase=act,phaseBeat=now --ticks 200',
    what: "a scene boss opened on a given step, not played to it",
  },
  {
    argv: `. --wave "THE BATON" --boss-json '{"sockets":[1,1,0]}'`,
    what: "a list the wave never reaches",
  },
  {
    argv: '. --wave "BULB QUEEN" --creature petals=6',
    what: "a phase read off the boss's own body",
  },
  { argv: "<sha> --wave 2 --opening intro --frames 8 --stride 6", what: "its opening" },
  { argv: "<sha> --wave 7 --opening guide --guide-page 3", what: "a later page of a rehearsal" },
  {
    argv: "<sha> --wave 21 --out docs/frames/<sha>",
    what: "where the pictures go; docs/frames/<sha> is the default",
  },
];

/** The recipes as `--help` prints them: the command, and under it what it is for. */
export function recipeHelp(): string {
  const lines = RECIPES.map(recipeEntry);
  return ['bun run frames <sha>|. --wave N|"NAME" [flags] — recipes:', "", ...lines].join("\n");
}

/** One recipe as `--help` prints it. */
export function recipeEntry(r: Recipe): string {
  return `  bun run frames ${r.argv}\n      ${r.what}`;
}
