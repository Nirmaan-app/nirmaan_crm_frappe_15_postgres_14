import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { SquarePen } from "lucide-react";
import { Link } from "react-router-dom";
import { FileLink } from "@/components/common/FileLink";
import {useUserRoleLists} from "@/hooks/useUserRoleLists"
import { toast } from "@/hooks/use-toast"; // Added toast for error handling


interface ContactDetailsCardProps {
    contact: CRMContacts;
    company: CRMCompany;
}


const DetailDisplayItem = ({ label, value, href, onEditClick, className }: {
    label: string,
    value: string | React.ReactNode,
    href?: string,
    onEditClick?: () => void,
    className?: string
}) => {
    const isNA = value === 'N/A';

    let mainContent: React.ReactNode;

    if (isNA) {
        mainContent = <p className="font-semibold">{value}</p>;
    } else if (href) {
        // --- CRITICAL CHANGE: Use <Link> for internal paths, <a> for external ---
        if (href.startsWith('/') || href.startsWith('.')) { // Check for internal paths
            mainContent = (
                <Link to={href} className="text-blue-600 underline font-semibold">
                    {value}
                </Link>
            );
        } else { // Assume external (mailto, tel, http, https)
            mainContent = (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">
                    {value}
                </a>
            );
        }
    } else {
        mainContent = <p className="font-semibold">{value}</p>;
    }

    

    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2"> {/* Flex container for value and icon */}
                {mainContent}
                {/* Conditionally render the edit icon */}
                {onEditClick && !isNA && ( // Show icon only if onEditClick is provided and value is not "N/A"
                    <Button
                        variant="ghost" // Subtle button style
                        size="icon"     // Small, icon-only size
                        className="h-6 w-6 text-muted-foreground hover:text-primary" // Adjust size/color
                        onClick={onEditClick}
                        aria-label={`Edit ${label}`} // Accessibility
                    >
                        <SquarePen className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>
        </div>
    );
};


export const ContactDetailsCard = ({ contact, company }: ContactDetailsCardProps) => {
    // Destructure openEditContactDialog and openRenameContactNameDialog
    const { openEditContactDialog, openRenameContactNameDialog } = useDialogStore();
    const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();
    
    // Handler for the Email rename/edit icon click
    const handleRenameContactEmailClick = () => {
        if (contact?.name) { // Assuming contact.name is the email ID for CRM Contacts
            openRenameContactNameDialog({
                currentDoctype: "CRM Contacts",
                currentDocName: contact.name, // Pass the contact's name (email)
            });
        } else {
            toast({ title: "Error", description: "Contact ID (email) is missing.", variant: "destructive" });
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Contact Details</h2>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditContactDialog({ contactData: contact })}>
                    <SquarePen className="w-4 h-4 mr-2" />
                    EDIT
                </Button>
            </div>

            <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
                <div className="grid grid-cols-2 gap-y-4 gap-x-20">
                    <DetailDisplayItem label="Name" value={`${contact?.first_name || ''} ${contact?.last_name || ''}`} />
                    <DetailDisplayItem label="Contact Type" value={contact?.mobile?"Mobile":"Email"} />
                    
                    {/* --- ADDED EDIT ICON FOR EMAIL --- */}
                    <DetailDisplayItem
                        label="Email"
                        value={contact?.email || 'N/A'} // Ensure 'N/A' if null/undefined
                        href={contact?.email ? `mailto:${contact.email}` : undefined} // Only provide href if email exists
                        onEditClick={handleRenameContactEmailClick} // Pass the click handler
                    />
                    
                    <DetailDisplayItem label="Phone Number" value={contact?.mobile || 'N/A'} href={contact?.mobile ? `tel:${contact.mobile}` : undefined} />
                                        <div>
                        <p className="text-xs text-muted-foreground">Visiting Card</p>
                        <FileLink href={contact?.visiting_card} label="View Card" />
                    </div>

                     <DetailDisplayItem label="Assigned Sales" value={getUserFullNameByEmail(contact?.assigned_sales)||"--"}  />

                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-20 border-t pt-4">
                    <DetailDisplayItem label="Company Name" value={company?.company_name || 'N/A'} href={company?.name ? `/companies/company?id=${company.name}` : undefined} />
                    <DetailDisplayItem label="Location" value={company?.company_city || 'N/A'} />
                    <DetailDisplayItem label="Department" value={contact?.department || 'N/A'} />
                    <DetailDisplayItem label="Designation" value={contact?.designation || 'N/A'} />
                </div>
            </div>
        </div>
    );
};

// import { Button } from "@/components/ui/button";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { SquarePen } from "lucide-react";
// import { Link } from "react-router-dom";
// import { FileLink } from "@/components/common/FileLink";
// import {useUserRoleLists} from "@/hooks/useUserRoleLists"


// interface ContactDetailsCardProps {
//     contact: CRMContacts;
//     company: CRMCompany;
// }

// const DetailItem = ({ label, value, href }: { label: string, value: string | React.ReactNode, href?: string }) => {
//     const content = href ? <a href={href} className="text-blue-600 underline">{value}</a> : <p className="font-semibold">{value}</p>;
//     return (
//         <div>
//             <p className="text-xs text-muted-foreground">{label}</p>
//             {content}
//         </div>
//     );
// };

// export const ContactDetailsCard = ({ contact, company }: ContactDetailsCardProps) => {
//     const { openEditContactDialog } = useDialogStore();
//       const { getUserFullNameByEmail, isLoading: usersLoading } = useUserRoleLists();
    
    
//     return (
//         <div>
//             <div className="flex justify-between items-center mb-2">
//                 <h2 className="text-lg font-semibold">Contact Details</h2>
//                 <Button variant="ghost" size="sm" className="text-destructive" onClick={() => openEditContactDialog({ contactData: contact })}>
//                     <SquarePen className="w-4 h-4 mr-2" />
//                     EDIT
//                 </Button>
//             </div>

//             <div className="bg-background p-4 rounded-lg border shadow-sm space-y-4">
//                 <div className="grid grid-cols-2 gap-y-4 gap-x-20">
//                     <DetailItem label="Name" value={`${contact?.first_name || ''} ${contact?.last_name || ''}`} />
//                     <DetailItem label="Contact Type" value={contact?.mobile?"Mobile":"Email"} /> {/* Static for now */}
//                     <DetailItem label="Email" value={contact?.email} href={`mailto:${contact?.email}`} />
//                     <DetailItem label="Phone Number" value={contact?.mobile} href={`tel:${contact?.mobile}`} />
//                     {/* <DetailItem label="Visiting Card" value={contact?.visiting_card || 'N/A'} href={contact?.visiting_card} /> */}
//                                         <div>
//                         <p className="text-xs text-muted-foreground">Visiting Card</p>
//                         <FileLink href={contact?.visiting_card} label="View Card" />
//                     </div>

//                      <DetailItem label="Assigned Sales" value={getUserFullNameByEmail(contact?.assigned_sales)||"--"}  />

//                 </div>
//                 <div className="grid grid-cols-2 gap-y-4 gap-x-20 border-t pt-4">
//                     <DetailItem label="Company Name" value={company?.company_name} />
//                     <DetailItem label="Location" value={company?.company_city} />
//                     <DetailItem label="Department" value={contact?.department || 'N/A'} />
//                     <DetailItem label="Designation" value={contact?.designation || 'N/A'} />
//                 </div>
//             </div>
//         </div>
//     );
// };