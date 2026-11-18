<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Contributing

Thanks for looking. This package exposes
[jspassgen](https://github.com/sebastienrousseau/jspassgen) to MCP
clients over stdio. Password generation belongs in jspassgen; a change
here should make the server more correct, safer or easier to use.

## Before you open a pull request

Everything CI checks, you can run locally (`mise install` provides
Node.js):

```sh
make install          # npm ci
make check            # ESLint, Prettier, Halstead, tests at 100% coverage, the example, the README check
make audit            # npm audit
```

## The README demo

`make demo` renders `.github/demo.gif` from `.github/demo.tape` with
[VHS](https://github.com/charmbracelet/vhs) (it needs `vhs`, `ttyd` and
`ffmpeg`). It runs `examples/generate-password.mjs`, so it shows real
output. Re-render the GIF in the same change as anything that alters
what it shows.

## Rules

- **No generation logic here.** Call jspassgen; add a capability there
  first.
- **stdout is the protocol.** Never write to stdout or stderr from the
  server; `test/stdio.test.js` fails if anything appears.
- **Never log or echo a secret**, in a message, an error or a test
  snapshot.
- **Complexity ceilings.** Every function stays within cyclomatic 10,
  cognitive 15, Halstead difficulty 30 and 60 lines, and every file within
  500 lines (`make lint complexity`).
- **100% coverage.** `make test` fails below 100%; add the test with the
  code, in the same commit.
- **No suppressions.** Fix the cause rather than adding an
  `eslint-disable`; a justified exception is a specific inline rule with
  a reason.

## Commits

Conventional commits (`feat:`, `fix:`, `docs:`, `ci:`, `test:`,
`chore:`), an imperative subject of at most 50 characters, and a body
wrapped at 72 characters that explains what and why. Every commit
carries a `Signed-off-by:` trailer (`git commit -s`), which certifies
the [DCO](DCO.txt), and is signed.

## Versioning

**Versions increment by 0.0.1**, in lockstep with the jspassgen suite.
The version lives in `package.json`; [AGENTS.md](AGENTS.md) lists where
it is restated, and [DEVELOPMENT.md](DEVELOPMENT.md) describes the
release model.

## Licence

Apache-2.0 OR MIT, at your option. By contributing you agree your work is
released under the same dual grant.
