# Library Seat Booking
Tiếng Việt: [README.vi.md](README.vi.md)

Mobile app for booking library study seats before exams (Mobile App Development, class TH7011101, checkpoint Day 01-08).

Student: Nguyễn Vũ Ngọc Huy — MSSV 1923050808

Repository: <[repository URL](https://github.com/gounchy/library-seat-booking)>

## What it does

Students sign in, browse library seats (filter by zone, search by seat id), open a seat, and book a time slot. The app rejects overlapping bookings, shows how full each zone is right now, and keeps working offline.

## Requirements

- Node.js 20.19.4 or newer 
- Git
- Android Studio with an Android emulator 
- Expo SDK `57` 

## Install and run

```bash
git clone <https://github.com/gounchy/library-seat-booking>
cd library-seat-booking
npm ci
npx expo start
```

Start the Android emulator first, then press `a` in the terminal. Expo CLI opens the app in Expo Go on the emulator.

Do not use the web target. `expo-secure-store` does not work on the web, and only Android was tested.

## Mock accounts

The "server" is a mock that lives in memory (`src/api`). It is not a real backend.

| Student ID | Password |
|---|---|
| 1923050808 | library123 |
| 1923050001 | library123 |

The passwords are written in the source on purpose: this is a fake server so that anyone can sign in. A real server would store password hashes.

## Features 

| Requirement | Where |
|---|---|
| Sign in / sign out, session survives restart, sign-out truly ends it | `src/store/auth-store.ts`, `src/lib/secure-storage.ts`, `src/app/_layout.tsx` |
| Seats from a mock API, created and edited in the app | `src/api/seats-api.ts`, `src/app/seat/new.tsx`, `src/app/seat/[id]/edit.tsx` |
| List and detail views, filter by zone, search by seat id | `src/app/(tabs)/index.tsx`, `src/app/seat/[id].tsx`, `src/lib/filter-seats.ts` |
| Book a seat for a time slot, shown as taken immediately | `src/app/book/[seatId].tsx`, `src/features/bookings/` |
| Overlapping bookings are rejected (not only exact duplicates) | `src/lib/overlap.ts`, checked in the form and again in `src/api/bookings-api.ts` |
| Occupancy by zone, computed from today's bookings, never stored | `src/lib/occupancy.ts`, `src/app/(tabs)/occupancy.tsx` |
| Offline: last successful load shown with a banner, offline edits not lost | `src/lib/network.ts`, `src/lib/query-client.ts`, `src/store/outbox-store.ts`, `src/features/offline/` |
| Loading, empty, error (working retry) and content states | `src/components/query-state.tsx` |
| Light and dark themes from one token file | `src/constants/theme.ts`, `src/hooks/use-theme.ts` |
| Accessibility: role and label, 44 x 44 touch targets, 4.5:1 contrast | see "Accessibility" below |

## Architecture

```
src/
  app/          Expo Router screens (file-based routes; (tabs) is a route group; [id] is a dynamic route)
  api/          Mock server: in-memory database, latency and failure simulation
  store/        Zustand stores (auth, filters, offline outbox), always read through selectors
  features/     TanStack Query hooks (seats, bookings) and the offline queue and replay
  lib/          Pure business logic (overlap, occupancy, validation, contrast) with unit tests
  components/   Shared UI (AppButton, AppTextInput, QueryState, banner...)
  constants/    theme.ts: the only file with colour values
```

Where each kind of data lives:

| Data | Where | Why |
|---|---|---|
| Seats and bookings | TanStack Query | Server data: it can be stale and needs caching, retry and refetch |
| Search text, selected zone, current user, outbox | Zustand | Data that exists only in the app |
| Auth session (token) | SecureStore only | It is a secret; SecureStore is encrypted, AsyncStorage is not |
| Query cache, outbox items | AsyncStorage | Not secret; needed to work after a restart while offline |
| Filtered seats, occupancy percentage | Not stored | Derived from seats, bookings and the current time |

## Design decisions 

- A time slot is `{ start: "HH:mm", end: "HH:mm" }`. The end is exclusive, so 14:00-16:00 and 16:00-18:00 do not conflict.
- A seat is "taken now" when a booking covers the current time. A booking for another time still appears in the seat's booking list.
- Bookings in a past date are rejected. Earlier hours of today are allowed.
- The token file is `src/constants/theme.ts` (kept from the Expo template) instead of `src/theme/tokens.ts`.
- `app.json` contains two colour values (splash and icon background). Native build settings cannot read the token file, so these are the only colours outside `theme.ts`. `npm run check:colors` scans `src/`.
- The UI language is English.

## Offline behaviour

- The TanStack Query cache is saved to AsyncStorage and restored on start, so the last successful load shows even without a connection. A banner says so.
- While offline, creating or editing a seat and booking a seat are saved in an outbox (Zustand persisted to AsyncStorage) and applied to the cache so they show immediately.
- When the connection returns, the outbox is replayed in order. If the server rejects an item (for example someone else booked the slot meanwhile), it stays in the outbox with the reason, and the user can review and discard it on the "Pending changes" screen.
- Signing out with unsynced changes asks for confirmation, then clears them.

## Dev tools

In development (`npx expo start`), each list screen has a collapsed "Show dev tools" panel. It does not exist in a production build.

| Button | What it does |
|---|---|
| Simulate offline | Makes the app behave as if the device had no connection |
| Simulate server errors | Every request fails until switched off (to see the error state and Retry) |
| Fail the next request | Only the next request fails |
| Clear seats cache and reload | Empties the seats cache to show the loading state again |
| Server: another student books B03 15:00-17:00 | Adds a booking directly on the mock server, to test a conflict during replay |

## Accessibility

- Buttons and text inputs are built from `AppButton` and `AppTextInput`, which require a label at the type level. Touch targets use `MinTouchTarget` (44).
- Contrast is checked automatically for every text and background pair in both themes (`src/lib/contrast.test.ts`).
- `scripts/audit-a11y.js` checks labels and touch-target size on a running Android emulator: `adb shell uiautomator dump /sdcard/ui.xml`, `adb pull /sdcard/ui.xml ui.xml`, then `node scripts/audit-a11y.js ui.xml <density>` (density from `adb shell wm density`).

## Testing

```bash
npm run check
```

runs, in order: `tsc --noEmit` (TypeScript strict), `expo lint`, the colour literal check, and the Jest unit tests. It passes on a fresh clone (`npm ci`, then `npm run check`).



## Known limitations

- The mock server keeps data in memory, so reloading the app resets it (seats and bookings created in a session disappear from the "server").
- Changes are queued only when the device reports offline. A random network error while online shows an error and keeps the form, but does not queue.
- If the seat list is refetched before a replay finishes, a queued change can briefly disappear and reappear.
- While the offline banner shows, screens with a native header may have extra space at the top.
- Mock tokens are not signed. A real server would sign them.
- Tested only on an Android emulator. iOS and physical devices were not tested.

## Stretch idea

<If implemented: "Second filter: Has outlet. I chose it because students who study before exams often need to charge a laptop. It was cheap: it filters the already cached seat list, reuses the Zustand filter store and the pure filter function, and has unit tests." If not: "No stretch idea implemented.">
