const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const python = process.env.PYTHON_BIN || path.join(
  root, ".venv", process.platform === "win32" ? "Scripts/python.exe" : "bin/python"
);

if (!existsSync(python) && !process.env.PYTHON_BIN) {
  console.error("Python environment missing. Run npm run setup from the SAMVAD directory.");
  process.exit(1);
}

require("dotenv").config({ path: path.join(root, ".env") });
const child = spawn(python, process.argv.slice(2), { cwd: root, stdio: "inherit" });
child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});
child.on("exit", (code) => process.exit(code ?? 1));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
