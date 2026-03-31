const mainMemoryKey = "cdbm_timers_storage";

/**
 * Reads JSON payload from chrome sync storage.
 * @param {string} [key]
 * @returns {Promise<any[]>}
 */
const getFromChromeSyncStorage = async (key = mainMemoryKey) => {
  return CDBMStorage.getFromChromeSyncStorage(key);
};

/**
 * Persists payload in chrome sync storage.
 * @param {any} data
 * @param {{ key?: string, array?: boolean }} [options]
 * @returns {Promise<boolean>}
 */
const saveToChromeSyncStorage = async (data, { key = mainMemoryKey, array = true } = {}) => {
  return CDBMStorage.saveToChromeSyncStorage(data, { key, array });
};

/**
 * Removes a key from chrome sync storage.
 * @param {string} [key]
 * @returns {Promise<boolean>}
 */
const removeFromChromeSyncStorage = async (key = mainMemoryKey) => {
  return CDBMStorage.removeFromChromeSyncStorage(key);
};

/**
 * Reads data from chrome local storage.
 * @param {string} [key]
 * @returns {Promise<any>}
 */
const getFromChromeLocalStorage = async (key = mainMemoryKey) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      const dataString = result[key] || "[]";
      const data = JSON.parse(dataString);
      resolve(data);
    });
  });
};

/**
 * Persists payload in chrome local storage.
 * @param {any} data
 * @param {string} [key]
 * @returns {Promise<boolean>}
 */
const saveToChromeLocalStorage = async (data, key = mainMemoryKey) => {
  if (!Array.isArray(data)) {
    data = [];
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: JSON.stringify(data) }, () => {
      console.log(`Data (${key}) is saved in local storage`);
      resolve(true);
    });
  });
};

/**
 * Removes key from chrome local storage.
 * @param {string} [key]
 * @returns {Promise<boolean>}
 */
const removeFromChromeLocalStorage = async (key = mainMemoryKey) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      console.log(`Data (${key}) is removed from local storage`);
      resolve(true);
    });
  });
};

/**
 * Shows extension notification.
 * @param {string} notificationMessage
 * @returns {void}
 */
const triggerChromeNotification = (notificationMessage) => {
  return CDBMNotifications.triggerChromeNotification(notificationMessage);
};

/**
 * Creates a browser tab.
 * @param {string} [url]
 * @returns {Promise<chrome.tabs.Tab>}
 */
const createTab = async (url = "") => {
  return new Promise((resolve) => {
    if (url === "") {
      chrome.tabs.create({}, (tab) => {
        resolve(tab);
      });
    } else {
      chrome.tabs.create({ url }, (tab) => {
        resolve(tab);
      });
    }
  });
};

/**
 * Closes the active tab or first tab matching URL.
 * @param {string} [url]
 * @returns {Promise<boolean>}
 */
const closeTab = async (url = "") => {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabToClose = tabs[0];
      if (url === "") {
        chrome.tabs.remove(tabToClose.id, () => {
          resolve(true);
        });
      } else {
        chrome.tabs.query({ url }, (matchingTabs) => {
          if (matchingTabs.length > 0) {
            chrome.tabs.remove(matchingTabs[0].id, () => {
              resolve(true);
            });
          } else {
            resolve(false);
          }
        });
      }
    });
  });
};

/**
 * Checks whether an alarm exists.
 * @param {string} name
 * @returns {Promise<boolean>}
 */
const checkIfAlarmExists = async (name) => {
  return new Promise((resolve) => {
    chrome.alarms.get(name, (alarm) => {
      resolve(!!alarm);
    });
  });
};

/**
 * Creates a periodic chrome alarm.
 * @param {string} name
 * @param {number} delayInMinutes
 * @param {number} periodInMinutes
 * @returns {Promise<boolean>}
 */
const createAlarm = async (name, delayInMinutes, periodInMinutes) => {
  try {
    await chrome.alarms.create(name, { delayInMinutes, periodInMinutes });
    return true;
  } catch (error) {
    console.error("Error creating alarm:", error);
    return false;
  }
};

/**
 * Ensures the timers alarm exists.
 * @returns {Promise<void>}
 */
const setAlarmIfNotExist = async () => {
  if (!(await checkIfAlarmExists("timers"))) {
    await createAlarm("timers", 1, 1);
    console.log("Alarm is set");
  }
};

/**
 * Removes an alarm by name.
 * @param {string} name
 * @returns {Promise<boolean>}
 */
const removeAlarm = (name) => {
  return new Promise((resolve) => {
    chrome.alarms.clear(name, (wasCleared) => {
      resolve(wasCleared);
    });
  });
};

//Update JSON

/**
 * Runs storage schema migration for saved timers.
 * @returns {Promise<{changed: boolean, timers: any[]}>}
 */
const updateTimers = async () => {
  return CDBMStorage.ensureTimerStorageSchema();
};
