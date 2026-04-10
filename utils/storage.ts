import { TIMER_SCHEMA_VERSION } from "./core";

export interface TimerNewTab {
  active: boolean;
  url: string;
}

export interface TimerRecurring {
  active: boolean;
  every: number;
  time_unit: string;
}

export interface Timer {
  schemaVersion: number;
  title: string;
  start_date: number;
  end_date: number;
  show_time: boolean;
  description: string;
  active: boolean;
  newTab: TimerNewTab;
  recurring: TimerRecurring;
}

const MAIN_STORAGE_KEY = "cdbm_timers_storage";

function parseJsonSafely<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function sanitizeTimer(timer: Record<string, any>): Timer {
  const next = { ...timer } as any;

  next.schemaVersion = Number.isInteger(next.schemaVersion)
    ? next.schemaVersion
    : TIMER_SCHEMA_VERSION;
  next.title = typeof next.title === "string" ? next.title : "Untitled timer";
  next.start_date = Number.isFinite(next.start_date) ? next.start_date : Date.now();
  next.end_date = Number.isFinite(next.end_date)
    ? next.end_date
    : next.start_date + 24 * 60 * 60 * 1000;
  next.show_time = typeof next.show_time === "boolean" ? next.show_time : false;
  next.description = typeof next.description === "string" ? next.description : "";
  next.active = typeof next.active === "boolean" ? next.active : true;

  if (!next.newTab || typeof next.newTab !== "object") {
    next.newTab = { active: false, url: "" };
  } else {
    next.newTab.active = typeof next.newTab.active === "boolean" ? next.newTab.active : false;
    next.newTab.url = typeof next.newTab.url === "string" ? next.newTab.url : "";
  }

  if (!next.recurring || typeof next.recurring !== "object") {
    next.recurring = { active: true, every: 1, time_unit: "week" };
  } else {
    next.recurring.active =
      typeof next.recurring.active === "boolean" ? next.recurring.active : true;
    next.recurring.every = Number.isFinite(next.recurring.every) ? next.recurring.every : 1;
    next.recurring.time_unit =
      typeof next.recurring.time_unit === "string" ? next.recurring.time_unit : "week";
  }

  return next as Timer;
}

export async function getTimers(): Promise<Timer[]> {
  const result = await browser.storage.sync.get([MAIN_STORAGE_KEY]);
  const dataString = (result[MAIN_STORAGE_KEY] as string) || "[]";
  const data = parseJsonSafely(dataString, []);
  return Array.isArray(data) ? data : [];
}

export async function saveTimers(timers: Timer[]): Promise<void> {
  const payload = Array.isArray(timers) ? timers : [];
  await browser.storage.sync.set({ [MAIN_STORAGE_KEY]: JSON.stringify(payload) });
}

export async function clearTimers(): Promise<void> {
  await browser.storage.sync.remove([MAIN_STORAGE_KEY]);
}

export async function ensureTimerStorageSchema(): Promise<{
  changed: boolean;
  timers: Timer[];
}> {
  const timers = await getTimers();
  const migrated = timers.map((timer) => sanitizeTimer(timer));
  const changed = JSON.stringify(timers) !== JSON.stringify(migrated);
  if (changed) {
    await saveTimers(migrated);
  }
  return { changed, timers: migrated };
}
