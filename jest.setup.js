/**
 * Jest setup file
 * Runs before each test file
 */

// Polyfill atob/btoa for Node.js (used by storage service)
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');

// Mock react-native-url-polyfill
jest.mock('react-native-url-polyfill/auto', () => ({}));

// Mock react-native-config
jest.mock('react-native-config', () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
}));

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(() => Promise.resolve(null)),
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-haptic-feedback
jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
}));

// Mock react-native-biometrics
jest.mock('react-native-biometrics', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    isSensorAvailable: jest.fn(() => Promise.resolve({ available: false, biometryType: null })),
    simplePrompt: jest.fn(() => Promise.resolve({ success: true })),
  })),
  BiometryTypes: {
    TouchID: 'TouchID',
    FaceID: 'FaceID',
    Biometrics: 'Biometrics',
  },
}));

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(() => Promise.resolve({ isConnected: true, isInternetReachable: true })),
}));

// Mock @react-native-async-storage/async-storage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock @react-native-community/geolocation
jest.mock('@react-native-community/geolocation', () => ({
  getCurrentPosition: jest.fn((success) =>
    success({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
        altitude: 0,
        accuracy: 10,
        altitudeAccuracy: 10,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    })
  ),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  setRNConfiguration: jest.fn(),
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  readFile: jest.fn(() => Promise.resolve('base64EncodedContent==')),
  writeFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
  unlink: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
  DocumentDirectoryPath: '/mock/documents',
  CachesDirectoryPath: '/mock/caches',
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  createChannel: jest.fn(() => Promise.resolve('channel-id')),
  displayNotification: jest.fn(() => Promise.resolve()),
  cancelNotification: jest.fn(() => Promise.resolve()),
  cancelAllNotifications: jest.fn(() => Promise.resolve()),
  getTriggerNotifications: jest.fn(() => Promise.resolve([])),
  createTriggerNotification: jest.fn(() => Promise.resolve()),
  TriggerType: { TIMESTAMP: 0 },
  AndroidImportance: { HIGH: 4 },
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    State: {},
    Directions: {},
  };
});


// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useFocusEffect: jest.fn(),
  };
});

// Silence specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated:') || args[0].includes('componentWillReceiveProps'))
  ) {
    return;
  }
  originalWarn(...args);
};

