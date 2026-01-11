# Custom Hooks Reference

All 19 custom React hooks in Nirmaan CRM frontend.

## Hook Summary

| Hook | Purpose | File |
|------|---------|------|
| useCurrentUser | Fetch CRM Users doc, store role | useCurrentUser.ts |
| useDebounce | Debounce input values | useDebounce.ts |
| useFabOptions | FAB menu options by context | useFabOptions.ts |
| useGlobalSearch | Cross-doctype search | useGlobalSearch.ts |
| useNavItems | Navigation sidebar items | useNavItems.ts |
| usePageHeader | Page header state | usePageHeader.ts |
| useSearchParamsManager | URL query string state | useSearchParamsManager.ts |
| useStatusStyles | Status → color/icon mapping | useStatusStyles.ts |
| useTaskActions | Task CRUD mutations | useTaskActions.ts |
| useTaskCreationHandler | Task creation workflow | useTaskCreationHandler.ts |
| useTaskData | Task fetching with filters | useTaskData.ts |
| useTaskEditor | Task editing state | useTaskEditor.ts |
| useToast | Toast notifications | use-toast.ts |
| useUrlState | URL-based filter state | useUrlState.ts |
| useUserRoleLists | Role-based user lists | useUserRoleLists.tsx |
| useUserRoles | Role checking utilities | useUserRoles.ts |
| useViewPort | Viewport detection | useViewPort.ts |

---

## Data Fetching Hooks

### useCurrentUser

**File:** `src/hooks/useCurrentUser.ts`

**Purpose:** Fetch CRM Users doc for logged-in user, store role in localStorage.

```typescript
const { user, isLoading, error } = useCurrentUser();

// user: CRMUsers | null
// Stores role in localStorage on success
```

**Side Effects:**
- Sets `localStorage.userRole`
- Sets `localStorage.userEmail`
- Sets `localStorage.userName`

---

### useTaskData

**File:** `src/hooks/useTaskData.ts`

**Purpose:** Fetch tasks with filters, date grouping, and pagination.

```typescript
const {
  tasks,
  isLoading,
  error,
  mutate,
  stats,
} = useTaskData({
  taskProfile: 'Sales',
  status: ['Scheduled', 'Pending'],
  assignedSales: 'user@example.com',
  dateRange: { from: startDate, to: endDate },
});

// tasks: grouped by date
// stats: { total, completed, pending, overdue }
```

**Features:**
- SWR caching with dynamic keys
- Date grouping (Today, Tomorrow, This Week, etc.)
- Filter-aware cache isolation

---

### useGlobalSearch

**File:** `src/hooks/useGlobalSearch.ts`

**Purpose:** Cross-doctype search for command palette.

```typescript
const {
  results,
  isSearching,
  search,
  clear,
} = useGlobalSearch();

// Debounced search across Companies, Contacts, BOQs, Tasks
// Results formatted for command menu display
```

**Debounce:** 300ms

---

## Mutation Hooks

### useTaskActions

**File:** `src/hooks/useTaskActions.ts`

**Purpose:** CRUD operations for CRM Task.

```typescript
const {
  createTask,
  updateTask,
  deleteTask,
  isLoading,
} = useTaskActions();

await createTask({
  title: 'Follow up call',
  start_date: '2024-01-20',
  company: 'company-001',
  task_profile: 'Sales',
});

await updateTask('task-001', { status: 'Completed' });
await deleteTask('task-001');
```

---

### useTaskCreationHandler

**File:** `src/hooks/useTaskCreationHandler.ts`

**Purpose:** Handle task creation flow with dialog management.

```typescript
const { handleCreateTask } = useTaskCreationHandler();

// Opens appropriate dialog based on user role
// Admin: profile selection dialog first
// Sales/Estimations: direct to form with auto-assigned profile
```

---

## State Management Hooks

### useSearchParamsManager

**File:** `src/hooks/useSearchParamsManager.ts`

**Purpose:** Sync filter state with URL query params.

```typescript
const {
  filters,
  setFilter,
  removeFilter,
  clearFilters,
} = useSearchParamsManager();

setFilter('status', 'Completed');
// URL: ?status=Completed

setFilter('company', ['company-001', 'company-002']);
// URL: ?company=company-001&company=company-002
```

---

### useUrlState

**File:** `src/hooks/useUrlState.ts`

**Purpose:** Generic URL-based state with TypeScript generics.

```typescript
const [value, setValue] = useUrlState<string>('tab', 'overview');

// Reads from URL: ?tab=details
// Writes to URL when setValue called
```

---

### usePageHeader

**File:** `src/hooks/usePageHeader.ts`

**Purpose:** Manage page header state (title, breadcrumbs, actions).

```typescript
const { setPageHeader, clearPageHeader } = usePageHeader();

useEffect(() => {
  setPageHeader({
    title: 'Companies',
    breadcrumbs: [{ label: 'Home', path: '/' }, { label: 'Companies' }],
    actions: [{ label: 'Add', onClick: handleAdd }],
  });
  return () => clearPageHeader();
}, []);
```

---

## UI Utility Hooks

### useStatusStyles

**File:** `src/hooks/useStatusStyles.ts`

**Purpose:** Memoized status → color/icon mapping.

```typescript
const getStatusStyle = useStatusStyles();

const style = getStatusStyle('Completed');
// { color: 'green', bgColor: 'bg-green-100', icon: CheckIcon }

const boqStyle = getStatusStyle('Won', 'boq');
// { color: 'emerald', bgColor: 'bg-emerald-100', icon: TrophyIcon }
```

---

### useViewPort

**File:** `src/hooks/useViewPort.ts`

**Purpose:** Detect viewport size for responsive layout.

```typescript
const { isMobile, isDesktop, width } = useViewPort();

// isMobile: width < 768
// isDesktop: width >= 768
```

---

### useDebounce

**File:** `src/hooks/useDebounce.ts`

**Purpose:** Debounce rapidly changing values.

```typescript
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 300);

// debouncedSearch updates 300ms after last searchTerm change
```

---

### useToast

**File:** `src/hooks/use-toast.ts`

**Purpose:** Toast notification system (shadcn).

```typescript
const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Task created successfully',
});

toast({
  title: 'Error',
  description: 'Failed to create task',
  variant: 'destructive',
});
```

---

## Navigation Hooks

### useNavItems

**File:** `src/hooks/useNavItems.ts`

**Purpose:** Generate navigation items based on user role.

```typescript
const navItems = useNavItems();

// Returns filtered nav items based on role:
// [{ path: '/', label: 'Home', icon: HomeIcon }, ...]
```

---

### useFabOptions

**File:** `src/hooks/useFabOptions.ts`

**Purpose:** FAB (Floating Action Button) menu options by page context.

```typescript
const fabOptions = useFabOptions();

// On /companies page:
// [{ label: 'New Company', onClick: openNewCompanyDialog }]

// On /tasks page:
// [{ label: 'New Task', onClick: handleCreateTask }]
```

---

## Role & User Hooks

### useUserRoles

**File:** `src/hooks/useUserRoles.ts`

**Purpose:** Role checking utilities.

```typescript
const { isAdmin, isSales, isEstimations, role } = useUserRoles();

if (isAdmin) {
  // Admin-only logic
}
```

---

### useUserRoleLists

**File:** `src/hooks/useUserRoleLists.tsx`

**Purpose:** Fetch user lists filtered by role.

```typescript
const {
  salesUsers,
  estimationsUsers,
  allUsers,
  isLoading,
} = useUserRoleLists();

// For dropdowns: "Assign to Sales" → salesUsers
```

---

## Task Editor Hook

### useTaskEditor

**File:** `src/hooks/useTaskEditor.ts`

**Purpose:** Manage task editing state and mode.

```typescript
const {
  editingTask,
  editMode,
  setEditingTask,
  setEditMode,
  clearEditor,
} = useTaskEditor();

// editMode: 'edit' | 'updateStatus' | 'scheduleNext'
```

---

## Creating New Hooks

### Pattern: Data Fetching Hook

```typescript
// src/hooks/useNewData.ts
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';

interface UseNewDataOptions {
  filters?: Record<string, any>;
  enabled?: boolean;
}

export function useNewData(options: UseNewDataOptions = {}) {
  const { filters = {}, enabled = true } = options;

  const swrKey = useMemo(
    () => enabled ? `new-data-${JSON.stringify(filters)}` : null,
    [filters, enabled]
  );

  const { data, isLoading, error, mutate } = useFrappeGetDocList<DataType>(
    'DocType Name',
    {
      fields: ['name', 'field1', 'field2'],
      filters: Object.entries(filters).map(([k, v]) => [k, '=', v]),
      orderBy: { field: 'creation', order: 'desc' },
    },
    swrKey
  );

  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(item => ({
      ...item,
      computed: computeValue(item),
    }));
  }, [data]);

  return {
    data: processedData,
    isLoading,
    error,
    mutate,
  };
}
```

### Pattern: Action Hook

```typescript
// src/hooks/useNewActions.ts
import { useFrappeCreateDoc, useFrappeUpdateDoc } from 'frappe-react-sdk';
import { useToast } from './use-toast';

export function useNewActions() {
  const { toast } = useToast();
  const { createDoc, loading: createLoading } = useFrappeCreateDoc();
  const { updateDoc, loading: updateLoading } = useFrappeUpdateDoc();

  const create = async (values: CreateValues) => {
    try {
      const doc = await createDoc('DocType Name', values);
      toast({ title: 'Created', description: `Created ${doc.name}` });
      return doc;
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const update = async (name: string, values: Partial<UpdateValues>) => {
    try {
      await updateDoc('DocType Name', name, values);
      toast({ title: 'Updated', description: 'Changes saved' });
    } catch (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  return {
    create,
    update,
    isLoading: createLoading || updateLoading,
  };
}
```

---

## SWR Key Patterns

### Dynamic Cache Keys

```typescript
// Different filters = different cache entries
const swrKey = `tasks-${taskProfile}-${JSON.stringify(filters)}`;
```

### Conditional Fetching

```typescript
// null key = disabled fetch
const swrKey = enabled ? `data-${id}` : null;
```

### Cache Invalidation

```typescript
// Mutate specific cache
mutate(`tasks-Sales-${JSON.stringify(filters)}`);

// Mutate all task caches (pattern match)
mutate(key => typeof key === 'string' && key.startsWith('tasks-'));
```
