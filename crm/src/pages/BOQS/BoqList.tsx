// src/pages/BOQS/BoqList.tsx

import { useDialogStore } from "@/store/dialogStore";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useCallback } from "react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreVertical, Plus, SquarePen } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useViewport } from "@/hooks/useViewPort";
import { BoqListHeader } from "./BoqListHeader"; // Import the new header component
import { AssignmentFilterControls } from "@/components/ui/AssignmentFilterControls";
import { useTaskCreationHandler } from "@/hooks/useTaskCreationHandler";


type EnrichedBoq = CRMBOQ & { "company.company_name"?: string; "contact.first_name"?: string; "contact.last_name"?: string; };
interface BoqListProps { onBoqSelect?: (id: string) => void; activeBoqId?: string | null; }

const DesktopBoqListItem = ({ boq, companyName, onSelect, isActive }: { boq: EnrichedBoq, companyName: string, onSelect: () => void, isActive: boolean }) => {
    const getBoqStatusClass = useStatusStyles("boq");
    // console.log("boq",boq)
    return (
        <div role="button" aria-label={boq.boq_name} onClick={onSelect} className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-destructive/10" : "hover:bg-secondary"}`}>
            <div>
                <p className="font-semibold">{boq.name}</p>
                <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
                {boq.boq_status || 'N/A'}
            </span>
        </div>
    );
};

const MobileBoqListItem = ({ boq }: { boq: EnrichedBoq }) => {
    const navigate = useNavigate();
    const { openNewTaskDialog, openEditBoqDialog } = useDialogStore();
    const getBoqStatusClass = useStatusStyles("boq");
    const role = localStorage.getItem('role');
      const handleCreateTask = useTaskCreationHandler();
    
    return (
        <div className="py-4">
            <div className="flex justify-between items-center">
                <div className="space-y-1 cursor-pointer" onClick={() => navigate(`/boqs/boq?id=${boq.name}`)}>
                    <p className="font-bold text-blue-600 underline underline-offset-2">{boq.name}</p>
                    <p className="text-sm text-muted-foreground">{boq.company || 'N/A'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${getBoqStatusClass(boq.boq_status)}`}>
                        {boq.boq_status || 'N/A'}
                    </span>

                    {
                        (role != "Nirmaan Estimations User Profile") && (
<Button variant="outline" size="sm" className="h-8 w-8 rounded-full border-destructive text-destructive" onClick={(e) => { e.stopPropagation();handleCreateTask({ boqId: boq.name, companyId: boq.company, contactId: boq.contact })  }}>
                        <Plus className="w-4 h-4 mr-0" /> 


                        {/* Add Task */}

                    </Button>
                        )
                    }
                    
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); openEditBoqDialog({ boqData: boq, mode: 'details' }); }}>
                        <SquarePen className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const BoqList = ({ onBoqSelect, activeBoqId }: BoqListProps) => {
    const { isMobile } = useViewport();
    // const { role, isLoading: isUserLoading } = useCurrentUser();
          const role = localStorage.getItem('role');
    
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("By Name");
    const [dateRange, setDateRange] = useState({ from: format(subDays(new Date(), 30), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') });
    const [assignmentFilters, setAssignmentFilters] = useState([]);

    const allFilters = useMemo(() => {
        // REMOVED: No more default filters for Sales User. Backend handles it.
        const dateFilters = [['modified', 'between', [dateRange.from, dateRange.to]]];
        return [...dateFilters, ...assignmentFilters];
    }, [dateRange, assignmentFilters]);

    const swrKey = `all-boqs-${JSON.stringify(allFilters)}`;

    const { data: boqs, isLoading } = useFrappeGetDocList<EnrichedBoq>("CRM BOQ", {
        fields: ["name", "boq_name", "boq_status","city","boq_sub_status","boq_submission_date", "boq_type","boq_value", "company", "contact", "boq_size","company.company_name", "contact.first_name","boq_link", "contact.last_name", "modified","assigned_sales"],
        filters: allFilters,
        limit: 0,
        orderBy: { field: "modified", order: "desc" }
    },swrKey);
    
    const filteredBoqs = useMemo(() => {
        if (!boqs) return [];
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return boqs;

        return boqs.filter(boq => {
            switch (filterType) {
                case 'By Company': return boq?.company?.toLowerCase().includes(lowercasedQuery);
                
                case 'By Contact':
                    const contactName = `${boq?.first_name || ''} ${boq?.last_name || ''}`.toLowerCase();
                    return contactName.includes(lowercasedQuery);
                case 'By Name': return boq.boq_name?.toLowerCase().includes(lowercasedQuery);
                case 'By Package': return boq.boq_type?.toLowerCase().includes(lowercasedQuery);
                case 'By Status': return boq.boq_status?.toLowerCase().includes(lowercasedQuery);

                default: return true;
            }
        });
    }, [boqs, searchQuery, filterType]);

    // if (isLoading) { return <div className="p-4 text-center">Loading BOQs...</div>; }
    
    // Pass all necessary state and functions to the new header component
    const headerProps = {
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        onDateRangeChange: setDateRange,
         dateRange: dateRange, // Use camelCase `dateRange`
        isMobile,
    };

    return (
        <div>
            <BoqListHeader {...headerProps} />
            
            {role !== 'Nirmaan Sales User Profile' && (
                <div className="mt-4">
                    <AssignmentFilterControls onFilterChange={setAssignmentFilters} filterType="boq" />
                </div>
            )}

            <div>
                {isMobile ? (
                    // MOBILE LIST RENDER
                    <div className="flex flex-col">
                        {filteredBoqs.map((boq, index) => (
                            <div key={boq.name}>
                                <MobileBoqListItem boq={boq} />
                                {index < filteredBoqs.length - 1 && <Separator />}
                            </div>
                        ))}
                    </div>
                ) : (
                    // DESKTOP LIST RENDER
                    <div className="space-y-2 -mr-4 pr-4">
                        {filteredBoqs?.map((boq) => (
                            <DesktopBoqListItem
                                key={boq.name}
                                boq={boq}
                                companyName={boq.company || 'N/A'}
                                onSelect={() => onBoqSelect(boq.name)}
                                isActive={boq.name === activeBoqId}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// // src/pages/BOQS/BoqList.tsx
// import { Button } from "@/components/ui/button";
// import { Plus, Search, SquarePen, ChevronRight} from "lucide-react";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { useDialogStore } from "@/store/dialogStore";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { useMemo,useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { subDays, format } from 'date-fns';

// type EnrichedBoq = CRMBOQ & { "company.company_name"?: string };

// interface BoqListProps {
//     onBoqSelect?: (id: string) => void;
//     activeBoqId?: string | null;
// }

// const BoqListItem = ({ boq, onSelect, isActive }: { boq: EnrichedBoq, onSelect: () => void, isActive: boolean }) => {
//     const getBoqStatusClass = useStatusStyles("boq");

//     return (
//         <div
//             role="button"
//             aria-label={boq.boq_name}
//             onClick={onSelect}
//             className={`flex items-center justify-between p-4 cursor-pointer transition-colors rounded-lg ${isActive ? "bg-primary/10" : "hover:bg-secondary"}`}
//         >
//             <div>
//                 <strong className="text-black dark:text-muted-foreground">{boq.boq_name}</strong>
//                 <p className="text-sm text-muted-foreground">{boq.company || 'N/A'}</p>
//             </div>
//             <div className="flex items-center gap-4">
//                 <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
//                     {boq.boq_status || 'N/A'}
//                 </span>
//                 <ChevronRight className="md:hidden" />
//             </div>
//         </div>
//     );
// };

// export const BoqList = ({ onBoqSelect, activeBoqId }: BoqListProps) => {
//     const navigate = useNavigate();
//     const { openNewBoqDialog,openNewTaskDialog,openEditBoqDialog ,openDateRangePickerDialog} = useDialogStore();
//     const getBoqStatusClass=useStatusStyles("boq")

//     const [dateRange, setDateRange] = useState({
//             from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
//             to: format(new Date(), 'yyyy-MM-dd'),
//         });
      
//  const handleSelectRange = () => {
//         openDateRangePickerDialog({
//             onConfirm: (range) => {
//                 setDateRange({
//                     from: format(range.from, 'yyyy-MM-dd'),
//                     to: format(range.to, 'yyyy-MM-dd'),
//                 });
//             }
//         });
//     };
//     const { data: boqs, isLoading } = useFrappeGetDocList<EnrichedBoq>("CRM BOQ", {
//         fields: ["name", "boq_status", "company", "creation", "modified"],
//         limit: 1000,
//         filters:[
//                 ["modified", "between", [dateRange.from, dateRange.to]]
//         ],
//         orderBy: { field: "modified", order: "desc" }
//     });

//     const handleSelect = (id: string) => {
//         if (onBoqSelect) {
//             onBoqSelect(id);
//         } else {
//             navigate(`/boqs/boq?id=${id}`);
//         }
//     };

//     if (isLoading) {
//         return <div>Loading BOQs...</div>;
//     }

//     return (
//         <div className="flex flex-col h-full">
//             <div className="relative mb-4">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                 <Input placeholder="Search BOQ or Company..." className="pl-9" />
//             </div>
//             {
//             <div className="flex items-center justify-between">
//                             <p className="text-sm text-muted-foreground">Date filter:</p>
//                             <div className="flex items-center border rounded-md overflow-hidden">
//                                 <Button variant="ghost" className="bg-gray-800 text-white rounded-none h-8 text-xs">
//                                     Last 30 days
//                                 </Button>
//                                 <Button
//                                     variant="ghost"
//                                     className="text-muted-foreground rounded-none h-8 border-l text-xs"
//                                     onClick={handleSelectRange}
//                                 >
//                                     Select range
//                                 </Button>
//                             </div>
//                         </div>
//             }
//             <div className="flex-1 overflow-y-auto">
//                 {boqs?.map((boq, index) => (
//                     <div key={boq.name}>
//                       {onBoqSelect?( <BoqListItem
//                             boq={boq}
//                             onSelect={() => handleSelect(boq.name)}
//                             isActive={boq.name === activeBoqId}
//                         />):(
//                                   <div className="py-4">
//             <div className="flex justify-between items-center mb-3 cursor-pointer" onClick={() => navigate(`/boqs/boq?id=${boq.name}`)}>
//                 <div className="flex flex-col">
//                     <span className="font-bold text-blue-600 underline underline-offset-2">{boq.name}</span>
//                     <span className="text-sm text-muted-foreground">{boq.company}</span>
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
//                       )}
                       
//                         {index < boqs.length - 1 && <Separator />}
//                     </div>
//                 ))}
//             </div>
//             {/* <div className="mt-4 md:hidden">
//                 <button onClick={openNewBoqDialog} className="w-full h-12 bg-destructive text-white rounded-lg flex items-center justify-center gap-2">
//                     <Plus size={20} /> Add New BOQ
//                 </button>
//             </div> */}
//         </div>
//     );
// };