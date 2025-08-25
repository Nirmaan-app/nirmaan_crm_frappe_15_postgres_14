// src/pages/Contacts/ContactSubPages.tsx

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { formatDate } from "@/utils/FormatDate";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useState, useMemo } from "react";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useViewport } from "@/hooks/useViewPort"; // <-- 1. IMPORT THE HOOK

interface ContactSubPagesProps {
    boqs: CRMBOQ[];
    tasks: CRMTask[];
}

// --- Sub-component for rendering the BOQ list (Refactored) ---
const BoqList = ({ boqs }: { boqs: CRMBOQ[] }) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport(); // <-- 2. USE THE HOOK
    const getBoqStatusClass = useStatusStyles('boq'); 
    
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {boqs.map((boq) => (
                        <TableRow 
                            key={boq.name} 
                            // --- 3. IMPLEMENT CONDITIONAL NAVIGATION ---
                            onClick={() => {
                                const path = isMobile ? `/boqs/boq?id=${boq.name}` : `/boqs?id=${boq.name}`;
                                navigate(path);
                            }} 
                            className="cursor-pointer"
                        >
                            <TableCell className="font-medium text-blue-600 underline">{boq.boq_name}</TableCell>
                            <TableCell>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
                                    {boq.boq_status || 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">{formatDate(boq.boq_submission_date)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};


// --- Sub-component for rendering the Task list (Refactored) ---
const TaskList = ({ tasks }: { tasks: CRMTask[] }) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport(); // <-- 2. USE THE HOOK
    const getTaskStatusClass = useStatusStyles('task');
    
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Task Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.map((task) => (
                        <TableRow 
                            key={task.name} 
                            // --- 3. IMPLEMENT CONDITIONAL NAVIGATION ---
                            onClick={() => {
                                const path = isMobile ? `/tasks/task?id=${task.name}` : `/tasks?id=${task.name}`;
                                navigate(path);
                            }} 
                            className="cursor-pointer"
                        >
                            <TableCell className="font-medium">{task.type}</TableCell>
                            <TableCell>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${getTaskStatusClass(task.status)}`}>
                                    {task.status || 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">{formatDate(task.start_date)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export const ContactSubPages = ({ boqs, tasks }: ContactSubPagesProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredBoqs = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return boqs;
        return boqs.filter(boq => boq.boq_name?.toLowerCase().includes(lowercasedQuery) || boq.boq_status?.toLowerCase().includes(lowercasedQuery));
    }, [boqs, searchQuery]);

    const filteredTasks = useMemo(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) return tasks;
        return tasks.filter(task => task.type?.toLowerCase().includes(lowercasedQuery) || task.status?.toLowerCase().includes(lowercasedQuery));
    }, [tasks, searchQuery]);

    return (
        <div>
            <h2 className="text-lg font-semibold mb-2">BOQs Details</h2>
            <Tabs defaultValue="boqs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
                    <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs</TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks</TabsTrigger>
                </TabsList>

                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <TabsContent value="boqs">
                    {filteredBoqs?.length > 0 
                        ? <BoqList boqs={filteredBoqs} /> 
                        : <p className="text-center text-muted-foreground py-8">No BOQs found for this contact.</p>
                    }
                </TabsContent>

                <TabsContent value="tasks">
                    {filteredTasks && filteredTasks.length > 0 
                        ? <TaskList tasks={filteredTasks} /> 
                        : <p className="text-center text-muted-foreground py-8">No tasks found for this contact.</p>
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
};

// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { formatDate } from "@/utils/FormatDate";
// import { ChevronRight, Search } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import React, { useState, useMemo } from "react";

// interface ContactSubPagesProps {
//     boqs: CRMBOQ[];
//     tasks: CRMTask[];
// }

// import { useStatusStyles } from "@/hooks/useStatusStyles";


// // --- SUB-COMPONENT for rendering the Task list ---
// const TaskList = ({ tasks }: { tasks: CRMTask[] }) => {
//     const navigate = useNavigate();
//     const getTaskStatusClass = useStatusStyles('task');
//     return (
//         <div className="space-y-2">
//             <div className="grid grid-cols-3 text-sm font-semibold px-2">
//                 <span>Task Type</span>
//                 <span>Status</span>
//                 <span className="text-right">Date</span>
//             </div>
//             {tasks.map((task, index) => (
//                 <React.Fragment key={task.name}>
//                     <div onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="grid grid-cols-3 items-center px-2 py-3 cursor-pointer hover:bg-secondary rounded-md">
//                         <span className="font-medium truncate pr-2">{task.type}</span>
//                         <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${getTaskStatusClass(task.status)}`}>
//                             {task.status || 'N/A'}
//                         </span>
//                         <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
//                             <span>{formatDate(task.start_date)}</span>
//                             <ChevronRight className="w-4 h-4" />
//                         </div>
//                     </div>
//                     {index < tasks.length - 1 && <Separator />}
//                 </React.Fragment>
//             ))}
//         </div>
//     );
// };

// export const ContactSubPages = ({ boqs, tasks }: ContactSubPagesProps) => {
//     const navigate = useNavigate();
//    const getBoqStatusClass = useStatusStyles('boq'); 

//     const [searchQuery, setSearchQuery] = useState("");

//     // --- ADD THE FOLLOWING TWO BLOCKS OF CODE ---

//     // 1. Memoized filtering for BOQs
//     const filteredBoqs = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return boqs; // If search is empty, return all

//         return boqs.filter(boq => 
//             boq.boq_name?.toLowerCase().includes(lowercasedQuery) ||
//             boq.boq_status?.toLowerCase().includes(lowercasedQuery)
//         );
//     }, [boqs, searchQuery]); // Dependencies: re-run only when these change

//     // 2. Memoized filtering for Tasks
//     const filteredTasks = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return tasks;

//         return tasks.filter(task => 
//             task.type?.toLowerCase().includes(lowercasedQuery) ||
//             task.status?.toLowerCase().includes(lowercasedQuery)
//         );
//     }, [tasks, searchQuery]);

//     return (
//         <div>
//             <h2 className="text-lg font-semibold mb-2">Other Details</h2>
//             <Tabs defaultValue="boqs" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 bg-transparent p-0">
//                     <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs</TabsTrigger>
//                     <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks</TabsTrigger>
//                 </TabsList>

//                 <div className="relative my-4">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                      <Input 
//         placeholder="Search..." 
//         className="pl-10"
//         value={searchQuery}
//         onChange={(e) => setSearchQuery(e.target.value)}
//     />
//                 </div>

//                 <TabsContent value="boqs">
//                     <div className="space-y-2">
//                         <div className="grid grid-cols-[1fr,1fr,1fr] text-sm font-semibold px-2">
//                             <span>Name</span>
//                             <span>Status</span>
//                             <span className="text-right">Date</span>
//                         </div>
//                         {filteredBoqs?.map((boq, index) => (
//                             <React.Fragment key={boq.name}>
//                                 <div onClick={() => navigate(`/boqs/boq?id=${boq.name}`)} className="grid grid-cols-[1fr,1fr,1fr] items-center px-2 py-3 cursor-pointer">
//                                     <span className="font-medium">{boq.boq_name}</span>
//                                     <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getBoqStatusClass(boq.boq_status)}`}>
//                                         {boq.boq_status || 'N/A'}
//                                     </span>
//                                     <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
//                                         <span>{formatDate(boq.boq_submission_date)}</span>
//                                         <ChevronRight className="w-4 h-4" />
//                                     </div>
//                                 </div>
//                                 {index < boqs.length - 1 && <Separator />}
//                             </React.Fragment>
//                         ))}
//                     </div>
//                 </TabsContent>

//                 <TabsContent value="tasks">
//                     {filteredTasks && filteredTasks.length > 0 ? (
//                         <TaskList tasks={filteredTasks} />
//                     ) : (
//                         <p className="text-center text-muted-foreground py-8">No tasks found for this contact.</p>
//                     )}
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// };