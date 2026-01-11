# Context Index

Quick reference for loading context files based on your task.

## Backend Context Files

| File | When to Read |
|------|--------------|
| [doctypes.md](doctypes.md) | Working with DocType fields, relationships, or creating new doctypes |
| [apis.md](apis.md) | Adding/modifying API endpoints, understanding backend data flow |
| [patterns.md](patterns.md) | Following code conventions, naming standards, error handling |

## Related Documentation

| File | When to Read |
|------|--------------|
| [../BACKEND_ARCHITECTURE.md](../BACKEND_ARCHITECTURE.md) | Comprehensive backend reference (hooks, permissions, migrations) |
| [../../crm/CLAUDE.md](../../crm/CLAUDE.md) | Frontend architecture, React patterns, component structure |

## Role Profiles

| Profile | Access Level |
|---------|--------------|
| Nirmaan Admin User Profile | Full access to all DocTypes and routes |
| Nirmaan Sales User Profile | Own tasks, BOQs, companies, contacts |
| Nirmaan Estimations User Profile | All BOQs, own estimation tasks |

## Key Entry Points

| Task | Start Here |
|------|------------|
| Add new DocType | doctypes.md → hooks.py |
| Add new API | apis.md → nirmaan_crm/api/ |
| Modify permissions | BACKEND_ARCHITECTURE.md → permissions.py |
| Add frontend page | crm/CLAUDE.md → src/pages/ |
| Add frontend hook | crm/.claude/context/hooks.md |
