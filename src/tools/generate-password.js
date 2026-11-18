// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * The `generate_password` tool. It validates its input and hands the
 * request to @sebastienrousseau/jspassgen; it has no generation logic of
 * its own. The password goes back to the calling client only: nothing
 * here logs, and an error message never repeats a generated value.
 *
 * @module tools/generate-password
 */

import {
  createService,
  PASSWORD_TYPES,
  PASSWORD_TYPE_METADATA,
} from "@sebastienrousseau/jspassgen/core";
import { NodeCryptoRandom } from "@sebastienrousseau/jspassgen/adapters/node";
import * as z from "zod";

/** The password type this tool asks jspassgen for. */
export const PASSWORD_TYPE = PASSWORD_TYPES.STRONG;

const { minLength, maxLength } = PASSWORD_TYPE_METADATA[PASSWORD_TYPE];

/** Length bounds, read from jspassgen so they cannot drift from it. */
export const LENGTH_LIMITS = Object.freeze({ min: minLength, max: maxLength });

/** The tool's name, as clients call it. */
export const TOOL_NAME = "generate_password";

/** Input: an optional whole-number length within jspassgen's bounds. */
export const inputSchema = {
  length: z
    .number()
    .int()
    .min(minLength)
    .max(maxLength)
    .optional()
    .describe(
      `Number of characters, ${minLength} to ${maxLength}. ` +
        "jspassgen's default (16) applies when omitted.",
    ),
};

/** Output: the password and jspassgen's entropy estimate for it. */
export const outputSchema = {
  password: z.string().describe("The generated password."),
  length: z.number().int().describe("Number of characters in the password."),
  entropyBits: z.number().describe("Entropy estimate from jspassgen, in bits."),
  securityLevel: z.string().describe("jspassgen's rating of that entropy."),
};

/** The tool's metadata for `registerTool`. */
export const toolConfig = {
  title: "Generate a password",
  description:
    "Generate a random password with jspassgen from the operating system's " +
    "CSPRNG (base64 alphabet). The password is returned to this client only " +
    "and is never logged.",
  inputSchema,
  outputSchema,
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
};

/**
 * Build the tool handler around a jspassgen service.
 *
 * @param {object} [service] A jspassgen core service; by default one
 *   backed by Node.js `crypto` (`NodeCryptoRandom`).
 * @returns {(args: {length?: number}) => Promise<object>} The handler.
 */
export function createGeneratePasswordHandler(
  service = createService({}, { randomGenerator: new NodeCryptoRandom() }),
) {
  return async function generatePassword({ length }) {
    const result = await service.generate({
      type: PASSWORD_TYPE,
      length,
      iteration: 1,
      separator: "",
      includeEntropy: true,
    });
    const structuredContent = {
      password: result.password,
      length: result.password.length,
      entropyBits: result.entropy,
      securityLevel: result.securityLevel,
    };
    return {
      content: [{ type: "text", text: result.password }],
      structuredContent,
    };
  };
}
