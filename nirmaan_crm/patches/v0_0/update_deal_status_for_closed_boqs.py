import frappe

def execute():
    # Update deal_status to "Cold" for BOQs with status "Won" or "Lost"
    frappe.db.set_value(
        "CRM BOQ",
        {"boq_status": ["in", ["Won", "Lost"]]},
        "deal_status",
        "Cold",
        update_modified=False
    )
