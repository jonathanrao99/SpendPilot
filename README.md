# SpendPilot

SpendPilot is a cross-platform (iOS/Android/Web) mobile application built with Expo and React Native. It helps small businesses and individuals quickly scan, categorize, and manage bills and receipts, providing an easy way to track business expenses and view analytics.

## Key Features

• Scan or upload bills and receipts using the camera or image picker
• Automatic persistence of scanned images to local storage
• Manual or future automated cropping of bill images
• Form to enter and validate bill details: store name, date, category, tax paid, and total
• Categorize expenses into: Cooking Supplies, Electrical & Hardware, Gas, Other
• View a dashboard of existing bills with quick summaries
• Navigate between tabs: Dashboard, Analytics, Delivery Performance, Events, Scan
• Settings screen to configure business preferences
• Themed UI with dark/light mode support

## Installation and Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/spendpilot.git
   cd spendpilot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npx expo start
   ```
4. Launch the app in your preferred environment:
   - iOS Simulator (macOS only)
   - Android Emulator
   - Expo Go on a physical device
   - Web browser via Expo Web

## Project Structure

```
spendpilot/
├─ app/                  # File-based routes (via expo-router)
│  ├─ (tabs)/            # Main tab navigator screens
│  ├─ create-bill.tsx    # Form for new bills
│  ├─ scan-bill.tsx      # Camera & upload flow
│  ├─ settings.tsx       # App settings
│  └─ _layout.tsx        # Root layout & stack configuration
├─ components/           # Reusable UI components
├─ context/              # React Context providers (BillsContext, EventsContext)
├─ hooks/                # Custom hooks (useColorScheme, useThemeColor)
├─ constants/            # App-wide constants (Colors)
├─ assets/               # Fonts and images
├─ scripts/              # Utility scripts (reset project)
├─ README.md             # This file
├─ package.json
└─ tsconfig.json
```

## Core Libraries & Dependencies

- [Expo](https://expo.dev) & [expo-router](https://docs.expo.dev/router/introduction)
- [React Native Camera](https://docs.expo.dev/versions/latest/sdk/camera)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker)
- [React Native Paper](https://callstack.github.io/react-native-paper)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated)
- [Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)

## Usage Flow

1. **Scan or Upload** a bill via the Scan tab
2. **Preview** the captured image and **Confirm** to proceed
3. **Fill in** the bill details form on the Create Bill screen
4. **Save** the bill, which persists the image and details locally
5. **View** saved bills on the Dashboard, tap to see details in a modal
6. **Filter** and analyze expenses in the Analytics tab
7. **Manage** business settings in the Settings screen

## Future Enhancements

- Implement **automatic cropping** and edge detection for bills
- Add **OCR** to automatically extract text from receipts
- Provide **export** options (CSV, PDF)
- Integrate **cloud sync** and multi-device support

## Contributing

Contributions, issues, and feature requests are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -m 'Add feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
