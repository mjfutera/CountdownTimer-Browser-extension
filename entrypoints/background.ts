import { ensureTimerStorageSchema, getTimers, saveTimers } from "@/utils/storage";
import { notifyTimerFinished } from "@/utils/notifications";
import type { Timer } from "@/utils/storage";

const TIMERS_ALARM_NAME = "timers";

function addRecurringOffset(timestamp: number, every: number, unit: string): number {
  const safeEvery = Math.max(1, Math.floor(every || 1));
  const date = new Date(timestamp);

  switch (unit) {
    case "minute":
      date.setMinutes(date.getMinutes() + safeEvery);
      break;
    case "hour":
      date.setHours(date.getHours() + safeEvery);
      break;
    case "day":
      date.setDate(date.getDate() + safeEvery);
      break;
    case "week":
      date.setDate(date.getDate() + safeEvery * 7);
      break;
    case "month":
      date.setMonth(date.getMonth() + safeEvery);
      break;
    case "year":
      date.setFullYear(date.getFullYear() + safeEvery);
      break;
    default:
      date.setDate(date.getDate() + safeEvery * 7);
      break;
  }

  return date.getTime();
}

function scheduleNextRecurringOccurrence(timer: Timer, currentTime: number): void {
  const every = timer.recurring?.every ?? 1;
  const timeUnit = timer.recurring?.time_unit ?? "week";

  let nextStart = timer.start_date;
  let nextEnd = timer.end_date;
  let safetyCounter = 0;

  while (nextEnd <= currentTime && safetyCounter < 512) {
    nextStart = addRecurringOffset(nextStart, every, timeUnit);
    nextEnd = addRecurringOffset(nextEnd, every, timeUnit);
    safetyCounter += 1;
  }

  if (nextEnd <= currentTime) {
    const fallbackDuration = Math.max(60 * 1000, timer.end_date - timer.start_date);
    nextStart = currentTime;
    nextEnd = currentTime + fallbackDuration;
  }

  timer.start_date = nextStart;
  timer.end_date = nextEnd;
  timer.active = true;
}

function ensureTimersAlarm(): void {
  browser.alarms.get(TIMERS_ALARM_NAME).then((alarm) => {
    if (!alarm) {
      browser.alarms.create(TIMERS_ALARM_NAME, { delayInMinutes: 1, periodInMinutes: 1 });
    }
  });
}

async function bootstrapWorker(): Promise<void> {
  await ensureTimerStorageSchema();
  ensureTimersAlarm();
}

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(() => {
    bootstrapWorker();
  });

  browser.runtime.onStartup.addListener(() => {
    bootstrapWorker();
  });

  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== TIMERS_ALARM_NAME) {
      return;
    }

    const timers = await getTimers();
    const currentTime = Date.now();
    let isDataModified = false;

    timers.forEach((timer) => {
      if (currentTime >= timer.end_date && timer.active) {
        isDataModified = true;
        notifyTimerFinished(timer.title);
        if (timer.newTab?.active && timer.newTab.url) {
          browser.tabs.create({ url: timer.newTab.url });
        }

        if (timer.recurring?.active) {
          scheduleNextRecurringOccurrence(timer, currentTime);
        } else {
          timer.active = false;
        }
      }
    });

    if (isDataModified) {
      await saveTimers(timers);
    }
  });
});
