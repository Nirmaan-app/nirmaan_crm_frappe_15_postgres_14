# Copyright (c) 2026, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CRMProjectEstimation(Document):
	def validate(self):
		self._validate_status_based_value_requirement()

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
