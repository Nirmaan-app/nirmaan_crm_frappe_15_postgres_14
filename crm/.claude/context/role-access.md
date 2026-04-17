# Role-Based Access Control

Authorization system for Nirmaan CRM frontend.

## Role Profiles

| Profile | Backend Roles | Primary Use |
|---------|---------------|-------------|
| Nirmaan Admin User Profile | System Manager, Nirmaan Admin User, Nirmaan Estimations User, Nirmaan Sales User | Team management, all access |
| Nirmaan Sales User Profile | Nirmaan Sales User | Lead/contact management |
| Nirmaan Estimations User Profile | Nirmaan Estimations User, System Manager | BOQ estimations |
| Nirmaan Estimations Lead Profile | Nirmaan Estimations User, System Manager | Estimation team lead, package routing |

Note: Lead profile has same backend roles as Estimations User — differentiation is via role-profile NAME string only.

---

## Route Access Matrix

| Route | Admin | Sales | Estimations | Est. Lead |
|-------|-------|-------|-------------|-----------|
| `/` (Home) | Y | Y | Y | Y |
| `/boqs` (Projects) | Y | Y | Y | Y |
| `/contacts` | Y | Y | N | N |
| `/companies` | Y | Y | N | N |
| `/tasks` | Y | Y | Y | Y |
| `/calendar` | Y | Y | Y | Y |
| `/settings` | Y | Y | Y | Y |
| `/team` | Y | N | N | N |
| `/team/packages` | Y | N | N | N |
| `/team/details` | Y | N | N | N |

---

## Authorization Architecture

### Two-Tier System

```typescript
// 1. ProtectedRoute - Checks login status
<ProtectedRoute>
  // 2. AuthorizationGuard - Checks role from localStorage
  <AuthorizationGuard>
    <PageComponent />
  </AuthorizationGuard>
</ProtectedRoute>
```

### File Locations

| Component | File | Purpose |
|-----------|------|---------|
| ProtectedRoute | `src/auth/ProtectedRoute.tsx` | Login check via useAuth() |
| AuthorizationGuard | `src/auth/AuthorizationGuard.tsx` | Role check from localStorage |
| routesConfig | `src/routesConfig.tsx` | Route definitions with roles |

---

## Route Configuration

**File:** `src/routesConfig.tsx`

```typescript
// Authorization is NOT per-route config.
// AuthorizationGuard reads localStorage.getItem('role') and
// checks against hardcoded role lists in the guard component.
```

---

## Role Storage

### On Login

```typescript
// useCurrentUser.ts
const user = await fetchCRMUser(email);
localStorage.setItem('role', user.nirmaan_role_name);
localStorage.setItem('userEmail', user.email);
```

### Reading Role

```typescript
// AuthorizationGuard.tsx
const userRole = localStorage.getItem('role');
// Checks against hardcoded role lists per route in the guard component
```

### Trade-off

| Approach | Benefit | Drawback |
|----------|---------|----------|
| localStorage | Fast navigation (no API call) | Role changes require logout/login |

---

## Role Checking Hooks

### useUserRoles

**File:** `src/hooks/useUserRoles.ts`

```typescript
export function useUserRoles() {
  const role = localStorage.getItem('role');

  return {
    isAdmin: role === 'Nirmaan Admin User Profile',
    isSales: role === 'Nirmaan Sales User Profile',
    isEstimations: role === 'Nirmaan Estimations User Profile',
    role,
  };
}
```

> **Note:** There is NO `isEstimationsLead` flag. Components needing Lead-specific checks must compare `localStorage.getItem('role') === 'Nirmaan Estimations Lead Profile'` directly.

### useUserRoleLists

**File:** `src/hooks/useUserRoleLists.ts`

Fetches users across all 4 role profiles and returns:
- `salesUserOptions` -- Sales + Admin users
- `estimationUserOptions` -- Estimations User + Estimations Lead users

### Usage

```typescript
function Component() {
  const { isAdmin, isSales } = useUserRoles();

  return (
    <div>
      {isAdmin && <AdminOnlySection />}
      {isSales && <SalesOnlySection />}
    </div>
  );
}
```

---

## Conditional UI by Role

### Navigation Items

**File:** `src/hooks/useNavItems.ts`

```typescript
export function useNavItems() {
  const { isAdmin, isSales, isEstimations } = useUserRoles();

  return [
    { path: '/', label: 'Home', show: true },
    { path: '/companies', label: 'Companies', show: isAdmin || isSales },
    { path: '/contacts', label: 'Contacts', show: isAdmin || isSales },
    { path: '/boqs', label: 'BOQs', show: true },
    { path: '/tasks', label: 'Tasks', show: true },
    { path: '/team', label: 'Team', show: isAdmin },
  ].filter(item => item.show);
}
```

### Task Profile Selection

```typescript
// Admin sees profile selector, others get auto-assigned
function NewTaskButton() {
  const { isAdmin } = useUserRoles();

  const handleClick = () => {
    if (isAdmin) {
      openSelectTaskProfileDialog();
    } else {
      openNewTaskDialog({ task_profile: inferProfileFromRole() });
    }
  };
}
```

---

## Backend Permission Sync

### Permission Queries

Backend filters data by `assigned_sales` field:

| DocType | Sales User Sees | Estimations Sees | Est. Lead Sees | Admin Sees |
|---------|-----------------|------------------|----------------|------------|
| CRM Company | Own | - | - | All |
| CRM Contacts | Own | - | - | All |
| CRM BOQ | Own | All | All | All |
| CRM Task | Own | Own | Own | All |

### API Role Filtering

```typescript
// global_search API
const results = await call({
  search_term: query,
  user_role: localStorage.getItem('role'),
});
// Backend filters results by role
```

### AssignmentFilterControls

**File:** `src/components/ui/AssignmentFilterControls.tsx`

Per-role filter UI on list pages:
- **Sales**: "Assigned to Me / All" tabs on Company & Contact lists
- **Estimations User/Lead**: "Filter by Sales User" multi-select on BOQ list
- **Admin**: Sales-user dropdown on all list types
- Includes `__UNASSIGNED__` sentinel for "not set" filter

---

## Adding New Protected Route

1. **Add route to routesConfig.tsx:**

```typescript
{
  path: '/new-page',
  element: <NewPage />,
}
```

2. **Add role check in AuthorizationGuard** (hardcoded role lists in the guard component):

```typescript
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <AuthorizationGuard>
        <NewPage />
      </AuthorizationGuard>
    </ProtectedRoute>
  }
/>
```

3. **Add to navigation (optional):**

```typescript
// useNavItems.ts
{ path: '/new-page', label: 'New Page', show: isAdmin || isSales }
```

---

## Role-Based Form Fields

### Task Forms

| Field | Sales | Estimations / Est. Lead | Admin |
|-------|-------|-------------------------|-------|
| task_profile | Auto: "Sales" | Auto: "Estimates" | Selectable |
| company | Required | Optional | Required |
| contact | Optional | Hidden | Optional |
| boq | Optional | Required | Optional |

### Implementation

```typescript
// EditTaskForm.tsx
const { isSales, isEstimations } = useUserRoles();

const schema = useMemo(() => {
  if (isEstimations) {
    return estimationsTaskSchema;
  }
  return salesTaskSchema;
}, [isEstimations]);
```

---

## Common Patterns

### Admin-Only Button

```typescript
function ActionButton() {
  const { isAdmin } = useUserRoles();

  if (!isAdmin) return null;

  return <Button onClick={adminAction}>Admin Action</Button>;
}
```

### Role-Based Redirect

```typescript
function HomePage() {
  const { isEstimations } = useUserRoles();

  // Estimations users start at BOQs
  if (isEstimations) {
    return <Navigate to="/boqs" />;
  }

  return <SalesDashboard />;
}
```

### Filtered Data Display

```typescript
function TaskList() {
  const { isAdmin } = useUserRoles();
  const userEmail = localStorage.getItem('userEmail');

  const filters = isAdmin
    ? {}
    : { assigned_sales: userEmail };

  const { data } = useFrappeGetDocList('CRM Task', { filters });
}
```
