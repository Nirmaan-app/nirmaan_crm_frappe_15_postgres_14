import calendar
import json

import frappe
from frappe.utils import get_datetime, getdate, nowdate

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


def _build_month_specs(year, month):
    today = getdate(nowdate())
    today_year, today_month = today.year, today.month
    specs = []
    y, m = year, month
    while (y, m) <= (today_year, today_month):
        last_day = calendar.monthrange(y, m)[1]
        end_dt = get_datetime(f"{y}-{m:02d}-{last_day} 23:59:59")
        specs.append({
            "year": y,
            "month": m,
            "end": end_dt,
            "key": f"{y}-{m:02d}",
            "label": end_dt.strftime("%b %Y"),
            "is_cohort_month": (y, m) == (year, month),
        })
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return specs


def _empty_response(cohort_month, month_specs, salesperson):
    cohort_label = month_specs[0]["label"] if month_specs else ""
    return {
        "cohort_month": cohort_month,
        "cohort_label": cohort_label,
        "cohort_size": 0,
        "salesperson": salesperson,
        "statuses": CANONICAL_STATUSES,
        "months": [
            {
                "key": s["key"],
                "label": s["label"],
                "end_date": s["end"].date().isoformat(),
                "is_cohort_month": s["is_cohort_month"],
            }
            for s in month_specs
        ],
        "projects": [],
        "matrix": {s["key"]: {} for s in month_specs},
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


@frappe.whitelist()
def get_sales_cohort_report(cohort_month, assigned_sales=None):
    role_profile = _resolve_role_profile()
    is_admin = role_profile == "Nirmaan Admin User Profile"
    is_sales = role_profile == "Nirmaan Sales User Profile"
    if not (is_admin or is_sales):
        frappe.throw("Not permitted to view reports", frappe.PermissionError)
    if not is_admin:
        assigned_sales = frappe.session.user

    year, month = map(int, cohort_month.split("-"))
    cohort_start = getdate(f"{year}-{month:02d}-01")
    last_day = calendar.monthrange(year, month)[1]
    cohort_end = get_datetime(f"{year}-{month:02d}-{last_day} 23:59:59")

    month_specs = _build_month_specs(year, month)

    boq_filters = [
        ["creation", ">=", cohort_start],
        ["creation", "<=", cohort_end],
    ]
    if assigned_sales:
        boq_filters.append(["assigned_sales", "=", assigned_sales])

    boq_rows = frappe.get_all(
        "CRM BOQ",
        filters=boq_filters,
        fields=[
            "name",
            "boq_name",
            "company",
            "company.company_name",
            "boq_status",
            "creation",
            "boq_value",
            "assigned_sales",
        ],
        order_by="creation asc",
        limit=0,
    )

    if not boq_rows:
        return _empty_response(cohort_month, month_specs, assigned_sales)

    boq_names = [b["name"] for b in boq_rows]
    transitions = _fetch_status_transitions(boq_names)

    matrix = {}
    for spec in month_specs:
        bucket = {s: [] for s in CANONICAL_STATUSES}
        for boq in boq_rows:
            status = _status_at(boq, transitions.get(boq["name"], []), spec["end"])
            if status not in bucket:
                bucket[status] = []
            bucket[status].append(boq["name"])
        matrix[spec["key"]] = {k: v for k, v in bucket.items() if v}

    return {
        "cohort_month": cohort_month,
        "cohort_label": month_specs[0]["label"] if month_specs else "",
        "cohort_size": len(boq_rows),
        "salesperson": assigned_sales,
        "statuses": CANONICAL_STATUSES,
        "months": [
            {
                "key": s["key"],
                "label": s["label"],
                "end_date": s["end"].date().isoformat(),
                "is_cohort_month": s["is_cohort_month"],
            }
            for s in month_specs
        ],
        "projects": [_project_row(b) for b in boq_rows],
        "matrix": matrix,
    }
