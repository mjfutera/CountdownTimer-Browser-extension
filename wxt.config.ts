import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Countdown timer by Michal",
    version: "2.0.0",
    description: "Create, manage, and be notified for important events.",
    permissions: ["storage", "notifications", "alarms", "tabs"],
    author: {
      name: "Michał Futera",
      url: "https://linktr.ee/mjfutera",
    },
  },
});
