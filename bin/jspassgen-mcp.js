#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0 OR MIT

// Serve the jspassgen tools over stdio. stdout carries the MCP protocol
// and nothing else; this process writes no logs.

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "../src/server.js";

await createServer().connect(new StdioServerTransport());
