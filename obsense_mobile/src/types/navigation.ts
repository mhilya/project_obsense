/**
 * Central navigation type definitions.
 * Add new screens here as the app grows.
 */

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Profile: { userId?: string };
};
