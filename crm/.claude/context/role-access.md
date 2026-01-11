# Role-Based Access Control

Authorization system for Nirmaan CRM frontend.

## Role Profiles

| Profile | Backend Roles | Primary Use |
|---------|---------------|-------------|
| Nirmaan Admin User Profile | System Manager, Nirmaan Admin | Team management, all access |
| Nirmaan Sales User Profile | Nirmaan Sales User | Lead/contact management |
| Nirmaan Estimations User Profile | Nirmaan Estimations User | BOQ estimations |

---

## Route Access Matrix

| Route | Admin | Sales | Estimations |
|-------|-------|-------|-------------|
| `/` (Home) | Y | Y | Y |
| `/boqs` | Y | Y | Y |
| `/contacts` | Y | Y | N |
| `/companies` | Y | Y | N |
| `/tasks` | Y | Y | Y |
| `/calendar` | Y | Y | Y |
| `/team` | Y | N | N |
| `/settings` | Y | Y | Y |
| `/prospects` | Y | Y | N |

---

## Authorization Architecture

### Two-Tier System

```typescript
// 1. ProtectedRoute - Checks login status
<ProtectedRoute>
  // 2. AuthorizationGuard - Checks role
  <AuthorizationGuard allowedRoles={['Admin', 'Sales']}>
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
export const routesConfig = [
  {
    path: '/',
    element: <Home />,
    allowedRoles: ['Admin', 'Sales', 'Estimations'],
  },
  {
    path: '/team',
    element: <MyTeamPage />,
    allowedRoles: ['Admin'],
  },
  // ...
];
```

---

## Role Storage

### On Login

```typescript
// useCurrentUser.ts
const user = await fetchCRMUser(email);
localStorage.setItem('userRole', user.nirmaan_role_name);
localStorage.setItem('userEmail', user.email);
```

### Reading Role

```typescript
// AuthorizationGuard.tsx
const userRole = localStorage.getItem('userRole');
if (!allowedRoles.includes(userRole)) {
  return <Navigate to="/" />;
}
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
  const role = localStorage.getItem('userRole');

  return {
    isAdmin: role === 'Nirmaan Admin User Profile',
    isSales: role === 'Nirmaan Sales User Profile',
    isEstimations: role === 'Nirmaan Estimations User Profile',
    role,
  };
}
```

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

| DocType | Sales User Sees | Estimations Sees | Admin Sees |
|---------|-----------------|------------------|------------|
| CRM Company | Own | - | All |
| CRM Contacts | Own | - | All |
| CRM BOQ | Own | All | All |
| CRM Task | Own | Own | All |

### API Role Filtering

```typescript
// global_search API
const results = await call({
  search_term: query,
  user_role: localStorage.getItem('userRole'),
});
// Backend filters results by role
```

---

## Adding New Protected Route

1. **Add route to routesConfig.tsx:**

```typescript
{
  path: '/new-page',
  element: <NewPage />,
  allowedRoles: ['Admin', 'Sales'],
}
```

2. **Wrap with guards in router:**

```typescript
<Route
  path="/new-page"
  element={
    <ProtectedRoute>
      <AuthorizationGuard allowedRoles={['Admin', 'Sales']}>
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

| Field | Sales | Estimations | Admin |
|-------|-------|-------------|-------|
| task_profile | Auto: "Sales" | Auto: "Estimations" | Selectable |
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
