# Frontend Context Index

Quick reference for loading context files based on your task.

## Frontend Context Files

| File | When to Read |
|------|--------------|
| [role-access.md](role-access.md) | Working with authorization, route guards, role-based UI |
| [hooks.md](hooks.md) | Understanding/creating custom hooks, data fetching patterns |

## Related Documentation

| File | When to Read |
|------|--------------|
| [../CLAUDE.md](../CLAUDE.md) | Frontend architecture, providers, state management |
| [../../.claude/context/apis.md](../../.claude/context/apis.md) | Backend API endpoints for frontend integration |
| [../../.claude/context/workflows.md](../../.claude/context/workflows.md) | Doc events, permissions, BOQ pipeline, task lifecycle |
| [../../.claude/context/integrations.md](../../.claude/context/integrations.md) | Frontend-backend communication, real-time, SWR cache |

## Changelog

| File | Purpose |
|------|---------|
| [../CHANGELOG.md](../.claude/CHANGELOG.md) | Frontend documentation audit trail |

## Role Profiles

| Profile | Route Access |
|---------|--------------|
| Nirmaan Admin User Profile | All routes including /team |
| Nirmaan Sales User Profile | /, /boqs, /contacts, /companies, /tasks, /calendar |
| Nirmaan Estimations User Profile | /, /boqs, /calendar, /tasks |

## Key Entry Points

| Task | Start Here |
|------|------------|
| Add new page | src/pages/ → routesConfig.tsx |
| Add authorization | role-access.md → AuthorizationGuard |
| Add data fetching hook | hooks.md → src/hooks/ |
| Add dialog | dialogStore.ts → MainDialogs.tsx |
| Add form | constants/boqZodValidation.ts (pattern) |
| Add UI component | src/components/ui/ |

## State Management

| Store | Purpose | File |
|-------|---------|------|
| dialogStore | Modal/dialog state | src/store/dialogStore.ts |
| localStorage | User role, theme | via useCurrentUser hook |

## Provider Stack (main.tsx → App.tsx)

```
FrappeProvider          → API, auth, socket
  AuthProvider          → Login/logout
    RealTimeProvider    → WebSocket
      ApplicationProvider → Dialog state
        ThemeProvider    → Light/dark
          RouterProvider → Routes
```
