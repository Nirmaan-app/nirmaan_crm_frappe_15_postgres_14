# API Endpoints Reference

All whitelisted API endpoints in Nirmaan CRM.

## API Summary

| Endpoint | File | Purpose |
|----------|------|---------|
| `create_crm_user` | api/add_crm_user.py | Create new CRM user |
| `global_search` | api/global_search.py | Cross-doctype search |
| `get_sales_tasks` | api/get_sales_tasks.py | Aggregated task data |
| `get_modified_crm_companies` | api/get_modified_crm_company.py | Enriched company list |
| `get_sales_performance` | api/users/get_sales_performance.py | Sales metrics |

---

## create_crm_user

**File:** `nirmaan_crm/api/add_crm_user.py:10`

**Purpose:** Create a new User with CRM role profile.

### Signature

```python
@frappe.whitelist()
def create_crm_user(email, first_name, last_name, role_profile_name, mobile_no):
    ...
```

### Parameters

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| email | str | Yes | User email (unique) |
| first_name | str | Yes | |
| last_name | str | Yes | |
| role_profile_name | str | Yes | "Nirmaan Sales User Profile", etc. |
| mobile_no | str | No | Phone number |

### Authorization

- Requires "Nirmaan Admin User" role
- Throws `PermissionError` if unauthorized

### Response

```json
{
  "message": "success",
  "user": "user@example.com"
}
```

### Side Effects

1. Creates User doc with role profile
2. Sends password reset email to new user
3. CRM Users doc auto-created via doc_events

---

## global_search

**File:** `nirmaan_crm/api/global_search.py:15`

**Purpose:** Cross-doctype search for command palette.

### Signature

```python
@frappe.whitelist()
def global_search(search_term, user_role):
    ...
```

### Parameters

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| search_term | str | Yes | Search query (min 2 chars) |
| user_role | str | Yes | User's role profile name |

### Search Scope

| DocType | Fields Searched |
|---------|-----------------|
| CRM Company | company_name, company_city |
| CRM Contacts | first_name, last_name, email |
| CRM BOQ | boq_name, city |
| CRM Task | title |

### Role-Based Filtering

- **Sales users:** Results filtered by `assigned_sales = current_user`
- **Estimations users:** See all BOQs, own tasks
- **Admin users:** See all results

### Response

```json
{
  "results": [
    {
      "doctype": "CRM Company",
      "name": "company-001",
      "label": "Acme Corp",
      "description": "Mumbai",
      "value": "company-001"
    }
  ]
}
```

---

## get_sales_tasks

**File:** `nirmaan_crm/api/get_sales_tasks.py:8`

**Purpose:** Aggregated task + BOQ + user data in single call.

### Signature

```python
@frappe.whitelist()
def get_sales_tasks(task_profiles="all"):
    ...
```

### Parameters

| Param | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| task_profiles | str | No | "all" | "Sales", "Estimations", or "all" |

### Response

```json
{
  "tasks": [...],
  "boq_data": {
    "company-001": [
      {"boq_name": "BOQ-001", "boq_status": "New", ...}
    ]
  },
  "filter_options": {
    "types": ["Call", "Meeting", "Email"],
    "statuses": ["Scheduled", "Pending", "Completed"],
    "companies": [{"value": "company-001", "label": "Acme Corp"}]
  },
  "salesperson_map": {
    "user@example.com": "John Doe"
  }
}
```

### Optimization

Replaces 3 separate frontend API calls:
1. Fetch tasks
2. Fetch BOQs grouped by company
3. Fetch filter options

---

## get_modified_crm_companies

**File:** `nirmaan_crm/api/get_modified_crm_company.py:10`

**Purpose:** Company list with enriched metrics for cards/lists.

### Signature

```python
@frappe.whitelist()
def get_modified_crm_companies():
    ...
```

### Response

```json
{
  "companies": [
    {
      "name": "company-001",
      "company_name": "Acme Corp",
      "assigned_sales": "user@example.com",
      "priority": "A",
      "last_meeting": "2024-01-15",
      "next_meeting": "2024-01-20",
      "active_boq_count": 3,
      "task_stats": {
        "overdue": 1,
        "completed": 5,
        "pending": 2
      }
    }
  ]
}
```

### Enrichment Logic

| Field | Calculation |
|-------|-------------|
| last_meeting | Most recent completed task (past 7 days) |
| next_meeting | Next scheduled task (next 14 days) |
| active_boq_count | BOQs not in Won/Lost status |
| task_stats.overdue | Tasks with start_date < today, status = Scheduled |
| task_stats.completed | Tasks with status = Completed |
| task_stats.pending | Tasks with status = Pending |

---

## get_sales_performance

**File:** `nirmaan_crm/api/users/get_sales_performance.py`

**Purpose:** Sales metrics for team performance dashboard.

### Response

```json
{
  "users": [
    {
      "user": "user@example.com",
      "full_name": "John Doe",
      "tasks_completed": 15,
      "boqs_won": 3,
      "boqs_lost": 1,
      "total_value": 150000
    }
  ]
}
```

---

## API Patterns

### Authorization Check

```python
@frappe.whitelist()
def protected_method():
    if "Nirmaan Admin User" not in frappe.get_roles():
        frappe.throw(_("Not permitted"), frappe.PermissionError)
```

### Role-Based Query Filter

```python
def get_filtered_results(user):
    filters = {}
    if not is_admin(user):
        filters["assigned_sales"] = user
    return frappe.get_all("CRM Task", filters=filters)
```

### Server-Side Aggregation

```python
# Combine multiple queries to reduce frontend calls
def get_aggregated_data():
    tasks = frappe.get_all("CRM Task", ...)
    boqs = frappe.get_all("CRM BOQ", ...)

    # Group BOQs by company on server
    boq_by_company = {}
    for boq in boqs:
        company = boq.company
        if company not in boq_by_company:
            boq_by_company[company] = []
        boq_by_company[company].append(boq)

    return {
        "tasks": tasks,
        "boq_data": boq_by_company
    }
```

---

## Frontend Integration

### Using frappe-react-sdk

```typescript
import { useFrappePostCall } from 'frappe-react-sdk';

const { call } = useFrappePostCall('nirmaan_crm.api.global_search.global_search');

const results = await call({
  search_term: 'acme',
  user_role: 'Nirmaan Sales User Profile'
});
```

### Direct Call

```typescript
const response = await fetch('/api/method/nirmaan_crm.api.get_sales_tasks.get_sales_tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ task_profiles: 'Sales' })
});
```
