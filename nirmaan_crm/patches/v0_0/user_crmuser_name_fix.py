import frappe
from frappe.utils import cint 

# --- 1. CORRECTED COMPLEX NAME SPLITTING LOGIC ---

def split_full_name(full_name_field):
    """
    Splits a full name string into first_name and last_name with CORRECTED 
    logic for standard names (where no '=' rules apply).
    """
    
    # 1. Trim whitespace and split the name
    trimmed_name = full_name_field.strip()
    name_parts = trimmed_name.split()

    if not name_parts:
        return "", ""

    new_first_name = ""
    new_last_name = ""
    
    first_part = name_parts[0]
    eq_count = first_part.count('=')

    # A. Check if first index [0] has more than 1 equal sign
    if eq_count > 1:
        new_first_name = first_part
        new_last_name = " ".join(name_parts[1:])
        
    # B. Check if first index [0] has 1 or less than 1 equal sign (0 or 1)
    elif eq_count <= 1:
        # C. Check for the confusing Rule: 'and index[2] morn than 1 mean add that in first_name'
        if len(name_parts) > 2 and name_parts[2].count('=') > 1:
            new_first_name = name_parts[2]
            
            other_last_name_parts = [
                part for i, part in enumerate(name_parts) 
                if i != 2 and part
            ]
            new_last_name = " ".join(other_last_name_parts)
            
        else:
            # <<<--- THIS IS THE CORRECTED LOGIC BLOCK (Standaard Split) --->>>
            
            if len(name_parts) == 1:
                # Only one word
                new_first_name = name_parts[0]
                new_last_name = ""
            else:
                # Two or more words: First word is First Name, rest are Last Name
                new_first_name = name_parts[0] 
                new_last_name = " ".join(name_parts[1:]) 
            # <<<--- END OF CORRECTED LOGIC BLOCK --->>>

    return new_first_name.strip(), new_last_name.strip()


# --- 2. FRAPPE PATCH EXECUTION FUNCTION (Uses the corrected logic) ---

def execute():
    """
    Main function to execute the final, corrected data patch.
    This runs after the rollback to correctly split the full names.
    """
    
    doctypes_to_update = ['User', 'CRM Users'] # Using 'CRM User' as standard
    total_updated = 0
    
    print("Starting CORRECTED Name Split and Full Name Combination Patch...")

    for doctype in doctypes_to_update:
        print(f"Processing Doctype: {doctype}")
        
        # We assume the rollback has set 'first_name' to the full name string
        docs_to_update = frappe.get_list(
            doctype, 
            fields=['name', 'first_name', 'last_name', 'full_name']
        )
        
        updated_in_doctype = 0
        
        for doc_info in docs_to_update:
            doc_name = doc_info.get('name')
            current_full_name = doc_info.get('full_name') # This is the full string after rollback
            
            if not current_full_name:
                continue

            # 2. Apply the CORRECTED complex splitting logic
            new_fn, new_ln = split_full_name(current_full_name)
            
            # Construct the final full_name
            final_full_name = f"{new_fn} {new_ln}".strip()
            
            # Only update if the logic changed the name fields (not full_name)
            
            try:
                # 3. Update all three fields using frappe.db.set_value
                frappe.db.set_value(
                    doctype,
                    doc_name,
                    {
                        'first_name': new_fn,
                        'last_name': new_ln,
                        'full_name': final_full_name,
                    },
                    update_modified=False # Silent update
                )
                
                updated_in_doctype += 1
                
            except Exception as e:
                # Rollback current transaction on failure (as requested)
                frappe.db.rollback()
                frappe.log_error(
                    title=f"Failed to split and update names for {doctype}: {doc_name}", 
                    message=f"Rollback performed for failed doc. Error: {str(e)}"
                )
                # Continue to the next document
                continue

        total_updated += updated_in_doctype
        print(f"Completed {doctype}. Updated {updated_in_doctype} records.")

    frappe.db.commit()
    print(f"Correction Patch completed. Total {total_updated} records updated.")