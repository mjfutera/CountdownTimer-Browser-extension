const manifest = chrome.runtime.getManifest();
const maxTimers = CDBMCore.maxTimers;
const maxLength = CDBMCore.maxTitleLength;
const maxDescription = CDBMCore.maxDescriptionLength;
const utmParams = "?utm_source=" + manifest["name"] + "&utm_content=" + manifest["version"];

const authorBrand = {
  icon: "mfpro.png",
  iconBasePath: "logos/",
  link: "https://michalfutera.pro",
  alt: "MichalFutera.pro",
};

const socialMediaArray = [
  {
    icon: "buyMeACoffee.png",
    name: "Buy Me A Coffee",
    link: "https://www.buymeacoffee.com/mjfutera/",
    alt: "Like my extension? Buy me a coffee",
  },
  {
    icon: "gitHub.png",
    name: "GitHub",
    link: "https://github.com/mjfutera/Countdowns---Chrome-extension",
    alt: "All my programming repositories",
  },
  {
    icon: "linkedIn.png",
    name: "Linked In",
    link: "https://www.linkedin.com/in/michalfutera/",
    alt: "Join me in my business network",
  },
  {
    icon: "twitter.png",
    name: "X (Twitter)",
    link: "https://twitter.com/mjfutera",
    alt: "Follow me on Twitter",
  },
  {
    icon: "telegram.png",
    name: "Telegram",
    link: "https://t.me/MichalFuteraPro",
    alt: "Join me on Telegram",
  },
  {
    icon: "linkTree.png",
    name: "LinkTree",
    link: "https://linktr.ee/mjfutera",
    alt: "All my links in one place",
  },
];

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
  "border-fiverrBlack",
];

//Other functions
const getData = async (url) => {
  const response = await fetch(url);

  if (response.ok) {
    return response.json();
  } else {
    throw new Error(`Failed to fetch data from ${url}: ${response.status}`);
  }
};

const getRandomIndex = (array) => Math.floor(Math.random() * array.length); //Colors

const convertTimestampToDaysHoursMinutes = (timestamp, showTime) =>
  CDBMCore.convertTimestampToDaysHoursMinutes(timestamp, showTime);

const getTimeZone = async () => {
  const timeZones = await getData("timezones.json");
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const matchedZone = timeZones.find((zone) => zone["offsetMinutes"] === offset);
  return matchedZone ? matchedZone["name"] : "UTC";
};

const getCurrentTimeFromApi = async () => {
  const timeZone = await getTimeZone();
  const apiUrl = "https://timeapi.io/api/Time/current/zone?timeZone=" + timeZone;
  const timeObject = await getData(apiUrl);
  return timeObject;
};

const calculateProgress = (startTimestamp, endTimestamp, currentTimestamp) =>
  CDBMCore.calculateProgress(startTimestamp, endTimestamp, currentTimestamp);

const isValidUrl = (url) => CDBMCore.isValidUrl(url);

const setDataFormat = (fieldType, timestamp) => CDBMCore.setDataFormat(fieldType, timestamp);

const playSound = () => {
  CDBMNotifications.playSound();
};
