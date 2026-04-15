# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
from frappe.utils import cint

class CRMBOQ(Document):
	def validate(self):
		self._lock_create_bcs_once_enabled()

		if self.boq_status in ["Won", "Lost"]:
			self.deal_status = "Cold"

	def before_insert(self):
		if not (getattr(self, "city", None) or "").strip():
			frappe.throw("City is required.")

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
		packages = self._get_selected_packages()
		if not packages:
			return

		should_create_bcs = cint(getattr(self, "create_bcs", 0)) == 1

		for package_name in packages:
			# Route to the package's specific lead, if configured in CRM BOQ Package.
			# If the package is custom (not found) or has no lead configured, it remains unassigned.
			package_lead = frappe.db.get_value("CRM BOQ Package", package_name, "assigned_lead")
			assigned_to = package_lead if package_lead else None

			# BOQ estimation rows are always created for package-based projects.
			self._create_project_estimation_if_missing(package_name, "BOQ", assigned_to)

			# BCS rows are created only when explicitly enabled from project create/edit flow.
			if should_create_bcs:
				self._create_project_estimation_if_missing(package_name, "BCS", assigned_to)

	def _get_selected_packages(self):
		raw_packages = getattr(self, "boq_type", None)
		if not raw_packages:
			return []

		try:
			packages = json.loads(raw_packages)
			if not isinstance(packages, list):
				packages = [packages]
		except Exception:
			cleaned_raw = str(raw_packages or "").strip()
			# Backward compatibility for legacy values stored as comma-separated text.
			if "," in cleaned_raw:
				packages = [item.strip() for item in cleaned_raw.split(",")]
			else:
				packages = [cleaned_raw]

		normalized_packages = []
		for package_name in packages:
			name = (str(package_name or "")).strip()
			if name and name not in normalized_packages:
				normalized_packages.append(name)

		return normalized_packages

	def _create_project_estimation_if_missing(self, package_name, document_type, assigned_to=None):
		if frappe.db.exists(
			"CRM Project Estimation",
			{
				"parent_project": self.name,
				"document_type": document_type,
				"package_name": package_name,
			},
		):
			return

		doc = frappe.get_doc(
			{
				"doctype": "CRM Project Estimation",
				"title": f"{self.name} - {package_name} {document_type}",
				"parent_project": self.name,
				"document_type": document_type,
				"package_name": package_name,
				"deadline": getattr(self, "boq_submission_date", None),
				"assigned_to": assigned_to,
				"status": "New",
			}
		)
		doc.insert(ignore_permissions=True)

	def _lock_create_bcs_once_enabled(self):
		if self.is_new():
			return

		existing_toggle_value = cint(
			frappe.db.get_value(self.doctype, self.name, "create_bcs") or 0
		)
		has_existing_bcs_rows = bool(
			frappe.db.exists(
				"CRM Project Estimation",
				{"parent_project": self.name, "document_type": "BCS"},
			)
		)

		if existing_toggle_value == 1 or has_existing_bcs_rows:
			self.create_bcs = 1
