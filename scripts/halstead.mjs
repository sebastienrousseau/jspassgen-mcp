#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0 OR MIT
//
// Halstead difficulty per function, D = (n1 / 2) * (N2 / n2), against
// the ceiling of 30 (~/Code/AGENTS.md §0). ESLint has no maintained rule
// for it, so this measures it from espree's tokens, the parser ESLint
// itself uses. The other ceilings (cyclomatic, cognitive, lines) are
// ESLint rules in eslint.config.js.
//
// Counting conventions, as in crypto-service's scripts/halstead.mjs:
// - operands are identifiers, literals, template parts, true, false,
//   null, this and super; every other token is an operator;
// - a bracket pair counts once, on its opening token;
// - a nested function is measured on its own and excluded from its
//   parent.
//
// There is no baseline: the repository has no offender, so any function
// over the ceiling fails the gate.
//
// Usage: node scripts/halstead.mjs <dir-or-file>...

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import * as espree from "espree";

const MAX = 30;
const FUNCTIONS = new Set([
  "FunctionDeclaration",
  "FunctionExpression",
  "ArrowFunctionExpression",
]);
const OPERAND_TYPES = new Set([
  "Identifier",
  "PrivateIdentifier",
  "Numeric",
  "String",
  "Template",
  "RegularExpression",
  "Boolean",
  "Null",
]);
const OPERAND_KEYWORDS = new Set(["this", "super"]);
const SKIPPED = new Set([")", "]", "}"]);

/** Every function node under `node`, outermost first. */
function functionsOf(node, found = []) {
  if (FUNCTIONS.has(node.type)) {
    found.push(node);
  }
  for (const value of Object.values(node)) {
    const children = Array.isArray(value) ? value : [value];
    for (const child of children) {
      if (child && typeof child.type === "string") {
        functionsOf(child, found);
      }
    }
  }
  return found;
}

/** Whether a token is an operand under the conventions above. */
function isOperand(token) {
  return (
    OPERAND_TYPES.has(token.type) ||
    (token.type === "Keyword" && OPERAND_KEYWORDS.has(token.value))
  );
}

/** Halstead difficulty of a token list, rounded to one decimal. */
export function difficulty(tokens) {
  const operators = new Set();
  const operands = new Set();
  let operandCount = 0;
  for (const token of tokens) {
    if (isOperand(token)) {
      operands.add(token.value);
      operandCount += 1;
    } else if (!SKIPPED.has(token.value)) {
      operators.add(token.value);
    }
  }
  if (operands.size === 0) {
    return 0;
  }
  const d = (operators.size / 2) * (operandCount / operands.size);
  return Math.round(d * 10) / 10;
}

/** The tokens of `fn`, without those of the functions nested in it. */
function ownTokens(fn, tokens, functions) {
  const nested = functions.filter(
    (other) => other !== fn && other.start >= fn.start && other.end <= fn.end,
  );
  const inside = (token, node) =>
    token.start >= node.start && token.end <= node.end;
  return tokens.filter(
    (token) => inside(token, fn) && !nested.some((n) => inside(token, n)),
  );
}

/** Measure every function in a source text; return the offenders. */
export function measure(text) {
  const ast = espree.parse(text, {
    ecmaVersion: "latest",
    sourceType: "module",
    tokens: true,
    range: true,
    loc: true,
  });
  const functions = functionsOf(ast);
  return functions
    .map((fn) => ({
      line: fn.loc.start.line,
      value: difficulty(ownTokens(fn, ast.tokens, functions)),
    }))
    .filter((result) => result.value > MAX);
}

/** Every .js and .mjs file under the given paths. */
function filesUnder(paths) {
  return paths.flatMap((path) => {
    if (statSync(path).isDirectory()) {
      return filesUnder(readdirSync(path).map((name) => join(path, name)));
    }
    return /\.m?js$/.test(path) ? [path] : [];
  });
}

/** Strip a leading shebang, which espree does not accept. */
function withoutShebang(text) {
  return text.startsWith("#!") ? text.replace(/^#!.*/, "") : text;
}

function main(paths) {
  const files = filesUnder(paths);
  const offenders = files.flatMap((file) =>
    measure(withoutShebang(readFileSync(file, "utf8"))).map(
      (result) => `${file}:${result.line}: Halstead difficulty ${result.value}`,
    ),
  );
  for (const offender of offenders) {
    process.stderr.write(`${offender} (ceiling ${MAX})\n`);
  }
  process.stdout.write(
    `halstead: ${files.length} files, ${offenders.length} over ${MAX}\n`,
  );
  process.exitCode = offenders.length === 0 ? 0 : 1;
}

if (import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2));
}
