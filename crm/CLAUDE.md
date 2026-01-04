# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the React frontend directory. See parent `../.claude/CLAUDE.md` for full-stack overview including backend DocTypes, API patterns, and deployment.

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
2. **AuthorizationGuard** - Checks role from localStorage (no API call per navigation)

Role/user data stored in localStorage after login for fast access. Trade-off: role changes require page reload.

### Role-Based Route Access (routesConfig.tsx)

| Role | Allowed Routes |
|------|----------------|
| Nirmaan Sales User Profile | `/`, `/boqs`, `/contacts`, `/companies`, `/tasks`, `/calendar` |
| Nirmaan Estimations User Profile | `/`, `/boqs`, `/calendar`, `/tasks` |
| Nirmaan Admin User Profile | All routes including `/team` |

## State Management

### Dialog Store (Zustand)

`src/store/dialogStore.ts` - 20+ dialog types with typed context payloads:

```typescript
const { openNewTaskDialog, closeNewTaskDialog } = useDialogStore();
openNewTaskDialog({ companyId, contactId, boqId, task_profile: 'Sales' });
```

**Key behavior**: Dialog context persists on close (not cleared), allowing reopen with same data.

### Dialog Modes

- **BOQ dialogs**: `'details' | 'status' | 'attachment'`
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

- **BOQ.tsx** - Multi-mode editing (details, status, attachment)
- **TaskList.tsx** - Infinite scroll, status filtering, date grouping
- **EditTaskForm.tsx** - Task profile-aware (Sales vs Estimations have different fields)

## Task Profiles

Tasks have a `task_profile` field: `'Sales' | 'Estimations'`

- Different form fields per profile
- Admin users see `selectTaskProfileDialog` to choose profile on creation

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
