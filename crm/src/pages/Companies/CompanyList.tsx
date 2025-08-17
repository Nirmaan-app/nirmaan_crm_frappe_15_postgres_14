// src/pages/Companies/CompanyList.tsx
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

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
        className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
    >
        <strong className="text-black dark:text-muted-foreground">{company.company_name}</strong>
        {/* This chevron is only for visual indication on mobile */}
        <ChevronRight className="md:hidden" />
    </div>
);

export const CompanyList = ({ onCompanySelect, activeCompanyId }: CompanyListProps) => {
    const navigate = useNavigate();
    const { openNewCompanyDialog } = useDialogStore();

    const { data: companiesList, isLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
        fields: ["name", "company_name"],
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    });

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
        companiesList?.map((company, index) => (
            <div key={company.name}>
                <CompanyListItem
                    company={company}
                    onSelect={() => handleSelect(company.name)}
                    isActive={company.name === activeCompanyId}
                />
                {index < companiesList.length - 1 && <Separator />}
            </div>
        )),
        [companiesList, activeCompanyId]
    );

    if (isLoading) {
        return <div>Loading Companies...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search Company..." className="pl-9" />
            </div>
            <div className="flex-1 overflow-y-auto">
                {companyItems}
            </div>
            {/* On desktop, this button will be inside a specific layout panel */}
            <div className="mt-4 md:hidden">
                <button
                    onClick={openNewCompanyDialog}
                    className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2"
                >
                    <Plus size={20} /> Add New Company
                </button>
            </div>
        </div>
    );
};