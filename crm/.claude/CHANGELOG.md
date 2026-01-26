# Frontend Changelog

Audit trail of documentation updates and insights from Claude Code sessions.

## Format

```
## YYYY-MM-DD — Session summary
- What changed and why
- Files affected
```

## 2026-01-26 — BCS Status UI + Company nickname display

- Added BCS Status column to Estimations homepage (PendingBOQs + AllBOQs tables) with faceted filtering, color-coded pills, mobile rows, and CSV export
- Added `BoqBcsStatusCard` component on BOQ detail page with role-gated editing (Admin/Estimations only)
- Added `EditBcsStatusForm` dialog with ReactSelect dropdown for updating BCS Status
- Added `editBcsStatus` dialog type to dialogStore
- Added `company_nick` display throughout: CompanyTableView, CompanyDetailsCard, and company selectors in BOQ/Task/Contact forms

<!-- New entries go above this line -->
