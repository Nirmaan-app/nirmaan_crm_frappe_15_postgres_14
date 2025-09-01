import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/store/dialogStore";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { SquarePen } from "lucide-react";
import { Link } from "react-router-dom";
import { FileLink } from "@/components/common/FileLink";

interface ContactDetailsCardProps {
    contact: CRMContacts;
    company: CRMCompany;
}

const DetailItem = ({ label, value, href }: { label: string, value: string | React.ReactNode, href?: string }) => {
    const content = href ? <a href={href} className="text-blue-600 underline">{value}</a> : <p className="font-semibold">{value}</p>;
    return (
        <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            {content}
        </div>
    );
};

export const ContactDetailsCard = ({ contact, company }: ContactDetailsCardProps) => {
    const { openEditContactDialog } = useDialogStore();
    
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
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <DetailItem label="Name" value={`${contact?.first_name || ''} ${contact?.last_name || ''}`} />
                    <DetailItem label="Contact Type" value={contact?.mobile?"Mobile":"Email"} /> {/* Static for now */}
                    <DetailItem label="Email" value={contact?.email} href={`mailto:${contact?.email}`} />
                    <DetailItem label="Phone Number" value={contact?.mobile} href={`tel:${contact?.mobile}`} />
                    {/* <DetailItem label="Visiting Card" value={contact?.visiting_card || 'N/A'} href={contact?.visiting_card} /> */}
                                        <div>
                        <p className="text-xs text-muted-foreground">Visiting Card</p>
                        <FileLink href={contact?.visiting_card} label="View Card" />
                    </div>

                     <DetailItem label="Assigned Sales" value={contact?.assigned_sales}  />

                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 border-t pt-4">
                    <DetailItem label="Company Name" value={company?.company_name} />
                    <DetailItem label="Location" value={company?.company_city} />
                    <DetailItem label="Department" value={contact?.department || 'N/A'} />
                    <DetailItem label="Designation" value={contact?.designation || 'N/A'} />
                </div>
            </div>
        </div>
    );
};