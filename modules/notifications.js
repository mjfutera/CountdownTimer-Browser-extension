// notifications.js – chrome notifications, sound, and tab helpers

const triggerChromeNotification = (notificationMessage) => {
    const options = {
        type: "basic",
        title: "Countdown timer by Michal",
        message: notificationMessage,
        iconUrl: "logos/logo128.png"
    };

    chrome.notifications.create(options, (notificationId) => {
        if (chrome.runtime.lastError) {
            console.error("Error creating notification:", chrome.runtime.lastError.message);
        } else {
            console.log("Notification created with ID:", notificationId);
        }
    });
};

const createTab = async (url = "") => {
    return new Promise((resolve) => {
        if (url === "") {
            chrome.tabs.create({}, (tab) => resolve(tab));
        } else {
            chrome.tabs.create({ url }, (tab) => resolve(tab));
        }
    });
};

const closeTab = async (url = "") => {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tabToClose = tabs[0];
            if (url === "") {
                chrome.tabs.remove(tabToClose.id, () => resolve(true));
            } else {
                chrome.tabs.query({ url }, (matchingTabs) => {
                    if (matchingTabs.length > 0) {
                        chrome.tabs.remove(matchingTabs[0].id, () => resolve(true));
                    } else {
                        resolve(false);
                    }
                });
            }
        });
    });
};

// playSound is only available in UI contexts (not in service workers)
const playSound = () => {
    const audio = new Audio("sound/ring.mp3");
    audio.play();
};
