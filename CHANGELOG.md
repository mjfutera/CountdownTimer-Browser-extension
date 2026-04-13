# Changelog

## 2.0.1 - 2026-04-13

- Refreshed New Tab UI and dialog styling.
- Added settings dialog in footer.
- Added timer display format settings: days-only or full breakdown.
- Added seconds support in full timer display format.
- Added JSON import and export for timers from settings dialog.
- Implemented recurring timer scheduling in background alarms.
- Fixed duplicate finish handling by centralizing completion logic in background.
- Fixed duplicate timer rendering when changing display format.

## 1.1.3 - 2026-03-31

- Migrated background alarm handling to MV3 APIs.
- Added startup/install alarm initialization.
- Fixed async alarm creation guard.
- Added modular architecture: core, storage, notifications, ui.
- Added timer schema versioning and migration path.
- Fixed URL UTM formatting and social link issue.
- Improved selected typo and message consistency.
- Added ESLint, Prettier, unit tests, and CI workflow.
- Added release packaging script.
