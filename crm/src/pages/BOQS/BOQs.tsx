import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDialogStore } from "@/store/dialogStore";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { Plus, Search, SquarePen } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

// This is the new, reusable card component for a single BOQ item
const BoqListItem = ({ boq, companyName }: { boq: CRMBOQ, companyName: string }) => {
    const navigate = useNavigate();
    const { openNewTaskDialog, openEditBoqDialog } = useDialogStore(); // Assuming you add editBoq to store

    const getStatusClass = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'won': return 'text-green-600 bg-green-50 border border-green-300';
            case 'lost': return 'text-red-600 bg-red-50 border border-red-300';
            case 'new': return 'text-yellow-600 bg-yellow-50 border border-yellow-300';
            case 'negotiation': return 'text-emerald-600 bg-emerald-50 border border-emerald-300';
            case 'revision submitted': return 'text-blue-600 bg-blue-50 border border-blue-300';
            case 'revision pending': return 'text-amber-600 bg-amber-50 border border-amber-300';
            default: return 'text-gray-600 bg-gray-100 border border-gray-300';
        }
    };

    return (
        <div className="py-4">
            <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => navigate(`/boqs/boq?id=${boq.name}`)}>
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 underline underline-offset-2">{boq.boq_name}</span>
                    <span className="text-sm text-muted-foreground">{companyName}</span>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className={`text-xs font-semibold px-3 py-1 rounded-md ${getStatusClass(boq.boq_status)}`}>
                    {boq.boq_status || 'N/A'}
                </span>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-8 bg-white border border-destructive text-destructive hover:bg-destructive/5"
                        onClick={(e) => {
                            e.stopPropagation();
                            openNewTaskDialog({ boqId: boq.name, companyId: boq.company, contactId: boq.contact });
                        }}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Task
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            // openEditBoqDialog({ boqData: boq });
                        }}>
                        <SquarePen className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>
        </div>
    );
};


// The main BOQs list page
export const BOQs = () => {
    const { data: boqsData, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", {
        fields: ["*"],
        limit: 1000,
    });
    const { data: companiesList, isLoading: companiesListLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
        fields: ["*"],
        limit: 1000,
    });

    const companyMap = useMemo(() => 
        new Map(companiesList?.map(c => [c.name, c.company_name])),
        [companiesList]
    );

    if (boqsLoading || companiesListLoading) {
        return <div>Loading BOQs...</div>
    }

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input placeholder="By Company" className="flex-1" /> {/* Replace with ReactSelect */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search" className="pl-9" />
                </div>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Filter by:</p>
                <div className="flex items-center border rounded-md">
                    <Button variant="ghost" className="bg-slate-700 text-white rounded-r-none h-8">30 Days</Button>
                    <Button variant="ghost" className="text-muted-foreground rounded-l-none h-8">Select Date Range</Button>
                </div>
            </div>
            
            <div className="flex flex-col">
                {boqsData?.map((boq, index) => (
                    <div key={boq.name}>
                        <BoqListItem boq={boq} companyName={companyMap.get(boq.company) || "Unknown"} />
                        {index < boqsData.length - 1 && <Separator />}
                    </div>
                ))}
            </div>
        </div>
    );
};