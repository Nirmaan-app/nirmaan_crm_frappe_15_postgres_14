import frappe


ALLOWED_ROLE_PROFILES = {
    "Nirmaan Sales User Profile",
    "Nirmaan Estimations User Profile",
    "Nirmaan Estimations Lead Profile",
    "Nirmaan Admin User Profile",
}


def _require_admin_access():
    roles = set(frappe.get_roles())
    if "System Manager" in roles or "Nirmaan Admin User" in roles:
        return
    frappe.throw(
        "You do not have permission to update team members.",
        frappe.PermissionError,
    )


@frappe.whitelist(allow_guest=False)
def update_crm_member_profile(
    user_id,
    first_name=None,
    last_name=None,
    mobile_no=None,
    role_profile_name=None,
):
    """Admin-only profile update endpoint for My Team edit flow."""
    _require_admin_access()

    if not user_id:
        frappe.throw("User ID is required.")

    if not frappe.db.exists("User", user_id):
        frappe.throw(f"User '{user_id}' does not exist.")

    first_name = (first_name or "").strip()
    last_name = (last_name or "").strip()
    mobile_no = (mobile_no or "").strip()
    role_profile_name = (role_profile_name or "").strip()

    if not first_name or len(first_name) < 2:
        frappe.throw("First Name is required and must be at least 2 characters.")

    if role_profile_name not in ALLOWED_ROLE_PROFILES:
        frappe.throw("Invalid designation selected.")

    if mobile_no and (not mobile_no.isdigit() or len(mobile_no) != 10):
        frappe.throw("Mobile Number must be exactly 10 digits.")

    user_doc = frappe.get_doc("User", user_id)
    user_doc.first_name = first_name
    user_doc.last_name = last_name
    user_doc.mobile_no = mobile_no
    user_doc.role_profile_name = role_profile_name
    user_doc.save(ignore_permissions=True)

    crm_user_name = frappe.db.exists("CRM Users", {"email": user_doc.email})
    if crm_user_name:
        crm_user_doc = frappe.get_doc("CRM Users", crm_user_name)
        crm_user_doc.first_name = first_name
        crm_user_doc.last_name = last_name
        crm_user_doc.full_name = " ".join(filter(None, [first_name, last_name]))
        crm_user_doc.mobile_no = mobile_no
        crm_user_doc.nirmaan_role_name = role_profile_name
        crm_user_doc.save(ignore_permissions=True)

    return {
        "status": "success",
        "message": f"Updated profile for '{user_id}'.",
    }
