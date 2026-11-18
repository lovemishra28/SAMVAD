// End-to-end mobile API checks use an isolated, local-only database.
// No real messages are sent and samvad_local is not modified.
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../SAMVAD-BACKEND', import.meta.url));
const env = {
  ...process.env, NODE_ENV: 'test', PORT: '5002', MESSAGING_MODE: 'console',
  MONGODB_URL: 'mongodb://127.0.0.1:27017/samvad_smoke',
  JWT_SECRET: randomBytes(32).toString('hex'), ML_SERVICE_URL: 'http://127.0.0.1:5001',
};
const seed = spawnSync(process.execPath, ['importData.js'], { cwd, env, stdio: 'inherit' });
assert.equal(seed.status, 0, 'Test database seed failed');
const server = spawn(process.execPath, ['index.js'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
let output = '';
server.stdout.on('data', chunk => { output += chunk; });
server.stderr.on('data', chunk => { output += chunk; });
const waitForOutput = pattern => new Promise((resolve, reject) => {
  const timer = setTimeout(() => done(new Error(`Timed out waiting for ${pattern}\n${output}`)), 20000);
  const check = () => { if (pattern.test(output)) done(); };
  const exited = () => done(new Error(`Test server exited\n${output}`));
  const done = error => {
    clearTimeout(timer);
    server.stdout.off('data', check);
    server.off('exit', exited);
    error ? reject(error) : resolve();
  };
  server.stdout.on('data', check);
  server.once('exit', exited);
  check();
});
let token;
const request = async (endpoint, method = 'GET', body) => {
  const response = await fetch(`http://127.0.0.1:5002${endpoint}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(60000),
  });
  const data = await response.json();
  assert.ok(response.ok && data.success, `${method} ${endpoint}: ${response.status} ${JSON.stringify(data)}`);
  return data;
};
try {
  await waitForOutput(/Server running on port 5002/);
  const mobileNumber = '7000000000';
  await request('/api/auth/send-otp', 'POST', { mobileNumber });
  await waitForOutput(/\[DEV OTP\] 7000000000: (\d{6})/);
  const otp = output.match(/\[DEV OTP\] 7000000000: (\d{6})/)[1];
  const verified = await request('/api/auth/verify-otp', 'POST', { mobileNumber, otp });
  token = verified.token;
  assert.ok(token);
  const me = await request('/api/auth/me');
  assert.equal(me.user.mobileNumber, mobileNumber);
  await request('/api/auth/update-profile', 'PUT', {
    occupation: 'Student', interests: ['technology', 'education'],
    incomeRange: 'below_1_5', pwdStatus: false, bplStatus: false, scstStatus: false,
  });
  const { schemes } = await request('/api/mobile/schemes');
  assert.ok(schemes.length, 'Seeded student should have relevant active schemes');
  const scheme = schemes[0];
  const payload = { schemeId: scheme.scheme_id, schemeName: scheme.scheme_name, comments: 'Isolated smoke test' };
  await request('/api/mobile/apply', 'POST', payload);
  assert.equal((await request('/api/mobile/apply', 'POST', payload)).alreadyApplied, true);
  assert.equal((await request(`/api/mobile/schemes/${scheme.scheme_id}/applied-status`)).isApplied, true);
  assert.ok((await request('/api/mobile/applications')).applications.length);
  await request('/api/mobile/feedback', 'POST', {
    type: 'scheme_feedback', schemeId: scheme.scheme_id, schemeName: scheme.scheme_name,
    rating: 5, note: 'Isolated smoke test',
  });
  assert.ok((await request('/api/mobile/feedback/my')).feedback.length);
  await request('/api/notifications', 'POST', {
    category: 'Students', boothId: me.user.boothId, schemeIds: [scheme.scheme_id], deliveryMethod: 'sms',
  });
  assert.ok((await request('/api/mobile/notifications')).notifications.length);
  assert.equal((await request('/api/mobile/my-recommendations')).found, true);
  await request('/api/mobile/notifications/mark-all-read', 'PATCH');
  assert.equal((await request('/api/mobile/notifications')).unreadCount, 0);
  const campaign = await request('/api/campaigns', 'POST', {
    schemeId: scheme.scheme_id, type: 'launch', category: 'Students', boothId: me.user.boothId,
  });
  assert.ok(campaign.campaign.totalTargeted > 0);
  console.log('PASS mobile OTP/JWT, profile, schemes, application/duplicate check, feedback, notifications, recommendations and simulated campaign.');
} finally {
  if (server.exitCode === null) {
    const exited = once(server, 'exit');
    server.kill('SIGTERM');
    await exited;
  }
}
