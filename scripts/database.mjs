import { spawnSync } from 'node:child_process';

const run = (args, options = {}) => spawnSync('docker', args, { encoding: 'utf8', ...options });
const info = run(['info', '--format', '{{.ServerVersion}}']);
if (info.status !== 0) {
  console.error('Docker is unavailable. Start Docker, or configure your own MONGODB_URL and start services individually.');
  process.exit(1);
}
const existing = run(['inspect', '--format', '{{.State.Running}}', 'samvad-mongodb']);
if (existing.status === 0 && existing.stdout.trim() === 'true') {
  console.log('SAMVAD MongoDB is already running (localhost:27017).');
} else {
  const args = existing.status === 0
    ? ['start', 'samvad-mongodb']
    : ['run', '-d', '--name', 'samvad-mongodb', '-p', '127.0.0.1:27017:27017',
      '-v', 'samvad-mongodb-data:/data/db', 'mongo:8.0'];
  const result = run(args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
