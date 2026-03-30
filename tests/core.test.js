/**
 * Unit tests for pure utility functions in modules/core.js
 *
 * These functions have no Chrome API dependencies so they can be tested
 * in a plain Node/Jest environment.
 */

// ── Inline copies of core.js functions ────────────────────────────────────────
// (avoids needing to bundle/transform the file for Jest)

const maxTimers = 12;
const maxLength = 20;
const maxDescription = 100;

const getRandomIndex = (array) => Math.floor(Math.random() * array.length);

const getNumberOfDaysInMonth = (month, year) => {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonths[month - 1] + (isLeapYear && month === 2 ? 1 : 0);
};

const convertTimestampToDaysHoursMinutes = (timestamp, showTime) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const oneHour = 60 * 60 * 1000;
    const oneMinute = 60 * 1000;
    let days = Math.floor(timestamp / oneDay);
    if (!showTime) {
        days = days + 1;
    }
    const hours = Math.floor((timestamp % oneDay) / oneHour);
    const minutes = Math.floor((timestamp % oneHour) / oneMinute);
    return { days, hours, minutes };
};

const calculateProgress = (startTimestamp, endTimestamp, currentTimestamp) => {
    const totalDuration = endTimestamp - startTimestamp;
    const elapsedDuration = currentTimestamp - startTimestamp;
    if (totalDuration <= 0 || elapsedDuration <= 0) {
        return 0;
    }
    const progressPercentage = (elapsedDuration / totalDuration) * 100;
    return Math.min(100, progressPercentage);
};

const isValidUrl = (url) =>
    url.trim() !== "" && /^(https?:\/\/)([\w-]+(\.[\w-]+)+)\/?([^\s]*)?$/.test(url);

const setDataFormat = (fieldType, timestamp) => {
    const date = timestamp ? new Date(timestamp) : new Date();
    if (fieldType === "datetime-local") {
        return date.toISOString().slice(0, 16);
    } else if (fieldType === "date") {
        return date.toISOString().slice(0, 10);
    }
};

const toLocalISOString = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        return null;
    }
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset).toISOString();
    return localISOTime;
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("constants", () => {
    test("maxTimers is 12", () => expect(maxTimers).toBe(12));
    test("maxLength is 20", () => expect(maxLength).toBe(20));
    test("maxDescription is 100", () => expect(maxDescription).toBe(100));
});

describe("getRandomIndex", () => {
    test("returns index within array bounds", () => {
        const arr = [1, 2, 3, 4, 5];
        for (let i = 0; i < 50; i++) {
            const idx = getRandomIndex(arr);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(arr.length);
        }
    });

    test("returns 0 for single-element array", () => {
        expect(getRandomIndex(["only"])).toBe(0);
    });
});

describe("getNumberOfDaysInMonth", () => {
    test("January has 31 days", () => expect(getNumberOfDaysInMonth(1, 2023)).toBe(31));
    test("April has 30 days", () => expect(getNumberOfDaysInMonth(4, 2023)).toBe(30));
    test("February has 28 days in a common year", () =>
        expect(getNumberOfDaysInMonth(2, 2023)).toBe(28));
    test("February has 29 days in a leap year (divisible by 4)", () =>
        expect(getNumberOfDaysInMonth(2, 2024)).toBe(29));
    test("February has 28 days in century year not divisible by 400", () =>
        expect(getNumberOfDaysInMonth(2, 1900)).toBe(28));
    test("February has 29 days in year divisible by 400", () =>
        expect(getNumberOfDaysInMonth(2, 2000)).toBe(29));
});

describe("convertTimestampToDaysHoursMinutes", () => {
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const ONE_HOUR = 60 * 60 * 1000;
    const ONE_MINUTE = 60 * 1000;

    test("exactly 1 day with showTime=true gives days=1, hours=0, minutes=0", () => {
        const result = convertTimestampToDaysHoursMinutes(ONE_DAY, true);
        expect(result).toEqual({ days: 1, hours: 0, minutes: 0 });
    });

    test("exactly 1 day without showTime adds 1 day offset", () => {
        const result = convertTimestampToDaysHoursMinutes(ONE_DAY, false);
        expect(result.days).toBe(2);
    });

    test("1.5 days with showTime=true gives days=1, hours=12, minutes=0", () => {
        const result = convertTimestampToDaysHoursMinutes(ONE_DAY + 12 * ONE_HOUR, true);
        expect(result).toEqual({ days: 1, hours: 12, minutes: 0 });
    });

    test("90 minutes with showTime=true gives days=0, hours=1, minutes=30", () => {
        const result = convertTimestampToDaysHoursMinutes(90 * ONE_MINUTE, true);
        expect(result).toEqual({ days: 0, hours: 1, minutes: 30 });
    });
});

describe("calculateProgress", () => {
    test("returns 0 when current time equals start", () => {
        expect(calculateProgress(100, 200, 100)).toBe(0);
    });

    test("returns 0 when current time is before start", () => {
        expect(calculateProgress(100, 200, 50)).toBe(0);
    });

    test("returns 50 at halfway point", () => {
        expect(calculateProgress(0, 100, 50)).toBe(50);
    });

    test("returns 100 when current time equals end", () => {
        expect(calculateProgress(0, 100, 100)).toBe(100);
    });

    test("caps at 100 when current time exceeds end", () => {
        expect(calculateProgress(0, 100, 150)).toBe(100);
    });

    test("returns 0 when total duration is 0", () => {
        expect(calculateProgress(100, 100, 100)).toBe(0);
    });
});

describe("isValidUrl", () => {
    test("accepts a plain https URL", () => expect(isValidUrl("https://example.com")).toBe(true));
    test("accepts an http URL", () => expect(isValidUrl("http://example.com")).toBe(true));
    test("accepts URL with path", () =>
        expect(isValidUrl("https://example.com/path/to/page")).toBe(true));
    test("rejects empty string", () => expect(isValidUrl("")).toBe(false));
    test("rejects whitespace-only string", () => expect(isValidUrl("   ")).toBe(false));
    test("rejects URL without protocol", () => expect(isValidUrl("example.com")).toBe(false));
    test("rejects ftp URL", () => expect(isValidUrl("ftp://example.com")).toBe(false));
});

describe("setDataFormat", () => {
    const knownTimestamp = new Date("2024-06-15T10:30:00Z").getTime();

    test("returns YYYY-MM-DD for fieldType=date", () => {
        const result = setDataFormat("date", knownTimestamp);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test("returns YYYY-MM-DDTHH:MM for fieldType=datetime-local", () => {
        const result = setDataFormat("datetime-local", knownTimestamp);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    test("returns undefined for unknown fieldType", () => {
        expect(setDataFormat("unknown", knownTimestamp)).toBeUndefined();
    });
});

describe("toLocalISOString", () => {
    test("returns null for non-Date input", () => {
        expect(toLocalISOString("not a date")).toBeNull();
        expect(toLocalISOString(null)).toBeNull();
    });

    test("returns null for invalid Date", () => {
        expect(toLocalISOString(new Date("invalid"))).toBeNull();
    });

    test("returns an ISO string for a valid Date", () => {
        const d = new Date("2024-01-01T12:00:00Z");
        const result = toLocalISOString(d);
        expect(typeof result).toBe("string");
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
});
