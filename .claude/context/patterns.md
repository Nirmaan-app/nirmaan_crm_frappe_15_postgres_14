# Code Patterns

Conventions and patterns used in Nirmaan CRM.

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| DocType | Title Case with CRM prefix | CRM Company, CRM Task |
| DocType file | snake_case | crm_company.json |
| API file | snake_case | get_sales_tasks.py |
| API function | snake_case | get_sales_tasks() |
| Controller file | snake_case | crm_users.py |
| Hook function | snake_case | after_insert() |

## File Organization

### Backend Structure

```
nirmaan_crm/
├── nirmaan_crm/
│   ├── doctype/           # DocType definitions
│   │   └── crm_*/         # One folder per DocType
│   │       ├── *.json     # Schema
│   │       └── *.py       # Controller (optional)
│   └── permissions.py     # Permission queries
├── api/                   # Whitelisted endpoints
│   ├── *.py              # Main APIs
│   └── users/            # User-specific APIs
├── integrations/
│   └── controllers/      # Doc event handlers
├── patches/
│   └── v0_0/             # Version-grouped patches
├── fixtures/             # Default data (JSON)
└── hooks.py              # App configuration
```

### Frontend Structure

```
crm/src/
├── pages/                # Route components
│   └── PageName/
│       ├── PageName.tsx  # List view
│       ├── Detail.tsx    # Detail view
│       ├── forms/        # Create/Edit forms
│       └── components/   # Page-specific components
├── components/
│   ├── ui/               # shadcn/radix components
│   ├── common/           # Shared components
│   ├── dialogs/          # Modal dialogs
│   └── table/            # Data table components
├── hooks/                # Custom React hooks
├── store/                # Zustand stores
├── types/                # TypeScript interfaces
├── constants/            # Static data, validation
└── utils/                # Helper functions
```

## Backend Patterns

### DocType Controller

```python
# crm_task/crm_task.py
import frappe
from frappe.model.document import Document

class CRMTask(Document):
    def validate(self):
        """Called before save"""
        self.validate_dates()

    def before_save(self):
        """Pre-save hook"""
        pass

    def after_insert(self):
        """Post-create hook"""
        pass

    def on_update(self):
        """Post-save hook"""
        self.update_related_docs()
```

### Whitelisted API

```python
# api/method_name.py
import frappe
from frappe import _

@frappe.whitelist()
def method_name(required_param, optional_param=None):
    """
    Brief description.

    Args:
        required_param: Description
        optional_param: Description (default: None)

    Returns:
        dict: Response with keys...
    """
    # Authorization check
    if "Required Role" not in frappe.get_roles():
        frappe.throw(_("Not permitted"), frappe.PermissionError)

    # Business logic
    result = do_something(required_param)

    return {"message": "success", "data": result}
```

### Permission Query Condition

```python
# permissions.py
def get_doctype_permission_query_conditions(user):
    """Filter DocType records by user permissions."""
    if "System Manager" in frappe.get_roles(user):
        return ""  # No filter for admin

    # Sales users see own records
    return f"`tabDocType`.assigned_sales = '{user}'"
```

### Doc Event Handler

```python
# integrations/controllers/handler.py
import frappe

def on_update(doc, method):
    """Handle document update event."""
    if doc.status == "Completed":
        update_related_records(doc)

def after_insert(doc, method):
    """Handle document creation event."""
    create_related_doc(doc)
```

### Database Patch

```python
# patches/v0_0/patch_name.py
import frappe

def execute():
    """
    Patch description.
    Run: bench --site <site> migrate
    """
    # Add new field
    frappe.reload_doc("nirmaan_crm", "doctype", "crm_task")

    # Update existing records
    frappe.db.sql("""
        UPDATE `tabCRM Task`
        SET new_field = 'default_value'
        WHERE new_field IS NULL
    """)

    frappe.db.commit()
```

## Frontend Patterns

### Page Component

```typescript
// pages/PageName/PageName.tsx
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { PageHeader } from '@/components/common/PageHeader';

export function PageName() {
  const { data, isLoading, error, mutate } = useFrappeGetDocList<DocType>(
    'DocType Name',
    {
      fields: ['name', 'field1', 'field2'],
      filters: [],
      orderBy: { field: 'creation', order: 'desc' },
      limit: 0,
    },
    'cache-key'
  );

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div>
      <PageHeader title="Page Title" />
      <DataList items={data} onMutate={mutate} />
    </div>
  );
}
```

### Custom Hook

```typescript
// hooks/useCustomHook.ts
import { useFrappeGetDocList } from 'frappe-react-sdk';
import { useMemo } from 'react';

export function useCustomHook(filters: FilterType) {
  const swrKey = useMemo(
    () => `custom-data-${JSON.stringify(filters)}`,
    [filters]
  );

  const { data, isLoading, error, mutate } = useFrappeGetDocList<DataType>(
    'DocType Name',
    { fields: [...], filters: buildFilters(filters) },
    swrKey
  );

  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(transform);
  }, [data]);

  return { data: processedData, isLoading, error, mutate };
}
```

### Form with Zod Validation

```typescript
// pages/PageName/forms/NewForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  field1: z.string().min(1, 'Required'),
  field2: z.string().optional(),
}).superRefine((data, ctx) => {
  // Conditional validation
  if (data.field1 === 'special' && !data.field2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Field2 required when field1 is special',
      path: ['field2'],
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export function NewForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { field1: '', field2: '' },
  });

  const onSubmit = async (values: FormValues) => {
    await createDoc('DocType', values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

### Dialog Store Usage

```typescript
// Using dialogStore
import { useDialogStore } from '@/store/dialogStore';

function Component() {
  const { openNewTaskDialog, closeNewTaskDialog } = useDialogStore();

  const handleCreate = () => {
    openNewTaskDialog({
      companyId: 'company-001',
      contactId: 'contact-001',
      task_profile: 'Sales',
    });
  };

  return <Button onClick={handleCreate}>New Task</Button>;
}
```

## Error Handling

### Backend

```python
# Validation error
frappe.throw(_("Invalid input: {0}").format(reason))

# Permission error
frappe.throw(_("Not permitted"), frappe.PermissionError)

# Not found
frappe.throw(_("Document not found"), frappe.DoesNotExistError)
```

### Frontend

```typescript
// API error handling
try {
  await createDoc('DocType', values);
  toast({ title: 'Success', description: 'Created successfully' });
} catch (error) {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive'
  });
}
```

## Testing Patterns

### Backend (Frappe)

```python
# tests/test_api.py
import frappe
import unittest

class TestAPI(unittest.TestCase):
    def setUp(self):
        frappe.set_user("Administrator")

    def test_create_user(self):
        result = create_crm_user(
            email="test@test.com",
            first_name="Test",
            last_name="User",
            role_profile_name="Nirmaan Sales User Profile",
            mobile_no="1234567890"
        )
        self.assertEqual(result["message"], "success")
```
