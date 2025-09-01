# nirmaan_crm/nirmaan_crm/permissions.py

import frappe

def get_company_permission_query_conditions(user):
    """
    Applies record-level permissions based on the 'owner' field.
    - Admins can see all documents.
    - Sales Users can only see documents they own.
    - Estimation Users can see all BOQs but are restricted on other doctypes.
    """
    if not user:
        user = frappe.session.user

    # Nirmaan Admin User has unrestricted access
    if "System Manager" in frappe.get_roles(user):
        return None  # Returning None or an empty string means no conditions are applied

    # General condition for Sales Users
    return f"`tabCRM Company`.assigned_sales = '{user}'"

def get_contact_permission_query_conditions(user):
    """
    Applies record-level permissions based on the 'owner' field.
    - Admins can see all documents.
    - Sales Users can only see documents they own.
    - Estimation Users can see all BOQs but are restricted on other doctypes.
    """
    if not user:
        user = frappe.session.user

    # Nirmaan Admin User has unrestricted access
    if "System Manager" in frappe.get_roles(user):
        return None  # Returning None or an empty string means no conditions are applied

    # General condition for Sales Users
    return f"`tabCRM Contacts`.assigned_sales = '{user}'"


def get_boq_permission_query_conditions(user):
    """
    Special permission for BOQs.
    - Admins and Estimation Users can see all BOQs.
    - Sales Users can only see BOQs they own.
    """
    if not user:
        user = frappe.session.user

    # Admins and Estimation Users have unrestricted access to BOQs
    roles = frappe.get_roles(user)
    if "System Manager" in roles:
        return None

    # Sales Users are restricted to their own BOQs
    return f"`tabCRM BOQ`.assigned_sales = '{user}'"

def get_task_permission_query_conditions(user):
    """
    Applies record-level permissions based on the 'owner' field.
    - Admins can see all documents.
    - Sales Users can only see documents they own.
    - Estimation Users can see all BOQs but are restricted on other doctypes.
    """
    if not user:
        user = frappe.session.user

    # Nirmaan Admin User has unrestricted access
    if "System Manager" in frappe.get_roles(user):
        return None  # Returning None or an empty string means no conditions are applied

    # General condition for Sales Users
    return f"`tabCRM Task`.assigned_sales = '{user}'"