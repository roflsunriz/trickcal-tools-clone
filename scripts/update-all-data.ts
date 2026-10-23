import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) throw new Error("使い方: bun run data:update [--check]");

const scripts = ["scripts/update-sweep-data.ts", "scripts/update-community-data.ts"];
let failed = false;
for (const script of scripts) {
  const processResult = spawnSync(process.execPath, [script, ...args], {
    cwd: process.cwd(),
    stdio: "inherit",
  });
  if (processResult.status !== 0) failed = true;
}
if (failed) process.exitCode = 1;
