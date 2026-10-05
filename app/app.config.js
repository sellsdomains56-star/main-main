// Extends app.json with settings that come from the environment.
// GOOGLE_MAPS_ANDROID_API_KEY: Android maps use Google Maps and need a key (iPhone uses Apple Maps, no key).
module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    ["react-native-maps", process.env.GOOGLE_MAPS_ANDROID_API_KEY ? { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY } : {}],
  ],
});
