import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const run = (command, args, cwd = root) => {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || `${command} failed (${result.status})`);
    process.exit(result.status || 1);
  }
};
if (Number(process.versions.node.split('.')[0]) < 22) {
  throw new Error('Use Node.js 22.11 or newer.');
}
for (const project of ['SAMVAD-BACKEND', 'SAMVAD-Web', 'SAMVAD-Mobile']) {
  const cwd = path.join(root, project);
  run(npm, [existsSync(path.join(cwd, 'package-lock.json')) ? 'ci' : 'install'], cwd);
}
const backend = path.join(root, 'SAMVAD-BACKEND');
const envPath = path.join(backend, '.env');
if (!existsSync(envPath)) {
  const template = readFileSync(path.join(backend, '.env.example'), 'utf8');
  writeFileSync(envPath, template.replace('JWT_SECRET=\n', `JWT_SECRET=${randomBytes(32).toString('hex')}\n`), { mode: 0o600 });
}
const webEnv = path.join(root, 'SAMVAD-Web', '.env.local');
if (!existsSync(webEnv)) {
  writeFileSync(webEnv, readFileSync(path.join(root, 'SAMVAD-Web', '.env.example')));
}
const venv = path.join(backend, '.venv');
const python = path.join(venv, process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
if (!existsSync(python)) run(process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3'), ['-m', 'venv', venv]);
run(python, ['-m', 'pip', 'install', '-r', 'ml/requirements.txt'], backend);
run(python, ['-c', 'import joblib; joblib.load("ml/voter_classifier.pkl")'], backend);

const sdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
const localProperties = path.join(root, 'SAMVAD-Mobile', 'android', 'local.properties');
if (sdk && !existsSync(localProperties)) {
  writeFileSync(localProperties, `sdk.dir=${sdk.replace(/\\/g, '/')}\n`);
}
run(process.execPath, ['scripts/database.mjs']);
run(npm, ['run', 'seed'], backend);
console.log('\nSetup complete. Run npm run dev, then npm run android in another terminal.');
