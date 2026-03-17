"""Frontend integration test fixtures.

Starts the admin backend (0_admin), image service (11_images), and
gateway (10_gateway), seeds the database via REST, then runs Playwright
tests against the real frontend served by Vite.
"""
import json
import os
import subprocess
import sys
import time

import pytest
import requests

INTEGRATION_DIR = os.path.dirname(os.path.abspath(__file__))
GRAMS_DIR = os.path.normpath(os.path.join(INTEGRATION_DIR, "..", "grams"))
GFRONT_DIR = os.path.normpath(os.path.join(INTEGRATION_DIR, "..", "gfront", "admin"))

STARTUP_ORDER = [
    "0_admin",
    "11_images",
    "10_gateway",
]


def build_services_json(ports):
    """Build services.json for the gateway — only admin + images."""
    return {
        "admin": f"http://127.0.0.1:{ports['0_admin']}",
        "images": f"http://127.0.0.1:{ports['11_images']}",
    }


def backup_and_overwrite(file_path, new_content, originals):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            originals[file_path] = f.read()
    with open(file_path, "w") as f:
        json.dump(new_content, f, indent=2)


def restore_originals(originals):
    for path, content in originals.items():
        try:
            with open(path, "w") as f:
                f.write(content)
        except OSError:
            pass


def clean_db_files(directories):
    for d in directories:
        if not os.path.isdir(d):
            continue
        for fname in os.listdir(d):
            if fname.endswith(".db"):
                try:
                    os.remove(os.path.join(d, fname))
                except OSError:
                    pass


def wait_for_service(url, timeout=15):
    start = time.time()
    while time.time() - start < timeout:
        try:
            resp = requests.get(url, timeout=2)
            if resp.status_code < 500:
                return True
        except requests.ConnectionError:
            pass
        time.sleep(0.3)
    return False


@pytest.fixture(scope="session")
def backend_services():
    """Start backend services, seed data, yield config, then tear down."""
    with open(os.path.join(INTEGRATION_DIR, "port_config.json")) as f:
        ports = json.load(f)

    db_dirs = [INTEGRATION_DIR] + [
        os.path.join(GRAMS_DIR, m) for m in STARTUP_ORDER
    ]
    clean_db_files(db_dirs)

    original_files = {}
    processes = {}
    log_handles = {}

    try:
        # Overwrite gateway services.json
        svc_path = os.path.join(GRAMS_DIR, "10_gateway", "services.json")
        backup_and_overwrite(svc_path, build_services_json(ports), original_files)

        # Start each service as a subprocess in its own directory
        for module_name in STARTUP_ORDER:
            port = ports[module_name]
            module_dir = os.path.join(GRAMS_DIR, module_name)

            log_path = os.path.join(INTEGRATION_DIR, f"{module_name}.log")
            lf = open(log_path, "w")
            log_handles[module_name] = lf

            proc = subprocess.Popen(
                [sys.executable, "-m", "flask", "--app", "src.app.app",
                 "run", "--port", str(port), "--no-reload"],
                cwd=module_dir,
                stdout=lf,
                stderr=lf,
                env={**os.environ, "FLASK_ENV": "testing"},
            )
            processes[module_name] = proc

            check_url = f"http://127.0.0.1:{port}/"
            if module_name == "10_gateway":
                check_url = f"http://127.0.0.1:{port}/health"

            if not wait_for_service(check_url):
                lf.flush()
                pytest.fail(
                    f"Service {module_name} failed to start on port {port}. "
                    f"Check {log_path} for details."
                )

        # Seed data via REST
        admin_url = f"http://127.0.0.1:{ports['0_admin']}"
        from seed_data import seed_admin
        seed_admin(admin_url)

        gateway_url = f"http://127.0.0.1:{ports['10_gateway']}"
        yield {"base_urls": {n: f"http://127.0.0.1:{ports[n]}" for n in STARTUP_ORDER}, "gateway_url": gateway_url}

    finally:
        for name, proc in processes.items():
            try:
                proc.kill()
                proc.wait(timeout=5)
            except (OSError, subprocess.TimeoutExpired):
                pass

        for lf in log_handles.values():
            lf.close()

        restore_originals(original_files)

        time.sleep(0.5)
        clean_db_files(db_dirs)


@pytest.fixture(scope="session")
def gateway_url(backend_services):
    return backend_services["gateway_url"]
