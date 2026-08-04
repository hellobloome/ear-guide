# Package 17 — Combination Audit

## What was audited

All 20 Bloomé condition guides were reviewed together for:

- a condition-specific Primary point
- simple 3–4 point routines
- explicit Primary / Support / Optional roles
- overlap between similar guides
- clear user intent for choosing one guide over another
- related-guide navigation
- English / Bahasa Melayu consistency

## Key changes

- Roles are now stored in `conditions.json` as `pointRoles`.
- The UI and Guided Application Mode use those explicit roles instead of assuming that
  the first point is Primary and the final point is automatically Optional.
- Several guides were reordered so their first point better reflects the guide's specific focus.
- Similar guides now include a short **Best for** line.
- Condition pages now surface related guides.

## Audited combinations

| Guide | Audited order |
| --- | --- |
| Stress | shen-men (Primary) → sympathetic (Support) → heart (Support) → point-zero (Optional support) |
| Sleep | shen-men (Primary) → heart (Support) → occiput (Support) → kidney (Optional support) |
| Head Tension | occiput (Primary) → shen-men (Support) → sympathetic (Support) → point-zero (Optional support) |
| Digestion | stomach (Primary) → spleen (Support) → sympathetic (Support) → point-zero (Optional support) |
| Focus | brain (Primary) → shen-men (Support) → point-zero (Support) → kidney (Optional support) |
| Low Energy | kidney (Primary) → brain (Support) → spleen (Support) → point-zero (Optional support) |
| Neck & Shoulder Tension | cervical-spine (Primary) → shoulder (Support) → sympathetic (Support) → shen-men (Optional support) |
| Cravings | mouth (Primary) → stomach (Support) → shen-men (Support) → point-zero (Optional support) |
| Menstrual Comfort | endocrine (Primary) → shen-men (Support) → sympathetic (Support) → kidney (Optional support) |
| Jaw Tension | jaw (Primary) → shen-men (Support) → sympathetic (Support) → point-zero (Optional support) |
| Travel Queasiness | stomach (Primary) → inner-ear (Support) → sympathetic (Support) → shen-men (Optional support) |
| General Balance | point-zero (Primary) → shen-men (Support) → sympathetic (Support) |
| Eye & Screen Comfort | eye (Primary) → liver (Support) → shen-men (Support) → point-zero (Optional support) |
| Back Comfort | thoracic-spine (Primary) → lumbar-spine (Support) → shoulder (Support) → shen-men (Optional support) |
| Lower-Body Comfort | hip (Primary) → lumbar-spine (Support) → sympathetic (Support) → shen-men (Optional support) |
| Breathing Reset | lung (Primary) → shen-men (Support) → sympathetic (Support) → point-zero (Optional support) |
| After-Meal Comfort | stomach (Primary) → large-intestine (Support) → small-intestine (Support) → spleen (Optional support) |
| Daily Recovery | adrenal (Primary) → kidney (Support) → shen-men (Support) → subcortex (Optional support) |
| Deep Relaxation | subcortex (Primary) → shen-men (Support) → heart (Support) → thalamus (Optional support) |
| Travel Balance | inner-ear (Primary) → point-zero (Support) → shen-men (Support) → stomach (Optional support) |

## Overlap decisions

- **Stress vs Deep Relaxation:** Stress is the quick daytime calming reset. Deep Relaxation is the slower rest-focused routine.
- **Digestion vs After-Meal Comfort:** Digestion is broad. After-Meal Comfort is specifically framed around a normal meal.
- **Travel Queasiness vs Travel Balance:** Queasiness focuses first on Stomach. Travel Balance focuses first on Inner Ear.
- **Back Comfort vs Lower-Body Comfort:** Back Comfort prioritizes thoracic / lumbar regions. Lower-Body Comfort prioritizes Hip.
- **Low Energy vs Daily Recovery:** Low Energy is an energy-oriented reset. Daily Recovery is framed around winding down after a demanding day.
- **Focus vs Eye & Screen Comfort:** Focus prioritizes concentration. Eye & Screen Comfort prioritizes visual-rest habits.

## Safety / claims approach

These are Bloomé wellness combinations, not diagnostic or treatment protocols. The guide continues
to use traditional-use language and directs users to professional care for severe, persistent,
sudden or unexplained symptoms.
