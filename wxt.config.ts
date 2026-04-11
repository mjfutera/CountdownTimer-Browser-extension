import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Countdown timer by Michal",
    version: "2.0.0",
    description: "Create, manage, and be notified for important events.",
    permissions: ["storage", "notifications", "alarms", "tabs"],
    author: "Michał Futera",
    homepage_url: "https://michalfutera.pro",
    browser_specific_settings: {
      gecko: {
        id: "countdown-timer@michalfutera.pro",
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
  },
});
