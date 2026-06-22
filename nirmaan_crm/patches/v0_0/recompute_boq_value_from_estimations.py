import frappe
from nirmaan_crm.nirmaan_crm.doctype.crm_boq.crm_boq import recompute_parent_project_value


def execute():
    """Backfill CRM BOQ.boq_value from child BOQ estimation values.

    Existing projects never had their parent boq_value rolled up from the package
    rows, so multi-package / new-flow projects sit at a stale value (often "0").
    This recomputes boq_value = sum(child BOQ estimation values) for every project.

    Uses recompute_parent_project_value, which:
      - writes with update_modified=False (the "Updated" timestamp is preserved), and
      - skips legacy projects that have no BOQ estimation rows (their manually
        entered value is left untouched, never wiped to 0).
    """

    candidates = frappe.get_all("CRM BOQ", order_by="creation asc", pluck="name")

    print(f"[boq_value backfill] processing {len(candidates)} projects")

    processed = 0
    for project_name in candidates:
        # Backfill must NOT rewrite historical "Updated" timestamps in bulk.
        recompute_parent_project_value(project_name, update_modified=False)
        processed += 1
        if processed % 100 == 0:
            frappe.db.commit()
            print(f"[boq_value backfill] committed batch — {processed}/{len(candidates)}")

    frappe.db.commit()
    print(f"[boq_value backfill] done — {processed} projects evaluated")
