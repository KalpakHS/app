# SmartNeb Mobile — Expo Go Guide

This is the native **Expo Go** mobile application shell for SmartNeb. It connects seamlessly to your running SmartNeb server and lets you test and view the complete mobile healthcare application directly on your physical iOS or Android phone.

---

## 🚀 Quick Start (In 3 Steps)

### Step 1: Install Expo Go on your Phone
* **iPhone (iOS):** Download **[Expo Go](https://apps.apple.com/app/expo-go/id982107772)** from the Apple App Store.
* **Android:** Download **[Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)** from the Google Play Store.

---

### Step 2: Ensure SmartNeb is Running
On your computer, ensure the SmartNeb frontend is running (either with Vite or Docker):

```bash
# In the project root:
npm run dev
```

*Verify both your phone and your computer are connected to the same Wi-Fi network.*

---

### Step 3: Start the Expo Bundler
Navigate into the `mobile` directory and run:

```bash
cd mobile
npm install   # (First time only)
npx expo start
```
*(Or from the project root: `npm run mobile`)*

1. A large **QR code** will appear in your computer's terminal.
2. **On Android:** Open the **Expo Go** app and tap **"Scan QR code"**.
3. **On iOS (iPhone):** Open the standard **Camera** app, point at the QR code, and tap the yellow **"Open in Expo Go"** banner.

---

## ⚙️ How It Connects to Your Computer

1. The Expo app **automatically detects** your computer's LAN IP address (e.g. `http://192.168.1.9:3000`) through Metro's connection host.
2. If your Wi-Fi IP ever changes or you are using a tunnel/hosted URL, tap **"⚙️ Server IP"** in the bottom floating pill to enter your new server address anytime.
3. Tap **"🔄 Reload"** to instantly refresh the application.

---

## 🛠️ Features Included in Expo Mobile Shell

* **Fullscreen Native Experience:** Automatically disables the desktop testbench toolbar on real devices.
* **Native Status Bar & Safe Area:** Styled with `#F8FAFC` light healthcare background and dark icons.
* **Hardware Back Button (Android):** Navigates backwards through screens naturally using Android gestures/buttons.
* **Connection Health Monitor:** Clear offline diagnostics screen with auto-retry if your dev server is restarting.
