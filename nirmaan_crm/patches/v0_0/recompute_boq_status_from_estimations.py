import frappe
from nirmaan_crm.nirmaan_crm.doctype.crm_boq.crm_boq import (
    recompute_parent_project_status,
    LOCK_STATUSES,
)


def execute():
    """Recompute CRM BOQ.boq_status for non-locked projects from child estimations.

    Cleans up legacy 'Revision Pending' / 'Revision Submitted' project values by
    re-deriving from current child CRM Project Estimation states. Locked projects
    (Won/Lost/Dropped/Hold/Negotiation) are skipped since they reflect manual
    deal outcomes.
    """

    candidates = frappe.get_all(
        "CRM BOQ",
        filters={"boq_status": ["not in", list(LOCK_STATUSES)]},
        pluck="name",
    )

    print(f"[boq_status recompute] processing {len(candidates)} non-locked projects")

    processed = 0
    for project_name in candidates:
        recompute_parent_project_status(project_name)
        processed += 1
        if processed % 100 == 0:
            frappe.db.commit()
            print(f"[boq_status recompute] committed batch — {processed}/{len(candidates)}")

    frappe.db.commit()
    print(f"[boq_status recompute] done — {processed} projects evaluated")
