(function (globalScope) {
  /**
   * @typedef {Object} TimerBreakdown
   * @property {number} days
   * @property {number} hours
   * @property {number} minutes
   */

  const CDBMCore = {
    maxTimers: 12,
    maxTitleLength: 20,
    maxDescriptionLength: 100,
    timerSchemaVersion: 1,
    /**
     * Converts a timestamp delta in milliseconds into day/hour/minute values.
     * @param {number} timestamp
     * @param {boolean} showTime
     * @returns {TimerBreakdown}
     */
    convertTimestampToDaysHoursMinutes(timestamp, showTime) {
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
    },
    /**
     * Calculates timer progress as a percentage in range 0-100.
     * @param {number} startTimestamp
     * @param {number} endTimestamp
     * @param {number} currentTimestamp
     * @returns {number}
     */
    calculateProgress(startTimestamp, endTimestamp, currentTimestamp) {
      const totalDuration = endTimestamp - startTimestamp;
      const elapsedDuration = currentTimestamp - startTimestamp;
      if (totalDuration <= 0 || elapsedDuration <= 0) {
        return 0;
      }
      const progressPercentage = (elapsedDuration / totalDuration) * 100;
      return Math.min(100, progressPercentage);
    },
    /**
     * Validates whether a URL is a non-empty HTTP/HTTPS address.
     * @param {string} url
     * @returns {boolean}
     */
    isValidUrl(url) {
      return url.trim() !== "" && /^(https?:\/\/)([\w-]+(\.[\w-]+)+)\/?([^\s]*)?$/.test(url);
    },
    /**
     * Formats a date value to match supported input field types.
     * @param {"date"|"datetime-local"|string} fieldType
     * @param {number} [timestamp]
     * @returns {string}
     */
    setDataFormat(fieldType, timestamp) {
      const date = timestamp ? new Date(timestamp) : new Date();
      const localIso = this.toLocalISOString(date);
      if (!localIso) {
        return "";
      }
      if (fieldType === "datetime-local") {
        return localIso.slice(0, 16);
      }
      if (fieldType === "date") {
        return localIso.slice(0, 10);
      }
      return "";
    },
    /**
     * Converts Date to local ISO string while preserving local wall clock values.
     * @param {Date} date
     * @returns {string|null}
     */
    toLocalISOString(date) {
      if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
      }
      const tzOffset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - tzOffset).toISOString();
    },
    /**
     * Returns singular or plural form based on numeric value.
     * @param {number} value
     * @param {string} singular
     * @param {string} plural
     * @returns {string}
     */
    pluralize(value, singular, plural) {
      return value < 2 ? singular : plural;
    },
    /**
     * Gets number of days in a month for a given year.
     * @param {number} month
     * @param {number} year
     * @returns {number}
     */
    getNumberOfDaysInMonth(month, year) {
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
      return daysInMonths[month - 1] + (isLeapYear && month === 2 ? 1 : 0);
    },
  };

  globalScope.CDBMCore = CDBMCore;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = CDBMCore;
  }
})(typeof self !== "undefined" ? self : this);
