# AssessmentResultScreen with dual-scenario prediction and SHAP explainability

New screen for displaying obesity risk assessment results with two prediction scenarios (Clinical/BMI-based and Lifestyle-only), SHAP factor visualization, ML recommendations, and assessment history. The HealthCheckScreen flow now saves cycle data and navigates to this dedicated results screen instead of showing inline results.

The implementation handles both scenarios appropriately: when height/weight data exists, both Scenario A (clinical) and Scenario B (lifestyle) are displayed with a warning if lifestyle patterns suggest increased future risk. When anthropometric data is missing, only Scenario B runs with an informational banner explaining the limitation. SHAP factors are translated to Indonesian, color-coded by impact direction, and displayed with visual bars. The screen supports pull-to-refresh, tap-to-view history items, and navigation to monitoring.

**Watch for:** Prediction API mismatch (confirmed) — HealthCheckScreen navigates to AssessmentResultScreen expecting it to auto-trigger prediction via `POST /assessments/predict`, but the screen's initial load fetches existing assessments, requiring manual button press. Navigation type confusion (confirmed) — navigation.navigate('Main') doesn't allow programmatic tab selection; users must manually switch tabs. Missing error state recovery (likely) — network failures during assessment fetch leave no retry mechanism. Assessment detail endpoint assumption (possible) — `/assessments/:id` response structure matches screen expectations but hasn't been verified against backend contract.

**Verdict**: NEEDS_CHANGES

## High-level view

The screen's primary behavior is split between displaying existing assessment results and triggering new predictions. When opened, it fetches the latest assessment or a specific one by ID, parses dual-scenario results (BMI-based and lifestyle-only), and displays SHAP factors with translated labels. If no height/weight exists, an info banner explains the lifestyle-only limitation.

The integration between HealthCheckScreen and AssessmentResultScreen expects automatic prediction after form submission, but the navigation carries no signal that prediction should auto-run. The user arrives at the results screen and sees either stale data or an empty state, then must press "Analisis Risiko Obesitas Saya" manually. This breaks the expected flow from "Selesai & Lihat Hasil" button.

SHAP factor labels are hardcoded in a lookup map rather than fetched from the backend, creating a maintenance dependency if the ML model changes features. The map covers common features (FCVC, FAF, TUE) but unknown features fall back to raw names.

Error handling distinguishes between specific HTTP status codes (404 for incomplete profile, 409 for missing cycle data) but presents generic alerts for network failures. No retry UI exists; users must pull-to-refresh or restart the flow.

The admin evaluations section is conditionally rendered but has no data source yet — it's Phase 5 infrastructure waiting for backend implementation.

<details>
<summary>Issues (8)</summary>

1. **Prediction flow broken** — HealthCheckScreen navigates to AssessmentResultScreen after form submission expecting auto-prediction, but the screen only fetches existing assessments. Add a route param like `triggerPrediction: true` and call `handleAnalyzeRisk()` in useEffect when that flag is set.

2. **Navigation to Monitoring doesn't switch tab** — "Lihat Monitoring" button calls `navigation.navigate('Main')` without tab selection. Use a navigation prop like `navigation.navigate('Main', { screen: 'Monitoring' })` or remove the button if tab switching isn't supported.

3. **SHAP feature labels are hardcoded** — `getFeatureLabel()` maps feature names to Indonesian labels in-app. If the ML model adds or renames features, the mobile app shows raw names. Fetch feature metadata from `/api/predict/metadata` or include translations in the prediction response.

4. **No retry mechanism after fetch failure** — network errors show an alert, but the screen remains in a failed state. Add a "Coba Lagi" button in the error state or allow pull-to-refresh to retry.

5. **Assessment detail response structure unverified** — the screen expects `scenario_a_full`, `scenario_b_lifestyle`, `top_shap_factors`, `recommendations`, and `admin_evaluations` in `GET /assessments/:id`. Confirm this matches the backend contract from assessment-service.

6. **History mapping assumes lifestyle_prediction** — `fetchHistory()` maps `item.lifestyle_prediction?.obesity_class` but the backend may store this under a different key. Verify the response structure for `GET /assessments`.

7. **Admin evaluations section has no backend** — the section renders if `admin_evaluations` array is non-empty, but assessment-service doesn't populate this yet. Document that this is Phase 5 infrastructure.

8. **Error status code checking is brittle** — `result.error?.includes('404')` assumes the error string contains the status code. Return `statusCode` as a separate field from `authenticatedRequest` and check `result.statusCode === 404` instead of string matching.

</details>

<details>
<summary>Details</summary>

## Prediction flow disconnect between HealthCheckScreen and AssessmentResultScreen

HealthCheckScreen's step 3 completion saves cycle data via `POST /cycles` and then navigates to `AssessmentResultScreen` with `navigation.navigate('AssessmentResult', undefined)`. The user clicks "Selesai & Lihat Hasil" expecting to see their prediction, but AssessmentResultScreen's `useEffect` fetches the latest existing assessment via `GET /assessments` and `GET /assessments/:id`. If no assessment exists yet (the cycle was just created but no prediction was run), the screen shows an empty state: "Belum Ada Asesmen."

The user must then press "Analisis Risiko Obesitas Saya" to trigger `POST /assessments/predict`. This breaks the expected flow. The HealthCheckScreen button implies results will be shown immediately.

Three options to fix:
1. Add a route param `triggerPrediction: boolean` and call `handleAnalyzeRisk()` in `useEffect` when true.
2. Have HealthCheckScreen call `/assessments/predict` directly before navigating, then pass the new assessment ID.
3. Change the HealthCheckScreen button text to clarify prediction is triggered manually.

Option 1 is cleanest: `navigation.navigate('AssessmentResult', { triggerPrediction: true })`, then in AssessmentResultScreen:

```typescript
useEffect(() => {
  if (route.params?.triggerPrediction) {
    handleAnalyzeRisk();
  } else {
    fetchAssessment(route.params?.assessmentId);
  }
  fetchHistory();
}, []);
```

This ensures the user sees their new prediction immediately after form submission.

## SHAP factor display and feature label translation

The screen's `getFeatureLabel()` function maps ML feature names to Indonesian labels:

```typescript
const labels: { [key: string]: string } = {
  'FCVC': 'Konsumsi Sayur',
  'FAF': 'Aktivitas Fisik',
  'TUE': 'Waktu Layar (Screen Time)',
  // ... 11 total mappings
};
return labels[feature] || feature;
```

If the ML model adds or renames features, the mobile app shows raw names until a new release. The backend's `/api/predict/metadata` endpoint returns feature importance and correlations, but no translations. Either add a `feature_labels` map to the metadata response, or include `feature_label` in each SHAP factor object returned by `/api/predict`.

Impact arrow direction is counter-intuitive: up arrow + red = negative (increases obesity risk), down arrow + green = positive (decreases risk). This matches the domain semantics but reverses the typical "up = good" visual convention.

## Dual-scenario display logic edge case

If the backend returns `bmi` but no `scenario_a_full` (perhaps due to incomplete data), the screen sets `hasHeightWeight = false` and shows the "lifestyle-only" banner even though BMI exists. The check is:

```typescript
setHasHeightWeight(!!result.data.bmi && !!result.data.scenario_a_full);
```

The backend should ensure `scenario_a_full` is always present when `bmi` is calculated, or the screen should check `bmi` existence separately to avoid showing a misleading banner.

## Assessment history navigation and data mapping

History items are mapped from the list response:

```typescript
const historyData: AssessmentHistory[] = result.data.map((item: any) => ({
  id: item.id,
  assessment_date: item.assessment_date,
  bmi: item.bmi,
  obesity_class: item.lifestyle_prediction?.obesity_class || 'N/A',
  risk_level: item.lifestyle_prediction?.risk_level || 'N/A',
}));
```

This assumes the backend returns `lifestyle_prediction` as a nested object. The docs mention `lifestyle_prediction` (JSON) and `shap_factors` (JSON) are stored in the `assessments` table, but the response structure for `GET /assessments` isn't specified. If the backend returns flat fields like `obesity_class` and `risk_level` instead of `lifestyle_prediction.obesity_class`, the mapping breaks and history items show "N/A."

## API error handling and status code interpretation

The `handleAnalyzeRisk()` function checks `result.error?.includes('404')`, which assumes the error string contains the status code. The `authenticatedRequest` helper returns `data.message` or `HTTP error! status: ${response.status}`, so this should work, but it's brittle. Better to return structured errors:

```typescript
return {
  success: false,
  error: data.message || `HTTP error! status: ${response.status}`,
  statusCode: response.status,
};
```

Then check `result.statusCode === 404` instead of string matching.

## Navigation to Monitoring tab

The "Lihat Monitoring" button calls:

```typescript
navigation.navigate('Main');
// User will manually switch to Monitoring tab
```

The comment acknowledges this doesn't switch tabs. `Main` is a BottomTabNavigator, and React Navigation supports nested navigation via `navigation.navigate('Main', { screen: 'Monitoring' })`. If this isn't working, it's likely a navigation type issue. The `Props` type uses `CompositeScreenProps` to combine stack and tab navigation, but the navigator might not support this if `Main` isn't properly typed as a tab container.

If tab switching can't be implemented, remove the button — it's misleading to say "Lihat Monitoring" and then drop the user on whatever tab they were last on.

## Admin evaluations infrastructure

The `AdminEvaluation` interface is defined, the styles exist, and the display logic is complete, but the backend doesn't populate this yet — it's Phase 5 infrastructure. Document that this feature is inactive until Phase 5.

</details>

## File map

<details>
<summary>Files changed</summary>

- **obsense_mobile/src/screens/AssessmentResultScreen.tsx** — New screen displaying dual-scenario predictions, SHAP factors, recommendations, admin evaluations (Phase 5), and assessment history with pull-to-refresh.
- **obsense_mobile/src/styles/AssessmentResultScreen.styles.ts** — Styles for assessment screen: scenario cards, SHAP bars, risk badges, info banner, warning box, history list, empty state.
- **obsense_mobile/src/navigation/RootNavigator.tsx** — Registered AssessmentResultScreen as a stack screen with headerShown: false.
- **obsense_mobile/src/types/navigation.ts** — Added AssessmentResult route with optional assessmentId param to RootStackParamList.
- **obsense_mobile/src/screens/HealthCheckScreen.tsx** — Removed inline results display (step 4), added cycle data submission via POST /cycles, and navigation to AssessmentResultScreen after step 3 completion.

Full diff: `git diff main`

</details>
