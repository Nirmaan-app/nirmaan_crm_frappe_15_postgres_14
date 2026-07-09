# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the React frontend directory. See parent `../.claude/CLAUDE.md` for full-stack overview including backend DocTypes, API patterns, and deployment.

## Quick Reference

| Documentation | When to Read |
|---------------|--------------|
| [.claude/context/role-access.md](.claude/context/role-access.md) | Working with authorization, route guards, role-based UI |
| [.claude/context/hooks.md](.claude/context/hooks.md) | Understanding/creating custom hooks, data fetching |
| [../.claude/context/apis.md](../.claude/context/apis.md) | Backend API endpoints for frontend integration |
| [../.claude/context/integrations.md](../.claude/context/integrations.md) | Frontend-backend communication, real-time, SWR cache |

## Commands

```bash
yarn dev          # Vite dev server on :8081, proxies to Frappe :8000
yarn build        # Build to ../nirmaan_crm/public/crm/ + copy HTML to www/
yarn preview      # Preview production build
```

## Architecture

### Provider Stack (main.tsx → App.tsx)

```
FrappeProvider          → frappe-react-sdk: API, auth, socket
  AuthProvider          → Custom login/logout, token management
    RealTimeProvider    → WebSocket subscriptions
      ApplicationProvider → Dialog & overlay state
        ThemeProvider    → Light/dark mode (localStorage: vite-ui-theme)
          RouterProvider → React Router v6
```

### Two-Tier Authorization

1. **ProtectedRoute** - Checks login status via `useAuth()`
2. **AuthorizationGuard** - Checks role from localStorage key `role` (not `userRole`)

Role/user data stored in localStorage after login for fast access. Trade-off: role changes require page reload.

### Role-Based Route Access (routesConfig.tsx)

| Role | Allowed Routes |
|------|----------------|
| Nirmaan Sales User Profile | `/`, `/boqs`, `/contacts`, `/companies`, `/tasks`, `/calendar`, `/reports` |
| Nirmaan Estimations User Profile | `/`, `/boqs`, `/calendar`, `/tasks` |
| Nirmaan Estimations Lead User Profile | `/`, `/boqs`, `/calendar`, `/tasks` |
| Nirmaan Admin User Profile | All routes including `/team`, `/team/packages`, `/reports` |

`/reports` (added Apr 2026) hosts two sub-reports: `/reports/sales-cohort` and `/reports/flow`. Estimations roles do not have access. Backend endpoint `nirmaan_crm/api/reports/sales_cohort.py` forces non-admin callers to `[session.user]` as a server-side security boundary.

## State Management

### Dialog Store (Zustand)

`src/store/dialogStore.ts` - 24 dialog types with typed context payloads:

```typescript
const { openNewTaskDialog, closeNewTaskDialog } = useDialogStore();
openNewTaskDialog({ companyId, contactId, boqId, task_profile: 'Sales' });
```

**Key behavior**: Dialog context persists on close (not cleared), allowing reopen with same data.

**New dialog types (April 2026):** `newEstimationTask`, `editEstimationTask`, `editProjectEstimation`, `companyProgress`

### Dialog Modes

- **BOQ dialogs**: `'details' | 'status' | 'attachment' | 'assigned-esitmate'`
- **Task dialogs**: `'edit' | 'updateStatus' | 'scheduleNext'`

## Form Validation Pattern

Forms use React Hook Form + Zod with conditional validation via `superRefine()`:

```typescript
// src/constants/boqZodValidation.ts
export const boqFormSchema = z.object({...}).superRefine((data, ctx) => {
  switch (data.boq_status) {
    case "New":        // requires boq_submission_date
    case "BOQ Submitted": // requires boq_link, boq_value
    case "Partial BOQ Submitted": // requires remarks, deadline
    // ... 9+ status cases with different required fields
  }
});
```

## Data Fetching

### frappe-react-sdk Hooks

```typescript
const { data, isLoading, error, mutate } = useFrappeGetDocList<TaskType>(
  'CRM Task',
  { fields: [...], filters: [...], orderBy: {...}, limit: 0 },
  swrKey  // Dynamic key for cache isolation
);
```

### SWR Key Pattern for Filtering

```typescript
const swrKey = `all-tasks-CIS${JSON.stringify(assignmentFilters)}`;
// Different filter combinations get independent cache entries
```

## Key Custom Hooks (src/hooks/)

| Hook | Purpose |
|------|---------|
| `useCurrentUser` | Fetch CRM Users doc, store role in localStorage |
| `useTaskData` | Task aggregation with filters, date grouping |
| `useTaskActions` | Mutation wrappers (create, update, delete) |
| `useGlobalSearch` | Cross-doctype search |
| `useSearchParamsManager` | URL query string state |
| `useStatusStyles` | Memoized status → color mapping |
| `useUserRoles` | Role-based UI conditionals |
| `useViewPort` | Viewport detection for responsive layout |
| `useUserRoleLists` | Role-based user option lists (Sales+Admin, Estimations+Lead) |
| `useTaskCreationHandler` | Role-aware task creation dialog routing |

## Styling

### Tailwind + CSS Variables

Colors defined as CSS custom properties in `src/index.css`:

```css
--primary: 240 5.9% 10%;
--chart-1: 12 76% 61%;
```

Used in Tailwind via `hsl(var(--color-name))`. Theme switching updates CSS variables without rebuild.

### shadcn/ui Components

38 components in `src/components/ui/` based on Radix UI primitives.

## Page Structure

Each page typically contains:
- `PageName.tsx` - List view with filters
- Detail view for viewing/editing
- `/forms/New${PageName}Form.tsx` - Create form
- `/forms/Edit${PageName}Form.tsx` - Update form
- `/components/` - Page-specific components

### Complex Pages

- **BOQ.tsx** - Multi-mode editing (details, status, attachment); Margin tile (Profit/Loss/BCS Incomplete states) + pending-data warnings on Project Overview
- **TaskList.tsx** - Infinite scroll, status filtering, date grouping
- **EditTaskForm.tsx** - Task profile-aware (Sales vs Estimates have different fields); shows an inline **Resolve Contact** collapse (`ResolveContactSection`) when the task's contact is the Unknown placeholder
- **Reports** - Hub at `/reports` with sub-reports: `SalesCohortReport` (cohort progression matrix; single-month timeline vs multi-month range view, contiguous-month selection rule) and `FlowReport` (3-month outcome funnel). Status canon in `pages/Reports/utils/cohortStatusGroups.ts`; month-range utilities in `cohortRange.ts`; flow buckets declarative in `flowBuckets.ts`.

### New Pages (April 2026)

- **Packages** (`/team/packages`) - Admin-only CRUD for CRM BOQ Package (specialization management; the seed fixture was removed Apr 2026, this UI now manages the doctype directly)
- **ProjectEstimationsTable** - Per-package estimation rows inside BOQ detail view
- **EditProjectEstimationForm** - BOQ vs BCS status editing with conditional value requirements
- **BoqBcsTaskExport** - CSV export of CRM Project Estimation data with contact resolution
- **EstimationsHomePage** - Estimation user dashboard with deadline-based color coding and review tables
- **Reports** (`/reports`, `/reports/sales-cohort`, `/reports/flow`) - Sales/Admin only; cohort + flow analytics

## Task Profiles

Tasks have a `task_profile` field: `'Sales' | 'Estimates'`

- Different form fields per profile
- Admin users see `selectTaskProfileDialog` to choose profile on creation

## Unknown Contact Resolve Flow

Sales task forms (`NewTaskForm`, `EditTaskForm` scheduleNext) offer a global **"Unknown"** placeholder contact (`src/constants/unknownContact.ts` → `UNKNOWN_CONTACT_ID`, backend id `unknown@nirmaan.app`) so a task can be logged for a company that has no real contact yet.

- In the task update dialog, when the task's contact is the placeholder, `Tasks/ResolveContactSection.tsx` renders an **inline collapsible** panel that first lets the user **select an existing company contact** (Unknown excluded) or switch to **create a new one** (company auto-set from the task, `assigned_sales` picker Admin-only). Either path links the contact to the task **directly (no second dialog)**; a local `resolvedContact` state hides the panel and updates the header immediately.
- `EditTaskForm` contact lists filter by **`taskData.company`** (not the linked contact's company, which is empty for the placeholder), so a company's real contacts — including a just-resolved one — load correctly. Rescheduling carries the resolved contact into the `scheduleNext` reopen.
- Backend/data handling: [../.claude/CLAUDE.md](../.claude/CLAUDE.md) → "Unknown Contact Placeholder".

## Mobile Layout

`useViewPort()` hook detects viewport size. Components render:
- **Desktop**: Sidebar + main area (DesktopLayout)
- **Mobile**: Bottom bar navigation (MobileLayout, BottomBar)

## Environment Variables

```
VITE_BASE_NAME=""         # Router basename
VITE_SOCKET_PORT=9001     # Frappe socket.io port
```

Frappe site name: uses `window.frappe.boot.sitename` if in Frappe context, else `VITE_SITE_NAME`.

## Build Details

- Output: `../nirmaan_crm/public/crm/`
- Post-build: copies `index.html` → `../nirmaan_crm/www/crm.html` for Frappe routing
- Production base path: `/assets/nirmaan_crm/crm/`
- PWA enabled with 5MB cache limit

## Import Aliases

```typescript
import { Button } from '@/components/ui/button';  // @/* → ./src/*
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { CRMCompany } from '@/types/NirmaanCRM/CRMCompany';
import { cn } from '@/lib/utils';
```

## Types

DocType interfaces in `src/types/NirmaanCRM/`:
- `CRMCompany`, `CRMBOQ`, `CRMTask`, `CRMContacts`, `CRMUsers`, `CRMNote`

## Changelog

Session insights and documentation updates are tracked in [.claude/CHANGELOG.md](.claude/CHANGELOG.md).
