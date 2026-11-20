// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Property-based tests of the `generate_password` tool, with fast-check.
 * They call the tool through a real MCP client over an in-memory
 * transport, with generated arguments, and check what a client relies
 * on: every length in jspassgen's bounds gives a base64 password of
 * exactly that length with jspassgen's entropy figure, every other
 * length value is refused as a tool error carrying no password, and the
 * structured result always describes the password it carries.
 */

import assert from "node:assert/strict";
import fc from "fast-check";
import {
  LENGTH_LIMITS,
  TOOL_NAME,
  createGeneratePasswordHandler,
} from "../src/index.js";
import { BASE64, connectInMemory } from "./helpers.js";

const { min, max } = LENGTH_LIMITS;

/** Whole numbers outside jspassgen's length bounds. */
const outOfRange = fc.oneof(
  fc.integer({ max: min - 1 }),
  fc.integer({ min: max + 1 }),
);

/** Values that are not a whole number at all (`undefined` is the default). */
const notWholeNumbers = fc.oneof(
  fc.double().filter((n) => !Number.isInteger(n)),
  fc.string(),
  fc.boolean(),
  fc.constant(null),
  fc.array(fc.integer({ min, max }), { maxLength: 2 }),
  fc.dictionary(fc.string(), fc.integer()),
);

describe("generate_password over MCP (fast-check)", () => {
  let connection;

  before(async () => {
    connection = await connectInMemory();
  });

  after(async () => {
    await connection.close();
  });

  /** Calls the tool with `length` as its only argument. */
  const call = (length) =>
    connection.client.callTool({ name: TOOL_NAME, arguments: { length } });

  /** Asserts that `result` is a refusal that carries no password. */
  const assertRefused = (result) => {
    assert.equal(result.isError, true);
    assert.equal(result.structuredContent, undefined);
    assert.equal(result.content.length, 1);
    assert.match(result.content[0].text, /length/i);
  };

  it("returns a base64 password of exactly the requested length", async () => {
    await fc.assert(
      fc.asyncProperty(fc.integer({ min, max }), async (length) => {
        const result = await call(length);
        assert.equal(result.isError, undefined);
        const { password, entropyBits } = result.structuredContent;
        assert.equal(password.length, length);
        assert.match(password, BASE64);
        assert.equal(result.structuredContent.length, length);
        assert.equal(entropyBits, length * 6);
        assert.deepEqual(result.content, [{ type: "text", text: password }]);
      }),
      { numRuns: 200 },
    );
  });

  it("refuses every whole number outside the length bounds", async () => {
    await fc.assert(
      fc.asyncProperty(outOfRange, async (length) => {
        assertRefused(await call(length));
      }),
    );
  });

  it("refuses every length that is not a whole number", async () => {
    await fc.assert(
      fc.asyncProperty(notWholeNumbers, async (length) => {
        assertRefused(await call(length));
      }),
    );
  });
});

describe("generate_password handler (fast-check)", () => {
  it("describes exactly the password jspassgen returned", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ unit: "binary", maxLength: max }),
        fc.double({ noNaN: true }),
        fc.string(),
        async (password, entropy, securityLevel) => {
          const service = {
            generate: async () => ({ password, entropy, securityLevel }),
          };
          const handler = createGeneratePasswordHandler(service);
          const result = await handler({});
          assert.deepEqual(result.structuredContent, {
            password,
            length: password.length,
            entropyBits: entropy,
            securityLevel,
          });
          assert.deepEqual(result.content, [{ type: "text", text: password }]);
        },
      ),
    );
  });
});
