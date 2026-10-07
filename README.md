# OpenTuner

OpenTuner is a focused, chromatic tuner web app. It listens to a device microphone and shows the nearest note, measured frequency, cents deviation, and whether the note is flat, in tune, or sharp. Audio analysis runs locally in the browser; there is no account, backend, or recording.

## Stack

- React 18 and TypeScript
- Vite
- Web Audio API with a lightweight autocorrelation pitch detector
- Vitest and React Testing Library
- Playwright

## Install and run

Use Node.js 20, 22, or 24+.

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

Run unit and component tests with `npm run test`. Run the browser smoke test with `npm run test:e2e` (install the Playwright browser once with `npx playwright install chromium` if needed).

## Microphone requirements

Microphone permission is requested only after selecting **START**. Microphone capture requires a secure browser context (HTTPS, or localhost during development) and a browser with `getUserMedia` and Web Audio support. Denied permission, a missing or busy microphone, and unsupported browsers are reported in the UI. Use a quiet space; headphones can help avoid feedback.

The app does not send audio anywhere. The built application has no runtime network dependency and works offline once its assets have been loaded; browser microphone access still requires the user’s device and permission.

## Architecture

The tuner logic is plain TypeScript and has no browser or React dependency:

- `src/features/tuner/domain` contains musical-note/frequency conversion, tuning tolerance, result types, and a smoothing tuner engine.
- `src/features/tuner/application` contains the controller/state machine and the `PitchSource` port.
- `src/features/tuner/infrastructure` contains the web-specific microphone/audio lifecycle and YIN pitch detector.
- `src/components`, `src/app`, and `src/hooks` contain the React UI and UI binding.

`TunerController` receives a `PitchSource`, so tests can use simulated frequencies and a future native adapter can replace the web implementation without changing note calculations or tuning rules.

## Project structure

```text
src/
  app/                 Main screen
  components/          Gauge, note, status, frequency, and control
  features/tuner/
    application/       Controller and audio-source interface
    domain/            Platform-independent tuner logic
    infrastructure/    Browser microphone and pitch detection
  hooks/               React controller binding
  styles/              Global styles
tests/                 Test setup
e2e/                   Playwright smoke test
```

## Known limitations

- Pitch detection is optimized for a clear, single fundamental and can be less reliable with strong harmonics, room noise, or very quiet sources.
- A4 reference frequency can be adjusted from 1 to 1000 Hz; the in-tune tolerance is fixed at ±5 cents.
- Browser and device microphone quality affect measurement stability.

## React Native / Expo migration

React Native and Expo are not included in this MVP. The domain and application layers use platform-independent TypeScript interfaces. A future Expo app can keep the note math, tuning rules, state model, and engine, then provide a native audio/pitch-source adapter and a React Native UI in place of `WebPitchSource` and the web components.
