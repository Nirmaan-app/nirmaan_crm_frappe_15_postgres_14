# Frontend-Backend Integration

How the React frontend communicates with the Frappe backend.

---

## REST API (frappe-react-sdk)

The frontend uses `frappe-react-sdk` which wraps Frappe's REST API with SWR-based React hooks.

### Hook → API mapping

| React Hook | Frappe API | Use Case |
|------------|-----------|----------|
| `useFrappeGetDocList` | `GET /api/resource/{doctype}` | List views with filters, pagination |
| `useFrappeGetDoc` | `GET /api/resource/{doctype}/{name}` | Detail views |
| `useFrappeCreateDoc` | `POST /api/resource/{doctype}` | Create forms |
| `useFrappeUpdateDoc` | `PUT /api/resource/{doctype}/{name}` | Edit forms |
| `useFrappeDeleteDoc` | `DELETE /api/resource/{doctype}/{name}` | Delete actions |
| `useFrappePostCall` | `POST /api/method/{dotted.path}` | Custom whitelisted methods |
| `useFrappeGetCall` | `GET /api/method/{dotted.path}` | Custom whitelisted methods (GET) |
| `useFrappeFileUpload` | `POST /api/method/upload_file` | File/image attachments |

### Custom API call format

```typescript
// Frontend calls custom Python methods via:
useFrappePostCall('nirmaan_crm.nirmaan_crm.api.global_search.global_search', {
  search_term: query,
  user_role: role
});
// Maps to: nirmaan_crm/nirmaan_crm/api/global_search.py → global_search()
```

### Authentication

`FrappeProvider` in `main.tsx` handles cookie-based auth. The Vite dev server proxies `/api` requests to Frappe on port 8000.

---

## Real-Time Updates

### RealTimeProvider (`src/auth/RealTimeProvider.tsx`)

Listens for server-side document events via WebSocket (Frappe's `socket.io` integration).

**Monitored DocTypes:**
```typescript
const DOCTYPES_TO_LISTEN = [
  'CRM Task', 'CRM Company', 'CRM Contacts', 'CRM BOQ', 'CRM Note'
];
```

**Event handling:**
1. `useFrappeDocTypeEventListener` registers a WebSocket listener per DocType
2. On any doc event (create/update/delete), the handler invalidates SWR cache:
   - **Broad invalidation**: `mutate(key => Array.isArray(key) && key[0] === doctype)` — revalidates all list queries for that DocType
   - **Specific invalidation**: `mutate(\`${doctype}/${docname}\`)` — revalidates the specific doc detail cache
3. Listeners are only enabled when `currentUser` exists and is not `'Guest'`

**Effect:** Any user's changes are reflected in other users' views without manual refresh.

---

## localStorage Role Caching

After login, user identity is cached in localStorage for fast client-side access:

| Key | Value | Set By |
|-----|-------|--------|
| `userRole` | Role profile name (e.g., `"Nirmaan Sales User Profile"`) | `useCurrentUser` hook |
| `userEmail` | User email | `useCurrentUser` hook |
| `userName` | User full name | `useCurrentUser` hook |

### Trade-off

- **Pro**: `AuthorizationGuard` checks route access from localStorage — no API call per navigation
- **Con**: Role changes on the server require logout/login (or page reload) to take effect
- The `useCurrentUser` hook fetches the CRM Users doc on mount and writes to localStorage

### Usage pattern

```typescript
// AuthorizationGuard reads role synchronously
const role = localStorage.getItem('userRole');
const allowed = routesConfig[path]?.roles?.includes(role);
```

---

## SWR Cache Pattern

### Dynamic key format

SWR keys are arrays constructed from DocType name + filter parameters:

```typescript
// frappe-react-sdk internally constructs keys like:
// ['CRM Task', filters, fields, orderBy, limit, ...]
```

Custom hooks add filter state to keys for cache isolation:

```typescript
const swrKey = `all-tasks-CIS${JSON.stringify(assignmentFilters)}`;
// Different filter combinations get independent cache entries
```

### Conditional fetching

Pass `null` as the SWR key to skip fetching:

```typescript
useFrappeGetDocList('CRM BOQ', options, shouldFetch ? swrKey : null);
```

### Global cache invalidation

The RealTimeProvider uses SWR's function matcher to invalidate all keys for a DocType:

```typescript
mutate(
  (key) => Array.isArray(key) && key[0] === event.doctype,
  undefined,
  { revalidate: true }
);
```

This ensures list views, detail views, and filtered views all refresh when any document changes.
