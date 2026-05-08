import json

import frappe

LOCK_STATUSES = {"Won", "Lost", "Dropped", "Hold", "Negotiation"}

CANONICAL_STATUSES = [
    "New",
    "In-Progress",
    "Partially Submitted",
    "Submitted",
    "Negotiation",
    "Won",
    "Hold",
    "Dropped",
    "Lost",
]

LEGACY_MAP = {
    "BOQ Submitted": "Submitted",
    "Partial BOQ Submitted": "Partially Submitted",
    "Revision Pending": "In-Progress",
    "Revision Submitted": "Submitted",
    "On Hold": "Hold",
    "In Progress": "In-Progress",
    "": "New",
}


def _normalize(status):
    if not status:
        return "New"
    return LEGACY_MAP.get(status, status)


def _serialize_dt(value):
    if value is None:
        return None
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _project_row(boq):
    return {
        "name": boq.get("name"),
        "boq_name": boq.get("boq_name"),
        "company": boq.get("company"),
        "company_name": boq.get("company_name"),
        "boq_status": _normalize(boq.get("boq_status")),
        "creation": _serialize_dt(boq.get("creation")),
        "boq_value": boq.get("boq_value"),
        "assigned_sales": boq.get("assigned_sales"),
    }


def _fetch_status_transitions(boq_names):
    if not boq_names:
        return {}
    raw = frappe.db.sql(
        """
        SELECT docname, creation, data
        FROM `tabVersion`
        WHERE ref_doctype = 'CRM BOQ'
          AND docname IN %(names)s
          AND data LIKE %(pattern)s
        ORDER BY docname ASC, creation ASC
        """,
        {"names": tuple(boq_names), "pattern": "%boq_status%"},
        as_dict=True,
    )

    transitions = {n: [] for n in boq_names}
    for row in raw:
        try:
            payload = json.loads(row["data"] or "{}")
        except (ValueError, TypeError):
            continue
        for change in payload.get("changed", []) or []:
            if change and len(change) >= 3 and change[0] == "boq_status":
                transitions[row["docname"]].append((
                    row["creation"],
                    _normalize(change[1]),
                    _normalize(change[2]),
                ))
    return transitions


def _status_at(boq, events, month_end_dt):
    creation = boq.get("creation")
    if creation and month_end_dt < creation:
        return "New"
    if not events:
        return _normalize(boq.get("boq_status"))
    initial = events[0][1]
    status = initial
    for ts, _old, new in events:
        if ts <= month_end_dt:
            status = new
        else:
            break
    return status


def _resolve_role_profile():
    user = frappe.session.user
    if user == "Administrator":
        return "Nirmaan Admin User Profile"
    return frappe.db.get_value("CRM Users", user, "nirmaan_role_name")
