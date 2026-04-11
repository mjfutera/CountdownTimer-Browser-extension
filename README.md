# Countdown Timer - Browser Extension

<p align="center">
	<img src="public/logos/logo.png" alt="Countdowns logo" width="128" />
</p>

Countdown Timer is a cross-browser extension for tracking important events with clean, visual countdown timers right on your New Tab page. Built with the [WXT framework](https://wxt.dev/) and TypeScript, supporting Chrome, Firefox, and Edge.

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
- Cross-browser support (Chrome, Firefox, Edge)

## Stack and Structure

- [WXT](https://wxt.dev/) framework with TypeScript
- Manifest V3
- Vite bundler
- `utils/core.ts` for date/time logic
- `utils/storage.ts` for persistence and migrations
- `utils/ui.ts` for rendering helpers
- `utils/notifications.ts` for sound/notifications
- `entrypoints/background.ts` for alarms lifecycle
- `entrypoints/newtab/` for the New Tab page

## Quality

- Prettier
- Automated publishing via `wxt submit`