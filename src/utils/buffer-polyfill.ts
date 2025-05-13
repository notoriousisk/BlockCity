/**
 * Buffer polyfill for browser environments
 *
 * This is required for TON libraries which depend on Node.js Buffer
 */

import { Buffer } from "buffer";

// Check if Buffer is already defined
if (typeof window !== "undefined" && !window.Buffer) {
  try {
    // Expose Buffer to the global scope
    window.Buffer = Buffer;

    console.log("Buffer polyfill successfully loaded");
  } catch (error) {
    console.error("Failed to load Buffer polyfill:", error);
  }
}
