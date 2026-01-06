# nirmaan_crm/api/get_sales_tasks.py
# Backend API for Sales Tasks - Single endpoint replacing multiple frontend API calls
# Pattern: Similar to get_sales_performance.py - server-side data processing

import frappe
from frappe.utils import cstr


@frappe.whitelist(allow_guest=False)
def get_sales_tasks(task_profiles="all"):
    """
    Single endpoint that returns pre-processed sales tasks data.

    Replaces 3 frontend API calls with 1 backend call:
    1. CRM Task list
    2. CRM BOQ list (for active BOQ counts)
    3. CRM Users list (for salesperson names)

    Args:
        task_profiles: 'all', 'Sales', or 'Estimates'

    Returns:
        {
            "tasks": [...],           # Tasks with joined company/contact data
            "boq_data": {...},        # Pre-computed BOQ info grouped by company
            "filter_options": {...},  # Pre-computed filter dropdown options
            "salesperson_map": {...}  # Pre-resolved email -> full_name mapping
        }
    """
    try:
        # Determine task profile filter
        if task_profiles == "all":
            profile_filter = ["Sales", "Estimates"]
        elif task_profiles == "Sales":
            profile_filter = ["Sales"]
        else:
            profile_filter = ["Estimates"]

        # ─────────────────────────────────────────────────────────────────────
        # 1. Fetch Tasks with Joined Data (Single Query)
        # ─────────────────────────────────────────────────────────────────────
        tasks = frappe.get_list(
            "CRM Task",
            filters=[["task_profile", "in", profile_filter]],
            fields=[
                "name",
                "type",
                "start_date",
                "status",
                "contact",
                "company",
                "boq",
                "task_profile",
                "assigned_sales",
                "remarks",
                "creation",
                "modified",
                "owner",
                # Joined fields using dot notation
                "contact.first_name",
                "contact.last_name",
                "company.company_name",
            ],
            order_by="start_date desc",
            limit=0,  # Fetch all
        )

        # ─────────────────────────────────────────────────────────────────────
        # 2. Fetch Active BOQs and Group by Company (Pre-computed)
        # ─────────────────────────────────────────────────────────────────────
        INACTIVE_STATUSES = ["Won", "Lost", "Dropped"]

        active_boqs = frappe.get_list(
            "CRM BOQ",
            filters=[["boq_status", "not in", INACTIVE_STATUSES]],
            fields=["name", "company", "boq_status"],
            limit=0,
        )

        # Group BOQs by company - O(n) operation done once on server
        boq_data = {}
        for boq in active_boqs:
            company = boq.get("company")
            if company:
                if company not in boq_data:
                    boq_data[company] = []
                boq_data[company].append({
                    "name": boq.get("name"),
                    "boq_status": boq.get("boq_status"),
                })

        # ─────────────────────────────────────────────────────────────────────
        # 3. Fetch Salesperson Names (Pre-resolved)
        # ─────────────────────────────────────────────────────────────────────
        # Get unique assigned_sales emails from tasks
        unique_emails = set()
        for task in tasks:
            if task.get("assigned_sales"):
                unique_emails.add(task.get("assigned_sales"))

        salesperson_map = {}
        if unique_emails:
            users = frappe.get_list(
                "CRM Users",
                filters=[["email", "in", list(unique_emails)]],
                fields=["email", "full_name"],
            )
            for user in users:
                salesperson_map[user.get("email")] = user.get("full_name")

        # ─────────────────────────────────────────────────────────────────────
        # 4. Compute Filter Options (Single Pass)
        # ─────────────────────────────────────────────────────────────────────
        companies = {}  # id -> name
        statuses = set()
        types = set()
        profiles = set()

        for task in tasks:
            # Companies
            if task.get("company"):
                company_name = task.get("company.company_name") or task.get("company")
                companies[task.get("company")] = company_name

            # Statuses
            if task.get("status"):
                statuses.add(task.get("status"))

            # Types
            if task.get("type"):
                types.add(task.get("type"))

            # Profiles
            if task.get("task_profile"):
                profiles.add(task.get("task_profile"))

        filter_options = {
            "companies": [
                {"value": k, "label": v, "id": k}
                for k, v in sorted(companies.items(), key=lambda x: x[1])
            ],
            "statuses": [
                {"value": s, "label": s}
                for s in sorted(statuses)
            ],
            "types": [
                {"value": t, "label": t}
                for t in sorted(types)
            ],
            "profiles": [
                {"value": p, "label": p}
                for p in sorted(profiles)
            ],
            "salespersons": [
                {"value": email, "label": name, "id": email}
                for email, name in sorted(salesperson_map.items(), key=lambda x: x[1])
            ],
        }

        # ─────────────────────────────────────────────────────────────────────
        # 5. Return Pre-processed Data
        # ─────────────────────────────────────────────────────────────────────
        return {
            "tasks": tasks,
            "boq_data": boq_data,
            "filter_options": filter_options,
            "salesperson_map": salesperson_map,
        }

    except Exception as e:
        frappe.log_error(f"Error in get_sales_tasks: {str(e)}", "Sales Tasks API")
        frappe.throw(f"An error occurred while fetching sales tasks: {str(e)}")
