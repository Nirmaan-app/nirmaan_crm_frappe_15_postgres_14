# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CRMBOQ(Document):
	def before_insert(self):
		user = frappe.session.user
		user_doc = frappe.get_doc("CRM Users", user)
		role_profile = user_doc.nirmaan_role_name
		if role_profile == "Nirmaan Sales User Profile":
			self.assigned_sales = self.owner
		if role_profile == "Nirmaan Estimations User Profile":
			self.assigned_estimations = self.owner
