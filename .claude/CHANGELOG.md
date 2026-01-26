# Backend Changelog

Audit trail of documentation updates and insights from Claude Code sessions.

## Format

```
## YYYY-MM-DD — Session summary
- What changed and why
- Files affected
```

## 2026-01-26 — BCS Status field + Company nickname

- Added `company_nick` (Data) field to CRM Company DocType for nickname/abbreviation
- Added `bcs_status` (Data) field to CRM BOQ DocType (default: "Pending", options: Pending/Review Pending/Completed)
- Added `set_default_bcs_status` patch to backfill existing BOQs
- Updated `doctypes.md` with both new fields

<!-- New entries go above this line -->
