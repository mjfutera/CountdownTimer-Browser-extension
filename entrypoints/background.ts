import { ensureTimerStorageSchema, getTimers, saveTimers } from "@/utils/storage";
import { notifyTimerFinished } from "@/utils/notifications";

const TIMERS_ALARM_NAME = "timers";

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
        timer.active = false;
        isDataModified = true;
        notifyTimerFinished(timer.title);
        if (timer.newTab?.active && timer.newTab.url) {
          browser.tabs.create({ url: timer.newTab.url });
        }
      }
    });

    if (isDataModified) {
      await saveTimers(timers);
    }
  });
});
