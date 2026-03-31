# Manual Test Checklist

## Setup

1. Load unpacked extension in current Chrome stable.
2. Open overridden new tab page.

## Main Flow

1. Add timer with valid dates and verify it appears.
2. Add timer with invalid fields and verify validation messages.
3. Edit existing timer and verify updates persist.
4. Delete timer and verify it is removed.
5. Reset all timers and verify list is empty.

## Countdown Behavior

1. Verify day-only timer updates days.
2. Verify day+time timer updates days/hours/minutes.
3. Verify progress bar updates over time.

## Completion Behavior

1. Create short timer that expires soon.
2. Verify timer changes to inactive after completion.
3. Verify notification appears once per completion.
4. Verify sound plays on completion.
5. Verify auto-open URL opens tab only when enabled.

## Storage and Migration

1. Prepare old timer without schemaVersion/recurring/newTab fields.
2. Reload extension.
3. Verify timer is migrated and still visible/usable.

## Alarm Reliability

1. Reload extension and verify alarm exists.
2. Restart browser and verify alarm re-initializes.
