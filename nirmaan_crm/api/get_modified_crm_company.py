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
          # --- 1. Define Date Ranges (REQUIRED FOR NEW LOGIC) ---
        today = nowdate() # datetime.date object
        date_7_days_ago = add_days(today, -7) # datetime.date object
        date_14_days_ahead = add_days(today, 14) # datetime.date object
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
                "company_type",
            ],
            filters={},
            order_by="last_meeting desc"
        )
        
        # 2. Print after the main frappe.get_list call to see how many companies were fetched
        company_names = [c.name for c in companies]
        print(f"Fetched {len(companies)} CRM companies.")
                # 2a. Query for Last Meeting (Completed, Last 7 Days)
        last7_past_tasks = frappe.get_list(
            "CRM Task",
            filters=[
            ["type", "=", "In Person Meeting"],
            ["status", "=", "Completed"],
            ["start_date", ">=", date_7_days_ago],
            ["start_date", "<=", today], # Only up to today
            ["company", "in", company_names] 
        ],
            fields=["company", "start_date", "remarks"], # Get remarks for the task remarks section
            limit=0,
            order_by="start_date desc" # Sort by newest first
        )

        # 2b. Query for Next Meeting (Pending/Scheduled, From Today to Next 14 Days)
        all_upcoming2week_tasks = frappe.get_list(
            "CRM Task",
            filters=[
            ["type", "=", "In Person Meeting"],
            ["status", "in", ["Pending", "Scheduled"]],
            ["start_date", ">=", today], # From today onwards
            ["start_date", "<=", date_14_days_ahead],
            ["company", "in", company_names] 
        ],
            fields=["company", "start_date"],
            limit=0,
            order_by="start_date asc" # Sort by oldest first
        )


        modified_companies = []

        for company in companies:
            modified_company = company.copy()
            
            # 3. Print for each company to trace the loop
            print(f"Processing company: {company.name}")
                        # --- A. NEW LOGIC: LAST MEETING IN 7 DAYS ---
            # Filter the global list by the current company name
            past_tasks_for_company = [t for t in last7_past_tasks if t.company == company.name]
            
            # The list is already sorted by start_date desc (newest first) from the query.
            if past_tasks_for_company:
                # The first item is the most recent completed meeting in the last 7 days
                modified_company["last_meeting_in_7_days"] = past_tasks_for_company[0].start_date.strftime('%Y-%m-%d')
            else:
                modified_company["last_meeting_in_7_days"] = None

            upcoming_tasks_for_company = [t for t in all_upcoming2week_tasks if t.company == company.name]

            # The list is already sorted by start_date asc (oldest first) from the query.
            if upcoming_tasks_for_company:
                # The first item is the next scheduled meeting in the next 14 days
                modified_company["next_meeting_in_14_days"] = upcoming_tasks_for_company[0].start_date.strftime('%Y-%m-%d')
                
                # Use this for next meeting date field, as it's more accurate than the previous query
                # Note: The original logic fetched ALL statuses, this is filtered for In Person Meeting
            else:
                modified_company["next_meeting_in_14_days"] = None
                


            # Get next meeting date and ID
            next_meeting_task = frappe.get_list(
                "CRM Task",
                filters={
                    "company": company.name,
                    "type": "In Person Meeting",
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
