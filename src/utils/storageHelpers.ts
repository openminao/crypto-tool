import { storage } from "./storage";

export interface SliceHabit {
  start: number;
  end?: number; // undefined means to the end
  enabled: boolean;
}

const HABITS_KEY = "crypto-tool-slice-habits";
const GLOBAL_HABIT_KEY = "crypto-tool-global-habit";
const LAST_CATEGORY_KEY = "crypto-tool-last-category";
const LAST_ALGORITHM_KEY = "crypto-tool-last-algorithm-";

const safeGetString = (key: string): string | null => {
  try {
    const value = storage.getString(key);
    if (typeof value === "string") return value;
  } catch {
    // continue to fallback
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // ignore fallback failure
    }
  }

  return null;
};

const safeSetString = (key: string, value: string) => {
  try {
    storage.set(key, value);
    return;
  } catch {
    // continue to fallback
  }

  if (typeof window !== "undefined" && window.localStorage) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // ignore fallback failure
    }
  }
};

export const getSliceHabits = (): Record<string, SliceHabit> => {
  try {
    const data = safeGetString(HABITS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Failed to read slice habits", e);
    return {};
  }
};

export const getSliceHabit = (
  algoKey: string,
  defaultValue: SliceHabit,
): SliceHabit => {
  const habits = getSliceHabits();
  return habits[algoKey] || defaultValue;
};

export const saveSliceHabit = (algoKey: string, habit: SliceHabit) => {
  try {
    const habits = getSliceHabits();
    habits[algoKey] = habit;
    safeSetString(HABITS_KEY, JSON.stringify(habits));
  } catch (e) {
    console.error("Failed to save slice habit", e);
  }
};

export const getGlobalHabit = (): SliceHabit => {
  try {
    const data = safeGetString(GLOBAL_HABIT_KEY);
    return data ? JSON.parse(data) : { start: 0, enabled: false };
  } catch {
    return { start: 0, enabled: false };
  }
};

export const saveGlobalHabit = (habit: SliceHabit) => {
  try {
    safeSetString(GLOBAL_HABIT_KEY, JSON.stringify(habit));
  } catch (e) {
    console.error("Failed to save global habit", e);
  }
};

export const getLastCategory = (defaultCategory: string): string => {
  try {
    return safeGetString(LAST_CATEGORY_KEY) || defaultCategory;
  } catch {
    return defaultCategory;
  }
};

export const saveLastCategory = (category: string) => {
  try {
    safeSetString(LAST_CATEGORY_KEY, category);
  } catch (e) {
    console.error("Failed to save last category", e);
  }
};

export const getLastAlgorithm = (
  category: string,
  defaultAlgo: string,
): string => {
  try {
    return safeGetString(LAST_ALGORITHM_KEY + category) || defaultAlgo;
  } catch {
    return defaultAlgo;
  }
};

export const saveLastAlgorithm = (category: string, algo: string) => {
  try {
    safeSetString(LAST_ALGORITHM_KEY + category, algo);
  } catch (e) {
    console.error("Failed to save last algorithm", e);
  }
};
