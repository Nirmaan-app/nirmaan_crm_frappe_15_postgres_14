import frappe

def create_doctype():
    frappe.flags.in_patch = True
    if not frappe.db.exists("DocType", "CRM Project Estimation"):
        doc = frappe.get_doc({
            "doctype": "DocType",
            "module": "Nirmaan CRM",
            "name": "CRM Project Estimation",
            "custom": 0,
            "engine": "InnoDB",
            "naming_rule": "By fieldname",
            "autoname": "field:title",
            "fields": [
                {"fieldname": "title", "fieldtype": "Data", "label": "Title", "reqd": 1, "unique": 1},
                {"fieldname": "parent_project", "fieldtype": "Link", "label": "Project", "options": "CRM BOQ", "reqd": 1, "in_list_view": 1},
                {"fieldname": "document_type", "fieldtype": "Select", "label": "Type", "options": "BOQ\nBCS", "reqd": 1, "in_list_view": 1},
                {"fieldname": "package_name", "fieldtype": "Data", "label": "Package", "reqd": 1, "in_list_view": 1},
                {"fieldname": "value", "fieldtype": "Currency", "label": "Value", "in_list_view": 1},
                {"fieldname": "link", "fieldtype": "Data", "label": "Link"},
                {"fieldname": "status", "fieldtype": "Data", "label": "Status", "default": "New", "in_list_view": 1},
                {"fieldname": "sub_status", "fieldtype": "Data", "label": "Sub-Status", "in_list_view": 1},
                {"fieldname": "assigned_to", "fieldtype": "Link", "label": "Assigned To", "options": "CRM Users", "in_list_view": 1},
                {"fieldname": "deadline", "fieldtype": "Date", "label": "Deadline", "in_list_view": 1},
                {"fieldname": "remarks", "fieldtype": "Text", "label": "Remarks"}
            ],
            "permissions": [
                {"role": "System Manager", "read": 1, "write": 1, "create": 1, "delete": 1},
                {"role": "Nirmaan Admin User", "read": 1, "write": 1, "create": 1, "delete": 1},
                {"role": "Nirmaan Estimations User", "read": 1, "write": 1, "create": 1, "delete": 1},
                {"role": "Nirmaan Sales User", "read": 1, "write": 1, "create": 1, "delete": 1}
            ]
        })
        doc.insert()
        print("Created CRM Project Estimation Doctype")
    else:
        print("CRM Project Estimation Doctype already exists")
    
    frappe.db.commit()

