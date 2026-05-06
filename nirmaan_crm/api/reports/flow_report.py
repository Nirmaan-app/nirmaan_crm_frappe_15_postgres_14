import calendar

import frappe
from frappe.utils import get_datetime, getdate

from nirmaan_crm.api.reports._shared import (
    _fetch_status_transitions,
    _project_row,
    _resolve_role_profile,
    _status_at,
)

ACTIVE = {"New", "In-Progress", "Partially Submitted", "Submitted"}
NEG_HOLD = {"Negotiation", "Hold"}
WON = {"Won"}
LOST = {"Lost", "Dropped"}


def _bucket_for(status):
    """Map a normalized BOQ status to its flow bucket key.

    Returns one of 'active' | 'negotiationHold' | 'won' | 'lost', or None
    when the status is unknown (caller should skip — never crash).
    """
    if status in ACTIVE:
        return "active"
    if status in NEG_HOLD:
        return "negotiationHold"
    if status in WON:
        return "won"
    if status in LOST:
        return "lost"
    return None


def _format_window_label(window_months):
    if not window_months:
        return ""
    pairs = sorted({tuple(map(int, wm.split("-"))) for wm in window_months})
    if len(pairs) == 1:
        y, m = pairs[0]
        return f"{calendar.month_abbr[m]} {y}"

    earliest_y, earliest_m = pairs[0]
    latest_y, latest_m = pairs[-1]
    if earliest_y == latest_y:
        return f"{calendar.month_abbr[earliest_m]} – {calendar.month_abbr[latest_m]} {earliest_y}"

    return (
        f"{calendar.month_abbr[earliest_m]} {earliest_y} "
        f"– {calendar.month_abbr[latest_m]} {latest_y}"
    )


@frappe.whitelist()
def get_flow_report(window_months, assigned_sales=None):
    if isinstance(window_months, str):
        window_months = frappe.parse_json(window_months)
    if isinstance(assigned_sales, str):
        assigned_sales = frappe.parse_json(assigned_sales)
    if not window_months:
        frappe.throw("At least one window month is required")

    role_profile = _resolve_role_profile()
    is_admin = role_profile == "Nirmaan Admin User Profile"
    is_sales = role_profile == "Nirmaan Sales User Profile"
    if not (is_admin or is_sales):
        frappe.throw("Not permitted to view reports", frappe.PermissionError)
    if not is_admin:
        assigned_sales = [frappe.session.user]

    selected_set = set()
    for wm in window_months:
        y, m = map(int, wm.split("-"))
        selected_set.add((y, m))

    earliest_y, earliest_m = min(selected_set)
    latest_y, latest_m = max(selected_set)
    window_start = getdate(f"{earliest_y}-{earliest_m:02d}-01")
    latest_last_day = calendar.monthrange(latest_y, latest_m)[1]
    window_end_dt = get_datetime(
        f"{latest_y}-{latest_m:02d}-{latest_last_day} 23:59:59"
    )
    window_start_dt = get_datetime(f"{earliest_y}-{earliest_m:02d}-01 00:00:00")

    selected_months = sorted(f"{y}-{m:02d}" for y, m in selected_set)

    fields = [
        "name",
        "boq_name",
        "company",
        "company.company_name",
        "boq_status",
        "creation",
        "boq_value",
        "assigned_sales",
    ]

    # Query A — projects created in window
    created_filters = [
        ["creation", ">=", window_start],
        ["creation", "<=", window_end_dt],
    ]
    if assigned_sales:
        created_filters.append(["assigned_sales", "in", assigned_sales])

    created_rows = frappe.get_all(
        "CRM BOQ",
        filters=created_filters,
        fields=fields,
        order_by="creation asc",
        limit=0,
    )

    # Query B — projects with boq_status transitions in window
    version_rows = frappe.db.sql(
        """
        SELECT DISTINCT docname
        FROM `tabVersion`
        WHERE ref_doctype = 'CRM BOQ'
          AND data LIKE %(pattern)s
          AND creation >= %(window_start)s
          AND creation <= %(window_end)s
        """,
        {
            "pattern": "%boq_status%",
            "window_start": window_start_dt,
            "window_end": window_end_dt,
        },
        as_dict=True,
    )

    transitioned_names = [r["docname"] for r in version_rows]
    transitioned_rows = []
    if transitioned_names:
        transitioned_filters = [["name", "in", transitioned_names]]
        if assigned_sales:
            transitioned_filters.append(["assigned_sales", "in", assigned_sales])
        transitioned_rows = frappe.get_all(
            "CRM BOQ",
            filters=transitioned_filters,
            fields=fields,
            order_by="creation asc",
            limit=0,
        )

    # Union by name
    boq_by_name = {}
    for b in created_rows:
        boq_by_name[b["name"]] = b
    for b in transitioned_rows:
        boq_by_name.setdefault(b["name"], b)

    boq_rows = list(boq_by_name.values())

    if not boq_rows:
        return {
            "window_start": window_start.isoformat(),
            "window_end": window_end_dt.date().isoformat(),
            "window_label": _format_window_label(window_months),
            "selected_months": selected_months,
            "received": [],
            "moved": [],
            "buckets": {
                "active": [],
                "negotiationHold": [],
                "won": [],
                "lost": [],
            },
        }

    boq_names = list(boq_by_name.keys())
    transitions = _fetch_status_transitions(boq_names)

    received = []
    moved = []
    buckets = {
        "active": [],
        "negotiationHold": [],
        "won": [],
        "lost": [],
    }

    for boq in boq_rows:
        creation = boq.get("creation")
        creation_dt = get_datetime(creation) if creation else None
        is_received = (
            creation_dt is not None
            and window_start_dt <= creation_dt <= window_end_dt
        )

        events = transitions.get(boq["name"], [])
        has_transition_in_window = any(
            window_start_dt <= ts <= window_end_dt for ts, _old, _new in events
        )
        has_in_window_event = is_received or has_transition_in_window

        if is_received:
            received.append(boq)

        if has_in_window_event:
            moved.append(boq)
            status = _status_at(boq, events, window_end_dt)
            bucket_key = _bucket_for(status)
            if bucket_key is not None:
                buckets[bucket_key].append(boq)

    return {
        "window_start": window_start.isoformat(),
        "window_end": window_end_dt.date().isoformat(),
        "window_label": _format_window_label(window_months),
        "selected_months": selected_months,
        "received": [_project_row(b) for b in received],
        "moved": [_project_row(b) for b in moved],
        "buckets": {
            "active": [_project_row(b) for b in buckets["active"]],
            "negotiationHold": [_project_row(b) for b in buckets["negotiationHold"]],
            "won": [_project_row(b) for b in buckets["won"]],
            "lost": [_project_row(b) for b in buckets["lost"]],
        },
    }
