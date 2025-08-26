# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CRMCompany(Document):
	def validate(self):
		user = frappe.session.user
		roles = frappe.get_roles(user)
		if (user != "Administrator") or ("System Manager" not in roles):
			self.assigned_sales = self.owner
			# frappe.db.commit()
