import tseslint from "typescript-eslint";

/**
 * The two rules that keep the project deterministic live here, not in prose.
 * A rule in CLAUDE.md is a hint; a lint error is binding.
 */
export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "legacy/**"] },
  ...tseslint.configs.recommended,
  {
    files: ["packages/sim/**/*.ts", "packages/content/**/*.ts"],
    rules: {
      // sim/ and content/ must never reach into rendering, the DOM or wall-clock time.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@neon-spore/render", "@neon-spore/render/*"], message: "sim must not import render. State flows one way: sim -> render." },
            { group: ["**/render/**"], message: "sim must not import render. State flows one way: sim -> render." },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "performance", message: "Non-deterministic. Use the simulation clock (beat + tick) instead." },
        { name: "window", message: "sim is headless. No DOM." },
        { name: "document", message: "sim is headless. No DOM." },
        { name: "requestAnimationFrame", message: "sim is headless. The host drives ticks." },
      ],
      "no-restricted-syntax": [
        "error",
        { selector: "MemberExpression[object.name='Math'][property.name='random']", message: "Non-deterministic. Use the seeded Rng from @neon-spore/sim." },
        { selector: "MemberExpression[object.name='Date'][property.name='now']", message: "Non-deterministic. Use the simulation clock (beat + tick) instead." },
        { selector: "NewExpression[callee.name='Date']", message: "Non-deterministic. Use the simulation clock (beat + tick) instead." },
      ],
    },
  },
);
