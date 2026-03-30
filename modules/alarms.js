// alarms.js – chrome.alarms helpers

const checkIfAlarmExists = async (name) => {
    return new Promise((resolve) => {
        chrome.alarms.get(name, (alarm) => {
            resolve(!!alarm);
        });
    });
};

const createAlarm = async (name, delayInMinutes, periodInMinutes) => {
    try {
        await chrome.alarms.create(name, { delayInMinutes, periodInMinutes });
        return true;
    } catch (error) {
        console.error("Error creating alarm:", error);
        return false;
    }
};

const setAlarmIfNotExist = async () => {
    const exists = await checkIfAlarmExists("timers");
    if (!exists) {
        await createAlarm("timers", 1, 1);
        console.log("Alarm is set");
    }
};

const removeAlarm = (name) => {
    return new Promise((resolve) => {
        chrome.alarms.clear(name, (wasCleared) => {
            resolve(wasCleared);
        });
    });
};
