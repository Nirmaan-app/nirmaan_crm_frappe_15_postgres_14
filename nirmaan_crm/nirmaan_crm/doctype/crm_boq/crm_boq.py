# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document

class CRMBOQ(Document):
	def validate(self):
		if self.boq_status in ["Won", "Lost"]:
			self.deal_status = "Cold"

	def before_insert(self):
		user = frappe.session.user
		if user == "Administrator":
			pass
		else:
			user_doc = frappe.get_doc("CRM Users", user)
			role_profile = user_doc.nirmaan_role_name
			if role_profile == "Nirmaan Sales User Profile":
				self.assigned_sales = self.owner
			elif role_profile == "Nirmaan Estimations User Profile":
				self.assigned_estimations = self.owner
			else:
				pass

	def on_update(self):
		if getattr(self, "boq_type", None):
			try:
				packages = json.loads(self.boq_type)
				if not isinstance(packages, list):
					packages = [self.boq_type]
			except Exception:
				packages = [self.boq_type] if self.boq_type else []

			for pkg in packages:
				# Check if BOQ exists for this package
				if not frappe.db.exists("CRM Project Estimation", {"parent_project": self.name, "document_type": "BOQ", "package_name": pkg}):
					doc = frappe.get_doc({
						"doctype": "CRM Project Estimation",
						"title": f"{self.name} - {pkg} BOQ",
						"parent_project": self.name,
						"document_type": "BOQ",
						"package_name": pkg,
						"deadline": getattr(self, "boq_submission_date", None),
						"status": "New"
					})
					doc.insert(ignore_permissions=True)
				
				# Check if BCS exists for this package
				if not frappe.db.exists("CRM Project Estimation", {"parent_project": self.name, "document_type": "BCS", "package_name": pkg}):
					doc = frappe.get_doc({
						"doctype": "CRM Project Estimation",
						"title": f"{self.name} - {pkg} BCS",
						"parent_project": self.name,
						"document_type": "BCS",
						"package_name": pkg,
						"deadline": getattr(self, "boq_submission_date", None),
						"status": "New"
					})
					doc.insert(ignore_permissions=True)
