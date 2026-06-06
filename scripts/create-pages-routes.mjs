import { copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const distDir = "dist";
const routes = ["sweep"];

for (const route of routes) {
  const routeDir = join(distDir, route);
  await mkdir(routeDir, { recursive: true });
  await copyFile(join(distDir, "index.html"), join(routeDir, "index.html"));
}
