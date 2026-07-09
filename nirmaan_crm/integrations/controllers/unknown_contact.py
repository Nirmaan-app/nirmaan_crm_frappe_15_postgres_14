# The single, global placeholder contact used when a company has no real
# contact yet. Tasks can be attached to it so they can still be logged; a user
# later resolves it to a real contact from the task-update dialog in the
# frontend, which creates the contact and repoints the task's `contact` field.
#
# Keep this value in sync with UNKNOWN_CONTACT_ID in
# crm/src/constants/unknownContact.ts
UNKNOWN_CONTACT = "unknown@nirmaan.app"
