import frappe
from nirmaan_crm.nirmaan_crm.doctype.crm_boq.crm_boq import (
    recompute_parent_project_status,
    recompute_parent_project_value,
)


def on_estimation_update(doc, method):
    """Triggered after CRM Project Estimation save.

    Cascades the change up to parent CRM BOQ — both boq_status (derived state) and
    boq_value (sum of package values). Only BOQ-type estimations participate; BCS
    rows do not affect either.
    """
    if doc.document_type != "BOQ":
        return
    if not doc.parent_project:
        return
    try:
        recompute_parent_project_status(doc.parent_project)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "BOQ status cascade failed")
    try:
        recompute_parent_project_value(doc.parent_project)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "BOQ value rollup failed")
