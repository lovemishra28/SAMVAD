/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(async key => store.get(key) ?? null),
      setItem: jest.fn(async (key, value) => { store.set(key, value); }),
      removeItem: jest.fn(async key => { store.delete(key); }),
      clear: jest.fn(async () => { store.clear(); }),
    },
  };
});
