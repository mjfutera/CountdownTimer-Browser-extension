# Functional Contract

## Core User Flows

1. Add timer:

- User can create a timer with title, start date, end date, optional description, optional show time, optional auto-open URL.
- Validation blocks save when fields are invalid.

2. Edit timer:

- User can edit all timer fields.
- Save persists timer in the same list slot.

3. Remove timer:

- User can remove timer from list after confirmation.

4. Reset:

- User can reset all timers and settings with confirmation.
- Storage data is removed and recurring timers alarm is recreated.

5. Notifications:

- Timer completion triggers Chrome notification and optional sound.

6. Auto-open URL:

- If enabled, timer completion opens configured URL in a new tab.

## Timer States

- Active timer: displayed with countdown, progress bar, and actions.
- Inactive timer: displayed as expired with edit/delete actions.

## Storage Contract

- Main key: cdbm_timers_storage in chrome.storage.sync.
- Stored value is JSON string with timer array.
- Timer object schema versioned via schemaVersion.

## Alarm Contract (MV3)

- Alarm name: timers.
- Service worker initializes alarm on onInstalled and onStartup.
- Alarm handler checks timers and deactivates completed timers.
