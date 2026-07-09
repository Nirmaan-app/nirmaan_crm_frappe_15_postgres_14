import frappe

from nirmaan_crm.integrations.controllers.unknown_contact import UNKNOWN_CONTACT


def execute():
    """
    Seed the single global 'Unknown' placeholder contact.

    Tasks for companies that have no real contact yet can be attached to this
    contact; a hook (reassign_unknown_tasks) swaps it for the real contact once
    one is created. Idempotent — safe to re-run.
    """
    if frappe.db.exists("CRM Contacts", UNKNOWN_CONTACT):
        return

    contact = frappe.get_doc(
        {
            "doctype": "CRM Contacts",
            "email": UNKNOWN_CONTACT,
            "first_name": "Unknown",
            "last_name": "",
        }
    )
    contact.insert(ignore_permissions=True)
    frappe.db.commit()

    print(f"Seeded global placeholder contact '{UNKNOWN_CONTACT}'.")
