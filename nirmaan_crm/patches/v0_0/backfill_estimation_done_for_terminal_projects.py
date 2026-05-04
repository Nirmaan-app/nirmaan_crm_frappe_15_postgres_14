# Copyright (c) 2026, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe


def execute():
	"""Backfill status='Done' on all CRM Project Estimation rows whose parent
	CRM BOQ is in {Won, Lost, Dropped}. Preserves the `modified` timestamp
	(intentional: this is retroactive data alignment, not a user edit).
	Idempotent: rerunning the patch is a no-op once data is aligned.

	DB-agnostic implementation — uses frappe.db.set_value rather than a raw
	JOIN UPDATE, which Postgres doesn't support in MySQL syntax.
	"""
	terminal_projects = frappe.get_all(
		"CRM BOQ",
		filters={"boq_status": ["in", ["Won", "Lost", "Dropped"]]},
		pluck="name",
	)
	if not terminal_projects:
		return

	targets = frappe.get_all(
		"CRM Project Estimation",
		filters={
			"parent_project": ["in", terminal_projects],
			"status": ["not in", ["Done", "Not Applicable"]],
		},
		pluck="name",
	)

	for name in targets:
		frappe.db.set_value(
			"CRM Project Estimation",
			name,
			"status",
			"Done",
			update_modified=False,
		)

	frappe.db.commit()
