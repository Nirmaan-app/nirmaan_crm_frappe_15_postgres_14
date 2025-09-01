// src/pages/Companies/CompanyList.tsx
import { AssignmentFilterControls } from "@/components/ui/AssignmentFilterControls";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDialogStore } from "@/store/dialogStore";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDate, formatTime12Hour,formatDateWithOrdinal } from "@/utils/FormatDate";

interface CompanyListProps {
    // On desktop, this function is used to update the URL param without a full navigation
    onCompanySelect?: (id: string) => void;
    activeCompanyId?: string | null;
}

const CompanyListItem = ({ company, onSelect, isActive }: { company: CRMCompany, onSelect: () => void, isActive: boolean }) => (
    <div
    role="button"
    aria-label={company.company_name}
    onClick={onSelect}
    // The main container uses the same flexbox layout as the contact item
    className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
>
    {/* --- Left Group --- */}
    {/* Contains the primary and secondary information */}
    <div>
        <strong className="text-black dark:text-muted-foreground">{company.company_name}</strong>
        {/* We can use the company's city as the secondary line of text */}
        <p className="text-sm text-muted-foreground">{company.company_city || 'No location'}</p>
    </div>

    {/* --- Right Group --- */}
    {/* This div wraps the badge and chevron, pushing them to the right */}
    <div className="flex items-center gap-4">
        
        {/* The "Last Meeting" badge, adapted for the 'company' object */}
        {company.last_meeting && (
            <div className="border p-2 rounded-md text-center">
                <p className="text-[8px] text-muted-foreground">
                    Last meeting was on
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground">
                    {/* Make sure to use formatDateWithOrdinal here as well */}
                    {formatDateWithOrdinal(company.last_meeting)}
                </p>
            </div>
        )}

        {/* The Chevron Icon */}
        <ChevronRight className="md:hidden" />
    </div>
</div>
);

export const CompanyList = ({ onCompanySelect, activeCompanyId }: CompanyListProps) => {
    const role=localStorage.getItem("role")   
    const navigate = useNavigate();
    const { openNewCompanyDialog } = useDialogStore();

    // --- STEP 1: ADD STATE FOR SEARCH QUERY ---
    const [searchQuery, setSearchQuery] = useState("");

    // NEW: State to hold the filters from our new component
    const [assignmentFilters, setAssignmentFilters] = useState([]);

    const swrKey = `all-companies-${JSON.stringify(assignmentFilters)}`;



    const { data: companiesList, isLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
        fields: ["name", "company_name","last_meeting","company_city"],
        filters: assignmentFilters, // Use the state variable here
        limit: 0,
        orderBy: { field: "modified", order: "desc" }
    }, swrKey);

    // --- STEP 2: IMPLEMENT CLIENT-SIDE FILTERING ---
    const filteredCompanies = useMemo(() => {
        if (!companiesList) return [];
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return companiesList;

        return companiesList.filter(company =>
            company.company_name?.toLowerCase().includes(lowercasedQuery)
        );
    }, [companiesList, searchQuery]);


    const handleSelect = (id: string) => {
        // If the onCompanySelect prop is provided (on desktop), use it.
        if (onCompanySelect) {
            onCompanySelect(id);
        } else {
            // Otherwise (on mobile), perform a full navigation.
            navigate(`/companies/company?id=${id}`);
        }
    };

    // Memoize the list to prevent re-renders
    const companyItems = useMemo(() =>
        filteredCompanies?.map((company, index) => (
            <div key={company.name}>
                <CompanyListItem
                    company={company}
                    onSelect={() => handleSelect(company.name)}
                    isActive={company.name === activeCompanyId}
                />
                {index < filteredCompanies.length - 1 && <Separator />}
            </div>
        )),
        [filteredCompanies, activeCompanyId]
    );

    // if (isLoading) {
    //     return <div>Loading Companies...</div>;
    // }



    return (
        <div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search Company..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            
            <div className="mb-4">
                {/* <div className="flex items-center justify-between mb-2"> */}
                    {role === "Nirmaan Sales User Profile" && <span className="text-xs font-light">List Companies:</span>}
                    <AssignmentFilterControls onFilterChange={setAssignmentFilters} filterType="company" />
                {/* </div> */}
            </div>
            <div >
                {companyItems}
            </div>
            {/* On desktop, this button will be inside a specific layout panel */}
            {/* <div className="mt-4 md:hidden">
                <button
                    onClick={openNewCompanyDialog}
                    className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Company
                </button>
            </div> */}
        </div>
    );
};