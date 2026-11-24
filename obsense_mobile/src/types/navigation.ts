/**
 * Central navigation type definitions.
 * Add new screens here as the app grows.
 */

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  HealthCheck: undefined;
  Monitoring: undefined;
  Profile: { userId?: string };
};
