/* localStorage that never throws (private mode, blocked storage, SSR). */
export const storage = {
  get(key, fallback = null) {
    try {
      const v = window.localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  },
  getJSON(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v == null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  },
  setJSON(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  },
  remove(key) {
    try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
  },
};
