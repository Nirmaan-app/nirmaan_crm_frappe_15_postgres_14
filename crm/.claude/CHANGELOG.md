# Frontend Changelog

Audit trail of documentation updates and insights from Claude Code sessions.

## Format

```
## YYYY-MM-DD — Session summary
- What changed and why
- Files affected
```

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
