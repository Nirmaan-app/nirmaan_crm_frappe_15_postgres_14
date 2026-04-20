# Copyright (c) 2025, Abhishek Kumar and contributors
# For license information, please see license.txt

import frappe
import json
from frappe.model.document import Document
from frappe.utils import cint

LOCK_STATUSES = {"Won", "Lost", "Dropped", "Hold", "Negotiation"}

# Estimation status tokens — lowercased for case-insensitive comparison
EST_NEW = "new"
EST_IN_PROGRESS = "in-progress"
EST_REVISION_PENDING = "revision pending"
EST_BOQ_SUBMITTED = "boq submitted"
EST_PARTIAL_SUBMITTED = "partial boq submitted"
EST_REVISION_SUBMITTED = "revision submitted"

PROGRESS_BUCKET = {EST_NEW, EST_IN_PROGRESS, EST_REVISION_PENDING}
SUBMITTED_ANY = {EST_BOQ_SUBMITTED, EST_PARTIAL_SUBMITTED, EST_REVISION_SUBMITTED}
SUBMITTED_FULL = {EST_BOQ_SUBMITTED, EST_REVISION_SUBMITTED}


class CRMBOQ(Document):
	def validate(self):
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

		# Cleanup tasks for removed packages first
		self._cleanup_removed_package_tasks(packages)

		if packages:
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

		# Task A: Cascade boq_submission_date to all child estimations when opted in.
		self._cascade_deadline_to_children()

		# Task B: When create_bcs toggled 1 -> 0, hard-delete existing BCS estimation rows.
		self._cleanup_bcs_rows_on_toggle_off()

		# Cascade: re-derive status from current estimation state.
		# Handles lock-exit (manual status change to non-lock) and post-deletion re-derivation.
		recompute_parent_project_status(self.name)

	def _cascade_deadline_to_children(self):
		"""Overwrite `deadline` on every child CRM Project Estimation when BOQ submission date changes.

		Opt-in via transient field `cascade_deadline` on the in-memory doc, or
		`self.flags.cascade_deadline_to_children`. Silently skipped otherwise for
		backwards compatibility.
		"""
		opt_in = bool(getattr(self, "cascade_deadline", None)) or bool(
			getattr(self.flags, "cascade_deadline_to_children", False)
		)
		if not opt_in:
			return

		before = self.get_doc_before_save()
		if not before:
			return

		def _norm(val):
			# Treat "", None, and other falsy-date inputs uniformly as None so Postgres
			# never receives '' for a Date column.
			if val in (None, "", "None"):
				return None
			return val

		prev_deadline = _norm(getattr(before, "boq_submission_date", None))
		new_deadline = _norm(getattr(self, "boq_submission_date", None))
		if prev_deadline == new_deadline:
			return

		child_names = frappe.get_all(
			"CRM Project Estimation",
			filters={"parent_project": self.name},
			pluck="name",
		)
		for child_name in child_names:
			frappe.db.set_value(
				"CRM Project Estimation",
				child_name,
				"deadline",
				new_deadline,
				update_modified=True,
			)

	def _cleanup_bcs_rows_on_toggle_off(self):
		"""Hard-delete all BCS estimation rows when create_bcs transitions 1 -> 0."""
		before = self.get_doc_before_save()
		if not before:
			return

		prev_toggle = cint(getattr(before, "create_bcs", 0))
		current_toggle = cint(getattr(self, "create_bcs", 0))
		if not (prev_toggle == 1 and current_toggle == 0):
			return

		frappe.db.delete(
			"CRM Project Estimation",
			{"parent_project": self.name, "document_type": "BCS"},
		)

	def on_trash(self):
		"""Cleanup all associated tasks when the project is deleted."""
		frappe.db.delete("CRM Project Estimation", {"parent_project": self.name})

	def _cleanup_removed_package_tasks(self, current_packages):
		"""Deletes all Project Estimation (BOQ/BCS) tasks for packages that are no longer selected."""
		if self.is_new():
			return

		existing_tasks = frappe.get_all(
			"CRM Project Estimation",
			filters={"parent_project": self.name},
			fields=["name", "package_name"]
		)
		
		for task in existing_tasks:
			# If the package_name of the task is not in the current selection, delete it
			if task.package_name not in current_packages:
				frappe.delete_doc("CRM Project Estimation", task.name, ignore_permissions=True)

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

def recompute_parent_project_status(project_name):
	"""Re-derive CRM BOQ.boq_status from sibling BOQ-type Project Estimations.

	Skipped if parent is in LOCK_STATUSES (manual deal outcomes are sticky).
	Writes a Version record directly when the status transitions so the change
	surfaces in BoqSubmissionHistory UI (frappe.db.set_value alone bypasses the
	save() lifecycle and therefore does not create a Version).
	"""
	if not project_name or not frappe.db.exists("CRM BOQ", project_name):
		return

	current_status = frappe.db.get_value("CRM BOQ", project_name, "boq_status")
	if current_status in LOCK_STATUSES:
		return

	sibling_statuses = frappe.get_all(
		"CRM Project Estimation",
		filters={"parent_project": project_name, "document_type": "BOQ"},
		pluck="status",
	)
	if not sibling_statuses:
		return

	normalized = [s.strip().lower() for s in sibling_statuses if s]
	derived = _derive_status(normalized)

	if derived and derived != current_status:
		frappe.db.set_value(
			"CRM BOQ", project_name, "boq_status", derived,
			update_modified=True,
		)
		_log_auto_status_version(project_name, current_status, derived)


def _log_auto_status_version(project_name, old_status, new_status):
	"""Insert a Frappe Version row shaped like the UI expects, with an auto marker."""
	try:
		version_doc = frappe.new_doc("Version")
		version_doc.ref_doctype = "CRM BOQ"
		version_doc.docname = project_name
		version_doc.data = json.dumps({
			"changed": [["boq_status", old_status or "", new_status]],
			"auto_derived": True,
		})
		version_doc.insert(ignore_permissions=True)
	except Exception:
		frappe.log_error(
			title="CRM BOQ auto-status Version log failed",
			message=frappe.get_traceback(),
		)


def _derive_status(statuses):
	"""Pure derivation function — no Frappe context needed. Order matters."""
	if all(s == EST_NEW for s in statuses):
		return "New"
	if all(s in SUBMITTED_FULL for s in statuses):
		return "Submitted"
	if any(s in SUBMITTED_ANY for s in statuses):
		return "Partially Submitted"
	if all(s in PROGRESS_BUCKET for s in statuses):
		return "In-Progress"
	return None
