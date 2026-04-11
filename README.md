# Countdowns - Chrome Extension

<p align="center">
	<img src="public/logos/logo.png" alt="Countdowns logo" width="128" />
</p>

Countdowns is a Chrome extension for tracking important events with clean, visual countdown timers right on your New Tab page.

## Links

- Public repository: https://github.com/mjfutera/CountdownTimer-Browser-extension
- Project page: https://michalfutera.pro/my-projects/countdown-timer-chrome-extension/
- Author website: https://michalfutera.pro
- Telegram: https://t.me/MichalFuteraPro

## Socials

<p>
	<a href="https://michalfutera.pro" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/mfpro.png" alt="MichalFutera.pro" width="44" />
	</a>
	&nbsp;
	<a href="https://github.com/mjfutera/CountdownTimer-Browser-extension" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/gitHub.png" alt="GitHub" width="44" />
	</a>
	&nbsp;
	<a href="https://www.linkedin.com/in/michalfutera/" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/linkedIn.png" alt="LinkedIn" width="44" />
	</a>
	&nbsp;
	<a href="https://twitter.com/mjfutera" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/twitter.png" alt="X (Twitter)" width="44" />
	</a>
	&nbsp;
	<a href="https://linktr.ee/mjfutera" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/linkTree.png" alt="Linktree" width="44" />
	</a>
	&nbsp;
	<a href="https://www.buymeacoffee.com/mjfutera/" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/buyMeACoffee.png" alt="Buy Me A Coffee" width="44" />
	</a>
	&nbsp;
	<a href="https://t.me/MichalFuteraPro" target="_blank" rel="noopener noreferrer">
		<img src="public/logos/socialMedia/telegram.png" alt="Telegram" width="44" />
	</a>
</p>

## Key Features

- Multiple countdown timers in one place
- New Tab integration for quick access
- Progress indicators and clean timer cards
- Browser notifications for timer milestones
- Persistent storage and schema migration support

## Stack and Structure

- Manifest V3 Chrome extension
- Vanilla JavaScript, HTML, CSS
- `core.js` for date/time logic
- `storage.js` for persistence and migrations
- `ui.js` for rendering helpers
- `notifications.js` for sound/notifications
- `background.js` for alarms lifecycle

## Quality

- ESLint + Prettier
- Unit tests in `tests/core.test.js`
- CI workflow in `.github/workflows/ci.yml`
- Packaging script in `tools/package-extension.ps1`