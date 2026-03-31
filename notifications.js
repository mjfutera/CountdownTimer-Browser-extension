(function (globalScope) {
  const CDBMNotifications = {
    /**
     * Shows a Chrome notification with extension defaults.
     * @param {string} notificationMessage
     * @returns {void}
     */
    triggerChromeNotification(notificationMessage) {
      const options = {
        type: "basic",
        title: "Countdown timer by Michal",
        message: notificationMessage,
        iconUrl: "logos/logo128.png",
      };

      chrome.notifications.create(options, () => {
        if (chrome.runtime.lastError) {
          console.error("Error creating notification:", chrome.runtime.lastError.message);
        }
      });
    },
    /**
     * Plays the configured finish sound.
     * @returns {void}
     */
    playSound() {
      const audio = new Audio("sound/ring.mp3");
      audio.play();
    },
    /**
     * Sends a notification informing the user that a timer has finished.
     * @param {string} timerTitle
     * @returns {void}
     */
    notifyTimerFinished(timerTitle) {
      this.triggerChromeNotification(
        `Congratulations! Your timer "${timerTitle}" just finished counting down. What now?`
      );
    },
  };

  globalScope.CDBMNotifications = CDBMNotifications;
})(typeof self !== "undefined" ? self : this);
