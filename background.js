importScripts(
    "./modules/core.js",
    "./modules/storage.js",
    "./modules/notifications.js",
    "./modules/alarms.js"
);

// ── Lifecycle hooks ────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
    await setAlarmIfNotExist();
    await migrateTimers();
});

chrome.runtime.onStartup.addListener(async () => {
    await setAlarmIfNotExist();
});

// ── Alarm handler ──────────────────────────────────────────────────────────────

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "timers") {
        const timers = await getFromChromeSyncStorage();
        const currentTime = new Date().getTime();
        let isDataModified = false;

        timers.forEach((e) => {
            if (currentTime >= e["end_date"] && e.active) {
                e.active = false;
                isDataModified = true;
                triggerChromeNotification(
                    `Congratulations! Your timer "${e.title}" just finished counting down. What now?`
                );
                if (e.newTab && e.newTab.active) {
                    createTab(e.newTab.url);
                }
            }
        });

        if (isDataModified) {
            await saveToChromeSyncStorage(timers);
        }
    }
});
