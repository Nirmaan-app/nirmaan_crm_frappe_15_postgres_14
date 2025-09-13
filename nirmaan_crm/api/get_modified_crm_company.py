import frappe
from frappe.utils import nowdate

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
            order_by="creation desc"
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
                limit=5
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

            # Get counts of active and hot BOQs
            active_boq_count = frappe.db.count(
                "CRM BOQ",
                filters={
                    "company": company.name,
                    "boq_status": ("not in", ["Won", "Lost", "Dropped"])
                }
            )
            hot_boq_count = frappe.db.count(
                "CRM BOQ",
                filters={
                    "company": company.name,
                    "deal_status": "Hot" # Corrected filter key to 'deal_status'
                }
            )
            # 6. Print the BOQ counts
            print(f"  Active BOQs: {active_boq_count}, Hot BOQs: {hot_boq_count}")
            
            # Add the counts to the modified_company dictionary
            modified_company["active_boq"] = active_boq_count
            modified_company["hot_boq"] = hot_boq_count

            modified_companies.append(modified_company)

        # 7. Print at the end of the function
        print("--- Finished processing all companies ---")
        return modified_companies

    except Exception as e:
        # 8. Print the error details if an exception occurs
        print(f"An error occurred: {e}")
        frappe.throw("An unexpected error occurred.")

# from frappe.utils import nowdate

# @frappe.whitelist(allow_guest=False) # Set allow_guest=True if no authentication is required
# def get_modified_crm_companies():
#     """
#     Fetches all CRM Company documents, modifies their data with additional fields
#     from Task and CRM BOQ documents, and returns the list.
#     """
#     companies = frappe.get_list(
#         "CRM Company",
#         fields=[
#             "name",
#             "company_name",
#             "company_city",
         
        
#             "assigned_sales",
#             "priority",
#             "last_meeting",
#         ],
#         filters={}, # No specific filters to get all
#         order_by="creation desc"
#     )

#     modified_companies = []

#     for company in companies:
#         modified_company = company.copy() # Start with existing company data

#         # 1) Get next meeting date and ID
#         next_meeting_task = frappe.get_list(
#             "Task",
#             filters={
#                 "company": company.name,
#                 "status": ("not in", ["Completed", "Incomplete"]), # Changed "Cancelled" to "Incomplete"
#                 "start_date": (">=", nowdate())
#             },
#             fields=["name", "start_date"],
#             order_by="start_date asc",
#             limit=1
#         )
#         if next_meeting_task:
#             modified_company["next_meeting_date"] = next_meeting_task[0].start_date
#             modified_company["next_meeting_id"] = next_meeting_task[0].name
#         else:
#             modified_company["next_meeting_date"] = None
#             modified_company["next_meeting_id"] = None

#         # 2) Get last three completed task remarks
#         completed_tasks = frappe.get_list(
#             "Task",
#             filters={
#                 "company": company.name,
#                 "status": "Completed"
#             },
#             fields=["description"],
#             order_by="modified desc",
#             limit=3
#         )
#         modified_company["last_three_remarks_from_tasks"] = [
#             task.description for task in completed_tasks if task.description
#         ]

#         # 3) Get count of active BOQs
#         active_boq_count = frappe.db.count(
#             "CRM BOQ",
#             filters={
#                 "company": company.name,
#                 "boq_status": ("not in", ["Won", "Lost", "Dropped"])
#             }
#         )
#         modified_company["active_boq"] = active_boq_count

#         # 4) Get count of hot BOQs
#         hot_boq_count = frappe.db.count(
#             "CRM BOQ",
#             filters={
#                 "company": company.name,
#                 "deals_status": "Hot"
#             }
#         )
#         modified_company["hot_boq"] = hot_boq_count

#         modified_companies.append(modified_company)

#     return modified_companies