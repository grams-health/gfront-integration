/**
 * Playwright global setup — start backend services and seed data.
 */
import { execSync, spawn, type ChildProcess } from "child_process";
import * as fs from "fs";
import * as path from "path";

const INTEGRATION_DIR = __dirname;
const GRAMS_DIR = path.resolve(INTEGRATION_DIR, "..", "grams");
const PORT_CONFIG = JSON.parse(
  fs.readFileSync(path.join(INTEGRATION_DIR, "port_config.json"), "utf-8")
);

function waitForService(url: string, timeoutMs = 15000): Promise<boolean> {
  const start = Date.now();
  return new Promise((resolve) => {
    const check = () => {
      fetch(url)
        .then((res) => {
          if (res.status < 500) resolve(true);
          else if (Date.now() - start > timeoutMs) resolve(false);
          else setTimeout(check, 300);
        })
        .catch(() => {
          if (Date.now() - start > timeoutMs) resolve(false);
          else setTimeout(check, 300);
        });
    };
    check();
  });
}

export default async function globalSetup() {
  const svcPath = path.join(GRAMS_DIR, "10_gateway", "services.json");
  const originalServices = fs.readFileSync(svcPath, "utf-8");

  // Write gateway services.json with only admin + images
  fs.writeFileSync(svcPath, JSON.stringify({
    admin: `http://127.0.0.1:${PORT_CONFIG["0_admin"]}`,
    images: `http://127.0.0.1:${PORT_CONFIG["11_images"]}`,
  }, null, 2));

  // Start services
  const services = [
    { name: "0_admin", port: PORT_CONFIG["0_admin"] },
    { name: "11_images", port: PORT_CONFIG["11_images"] },
    { name: "10_gateway", port: PORT_CONFIG["10_gateway"] },
  ];

  const processes: ChildProcess[] = [];

  for (const svc of services) {
    const cwd = path.join(GRAMS_DIR, svc.name);
    const logFile = fs.openSync(path.join(INTEGRATION_DIR, `${svc.name}.log`), "w");
    const proc = spawn(
      "python3",
      ["-m", "flask", "--app", "src.app.app", "run", "--port", String(svc.port), "--no-reload"],
      { cwd, stdio: ["ignore", logFile, logFile], env: { ...process.env, FLASK_ENV: "testing" } }
    );
    processes.push(proc);

    const checkUrl = svc.name === "10_gateway"
      ? `http://127.0.0.1:${svc.port}/health`
      : `http://127.0.0.1:${svc.port}/`;

    const up = await waitForService(checkUrl);
    if (!up) throw new Error(`${svc.name} failed to start on port ${svc.port}. Check ${svc.name}.log`);
  }

  // Seed data via REST
  execSync(`python3 -c "from seed_data import seed_admin; seed_admin('http://127.0.0.1:${PORT_CONFIG["0_admin"]}')"`, {
    cwd: INTEGRATION_DIR,
  });

  // Store for teardown
  (globalThis as any).__gfrontIntegration = { processes, originalServices, svcPath };
}
