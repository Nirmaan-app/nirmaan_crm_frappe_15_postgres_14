

import frappe
from frappe.utils import nowdate, add_days

@frappe.whitelist()
def get_company_exception_report():
    """
    Generates a report based on assigned_sales in CRM Company:
    1. Gets all active Sales Users (CRM Users).
    2. Gets all CRM Companies assigned to these users.
    3. Fetches completed tasks (last 7 days) and pending/scheduled tasks (next 14 days)
       using two separate, targeted database queries.
    4. Groups the final report by Sales User.
    """
    
    # --- 1. Define Date Ranges ---
    today = nowdate() # datetime.date object
    date_7_days_ago = add_days(today, -7) # datetime.date object
    date_14_days_ahead = add_days(today, 14) # datetime.date object

    # Use raw date objects for printing as requested/observed
    today_str = today
    date_7_days_ago_str = date_7_days_ago
    date_14_days_ahead_str = date_14_days_ahead

    print(f"\n--- DEBUG:Exception REPORT START ---")
    print(f"1. Date Range: Last 7 Days (>= {date_7_days_ago_str}) to Next 14 Days (<= {date_14_days_ahead_str})")
    print(f"2. Current Date (Boundary for filtering): {today_str}")

    # --- 2. Get All Active Sales Users (CRM Users) ---
    sales_users = frappe.get_list(
        "CRM Users", 
        filters={"nirmaan_role_name": "Nirmaan Sales User Profile"},
        fields=["full_name", "email"],
        limit=0
    )
    user_map = {user.email: user.full_name for user in sales_users}
    user_emails = list(user_map.keys())

    print(f"3. Active Sales Users Found: {len(user_emails)}")
    if not user_emails:
        return []

    # --- 3. Get All CRM Companies Assigned to these Users ---
    assigned_companies = frappe.get_list(
        "CRM Company",
        filters={"assigned_sales": ["in", user_emails]},
        fields=["name", "company_name", "assigned_sales","priority","last_meeting"], 
        limit=0,
        order_by="last_meeting desc"

    )
    
    company_names = [c.name for c in assigned_companies]
    # print(f"4. Assigned Companies Found: {len(assigned_companies)}")
    
    if not assigned_companies:
        return []

    # --- 4. Get Relevant Tasks (Split Query: Past vs. Upcoming) ---

    # 4a. Query for Last Meeting (Completed, Last 7 Days)
    past_tasks = frappe.get_list(
        "CRM Task",
        filters=[
            ["type", "=", "In Person Meeting"],
            ["status", "=", "Completed"],
            ["start_date", ">=", date_7_days_ago],
            ["start_date", "<=", today], # Only up to today
            ["company", "in", company_names] 
        ],
        fields=["company", "start_date", "status"],
        limit=0,
    )

    # 4b. Query for Next Meeting (Pending/Scheduled, From Today to Next 14 Days)
    upcoming_tasks = frappe.get_list(
        "CRM Task",
        filters=[
            ["type", "=", "In Person Meeting"],
            ["status", "in", ["Pending", "Scheduled"]],
            ["start_date", ">=", today], # From today onwards
            ["start_date", "<=", date_14_days_ahead],
            ["company", "in", company_names] 
        ],
        fields=["company", "start_date", "status"],
        limit=0
    )
    
    # print(f"5. Total Past Tasks Fetched: {len(past_tasks)}")
    # print(f"5. Total Upcoming Tasks Fetched: {len(upcoming_tasks)}")


    # --- 5. Process and Group the Report Data ---
    grouped_report_data = {} 
    
    for email, full_name in user_map.items():
        if email in [c.assigned_sales for c in assigned_companies]:
             grouped_report_data[email] = {
                "user_full_name": full_name,
                "companies": []
            }

    # Iterate over the Company assignments
    for company_doc in assigned_companies:
        assigned_email = company_doc.assigned_sales
        company_doc_name = company_doc.name
        company_display_name = company_doc.company_name or company_doc_name
        company_doc_last_meeting_str = company_doc.last_meeting.strftime('%Y-%m-%d') if company_doc.last_meeting else None

        if assigned_email not in grouped_report_data:
             continue 

        # Filter pre-queried tasks relevant to this specific Company
        company_past_tasks = [t for t in past_tasks if t.company == company_doc_name]
        company_upcoming_tasks = [t for t in upcoming_tasks if t.company == company_doc_name]
        
        # print(f"\n--- DEBUG: PROCESSING COMPANY: {company_display_name} (Assigned to: {user_map.get(assigned_email, assigned_email)}) ---")
        
        # --- DEBUG PRINT ---
        all_company_tasks = company_past_tasks + company_upcoming_tasks
        if all_company_tasks:
            # print(f"6. Tasks for Company '{company_doc_name}' ({len(all_company_tasks)} found):")
            for t in all_company_tasks:
                # Use strftime for clean printing
                formatted_date = t.start_date.strftime("%Y-%m-%d")
                # print(f"   - [Status: {t.status}, Date: {formatted_date}]")
        else:
            print(f"6. Tasks for Company '{company_doc_name}' (0 found).")
        # -------------------
        
        # --- Last Meeting Check (Past 7 days, Completed) ---
        last_meeting = None
        completed_tasks = company_past_tasks # Already filtered by date and status in query 4a.
        
        if completed_tasks:
            # Sort using the date object
            completed_tasks.sort(key=lambda x: x.start_date, reverse=True)
            last_meeting = completed_tasks[0]
            # print(f"7. Last Meeting Found: YES on {last_meeting.start_date}")
        else:
            print("7. Last Meeting Found: NO")
            
        # --- Next Meeting Check (Next 14 days, Pending/Scheduled) ---
        next_meeting = None
        upcoming_tasks_filtered = company_upcoming_tasks # Already filtered by date and status in query 4b.
        
        if upcoming_tasks_filtered:
            # Sort using the date object
            upcoming_tasks_filtered.sort(key=lambda x: x.start_date, reverse=False)
            next_meeting = upcoming_tasks_filtered[0]
            # print(f"8. Next Meeting Found: YES on {next_meeting.start_date}")
        else:
            print("8. Next Meeting Found: NO")
            
        
        # --- Assemble Company Row ---
        company_row = {
            "company_name": company_display_name,
            "priority": company_doc.priority, 
            "last_meeting_company": company_doc_last_meeting_str,
            
            "last_meeting_status": "NO",
            "last_meeting_date": None,
            
            "next_meeting_status": "NO",
            "next_meeting_date": None,
        }
        
        if last_meeting:
            company_row["last_meeting_status"] = "YES"
            # Use strftime for final JSON output
            company_row["last_meeting_date"] = last_meeting.start_date.strftime('%Y-%m-%d')
            
        if next_meeting:
            company_row["next_meeting_status"] = "YES"
            # Use strftime for final JSON output
            company_row["next_meeting_date"] = next_meeting.start_date.strftime('%Y-%m-%d')
            
        # Add the company row to the correct user's group
        grouped_report_data[assigned_email]["companies"].append(company_row)

    # Convert the grouped dictionary values to a list for final output
    # final_report_list = list(grouped_report_data.values())
     # --- FIX: Re-introduce the sorting step for company lists within each user group ---
    final_report_list = []
    
    # Iterate through each user's data
    for user_data in grouped_report_data.values():
        companies = user_data["companies"]
        
        # Sort the companies list by the 'last_meeting' string date (descending)
        # Use a placeholder date string ("0000-00-00") for None/null values to ensure they go to the bottom.
        companies.sort(
            key=lambda x: x["last_meeting_company"] or "0000-00-00", 
            reverse=True # Newest meetings first (descending)
        )
        
        final_report_list.append(user_data)
    # --------------------------------------------------------------------------------------

    
    print(f"\n--- DEBUG: FINAL REPORT LIST (first item) ---")
        
    return final_report_list