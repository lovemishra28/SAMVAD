export async function fetchAllFeedback(schemeId) {
  const url = schemeId
    ? `/api/feedback?schemeId=${encodeURIComponent(schemeId)}`
    : "/api/feedback";

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.feedback || [];
  } catch (error) {
    console.warn("fetchAllFeedback: error", error);
    return [];
  }
}

export async function fetchSchemeFeedbackSummary() {
  try {
    const res = await fetch("/api/feedback/scheme-summary");
    if (!res.ok) return { summaries: [], suggestionCount: 0 };
    const data = await res.json();
    return {
      summaries: data.summaries || [],
      suggestionCount: data.suggestionCount || 0,
    };
  } catch (error) {
    console.warn("fetchSchemeFeedbackSummary: error", error);
    return { summaries: [], suggestionCount: 0 };
  }
}
