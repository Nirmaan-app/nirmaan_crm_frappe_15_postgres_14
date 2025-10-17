// // src/pages/Contacts/ContactSubPages.tsx

// import { Input } from "@/components/ui/input";
// import { Separator } from "@/components/ui/separator";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { ChevronRight, Search } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import React, { useState, useMemo } from "react";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { useViewport } from "@/hooks/useViewPort"; // <-- 1. IMPORT THE HOOK
// import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
// import { StatusPill } from "@/pages/Tasks/TasksVariantPage"
// import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

// interface ContactSubPagesProps {
//     boqs: CRMBOQ[];
//     tasks: CRMTask[];
// }

// // --- Sub-component for rendering the BOQ list (Refactored) ---
// const BoqList = ({ boqs }: { boqs: CRMBOQ[] }) => {
//     const navigate = useNavigate();
//     const { isMobile } = useViewport(); // <-- 2. USE THE HOOK
//     const getBoqStatusClass = useStatusStyles('boq');

//     return (
//         <div className="rounded-md border">
//             <Table>
//                 <TableHeader>
//                     <TableRow>
//                         <TableHead>Name</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead className="text-right">Received Date</TableHead>
//                         <TableHead className="text-right">Submission Deadline</TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {boqs.map((boq) => (
//                         <TableRow
//                             key={boq.name}
//                             // --- 3. IMPLEMENT CONDITIONAL NAVIGATION ---
//                             onClick={() => {
//                                 const path = `/boqs/boq?id=${boq.name}`
//                                 navigate(path);
//                             }}
//                             className="cursor-pointer"
//                         >
//                             <TableCell className="font-medium text-blue-600 underline">{boq.boq_name}</TableCell>
//                             <TableCell>
//                                 <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
//                                     {boq.boq_status || 'N/A'}
//                                 </span>
//                             </TableCell>
//                             <TableCell className="text-right">{formatDateWithOrdinal(boq.creation)||"--"}</TableCell>
//                             <TableCell className="text-right">{formatDateWithOrdinal(boq.boq_submission_date) || "--"}</TableCell>
//                         </TableRow>
//                     ))}
//                 </TableBody>
//             </Table>
//         </div>
//     );
// };


// // --- Sub-component for rendering the Task list (Refactored) ---
// const TaskList = ({ tasks }: { tasks: CRMTask[] }) => {
//     const navigate = useNavigate();
//     const { isMobile } = useViewport(); // <-- 2. USE THE HOOK
//     const getTaskStatusClass = useStatusStyles('task');

//     return (
//         <div className="rounded-md border">
//             <Table>
//                 <TableHeader>
//                     <TableRow>
//                         {/* This column is visible on all screen sizes */}
//                         <TableHead>Task Details</TableHead>

//                         {/* These columns will ONLY appear on desktop (md screens and up) */}
//                         {/* <TableHead className="hidden md:table-cell">Company</TableHead>
//                         <TableHead className="hidden md:table-cell">Status</TableHead> */}
//                         <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>

//                         <TableHead className="hidden md:table-cell text-center">Scheduled for</TableHead>
//                         {/* <TableHead className="hidden md:table-cell text-center">Last Updated</TableHead> */}


//                         {/* Chevron column */}
//                         <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
//                     </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                     {tasks.length > 0 ? (
//                         tasks.map((task) => (
//                             <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">

//                                 {/* --- MOBILE & DESKTOP: Combined Cell --- */}
//                                 <TableCell>
//                                     {isMobile ?
//                                         (<div className="flex items-center gap-3">
//                                             <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
//                                             <div className="flex flex-col">
//                                                 <span>                                                <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>

                                                                     
//                                                                                                                        </span>
//                                                 {/* On mobile, show the date here. Hide it on larger screens. */}
//                                                 {task.remarks && (<span className="inline-block text-xs   rounded-md  py-0.5 mt-1 md:hidden self-start">
//                                                     Remarks: {task.remarks}
//                                                 </span>)}
//                                                 <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
//                                                     Scheduled for: {formatDateWithOrdinal(task.start_date)}
//                                                 </span>
//                                             </div>
//                                         </div>) : (<div className="flex items-center gap-3">
//                                             <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
//                                             <div>

//                                                 <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>


//                                             </div>
//                                         </div>)}
//                                 </TableCell>

//                                 {/* --- DESKTOP ONLY Cells --- */}
//                                 {/* <TableCell className="hidden md:table-cell">{task.company_name}</TableCell>
//                                 <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell> */}
//                                 <TableCell className="hidden md:table-cell text-center">{task.remarks || "--"}</TableCell>
//                                 <TableCell className="hidden md:table-cell text-right">
//                                     <div className="flex flex-col items-center">
//                                         <span>{formatDateWithOrdinal(task.start_date)}</span>
//                                         {/* <span className="text-xs text-muted-foreground text-center">
//                                             {formatTime12Hour(task?.time)}
//                                         </span> */}
//                                     </div>
//                                 </TableCell>
//                                 {/* <TableCell className="hidden md:table-cell text-right">{formatDateWithOrdinal(task.modified)}</TableCell> */}

//                                 <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
//                             </TableRow>
//                         ))
//                     ) : (
//                         <TableRow>
//                             <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
//                         </TableRow>
//                     )}
//                 </TableBody>
//             </Table>
//         </div>
//     );
// };

// export const ContactSubPages = ({ boqs, tasks }: ContactSubPagesProps) => {
//     const [searchQuery, setSearchQuery] = useState("");

//     const filteredBoqs = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return boqs;
//         return boqs.filter(boq => boq.boq_name?.toLowerCase().includes(lowercasedQuery) || boq.boq_status?.toLowerCase().includes(lowercasedQuery));
//     }, [boqs, searchQuery]);

//     const filteredTasks = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return tasks;
//         return tasks.filter(task => task.type?.toLowerCase().includes(lowercasedQuery) || task.status?.toLowerCase().includes(lowercasedQuery));
//     }, [tasks, searchQuery]);

//     return (
//         <div>
//             <h2 className="text-lg font-semibold mb-2">BOQs Details</h2>
//             <Tabs defaultValue="boqs" className="w-full">
//                 <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 border">
//                     <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                         {filteredBoqs.length}
//                     </span></TabsTrigger>
//                     <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                         {filteredTasks.length}
//                     </span></TabsTrigger>
//                 </TabsList>

//                 <div className="relative my-4">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                     <Input
//                         placeholder="Search..."
//                         className="pl-10"
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                 </div>

//                 <TabsContent value="boqs">
//                     {filteredBoqs?.length > 0
//                         ? <BoqList boqs={filteredBoqs} />
//                         : <p className="text-center text-muted-foreground py-8">No BOQs found for this contact.</p>
//                     }
//                 </TabsContent>

//                 <TabsContent value="tasks">
//                     {filteredTasks && filteredTasks.length > 0
//                         ? <TaskList tasks={filteredTasks} />
//                         : <p className="text-center text-muted-foreground py-8">No tasks found for this contact.</p>
//                     }
//                 </TabsContent>
//             </Tabs>
//         </div>
//     );
// };



import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Old table components
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useMemo } from "react"; 
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useViewport } from "@/hooks/useViewPort";
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
import { StatusPill } from "@/pages/Tasks/TasksVariantPage"
import { formatDateWithOrdinal, formatTime12Hour } from "@/utils/FormatDate";

// DATATABLE IMPORTS
import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';


// --- Interface and Helper Components ---

interface ContactSubPagesProps {
  boqs: CRMBOQ[];
  tasks: CRMTask[];
  // contactName: string; // Removed from here as it's not a required prop of the Main component
}


// --- Refactored Sub-component for rendering the BOQ list ---
const BoqDataTable = ({ boqs }: { boqs: CRMBOQ[] }) => {
  const navigate = useNavigate();
  const { isMobile } = useViewport();
  const getBoqStatusClass = useStatusStyles('boq');

  // Boq Status Options
  const boqStatusOptions = useMemo(() => {
    if (!boqs) return [];
    const set = new Set<string>();
    boqs.forEach(b => b.boq_status && set.add(b.boq_status));
    return Array.from(set).map(status => ({ label: status, value: status }));
  }, [boqs]);

  // Boq Columns for Desktop (DataTable)
  const boqColumns = useMemo<DataTableColumnDef<CRMBOQ>[]>(() => [{
    accessorKey: "boq_name",
    meta: { title: "Name", enableSorting: true },
    cell: ({ row }) => (<span className="font-medium text-blue-600 underline"> {row.original.boq_name}</span>)
  }, {
    accessorKey: "boq_status",
    meta: { title: "Status", enableSorting: true, filterVariant: "select", filterOptions: boqStatusOptions },
    cell: ({ row }) => (<span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(row.original.boq_status)}`}> {row.original.boq_status || 'N/A'}</span>),
    filterFn: 'faceted',
  }, {
    accessorKey: "creation",
    meta: { title: "Received Date", filterVariant: "date", enableSorting: true },
    cell: ({ row }) => <span>{formatDateWithOrdinal(row.original.creation) || '--'}</span>,
    filterFn: 'dateRange',
  }, {
    accessorKey: "boq_submission_date",
    meta: { title: "Submission Deadline", filterVariant: "date", enableSorting: true },
    cell: ({ row }) => <span>{formatDateWithOrdinal(row.original.boq_submission_date) || '--'}</span>,
    filterFn: 'dateRange',
  }], [boqStatusOptions, getBoqStatusClass]);

  const tableLogic = useDataTableLogic<CRMBOQ>({
    data: boqs,
    columns: boqColumns,
    initialSorting: [{ id: 'creation', desc: true }],
    customGlobalFilterFn: ['boq_name', 'boq_status']
  });

  // Destructure for mobile rendering
  const { table, globalFilter, setGlobalFilter } = tableLogic;
  const mobileRows = table.getRowModel().rows;


  if (isMobile) {
    // Mobile View: Uses old Table/Row for the simple table look (as per CompanySubPages/BOQ)
    return (
        <div className="flex flex-col gap-4">
            {/* MOBILE SEARCH INPUT (Manually added) */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search BOQs..."
                    className="pl-10"
                    value={globalFilter ?? ''}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                />
            </div>
            {/* END MOBILE SEARCH INPUT */}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Received Date</TableHead>
                            <TableHead className="text-right">Submission Deadline</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mobileRows.length > 0 ? (
                            mobileRows.map((row) => {
                                const boq = row.original;
                                return (
                                    <TableRow 
                                        key={boq.name} 
                                        onClick={() => {
                                            const path = `/boqs/boq?id=${boq.name}`
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
                                        <TableCell className="text-right">{formatDateWithOrdinal(boq.creation)||"--"}</TableCell>
                                        <TableCell className="text-right">{formatDateWithOrdinal(boq.boq_submission_date)||"--"}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">No BOQs found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
  }

  // Desktop View: Full Data Table with Filters
  return (
    <DataTable
      tableLogic={tableLogic}
      isLoading={false}
      headerTitle={<span>BOQ List</span>}
      noResultsMessage="No BOQs found."
      globalSearchPlaceholder="Search BOQs by name or status..."
      className="h-full"
      shouldExpandHeight={true}
      gridColsClass="md:grid-cols-[2fr,1.5fr,1.5fr,1.5fr]"
      onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
    />
  );
};


// --- Refactored Sub-component for rendering the Task list ---
const TaskDataTable = ({ tasks, contactName }: { tasks: CRMTask[], contactName: string }) => {
    const navigate = useNavigate();
    const { isMobile } = useViewport();
    
    // Task Type Options
    const taskTypeOptions = useMemo(() => {
        if (!tasks) return [];
        const set = new Set<string>();
        tasks.forEach(t => t.type && set.add(t.type));
        return Array.from(set).map(type => ({ label: type, value: type }));
    }, [tasks]);

    // Task Status Options
    const taskStatusOptions = useMemo(() => {
        if (!tasks) return [];
        const set = new Set<string>();
        tasks.forEach(t => t.status && set.add(t.status));
        return Array.from(set).map(status => ({ label: status, value: status }));
    }, [tasks]);

    // Task Columns for Desktop (DataTable)
    const taskColumns = useMemo<DataTableColumnDef<CRMTask>[]>(() => [{
        accessorKey: "type",
        meta: { title: "Task", enableSorting: true, filterVariant: "select", filterOptions: taskTypeOptions },
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <TaskStatusIcon status={row.original.status} className="flex-shrink-0" />
                <div className="text-sm">
                    {/* Using contactName for consistency since it's a contact-related task */}
                    <span className="font-semibold ">{row.original.type}</span> with <span className="font-semibold">{row.original.first_name}</span> 
                </div>
            </div>
        ),
        filterFn: 'faceted',
    }, {
        accessorKey: "status",
        meta: { title: "Status", enableSorting: true, filterVariant: "select", filterOptions: taskStatusOptions },
        cell: ({ row }) => <StatusPill status={row.original.status} />,
        filterFn: 'faceted',
    }, {
        accessorKey: "remarks",
        meta: { title: "Remarks", enableSorting: false },
        cell: ({ row }) => <span>{row.original.remarks || '--'}</span>
    }, {
        accessorKey: "start_date",
        meta: { title: "Scheduled for", filterVariant: "date", enableSorting: true },
        cell: ({ row }) => (
            <div className="flex flex-col items-start">
                <span>{formatDateWithOrdinal(row.original.start_date)}</span>
                <span className="text-xs text-muted-foreground"> {row.original.time ? formatTime12Hour(row.original.time) : ''}</span>
            </div>
        ),
        filterFn: 'dateRange',
    },
   
    ], [taskTypeOptions, taskStatusOptions]);

    const tableLogic = useDataTableLogic<CRMTask>({
        data: tasks,
        columns: taskColumns,
        initialSorting: [{ id: 'start_date', desc: true }],
        customGlobalFilterFn: ['type', 'remarks', 'status']
    });

    // Destructure for mobile rendering
    const { table: taskTable, globalFilter: taskGlobalFilter, setGlobalFilter: setTaskGlobalFilter } = tableLogic;
    const mobileTaskRows = taskTable.getRowModel().rows;


    if (isMobile) {
        // Mobile View: Uses old Table/Row for the detailed list look (as per CompanySubPages/Task)
        return (
            <div className="flex flex-col gap-4">
                {/* MOBILE SEARCH INPUT (Manually added) */}
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search Tasks..."
                        className="pl-10"
                        value={taskGlobalFilter ?? ''}
                        onChange={(event) => setTaskGlobalFilter(event.target.value)}
                    />
                </div>
                {/* END MOBILE SEARCH INPUT */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {/* Only show one main header on mobile for this list style */}
                                <TableHead>Task Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mobileTaskRows.length > 0 ? (
                                mobileTaskRows.map((row) => {
                                    const task = row.original;
                                    return (
                                        <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                    <div className="flex flex-col">
                                                        <span>
                                                            <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task.first_name}</span>
                                                        </span>
                                                        {task.remarks && (<span className="inline-block text-xs py-0.5 mt-1 self-start">
                                                            Remarks: {task.remarks}
                                                        </span>)}
                                                        <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 self-start">
                                                            Scheduled for: {formatDateWithOrdinal(task.start_date)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-[5%]"><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="text-center h-24">No tasks found in this category.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    }

    // Desktop View: Full Data Table with Filters
    return (
        <DataTable
            tableLogic={tableLogic}
            isLoading={false}
            headerTitle={<span>Task List</span>}
            noResultsMessage="No tasks found."
            globalSearchPlaceholder="Search tasks by type or remarks..."
            className="h-full"
            shouldExpandHeight={true}
            gridColsClass="md:grid-cols-[2fr,1fr,2fr,1.5fr,0.5fr]" // Including a column for the Chevron/Action column
            onRowClick={(row) => navigate(`/tasks/task?id=${row.original.name}`)}
        />
    );
};

// --- Main Component ---
export const ContactSubPages = ({ boqs, tasks }: ContactSubPagesProps) => {

    // Note: The main component does not need manual search/filter logic since DataTable handles it.

    return (
        <div>
            {/* The title remains separate from the tabs component for now */}
            {/* <h2 className="text-lg font-semibold mb-2">Activities and Opportunities</h2> */}
            <Tabs defaultValue="boqs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-transparent p-0 border">
                    <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {boqs.length}
                    </span></TabsTrigger>
                    <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks<span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
                        {tasks.length}
                    </span></TabsTrigger>
                </TabsList>

                {/* The global search input is removed here as it is handled inside each DataTable */}
                
                <TabsContent value="boqs" className="mt-4">
                    {boqs?.length > 0
                        ? <BoqDataTable boqs={boqs} />
                        : <p className="text-center text-muted-foreground py-8">No BOQs found for this contact.</p>
                    }
                </TabsContent>

                <TabsContent value="tasks" className="mt-4">
                    {tasks && tasks.length > 0
                        ? <TaskDataTable tasks={tasks}/>
                        : <p className="text-center text-muted-foreground py-8">No tasks found for this contact.</p>
                    }
                </TabsContent>
            </Tabs>
        </div>
    );
};