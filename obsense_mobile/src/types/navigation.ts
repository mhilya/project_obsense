/**
 * Central navigation type definitions.
 * Add new screens here as the app grows.
 */

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Main: undefined;
  AssessmentResult: { assessmentId?: number; triggerPrediction?: boolean } | undefined;
};

export type BottomTabParamList = {
  Home: undefined;
  HealthCheck: undefined;
  Monitoring: undefined;
  Profile: { userId?: string };
};
