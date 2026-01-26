import frappe


def execute():
    frappe.db.sql("""
        UPDATE `tabCRM BOQ`
        SET bcs_status = 'Pending'
        WHERE bcs_status IS NULL OR bcs_status = ''
    """)
