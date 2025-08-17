// src/pages/BOQS/BoqList.tsx
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Plus, Search } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

type EnrichedBoq = CRMBOQ & { "company.company_name"?: string };

interface BoqListProps {
    onBoqSelect?: (id: string) => void;
    activeBoqId?: string | null;
}

const BoqListItem = ({ boq, onSelect, isActive }: { boq: EnrichedBoq, onSelect: () => void, isActive: boolean }) => {
    const getBoqStatusClass = useStatusStyles("boq");

    return (
        <div
            role="button"
            aria-label={boq.boq_name}
            onClick={onSelect}
            className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
        >
            <div>
                <strong className="text-black dark:text-muted-foreground">{boq.boq_name}</strong>
                <p className="text-sm text-muted-foreground">{boq["company.company_name"] || 'N/A'}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
                    {boq.boq_status || 'N/A'}
                </span>
                <ChevronRight className="md:hidden" />
            </div>
        </div>
    );
};

export const BoqList = ({ onBoqSelect, activeBoqId }: BoqListProps) => {
    const navigate = useNavigate();
    const { openNewBoqDialog } = useDialogStore();

    const { data: boqs, isLoading } = useFrappeGetDocList<EnrichedBoq>("CRM BOQ", {
        fields: ["name", "boq_name", "boq_status", "company"],
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    });

    const handleSelect = (id: string) => {
        if (onBoqSelect) {
            onBoqSelect(id);
        } else {
            navigate(`/boqs/boq?id=${id}`);
        }
    };

    if (isLoading) {
        return <div>Loading BOQs...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search BOQ or Company..." className="pl-9" />
            </div>
            <div className="flex-1 overflow-y-auto">
                {boqs?.map((boq, index) => (
                    <div key={boq.name}>
                        <BoqListItem
                            boq={boq}
                            onSelect={() => handleSelect(boq.name)}
                            isActive={boq.name === activeBoqId}
                        />
                        {index < boqs.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
            <div className="mt-4 md:hidden">
                <button onClick={openNewBoqDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                    <Plus size={20} /> Add New BOQ
                </button>
            </div>
        </div>
    );
};