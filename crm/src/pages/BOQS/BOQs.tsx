// src/pages/BOQS/BOQs.tsx
import { useViewport } from "@/hooks/useViewPort";
import { BoqList } from "./BoqList";
import { BOQ } from "./BOQ";
import { useStateSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { useDialogStore } from "@/store/dialogStore";
import { Plus } from "lucide-react";

const DesktopPlaceholder = () => (
    <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-secondary">
        <span className="text-muted-foreground">Please select a BOQ from the list</span>
    </div>
);

export const BOQs = () => {
    const { isMobile } = useViewport();
    const [id, setId] = useStateSyncedWithParams<string>("id", "");
    const { openNewBoqDialog } = useDialogStore();

    if (isMobile) {
        return <BoqList />;
    }

    return (
        <div className="grid grid-cols-[400px,1fr] gap-6 h-[calc(100vh-var(--navbar-height)-80px)]">
            {/* Master Panel (Left) */}
            <div className="bg-background rounded-lg border p-4 flex flex-col">
                <h2 className="text-lg font-semibold mb-4">BOQs</h2>
                <BoqList
                    onBoqSelect={setId}
                    activeBoqId={id}
                />
                <div className="mt-4">
                    <button onClick={openNewBoqDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
                        <Plus size={20} /> Add New BOQ
                    </button>
                </div>
            </div>

            {/* Detail Panel (Right) */}
            <div className="overflow-y-auto">
                {id ? <BOQ /> : <DesktopPlaceholder />}
            </div>
        </div>
    );
};

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMCompany } from "@/types/NirmaanCRM/CRMCompany";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { Plus, Search, SquarePen } from "lucide-react";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";

// // This is the new, reusable card component for a single BOQ item
// const BoqListItem = ({ boq, companyName }: { boq: CRMBOQ, companyName: string }) => {
//     const navigate = useNavigate();
//     const { openNewTaskDialog, openEditBoqDialog } = useDialogStore(); // Assuming you add editBoq to store
// const getBoqStatusClass=useStatusStyles("boq")
   

//     return (
//         <div className="py-4">
//             <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => navigate(`/boqs/boq?id=${boq.name}`)}>
//                 <div className="flex flex-col">
//                     <span className="font-bold text-blue-600 underline underline-offset-2">{boq.boq_name}</span>
//                     <span className="text-sm text-muted-foreground">{companyName}</span>
//                 </div>
//             </div>
//             <div className="flex justify-between items-center">
//                 <span className={`text-xs font-semibold px-3 py-1 rounded-md ${getBoqStatusClass(boq.boq_status)}`}>
//                     {boq.boq_status || 'N/A'}
//                 </span>
//                 <div className="flex items-center gap-2">
//                     <Button size="sm" className="h-8 bg-white border border-destructive text-destructive hover:bg-destructive/5"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openNewTaskDialog({ boqId: boq.name, companyId: boq.company, contactId: boq.contact });
//                         }}>
//                         <Plus className="w-4 h-4 mr-1" />
//                         Add Task
//                     </Button>
//                     <Button variant="ghost" size="icon" className="h-8 w-8"
//                         onClick={(e) => {
//                             e.stopPropagation();
//                             openEditBoqDialog({ boqData: boq, mode: 'details' })
//                         }}>
//                         <SquarePen className="w-5 h-5 text-muted-foreground" />
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// };


// // The main BOQs list page
// export const BOQs = () => {
//     const { data: boqsData, isLoading: boqsLoading } = useFrappeGetDocList<CRMBOQ>("CRM BOQ", {
//         fields: ["*"],
//         limit: 1000,
//     });
//     const { data: companiesList, isLoading: companiesListLoading } = useFrappeGetDocList<CRMCompany>("CRM Company", {
//         fields: ["*"],
//         limit: 1000,
//     });

//     const companyMap = useMemo(() => 
//         new Map(companiesList?.map(c => [c.name, c.company_name])),
//         [companiesList]
//     );

//     if (boqsLoading || companiesListLoading) {
//         return <div>Loading BOQs...</div>
//     }

//     return (
//         <div className="space-y-4">
//             <div className="flex gap-2">
//                 <Input placeholder="By Company" className="flex-1" /> {/* Replace with ReactSelect */}
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input placeholder="Search" className="pl-9" />
//                 </div>
//             </div>
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-muted-foreground">Filter by:</p>
//                 <div className="flex items-center border rounded-md">
//                     <Button variant="ghost" className="bg-slate-700 text-white rounded-r-none h-8">30 Days</Button>
//                     <Button variant="ghost" className="text-muted-foreground rounded-l-none h-8">Select Date Range</Button>
//                 </div>
//             </div>
            
//             <div className="flex flex-col">
//                 {boqsData?.map((boq, index) => (
//                     <div key={boq.name}>
//                         <BoqListItem boq={boq} companyName={companyMap.get(boq.company) || "Unknown"} />
//                         {index < boqsData.length - 1 && <Separator />}
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };