export async function fetchNotificationHistory(category, boothId) {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (boothId) params.append("boothId", boothId);
  const url = `/api/notifications?${params.toString()}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("fetchNotificationHistory: API returned", res.status);
      return [];
    }
    const data = await res.json().catch(() => null);
    return (data && data.notifications) || [];
  } catch (error) {
    console.warn("fetchNotificationHistory: network/error", error);
    return [];
  }
}

export async function fetchNotificationSummary() {
  try {
    const res = await fetch("/api/notifications/summary");
    if (!res.ok) {
      console.warn("fetchNotificationSummary: API returned", res.status);
      return {};
    }
    const data = await res.json().catch(() => null);
    return (data && data.summary) || {};
  } catch (error) {
    console.warn("fetchNotificationSummary: network/error", error);
    return {};
  }
}

export async function sendNotification({ category, boothId, schemeIds, deliveryMethod = "sms" }) {
  const res = await fetch("/api/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, boothId, schemeIds, deliveryMethod }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to send notification");
  }
  const data = await res.json();
  return data;
}
