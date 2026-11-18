export async function fetchApplications(schemeId) {
  const url = `/api/applications?schemeId=${encodeURIComponent(schemeId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch applications: ${res.status}`);
  }
  const data = await res.json();
  return data.applications || [];
}

export async function createApplication(payload) {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create application (${res.status})`);
  }
  const data = await res.json();
  return data.application;
}

export async function fetchApplicationAnalytics(schemeId) {
  const url = `/api/applications/analytics?schemeId=${encodeURIComponent(schemeId)}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch application analytics: ${res.status}`);
  }
  const data = await res.json();
  return data.analytics || {};
}
