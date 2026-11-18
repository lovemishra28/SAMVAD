import assert from 'node:assert/strict';

const backend = process.env.BACKEND_URL || 'http://127.0.0.1:5000';
const web = process.env.WEB_URL || 'http://localhost:3000';
const ml = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5001';
const json = async (url, options) => {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(60000) });
  assert.ok(response.ok, `${url}: HTTP ${response.status} ${await response.clone().text()}`);
  return response.json();
};

assert.equal((await json(`${backend}/health`)).database, 'connected');
assert.equal((await json(`${ml}/health`)).status, 'healthy');
const predictions = await json(`${ml}/predict`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ voters: [{ age: 22, gender: 'Male', area_type: 'Urban', issue: 'education' }] }),
});
assert.equal(predictions.predictions.length, 1);
const booths = await json(`${web}/api/booths/list`);
assert.ok(booths.success && booths.booths.length, 'Seeded booths must be returned through the web proxy');
const boothId = encodeURIComponent(booths.booths[0].id);
const schemes = await json(`${web}/api/schemes`);
assert.ok(schemes.schemes.length, 'Seeded schemes must exist');
const schemeId = encodeURIComponent(schemes.schemes[0].id);
for (const endpoint of [
  `/api/voters?boothId=${boothId}`, `/api/booth/${boothId}/analyze`, `/api/dashboard/${boothId}`,
  '/api/schemes', '/api/notifications', '/api/notifications/summary', '/api/notifications/log-categories',
  '/api/campaigns', `/api/applications?schemeId=${schemeId}`,
  `/api/applications/analytics?schemeId=${schemeId}`, `/api/schemes/${schemeId}`,
  '/api/feedback', '/api/feedback/scheme-summary',
]) {
  const data = await json(`${web}${endpoint}`);
  assert.equal(data.success, true, endpoint);
  console.log(`PASS ${endpoint}`);
}
const protectedResponse = await fetch(`${backend}/api/mobile/schemes`);
assert.equal(protectedResponse.status, 401, 'Mobile routes require authentication');
for (const route of ['/', '/booth-selection', '/dashboard', '/schemes', `/schemes/${schemeId}`, '/feedback', '/notifications', '/fetch-data', '/processing']) {
  const response = await fetch(`${web}${route}`, { signal: AbortSignal.timeout(60000) });
  assert.ok(response.ok, `${route}: ${response.status}`);
  assert.match(await response.text(), /SAMVAD/);
  console.log(`PASS page ${route}`);
}
console.log(`\nSmoke checks passed: MongoDB, ML prediction, ${booths.booths.length} booths, web/API routes and mobile auth protection.`);
