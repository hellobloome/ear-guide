# Package 15 — Guided Application Mode

## Purpose

Adds a one-point-at-a-time application flow to every existing condition combination.

## Flow

Condition page
→ Start application
→ Step 1 / point location and stimulation
→ Next point
→ Continue through the condition combination
→ Completion / skin-care reminders
→ Return to condition guide

## Design decisions

- Uses each condition's existing pointIds, so Package 15 does not create new treatment combinations.
- Uses the existing mapPositions, so the guided marker matches the full Ear Map.
- Upcoming points are visually softened.
- Completed points show a check mark.
- Current point is the only strongly highlighted marker.
- The guide does not claim that the user's seed has actually been placed correctly.
- English and Bahasa Melayu use the same route and data model.

## Safety

Guided Application Mode is general wellness education. It does not confirm clinical point
placement or replace professional medical advice.
