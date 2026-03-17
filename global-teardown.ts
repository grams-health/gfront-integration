/**
 * Playwright global teardown — kill backends and restore config files.
 */
import * as fs from "fs";

export default async function globalTeardown() {
  const info = (globalThis as any).__gfrontIntegration;
  if (!info) return;

  for (const proc of info.processes) {
    try { proc.kill("SIGKILL"); } catch {}
  }

  try { fs.writeFileSync(info.svcPath, info.originalServices); } catch {}
}
