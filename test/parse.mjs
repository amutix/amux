/**
 * Test that all TypeScript files parse correctly with Pi's jiti loader.
 * Usage: npm test
 */
import { createJiti } from "/home/reza/.nvm/versions/node/v24.3.0/lib/node_modules/@earendil-works/pi-coding-agent/node_modules/jiti/lib/jiti.mjs";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jiti = createJiti(import.meta.url);
let failed = false;

// Test core/ and pi/ directories
for (const dir of ["core", "pi"]) {
  const fullDir = join(__dirname, "..", dir);
  const files = readdirSync(fullDir).filter((f) => f.endsWith(".ts"));

  for (const file of files) {
    try {
      jiti(join(fullDir, file));
      console.log(`  ✓ ${dir}/${file}`);
    } catch (e) {
      const msg = e.message ?? "";
      if (msg.includes("ParseError") || msg.includes("Unexpected token")) {
        console.log(`  ✗ ${dir}/${file}: ${msg.slice(0, 200)}`);
        failed = true;
      } else {
        console.log(`  ✓ ${dir}/${file} (parsed, runtime dep expected)`);
      }
    }
  }
}

if (failed) {
  console.log("\nFAILED: Fix parse errors above.");
  process.exit(1);
} else {
  console.log("\nAll files parse correctly.");
}
