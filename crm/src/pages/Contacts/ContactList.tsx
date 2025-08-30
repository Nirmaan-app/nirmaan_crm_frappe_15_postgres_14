// src/pages/Contacts/ContactList.tsx
import { AssignmentFilterControls } from "@/components/ui/AssignmentFilterControls";
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime12Hour,formatDateWithOrdinal } from "@/utils/FormatDate";


interface ContactListProps {
    onContactSelect?: (id: string) => void;
    activeContactId?: string | null;
}

const ContactListItem = ({ contact, onSelect, isActive }: { contact: EnrichedContact, onSelect: () => void, isActive: boolean }) => (
   <div
    role="button"
    aria-label={contact.full_name}
    onClick={onSelect}
    // `justify-between` will push the left and right groups apart
    className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
>
    {/* --- Left Group --- */}
    {/* This is the first flex item and will stay on the left. */}
    <div>
        <strong className="text-black text-md dark:text-muted-foreground">{contact.full_name}</strong>
        <p className="text-sm text-muted-foreground">{contact.company_name}</p>
    </div>

    {/* --- Right Group --- */}
    {/* 1. This new div wraps both the badge and the chevron.
           It becomes the second flex item and will be pushed to the right. */}
    <div className="flex items-center gap-4">
        
        {/* The "Last Meeting" badge */}
        {contact.last_meeting && (
            <div className="border p-2 rounded-md text-center">
                <p className="text-[8px] text-muted-foreground">
                    Last meeting was on
                </p>
                {/* 2. Style Correction: Make the date bolder and slightly larger */}
                <p className="text-[10px] font-semibold text-muted-foreground">
                    {formatDateWithOrdinal(contact.last_meeting)}
                </p>
            </div>
        )}

        {/* The Chevron Icon */}
        <ChevronRight className="md:hidden" />
    </div>
</div>
);

// Define an enriched type to include company_name
type EnrichedContact = CRMContacts & { full_name: string; company_name: string; };

export const ContactList = ({ onContactSelect, activeContactId }: ContactListProps) => {
    const navigate = useNavigate();
    const { openNewContactDialog } = useDialogStore();
    const role = localStorage.getItem("role")


    const [searchQuery, setSearchQuery] = useState("");

    // NEW: State to hold the filters from our new component
    const [assignmentFilters, setAssignmentFilters] = useState([]);

    const swrKey = `all-contacts-${JSON.stringify(assignmentFilters)}`;


    const { data: contacts, isLoading } = useFrappeGetDocList<EnrichedContact>("CRM Contacts", {
        fields: ["name", "first_name", "last_name", "company","email","last_meeting"],
        filters: assignmentFilters, // Use the state variable here
        limit: 0,
        orderBy: { field: "modified", order: "desc" }
    }, swrKey);

    const enrichedContacts = useMemo(() =>
        contacts?.map(c => ({
            ...c,
            full_name: `${c.first_name || ''} ${c.last_name || ''}`.trim(),
            company_name: c.company || 'N/A'
        })) || [],
        [contacts]
    );

    // --- STEP 2: IMPLEMENT CLIENT-SIDE FILTERING ---
    const filteredContacts = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) {
            return enrichedContacts;
        }

        return enrichedContacts.filter(contact =>
            contact.full_name.toLowerCase().includes(lowercasedQuery) ||
            contact.company_name.toLowerCase().includes(lowercasedQuery)
        );
    }, [enrichedContacts, searchQuery]);


    const handleSelect = (id: string) => {
        if (onContactSelect) {
            onContactSelect(id);
        } else {
            navigate(`/contacts/contact?id=${id}`);
        }
    };

    // if (isLoading) {
    //     return <div>Loading Contacts...</div>;
    // }

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Contact or Company..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    {role === "Nirmaan Sales User Profile" && <span className="text-xs font-light">List Contacts:</span>}
                    <AssignmentFilterControls onFilterChange={setAssignmentFilters} filterType="contact" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                {filteredContacts?.map((contact, index) => (
                    <div key={contact.name}>
                        <ContactListItem
                            contact={contact}
                            onSelect={() => handleSelect(contact.name)}
                            isActive={contact.name === activeContactId}
                        />
                        {index < enrichedContacts.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
            {/* <div className="mt-4 md:hidden">
                <button
                    onClick={openNewContactDialog}
                    className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Contact
                </button>
            </div> */}
        </div>
    );
};