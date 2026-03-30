# TODO - modernizacja Countdowns (bez utraty funkcjonalnosci)

## 1. Stabilizacja i regresja
- [ ] Spisac aktualny kontrakt funkcjonalny (dodawanie, edycja, usuwanie, reset, notyfikacje, auto-open URL).
- [ ] Dodac checklist testow manualnych dla glownego flow uzytkownika.
- [ ] Potwierdzic, ze wszystkie timery dzialaja identycznie jak przed zmianami.

## 2. Poprawki MV3 i alarmow
- [ ] Przeniesc obsluge alarmow na `chrome.alarms.onAlarm`.
- [ ] Dodac inicjalizacje alarmu w `chrome.runtime.onInstalled` i `chrome.runtime.onStartup`.
- [ ] Naprawic `setAlarmIfNotExist` (asynchronicznie z `await`).
- [ ] Usunac martwe lub niepotrzebne eventy z service workera.

## 3. Refaktor architektury (bez zmiany UX)
- [ ] Wydzielic modul `core` (kalkulacje czasu, walidacje, progres).
- [ ] Wydzielic modul `storage` (operacje na `chrome.storage`).
- [ ] Wydzielic modul `notifications` (powiadomienia i dzwiek).
- [ ] Wydzielic modul `ui` (render listy, formularze, akcje).

## 4. Dane i kompatybilnosc
- [ ] Dodac wersjonowanie schematu danych timera.
- [ ] Dodac migracje starszych rekordow przy starcie.
- [ ] Zachowac kompatybilnosc z obecnym formatem danych.

## 5. Jakosc i utrzymanie
- [ ] Dodac ESLint + Prettier.
- [ ] Dodac podstawowe testy jednostkowe dla funkcji czystych.
- [ ] Dodac skrypt CI (lint + testy).
- [ ] Uporzadkowac drobne bledy (literowki, UTM, nieuzywany kod).

## 6. Wydanie
- [ ] Test koncowy na aktualnej wersji Chrome.
- [ ] Podbic wersje rozszerzenia i przygotowac changelog.
- [ ] Przygotowac paczke do publikacji.
