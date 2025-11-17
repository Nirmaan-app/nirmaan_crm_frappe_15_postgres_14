import frappe
from frappe.utils import getdate, now_datetime


def execute():
    """
    Patch to update the last_meeting field for CRM Company and CRM Contacts
    based on completed "In Person Meeting" tasks only.

    This patch corrects historical data where last_meeting was previously set
    for all task types, but should only be set for "In Person Meeting" tasks.
    """

    frappe.db.commit()  # Commit any pending transactions before starting

    print("\n" + "="*80)
    print("PATCH: Update last_meeting for Contacts and Companies")
    print("="*80 + "\n")

    try:
        # Update companies
        update_companies()

        # Update contacts
        update_contacts()

        frappe.db.commit()
        print("\n[SUCCESS] All updates committed successfully!")

    except Exception as e:
        frappe.db.rollback()
        print(f"\n[ERROR] {str(e)}")
        frappe.log_error(frappe.get_traceback(), "Last Meeting Patch Error")
        raise


def update_companies():
    """Update last_meeting field for all CRM Companies"""

    print("\n--- Processing CRM Companies ---\n")

    # Get all companies
    all_companies = frappe.get_all("CRM Company", fields=["name", "last_meeting"])

    companies_to_update = []
    companies_to_clear = []
    companies_no_change = []

    for company in all_companies:
        company_name = company.name
        current_last_meeting = company.last_meeting

        # Get the most recent completed "In Person Meeting" for this company
        latest_meeting = get_latest_in_person_meeting(
            doctype="CRM Task",
            link_field="company",
            link_value=company_name
        )

        if latest_meeting:
            # We have a valid in-person meeting
            new_last_meeting = latest_meeting.get("start_date")

            # Validate the date is not in the future
            if new_last_meeting and getdate(new_last_meeting) > getdate(now_datetime()):
                print(f"  [WARNING] Skipping {company_name}: start_date {new_last_meeting} is in the future")
                continue

            if current_last_meeting != new_last_meeting:
                companies_to_update.append({
                    "name": company_name,
                    "old_value": current_last_meeting,
                    "new_value": new_last_meeting
                })
            else:
                companies_no_change.append(company_name)
        else:
            # No in-person meetings found
            if current_last_meeting:
                companies_to_clear.append({
                    "name": company_name,
                    "old_value": current_last_meeting
                })
            else:
                companies_no_change.append(company_name)

    # Print summary
    print(f"Total companies analyzed: {len(all_companies)}")
    print(f"  - To update: {len(companies_to_update)}")
    print(f"  - To clear: {len(companies_to_clear)}")
    print(f"  - No change needed: {len(companies_no_change)}\n")

    # Show details for companies to update
    if companies_to_update:
        print("Companies to UPDATE:")
        for item in companies_to_update[:10]:  # Show first 10
            print(f"  - {item['name']}: {item['old_value']} -> {item['new_value']}")
        if len(companies_to_update) > 10:
            print(f"  ... and {len(companies_to_update) - 10} more")
        print()

    # Show details for companies to clear
    if companies_to_clear:
        print("Companies to CLEAR (no in-person meetings):")
        for item in companies_to_clear[:10]:  # Show first 10
            print(f"  - {item['name']}: {item['old_value']} -> None")
        if len(companies_to_clear) > 10:
            print(f"  ... and {len(companies_to_clear) - 10} more")
        print()

    # Perform updates
    for item in companies_to_update:
        try:
            frappe.db.set_value(
                "CRM Company",
                item["name"],
                "last_meeting",
                item["new_value"],
                update_modified=False
            )
        except Exception as e:
            print(f"  [ERROR] Error updating {item['name']}: {str(e)}")

    # Clear companies with no in-person meetings
    for item in companies_to_clear:
        try:
            frappe.db.set_value(
                "CRM Company",
                item["name"],
                "last_meeting",
                None,
                update_modified=False
            )
        except Exception as e:
            print(f"  [ERROR] Error clearing {item['name']}: {str(e)}")

    print(f"[SUCCESS] Updated {len(companies_to_update)} companies")
    print(f"[SUCCESS] Cleared {len(companies_to_clear)} companies")


def update_contacts():
    """Update last_meeting field for all CRM Contacts"""

    print("\n--- Processing CRM Contacts ---\n")

    # Get all contacts
    all_contacts = frappe.get_all("CRM Contacts", fields=["name", "last_meeting"])

    contacts_to_update = []
    contacts_to_clear = []
    contacts_no_change = []

    for contact in all_contacts:
        contact_name = contact.name
        current_last_meeting = contact.last_meeting

        # Get the most recent completed "In Person Meeting" for this contact
        latest_meeting = get_latest_in_person_meeting(
            doctype="CRM Task",
            link_field="contact",
            link_value=contact_name
        )

        if latest_meeting:
            # We have a valid in-person meeting
            new_last_meeting = latest_meeting.get("start_date")

            # Validate the date is not in the future
            if new_last_meeting and getdate(new_last_meeting) > getdate(now_datetime()):
                print(f"  [WARNING] Skipping {contact_name}: start_date {new_last_meeting} is in the future")
                continue

            if current_last_meeting != new_last_meeting:
                contacts_to_update.append({
                    "name": contact_name,
                    "old_value": current_last_meeting,
                    "new_value": new_last_meeting
                })
            else:
                contacts_no_change.append(contact_name)
        else:
            # No in-person meetings found
            if current_last_meeting:
                contacts_to_clear.append({
                    "name": contact_name,
                    "old_value": current_last_meeting
                })
            else:
                contacts_no_change.append(contact_name)

    # Print summary
    print(f"Total contacts analyzed: {len(all_contacts)}")
    print(f"  - To update: {len(contacts_to_update)}")
    print(f"  - To clear: {len(contacts_to_clear)}")
    print(f"  - No change needed: {len(contacts_no_change)}\n")

    # Show details for contacts to update
    if contacts_to_update:
        print("Contacts to UPDATE:")
        for item in contacts_to_update[:10]:  # Show first 10
            print(f"  - {item['name']}: {item['old_value']} -> {item['new_value']}")
        if len(contacts_to_update) > 10:
            print(f"  ... and {len(contacts_to_update) - 10} more")
        print()

    # Show details for contacts to clear
    if contacts_to_clear:
        print("Contacts to CLEAR (no in-person meetings):")
        for item in contacts_to_clear[:10]:  # Show first 10
            print(f"  - {item['name']}: {item['old_value']} -> None")
        if len(contacts_to_clear) > 10:
            print(f"  ... and {len(contacts_to_clear) - 10} more")
        print()

    # Perform updates
    for item in contacts_to_update:
        try:
            frappe.db.set_value(
                "CRM Contacts",
                item["name"],
                "last_meeting",
                item["new_value"],
                update_modified=False
            )
        except Exception as e:
            print(f"  [ERROR] Error updating {item['name']}: {str(e)}")

    # Clear contacts with no in-person meetings
    for item in contacts_to_clear:
        try:
            frappe.db.set_value(
                "CRM Contacts",
                item["name"],
                "last_meeting",
                None,
                update_modified=False
            )
        except Exception as e:
            print(f"  [ERROR] Error clearing {item['name']}: {str(e)}")

    print(f"[SUCCESS] Updated {len(contacts_to_update)} contacts")
    print(f"[SUCCESS] Cleared {len(contacts_to_clear)} contacts")


def get_latest_in_person_meeting(doctype, link_field, link_value):
    """
    Get the most recent completed "In Person Meeting" task for a given company/contact

    Args:
        doctype: "CRM Task"
        link_field: "company" or "contact"
        link_value: The name of the company or contact

    Returns:
        dict: The latest task record with start_date, or None if no tasks found
    """

    # Build filters without the problematic date filter
    filters = {
        link_field: link_value,
        "type": "In Person Meeting",
        "status": "Completed"
    }

    # Get all completed in-person meetings, sorted by start_date
    tasks = frappe.get_all(
        doctype,
        filters=filters,
        fields=["name", "start_date"],
        order_by="start_date desc"
    )

    # Filter out tasks without a valid start_date and return the first one
    for task in tasks:
        if task.get("start_date"):
            return task

    return None
