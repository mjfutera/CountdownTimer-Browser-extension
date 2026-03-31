const test = require("node:test");
const assert = require("node:assert/strict");
const CDBMCore = require("../core.js");

test("convertTimestampToDaysHoursMinutes returns full time parts", () => {
  const oneDayOneHourFiveMin = (24 * 60 + 60 + 5) * 60 * 1000;
  const result = CDBMCore.convertTimestampToDaysHoursMinutes(oneDayOneHourFiveMin, true);

  assert.deepEqual(result, { days: 1, hours: 1, minutes: 5 });
});

test("convertTimestampToDaysHoursMinutes rounds day up when showTime is false", () => {
  const halfDay = 12 * 60 * 60 * 1000;
  const result = CDBMCore.convertTimestampToDaysHoursMinutes(halfDay, false);

  assert.equal(result.days, 1);
});

test("calculateProgress clamps correctly", () => {
  assert.equal(CDBMCore.calculateProgress(100, 200, 100), 0);
  assert.equal(CDBMCore.calculateProgress(100, 200, 150), 50);
  assert.equal(CDBMCore.calculateProgress(100, 200, 300), 100);
});

test("isValidUrl validates http and https", () => {
  assert.equal(CDBMCore.isValidUrl("https://example.com"), true);
  assert.equal(CDBMCore.isValidUrl("http://example.com/path"), true);
  assert.equal(CDBMCore.isValidUrl("ftp://example.com"), false);
});

test("pluralize returns expected form", () => {
  assert.equal(CDBMCore.pluralize(1, "day", "days"), "day");
  assert.equal(CDBMCore.pluralize(2, "day", "days"), "days");
});

test("toLocalISOString returns null for invalid Date", () => {
  assert.equal(CDBMCore.toLocalISOString(new Date("invalid")), null);
});
