# # File: nirmaan_crm/nirmaan_crm/api.py (UPDATED - Re-introducing conditional assignment filtering)

# import frappe
# from frappe.utils import cint
# from html import escape
# import re # Import regex for case-insensitive highlighting

# @frappe.whitelist(allow_guest=False)
# def global_search(search_term="", user_role=""):
#     """
#     Performs a global search across multiple CRM DocTypes based on user role.
#     Filters results by 'assigned_sales'/'assigned_estimations'/'assigned_to'
#     if the user has a Sales or Estimations role. Admin users get a truly global search.
#     Results are structured for a frontend command menu with highlighting.
#     Leverages Frappe ORM for better integration and permissions.
#     Includes Python print statements for debugging output to the console.
#     """
#     print(f"global_search called with search_term: '{search_term}', user_role: '{user_role}'")

#     if not search_term or len(search_term) < 2:
#         print("Search term too short or empty, returning empty list.")
#         return []

#     search_pattern = f"%{search_term.strip()}%"
#     user_email = frappe.session.user # Current logged-in user
    
#     print(f"Processed search_pattern: '{search_pattern}', current user_email: '{user_email}'")

#     results = []

#     def add_highlight(text, term_to_highlight_original):
#         if not text:
#             return ""
        
#         escaped_text = escape(str(text)) 
#         term_cleaned = term_to_highlight_original.strip('%')
#         escaped_term_for_regex = re.escape(term_cleaned)
        
#         highlight_enabled = False
#         try:
#             if frappe.db.exists('DocType', 'CRM Settings') and frappe.db.exists('CRM Settings', 'CRM Settings'):
#                 highlight_enabled = cint(frappe.get_single_value('CRM Settings', 'highlight_search_results', False))
#             else:
#                 print("CRM Settings or highlight_search_results field not found. Highlighting disabled.")
#         except Exception as e:
#             print(f"Error checking CRM Settings for highlighting: {e}. Highlighting disabled.")
#             pass 

#         if highlight_enabled:
#             return re.sub(escaped_term_for_regex, r'<span class="search-highlight">\g<0></span>', escaped_text, flags=re.IGNORECASE)
#         return escaped_text


#     # --- Search CRM Contacts ---
#     print(f"Attempting to search CRM Contacts for user_role: {user_role}")
#     if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile"]:
#         base_filters = {} # For AND conditions
#         if user_role == "Nirmaan Sales User Profile":
#             # Filter Contacts by assigned_sales for Sales Users
#             base_filters["assigned_sales"] = user_email
#             print(f"CRM Contacts: Added assigned_sales filter for {user_email}")
        
#         contact_or_filters = [ # For OR conditions
#             ["first_name", "like", search_pattern],
#             ["last_name", "like", search_pattern],
#             ["email", "like", search_pattern],
#             ["mobile", "like", search_pattern]
#         ]

#         try:
#             contacts = frappe.get_list(
#                 "CRM Contacts",
#                 filters=base_filters, # Pass AND conditions
#                 or_filters=contact_or_filters, # Pass OR conditions separately
#                 fields=["name", "first_name", "last_name", "email", "mobile"],
#                 limit_page_length=10, # Re-enabled limit
#                 order_by="modified desc"
#             )
#             print(f"CRM Contacts: Found {len(contacts)} results. Filters used: {base_filters}, OR Filters used: {contact_or_filters}")
#             for contact in contacts:
#                 full_name = f"{contact.first_name or ''} {contact.last_name or ''}".strip()
#                 contact_info = contact.mobile or contact.email or 'N/A'
#                 display_text = f"{full_name} ({contact_info})"
#                 title = add_highlight(display_text, search_term)
#                 results.append({
#                     "doctype": "CRM Contacts",
#                     "name": contact.name,
#                     "title": title,
#                     "path": f"/contacts/contact?id={contact.name}"
#                 })
#         except Exception as e:
#             print(f"Error searching CRM Contacts: {e}")

#     # --- Search CRM Company ---
#     print(f"Attempting to search CRM Company for user_role: {user_role}")
#     if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile"]:
#         base_filters = {} # For AND conditions
#         if user_role == "Nirmaan Sales User Profile":
#             # Filter Companies by assigned_sales for Sales Users
#             base_filters["assigned_sales"] = user_email
#             print(f"CRM Company: Added assigned_sales filter for {user_email}")

#         company_or_filters = [ # For OR conditions
#             ["company_name", "like", search_pattern],
#             ["company_city", "like", search_pattern]
#         ]
    
#         try:
#             companies = frappe.get_list(
#                 "CRM Company",
#                 filters=base_filters,
#                 or_filters=company_or_filters,
#                 fields=["name", "company_name", "company_city"],
#                 limit_page_length=10, # Re-enabled limit
#                 order_by="modified desc"
#             )
#             print(f"CRM Company: Found {len(companies)} results. Filters used: {base_filters}, OR Filters used: {company_or_filters}")
#             for company in companies:
#                 display_text = f"{company.company_name} ({company.company_city or 'N/A'})"
#                 title = add_highlight(display_text, search_term)
#                 results.append({
#                     "doctype": "CRM Company",
#                     "name": company.name,
#                     "title": title,
#                     "path": f"/companies/company?id={company.name}"
#                 })
#         except Exception as e:
#             print(f"Error searching CRM Company: {e}")

#     # --- Search CRM BOQ ---
#     print(f"Attempting to search CRM BOQ for user_role: {user_role}")
#     if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile", "Nirmaan Estimations User Profile"]:
#         base_filters = {} # For AND conditions
#         if user_role == "Nirmaan Sales User Profile":
#             base_filters["assigned_sales"] = user_email
#             print(f"CRM BOQ: Added assigned_sales filter for {user_email}")
#         elif user_role == "Nirmaan Estimations User Profile":
#             base_filters["assigned_estimations"] = user_email
#             print(f"CRM BOQ: Added assigned_estimations filter for {user_email}")
        
#         boq_or_filters = [ # For OR conditions
#             ["name", "like", search_pattern],
#             ["boq_name", "like", search_pattern],
#             ["boq_type", "like", search_pattern],
#             ["city", "like", search_pattern],
#             ["boq_status", "like", search_pattern]
#         ]
    
#         try:
#             boqs = frappe.get_list(
#                 "CRM BOQ",
#                 filters=base_filters,
#                 or_filters=boq_or_filters,
#                 fields=["name", "boq_name", "boq_status"],
#                 limit_page_length=10, # Re-enabled limit
#                 order_by="modified desc"
#             )
#             print(f"CRM BOQ: Found {len(boqs)} results. Filters used: {base_filters}, OR Filters used: {boq_or_filters}")
#             for boq in boqs:
#                 display_text = f"{boq.boq_name} ({boq.boq_status or 'N/A'})"
#                 title = add_highlight(display_text, search_term)
#                 results.append({
#                     "doctype": "CRM BOQ",
#                     "name": boq.name,
#                     "title": title,
#                     "path": f"/boqs/boq?id={boq.name}"
#                 })
#         except Exception as e:
#             print(f"Error searching CRM BOQ: {e}")

#     # --- Search CRM Task ---
#     print(f"Attempting to search CRM Task for user_role: {user_role}")
#     if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile", "Nirmaan Estimations User Profile"]:
#         base_filters = {} # For AND conditions
#         # Conditional assignment for Tasks
#         if user_role == "Nirmaan Sales User Profile":
#             if frappe.db.has_column("CRM Task", "assigned_sales"):
#                 base_filters["assigned_sales"] = user_email
#                 print(f"CRM Task: Added assigned_sales filter for Sales User {user_email}")
#             elif frappe.db.has_column("CRM Task", "assigned_to"): # Fallback to assigned_to if assigned_sales doesn't exist
#                 base_filters["assigned_to"] = user_email
#                 print(f"CRM Task: Added assigned_to filter for Sales User {user_email} (assigned_sales not found)")
#         elif user_role == "Nirmaan Estimations User Profile":
#             if frappe.db.has_column("CRM Task", "assigned_estimations"):
#                 base_filters["assigned_estimations"] = user_email
#                 print(f"CRM Task: Added assigned_estimations filter for Estimations User {user_email}")
#             elif frappe.db.has_column("CRM Task", "assigned_to"): # Fallback to assigned_to
#                 base_filters["assigned_to"] = user_email
#                 print(f"CRM Task: Added assigned_to filter for Estimations User {user_email} (assigned_estimations not found)")

#         task_or_filters = [ # For OR conditions
#             ["name", "like", search_pattern],
#             ["type", "like", search_pattern],
        
#         ]

#         try:
#             tasks = frappe.get_list(
#                 "CRM Task",
#                 filters=base_filters,
#                 or_filters=task_or_filters,
#                 fields=["name", "type", "status", "company", "boq"], # Added description field
#                 limit_page_length=10, # Re-enabled limit
#                 order_by="modified desc"
#             )
#             print(f"CRM Task: Found {len(tasks)} results. Filters used: {base_filters}, OR Filters used: {task_or_filters}")
#             for task in tasks:
#                 # Use description or company in display_text
#                 display_text = f"{task.type} - {task.boq or task.company or 'N/A'} ({task.status or 'N/A'})"
#                 title = add_highlight(display_text, search_term)
#                 results.append({
#                     "doctype": "CRM Task",
#                     "name": task.name,
#                     "title": title,
#                     "path": f"/tasks/task?id={task.name}"
#                 })
#         except Exception as e:
#             print(f"Error searching CRM Task: {e}")

#     # --- Search CRM Users (Admin Only) ---
#     # print(f"Attempting to search CRM Users for user_role: {user_role}")
#     # if user_role == "Nirmaan Admin User Profile": # This block is explicitly for Admin only
#     #     base_filters = {} # For AND conditions (none specific for global user search)

#     #     user_or_filters = [ # For OR conditions
#     #         ["full_name", "like", search_pattern],
#     #         ["email", "like", search_pattern]
#     #     ]
#     #     try:
#     #         users = frappe.get_list(
#     #             "CRM Users",
#     #             filters=base_filters,
#     #             or_filters=user_or_filters,
#     #             fields=["name", "full_name", "nirmaan_role_name"],
#     #             limit_page_length=10, # Re-enabled limit
#     #             order_by="modified desc"
#     #         )
#     #         print(f"CRM Users: Found {len(users)} results. Filters used: {base_filters}, OR Filters used: {user_or_filters}")
#     #         for user in users:
#     #             display_text = f"{user.full_name} ({user.nirmaan_role_name or 'N/A'})"
#     #             title = add_highlight(display_text, search_term)
#     #             results.append({
#     #                 "doctype": "CRM Users",
#     #                 "name": user.name,
#     #                 "title": title,
#     #                 "path": f"/team/details?memberId={user.name}"
#     #             })
#     #     except Exception as e:
#     #         print(f"Error searching CRM Users: {e}")

#     print(f"global_search completed. Total results: {len(results)}")
#     return results


# Before Adding Sales Users Validation

import frappe
from frappe.utils import cint
from html import escape
import re

@frappe.whitelist(allow_guest=False)
def global_search(search_term="", user_role=""):
    """
    Performs a global search across multiple CRM DocTypes based on user role.
    FIXED: Correctly uses 'filters' for AND conditions and 'or_filters' for OR conditions
           in frappe.get_list to avoid 'unhashable type' errors.
    """
    print(f"global_search called with search_term: '{search_term}', user_role: '{user_role}'")

    if not search_term or len(search_term) < 2:
        print("Search term too short or empty, returning empty list.")
        return []

    search_pattern = f"%{search_term.strip()}%"
    user_email = frappe.session.user
    
    print(f"Processed search_pattern: '{search_pattern}', current user_email: '{user_email}'")

    results = []

    def add_highlight(text, term_to_highlight_original):
        if not text:
            return ""
        
        escaped_text = escape(str(text)) 
        term_cleaned = term_to_highlight_original.strip('%')
        escaped_term_for_regex = re.escape(term_cleaned)
        
        highlight_enabled = False
        try:
            if frappe.db.exists('DocType', 'CRM Settings') and frappe.db.exists('CRM Settings', 'CRM Settings'):
                highlight_enabled = cint(frappe.get_single_value('CRM Settings', 'highlight_search_results', False))
            else:
                print("CRM Settings or highlight_search_results field not found. Highlighting disabled.")
        except Exception as e:
            print(f"Error checking CRM Settings for highlighting: {e}. Highlighting disabled.")
            pass 

        if highlight_enabled:
            return re.sub(escaped_term_for_regex, r'<span class="search-highlight">\g<0></span>', escaped_text, flags=re.IGNORECASE)
        return escaped_text


    # --- Search CRM Contacts ---
    print(f"Attempting to search CRM Contacts for user_role: {user_role}")
    if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile"]:
        base_filters = {} # For AND conditions
        # No assigned_sales filter for global search, as per your request.
        
        contact_or_filters = [ # For OR conditions
            ["first_name", "like", search_pattern],
            ["last_name", "like", search_pattern],
            ["email", "like", search_pattern],
            ["mobile", "like", search_pattern]
        ]

        try:
            contacts = frappe.get_list(
                "CRM Contacts",
                filters=base_filters, # Pass empty dict if no AND conditions
                or_filters=contact_or_filters, # Pass OR conditions separately
                fields=["name", "first_name", "last_name", "email", "mobile"],
                # limit_page_length=10,
                order_by="modified desc"
            )
            print(f"CRM Contacts: Found {len(contacts)} results. Filters used: {base_filters}, OR Filters used: {contact_or_filters}")
            for contact in contacts:
                full_name = f"{contact.first_name or ''} {contact.last_name or ''}".strip()
                display_text = f"{full_name} ({contact.mobile or contact.email or  'N/A'})"
                title = add_highlight(display_text, search_term)
                results.append({
                    "doctype": "CRM Contacts",
                    "name": contact.name,
                    "title": title,
                    "path": f"/contacts/contact?id={contact.name}"
                })
        except Exception as e:
            print(f"Error searching CRM Contacts: {e}")

    # --- Search CRM Company ---
    print(f"Attempting to search CRM Company for user_role: {user_role}")
    if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile"]:
        base_filters = {} # For AND conditions
        # No assigned_sales filter for global search, as per your request.

        company_or_filters = [ # For OR conditions
            ["company_name", "like", search_pattern],
            ["company_city", "like", search_pattern]
        ]
    
        try:
            companies = frappe.get_list(
                "CRM Company",
                filters=base_filters,
                or_filters=company_or_filters,
                fields=["name", "company_name", "company_city"],
                # limit_page_length=10,
                order_by="modified desc"
            )
            print(f"CRM Company: Found {len(companies)} results. Filters used: {base_filters}, OR Filters used: {company_or_filters}")
            for company in companies:
                display_text = f"{company.company_name} ({company.company_city or 'N/A'})"
                title = add_highlight(display_text, search_term)
                results.append({
                    "doctype": "CRM Company",
                    "name": company.name,
                    "title": title,
                    "path": f"/companies/company?id={company.name}"
                })
        except Exception as e:
            print(f"Error searching CRM Company: {e}")

    # --- Search CRM BOQ ---
    print(f"Attempting to search CRM BOQ for user_role: {user_role}")
    if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile", "Nirmaan Estimations User Profile"]:
        base_filters = {} # For AND conditions
        # No assigned_sales/estimations filter for global search, as per your request.

        boq_or_filters = [ # For OR conditions
            ["name", "like", search_pattern],
            ["boq_name", "like", search_pattern],
            ["boq_type", "like", search_pattern],
            ["city", "like", search_pattern],
            ["boq_status", "like", search_pattern]
        ]
    
        try:
            boqs = frappe.get_list(
                "CRM BOQ",
                filters=base_filters,
                or_filters=boq_or_filters,
                fields=["name", "boq_name", "boq_status"],
                # limit_page_length=10,
                order_by="modified desc"
            )
            print(f"CRM BOQ: Found {len(boqs)} results. Filters used: {base_filters}, OR Filters used: {boq_or_filters}")
            for boq in boqs:
                display_text = f"{boq.boq_name} ({boq.boq_status or 'N/A'})"
                title = add_highlight(display_text, search_term)
                results.append({
                    "doctype": "CRM BOQ",
                    "name": boq.name,
                    "title": title,
                    "path": f"/boqs/boq?id={boq.name}"
                })
        except Exception as e:
            print(f"Error searching CRM BOQ: {e}")

    # --- Search CRM Task ---
    print(f"Attempting to search CRM Task for user_role: {user_role}")
    if user_role in ["Nirmaan Admin User Profile", "Nirmaan Sales User Profile", "Nirmaan Estimations User Profile"]:
        base_filters = {} # For AND conditions
        # No assigned filters for global search, as per your request.

        task_or_filters = [ # For OR conditions
            ["name", "like", search_pattern],
            ["type", "like", search_pattern],
            ["description", "like", search_pattern]
        ]

        try:
            tasks = frappe.get_list(
                "CRM Task",
                filters=base_filters,
                or_filters=task_or_filters,
                fields=["name", "type", "status", "company"],
                # limit_page_length=10,
                order_by="modified desc"
            )
            print(f"CRM Task: Found {len(tasks)} results. Filters used: {base_filters}, OR Filters used: {task_or_filters}")
            for task in tasks:
                display_text = f"{task.type} - {task.company or 'N/A'} ({task.status or 'N/A'})"
                title = add_highlight(display_text, search_term)
                results.append({
                    "doctype": "CRM Task",
                    "name": task.name,
                    "title": title,
                    "path": f"/tasks/task?id={task.name}"
                })
        except Exception as e:
            print(f"Error searching CRM Task: {e}")

    # # --- Search CRM Users (Admin Only) ---
    # print(f"Attempting to search CRM Users for user_role: {user_role}")
    # if user_role == "Nirmaan Admin User Profile":
    #     base_filters = {} # For AND conditions

    #     user_or_filters = [ # For OR conditions
    #         ["full_name", "like", search_pattern],
    #         ["email", "like", search_pattern]
    #     ]
    #     try:
    #         users = frappe.get_list(
    #             "CRM Users",
    #             filters=base_filters,
    #             or_filters=user_or_filters,
    #             fields=["name", "full_name", "nirmaan_role_name"],
    #             # limit_page_length=10,
    #             order_by="modified desc"
    #         )
    #         print(f"CRM Users: Found {len(users)} results. Filters used: {base_filters}, OR Filters used: {user_or_filters}")
    #         for user in users:
    #             display_text = f"{user.full_name} ({user.nirmaan_role_name or 'N/A'})"
    #             title = add_highlight(display_text, search_term)
    #             results.append({
    #                 "doctype": "CRM Users",
    #                 "name": user.name,
    #                 "title": title,
    #                 "path": f"/team/details?memberId={user.name}"
    #             })
    #     except Exception as e:
    #         print(f"Error searching CRM Users: {e}")

    print(f"global_search completed. Total results: {len(results)}")
    return results