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
			role_profile = (user_doc.nirmaan_role_name or "").strip().lower()
			if role_profile in ["nirmaan sales user profile", "nirmaan sales user"]:
				self.assigned_sales = self.owner
			elif role_profile in [
				"nirmaan estimations user profile",
			]:
				# self.assigned_estimations = self.owner
				self.assigned_estimations = ""

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
				# Route to the package's specific lead, if configured in CRM BOQ Package
				# If the package is custom (not found) or has no lead configured, it will be None
				package_lead = frappe.db.get_value("CRM BOQ Package", pkg, "assigned_lead")
				pkg_assigned_to = package_lead if package_lead else None

				# Check if BOQ exists for this package
				if not frappe.db.exists("CRM Project Estimation", {"parent_project": self.name, "document_type": "BOQ", "package_name": pkg}):
					doc = frappe.get_doc({
						"doctype": "CRM Project Estimation",
						"title": f"{self.name} - {pkg} BOQ",
						"parent_project": self.name,
						"document_type": "BOQ",
						"package_name": pkg,
						"deadline": getattr(self, "boq_submission_date", None),
						"assigned_to": pkg_assigned_to,
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
						"assigned_to": pkg_assigned_to,
						"status": "New"
					})
					doc.insert(ignore_permissions=True)
