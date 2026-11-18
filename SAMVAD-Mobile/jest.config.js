module.exports = {
  preset: 'react-native',
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|react-native-svg|lucide-react-native)/)',
  ],
};
