# Criminal Intent

A simple Expo / React Native TypeScript school assignment with three screens.

## Run

```sh
npm install
npm start
```

Scan the QR code with an Expo Go version compatible with SDK 57, or press `a` with an Android emulator running. iOS simulator builds require macOS.

```sh
npm run typecheck
npx expo install --check
```

## Behavior

- The list starts empty. Add a crime with the + button.
- New crimes and edits stay in screen state until Save. Back discards unsaved changes.
- Save confirms success on the detail screen. Back refreshes the list.
- The photo button selects a library image; the date button opens the native picker.
- Solved crimes display handcuffs in the list.
- Settings has three light and three dark themes. Theme Context holds only settings.
- Crimes and the selected theme persist in separate AsyncStorage keys.
- Only the crime UUID is sent through the detail route (`new` identifies a new draft).

## Device acceptance check

1. Add a crime with a title, details, date, library photo, and solved checked. Save, then go back.
2. Reopen it and confirm all fields and the photo. Edit and save, then confirm the list updates.
3. Edit again and leave without saving. Reopen and confirm the edit was discarded.
4. Add another draft and leave without saving. Confirm it was not added.
5. Try each theme and inspect all three screens and headers.
6. Restart the app and confirm the saved crime and selected theme remain.
7. Confirm + appears only on the list and Settings has no cog.

Photo URIs come from the device picker. Clearing app data or deleting the source file can make an image unavailable. The assignment stores the URI rather than copying photos into managed app storage.
