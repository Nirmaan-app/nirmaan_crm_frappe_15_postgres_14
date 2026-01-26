# Business Logic Workflows

Server-side event-driven workflows and business rules.

---

## Document Lifecycle Events

Complete `doc_events` mapping from `hooks.py`:

| DocType | Event | Handler | Effect |
|---------|-------|---------|--------|
| User | after_insert | `crm_users.create_user_profile` | Auto-creates CRM Users doc |
| User | on_update | `crm_users.on_user_update` | Syncs name/mobile/role to CRM Users |
| CRM Users | on_trash | `controllers.crm_users.on_trash` | Deletes User Permissions + User doc |
| User Permission | after_insert | `controllers.user_permission.after_insert` | Sets `has_company = "true"` on CRM Users |
| CRM Task | on_update | `controllers.last_meeting_on.on_meeting_update` | Updates Company/Contact `last_meeting` |

**Commented-out hooks** (present in code but disabled):
- `CRM Company` / `CRM Contacts` permission query conditions
- `User Permission.on_trash` → mirror to CRM User Permissions
- `CRM Users.on_trash` → `delete_doc_versions.generate_versions`

---

## CRM Users Lifecycle

Two creation paths exist:

### Path 1: Hook-based (automatic)
```
User.after_insert → create_user_profile()
  → Creates CRM Users doc with first_name, last_name, email, mobile_no, role_profile_name
  → Fallback: if fields fail, creates minimal doc (first_name, full_name, email only)
```

### Path 2: API-based (manual)
```
api/add_crm_user.create_crm_user(email, first_name, last_name, role_profile_name, mobile_no)
  → Requires "Nirmaan Admin User" role
  → Creates User doc + assigns Role Profile
  → Sends welcome email with password reset link
  → User.after_insert hook then auto-creates CRM Users doc
```

### Update sync
```
User.on_update → on_user_update()
  → Calls create_user_profile() first (idempotent — checks exists)
  → If first_name, last_name, full_name, mobile_no, or role_profile_name changed:
    → Updates corresponding CRM Users fields
```

### Deletion cascade
```
CRM Users.on_trash → controllers.crm_users.on_trash()
  → Deletes all User Permissions for that email
  → Deletes the Frappe User doc
  → Note: User.on_trash does NOT call CRM Users deletion (avoids infinite loop)
```

---

## Last Meeting Auto-Update

Triggered by `CRM Task.on_update` hook.

**Conditions** (all must be true):
1. Task `type` == `"In Person Meeting"`
2. Task `status` changed to `"Completed"` (was not Completed before save)
3. `doc_before_save` exists (not a new insert)

**Actions:**
- If task has `company`: sets `CRM Company.last_meeting = task.start_date`
- If task has `contact`: sets `CRM Contacts.last_meeting = task.start_date`
- Both save with `ignore_permissions=True`
- Errors logged via `frappe.log_error`, do not block the save

---

## Permission Query Conditions

Active conditions in `hooks.py`:

| DocType | Function | Behavior |
|---------|----------|----------|
| CRM Task | `get_task_permission_query_conditions` | Administrator → no filter; Sales/Estimations → `assigned_sales = user`; Admin role profile → no filter |
| CRM BOQ | `get_boq_permission_query_conditions` | System Manager → no filter; all others → `assigned_sales = user` |

**Commented-out** (defined in permissions.py but not wired in hooks.py):
- `CRM Company` → would filter by `assigned_sales`
- `CRM Contacts` → would filter by `assigned_sales`

**Implementation note:** Task permissions check `CRM Users.nirmaan_role_name` to determine role, not `frappe.get_roles()`. BOQ permissions use `frappe.get_roles()` to check for System Manager.

---

## BOQ Pipeline States

### Status values (`boq_status`)

| Status | Business Meaning |
|--------|-----------------|
| New | Fresh BOQ, just created |
| BOQ Submitted | Full BOQ sent to client |
| Partial BOQ Submitted | Incomplete BOQ sent |
| Revision Pending | Client requested changes |
| Revision Submitted | Updated BOQ sent |
| Negotiation | Price/terms being discussed |
| Hold | Paused by client or internal |
| Won | Deal closed successfully |
| Lost | Deal lost to competitor or cancelled |

### Deal status lifecycle

- `deal_status` tracks internal pipeline stage
- `client_deal_status` tracks client-side perception
- When `boq_status` reaches Won/Lost, `deal_status` typically moves to Cold (patch: `update_deal_status_for_closed_boqs`)

---

## Task Status Flow

```
Scheduled → Pending → Completed
                   → Cancelled
```

- No Frappe Workflow Engine — status transitions are purely frontend-driven
- `task_profile` field: `'Sales' | 'Estimations'` — determines form fields shown
- Admin users see profile selection dialog on creation
- Status change to Completed can trigger last_meeting update (see above)

---

## Fixtures

Exported via `hooks.py`:

```python
fixtures = [
    {"dt": "Role", "filters": [["role_name", "like", "Nirmaan %"]]},
    {"dt": "Role Profile", "filters": [["role_profile", "like", "Nirmaan %"]]},
    "Portal Menu Item",
    "CRM Company Type"
]
```

These are installed on `bench --site <site> migrate` and export with `bench --site <site> export-fixtures`.
