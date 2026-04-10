export function triggerNotification(message: string): void {
  const options: browser.Notifications.CreateNotificationOptions = {
    type: "basic",
    title: "Countdown timer by Michal",
    message,
    iconUrl: "/icon/128.png",
  };

  browser.notifications.create(options, () => {
    if (browser.runtime.lastError) {
      console.error("Error creating notification:", browser.runtime.lastError.message);
    }
  });
}

export function playSound(): void {
  const audio = new Audio(browser.runtime.getURL("/sound/ring.mp3"));
  audio.play();
}

export function notifyTimerFinished(timerTitle: string): void {
  triggerNotification(
    `Congratulations! Your timer "${timerTitle}" just finished counting down. What now?`
  );
}
