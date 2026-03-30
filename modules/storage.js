// storage.js – chrome.storage operations + data migration

const mainMemoryKey = "cdbm_timers_storage";
const SCHEMA_VERSION = 2;
const SCHEMA_VERSION_KEY = "cdbm_schema_version";

// ── Sync storage ──────────────────────────────────────────────────────────────

const getFromChromeSyncStorage = async (key = mainMemoryKey) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get([key], (result) => {
            const dataString = result[key] || "[]";
            const data = JSON.parse(dataString);
            resolve(data);
        });
    });
};

const saveToChromeSyncStorage = async (data, { key = mainMemoryKey, array = true } = {}) => {
    if (!Array.isArray(data) && array) {
        data = [];
    }
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: JSON.stringify(data) }, () => {
            console.log(`Data (${key}) is saved`);
            resolve(true);
        });
    });
};

const removeFromChromeSyncStorage = async (key = mainMemoryKey) => {
    return new Promise((resolve) => {
        chrome.storage.sync.remove([key], () => {
            console.log(`Data (${key}) is removed`);
            resolve(true);
        });
    });
};

// ── Local storage ─────────────────────────────────────────────────────────────

const getFromChromeLocalStorage = async (key = mainMemoryKey) => {
    return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
            const dataString = result[key] || "[]";
            const data = JSON.parse(dataString);
            resolve(data);
        });
    });
};

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

const removeFromChromeLocalStorage = async (key = mainMemoryKey) => {
    return new Promise((resolve) => {
        chrome.storage.local.remove([key], () => {
            console.log(`Data (${key}) is removed from local storage`);
            resolve(true);
        });
    });
};

// ── Schema version helper ─────────────────────────────────────────────────────

const getSchemaVersion = () =>
    new Promise((resolve) => {
        chrome.storage.sync.get([SCHEMA_VERSION_KEY], (result) => {
            resolve(result[SCHEMA_VERSION_KEY] || 0);
        });
    });

const setSchemaVersion = (version) =>
    new Promise((resolve) => {
        chrome.storage.sync.set({ [SCHEMA_VERSION_KEY]: version }, () => resolve());
    });

// ── Data migrations ────────────────────────────────────────────────────────────

/**
 * Run all pending migrations in order.
 * Each migration is only applied once (gated by SCHEMA_VERSION).
 */
const migrateTimers = async () => {
    const currentVersion = await getSchemaVersion();
    if (currentVersion >= SCHEMA_VERSION) {
        return;
    }

    const timers = await getFromChromeSyncStorage();
    let modified = false;

    // Migration v1 → v2: add `recurring` field if missing
    if (currentVersion < 2) {
        timers.forEach((timer) => {
            if (!Object.prototype.hasOwnProperty.call(timer, "recurring")) {
                timer.recurring = { active: false, every: 1, time_unit: "week" };
                modified = true;
            }
        });
    }

    if (modified) {
        await saveToChromeSyncStorage(timers);
        console.log("Timer data migrated to schema version", SCHEMA_VERSION);
    }

    await setSchemaVersion(SCHEMA_VERSION);
};
