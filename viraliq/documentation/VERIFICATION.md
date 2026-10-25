# Build verification — October 24, 2026

Executed on Windows with Node 24.20.0 and npm 11.19.0.

| Check | Result |
|---|---|
| `npm run typecheck` | Passed, strict TypeScript, including server and tests |
| `npm test` | All 10 tests passed |
| `npx expo install --check` | Dependencies up to date for SDK 58 |
| `npx expo-doctor` | 20/20 checks passed |
| `npm ci --dry-run --ignore-scripts` | Passed, package/lockfile consistent |
| Android Metro/Hermes export | Passed |
| iOS Metro/Hermes export | Passed |
| Proxy health | HTTP 200, `{ "ok": true }` |
| Proxy research without X credentials | Explicit configuration error; no demo substitution |
| Proxy invalid generation request | HTTP 400, invalid generation options |
| Wireframes | Five PNG files generated; Generate image visually inspected |

Tests include a complete in-process demo research-to-generation workflow across all five tones and three lengths, requested variation counts, originality versus the sample source strings, weighted limits, filters, missing metrics, empty input, comparisons, zero baselines and persistence. File-backed SQLite tests reopen a database and check settings, schema version, expiry and draft preservation after dataset deletion. They use the same schema module as the app; they do not substitute for testing Expo's native driver on a phone.

The environment has no connected Android/iOS simulator or device session. Native UI interaction, accessibility, process-restart behavior through Expo SQLite, clipboard targets, keyboard dictation and the Share Sheet must be checked using ACCEPTANCE.md. Live X search and hosted AI responses were not tested with real credentials. Native exports validate route imports and bundle compilation; they are not signed installable APK/IPA files.

Dependency audit: a Zod override to 4.6.7 removes the reported Zod advisory from the dependency tree. Four high-severity audit entries remain in the upstream Expo CLI signing dependency chain (`node-forge` and dependent packages). The registry's current node-forge release is 1.4.0 and remains within the reported affected range. npm's suggested Expo downgrade would break this SDK, so it was not applied. Review upstream patches before using Expo CLI signing features or deploying the project. No private credentials were added to the deliverables.

No lint configuration exists; strict type validation, targeted tests, compatibility checks and native exports are the configured verification steps. Browser deployment is outside this mobile assignment's configured targets.
