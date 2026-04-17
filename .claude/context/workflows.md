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
| CRM BOQ | on_update | (inline) | Auto-creates/deletes Project Estimations per package; routes leads via CRM BOQ Package.assigned_lead |
| CRM BOQ | on_trash | (inline) | Cascade-deletes all CRM Project Estimation rows |

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

## CRM BOQ Package Management (on_update)

Triggered by `CRM BOQ` save (inline in `crm_boq.py`).

### Package Parsing

`boq_type` field stores a JSON array of package names. The parser (`_get_selected_packages`) handles:
- JSON array: `["Electrical", "HVAC Ducting"]`
- Comma-separated legacy: `"Electrical, HVAC"`
- Single string: `"Electrical"`

### On Every Save

1. **Parse packages** from `boq_type` field
2. **Remove orphan estimations** — delete `CRM Project Estimation` rows whose `package_name` is no longer in the current selection (also deletes associated tasks)
3. **Create BOQ estimations** — for each package, create a `CRM Project Estimation` with `document_type="BOQ"` if one doesn't already exist
4. **Create BCS estimations** — if `create_bcs=1`, create a `CRM Project Estimation` with `document_type="BCS"` per package
5. **Auto-route leads** — looks up `CRM BOQ Package.assigned_lead` for each package and sets `assigned_to` on the new estimation

### BCS Creation Lock

Once `create_bcs` is set to 1 (or any BCS estimation already exists), the toggle is permanently locked to 1. This prevents accidental deletion of BCS estimations and their associated work.

### Cascade Delete (on_trash)

When a CRM BOQ is deleted, all `CRM Project Estimation` rows where `parent_project = self.name` are cascade-deleted.

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
| New | Fresh project, just created |
| In Progress | Active estimation work |
| Revision Pending | Client requested changes |
| Revision Submitted | Updated estimation sent |
| Negotiation | Price/terms being discussed |
| On Hold | Paused by client or internal |
| Won | Deal closed successfully |
| Lost | Deal lost to competitor |
| Dropped | Project dropped |
| Hold | Legacy hold status |

**Note:** 'BOQ Submitted' and 'Partial BOQ Submitted' now exist only at the `CRM Project Estimation` level, not at the project level.

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
    "CRM Company Type",
    "CRM BOQ Package"
]
```

These are installed on `bench --site <site> migrate` and export with `bench --site <site> export-fixtures`.

---

## Migration: Legacy BOQ → Project Estimations

**File:** `patches/v0_0/migrate_legacy_boq_projects_to_estimations.py`

Transforms legacy CRM BOQ records (free-text `boq_type`, single status) into the new package-granular estimation model.

### Rules

1. **No package** → creates "Legacy" BOQ + BCS estimations
2. **Single package** → that package's BOQ + BCS (preserves original value)
3. **Multiple packages** → "Legacy" BOQ/BCS (carries value) + one BOQ/BCS per extra package (value blank)

### Status Normalization

- Project-level outcome statuses (Won/Lost/Dropped/Hold/Negotiation) are preserved at the project level
- Detail-level statuses (BOQ Submitted, Partial BOQ Submitted, etc.) mapped to "In-Progress" at project level
- BCS estimations start at "Pending"
- IN PROGRESS/IN-PROGRESS → In-Progress; ON HOLD/HOLD → Hold

### Package Name Normalization

Recognizes common variations: HVAC VRF-DX, HVAC DUCTING, FIRE FIGHTING, ELECTRICAL, ELV, BMS, FAPA, MEP via regex tokenization.
