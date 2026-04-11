export const EXTENSION_NAME = "Countdown timer by Michal";
export const EXTENSION_VERSION = "2.0.0";

export const AUTHOR_BRAND = {
  icon: "mfpro.png",
  iconBasePath: "/logos/",
  link: "https://michalfutera.pro",
  alt: "MichalFutera.pro",
};

export const UTM_PARAMS = `?utm_source=${EXTENSION_NAME}&utm_content=${EXTENSION_VERSION}`;

export interface SocialMediaEntry {
  icon: string;
  name: string;
  link: string;
  alt: string;
  iconBasePath?: string;
}

export const SOCIAL_MEDIA: SocialMediaEntry[] = [
  {
    icon: "buyMeACoffee.png",
    name: "Buy Me A Coffee",
    link: "https://www.buymeacoffee.com/mjfutera/",
    alt: "Like my extension? Buy me a coffee",
  },
  {
    icon: "gitHub.png",
    name: "GitHub",
    link: "https://github.com/mjfutera/CountdownTimer-Browser-extension",
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

export const BORDER_COLORS = [
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
