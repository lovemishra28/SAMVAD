import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const PORTS = [3000, 5000, 5001, 8081];

export const freePorts = () => {
  for (const port of PORTS) {
    try {
      if (process.platform === 'win32') {
        const out = spawnSync('cmd.exe', ['/c', `netstat -ano | findstr :${port}`], { encoding: 'utf8' }).stdout || '';
        const pids = [...new Set(out.split('\n').map(l => l.trim().split(/\s+/).pop()).filter(Boolean))];
        for (const pid of pids) if (pid && pid !== '0') spawnSync('taskkill', ['/pid', pid, '/F']);
      } else {
        spawnSync('sh', ['-c', `fuser -k ${port}/tcp 2>/dev/null || lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true`]);
      }
    } catch { /* ignore */ }
  }
};

// Clear any stale processes holding dev ports before launching
freePorts();

const children = [];
let stopping = false;
const stop = (code = 0) => {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (process.platform === 'win32') {
      try { spawn('taskkill', ['/pid', String(child.pid), '/T', '/F']); } catch {}
    } else {
      try { process.kill(-child.pid, 'SIGTERM'); } catch { /* already stopped */ }
    }
  }
  setTimeout(() => {
    freePorts();
    process.exit(code);
  }, 400).unref();
};
for (const [directory, args] of [
  ['SAMVAD-BACKEND', ['run', 'dev']],
  ['SAMVAD-Web', ['run', 'dev']],
  ['SAMVAD-Mobile', ['start', '--', '--no-interactive']],
]) {
  const child = spawn(npm, args, {
    cwd: `${root}/${directory}`, stdio: 'inherit',
    detached: process.platform !== 'win32', shell: process.platform === 'win32',
  });
  children.push(child);
  child.on('error', (error) => { console.error(error.message); stop(1); });
  child.on('exit', (code) => { if (!stopping) stop(code || 1); });
}
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop());
