export async function fetchCampaigns(schemeId) {
  const params = new URLSearchParams();
  if (schemeId) params.append("schemeId", schemeId);
  const url = `/api/campaigns?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  const data = await res.json();
  return data.campaigns || [];
}

export async function createCampaign(payload) {
  const res = await fetch("/api/campaigns", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create campaign");
  }
  const data = await res.json();
  return data.campaign;
}

export async function fetchCampaignAnalytics(campaignId) {
  const res = await fetch(`/api/campaigns/${encodeURIComponent(campaignId)}/analytics`);
  if (!res.ok) throw new Error("Failed to fetch campaign analytics");
  const data = await res.json();
  return data.analytics || {};
}
