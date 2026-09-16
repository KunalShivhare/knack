import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Key-value persistence, JSON in and out.
 *
 * AsyncStorage rather than MMKV: MMKV needs a custom dev client and has no web
 * implementation, and this app has to run in a browser. Every call site goes
 * through the three functions below, so swapping the engine later is a change to
 * this file and nothing else.
 *
 * Reads never throw. A corrupt or unreadable value is indistinguishable from an
 * absent one to the caller, which for cached onboarding answers is the right
 * trade — a parse error should restart onboarding, not crash the app.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async remove(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

/** Every persisted key in the app, in one place, so collisions are visible. */
export const storageKeys = {
  onboarding: 'knack:onboarding:v1',
  journeys: 'knack:journeys:v1',
} as const;
