# Backend Architecture

Comprehensive reference for Nirmaan CRM backend (Frappe Python).

## Statistics

| Resource | Count |
|----------|-------|
| DocTypes | 7 |
| API Endpoints | 8+ |
| Permission Queries | 4 |
| Integration Controllers | 4 |
| Database Patches | 4 |

---

## DocTypes

### Core Business Entities

| DocType | Purpose | Naming | Key Links |
|---------|---------|--------|-----------|
| CRM Company | Lead/company records | company_name | - |
| CRM Contacts | Contact persons | email | company |
| CRM BOQ | Bill of Quantities (quotes) | boq_name | company, contact |
| CRM Task | Activities/meetings | autoname | company, contact, boq |
| CRM Users | CRM profile for Frappe User | autoname | - |
| CRM Note | Internal notes/comments | autoname | reference_doctype (dynamic) |
| CRM Company Type | Classification fixture | - | - |

### Field Details

#### CRM Company
```
company_name       Data (required, unique)
company_website    Data
company_type       Link → CRM Company Type
company_city       Data
assigned_sales     Link → User
last_meeting       Date
priority           Select (A/B/C)
expected_boq_count Int
team_size          Select
projects_per_month Select
```

#### CRM Contacts
```
first_name         Data (required)
last_name          Data
gender             Select
mobile             Data
email              Data (unique, required)
company            Link → CRM Company
designation        Data
department         Data
visiting_card      Attach Image
assigned_sales     Link → User
last_meeting       Date
linkedin_profile   Data
```

#### CRM BOQ
```
boq_name              Data (required, unique)
boq_size              Select
boq_type              Select
boq_value             Currency
boq_submission_date   Date
boq_link              Data (URL)
city                  Data
remarks               Text
boq_status            Select (New|Won|Lost|Hold|Revision Pending|Negotiation|Revision Submitted|BOQ Submitted|Partial BOQ Submitted)
boq_sub_status        Select
assigned_sales        Link → User
assigned_estimations  Link → User
deal_status           Select
client_deal_status    Select
company               Link → CRM Company
contact               Link → CRM Contacts
```

#### CRM Task
```
title               Data (required)
start_date          Date (required)
status              Select (Scheduled|Pending|Completed|Cancelled)
type                Select
company             Link → CRM Company
contact             Link → CRM Contacts
boq                 Link → CRM BOQ
task_profile        Select (Sales|Estimations)
assigned_sales      Link → User
remarks             Text
reason              Data
time                Time
```

#### CRM Users
```
first_name          Data
last_name           Data
full_name           Data (computed)
has_company         Check
mobile_no           Data
email               Data (unique)
nirmaan_role_name   Data
fcm_token           Data
```

---

## API Endpoints

### Main APIs

| File | Method | Purpose |
|------|--------|---------|
| `api/add_crm_user.py` | `create_crm_user` | Create User + assign Role Profile |
| `api/global_search.py` | `global_search` | Cross-doctype search with role filtering |
| `api/get_sales_tasks.py` | `get_sales_tasks` | Aggregated tasks + BOQs + users |
| `api/get_modified_crm_company.py` | `get_modified_crm_companies` | Companies with enriched metrics |

### User APIs (api/users/)

| File | Method | Purpose |
|------|--------|---------|
| `get_sales_performance.py` | `get_sales_performance` | Sales metrics per user |
| `get__exception_data.py` | `get_exception_data` | Exception data fetching |
| `last_meeting_on.py` | - | Meeting tracking utilities |
| `user_permission.py` | - | Permission query utilities |

### API Details

#### create_crm_user
```python
@frappe.whitelist()
def create_crm_user(email, first_name, last_name, role_profile_name, mobile_no):
    # Requires "Nirmaan Admin User" role
    # Creates User doc + assigns Role Profile
    # Sends welcome email with password reset link
```

#### global_search
```python
@frappe.whitelist()
def global_search(search_term, user_role):
    # Cross-doctype search: Companies, Contacts, BOQs, Tasks
    # Sales users see results filtered by assigned_sales
    # Returns formatted results for command menu
```

#### get_sales_tasks
```python
@frappe.whitelist()
def get_sales_tasks(task_profiles="all"):
    # Returns: tasks, boq_data (grouped), filter_options, salesperson_map
    # Replaces 3 frontend calls with 1 aggregated call
```

#### get_modified_crm_companies
```python
@frappe.whitelist()
def get_modified_crm_companies():
    # Companies with enriched data:
    # - Last completed meeting (past 7 days)
    # - Next scheduled meeting (next 14 days)
    # - Active BOQ counts
    # - Task metrics (overdue, completed, pending)
```

---

## Hooks Configuration

File: `nirmaan_crm/hooks.py`

### Doc Events

| DocType | Event | Handler |
|---------|-------|---------|
| User | after_insert | `integrations.controllers.crm_users.create_crm_user` |
| User | on_update | `integrations.controllers.crm_users.update_user` |
| CRM Users | on_trash | `integrations.controllers.crm_users.on_trash` |
| User Permission | after_insert | `integrations.controllers.user_permission.after_insert` |
| CRM Task | on_update | `integrations.controllers.last_meeting_on.on_update` |

### Permission Query Conditions

| DocType | Function | Logic |
|---------|----------|-------|
| CRM Task | `get_task_permission_query_conditions` | Filter by assigned_sales |
| CRM BOQ | `get_boq_permission_query_conditions` | Sales see own, Estimations see all |
| CRM Company | `get_company_permission_query_conditions` | Filter by assigned_sales |
| CRM Contacts | `get_contact_permission_query_conditions` | Filter by assigned_sales |

### Fixtures

```python
fixtures = [
    {"dt": "Role", "filters": [["name", "like", "Nirmaan %"]]},
    {"dt": "Role Profile", "filters": [["name", "like", "Nirmaan %"]]},
    {"dt": "Portal Menu Item"},
    {"dt": "CRM Company Type"},
]
```

### Website Routes

```python
website_route_rules = [
    {"from_route": "/crm/<path:app_path>", "to_route": "crm"},
]
```

---

## Permissions

File: `nirmaan_crm/nirmaan_crm/permissions.py`

### Permission Query Functions

```python
def get_task_permission_query_conditions(user):
    """Sales users see tasks where assigned_sales = user"""
    if is_system_manager(user):
        return ""  # Admin sees all
    return f"`tabCRM Task`.assigned_sales = '{user}'"

def get_boq_permission_query_conditions(user):
    """Sales see own BOQs, Estimations see all"""
    if is_system_manager(user):
        return ""
    if has_estimations_role(user):
        return ""  # Estimations see all
    return f"`tabCRM BOQ`.assigned_sales = '{user}'"
```

---

## Integration Controllers

File: `nirmaan_crm/integrations/controllers/`

| File | Purpose |
|------|---------|
| `crm_users.py` | CRM Users lifecycle (create/update/delete with User sync) |
| `user_permission.py` | Update has_company flag on permission changes |
| `last_meeting_on.py` | Update Company/Contact last_meeting on task completion |
| `delete_doc_versions.py` | Document version cleanup |

### CRM Users Lifecycle

```python
# On User.after_insert → auto-create CRM Users profile
# On CRM Users.on_trash → delete User doc + permissions
```

### Last Meeting Update

```python
# On CRM Task.on_update (status = "Completed")
# → Update company.last_meeting = task.start_date
# → Update contact.last_meeting = task.start_date
```

---

## Database Migrations

File: `nirmaan_crm/patches.txt`

| Patch | Purpose |
|-------|---------|
| `v0_0.task_profile_patch` | Add task_profile field to CRM Task |
| `v0_0.user_crmuser_name_fix` | Sync User/CRM Users naming |
| `v0_0.update_last_meeting_for_contacts_and_companies` | Backfill last_meeting dates |
| `v0_0.update_deal_status_for_closed_boqs` | Update deal_status for Won/Lost BOQs |

---

## Role Profiles

| Role Profile | Roles Included | Access Level |
|--------------|----------------|--------------|
| Nirmaan Admin User Profile | System Manager, Nirmaan Admin | Full access |
| Nirmaan Sales User Profile | Nirmaan Sales User | Own tasks/BOQs/companies |
| Nirmaan Estimations User Profile | Nirmaan Estimations User | All BOQs, own tasks |

---

## Key Patterns

### API Authorization

```python
@frappe.whitelist()
def protected_method():
    # Check role before operation
    if "Nirmaan Admin User" not in frappe.get_roles():
        frappe.throw("Not permitted", frappe.PermissionError)
```

### Server-Side Aggregation

```python
# Combine multiple queries into single API call
# Pre-compute filters and groupings on server
# Return structured response for frontend consumption
```

### Permission-Based Filtering

```python
# Use permission_query_conditions in hooks.py
# DocType queries automatically filtered by user role
# Admin users bypass all filters
```
