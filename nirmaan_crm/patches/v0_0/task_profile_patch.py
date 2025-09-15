import frappe
import json
from frappe.utils import getdate

def execute():
    tasks = frappe.get_all(
        "CRM Task",
        fields=["name"],
        filters={"task_profile": ""}
    )

    for task in tasks:
        task_doc = frappe.get_doc("CRM Task", task.name)
        task_doc.task_profile = "Sales"
        task_doc.save(ignore_permissions=True)