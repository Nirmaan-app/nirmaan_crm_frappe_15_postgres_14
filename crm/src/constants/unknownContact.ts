// The single, global placeholder contact used when a company has no real
// contact yet. A task can be attached to it so it can still be logged; a
// backend hook (reassign_unknown_tasks) moves the task onto the real contact
// once one is created for the company.
//
// Must match UNKNOWN_CONTACT in
// nirmaan_crm/integrations/controllers/unknown_contact.py
export const UNKNOWN_CONTACT_ID = "unknown@nirmaan.app";

export const UNKNOWN_CONTACT_OPTION = {
  label: "Unknown",
  value: UNKNOWN_CONTACT_ID,
};
