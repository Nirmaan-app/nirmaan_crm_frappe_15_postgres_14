import calendar

import frappe
from frappe.utils import get_datetime, getdate, nowdate

from nirmaan_crm.api.reports._shared import (
    CANONICAL_STATUSES,
    LEGACY_MAP,
    LOCK_STATUSES,
    _fetch_status_transitions,
    _normalize,
    _project_row,
    _resolve_role_profile,
    _serialize_dt,
    _status_at,
)


def _build_month_specs(cohort_months):
    selected_set = set()
    for cm in cohort_months:
        y, m = map(int, cm.split("-"))
        selected_set.add((y, m))

    today = getdate(nowdate())
    today_year, today_month = today.year, today.month

    start_y, start_m = min(selected_set)
    specs = []
    y, m = start_y, start_m
    while (y, m) <= (today_year, today_month):
        last_day = calendar.monthrange(y, m)[1]
        end_dt = get_datetime(f"{y}-{m:02d}-{last_day} 23:59:59")
        specs.append({
            "year": y,
            "month": m,
            "end": end_dt,
            "key": f"{y}-{m:02d}",
            "label": end_dt.strftime("%b %Y"),
            "is_cohort_month": (y, m) in selected_set,
        })
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return specs


def _format_cohort_label(cohort_months):
    if not cohort_months:
        return ""
    pairs = sorted({tuple(map(int, cm.split("-"))) for cm in cohort_months})
    if len(pairs) == 1:
        y, m = pairs[0]
        return f"{calendar.month_abbr[m]} {y}"

    years = {y for y, _ in pairs}
    if len(years) == 1:
        y = next(iter(years))
        months_str = ", ".join(calendar.month_abbr[m] for _, m in pairs)
        return f"{months_str} {y}"

    return ", ".join(f"{calendar.month_abbr[m]} {y}" for y, m in pairs)


def _empty_response(cohort_months, month_specs, salespersons):
    return {
        "cohort_months": cohort_months,
        "cohort_label": _format_cohort_label(cohort_months),
        "cohort_size": 0,
        "salespersons": salespersons or [],
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


@frappe.whitelist()
def get_sales_cohort_report(cohort_months, assigned_sales=None):
    if isinstance(cohort_months, str):
        cohort_months = frappe.parse_json(cohort_months)
    if isinstance(assigned_sales, str):
        assigned_sales = frappe.parse_json(assigned_sales)
    if not cohort_months:
        frappe.throw("At least one cohort month is required")

    role_profile = _resolve_role_profile()
    is_admin = role_profile == "Nirmaan Admin User Profile"
    is_sales = role_profile == "Nirmaan Sales User Profile"
    if not (is_admin or is_sales):
        frappe.throw("Not permitted to view reports", frappe.PermissionError)
    if not is_admin:
        assigned_sales = [frappe.session.user]

    selected_set = set()
    for cm in cohort_months:
        y, m = map(int, cm.split("-"))
        selected_set.add((y, m))

    earliest_y, earliest_m = min(selected_set)
    latest_y, latest_m = max(selected_set)
    broadest_start = getdate(f"{earliest_y}-{earliest_m:02d}-01")
    latest_last_day = calendar.monthrange(latest_y, latest_m)[1]
    broadest_end = get_datetime(
        f"{latest_y}-{latest_m:02d}-{latest_last_day} 23:59:59"
    )

    month_specs = _build_month_specs(cohort_months)

    boq_filters = [
        ["creation", ">=", broadest_start],
        ["creation", "<=", broadest_end],
    ]
    if assigned_sales:
        boq_filters.append(["assigned_sales", "in", assigned_sales])

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

    boq_rows = [
        b for b in boq_rows
        if (getdate(b["creation"]).year, getdate(b["creation"]).month) in selected_set
    ]

    if not boq_rows:
        return _empty_response(cohort_months, month_specs, assigned_sales)

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
        "cohort_months": cohort_months,
        "cohort_label": _format_cohort_label(cohort_months),
        "cohort_size": len(boq_rows),
        "salespersons": assigned_sales or [],
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
