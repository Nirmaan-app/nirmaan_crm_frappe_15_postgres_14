import frappe
from frappe.model.document import Document

def on_meeting_update(doc, method):
    """
    This function is triggered by the 'on_update' hook for the CRM Task doctype.
    If a task's status is changed to 'Completed', it updates the 'last_meeting'
    date on the linked Contact and Company documents.
    """
    doc_before_save = doc.get_doc_before_save()
    if not doc_before_save:
        return

    if doc.status == "Completed" and doc_before_save.status != "Completed":
        
        # --- USE f-string print FOR DEBUGGING ---
        print(f"--- Task Completed Hook ---")
        print(f"Task '{doc.name}' status changed to Completed. Attempting to update last_meeting.")
        if doc.company:
            try:
                company = frappe.get_doc("CRM Company", doc.company)
                company.last_meeting = doc.start_date
                company.save(ignore_permissions=True)
                
                print(f"Successfully updated last_meeting for Company '{company.name}'.")

            except Exception:
                # For production, it's better to log the full error
                print(f"ERROR: Failed to update Company '{doc.company}' for Task '{doc.name}'.")
                frappe.log_error(frappe.get_traceback(), "Task Completed Hook Error")

        if doc.contact:
            try:
                contact = frappe.get_doc("CRM Contacts", doc.contact)
                contact.last_meeting = doc.start_date
                contact.save(ignore_permissions=True)
                
                print(f"Successfully updated last_meeting for Contact '{contact.name}'.")

            except Exception:
                print(f"ERROR: Failed to update Contact '{doc.contact}' for Task '{doc.name}'.")
                frappe.log_error(frappe.get_traceback(), "Task Completed Hook Error")