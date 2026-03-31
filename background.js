importScripts("./core.js");
importScripts("./storage.js");
importScripts("./notifications.js");

/** @type {string} */
const TIMERS_ALARM_NAME = "timers";

/**
 * Creates recurring alarm when missing.
 * @returns {void}
 */
const ensureTimersAlarm = () => {
  chrome.alarms.get(TIMERS_ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(TIMERS_ALARM_NAME, { delayInMinutes: 1, periodInMinutes: 1 });
    }
  });
};

/**
 * Boots worker state, runs storage migration and ensures alarm exists.
 * @returns {Promise<void>}
 */
const bootstrapWorker = async () => {
  await CDBMStorage.ensureTimerStorageSchema();
  ensureTimersAlarm();
};

chrome.runtime.onInstalled.addListener(() => {
  bootstrapWorker();
});

chrome.runtime.onStartup.addListener(() => {
  bootstrapWorker();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== TIMERS_ALARM_NAME) {
    return;
  }

  const timers = await CDBMStorage.getFromChromeSyncStorage();
  const currentTime = Date.now();
  let isDataModified = false;

  timers.forEach((timer) => {
    if (currentTime >= timer.end_date && timer.active) {
      timer.active = false;
      isDataModified = true;
      CDBMNotifications.notifyTimerFinished(timer.title);
      if (timer.newTab && timer.newTab.active && timer.newTab.url) {
        chrome.tabs.create({ url: timer.newTab.url });
      }
    }
  });

  if (isDataModified) {
    await CDBMStorage.saveToChromeSyncStorage(timers);
  }
});
