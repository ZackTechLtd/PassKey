# PassIndex — Implementation Plan

An Expo / React Native app where you paste a password, specify which character
positions you need (e.g. "3,5,7" — like sites ask for when logging in), and the
app shows you those characters.

Status: **plan only — no code changes made yet.**

---

## 1. Goal

- User pastes (or types) a password into a masked text box.
- User can click a check box to reveal the password
- User enters a comma-separated list of **1-based** positions, e.g. `3,5,7`.
- The app displays the characters at those positions (e.g. `3rd → x · 5th → y · 7th → z`).
- Everything stays local and in-memory: no storage, no network, nothing persisted.

## 2. Current project state

Fresh `create-expo-app` project:

- **Expo SDK 57** (`expo ~57.0.23`, React Native 0.86.3, React 19.2.3, TypeScript ~6.0.3)
- **expo-router** file-based routing under `src/app/` (`index.tsx` + `explore.tsx` tabs)
- Template ships a 2-tab layout (`NativeTabs` from `expo-router/unstable-native-tabs`),
  themed components (`ThemedText`, `ThemedView`), theme constants, and `@/* → ./src/*` path alias
- `app.json` has `typedRoutes` and `reactCompiler` experiments enabled

## 3. Environment findings (MacBook Air 2017, Monterey)

| Requirement | SDK 57 needs | This machine | OK? |
|---|---|---|---|
| Node.js | ≥ 22.13.x | v24.20.0 | ✅ |
| Xcode | 26.4+ | 14.2 (max for Monterey) | ❌ |

### Consequence: the iOS Simulator is not usable for this project

- Xcode 14.2 ships only the **iOS 16.2** simulator SDK/runtime.
- Expo SDK 57 requires **iOS 16.4+** and **Xcode 26.4+** (per the v57 docs).
- Therefore `npm run ios` cannot build, and Expo Go (SDK 57) cannot run on the
  iOS 16.2 simulator.

### Practical development loop

1. **`npm run web`** — primary dev loop; works today in the browser.
2. **Expo Go on the physical iPhone** (iOS 16.4+) — scan the QR from `npx expo start`; no build needed.
3. **EAS Build (cloud)** — later, when a real `.ipa` is wanted; Expo compiles on their servers.

## 4. Reference: the original Swift app

Source reviewed at `/Users/martinbelton/Documents/XCodeProjects/PasswordLetterApp`
(not on GitHub — the repo URL returns 404).

- It is a **macOS** app (Cocoa/`NSViewController`), not iOS.
- Core logic (`getLetters(item:input:)`):
  - Split positions input on `","`
  - Each entry parsed as `Int`, treated as **1-based** index (`offsetBy: intValue - 1`)
  - Characters joined with `","`
  - Non-numeric entries silently skipped; empty password → no output
- UI: **two independent panels** (password + positions + result), each with a reveal checkbox.

### Bugs in the original that we will fix

1. **No bounds checking** — position `0` or beyond the password length crashes
   (`item.index(offsetBy:)`). Our version validates and shows a friendly message.
2. **Copy-paste bug** — the second reveal checkbox shows *field 1's* password.
   Our version always reveals the correct field.

## 5. Implementation steps

### Step 1 — README reminder (`README.md`)

Add the run commands printed by the installer:

```bash
cd PassIndex
npm run android
npm run ios
npm run web
```

Plus a short note that `npm run ios` requires Xcode 26.4+ (so it's not a surprise later).

### Step 2 — Simplify to a single screen

- Delete `src/app/explore.tsx` and the `NativeTabs` wiring
  (`src/components/app-tabs.tsx`, `app-tabs.web.tsx`).
- Slim `src/app/_layout.tsx` to the root layout: keep `ThemeProvider` + splash
  screen handling, drop the tab navigator.
- Rebuild `src/app/index.tsx` as the PassIndex screen.
- Bonus: avoids the `unstable-native-tabs` API entirely.

### Step 3 — Core logic module (`src/lib/extract-letters.ts`)

Pure, testable functions mirroring the Swift behavior, but safe:

- `parsePositions(input)` — accepts `"3,5,7"`, `"3 5 7"`, `"3, 5,7"`; returns
  1-based indices, deduped, in the order typed (sites ask "3rd, 5th, 7th" — answer in that order).
- `extractLetters(password, positions)` — returns `{ letters, outOfRange, invalid }`
  so the UI can show the letters and flag problems separately.
- Handles: empty password, non-numeric entries (skipped like the original, but
  surfaced in the UI), position `0` / negative, positions beyond password length, duplicates.
- **Unicode-safe**: JS string indexing is UTF-16 code-unit based, so `"päss🔑"[3]`
  returns a broken surrogate half. Use code-point/grapheme-aware splitting
  (`Array.from` / `Intl.Segmenter`) so positions behave like the Swift original
  (character-based `String.Index`).

### Step 4 — The screen (`src/app/index.tsx`)

```
Password field (masked) ──► Positions input (3,5,7) ──► Letter tiles (3rd → x · 5th → y · 7th → z)
        │                                                        │
        ├── reveal toggle                                        ├── copy result
        └── paste button                                         └── auto-clear timer
```

- **Password field**: `TextInput` with `secureTextEntry` (masked) + reveal toggle
  + **paste button** (reads the clipboard via `expo-clipboard`; install with
  `npx expo install expo-clipboard`).
- **Positions field**: plain text input, results update live as you type.
- **Result**: large letter tiles labeled with their position, in requested order,
  plus the comma-joined string, with a **copy result** button.
- **Auto-clear timer**: displayed letters clear automatically after a short
  timeout (e.g. 30s).
- **Clear all** button; password also cleared when the app goes to background (`AppState`).
- Reuse the template's `ThemedText` / `ThemedView` / theme constants so dark mode keeps working.
- Single panel (confirmed decision).

### Step 5 — Tests

#### Setup (per the Expo v57 unit-testing docs)

- Install: `npx expo install jest-expo jest @types/jest --dev`
- Install React Native Testing Library: `npx expo install @testing-library/react-native --dev`
  (the docs note `react-test-renderer` is deprecated and does not support React 19)
- `package.json`: add `"test": "jest"` script and `"jest": { "preset": "jest-expo" }`
  (+ the recommended `transformIgnorePatterns`)
- `tsconfig.json`: add `"jest"` to `"types"`

#### Unit tests — `src/lib/extract-letters.ts` (the core value)

`src/lib/__tests__/extract-letters-test.ts` (jest-expo recognizes `-test.ts` files):

- `parsePositions`:
  - `"3,5,7"`, `"3 5 7"`, `"3, 5,7"` → `[3, 5, 7]`
  - empty input → `[]`
  - non-numeric entries skipped and flagged: `"3,x,7"` → `[3, 7]` + `invalid: ["x"]`
  - duplicates deduped, order preserved: `"5,3,5"` → `[5, 3]`
  - `0` and negatives rejected
- `extractLetters`:
  - 1-based indexing: `"abcdef"` + `[1,3,5]` → `"a,c,e"`
  - requested order preserved: `[5,1]` → `"e,a"`
  - out-of-range positions flagged, no crash (fixes the Swift bug)
  - empty password → empty result
  - **Unicode**: emoji in the password returns the full character, not a broken surrogate

#### Component test — the screen (light)

`src/app/__tests__/index-test.tsx` with `@testing-library/react-native`:

- Enter a password + positions → letter tiles appear
- Out-of-range position → friendly error message shown
- Empty password → no result
- Clipboard functions mocked; auto-clear timer tested with Jest fake timers

### Step 6 — Verification

- `npm test` (unit + component tests)
- `npx tsc --noEmit` and `npm run lint`
- Smoke-test on `npm run web`
- User tests on physical iPhone via Expo Go (iOS 16.4+)
- Consult the v57 docs (https://docs.expo.dev/versions/v57.0.0/) for any Expo API used

## 6. Decisions (confirmed)

- **Single panel** — one password + positions + result row (no second panel).
- **Clipboard support** — paste button on the password field and copy button on
  the result, via `expo-clipboard`.
- **Auto-clear timer** — displayed letters clear automatically after a short timeout.
