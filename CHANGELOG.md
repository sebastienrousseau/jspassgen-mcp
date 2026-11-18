<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
advance in `0.0.1` steps in lockstep with the jspassgen suite.

## [0.0.22] - Unreleased

The first version of this repository, planned for the first jspassgen
suite release. Not published to npm.

### Added

- A stdio MCP server (`bin/jspassgen-mcp.js`) on
  `@modelcontextprotocol/sdk` 1.32.2, with one tool, `generate_password`:
  a base64-alphabet password of 1 to 1024 characters from
  `@sebastienrousseau/jspassgen` 0.0.20, with jspassgen's entropy
  estimate. The length bounds are read from jspassgen.
- Tests over an in-memory transport and over real stdio, at 100%
  coverage; the stdio test fails on any output outside the protocol.
- `examples/generate-password.mjs`, an MCP client over stdio, and the
  README demo rendered from it.
- The suite's repository standard: AGENTS.md, CITATION.cff, the
  community and security policies, DCO, REUSE, KEYS.asc, the Makefile
  gate, and the CI, CodeQL, DCO, docs-lint and Scorecard workflows with
  every action pinned by commit SHA.
