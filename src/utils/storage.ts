export function safeJSONParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.error('Failed to parse JSON from localStorage:', e);
    return fallback;
  }
}
