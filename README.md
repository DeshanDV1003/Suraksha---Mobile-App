# Suraksha - Mobile App

Suraksha is a Disaster Management System mobile application built with React Native and Expo.

## Prerequisites

Before running the app, ensure you have the following installed on your machine:

1.  **Node.js** (LTS version recommended)
2.  **npm** (comes with Node.js)
3.  **Expo Go** app on your physical device (iOS or Android)
    -   [Download for Android](https://play.google.com/store/apps/details?id=host.exp.exponent)
    -   [Download for iOS](https://apps.apple.com/app/expo-go/id982107779)

## Getting Started

### 1. Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm install
```

### 2. Start the Development Server

Run the following command to start the Expo development server:

```bash
npm start
```

This will open the Expo Dev Tools in your terminal and display a QR code.

### 3. Run on a Device or Emulator

-   **Physical Device (Recommended):**
    -   Open the **Expo Go** app on your phone.
    -   Scan the QR code displayed in the terminal.
-   **Android Emulator:**
    -   Ensure your emulator is running.
    -   Press `a` in the terminal after starting the server.
-   **iOS Simulator (macOS only):**
    -   Ensure your simulator is running.
    -   Press `i` in the terminal after starting the server.
-   **Web:**
    -   Press `w` in the terminal to run the web version in your browser.

## Project Structure

-   `src/screens`: Contains the main application screens (`HomeScreen`, `ProfileScreen`).
-   `src/navigation`: Navigation configuration (Bottom Tabs, Stack).
-   `src/store`: State management using Zustand.
-   `src/i18n`: Internationalization (English, Sinhala, Tamil support).
-   `src/components`: Reusable UI components.
-   `assets`: Images, icons, and splash screens.

## Technologies Used

-   **Framework:** React Native (Expo)
-   **Styling:** NativeWind (Tailwind CSS)
-   **UI Library:** React Native Paper
-   **Navigation:** React Navigation
-   **State Management:** Zustand
-   **Data Fetching:** TanStack Query (React Query)
-   **Internationalization:** i18next
