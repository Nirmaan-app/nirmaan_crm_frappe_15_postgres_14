# your_custom_app/your_custom_app/api/sales_reports.py
import frappe
from frappe.utils import nowdate, getdate, add_days

@frappe.whitelist(allow_guest=False)
def get_sales_performance_metrics():
    """
    Fetches sales performance metrics for sales users with 'Nirmaan Sales User Profile' role.
    Includes flattened lists of 'In Person Meeting' tasks and 'BOQ' documents
    for "this week", "last week", and "last 30 days".
    Each task/BOQ item will have 'date_from' and 'date_to' fields indicating its period.
    Filters tasks and BOQs by 'assigned_sales' email and task 'type'.
    """
    try:
        print("--- Starting get_sales_performance_metrics ---")

        # Get all active sales users with 'Nirmaan Sales User Profile'
        # IMPORTANT: If 'CRM Users' is a custom DocType, ensure it has 'email' and 'nirmaan_role_name'.
        # If your sales users are standard 'User' doctype, change "CRM Users" to "User".
        sales_users = frappe.get_list(
            "CRM Users", # Use "User" if your sales users are standard Frappe Users
            filters={"nirmaan_role_name": "Nirmaan Sales User Profile"},
            fields=["name", "full_name", "email"]
        )

        if not sales_users:
            print("No sales users with 'Nirmaan Sales User Profile' found.")
            # Return an empty list wrapped in "message" for consistent frontend handling
            return {"message": []} 

        performance_data = []

        # Define date ranges and format them for direct assignment to items
        today = getdate(nowdate())
        
        # This Week (Monday to Sunday)
        this_week_start = add_days(today, -today.weekday()) # This will be the Monday of the current week
        this_week_end = add_days(this_week_start, 6)        # This will be the Sunday of the current week
        this_week_date_from_str = this_week_start.strftime('%d-%m-%Y')
        this_week_date_to_str = this_week_end.strftime('%d-%m-%Y')

        # Last Week (Monday to Sunday)
        last_week_end = add_days(this_week_start, -1) # This will be the Sunday of the previous week
        last_week_start = add_days(last_week_end, -6) # This will be the Monday of the previous week
        last_week_date_from_str = last_week_start.strftime('%d-%m-%Y')
        last_week_date_to_str = last_week_end.strftime('%d-%m-%Y')

        # Last 30 Days (including today)
        last_30_days_start = add_days(today, -29) # 29 days before today, to include today
        last_30_days_end = today
        last_30_days_date_from_str = last_30_days_start.strftime('%d-%m-%Y')
        last_30_days_date_to_str = last_30_days_end.strftime('%d-%m-%Y')

        print(f"Today: {today}")
        print(f"This Week: {this_week_start} to {this_week_end}")
        print(f"Last Week: {last_week_start} to {last_week_end}")
        print(f"Last 30 Days: {last_30_days_start} to {last_30_days_end}")

        # Helper function to add date_from/date_to to each item dictionary
        def add_date_range_to_items(items, date_from, date_to):
            modified_items = []
            for item in items:
                modified_item = item.copy() # Create a copy to avoid modifying original Frappe objects
                modified_item["date_from"] = date_from
                modified_item["date_to"] = date_to
                modified_items.append(modified_item)
            return modified_items

        for user in sales_users:
            user_name = user.name
            user_full_name = user.full_name
            user_email = user.email
            print(f"\nProcessing sales user: {user_full_name} ({user_name}), Email: {user_email}")

            user_metrics = {
                "user_name": user_name,
                "full_name": user_full_name,
                "email": user_email,
                "IPM_this_week": [],
                "IPM_last_week": [],
                "IPM_last_30_days": [],
                "BOQR_this_week": [],
                "BOQR_last_week": [],
                "BOQR_last_30_days": [],
            }

            # --- Fields to fetch for CRM Task ---
            # These fields are crucial for your frontend taskNameFormatter and dialog display.
            # 'company.company_name' and 'contact.first_name', 'contact.last_name' use dot notation for linked fields.
            common_task_fields = [
                "name", "task_profile", "status", "type", "start_date",
                "company", "company.company_name",  # Fetch the linked company name
                "contact", "contact.first_name", "contact.last_name", # Fetch linked contact names
                "boq", "remarks" # Fetch BOQ link and remarks
            ]

            # IPM: This Week
            this_week_meetings = frappe.get_list(
                "CRM Task",
                filters=[
                    ["status", "=", "Completed"],
                    ["start_date", ">=", this_week_start],
                    ["start_date", "<=", this_week_end],
                    ["type", "=", "In Person Meeting"],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_task_fields,
            )
            user_metrics["IPM_this_week"] = add_date_range_to_items(this_week_meetings, this_week_date_from_str, this_week_date_to_str)
            print(f"  This Week In Person Meetings: {len(this_week_meetings)} documents")

            # IPM: Last Week
            last_week_meetings = frappe.get_list(
                "CRM Task",
                filters=[
                    ["status", "=", "Completed"],
                    ["start_date", ">=", last_week_start],
                    ["start_date", "<=", last_week_end],
                    ["type", "=", "In Person Meeting"],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_task_fields,
            )
            user_metrics["IPM_last_week"] = add_date_range_to_items(last_week_meetings, last_week_date_from_str, last_week_date_to_str)
            print(f"  Last Week In Person Meetings: {len(last_week_meetings)} documents")

            # IPM: Last 30 Days
            last_30_days_meetings = frappe.get_list(
                "CRM Task",
                filters=[
                    ["status", "=", "Completed"],
                    ["start_date", ">=", last_30_days_start],
                    ["start_date", "<=", last_30_days_end],
                    ["type", "=", "In Person Meeting"],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_task_fields,
            )
            user_metrics["IPM_last_30_days"] = add_date_range_to_items(last_30_days_meetings, last_30_days_date_from_str, last_30_days_date_to_str)
            print(f"  Last 30 Days In Person Meetings: {len(last_30_days_meetings)} documents")

            # --- Fields to fetch for CRM BOQ ---
            # 'boq_name' is added for display in the frontend boqNameFormatter.
            common_boq_fields = [
                "name", "boq_name", "creation", "company", "boq_status"
            ]

            # BOQR: This Week
            this_week_boqs = frappe.get_list(
                "CRM BOQ",
                filters=[
                    ["creation", ">=", this_week_start],
                    ["creation", "<=", this_week_end],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_boq_fields,
            )
            user_metrics["BOQR_this_week"] = add_date_range_to_items(this_week_boqs, this_week_date_from_str, this_week_date_to_str)
            print(f"  This Week BOQ Received: {len(this_week_boqs)} documents")

            # BOQR: Last Week
            last_week_boqs = frappe.get_list(
                "CRM BOQ",
                filters=[
                    ["creation", ">=", last_week_start],
                    ["creation", "<=", last_week_end],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_boq_fields,
            )
            user_metrics["BOQR_last_week"] = add_date_range_to_items(last_week_boqs, last_week_date_from_str, last_week_date_to_str)
            print(f"  Last Week BOQ Received: {len(last_week_boqs)} documents")

            # BOQR: Last 30 Days
            last_30_days_boqs = frappe.get_list(
                "CRM BOQ",
                filters=[
                    ["creation", ">=", last_30_days_start],
                    ["creation", "<=", last_30_days_end],
                    ["assigned_sales", "=", user_email]
                ],
                fields=common_boq_fields,
            )
            user_metrics["BOQR_last_30_days"] = add_date_range_to_items(last_30_days_boqs, last_30_days_date_from_str, last_30_days_date_to_str)
            print(f"  Last 30 Days BOQ Received: {len(last_30_days_boqs)} documents")

            performance_data.append(user_metrics)

        print("--- Finished processing all sales users ---")
        # Wrap the final performance_data list in a dictionary with the "message" key
        return  performance_data
    
    except Exception as e:
        print(f"An error occurred in get_sales_performance_metrics: {e}")
        # Frappe's frappe.throw function will send the error message to the client
        frappe.throw(f"An unexpected error occurred: {e}")

# import frappe
# from frappe.utils import nowdate, getdate, add_days

# @frappe.whitelist(allow_guest=False)
# def get_sales_performance_metrics():
#     """
#     Fetches sales performance metrics for sales users with 'Nirmaan Sales User Profile' role.
#     Includes flattened lists of 'In Person Meeting' tasks and 'BOQ' documents
#     for "this week", "last week", and "last 30 days".
#     Filters tasks and BOQs by 'assigned_sales' email and task 'type'.
#     """
#     try:
#         print("--- Starting get_sales_performance_metrics ---")

#         # Get all active sales users with 'Nirmaan Sales User Profile'
#         sales_users = frappe.get_list(
#             "CRM Users",
#             filters={"nirmaan_role_name": "Nirmaan Sales User Profile"},
#             fields=["name", "full_name", "email"]
#         )

#         if not sales_users:
#             print("No sales users with 'Nirmaan Sales User Profile' found.")
#             return {"message": "No sales users with 'Nirmaan Sales User Profile' found."}

#         performance_data = []

#         # Define date ranges
#         today = getdate(nowdate())
        
#       # This Week (Monday to Sunday)
#         this_week_start = add_days(today, -today.weekday())
#         this_week_end = add_days(this_week_start, 6)
#         this_week_date_from_str = this_week_start.strftime('%d-%m-%Y')
#         this_week_date_to_str = this_week_end.strftime('%d-%m-%Y')

#         # Last Week (Monday to Sunday)
#         last_week_end = add_days(this_week_start, -1)
#         last_week_start = add_days(last_week_end, -6)
#         last_week_date_from_str = last_week_start.strftime('%d-%m-%Y')
#         last_week_date_to_str = last_week_end.strftime('%d-%m-%Y')

#         # Last 30 Days (including today)
#         last_30_days_start = add_days(today, -29)
#         last_30_days_end = today
#         last_30_days_date_from_str = last_30_days_start.strftime('%d-%m-%Y')
#         last_30_days_date_to_str = last_30_days_end.strftime('%d-%m-%Y')

#         print(f"Today: {today}")
#         print(f"This Week: {this_week_start} to {this_week_end}")
#         print(f"Last Week: {last_week_start} to {last_week_end}")
#         print(f"Last 30 Days: {last_30_days_start} to {last_30_days_end}")

#         for user in sales_users:
#             user_name = user.name
#             user_full_name = user.full_name
#             user_email = user.email
#             print(f"\nProcessing sales user: {user_full_name} ({user_name}), Email: {user_email}")

#             user_metrics = {
#                 "user_name": user_name,
#                 "full_name": user_full_name,
#                 "email": user_email,
#                 "IPM_this_week": [],
#                 "IPM_last_week": [],
#                 "IPM_last_30_days": [],
#                 "BOQR_this_week": [],
#                 "BOQR_last_week": [],
#                 "BOQR_last_30_days": [],
#             }
#             def add_date_range_to_items(items, date_from, date_to):
#                 modified_items = []
#                 for item in items:
#                     modified_item = item.copy()
#                     modified_item["date_from"] = date_from
#                     modified_item["date_to"] = date_to
#                     modified_items.append(modified_item)
#                 return modified_items
#             # --- In Person Meetings ---
#             # Now, return the full list of meetings for each period
#             # IPM: This Week
#             this_week_meetings = frappe.get_list(
#                 "CRM Task",
#                 filters=[
#                     ["status", "=", "Completed"],
#                     ["start_date", ">=", this_week_start],
#                     ["start_date", "<=", this_week_end],
#                     ["type", "=", "In Person Meeting"],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name","task_profile","status", "type", "start_date", "company", "contact.first_name", "boq"],
#             )
#             user_metrics["IPM_this_week"] = this_week_meetings
      

#             print(f"  This Week In Person Meetings: {len(this_week_meetings)} documents")

#             # IPM: Last Week
#             last_week_meetings = frappe.get_list(
#                 "CRM Task",
#                 filters=[
#                     ["status", "=", "Completed"],
#                     ["start_date", ">=", last_week_start],
#                     ["start_date", "<=", last_week_end],
#                     ["type", "=", "In Person Meeting"],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name","task_profile","status", "type", "start_date", "company", "contact.first_name", "boq"],
#             )
#             user_metrics["IPM_last_week"] = last_week_meetings
#             print(f"  Last Week In Person Meetings: {len(last_week_meetings)} documents")

#             # IPM: Last 30 Days
#             last_30_days_meetings = frappe.get_list(
#                 "CRM Task",
#                 filters=[
#                     ["status", "=", "Completed"],
#                     ["start_date", ">=", last_30_days_start],
#                     ["start_date", "<=", last_30_days_end],
#                     ["type", "=", "In Person Meeting"],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name","task_profile","status", "type", "start_date", "company", "contact.first_name", "boq"],
#             )
#             user_metrics["IPM_last_30_days"] = last_30_days_meetings
#             print(f"  Last 30 Days In Person Meetings: {len(last_30_days_meetings)} documents")

#             # --- BOQ Received ---
#             # BOQR: This Week
#             this_week_boqs = frappe.get_list(
#                 "CRM BOQ",
#                 filters=[
#                     ["creation", ">=", this_week_start],
#                     ["creation", "<=", this_week_end],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name", "creation", "company","boq_status"],
#             )
#             user_metrics["BOQR_this_week"] = this_week_boqs
#             print(f"  This Week BOQ Received: {len(this_week_boqs)} documents")

#             # BOQR: Last Week
#             last_week_boqs = frappe.get_list(
#                 "CRM BOQ",
#                 filters=[
#                     ["creation", ">=", last_week_start],
#                     ["creation", "<=", last_week_end],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name", "creation", "company","boq_status"],
#             )
#             user_metrics["BOQR_last_week"] = last_week_boqs
#             print(f"  Last Week BOQ Received: {len(last_week_boqs)} documents")

#             # BOQR: Last 30 Days
#             last_30_days_boqs = frappe.get_list(
#                 "CRM BOQ",
#                 filters=[
#                     ["creation", ">=", last_30_days_start],
#                     ["creation", "<=", last_30_days_end],
#                     ["assigned_sales", "=", user_email]
#                 ],
#                 fields=["name", "creation", "company","boq_status"],
#             )
#             user_metrics["BOQR_last_30_days"] = last_30_days_boqs
#             print(f"  Last 30 Days BOQ Received: {len(last_30_days_boqs)} documents")

#             performance_data.append(user_metrics)

#         print("--- Finished processing all sales users ---")
#         return performance_data

#     except Exception as e:
#         print(f"An error occurred in get_sales_performance_metrics: {e}")
#         frappe.throw(f"An unexpected error occurred: {e}")