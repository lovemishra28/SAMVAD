export async function fetchSchemes(category) {
  const url = category ? `/api/schemes?category=${encodeURIComponent(category)}` : "/api/schemes";

  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`fetchSchemes: API status ${res.status}, returning empty list`);
      return [];
    }
    const data = await res.json();
    return data.schemes || [];
  } catch (error) {
    console.warn("fetchSchemes: network/error while fetching schemes:", error);
    return [];
  }
}


export async function fetchSchemeById(id) {
  if (!id) return null;
  try {
    const res = await fetch(`/api/schemes/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    const data = await res.json().catch(() => null);
    return (data && data.scheme) || null;
  } catch (error) {
    console.warn("fetchSchemeById: error", error);
    return null;
  }
}

export async function createScheme(payload) {
  try {
    const res = await fetch("/api/schemes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Failed to create scheme (${res.status})`);
    }
    const data = await res.json().catch(() => null);
    return (data && data.scheme) || null;
  } catch (error) {
    console.error("createScheme: error", error);
    throw error;
  }
}
