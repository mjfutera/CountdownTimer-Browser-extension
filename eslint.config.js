import js from "@eslint/js";
import globals from "globals";

// Globals exported from module scripts and shared via the browser's global scope
// (loaded sequentially via <script> tags in newTab.html /
//  importScripts() in background.js).
const extensionModuleGlobals = {
    // core.js
    maxTimers: "readonly",
    maxLength: "readonly",
    maxDescription: "readonly",
    borderColors: "readonly",
    getRandomIndex: "readonly",
    getNumberOfDaysInMonth: "readonly",
    convertTimestampToDaysHoursMinutes: "readonly",
    calculateProgress: "readonly",
    isValidUrl: "readonly",
    setDataFormat: "readonly",
    toLocalISOString: "readonly",
    // storage.js
    mainMemoryKey: "readonly",
    SCHEMA_VERSION: "readonly",
    SCHEMA_VERSION_KEY: "readonly",
    getFromChromeSyncStorage: "readonly",
    saveToChromeSyncStorage: "readonly",
    removeFromChromeSyncStorage: "readonly",
    getFromChromeLocalStorage: "readonly",
    saveToChromeLocalStorage: "readonly",
    removeFromChromeLocalStorage: "readonly",
    getSchemaVersion: "readonly",
    setSchemaVersion: "readonly",
    migrateTimers: "readonly",
    // notifications.js
    triggerChromeNotification: "readonly",
    createTab: "readonly",
    closeTab: "readonly",
    playSound: "readonly",
    // alarms.js
    checkIfAlarmExists: "readonly",
    createAlarm: "readonly",
    setAlarmIfNotExist: "readonly",
    removeAlarm: "readonly"
};

export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.browser,
                chrome: "readonly"
            }
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "no-console": "off",
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "warn"
        }
    },
    {
        // Module files share a common browser global scope – declare cross-file symbols
        files: ["modules/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                chrome: "readonly",
                ...extensionModuleGlobals
            }
        }
    },
    {
        files: ["tests/**/*.test.js"],
        languageOptions: {
            globals: {
                ...globals.jest,
                ...globals.node
            }
        }
    }
];

