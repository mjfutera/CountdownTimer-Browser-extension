// core.js – pure utility functions (no browser/Chrome API dependencies)

const maxTimers = 12;
const maxLength = 20;
const maxDescription = 100;

const borderColors = [
    "border-myGreen",
    "border-myYellow",
    "border-myGold",
    "border-myBlue",
    "border-myLime",
    "border-mySilver",
    "border-myRed",
    "border-myBlack",
    "border-myGrey",
    "border-fiverrGreen",
    "border-fiverrBlack"
];

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
