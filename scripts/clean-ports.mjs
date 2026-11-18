import { spawnSync } from 'node:child_process';

const PORTS = [3000, 5000, 5001, 8081];
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
console.log('Ports 3000, 5000, 5001, 8081 are free.');
