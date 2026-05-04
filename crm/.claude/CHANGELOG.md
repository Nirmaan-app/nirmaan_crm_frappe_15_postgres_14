# Frontend Changelog

Audit trail of documentation updates and insights from Claude Code sessions.

## Format

```
## YYYY-MM-DD — Session summary
- What changed and why
- Files affected
```

## 2026-05-04 — Flow funnel view, BOQ/BCS estimation filter, edit project name + salesperson

- **Flow Report funnel view** (`6b26a77`): added `components/FlowFunnel.tsx` (SVG-based funnel) rendered side-by-side with the existing tile view. New `active` bucket in `utils/flowBuckets.ts`. Funnel stage order controlled declaratively by `FUNNEL_STAGES`; `lost` peeled to `FUNNEL_DROPS` rendered as separate drop-off cards. Win Rate = `won / (won + lost)` (decided-only, returns null when no decisions). `computeWinRate()` carries a `TODO(human)` block for swapping to closure-rate formula. Changed `won` bucket accent from `destructive` to `success`.
- **Projects table BOQ/BCS estimation status filter** (`2a9433d`): added `EstimationStatusFilter.tsx` (Command + Popover multi-select). Two independent toolbar filters; combined with **OR semantics** in `filteredBoqs` so users can match projects with EITHER a selected BOQ status OR a selected BCS status. Pre-filters BEFORE `useDataTableLogic` because TanStack's column-filter pipeline ANDs across columns — needed OR. Reuses the existing `all-project-estimation-values` fetch (added `status` field) so no extra round-trip. Status options live in `dropdownData.ts` as `BoqTypeEstimationStatusOptions` and `BcsTypeEstimationStatusOptions` (BOQ-type list adds Done; BCS-type list is the canonical 5).
- **Reports hub back button** (`8202d2c`): `Reports.tsx` adds an `ArrowLeft` button to navigate to `/`.
- **Edit project name + assigned salesperson** (`2aaf8fe`): added `SquarePen` icon next to project title that opens `RenameBoqName` dialog. `EditBoqForm` exposes an Assigned Salesperson `ReactSelect` (sales user options) — visible only to **Admin** or **Nirmaan Estimations Lead Profile**. Added `assigned_sales` to both `boqFormSchema` and `boqDetailsSchema` (optional). `RenameBoqName` SWR sweep expanded: now sweeps `BOQ/` (stale OLD-id detail keys), `project-estimations-`, `all-est-versions-project-`, `all-version-`, and exact `home-estimation-review-{estimations,projects}` / `all-boqs-existornot` / `all-project-estimation-values`. Contact field label changed: "Contact" → "Company Contact".

## 2026-05-02 — Project Estimation `Done` status + terminal-project cascade

- **`Done` terminal status** (`5a8ce6e`): added to BOQ-type Project Estimations (Done is now a closing status alongside the existing BCS-only Done/Not Applicable terminal set). UI option added in `EditProjectEstimationForm`. Pill class delegated to `getStatusPillClass` from `EstimationsReviewTable` for consistent styling.
- **Down-cascade — terminal project → Done estimations**: `_cascade_done_to_estimations` in `crm_boq.py` runs from `on_update` BEFORE `recompute_parent_project_status`. When `boq_status` transitions into `{Won, Lost, Dropped}`, all child estimations not already in `{Done, Not Applicable}` are forced to `Done`. Each forced row writes a `_log_estimation_auto_status_version` Version row with `auto_derived: true` so `BoqSubmissionHistory` shows an AUTO badge. **No reverse cascade** — moving the parent back out of terminal set leaves Done children alone.
- **Estimation pre-validation guard**: `_force_done_for_terminal_parent` in `crm_project_estimation.py` covers the edge case of adding a new estimation to a closed project — `validate()` runs before value-validation so a freshly-added BCS row on a Won/Lost/Dropped parent is auto-`Done` and does not trigger BCS-Done value-required validation incorrectly.
- **`_derive_status` filtering**: rows with status in `TERMINAL_BUCKET` (`{done, not applicable}`) are excluded from derivation so a single closed package doesn't break parent derivation. Returns `None` (no-op) if every row is terminal — parent stays at its current status.
- **Backfill patch** `patches/v0_0/backfill_estimation_done_for_terminal_projects.py`: aligns existing data, idempotent, preserves `modified` timestamp (`update_modified=False`). DB-agnostic — uses `frappe.db.set_value` per row rather than raw JOIN UPDATE because Postgres doesn't support MySQL JOIN-UPDATE syntax.
- Files: `crm_boq.py`, `crm_project_estimation.py`, `patches/v0_0/backfill_estimation_done_for_terminal_projects.py`, `pages/BOQS/forms/EditProjectEstimationForm.tsx`, `pages/BOQS/components/ProjectEstimationsTable.tsx`, `pages/BOQS/BOQ.tsx`, `dropdownData.ts`.

## 2026-04-30 — Reports section: Sales Cohort + Flow

- New Reports hub at `/reports` linking to two sub-reports. `/reports` added to the Sales-role allowlist in `AuthorizationGuard.tsx`; Estimations roles (User, Lead) do not have access.
- **Sales Cohort Report** (`/reports/sales-cohort`): dual rendering in `components/CohortMatrix.tsx` — `TimelineMatrix` for single-month cohort, `RangeMatrix` (merged cohort column + trailing months progression) when multiple months selected. 12-month selector window with gap-fill (`fillRange`) and contiguous-trim-on-deselect (`trimToContiguous`) in `utils/cohortRange.ts`. Multi-select supports non-contiguous months via broadest-window query + post-filter on the backend.
- **Flow Report** (`/reports/flow`): outcome funnel for projects received in last ~3 months. Buckets defined declaratively in `utils/flowBuckets.ts`. Tiles open `statsDetail` dialog on click, reusing `boqNameFormatter` from `pages/Home/StatsGrid`.
- Backend: `nirmaan_crm/api/reports/sales_cohort.py` accepts `cohort_months[]` and `assigned_sales[]`; forces non-admin to `[session.user]` server-side as the security boundary (frontend filters are UX only).
- Shared status canon in `utils/cohortStatusGroups.ts`: `STATUS_GROUP.active` includes **Hold** (Hold counts as in-pipeline, not lost).
- Files: `crm/src/pages/Reports/{Reports,SalesCohortReport,FlowReport}.tsx`, `pages/Reports/{components,hooks,utils,types.ts}`, `nirmaan_crm/api/reports/sales_cohort.py`, `routesConfig.tsx`, `auth/AuthorizationGuard.tsx`.

## 2026-04-23 — Margin tile, BCS Incomplete, Estimations Lead access

- Renamed Profit tile to **Margin** on Project Overview (`pages/BOQS/BOQ.tsx`); rendered only when `create_bcs === 1`, hidden for sales. Computed `(1 - SUM(BCS)/SUM(BOQ)) * 100` with divide-by-zero guard. Color-coded Profit (emerald, ≥ 0) / Loss (red, < 0) / "--" / amber **BCS Incomplete** when any BCS row is missing a value or no BCS rows exist.
- Added amber `AlertTriangle` warnings on Total BOQ Value and Margin tiles for missing/zero estimation values; click smooth-scrolls to `#project-estimations-table`.
- Extended `canManageStatus` to include **Nirmaan Estimations Lead Profile** so the Project Status dialog button is visible for that role; backend write permission was already in place via the shared Nirmaan Estimations User role.

## 2026-04-19 — Deadline cascade, BCS toggle-off cleanup, auto-status history markers

- **BCS toggle is now reversible.** Removed `_lock_create_bcs_once_enabled` permanent lock from `crm_boq.py`. Added `_cleanup_bcs_rows_on_toggle_off` that hard-deletes all BCS-type Project Estimations when `create_bcs` flips 1 → 0. `EditBoqForm` gates the toggle-off with a destructive-confirm `ReusableAlertDialog`.
- **Deadline cascade.** New `_cascade_deadline_to_children` overwrites every child `CRM Project Estimation.deadline` when the parent `boq_submission_date` changes. Opt-in via `cascade_deadline` transient flag passed from `EditBoqForm`'s submit (form prompts the user with `ReusableAlertDialog` before applying).
- **Auto-status history markers.** `recompute_parent_project_status` now writes a Version row tagged `auto_derived: true` via `_log_auto_status_version`. `BoqSubmissionHistory` (UI label renamed to "Project Status Update History") renders an amber **AUTO** badge on those rows so users can distinguish manual vs auto-derived status changes.
- Files: `crm_boq.py`, `pages/BOQS/EditBoqForm.tsx`, `pages/BOQS/BOQ.tsx`, `pages/BOQS/components/BoqSubmissionHistory.tsx`, `pages/BOQS/forms/EditProjectEstimationForm.tsx`, `pages/BOQS/components/BoqTableView.tsx`.

## 2026-04-18 — Auto-derive BOQ status from Project Estimations

- Shipped auto-status cascade: `CRM Project Estimation.on_update` now cascades to parent `CRM BOQ.boq_status` via `on_estimation_update` (new controller `nirmaan_crm/integrations/controllers/crm_project_estimation.py`) → `recompute_parent_project_status` / `_derive_status` in `crm_boq.py`. Rules: all-new → New; all submitted-full → Submitted; any submitted → Partially Submitted; all progress-bucket → In-Progress. Skipped when parent is in LOCK_STATUSES (Won/Lost/Dropped/Hold/Negotiation).
- Consolidated `boq_status` enum: renamed `In Progress` → `In-Progress`, `On Hold` → `Hold`; removed `BOQ Submitted`, `Partial BOQ Submitted`, `Revision Pending`, `Revision Submitted` (these exist only at estimation level now).
- Added two data patches: `patches/v0_0/rename_legacy_boq_status_values.py` (rename legacy values) and `patches/v0_0/recompute_boq_status_from_estimations.py` (backfill derived status for non-locked BOQs).
- Added frontend indicator: `isCascadeDerivedBoqStatus()` in `src/hooks/useStatusStyles.ts` identifies auto-derived statuses (New, In-Progress, Partially Submitted, Submitted); UI renders a `RefreshCw` icon + tooltip so users know those statuses are computed from child estimations and not directly editable at the project level.
- Zod validation (`src/constants/boqZodValidation.ts`), dropdown data, and status badges updated to match the new enum.

## 2026-01-26 — BCS Status UI + Company nickname display

- Added BCS Status column to Estimations homepage (PendingBOQs + AllBOQs tables) with faceted filtering, color-coded pills, mobile rows, and CSV export
- Added `BoqBcsStatusCard` component on BOQ detail page with role-gated editing (Admin/Estimations only)
- Added `EditBcsStatusForm` dialog with ReactSelect dropdown for updating BCS Status
- Added `editBcsStatus` dialog type to dialogStore
- Added `company_nick` display throughout: CompanyTableView, CompanyDetailsCard, and company selectors in BOQ/Task/Contact forms

<!-- New entries go above this line -->
