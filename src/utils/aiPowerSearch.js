export const AI_POWER_SEARCH_SESSION_KEY = 'ai-power-search-session-id';
export const AI_POWER_SEARCH_SSA_SESSION_KEY = 'ai-power-search-ssa-session-id';

export function getAiPowerSearchSessionId(storageKey = AI_POWER_SEARCH_SESSION_KEY) {
  try {
    return sessionStorage.getItem(storageKey) || '';
  } catch {
    return '';
  }
}

export function setAiPowerSearchSessionId(sessionId, storageKey = AI_POWER_SEARCH_SESSION_KEY) {
  if (!sessionId) return;
  try {
    sessionStorage.setItem(storageKey, String(sessionId));
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Normalizes ai-power-search API responses for display.
 * Supports markdown text (result/response) or structured suggested_actions arrays.
 */
export function parseAiPowerSearchResponse(data) {
  if (!data || typeof data !== 'object') {
    return { sessionId: null, markdown: 'No results found.', actions: null };
  }

  const sessionId = data.session_id || data.sessionId || null;

  const actionsRaw =
    data.suggested_actions ||
    data.suggestedActions ||
    data.actions ||
    (Array.isArray(data.results) ? data.results : null);

  if (Array.isArray(actionsRaw) && actionsRaw.length > 0) {
    const actions = actionsRaw.map((item, index) => {
      if (typeof item === 'string') {
        return { title: `Suggestion ${index + 1}`, body: item, url: null };
      }
      const title =
        item.action ||
        item.title ||
        item.name ||
        item.heading ||
        `Suggestion ${index + 1}`;
      const body =
        item.description ||
        item.steps ||
        item.detail ||
        item.content ||
        item.text ||
        '';
      return {
        title: String(title),
        body: typeof body === 'string' ? body : Array.isArray(body) ? body.join('\n') : String(body ?? ''),
        url: item.url || item.link || null,
      };
    });
    return { sessionId, actions, markdown: null };
  }

  const textKeys = ['response', 'result', 'answer', 'output', 'text', 'content', 'message'];
  for (const key of textKeys) {
    const val = data[key];
    if (typeof val === 'string' && val.trim()) {
      return { sessionId, markdown: val.trim(), actions: null };
    }
  }

  if (typeof data.payload === 'string' && data.payload.trim()) {
    return { sessionId, markdown: data.payload.trim(), actions: null };
  }

  if (data.data && typeof data.data === 'object') {
    return parseAiPowerSearchResponse(data.data);
  }

  return { sessionId, markdown: 'No results found.', actions: null };
}

export function getAiPowerSearchError(err) {
  const data = err?.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) {
    if (typeof data.detail === 'string') return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || d.message || JSON.stringify(d)).join('; ');
    }
    return String(data.detail);
  }
  if (data?.message) return String(data.message);
  return err?.message || 'Failed to fetch results. Please try again.';
}
