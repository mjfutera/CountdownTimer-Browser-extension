# TODO - modernizacja Countdowns (bez utraty funkcjonalnosci)

## 1. Stabilizacja i regresja

- [x] Spisac aktualny kontrakt funkcjonalny (dodawanie, edycja, usuwanie, reset, notyfikacje, auto-open URL).
- [x] Dodac checklist testow manualnych dla glownego flow uzytkownika.
- [x] Potwierdzic, ze wszystkie timery dzialaja identycznie jak przed zmianami.

## 2. Poprawki MV3 i alarmow

- [x] Przeniesc obsluge alarmow na `chrome.alarms.onAlarm`.
- [x] Dodac inicjalizacje alarmu w `chrome.runtime.onInstalled` i `chrome.runtime.onStartup`.
- [x] Naprawic `setAlarmIfNotExist` (asynchronicznie z `await`).
- [x] Usunac martwe lub niepotrzebne eventy z service workera.

## 3. Refaktor architektury (bez zmiany UX)

- [x] Wydzielic modul `core` (kalkulacje czasu, walidacje, progres).
- [x] Wydzielic modul `storage` (operacje na `chrome.storage`).
- [x] Wydzielic modul `notifications` (powiadomienia i dzwiek).
- [x] Wydzielic modul `ui` (render listy, formularze, akcje).

## 4. Dane i kompatybilnosc

- [x] Dodac wersjonowanie schematu danych timera.
- [x] Dodac migracje starszych rekordow przy starcie.
- [x] Zachowac kompatybilnosc z obecnym formatem danych.

## 5. Jakosc i utrzymanie

- [x] Dodac ESLint + Prettier.
- [x] Dodac podstawowe testy jednostkowe dla funkcji czystych.
- [x] Dodac skrypt CI (lint + testy).
- [x] Uporzadkowac drobne bledy (literowki, UTM, nieuzywany kod).

## 6. Wydanie

- [x] Test koncowy na aktualnej wersji Chrome.
- [x] Podbic wersje rozszerzenia i przygotowac changelog.
- [x] Przygotowac paczke do publikacji.
