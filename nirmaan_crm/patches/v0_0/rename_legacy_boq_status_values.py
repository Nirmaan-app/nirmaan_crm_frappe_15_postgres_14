import frappe


def execute():
    """Rename legacy CRM BOQ.boq_status values to current standard.

    'In Progress' (with space) -> 'In-Progress' (with hyphen) — resolves drift between
    backend JSON option label and frontend BOQmainStatusOptions.

    'On Hold' -> 'Hold' — consolidates duplicate lock-set value.
    """

    rename_map = [
        ("In Progress", "In-Progress"),
        ("On Hold", "Hold"),
    ]

    for old_value, new_value in rename_map:
        affected = frappe.db.count("CRM BOQ", {"boq_status": old_value})
        if not affected:
            print(f"[boq_status rename] no rows with '{old_value}' — skipping")
            continue

        frappe.db.sql(
            "UPDATE `tabCRM BOQ` SET boq_status = %s WHERE boq_status = %s",
            (new_value, old_value),
        )
        print(f"[boq_status rename] '{old_value}' -> '{new_value}': {affected} rows")

    frappe.db.commit()
