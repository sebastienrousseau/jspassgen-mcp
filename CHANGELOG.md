<!-- SPDX-License-Identifier: Apache-2.0 OR MIT -->

# Changelog

All notable changes to this project are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions
advance in `0.0.1` steps in lockstep with the jspassgen suite.

## [0.0.25] - Unreleased

### Fixed

- The release notes' checksums list `SHA256SUMS` itself, so every
  asset attached to a release has its SHA-256 in the notes. The 0.0.23
  and 0.0.24 notes omitted it; the 0.0.24 notes were corrected.

## [0.0.24] - 2026-11-21

### Added

- Releases carry their SLSA build provenance. The release workflow
  attests every release file with `actions/attest-build-provenance`,
  signed through Sigstore and stored as a GitHub attestation, and
  attaches the bundle, listed in the release checksums, as
  `jspassgen-mcp-<version>.intoto.jsonl`. Check a download with
  `gh attestation verify <file> --repo sebastienrousseau/jspassgen-mcp`.
  This answers the OpenSSF Scorecard Signed-Releases check.

### Changed

- Requires `@sebastienrousseau/jspassgen` 0.0.24, pinned exactly, the
  suite's third lockstep release.

## [0.0.23] - 2026-11-20

The jspassgen suite's second lockstep version. The server and its tool
are unchanged; they now run on `@sebastienrousseau/jspassgen` 0.0.23.

### Added

- Property-based tests with fast-check 4.10.2
  (`test/tools.property.test.js`) that call `generate_password` through
  an MCP client with generated input: every length from 1 to 1024 gives
  a base64 password of that length with 6 bits of entropy per
  character, every other length value is refused with no password, and
  the structured result always describes the password it carries. They
  run in `make check` and answer the OpenSSF Scorecard Fuzzing check.
- `.github/CODEOWNERS` names the maintainer as owner of every file, so
  the `main` ruleset can require a code-owner review.

### Changed

- `@sebastienrousseau/jspassgen` is pinned to 0.0.23, the suite's
  second lockstep release, in place of 0.0.22.

## [0.0.22] - 2026-11-18

The first version of this repository, at the first jspassgen suite
release.

### Added

- A stdio MCP server (`bin/jspassgen-mcp.js`) on
  `@modelcontextprotocol/sdk` 1.32.2, with one tool, `generate_password`:
  a base64-alphabet password of 1 to 1024 characters from
  `@sebastienrousseau/jspassgen` 0.0.22, with jspassgen's entropy
  estimate. The length bounds are read from jspassgen.
- Tests over an in-memory transport and over real stdio, at 100%
  coverage; the stdio test fails on any output outside the protocol.
- `examples/generate-password.mjs`, an MCP client over stdio, and the
  README demo rendered from it.
- The suite's repository standard: AGENTS.md, CITATION.cff, the
  community and security policies, DCO, REUSE, KEYS.asc, the Makefile
  gate, and the CI, CodeQL, DCO, docs-lint and Scorecard workflows with
  every action pinned by commit SHA.
