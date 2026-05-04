# Copyright (c) 2026, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CRMProjectEstimation(Document):
	def validate(self):
		self._force_done_for_terminal_parent()
		self._validate_status_based_value_requirement()

	def _force_done_for_terminal_parent(self):
		"""When parent project is terminal (Won / Lost / Dropped), force `status='Done'`.

		Covers the edge case where a user adds an estimation row to a closed project —
		the row should auto-receive the closed-deal status without manual intervention.
		Runs before `_validate_status_based_value_requirement` so BCS-Done value-required
		validation still kicks in for new BCS rows on terminal parents.
		"""
		if self.status in {"Done", "Not Applicable"}:
			return
		if not self.parent_project:
			return
		parent_status = frappe.db.get_value("CRM BOQ", self.parent_project, "boq_status")
		if parent_status in {"Won", "Lost", "Dropped"}:
			self.status = "Done"

	def _validate_status_based_value_requirement(self):
		# Keep migration/new inserts backward-compatible; enforce on edit/update flow.
		if self.is_new():
			return

		document_type = (getattr(self, "document_type", "") or "").strip().upper()
		normalized_status = self._normalize_status(getattr(self, "status", None))

		is_value_required = (
			document_type == "BOQ"
			and normalized_status in {"boq submitted", "partial boq submitted", "revision submitted"}
		) or (
			document_type == "BCS"
			and normalized_status == "done"
		)

		if not is_value_required:
			return

		value = getattr(self, "value", None)
		value_float = self._coerce_float(value)
		if value_float is None or value_float <= 0:
			label = "BOQ" if document_type == "BOQ" else "BCS"
			frappe.throw(f'{label} Value is required and must be greater than 0 for "{self.status}" status.')

	def _normalize_status(self, status):
		return " ".join(str(status or "").lower().replace("_", " ").replace("-", " ").split())

	def _coerce_float(self, value):
		if value is None:
			return None
		if isinstance(value, str):
			cleaned = value.strip()
			if not cleaned:
				return None
		try:
			return float(value)
		except Exception:
			return None
