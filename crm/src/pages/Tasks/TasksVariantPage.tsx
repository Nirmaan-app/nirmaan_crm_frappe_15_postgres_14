// src/pages/Tasks/TasksVariantPage.tsx

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EnrichedCRMTask } from "./Tasks";
import { formatDate } from "@/utils/FormatDate";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, subDays } from "date-fns";
import { FilterControls } from "@/components/ui/FilterControls";
import { useStatusStyles } from "@/hooks/useStatusStyles";

type TaskVariant = 'all' | 'pending' | 'upcoming' | 'history';

const StatusPill = ({ status }: { status: string }) => {
    const getStatusClass = useStatusStyles("task");
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border w-fit ${getStatusClass(status)}`}>
            {status}
        </span>
    );
};

export const TasksVariantPage = ({ variant }: { variant: TaskVariant }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [dateRange, setDateRange] = useState({
        from: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        to: format(new Date(), 'yyyy-MM-dd'),
    });

    // --- DYNAMIC FILTERS FOR DATA FETCHING ---
    const filters = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        let statusFilter;

        switch (variant) {
            // --- THE FIX IS HERE ---
            // The logic for 'pending' is now much simpler and more accurate.
            case 'pending':
                statusFilter = ['!=', 'Completed'];
                break;
            case 'upcoming':
                return [
                    ['status', '=', 'Scheduled'],
                    ['start_date', '>=', today]
                ];
            case 'history':
                return [
                    ['start_date', '<', today]
                ];
            case 'all':
            default:
                statusFilter = ['!=', '']; // A way to get all statuses
                break;
        }
        
        return [
            ['status', statusFilter[0], statusFilter[1]],
            ['modified', 'between', [dateRange.from, dateRange.to]]
        ];

    }, [variant, dateRange]);

    const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "status", "type", "modified","company", "contact.first_name", "contact.last_name", "company.company_name"],
        filters: filters,
        limit: 1000,
        orderBy: { field: "modified", order: "desc" }
    });

    // --- CLIENT-SIDE SEARCH FILTERING ---
    const filteredTasks = useMemo(() => {
        const enriched = tasksData?.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
            company_name: task.company || 'N/A'
        })) || [];
        
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return enriched;

        return enriched.filter(task => 
            task.contact_name.toLowerCase().includes(lowercasedQuery) ||
            task.company_name.toLowerCase().includes(lowercasedQuery) ||
            task.type.toLowerCase().includes(lowercasedQuery)
        );
    }, [tasksData, searchQuery]);
    
    const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Tasks - ${filteredTasks.length}`;

    if (isLoading) { return <div>Loading tasks...</div>; }

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-bold">{title}</h1>
            
            {/* <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search Contact, Company or Type..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div> */}
            {/* <FilterControls onDateRangeChange={setDateRange} /> */}

            <Card className="mt-4 p-0">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contact</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Task Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Update Date</TableHead>
                                <TableHead className="w-[5%]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task) => (
                                    <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
                                        <TableCell className="font-medium">{task.contact_name}</TableCell>
                                        <TableCell>{task.company_name}</TableCell>
                                        <TableCell>{task.type}</TableCell>
                                        <TableCell><StatusPill status={task.status} /></TableCell>
                                        <TableCell className="text-right">{formatDate(task.modified)}</TableCell>
                                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No tasks found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

// import { Card, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { EnrichedCRMTask } from "./Tasks"; // Import the enriched type from Tasks.tsx
// import { formatDate } from "@/utils/FormatDate";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { ChevronRight, ListFilter, Search } from "lucide-react";
// import { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom"; // Import useNavigate
// import { Button } from "@/components/ui/button";

// // Define a type for the variant prop for better type safety
// type TaskVariant = 'all' | 'pending' | 'upcoming' | 'history';

// // A reusable status pill component
// const StatusPill = ({ status }: { status: string }) => {
//     const getStatusClass = (status: string) => {
//         switch (status?.toLowerCase()) {
//             case 'completed': return 'bg-green-100 text-green-800 border-green-300';
//             case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//             case 'incomplete': return 'bg-red-100 text-red-800 border-red-300';
//             case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
//             default: return 'bg-gray-100 text-gray-800 border-gray-300';
//         }
//     };
//     return (
//         <span className={`text-xs font-semibold px-2 py-1 rounded-full border w-fit ${getStatusClass(status)}`}>
//             {status}
//         </span>
//     );
// };

// export const TasksVariantPage = ({ variant }: { variant: TaskVariant }) => {
//     const navigate = useNavigate(); // Initialize navigate hook

//     // --- DATA FETCHING ---
//     // More efficient query that gets linked fields directly
//     const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
//         fields: ["name", "status", "type", "modified", "contact.first_name", "contact.last_name"],
//         // You can add more complex filters based on the variant
//         filters: variant === 'pending' ? [['status', 'in', ['Pending', 'Incomplete',"Scheduled"]]] :variant === 'upcoming'?[['status', 'in',["Scheduled"]]]: {},
//         limit: 100,
//         orderBy: { field: "modified", order: "desc" }
//     });

//     // --- DERIVED STATE ---
//     const enrichedTasks = useMemo(() => {
//         return tasksData?.map(task => ({
//             ...task,
//             contact_name: `${task["contact.first_name"] || ''} ${task["contact.last_name"] || ''}`.trim() || 'N/A',
//         })) || [];
//     }, [tasksData]);
    
//     // Dynamically generate the title based on the variant
//     const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Tasks - ${enrichedTasks.length}`;

//     if (isLoading) {
//         return <div>Loading tasks...</div>;
//     }

//     return (
//         <div className="space-y-4">
//             <h1 className="text-xl font-bold">{title}</h1>
            
//             {/* Filter and Search UI */}
//             <div className="flex gap-2">
//                 <Input placeholder="By Company" /> {/* Needs ReactSelect for functionality */}
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//                     <Input placeholder="Search" className="pl-9" />
//                 </div>
//             </div>
//             <div className="flex items-center justify-between">
//                 <p className="text-sm text-muted-foreground">Filter by:</p>
//                 <div className="flex items-center border rounded-md">
//                     <Button variant="ghost" className="bg-slate-700 text-white rounded-r-none h-8">Last 30 Days</Button>
//                     <Button variant="ghost" className="text-muted-foreground rounded-l-none h-8">Select Date Range</Button>
//                 </div>
//             </div>

//             {/* Task List Table */}
//             <Card className="mt-4 p-0 cardBorder">
//                 <CardContent className="p-0">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead>Contact</TableHead>
//                                 <TableHead>Task Type</TableHead>
//                                 <TableHead>Status</TableHead>
//                                 <TableHead className="text-right">Update Date</TableHead>
//                                 <TableHead className="w-[5%]"></TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {enrichedTasks.length > 0 ? (
//                                 enrichedTasks.map((task) => (
//                                     // *** THIS IS THE FIX ***
//                                     // Add onClick handler to the TableRow
//                                     <TableRow 
//                                         key={task.name} 
//                                         onClick={() => navigate(`/tasks/task?id=${task.name}`)}
//                                         className="cursor-pointer"
//                                     >
//                                         <TableCell className="font-medium">{task.first_name}</TableCell>
//                                         <TableCell>{task.type}</TableCell>
//                                         <TableCell><StatusPill status={task.status} /></TableCell>
//                                         <TableCell className="text-right">{formatDate(task.modified)}</TableCell>
//                                         <TableCell>
//                                             <ChevronRight className="w-4 h-4 text-muted-foreground" />
//                                         </TableCell>
//                                     </TableRow>
//                                 ))
//                             ) : (
//                                 <TableRow>
//                                     <TableCell colSpan={5} className="text-center h-24">No tasks found.</TableCell>
//                                 </TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// import { Card, CardContent } from "@/components/ui/card";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import { Separator } from "@/components/ui/separator";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow
// } from "@/components/ui/table";
// import { useViewport } from "@/hooks/useViewPort";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { formatDate } from "@/utils/FormatDate";
// import { useFrappeGetDocList } from "frappe-react-sdk";
// import { ChevronRight, ListFilter } from "lucide-react";
// import { useState } from "react";

// export const TasksVariantPage = ({ variant }: { variant: string }) => {

//   const [filterBy, setFilterBy] = useState("All");
//   const {isMobile} = useViewport()

//   const [filterByMenuOpen, setFilterByMenuOpen] = useState(false);

//   const toggleFilterByMenu = () => {
//     setFilterByMenuOpen((prevState) => !prevState);
//   };

//   const contactsMap = new Map<string | undefined, any>();

//   const {data: tasksData, isLoading: tasksDataLoading, error: tasksError} = useFrappeGetDocList<CRMTask>("CRM Task", {
//     fields: ["*"],
//     filters: [["status", filterBy === "All" ? "not in" : "in", filterBy === "All" ? [] : [filterBy]]],
//     limit: 100000,
//     orderBy: {field: "creation", order: "desc"}
//   })

//   const {data: contactsData, isLoading: contactsDataLoading, error: contactsError} = useFrappeGetDocList<CRMContacts>("CRM Contacts", {
//     fields: ["*"],
//     limit: 100000,
//   })

//   contactsData?.map((contact) => {
//     contactsMap.set(contact.name, contact)
//   })

//   return (
//     <div>
//       {isMobile && (
//         <>
//          <Input type="text" className="focus:border-none rounded-lg" placeholder="Search Names, Company, Project, etc..." />
//          <Separator className="my-4" />
//         </>
//       )}
//         <div className="flex items-center justify-between">
//           <h2 className="font-semibold tracking-tight">{variant === "history" ? "Tasks History" : `${variant?.slice(0, 1)?.toUpperCase() + variant?.slice(1)} Tasks`}</h2>
//           <DropdownMenu open={filterByMenuOpen} onOpenChange={toggleFilterByMenu}>
//             <DropdownMenuTrigger className="flex items-center gap-4 px-2 py-1 rounded-lg border cardBorder shadow">
//                     <ListFilter className="w-4 h-4" />
//                     <p className="min-w-[75px] text-end text-sm">{filterBy}</p>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent side="bottom" className="p-4 mr-16">

//               <RadioGroup className="space-y-2" value={filterBy} onValueChange={(value) => {
//                 toggleFilterByMenu();
//                 setFilterBy(value);
//               }}>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="All" id="All" />
//                 <Label htmlFor="All">All</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="Pending" id="Pending" />
//                 <Label htmlFor="Pending">Pending</Label>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <RadioGroupItem value="Completed" id="Completed" />
//                 <Label htmlFor="Completed">Completed</Label>
//               </div>
//               </RadioGroup>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>

//         <Card className="mt-4 p-0 cardBorder">
//             <CardContent className="p-3">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead className="w-[10%]">Contact</TableHead>
//                    <TableHead>{variant === "history" ? "Status" : "Task"}</TableHead>
//                   <TableHead>Start Date</TableHead>
//                   <TableHead className="w-[2%]"></TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {tasksData?.length > 0 ? (
//                   tasksData?.map((task) => {
//                     return (
//                       <TableRow key={task.name}>
//                         <TableCell>{contactsMap.get(task.reference_docname)?.first_name}</TableCell>
//                         <TableCell>{variant === "history" ? task.status : task.type}</TableCell>
//                         <TableCell>{formatDate(task.start_date.split(" ")[0])}</TableCell>
//                         <TableCell>
//                             <ChevronRight className="w-4 h-4" />
//                         </TableCell>
//                       </TableRow>
//                     )
//                   })
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={4} className="text-center py-2">
//                       No Tasks Found
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//              </Table>
//             </CardContent>
//         </Card>
//   </div>
//   )
// }