import frappe

def get_latest_error():
    errors = frappe.db.get_list("Error Log", fields=["name", "error", "method"], limit=5, order_by="creation desc")
    for e in errors:
        print(f"--- LOG {e.name} ---")
        print(e.error)

get_latest_error()
