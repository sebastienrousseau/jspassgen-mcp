// SPDX-License-Identifier: Apache-2.0 OR MIT
//
// ESLint flat config. Beyond the recommended rules it enforces the
// complexity ceilings of ~/Code/AGENTS.md §0 on every function:
// cyclomatic 10, cognitive 15 (SonarSource), 60 lines, and 500 lines per
// file. Halstead difficulty (30) has no ESLint rule; scripts/halstead.mjs
// measures it. Formatting is Prettier's job (`npm run format:check`).

import js from "@eslint/js";
import sonarjs from "eslint-plugin-sonarjs";
import globals from "globals";

export default [
  { ignores: ["coverage/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    plugins: { sonarjs },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      complexity: ["error", 10],
      "sonarjs/cognitive-complexity": ["error", 15],
      "max-lines-per-function": [
        "error",
        { max: 60, skipBlankLines: true, skipComments: true },
      ],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "no-console": "error",
      eqeqeq: "error",
      curly: "error",
    },
  },
  {
    // Mocha supplies the test globals; every ceiling above still
    // applies to tests, `describe` callbacks included.
    files: ["test/**/*.js"],
    languageOptions: { globals: { ...globals.mocha } },
  },
];
