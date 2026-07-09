# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class CRMCompany(Document):
	def before_insert(self):
		user = frappe.session.user
		if user == "Administrator":
			pass
		else:
			user_doc = frappe.get_doc("CRM Users", user)
			role_profile = user_doc.nirmaan_role_name
			if role_profile == "Nirmaan Sales User Profile":
				self.assigned_sales = self.owner
			else:
				pass

	def on_update(self):
		self._cascade_assigned_sales()

	def _cascade_assigned_sales(self):
		"""When the company's sales owner changes, hand every record that was
		assigned to the OLD owner over to the NEW owner.

		Covers CRM BOQ (Projects), CRM Task, and CRM Contacts — all of which
		carry their own `assigned_sales` and are permission-filtered by it. Each
		is matched by the company's `company` link AND `assigned_sales == old`,
		so only the previous owner's records are reassigned; records deliberately
		handed to someone else are left untouched.

		Uses `frappe.db.set_value` (a direct bulk UPDATE) rather than loading and
		saving each doc: this flips only `assigned_sales` without re-running
		`CRM BOQ.on_update` (estimation/status/value cascade) or `CRM Task.on_update`,
		and therefore cannot recurse back into this handler.
		"""
		before = self.get_doc_before_save()
		if not before:
			return  # brand new insert — nothing to cascade from

		old = (before.assigned_sales or "").strip()
		new = (self.assigned_sales or "").strip()
		if old == new:
			return  # assigned_sales unchanged — no-op on unrelated edits

		if not old:
			return  # no previous owner to hand over from

		# Targeted reassignment: only records currently owned by the previous
		# sales user (within this company) move to the new owner.
		for doctype in ("CRM BOQ", "CRM Task", "CRM Contacts"):
			frappe.db.set_value(
				doctype,
				{"company": self.name, "assigned_sales": old},
				"assigned_sales",
				new,
				update_modified=False,
			)


