// SPDX-License-Identifier: Apache-2.0 OR MIT

import assert from "node:assert/strict";
import {
  LENGTH_LIMITS,
  SERVER_NAME,
  SERVER_VERSION,
  TOOL_NAME,
} from "../src/index.js";
import pkg from "../package.json" with { type: "json" };
import { BASE64, connectInMemory } from "./helpers.js";

/**
 * Register hooks that give each test a fresh in-memory connection;
 * returns an accessor for the current client.
 */
function useClient() {
  let connection;
  beforeEach(async () => {
    connection = await connectInMemory();
  });
  afterEach(async () => {
    await connection.close();
  });
  return () => connection.client;
}

describe("jspassgen-mcp over an in-memory transport", () => {
  const current = useClient();
  let client;

  beforeEach(() => {
    client = current();
  });

  it("reports its name and the package version", () => {
    assert.deepEqual(client.getServerVersion(), {
      name: SERVER_NAME,
      version: pkg.version,
    });
    assert.equal(SERVER_VERSION, pkg.version);
  });

  it("lists generate_password with jspassgen's length bounds", async () => {
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((t) => t.name),
      [TOOL_NAME],
    );
    const length = tools[0].inputSchema.properties.length;
    assert.equal(length.type, "integer");
    assert.equal(length.minimum, LENGTH_LIMITS.min);
    assert.equal(length.maximum, LENGTH_LIMITS.max);
    assert.deepEqual(LENGTH_LIMITS, { min: 1, max: 1024 });
    assert.equal(tools[0].annotations.readOnlyHint, true);
    assert.equal(tools[0].annotations.openWorldHint, false);
  });

  for (const length of [1, 16, 64, 1024]) {
    it(`returns a ${length}-character base64 password`, async () => {
      const result = await client.callTool({
        name: TOOL_NAME,
        arguments: { length },
      });
      assert.equal(result.isError, undefined);
      const { password, entropyBits, securityLevel } = result.structuredContent;
      assert.equal(password.length, length);
      assert.match(password, BASE64);
      assert.equal(result.structuredContent.length, length);
      assert.equal(entropyBits, length * 6);
      assert.equal(typeof securityLevel, "string");
      assert.deepEqual(result.content, [{ type: "text", text: password }]);
    });
  }

  it("uses jspassgen's default length when none is given", async () => {
    const result = await client.callTool({ name: TOOL_NAME, arguments: {} });
    assert.equal(result.structuredContent.password.length, 16);
  });

  it("returns a different password on each call", async () => {
    const seen = new Set();
    for (let i = 0; i < 20; i += 1) {
      const result = await client.callTool({
        name: TOOL_NAME,
        arguments: { length: 24 },
      });
      seen.add(result.structuredContent.password);
    }
    assert.equal(seen.size, 20);
  });
});

describe("generate_password input validation", () => {
  const current = useClient();

  for (const length of [0, -1, 1025, 1.5, "16", null]) {
    it(`refuses length ${JSON.stringify(length)}`, async () => {
      const result = await current().callTool({
        name: TOOL_NAME,
        arguments: { length },
      });
      assert.equal(result.isError, true);
      assert.equal(result.structuredContent, undefined);
      assert.match(result.content[0].text, /length/i);
    });
  }
});

describe("jspassgen-mcp with an injected jspassgen service", () => {
  it("passes the request to jspassgen unchanged", async () => {
    const calls = [];
    const service = {
      async generate(options) {
        calls.push(options);
        return { password: "AAAA", entropy: 24, securityLevel: "WEAK" };
      },
    };
    const { client, close } = await connectInMemory({ service });
    try {
      const result = await client.callTool({
        name: TOOL_NAME,
        arguments: { length: 4 },
      });
      assert.deepEqual(calls, [
        {
          type: "strong",
          length: 4,
          iteration: 1,
          separator: "",
          includeEntropy: true,
        },
      ]);
      assert.deepEqual(result.structuredContent, {
        password: "AAAA",
        length: 4,
        entropyBits: 24,
        securityLevel: "WEAK",
      });
    } finally {
      await close();
    }
  });

  it("reports a jspassgen failure as a tool error", async () => {
    const service = {
      async generate() {
        throw new Error("Length must not exceed 1024");
      },
    };
    const { client, close } = await connectInMemory({ service });
    try {
      const result = await client.callTool({
        name: TOOL_NAME,
        arguments: { length: 8 },
      });
      assert.equal(result.isError, true);
      assert.match(result.content[0].text, /Length must not exceed 1024/);
    } finally {
      await close();
    }
  });
});
