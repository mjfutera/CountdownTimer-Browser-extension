(function (globalScope) {
  const MAIN_STORAGE_KEY = "cdbm_timers_storage";

  /**
   * Safely parses JSON and falls back on parse failure.
   * @template T
   * @param {string} value
   * @param {T} fallback
   * @returns {T}
   */
  const parseJsonSafely = (value, fallback) => {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  /**
   * Normalizes timer object shape used by the extension schema.
   * @param {Record<string, any>} timer
   * @returns {Record<string, any>}
   */
  const sanitizeTimer = (timer) => {
    const next = { ...timer };

    next.schemaVersion = Number.isInteger(next.schemaVersion)
      ? next.schemaVersion
      : globalScope.CDBMCore.timerSchemaVersion;
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

    return next;
  };

  const CDBMStorage = {
    mainMemoryKey: MAIN_STORAGE_KEY,
    /**
     * Reads timers (or a custom key) from chrome sync storage.
     * @param {string} [key]
     * @returns {Promise<any[]>}
     */
    getFromChromeSyncStorage(key = MAIN_STORAGE_KEY) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([key], (result) => {
          const dataString = result[key] || "[]";
          const data = parseJsonSafely(dataString, []);
          resolve(Array.isArray(data) ? data : []);
        });
      });
    },
    /**
     * Persists data under a storage key in chrome sync storage.
     * @param {any} data
     * @param {{ key?: string, array?: boolean }} [options]
     * @returns {Promise<boolean>}
     */
    saveToChromeSyncStorage(data, { key = MAIN_STORAGE_KEY, array = true } = {}) {
      const payload = !Array.isArray(data) && array ? [] : data;
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: JSON.stringify(payload) }, () => {
          resolve(true);
        });
      });
    },
    /**
     * Removes a key from chrome sync storage.
     * @param {string} [key]
     * @returns {Promise<boolean>}
     */
    removeFromChromeSyncStorage(key = MAIN_STORAGE_KEY) {
      return new Promise((resolve) => {
        chrome.storage.sync.remove([key], () => {
          resolve(true);
        });
      });
    },
    /**
     * Migrates and normalizes all timers to the current schema.
     * @returns {Promise<{changed: boolean, timers: any[]}>}
     */
    async ensureTimerStorageSchema() {
      const timers = await this.getFromChromeSyncStorage();
      const migrated = timers.map((timer) => sanitizeTimer(timer));
      const changed = JSON.stringify(timers) !== JSON.stringify(migrated);
      if (changed) {
        await this.saveToChromeSyncStorage(migrated);
      }
      return { changed, timers: migrated };
    },
  };

  globalScope.CDBMStorage = CDBMStorage;
})(typeof self !== "undefined" ? self : this);
