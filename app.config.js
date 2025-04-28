const { config } = require('dotenv');
config();

module.exports = {
  expo: {
    name: "CalorieTrackerApp",
    slug: "calorietrackerapp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.calorietrackerapp",
      googleServicesFile: "./GoogleService-Info.plist",
      usesIcloudStorage: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.yourcompany.calorietrackerapp",
      googleServicesFile: "./google-services.json",
      permissions: ["INTERNET", "ACCESS_NETWORK_STATE"]
    },
    web: {
      bundler: "metro",
      favicon: "./assets/favicon.png"
    },
    plugins: ["expo-build-properties"],
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID
      },
      firebase: {
        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID
      }
    }
  }
};