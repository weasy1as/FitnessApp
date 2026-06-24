# Progress Page

## Goal

Help users see how their strength is progressing over time by exercise and muscle group.

## Defaults

- Default timeframe: `8 weeks`
- Secondary timeframe: `30 days`
- Main metric: kg increase over time
- PR rule: highest `weight_kg` ever logged for that exercise
- Data source: existing Supabase tables: `workouts`, `workout_exercises`, `workout_sets`, `exercises`

## User Experience

Dashboard-style page with exercise search, selected exercise chart, PR highlights, and muscle-group overview.

## Implementation Checklist

- [x] 1. Feature Documentation
  - [x] Create `features.md`.
  - [x] Add the Progress Page spec and checklist.
  - [x] Mark only this documentation part complete after the file exists.
- [x] 2. Data Access Layer
  - [x] Add a query/helper that loads workout set history for the current user.
  - [x] Join workouts, workout exercises, workout sets, and exercises.
  - [x] Include `exercise_id`, `exercise_name`, `primary_muscle`, `started_at`, `weight_kg`, `reps`, and set position.
  - [x] Support timeframe filtering for `8 weeks` and `30 days`.
  - [x] Verify returned data matches Supabase rows.
- [x] 3. Progress Calculations
  - [x] Build selected exercise weight history.
  - [x] Build earliest vs latest top weight in timeframe.
  - [x] Build all-time highest-weight PR detection.
  - [x] Build muscle-group summaries based on exercise progress.
  - [x] Use `exercise_name` as fallback when `exercise_id` is missing.
  - [x] Add tests or sample checks for each calculation.
- [x] 4. Progress Page UI Shell
  - [x] Add the Progress Page route/screen.
  - [x] Add timeframe toggle with `8 weeks` selected by default.
  - [x] Add exercise search/select control.
  - [x] Add empty/loading/error states.
  - [x] Keep the layout dashboard-like and mobile-friendly.
- [x] 5. Exercise Progress Chart
  - [x] Show selected exercise progression over time.
  - [x] Plot top logged `weight_kg` per workout/date.
  - [x] Display reps as supporting context in labels/tooltips.
  - [x] Highlight PR points visually.
- [x] 6. PR Highlights
  - [x] Add a compact recent PR section.
  - [x] Show exercise name, new kg record, reps, and workout date.
  - [x] Hide or show a friendly empty state when no PRs exist in the selected timeframe.
- [x] 7. Muscle Group Overview
  - [x] Group exercises by `primary_muscle`.
  - [x] Show muscles with improving exercises in the selected timeframe.
  - [x] Let users click a muscle group to filter or browse related exercises.
  - [x] Avoid creating a fake overall "muscle strength score"; summarize exercise-level progress instead.
- [ ] 8. Final Verification
  - [x] Test with users who have workouts, no workouts, no recent sets, and no PRs.
  - [x] Verify 8-week and 30-day views.
  - [ ] Verify mobile and desktop layouts.
  - [x] Update `features.md` checklist so every completed part is checked off.

## Test Plan

- Data query returns only the current user's workouts.
- Timeframe toggle changes the displayed set history.
- Exercise selector updates the chart correctly.
- PR detection compares against all-time exercise history, not only the selected timeframe.
- Muscle groups use `exercises.primary_muscle`.
- Null `exercise_id` entries still appear using `exercise_name`.
- Empty states appear without crashes.

## Assumptions

- Implementation will be done one part at a time.
- `features.md` will be the source checklist during development.
- No database schema changes are required for the first version.
- The first version prioritizes clear progress by exercise over advanced analytics.
