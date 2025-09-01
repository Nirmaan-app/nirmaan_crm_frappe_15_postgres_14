# in apps/nirmaan_crm/nirmaan_crm/api.py

import frappe
from frappe.utils import random_string

# This decorator is crucial. It exposes the function as a public API endpoint.
@frappe.whitelist()
def create_crm_user(email, first_name, role_profile_name):
    """
    Creates a new System User and assigns a Role Profile.
    Only users with the 'Nirmaan Admin User' role can call this.
    """
    # 1. SECURITY: Check if the currently logged-in user has the required role.
    # This is the most important part.
    if "Nirmaan Admin User" not in frappe.get_roles():
        frappe.throw("You do not have permission to create new users.", frappe.PermissionError)

    # 2. VALIDATION: Check if the user already exists.
    if frappe.db.exists("User", email):
        frappe.throw(f"User with email '{email}' already exists.")

    try:
        # 3. CREATE THE USER DOCUMENT: Create a new User doc in memory.
        new_user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": first_name,
            "role_profile_name": role_profile_name,
            "send_welcome_email": True,
            # Frappe will generate and send a password reset link in the welcome email.
        })

        # 4. SAVE THE DOCUMENT: Use insert() with ignore_permissions=True.
        # This is necessary because the 'Nirmaan Admin User' might not have
        # direct permission on the User doctype, but this whitelisted function acts
        # as a secure, trusted gateway.
        new_user.insert(ignore_permissions=True)

        return {
            "status": "success",
            "message": f"Successfully created user '{email}'. A welcome email has been sent."
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "CRM User Creation Failed")
        frappe.throw(f"An error occurred while creating the user: {e}")