import frappe
from frappe.utils import nowdate, add_days # Add add_days here

@frappe.whitelist(allow_guest=False)
def get_modified_crm_companies():
    """
    Fetches all CRM Company documents, modifies their data with additional fields
    from Task and CRM BOQ documents, and returns the list.
    """
    try:
        # 1. Print before the main frappe.get_list call
        print("--- Starting get_modified_crm_companies ---")
        
        companies = frappe.get_list(
            "CRM Company",
            fields=[
                "name",
                "company_name",
                "company_city",
                "assigned_sales",
                "priority",
                "last_meeting",
            ],
            filters={},
            order_by="last_meeting desc"
        )
        
        # 2. Print after the main frappe.get_list call to see how many companies were fetched
        print(f"Fetched {len(companies)} CRM companies.")

        modified_companies = []

        for company in companies:
            modified_company = company.copy()
            
            # 3. Print for each company to trace the loop
            print(f"Processing company: {company.name}")

            # Get next meeting date and ID
            next_meeting_task = frappe.get_list(
                "CRM Task",
                filters={
                    "company": company.name,
                    "status": ("not in", ["Completed", "Incomplete"]),
                    "start_date": (">=", nowdate())
                },
                fields=["name", "start_date"],
                order_by="start_date asc",
                limit=1
            )
            # 4. Print the result of the Task query
            print(f"  Next meeting task query result: {next_meeting_task}")
            
            if next_meeting_task:
                modified_company["next_meeting_date"] = next_meeting_task[0].start_date
                modified_company["next_meeting_id"] = next_meeting_task[0].name
            else:
                modified_company["next_meeting_date"] = None
                modified_company["next_meeting_id"] = None

            # Get last three completed task remarks
            completed_tasks = frappe.get_list(
                "CRM Task",
                filters={
                    "company": company.name,
                    "status": "Completed"
                },
                fields=["*"],
                order_by="modified desc",
                limit=3
            )
            # 5. Print the completed tasks result
            print(f"  Completed tasks query result: {completed_tasks}")

            modified_company["last_three_remarks_from_tasks"] = [
                task.remarks for task in completed_tasks if task.remarks
            ]

            # # Get counts of active and hot BOQs
            # active_boq_count = frappe.db.count(
            #     "CRM BOQ",
            #     filters={
            #         "company": company.name,
            #         "boq_status": ("not in", ["Won", "Lost", "Dropped"])
            #     }
            # )
            # hot_boq_count = frappe.db.count(
            #     "CRM BOQ",
            #     filters={
            #         "company": company.name,
            #         "deal_status": "Hot" # Corrected filter key to 'deal_status'
            #     }
            # )
            active_boqs_list = frappe.get_list(
                "CRM BOQ",
                filters={
                    "company": company.name,
                    "boq_status": ("not in", ["Won", "Lost", "Dropped"])
                },
                fields=[
                    "name", 
                    "boq_name",          # Requested field
                    "boq_status", 
                    "boq_sub_status",
                    "boq_value", 
                    "boq_submission_date", 
                    "remarks",
                    "creation"           # Requested field (creation date)
                ],
                limit=5 # Limit to a reasonable number for hover display
            )
            
            # --- CRITICAL CHANGE: Get actual list of hot BOQs, not just count ---
            hot_boqs_list = frappe.get_list(
                "CRM BOQ",
                filters={
                    "company": company.name,
                    "deal_status": "Hot"
                },
                fields=[
                    "name", 
                    "boq_name",          # Requested field
                    "boq_status", 
                    "boq_sub_status",
                    "boq_value", 
                    "boq_submission_date", 
                    "remarks",
                    "creation"           # Requested field (creation date)
                ],
                limit=5 # Limit to a reasonable number for hover display
            )
            # 6. Print the BOQ counts
            print(f"  Active BOQs: {active_boqs_list}, Hot BOQs: {hot_boqs_list}")
            today = frappe.utils.get_datetime(nowdate()) # Get current date as datetime object
            thirty_days_ago = add_days(today, -30) # Calculate date 30 days ago

            last_30_days_boqs_list = frappe.get_list(
                "CRM BOQ",
                filters={
                "company": company.name,
                "creation": (">=", thirty_days_ago.strftime('%Y-%m-%d')) # Filter by creation date
                },
                fields=[
                "name",
                "boq_name",
                "boq_status",
                "boq_sub_status",
                "boq_value",
                "boq_submission_date",
                "remarks",
                "creation"
                ],
                limit=0 # Limit to a reasonable number for hover display
            )
            print(f"  Last 30 days BOQs for {company.name}: {last_30_days_boqs_list}")

        # Add the new list to the modified_company dictionary
            modified_company["last_30_days_boqs"] = last_30_days_boqs_list
            
            # Add the counts to the modified_company dictionary
            # modified_company["active_boq"] = active_boq_count
            # modified_company["hot_boq"] = hot_boq_count
            modified_company["active_boq"] = active_boqs_list
            modified_company["hot_boq"] = hot_boqs_list

            modified_companies.append(modified_company)

        modified_companies.sort(
            key=lambda company: (
        # Primary sort: next_meeting_date (descending, None last)
        # This creates a tuple: (boolean_has_date, date_string_or_empty)
        # True for actual dates (sorts first with reverse=True), False for None (sorts last)
              (company.get("next_meeting_date") is not None, company.get("next_meeting_date") or ""),
        # Secondary sort: last_meeting (descending, None last)
        # Applied only if primary sort elements are equal
             (company.get("last_meeting") is not None, company.get("last_meeting") or "")
            ),
            reverse=True # Apply descending sort to the entire tuple key
        )

        # 7. Print at the end of the function
        print("--- Finished processing all companies ---")
        return modified_companies

    except Exception as e:
    # 8. Print the error details if an exception occurs and re-raise it with details
      print(f"An error occurred in get_modified_crm_companies: {e}")
      frappe.throw(f"An unexpected error occurred: {e}") # Provide the actual error message





# import frappe
# from frappe.utils import nowdate

# @frappe.whitelist(allow_guest=False)
# def get_modified_crm_companies():
#     """
#     Fetches all CRM Company documents, modifies their data with additional fields
#     from Task and CRM BOQ documents, and returns the list.
#     """
#     try:
#         # 1. Print before the main frappe.get_list call
#         print("--- Starting get_modified_crm_companies ---")
        
#         companies = frappe.get_list(
#             "CRM Company",
#             fields=[
#                 "name",
#                 "company_name",
#                 "company_city",
#                 "assigned_sales",
#                 "priority",
#                 "last_meeting",
#             ],
#             filters={},
#             order_by="last_meeting desc"
#         )
        
#         # 2. Print after the main frappe.get_list call to see how many companies were fetched
#         print(f"Fetched {len(companies)} CRM companies.")

#         modified_companies = []

#         for company in companies:
#             modified_company = company.copy()
            
#             # 3. Print for each company to trace the loop
#             print(f"Processing company: {company.name}")

#             # Get next meeting date and ID
#             next_meeting_task = frappe.get_list(
#                 "CRM Task",
#                 filters={
#                     "company": company.name,
#                     "status": ("not in", ["Completed", "Incomplete"]),
#                     "start_date": (">=", nowdate())
#                 },
#                 fields=["name", "start_date"],
#                 order_by="start_date asc",
#                 limit=5
#             )
#             # 4. Print the result of the Task query
#             print(f"  Next meeting task query result: {next_meeting_task}")
            
#             if next_meeting_task:
#                 modified_company["next_meeting_date"] = next_meeting_task[0].start_date
#                 modified_company["next_meeting_id"] = next_meeting_task[0].name
#             else:
#                 modified_company["next_meeting_date"] = None
#                 modified_company["next_meeting_id"] = None

#             # Get last three completed task remarks
#             completed_tasks = frappe.get_list(
#                 "CRM Task",
#                 filters={
#                     "company": company.name,
#                     "status": "Completed"
#                 },
#                 fields=["*"],
#                 order_by="modified desc",
#                 limit=3
#             )
#             # 5. Print the completed tasks result
#             print(f"  Completed tasks query result: {completed_tasks}")

#             modified_company["last_three_remarks_from_tasks"] = [
#                 task.remarks for task in completed_tasks if task.remarks
#             ]

#             # Get counts of active and hot BOQs
#             active_boq_count = frappe.db.count(
#                 "CRM BOQ",
#                 filters={
#                     "company": company.name,
#                     "boq_status": ("not in", ["Won", "Lost", "Dropped"])
#                 }
#             )
#             hot_boq_count = frappe.db.count(
#                 "CRM BOQ",
#                 filters={
#                     "company": company.name,
#                     "deal_status": "Hot" # Corrected filter key to 'deal_status'
#                 }
#             )
#             # 6. Print the BOQ counts
#             print(f"  Active BOQs: {active_boq_count}, Hot BOQs: {hot_boq_count}")
            
#             # Add the counts to the modified_company dictionary
#             modified_company["active_boq"] = active_boq_count
#             modified_company["hot_boq"] = hot_boq_count

#             modified_companies.append(modified_company)

#         # 7. Print at the end of the function
#         print("--- Finished processing all companies ---")
#         return modified_companies

#     except Exception as e:
#         # 8. Print the error details if an exception occurs
#         print(f"An error occurred: {e}")
#         frappe.throw("An unexpected error occurred.")
