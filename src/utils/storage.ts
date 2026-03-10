export function safeJSONParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    const parsed = JSON.parse(jsonString);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch (e) {
    console.error('Failed to parse JSON from storage:', e);
    return fallback;
  }
}

export const storage = {
  get: <T>(key: string, fallback: T): T => {
    return safeJSONParse(localStorage.getItem(key), fallback);
  },
  set: <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove: (key: string): void => {
    localStorage.removeItem(key);
  }
};
