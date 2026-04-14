import json
import re

import frappe


LEGACY_PACKAGE_NAME = "Legacy"

PROJECT_STATUS_ALIASES = {
    "IN PROGRESS": "In-Progress",
    "IN-PROGRESS": "In-Progress",
    "ON HOLD": "Hold",
    "HOLD": "Hold",
}

DETAILED_TO_PROJECT_STATUS = {
    "BOQ SUBMITTED": "In-Progress",
    "PARTIAL BOQ SUBMITTED": "In-Progress",
    "REVISION SUBMITTED": "In-Progress",
    "REVISION PENDING": "In-Progress",
    "REVIEW PENDING": "In-Progress",
    "PENDING": "In-Progress",
    "COMPLETED": "In-Progress",
}

PROJECT_LEVEL_STATUSES_FOR_BOQ_SUBMITTED = {
    "LOST",
    "DROPPED",
    "WON",
    "HOLD",
    "ON HOLD",
    "NEGOTIATION",
}

KNOWN_PACKAGE_LABELS = [
    ("HVAC VRF-DX", "HVAC VRF-DX"),
    ("HVAC DUCTING", "HVAC Ducting"),
    ("FIRE FIGHTING", "FIRE FIGHTING"),
    ("FIRE SYSTEM", "Fire System"),
    ("ELECTRICAL", "Electrical"),
    ("HVAC", "HVAC"),
    ("ELV", "ELV"),
    ("BMS", "BMS"),
    ("FAPA", "FAPA"),
    ("MEP", "MEP"),
    ("CUSTOM", "custom"),
]


def _clean_text(value):
    return (value or "").strip()


def _dedupe_preserve_order(values):
    deduped = []
    seen = set()
    for value in values:
        cleaned = _clean_text(value)
        if not cleaned or cleaned in seen:
            continue
        deduped.append(cleaned)
        seen.add(cleaned)
    return deduped


def _normalize_crm_user_link(user_value):
    cleaned = _clean_text(user_value)
    if not cleaned:
        return None

    normalized = cleaned.lower()
    if frappe.db.exists("CRM Users", normalized):
        return normalized

    return None


def normalize_project_status(value):
    cleaned = _clean_text(value)
    if not cleaned:
        return "New"

    upper_value = cleaned.upper()
    if upper_value in PROJECT_STATUS_ALIASES:
        return PROJECT_STATUS_ALIASES[upper_value]
    if upper_value in DETAILED_TO_PROJECT_STATUS:
        return DETAILED_TO_PROJECT_STATUS[upper_value]

    return cleaned


def normalize_boq_estimation_status(value):
    cleaned = _clean_text(value)
    if not cleaned:
        return "New"

    upper_value = cleaned.upper()
    if upper_value in PROJECT_LEVEL_STATUSES_FOR_BOQ_SUBMITTED:
        # These are project-level outcomes; migrated BOQ rows should stay at
        # BOQ-level status.
        return "BOQ Submitted"
    if upper_value in PROJECT_STATUS_ALIASES:
        return PROJECT_STATUS_ALIASES[upper_value]

    return cleaned


def normalize_bcs_status(value):
    cleaned = _clean_text(value)
    if not cleaned:
        return "Pending"

    title_value = cleaned.title()
    if title_value == "Review Pending":
        return "Review Pending"
    if title_value == "Completed":
        return "Completed"
    return "Pending"


def _match_known_packages(raw_value):
    upper_value = re.sub(r"[^A-Z0-9]+", " ", raw_value.upper()).strip()
    if not upper_value:
        return []

    remainder = f" {upper_value} "
    matches = []

    for alias, label in sorted(KNOWN_PACKAGE_LABELS, key=lambda item: len(item[0]), reverse=True):
        token = f" {alias} "
        while token in remainder:
            matches.append(label)
            remainder = remainder.replace(token, " ", 1)

    remainder = re.sub(r"\b(AND|OR)\b", " ", remainder)
    remainder = re.sub(r"\s+", " ", remainder).strip()

    if remainder:
        return []

    return _dedupe_preserve_order(matches)


def parse_project_packages(raw_value):
    cleaned = _clean_text(raw_value)
    if not cleaned or cleaned == "[]":
        return []

    if cleaned.startswith("["):
        try:
            parsed = json.loads(cleaned)
        except Exception:
            parsed = None

        if isinstance(parsed, list):
            return _dedupe_preserve_order(parsed)

    known_packages = _match_known_packages(cleaned)
    if known_packages:
        return known_packages

    split_packages = _dedupe_preserve_order(re.split(r"\s*,\s*|\s*&\s*", cleaned))
    if len(split_packages) > 1:
        return split_packages

    return [cleaned]


def _build_estimation_title(project_name, package_name, document_type):
    return f"{project_name} - {package_name} {document_type}"


def _coerce_float(value):
    cleaned = _clean_text(value).replace(",", "")
    if not cleaned:
        return 0.0
    try:
        return float(cleaned)
    except Exception:
        return 0.0


def _create_estimation_if_missing(project_doc, package_name, document_type, boq_value_for_package=0.0):
    existing = frappe.db.exists(
        "CRM Project Estimation",
        {
            "parent_project": project_doc.name,
            "document_type": document_type,
            "package_name": package_name,
        },
    )
    if existing:
        return False

    payload = {
        "doctype": "CRM Project Estimation",
        "title": _build_estimation_title(project_doc.name, package_name, document_type),
        "parent_project": project_doc.name,
        "document_type": document_type,
        "package_name": package_name,
        "assigned_to": _normalize_crm_user_link(getattr(project_doc, "assigned_estimations", None)),
        "deadline": getattr(project_doc, "boq_submission_date", None),
        "remarks": getattr(project_doc, "remarks", None),
    }

    if document_type == "BOQ":
        payload["status"] = normalize_boq_estimation_status(getattr(project_doc, "boq_status", None))
        payload["sub_status"] = _clean_text(getattr(project_doc, "boq_sub_status", None)) or None
        payload["value"] = boq_value_for_package
        payload["link"] = _clean_text(getattr(project_doc, "boq_link", None)) or None
    else:
        # Migration rule: all migrated BCS rows should start in Pending.
        payload["status"] = "Pending"
        payload["sub_status"] = None
        payload["value"] = None
        payload["link"] = None

    estimation_doc = frappe.get_doc(payload).insert(ignore_permissions=True)

    # Preserve legacy timeline in migrated rows so "Received On" reflects
    # the original project added date, not migration run date.
    timeline_updates = {}
    if getattr(project_doc, "creation", None):
        timeline_updates["creation"] = project_doc.creation
        timeline_updates["modified"] = project_doc.creation
    if getattr(project_doc, "owner", None):
        timeline_updates["owner"] = project_doc.owner
        timeline_updates["modified_by"] = project_doc.owner

    if timeline_updates:
        frappe.db.set_value(
            "CRM Project Estimation",
            estimation_doc.name,
            timeline_updates,
            update_modified=False,
        )

    return True


def execute():
    project_names = frappe.get_all("CRM BOQ", pluck="name")

    summary = {
        "projects_scanned": 0,
        "projects_with_legacy_package": 0,
        "boq_rows_created": 0,
        "bcs_rows_created": 0,
        "project_statuses_updated": 0,
        "project_packages_normalized": 0,
    }

    for index, project_name in enumerate(project_names, start=1):
        project_doc = frappe.get_doc("CRM BOQ", project_name)
        project_boq_value = _coerce_float(getattr(project_doc, "boq_value", None))

        parsed_packages = parse_project_packages(getattr(project_doc, "boq_type", None))
        normalized_boq_type = json.dumps(parsed_packages) if parsed_packages else "[]"
        if _clean_text(getattr(project_doc, "boq_type", None)) != normalized_boq_type:
            frappe.db.set_value(
                "CRM BOQ",
                project_doc.name,
                "boq_type",
                normalized_boq_type,
                update_modified=False,
            )
            summary["project_packages_normalized"] += 1

        if not parsed_packages:
            # Rule 3: No package in old data -> use Legacy BOQ/BCS.
            package_names = [LEGACY_PACKAGE_NAME]
        elif len(parsed_packages) == 1:
            # Rule 1: Single package in old data -> only that package BOQ/BCS.
            package_names = parsed_packages
        else:
            # Rule 2: Multiple packages in old data ->
            # create Legacy BOQ/BCS plus per-package BOQ/BCS.
            # Keep value in Legacy BOQ only; package BOQs get empty value.
            package_names = [LEGACY_PACKAGE_NAME] + [
                pkg for pkg in parsed_packages if _clean_text(pkg).lower() != LEGACY_PACKAGE_NAME.lower()
            ]

        package_names = _dedupe_preserve_order(package_names)
        if LEGACY_PACKAGE_NAME in package_names:
            summary["projects_with_legacy_package"] += 1

        for package_name in package_names:
            if package_name == LEGACY_PACKAGE_NAME:
                boq_value_for_package = project_boq_value
            elif len(parsed_packages) == 1:
                boq_value_for_package = project_boq_value
            else:
                boq_value_for_package = None

            if _create_estimation_if_missing(project_doc, package_name, "BOQ", boq_value_for_package=boq_value_for_package):
                summary["boq_rows_created"] += 1
            if _create_estimation_if_missing(project_doc, package_name, "BCS"):
                summary["bcs_rows_created"] += 1

        normalized_status = normalize_project_status(project_doc.boq_status)
        if normalized_status != project_doc.boq_status:
            frappe.db.set_value(
                "CRM BOQ",
                project_doc.name,
                "boq_status",
                normalized_status,
                update_modified=False,
            )
            summary["project_statuses_updated"] += 1

        summary["projects_scanned"] += 1
        if index % 100 == 0:
            frappe.db.commit()

    frappe.db.commit()

    print("\nLegacy BOQ -> Project Estimation migration summary")
    print(f"Projects scanned: {summary['projects_scanned']}")
    print(f"Projects with Legacy package: {summary['projects_with_legacy_package']}")
    print(f"BOQ rows created: {summary['boq_rows_created']}")
    print(f"BCS rows created: {summary['bcs_rows_created']}")
    print(f"Project statuses updated: {summary['project_statuses_updated']}")
    print(f"Project packages normalized: {summary['project_packages_normalized']}")
