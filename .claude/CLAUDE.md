# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

| Documentation | When to Read |
|---------------|--------------|
| [context/doctypes.md](context/doctypes.md) | Working with DocType fields and relationships |
| [context/apis.md](context/apis.md) | Adding/modifying API endpoints |
| [context/patterns.md](context/patterns.md) | Code conventions and patterns |
| [context/workflows.md](context/workflows.md) | Doc events, permissions, BOQ pipeline, task lifecycle |
| [context/integrations.md](context/integrations.md) | Frontend-backend communication, REST hooks, real-time |
| [crm/CLAUDE.md](../crm/CLAUDE.md) | Frontend architecture and React patterns |
| [crm/.claude/context/](../crm/.claude/context/_index.md) | Frontend context files (hooks, roles) |

## Project Overview

Nirmaan CRM is a hybrid Frappe/ERPNext + React SPA application for managing offline leads. It combines a Python backend (Frappe framework) with a modern React frontend built with Vite, TypeScript, and Tailwind CSS.

## Development Commands

```bash
# Frontend (from crm/ directory)
yarn dev             # Vite dev server on port 8081
yarn build           # Production build to nirmaan_crm/public/crm/
yarn preview         # Preview production build

# Backend (via Frappe Bench from bench directory)
bench start          # Start development server
bench --site <site> migrate   # Run migrations
bench --site <site> console   # Python REPL with Frappe context
```

## Architecture

### Dual-Stack Structure

```
nirmaan_crm/
├── crm/                    # React SPA (Vite + TypeScript)
│   └── src/
│       ├── pages/          # Route components (BOQS, Companies, Contacts, Tasks, etc.)
│       ├── components/ui/  # 37+ Radix UI-based components
│       ├── hooks/          # 19 custom React hooks
│       └── store/          # Zustand state management
│
└── nirmaan_crm/            # Frappe Python backend
    ├── nirmaan_crm/doctype/  # 7 DocTypes (core business entities)
    ├── api/                  # Custom REST endpoints
    ├── integrations/         # Event handlers & controllers
    └── patches/              # Database migrations
```

### Core DocTypes

| DocType | Purpose |
|---------|---------|
| CRM Company | Lead/company records with assigned sales, priority |
| CRM Contacts | Contact persons linked to companies |
| CRM BOQ | Bill of Quantities (quotes/opportunities) with deal pipeline |
| CRM Task | Activities with date, status, task_profile |
| CRM Users | CRM profile extending Frappe User |
| CRM Note | Internal notes/comments |
| CRM Company Type | Classification fixture |

### Frontend Data Flow

- **frappe-react-sdk** for API calls to Frappe backend
- **Zustand** for client-side state management
- **React Hook Form + Zod** for form validation
- Custom hooks in `src/hooks/` abstract data fetching patterns

### Key Files

| File | Purpose |
|------|---------|
| `nirmaan_crm/hooks.py` | Frappe app config: doc events, permissions, fixtures |
| `nirmaan_crm/permissions.py` | Permission query conditions for Tasks/BOQs |
| `crm/vite.config.ts` | Build config with PWA, aliases, output path |
| `crm/tailwind.config.js` | Theme with CSS variable-based colors |

## API Patterns

### Backend (Python)

Whitelisted methods in `nirmaan_crm/api/`:
- `add_crm_user.py` - User profile creation
- `get_modified_crm_company.py` - Modified company records
- `global_search.py` - Cross-doctype search
- `users/get_sales_performance.py` - Sales metrics

DocType controllers handle lifecycle events via `hooks.py` doc_events.

### Frontend (TypeScript)

Use `frappe-react-sdk` hooks:
```typescript
import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk'
```

Path aliases configured: `@/*` → `./src/*`

## Permissions

Custom permission query conditions in `permissions.py`:
- `task_permission_query_conditions` - Filter tasks by assigned_sales
- `boq_permission_query_conditions` - Filter BOQs by assigned_sales

User creation auto-generates CRM Users profile via `integrations/controllers/crm_users.py`.

## Database Migrations

Patches in `nirmaan_crm/patches/v0_0/` run in order specified by `patches.txt`.

Create new patches:
1. Add Python file in `patches/v0_0/`
2. Register in `patches.txt`: `nirmaan_crm.patches.v0_0.patch_name`

## Build & Deploy

Frontend builds to `nirmaan_crm/public/crm/`, served by Frappe at `/assets/nirmaan_crm/crm/`.

CI/CD via GitHub Actions builds Docker image on git tags, pushing to Google Artifact Registry.

## Changelog

Session insights and documentation updates are tracked in [CHANGELOG.md](CHANGELOG.md).
