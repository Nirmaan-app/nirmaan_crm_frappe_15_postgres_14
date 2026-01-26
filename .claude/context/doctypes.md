# DocTypes Reference

Detailed documentation for all 7 DocTypes in Nirmaan CRM.

## DocType Summary

| DocType | Module | Naming Rule | Auto Name |
|---------|--------|-------------|-----------|
| CRM Company | Nirmaan CRM | company_name | No |
| CRM Contacts | Nirmaan CRM | email | No |
| CRM BOQ | Nirmaan CRM | boq_name | No |
| CRM Task | Nirmaan CRM | - | Yes (hash) |
| CRM Users | Nirmaan CRM | - | Yes (hash) |
| CRM Note | Nirmaan CRM | - | Yes (hash) |
| CRM Company Type | Nirmaan CRM | - | Yes |

---

## CRM Company

**Purpose:** Lead/company records with sales assignment and priority tracking.

**File:** `nirmaan_crm/doctype/crm_company/crm_company.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| company_name | Data | Yes | Primary key, must be unique |
| company_nick | Data | No | Nickname/abbreviation (max 140 chars) |
| company_website | Data | No | Company website URL |
| company_type | Link | No | → CRM Company Type |
| company_city | Data | No | Location |
| assigned_sales | Link | No | → User (sales owner) |
| last_meeting | Date | No | Auto-updated on task completion |
| priority | Select | No | A, B, C |
| expected_boq_count | Int | No | Expected BOQs from this company |
| team_size | Select | No | Company size indicator |
| projects_per_month | Select | No | Activity level |

### Permissions

- Filtered by `assigned_sales` for sales users
- Admin sees all companies

---

## CRM Contacts

**Purpose:** Contact persons linked to companies.

**File:** `nirmaan_crm/doctype/crm_contacts/crm_contacts.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| first_name | Data | Yes | |
| last_name | Data | No | |
| gender | Select | No | Male, Female, Other |
| mobile | Data | No | Phone number |
| email | Data | Yes | Primary key, unique |
| company | Link | No | → CRM Company |
| designation | Data | No | Job title |
| department | Data | No | |
| visiting_card | Attach Image | No | Business card image |
| assigned_sales | Link | No | → User |
| last_meeting | Date | No | Auto-updated on task completion |
| linkedin_profile | Data | No | LinkedIn URL |

### Permissions

- Filtered by `assigned_sales` for sales users

---

## CRM BOQ

**Purpose:** Bill of Quantities representing quotes/opportunities in the deal pipeline.

**File:** `nirmaan_crm/doctype/crm_boq/crm_boq.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| boq_name | Data | Yes | Primary key, unique |
| boq_size | Select | No | Small, Medium, Large |
| boq_type | Select | No | Type classification |
| boq_value | Currency | No | Deal value |
| boq_submission_date | Date | No | When BOQ was submitted |
| boq_link | Data | No | URL to BOQ document |
| city | Data | No | Project location |
| remarks | Text | No | Notes |
| boq_status | Select | No | Pipeline stage |
| boq_sub_status | Select | No | Secondary status |
| assigned_sales | Link | No | → User (sales owner) |
| assigned_estimations | Link | No | → User (estimations owner) |
| deal_status | Select | No | Deal outcome |
| client_deal_status | Select | No | Client's deal status |
| bcs_status | Data | No | Default "Pending". Options: Pending, Review Pending, Completed |
| company | Link | No | → CRM Company |
| contact | Link | No | → CRM Contacts |

### BOQ Status Values

| Status | Description |
|--------|-------------|
| New | Fresh lead, no submission |
| BOQ Submitted | Full BOQ sent to client |
| Partial BOQ Submitted | Partial submission |
| Negotiation | Price negotiation phase |
| Revision Pending | Client requested changes |
| Revision Submitted | Revised BOQ sent |
| Hold | On hold |
| Won | Deal closed successfully |
| Lost | Deal lost |

### Permissions

- Sales users see BOQs where `assigned_sales` = user
- Estimations users see all BOQs

---

## CRM Task

**Purpose:** Activities/meetings with company/contact/BOQ associations.

**File:** `nirmaan_crm/doctype/crm_task/crm_task.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | Data | Yes | Task description |
| start_date | Date | Yes | Scheduled date |
| status | Select | No | Default: "Scheduled" |
| type | Select | No | Task type |
| company | Link | No | → CRM Company |
| contact | Link | No | → CRM Contacts |
| boq | Link | No | → CRM BOQ |
| task_profile | Select | No | Sales or Estimations |
| assigned_sales | Link | No | → User |
| remarks | Text | No | Additional notes |
| reason | Data | No | Cancellation/completion reason |
| time | Time | No | Scheduled time |

### Task Status Values

| Status | Description |
|--------|-------------|
| Scheduled | Planned future task |
| Pending | Started but not complete |
| Completed | Task finished |
| Cancelled | Task cancelled |

### Task Profiles

| Profile | Users | Form Fields |
|---------|-------|-------------|
| Sales | Sales users | Full task fields |
| Estimations | Estimations users | BOQ-focused fields |

### Events

On task completion (`status = "Completed"`):
- Updates `company.last_meeting` if company linked
- Updates `contact.last_meeting` if contact linked

---

## CRM Users

**Purpose:** CRM profile extending Frappe User with role info.

**File:** `nirmaan_crm/doctype/crm_users/crm_users.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| first_name | Data | No | From User doc |
| last_name | Data | No | From User doc |
| full_name | Data | No | Computed |
| has_company | Check | No | Has company permission |
| mobile_no | Data | No | |
| email | Data | No | Unique, from User |
| nirmaan_role_name | Data | No | Role profile name |
| fcm_token | Data | No | Firebase Cloud Messaging |

### Lifecycle

- **Created:** Automatically when User.after_insert triggers
- **Updated:** Synced when User updated
- **Deleted:** Cascade deletes User doc and User Permissions

---

## CRM Note

**Purpose:** Internal notes/comments attachable to any document.

**File:** `nirmaan_crm/doctype/crm_note/crm_note.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | Data | No | Note title |
| content | Text | No | Note body |
| reference_doctype | Link | No | → DocType (polymorphic) |
| reference_docname | Dynamic Link | No | Document name |

---

## CRM Company Type

**Purpose:** Classification fixture for company types.

**File:** `nirmaan_crm/doctype/crm_company_type/crm_company_type.json`

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| company_type_name | Data | No | Type label |

### Fixture Data

Loaded from `fixtures/crm_company_type.json` during app install.

---

## DocType Relationships

```
CRM Company ─────┬────── CRM Contacts (company)
                 ├────── CRM BOQ (company)
                 └────── CRM Task (company)

CRM Contacts ────┬────── CRM BOQ (contact)
                 └────── CRM Task (contact)

CRM BOQ ─────────────── CRM Task (boq)

CRM Users ───────────── User (via email)

CRM Note ────────────── Any DocType (reference_doctype/docname)
```
