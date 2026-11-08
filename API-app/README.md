## Human Interface Guidelines

**Consistency.** With the text I took advice from the Typography section in Material Design 3. There are three display types of text ranging from the headlines at the largest size, and smaller text for the bodies of articles on the home page. For labels I matched their advice on making them label large style. This enables 'quick reading at small sizes.' 

Another note of cinsistency is the color scheme. The app has a shared palette for the background, cards, buttons, and headlines. All the action buttons share the same color as well. 

**Feedback.** Regarding the loading state, a spinner at the top indicates to the user that the app is working and has progress. This along with the 'Loading articles' helps explain what is happening to the user. This is found in the Progress indicator guidelines in the material design website. 

# Loading State

When a user scrolls up on the home page of the articles there will be a spinner and a 'Loading articles' message on discover. It appears when the data from Hacker News and DEV.to is being sent to the app. 


## rest is ai written just to navigate the app

# Article Explorer

Article Explorer is an Expo and TypeScript app for discovering articles on Hacker News and DEV Community and keeping a local reading list. The public article APIs require no API keys, accounts, or OAuth.

## Features and screens

- **Discover** loads both sources, supports text searches and source filters, and provides pull-to-refresh and a refresh button. If one source fails, results from the other remain available.
- **Article details** shows the available description, cover image, and metadata. DEV articles load additional information from the individual article endpoint. You can bookmark the article or open its original link in your browser.
- **Saved** lists bookmarked articles and lets you remove them. AsyncStorage stores the reading list on the device across app launches.

## Technologies and APIs

The app uses React Native, Expo SDK 58, Expo Router, TypeScript, AsyncStorage, and the built-in `fetch()` API. It uses the [Hacker News Algolia API](https://hn.algolia.com/api) for recent stories and full-text search, and the [Forem API](https://developers.forem.com/api/v1) for published DEV posts, tags, and article details.

DEV search checks up to 30 posts from the general feed for matching title, author, description, or tags. Single-word queries such as `javascript` or `#javascript` also fetch up to 30 posts using the DEV tag filter. This search covers the fetched results only.

## Run in Expo Go

Install Node.js LTS and an Expo Go version that supports SDK 58. From the `API-app` folder, run:

```powershell
npm ci
npx expo start
```

Connect your computer and phone to the same Wi-Fi network. Scan the terminal QR code using Expo Go on Android or the Camera app on iOS. If your network blocks the connection, try `npx expo start --tunnel`. For browser testing, press `w` in the terminal.

## Checks

Run `npm run typecheck` for TypeScript and `npx expo install --check` for Expo dependency compatibility.
