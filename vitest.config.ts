import { defineConfig } from"vitest/config";
import { fileURLToPath } from"node:url";

// Resolve the"@/..."path alias the app uses so tests can import lib modules.
export default defineConfig({
 resolve: {
 alias: {
"@": fileURLToPath(new URL(".", import.meta.url)),
 },
 },
 test: {
 include: ["lib/**/*.test.ts","indexer/**/*.test.ts"],
 environment:"node",
 },
});
