# SPDX-License-Identifier: Apache-2.0 OR MIT
#
# `make check` is the gate: ESLint (with the cyclomatic, cognitive and
# length ceilings), Prettier, Halstead difficulty, the mocha suite at
# 100% coverage (c8), the example and the README template check. `make
# audit` runs npm audit, which needs the registry; CI runs it on every
# push. Run `make install` (npm ci) first.

NPM ?= npm

.PHONY: check install lint format format-check complexity test examples \
  readme-check audit pack demo clean

check: lint format-check complexity test examples readme-check

install:
	$(NPM) ci

lint:
	$(NPM) run lint

format:
	$(NPM) run format

format-check:
	$(NPM) run format:check

# Halstead difficulty <= 30 per function (scripts/halstead.mjs); ESLint
# enforces the other ceilings in `make lint`.
complexity:
	$(NPM) run complexity

# Unit and stdio tests, gated at 100% statements, branches, functions
# and lines.
test:
	$(NPM) test

# Every example, end to end over stdio.
examples:
	node examples/generate-password.mjs 24

readme-check:
	./scripts/readme-check.sh

audit:
	$(NPM) audit --audit-level=low

# The tarball npm would publish, listed without writing it.
pack:
	$(NPM) pack --dry-run

# Render .github/demo.gif with vhs (https://github.com/charmbracelet/vhs).
demo:
	@command -v vhs >/dev/null 2>&1 || { echo "demo: vhs not found (https://github.com/charmbracelet/vhs)"; exit 1; }
	vhs .github/demo.tape

clean:
	rm -rf coverage .nyc_output *.tgz
