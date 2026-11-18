const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const cwd = path.resolve(__dirname, '..');

test('console messaging requires explicit opt-in and sends no external requests', () => {
  const result = spawnSync(process.execPath, ['-e', `
    const assert = require('node:assert/strict');
    const { sendWhatsApp, isConsoleMode } = require('./config/messaging');
    assert.equal(isConsoleMode, true);
    sendWhatsApp('7000000000', 'test').catch(() => process.exit(1));
  `], { cwd, env: { ...process.env, NODE_ENV: 'development', MESSAGING_MODE: 'console' } });
  assert.equal(result.status, 0, result.stderr.toString());
});

test('production refuses console OTP mode', () => {
  const result = spawnSync(process.execPath, ['-e', "require('./config/messaging')"], {
    cwd, env: { ...process.env, NODE_ENV: 'production', MESSAGING_MODE: 'console' },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr.toString(), /must not be used in production/);
});
