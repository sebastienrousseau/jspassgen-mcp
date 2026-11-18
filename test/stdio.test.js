// SPDX-License-Identifier: Apache-2.0 OR MIT

import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { TOOL_NAME } from "../src/index.js";
import { BASE64 } from "./helpers.js";

const BIN = fileURLToPath(new URL("../bin/jspassgen-mcp.js", import.meta.url));

describe("bin/jspassgen-mcp.js over stdio", () => {
  let client;
  let transport;
  let stderr;
  let errors;

  beforeEach(async () => {
    stderr = "";
    errors = [];
    transport = new StdioClientTransport({
      command: process.execPath,
      args: [BIN],
      stderr: "pipe",
    });
    transport.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    client = new Client({ name: "jspassgen-mcp-test", version: "0.0.0" });
    client.onerror = (error) => errors.push(error);
    await client.connect(transport);
  });

  afterEach(async () => {
    await client.close();
  });

  it("generates a password and writes nothing outside the protocol", async () => {
    const result = await client.callTool({
      name: TOOL_NAME,
      arguments: { length: 32 },
    });
    const { password } = result.structuredContent;
    assert.equal(password.length, 32);
    assert.match(password, BASE64);
    // The client reports any stdout line that is not JSON-RPC as an
    // error; stderr must stay empty so no secret is logged.
    assert.deepEqual(errors, []);
    assert.equal(stderr, "");
  });
});
