import frappe
from nirmaan_crm.nirmaan_crm.doctype.crm_boq.crm_boq import recompute_parent_project_status


def on_estimation_update(doc, method):
    """Triggered after CRM Project Estimation save.

    Cascades the change up to parent CRM BOQ.boq_status via recompute.
    Only BOQ-type estimations participate in the cascade; BCS rows are ignored.
    """
    if doc.document_type != "BOQ":
        return
    if not doc.parent_project:
        return
    try:
        recompute_parent_project_status(doc.parent_project)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "BOQ status cascade failed")
