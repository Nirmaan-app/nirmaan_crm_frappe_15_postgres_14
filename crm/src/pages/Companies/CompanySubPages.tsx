// // src/pages/Companies/CompanySubPages.tsx

// import { Input } from "@/components/ui/input";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { ChevronRight, Search } from "lucide-react";
// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { useViewport } from "@/hooks/useViewPort";
// import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
// import {StatusPill} from "@/pages/Tasks/TasksVariantPage"

// import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";
// interface CompanySubPagesProps {
//     boqs: CRMBOQ[];
//     contacts: CRMContacts[];
//     tasks: CRMTask[];
// }

// // --- Sub-component for rendering the BOQ list ---
// const BoqList = ({ boqs }: { boqs: CRMBOQ[] }) => {
//     const navigate = useNavigate();
//     const { isMobile } = useViewport();
//     const getBoqStatusClass = useStatusStyles('boq'); 
    
//     return (
//          <div className="rounded-md border">
//         <Table>
//             <TableHeader>
//                 <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead className="text-right">Received Date</TableHead>
//                     <TableHead className="text-right">Submission Deadline</TableHead>
//                 </TableRow>
//             </TableHeader>
//             <TableBody>
//                 {boqs.map((boq) => (
//                    <TableRow 
//                             key={boq.name} 
//                             // --- 3. IMPLEMENT CONDITIONAL NAVIGATION ---
//                             onClick={() => {
//                                 const path = `/boqs/boq?id=${boq.name}`
//                                 navigate(path);
//                             }} 
//                             className="cursor-pointer"
//                         >
//                         <TableCell className="font-medium text-blue-600 underline">{boq.boq_name}</TableCell>
//                         <TableCell>
//                             <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(boq.boq_status)}`}>
//                                 {boq.boq_status || 'N/A'}
//                             </span>
//                         </TableCell>
//                         <TableCell className="text-right">{formatDateWithOrdinal(boq.creation)||"--"}</TableCell>
//                         <TableCell className="text-right">{formatDateWithOrdinal(boq.boq_submission_date)||"--"}</TableCell>
//                     </TableRow>
//                 ))}
//             </TableBody>
//         </Table>
//         </div>
//     );
// };

// // --- Sub-component for rendering the Contact list ---
// const ContactList = ({ contacts }: { contacts: CRMContacts[] }) => {
//     const navigate = useNavigate();
//     const { isMobile } = useViewport();


//     return (
//          <div className="rounded-md border">
//         <Table>
//             <TableHeader>
//                 <TableRow>
//                     <TableHead>Name</TableHead>
//                     <TableHead className="text-right">Designation</TableHead>
//                 </TableRow>
//             </TableHeader>
//             <TableBody>
//                 {contacts.map((contact) => (
//                      <TableRow 
//                             key={contact.name} 
//                             // --- APPLY CONDITIONAL NAVIGATION ---
//                             onClick={() => {
//                                 const path = `/contacts/contact?id=${contact.name}`
//                                 navigate(path);
//                             }} 
//                             className="cursor-pointer"
//                         >
//                         <TableCell className="font-medium text-blue-600 underline">{contact.first_name} {contact.last_name}</TableCell>
//                         <TableCell className="text-right">{contact.designation || 'N/A'}</TableCell>
//                     </TableRow>
//                 ))}
//             </TableBody>
//         </Table>
//         </div>
//     );
// };

// // --- Sub-component for rendering the Task list ---
// const TaskList = ({ tasks, contacts }: { tasks: CRMTask[], contacts: CRMContacts[] }) => {
//     const navigate = useNavigate();
//     const contactMap = new Map(contacts.map(c => [c.name, `${c.first_name} ${c.last_name}`]));
//     const { isMobile } = useViewport();
    
//     return (
//           <div className="rounded-md border">
//         <Table>
//             <TableHeader>
               
//                      <TableRow>
//                                 {/* This column is visible on all screen sizes */}
//                                 <TableHead>Task Details</TableHead>
                                
//                                 {/* These columns will ONLY appear on desktop (md screens and up) */}
//                                 {/* <TableHead className="hidden md:table-cell">Company</TableHead> */}
//                                 {/* <TableHead className="hidden md:table-cell">Status</TableHead> */}

//                                 <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>

                                
//                                  <TableHead className="hidden md:table-cell text-center">Scheduled for</TableHead>
//                                 {/* <TableHead className="hidden md:table-cell text-center">Last Updated</TableHead> */}
                                
//                                 {/* Chevron column */}
//                                 <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
//                             </TableRow>
          
//             </TableHeader>
//             <TableBody>
//                 {tasks.length > 0 ? (
//                                                tasks.map((task) => (
//                                                    <TableRow key={task.name} onClick={() => navigate(`/tasks/task?id=${task.name}`)} className="cursor-pointer">
                                                       
//                                                        {/* --- MOBILE & DESKTOP: Combined Cell --- */}
//                                                        <TableCell >
//                                                         {isMobile?
//                                                            (<div className="flex items-center gap-3">
//                                                                <TaskStatusIcon status={task.status} className=" flex-shrink-0"/>
//                                                                <div className="flex flex-col">
//                                                                    <span>                                                <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>

                                                                     
//                                                                                                                        </span>
//                                                                            {task.remarks &&(                                                                <span className="inline-block text-xs   rounded-md  py-0.5 mt-1 md:hidden self-start">
//                                                                        Remarks: {task.remarks}
//                                                                    </span>)}
//                                                                    {/* On mobile, show the date here. Hide it on larger screens. */}
//                                                                     <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
//                                                                        Scheduled for: {formatDateWithOrdinal(task.start_date)}
//                                                                    </span>
//                                                                </div>
//                                                            </div>):(<div className="flex items-center gap-3">
//                                                                <TaskStatusIcon status={task.status} className=" flex-shrink-0"/>
//                                                                {/* <div className="flex flex-col"> */}
//                                                                <div>

// <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>
                                                                  
                                                                    
//                                                                </div>
//                                                            </div>)}
//                                                        </TableCell>
               
//                                                        {/* --- DESKTOP ONLY Cells --- */}
//                                                         <TableCell className="hidden md:table-cell text-center">{task.remarks||"--"}</TableCell>
                                                        
//                                                        {/* <TableCell className="hidden md:table-cell">{task.company_name}</TableCell> */}
//                                                        {/* <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell> */}

//                                                       <TableCell className="hidden md:table-cell text-right">
//   <div className="flex flex-col items-center">
//     <span>{formatDateWithOrdinal(task.start_date)}</span>
//     {/* <span className="text-xs text-muted-foreground text-center">
//       {formatTime12Hour(task?.time)}
//     </span> */}
//   </div>
// </TableCell>
//                                                        {/* <TableCell className="hidden md:table-cell text-right">{formatDateWithOrdinal(task.modified)}</TableCell> */}
               
//                                                        <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
//                                                    </TableRow>
//                                                ))
//                                            ) : (
//                                                <TableRow>
//                                                    <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
//                                                </TableRow>
//                                            )}
//             </TableBody>
//         </Table>
//         </div>
//     );
// }

// // --- Main Component ---
// export const CompanySubPages = ({ boqs, contacts, tasks }: CompanySubPagesProps) => {
//     const [searchQuery, setSearchQuery] = useState("");
    
//     // Filtering logic remains the same
//     const filteredBoqs = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return boqs;
//         return boqs.filter(boq => boq.boq_name?.toLowerCase().includes(lowercasedQuery) || boq.boq_status?.toLowerCase().includes(lowercasedQuery));
//     }, [boqs, searchQuery]);

//     const filteredContacts = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return contacts;
//         return contacts.filter(contact => {
//             const fullName = `${contact.first_name} ${contact.last_name}`.toLowerCase();
//             return (fullName.includes(lowercasedQuery) || contact.designation?.toLowerCase().includes(lowercasedQuery));
//         });
//     }, [contacts, searchQuery]);

//     const filteredTasks = useMemo(() => {
//         const lowercasedQuery = searchQuery.toLowerCase().trim();
//         if (!lowercasedQuery) return tasks;
//         const contactMap = new Map(contacts.map(c => [c.name, `${c.first_name} ${c.last_name}`]));
//         return tasks.filter(task => {
//             const contactName = contactMap.get(task.contact)?.toLowerCase() || '';
//             return (task.type?.toLowerCase().includes(lowercasedQuery) || contactName.includes(lowercasedQuery));
//         });
//     }, [tasks, contacts, searchQuery]);


//     return (
//         <Tabs defaultValue="boqs" className="w-full">
//             <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border">
//                 <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {filteredBoqs.length}
//                             </span></TabsTrigger>
//                 <TabsTrigger value="contacts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none border-x">Contacts <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {filteredContacts.length}
//                             </span></TabsTrigger>
//                 <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {filteredTasks.length}
//                             </span></TabsTrigger>
//             </TabsList>

//             <div className="relative my-4">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
//                 <Input 
//                     placeholder="Search..." 
//                     className="pl-10"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//             </div>

//             <TabsContent value="boqs">
//                 {filteredBoqs?.length > 0 
//                     ? <BoqList boqs={filteredBoqs} /> 
//                     : <p className="text-center text-muted-foreground py-8">No BOQs found for this company.</p>
//                 }
//             </TabsContent>

//             <TabsContent value="contacts">
//                  {filteredContacts?.length > 0 
//                     ? <ContactList contacts={filteredContacts} /> 
//                     : <p className="text-center text-muted-foreground py-8">No contacts found for this company.</p>
//                 }
//             </TabsContent>

//             <TabsContent value="tasks">
//                 {filteredTasks?.length > 0 
//                     ? <TaskList tasks={filteredTasks} contacts={contacts} /> 
//                     : <p className="text-center text-muted-foreground py-8">No tasks found for this company.</p>
//                 }
//             </TabsContent>
//         </Tabs>
//     );
// };



// import { Input } from "@/components/ui/input"; // Keeping in case other parts of the app use it
// // REMOVED: Table, TableBody, TableCell, TableHead, TableHeader, TableRow are replaced by DataTable
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
// import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
// import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
// import { Search } from "lucide-react"; // Keeping in case other parts of the app use it
// import React, { useMemo } from "react"; // Removed useState as manual search is gone
// import { useNavigate } from "react-router-dom";
// import { useStatusStyles } from "@/hooks/useStatusStyles";
// import { useViewport } from "@/hooks/useViewPort";
// import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
// import { StatusPill } from "@/pages/Tasks/TasksVariantPage"

// import { formatDateWithOrdinal, formatTime12Hour } from "@/utils/FormatDate";

// // ADDED IMPORTS FOR DATATABLE FUNCTIONALITY
// import { ColumnFiltersState, Row } from '@tanstack/react-table';
// import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';
// import { DataTableColumnDef } from '@/components/table/utils/table-filters';
// import { DataTable } from '@/components/table/data-table'; 
// // END ADDED IMPORTS

// interface CompanySubPagesProps {
//     boqs: CRMBOQ[];
//     contacts: CRMContacts[];
//     tasks: CRMTask[];
// }

// // --- Refactored Sub-component for rendering the BOQ list using DataTable ---
// const BoqDataTable = ({ boqs }: { boqs: CRMBOQ[] }) => {
//     const navigate = useNavigate();
//     const getBoqStatusClass = useStatusStyles('boq');
    
//     // 1. Filter Options for Status
//     const boqStatusOptions = useMemo(() => {
//         if (!boqs) return [];
//         const set = new Set<string>();
//         boqs.forEach(b => b.boq_status && set.add(b.boq_status));
//         return Array.from(set).map(status => ({ label: status, value: status }));
//     }, [boqs]);

//     // 2. Columns Definition with Faceted/Date Filters
//     const boqColumns = useMemo<DataTableColumnDef<CRMBOQ>[]>(() => [
//         {
//             accessorKey: "boq_name",
//             meta: { title: "Name", enableSorting: true },
//             cell: ({ row }) => (
//                 <span className="font-medium text-blue-600 underline">
//                     {row.original.boq_name}
//                 </span>
//             ),
//         },
//         {
//             accessorKey: "boq_status",
//             meta: { 
//                 title: "Status", 
//                 enableSorting: true, 
//                 filterVariant: "select", 
//                 filterOptions: boqStatusOptions 
//             },
//             cell: ({ row }) => (
//                 <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status || 'N/A'}
//                 </span>
//             ),
//             filterFn: 'faceted', // Enables faceted filtering
//         },
//         {
//             accessorKey: "creation", // Assuming 'creation' is the received date
//             meta: { 
//                 title: "Received Date", 
//                 filterVariant: "date", 
//                 enableSorting: true 
//             },
//             cell: ({ row }) => <span>{formatDateWithOrdinal(row.original.creation) || '--'}</span>,
//             filterFn: 'dateRange', // Enables date range filtering
//         },
//         {
//             accessorKey: "boq_submission_date",
//             meta: { 
//                 title: "Submission Deadline", 
//                 filterVariant: "date", 
//                 enableSorting: true 
//             },
//             cell: ({ row }) => <span>{formatDateWithOrdinal(row.original.boq_submission_date) || '--'}</span>,
//             filterFn: 'dateRange', // Enables date range filtering
//         },
//     ], [boqStatusOptions, getBoqStatusClass]);

//     // 3. DataTable Logic
//     const tableLogic = useDataTableLogic<CRMBOQ>({
//         data: boqs,
//         columns: boqColumns,
//         initialSorting: [{ id: 'creation', desc: true }],
//         customGlobalFilterFn: ['boq_name', 'boq_status'],
//     });
    
//     // 4. Mobile Row Renderer
//     const renderMobileRow = (row: Row<CRMBOQ>) => (
//         <div 
//             className="flex flex-col p-3 border-b cursor-pointer hover:bg-gray-50" 
//             onClick={() => navigate(`/boqs/boq?id=${row.original.name}`)}
//         >
//             <div className="flex justify-between items-center">
//                 <span className="font-semibold text-blue-600">{row.original.boq_name}</span>
//                 <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getBoqStatusClass(row.original.boq_status)}`}>
//                     {row.original.boq_status || 'N/A'}
//                 </span>
//             </div>
//             <div className="text-xs text-muted-foreground mt-1">
//                 Received: {formatDateWithOrdinal(row.original.creation) || '--'}
//             </div>
//             <div className="text-xs text-muted-foreground">
//                 Deadline: {formatDateWithOrdinal(row.original.boq_submission_date) || '--'}
//             </div>
//         </div>
//     );

//     // 5. Render DataTable
//     return (
//         <DataTable
//             tableLogic={tableLogic}
//             isLoading={false}
//             // renderMobileRow={renderMobileRow}
//             headerTitle={<span>BOQ List</span>}
//             noResultsMessage="No BOQs found."
//             globalSearchPlaceholder="Search BOQs by name or status..."
//             className="h-full"
//             shouldExpandHeight={true}
//             gridColsClass="md:grid-cols-[2fr,1.5fr,1.5fr,1.5fr]"
//             onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)} // Add row click handler
//         />
//     );
// };

// // --- Refactored Sub-component for rendering the Contact list using DataTable ---
// const ContactDataTable = ({ contacts }: { contacts: CRMContacts[] }) => {
//     const navigate = useNavigate();

//     // 1. Filter Options for Designation
//     const contactDesignationOptions = useMemo(() => {
//         if (!contacts) return [];
//         const set = new Set<string>();
//         contacts.forEach(c => c.designation && set.add(c.designation));
//         return Array.from(set).map(designation => ({ label: designation, value: designation }));
//     }, [contacts]);

//     // 2. Columns Definition with Faceted Filter
//     const contactColumns = useMemo<DataTableColumnDef<CRMContacts>[]>(() => [
//         {
//             accessorKey: "first_name",
//             meta: { title: "Name", enableSorting: true },
//             cell: ({ row }) => (
//                 <span className="font-medium text-blue-600 underline">
//                     {row.original.first_name} {row.original.last_name}
//                 </span>
//             ),
//         },
//         {
//             accessorKey: "designation",
//             meta: { 
//                 title: "Designation", 
//                 filterVariant: "select", 
//                 filterOptions: contactDesignationOptions, 
//                 enableSorting: true 
//             },
//             cell: ({ row }) => <span>{row.original.designation || 'N/A'}</span>,
//             filterFn: 'faceted', // Enables faceted filtering
//         },
//     ], [contactDesignationOptions]);

//     // 3. DataTable Logic
//     const tableLogic = useDataTableLogic<CRMContacts>({
//         data: contacts,
//         columns: contactColumns,
//         initialSorting: [{ id: 'first_name', desc: false }],
//         customGlobalFilterFn: ['first_name', 'last_name', 'designation'],
//     });

//     // 4. Mobile Row Renderer
//     const renderMobileRow = (row: Row<CRMContacts>) => (
//         <div 
//             className="flex justify-between items-center p-3 border-b cursor-pointer hover:bg-gray-50" 
//             onClick={() => navigate(`/contacts/contact?id=${row.original.name}`)}
//         >
//             <span className="font-semibold text-blue-600">
//                 {row.original.first_name} {row.original.last_name}
//             </span>
//             <span className="text-sm text-muted-foreground">
//                 {row.original.designation || 'N/A'}
//             </span>
//         </div>
//     );

//     // 5. Render DataTable
//     return (
//         <DataTable
//             tableLogic={tableLogic}
//             isLoading={false}
//             // renderMobileRow={renderMobileRow}
//             headerTitle={<span>Contact List</span>}
//             noResultsMessage="No contacts found."
//             globalSearchPlaceholder="Search contacts by name or designation..."
//             className="h-full"
//             shouldExpandHeight={true}
//             gridColsClass="md:grid-cols-[2fr,1fr]"
//             onRowClick={(row) => navigate(`/contacts/contact?id=${row.original.name}`)}
//         />
//     );
// };

// // --- Refactored Sub-component for rendering the Task list using DataTable ---
// const TaskDataTable = ({ tasks, contacts }: { tasks: CRMTask[], contacts: CRMContacts[] }) => {
//     const navigate = useNavigate();
//     const contactMap = useMemo(() => 
//         new Map(contacts.map(c => [c.name, `${c.first_name} ${c.last_name}`]))
//     , [contacts]);

//     // 1. Filter Options for Type and Status
//     const taskTypeOptions = useMemo(() => {
//         if (!tasks) return [];
//         const set = new Set<string>();
//         tasks.forEach(t => t.type && set.add(t.type));
//         return Array.from(set).map(type => ({ label: type, value: type }));
//     }, [tasks]);

//     const taskStatusOptions = useMemo(() => {
//         if (!tasks) return [];
//         const set = new Set<string>();
//         tasks.forEach(t => t.status && set.add(t.status));
//         return Array.from(set).map(status => ({ label: status, value: status }));
//     }, [tasks]);


//     // 2. Columns Definition with Faceted/Date Filters
//     const taskColumns = useMemo<DataTableColumnDef<CRMTask>[]>(() => [
//         {
//             accessorKey: "type",
//             meta: { 
//                 title: "Task Details", 
//                 enableSorting: true, 
//                 filterVariant: "select", 
//                 filterOptions: taskTypeOptions 
//             },
//             cell: ({ row }) => (
//                 <div className="flex items-center gap-3">
//                     <TaskStatusIcon status={row.original.status} className="flex-shrink-0" />
//                     <div>
//                         <span className="font-semibold">{row.original.type}</span> with <span className="font-semibold">{contactMap.get(row.original.contact) || row.original.first_name}</span>
//                     </div>
//                 </div>
//             ),
//             filterFn: 'faceted', // Enables faceted filtering
//         },
//         {
//             accessorKey: "status",
//             meta: { 
//                 title: "Status", 
//                 enableSorting: true, 
//                 filterVariant: "select", 
//                 filterOptions: taskStatusOptions 
//             },
//             cell: ({ row }) => <StatusPill status={row.original.status} />,
//             filterFn: 'faceted', // Enables faceted filtering
//         },
//         {
//             accessorKey: "remarks",
//             meta: { title: "Remarks", enableSorting: false },
//             cell: ({ row }) => <span>{row.original.remarks || '--'}</span>,
//         },
//         {
//             accessorKey: "start_date",
//             meta: { 
//                 title: "Scheduled for", 
//                 filterVariant: "date", 
//                 enableSorting: true 
//             },
//             cell: ({ row }) => (
//                 <div className="flex flex-col items-start">
//                     <span>{formatDateWithOrdinal(row.original.start_date)}</span>
//                     <span className="text-xs text-muted-foreground">
//                        {row.original.time ? formatTime12Hour(row.original.time) : ''}
//                     </span>
//                 </div>
//             ),
//             filterFn: 'dateRange', // Enables date range filtering
//         },
//     ], [taskTypeOptions, taskStatusOptions, contactMap]);

//     // 3. DataTable Logic
//     const tableLogic = useDataTableLogic<CRMTask>({
//         data: tasks,
//         columns: taskColumns,
//         initialSorting: [{ id: 'start_date', desc: true }],
//         customGlobalFilterFn: ['type', 'remarks', 'status'],
//     });

//     // 4. Mobile Row Renderer
//     const renderMobileRow = (row: Row<CRMTask>) => (
//         <div 
//             className="flex flex-col p-3 border-b cursor-pointer hover:bg-gray-50" 
//             onClick={() => navigate(`/tasks/task?id=${row.original.name}`)}
//         >
//             <div className="flex justify-between items-start">
//                 <div className="flex items-center gap-2">
//                     <TaskStatusIcon status={row.original.status} className="flex-shrink-0" />
//                     <span className="font-semibold">{row.original.type} with {contactMap.get(row.original.contact) || row.original.first_name}</span>
//                 </div>
//                 <StatusPill status={row.original.status} />
//             </div>
//             <div className="text-xs text-muted-foreground mt-1">
//                 Scheduled: {formatDateWithOrdinal(row.original.start_date) || '--'}
//             </div>
//             {row.original.remarks && (
//                 <div className="text-xs mt-1 italic">Remarks: {row.original.remarks}</div>
//             )}
//         </div>
//     );

//     // 5. Render DataTable
//     return (
//         <DataTable
//             tableLogic={tableLogic}
//             isLoading={false}
//             // renderMobileRow={renderMobileRow}
//             headerTitle={<span>Task List</span>}
//             noResultsMessage="No tasks found."
//             globalSearchPlaceholder="Search tasks by type or remarks..."
//             className="h-full"
//             shouldExpandHeight={true}
//             gridColsClass="md:grid-cols-[2fr,1fr,2fr,1.5fr]"
//             onRowClick={(row) => navigate(`/tasks/task?id=${row.original.name}`)}
//         />
//     );
// };


// // --- Main Component ---
// export const CompanySubPages = ({ boqs, contacts, tasks }: CompanySubPagesProps) => {
//     // REMOVED: Manual search state and filtering logic are now handled inside the DataTable components.

//     return (
//         <Tabs defaultValue="boqs" className="w-full">
//             <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border">
//                 <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">BOQs <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {boqs.length}
//                             </span></TabsTrigger>
//                 <TabsTrigger value="contacts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none border-x">Contacts <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {contacts.length}
//                             </span></TabsTrigger>
//                 <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">Tasks <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
//                                 {tasks.length}
//                             </span></TabsTrigger>
//             </TabsList>

//             {/* Manual search input removed as DataTable provides one */}

//             <TabsContent value="boqs" className="mt-4">
//                 {boqs?.length > 0 
//                     ? <BoqDataTable boqs={boqs} /> // Use DataTable component
//                     : <p className="text-center text-muted-foreground py-8">No BOQs found for this company.</p>
//                 }
//             </TabsContent>

//             <TabsContent value="contacts" className="mt-4">
//                  {contacts?.length > 0 
//                     ? <ContactDataTable contacts={contacts} /> // Use DataTable component
//                     : <p className="text-center text-muted-foreground py-8">No contacts found for this company.</p>
//                 }
//             </TabsContent>

//             <TabsContent value="tasks" className="mt-4">
//                 {tasks?.length > 0 
//                     ? <TaskDataTable tasks={tasks} contacts={contacts} /> // Use DataTable component
//                     : <p className="text-center text-muted-foreground py-8">No tasks found for this company.</p>
//                 }
//             </TabsContent>
//         </Tabs>
//     );
// };

// src/pages/Companies/CompanySubPages.tsx

import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Old table components
import { CRMBOQ } from "@/types/NirmaanCRM/CRMBOQ";
import { CRMContacts } from "@/types/NirmaanCRM/CRMContacts";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { Search,ChevronRight } from "lucide-react";
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useViewport } from "@/hooks/useViewPort"; // <-- Now used
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon';
import { StatusPill } from "@/pages/Tasks/TasksVariantPage";
import { formatDateWithOrdinal, formatTime12Hour } from "@/utils/FormatDate";

// DATATABLE IMPORTS
import { ColumnFiltersState, Row } from '@tanstack/react-table';
import { DataTableColumnDef } from '@/components/table/utils/table-filters';
import { DataTable } from '@/components/table/data-table';
import { useDataTableLogic } from '@/components/table/hooks/useDataTableLogic';


// --- Interface and Helper Components ---

interface CompanySubPagesProps {
  boqs: CRMBOQ[];
  contacts: CRMContacts[];
  tasks: CRMTask[];
}


const BoqDataTable = ({ boqs }: { boqs: CRMBOQ[] }) => {
  const navigate = useNavigate();
  const { isMobile } = useViewport(); // Check viewport
  const getBoqStatusClass = useStatusStyles('boq');

  // Boq Status Options
  const boqStatusOptions = useMemo(() => {
    if (!boqs) return [];
    const set = new Set<string>();
    boqs.forEach(b => b.boq_status && set.add(b.boq_status));
    return Array.from(set).map(status => ({ label: status, value: status }));
  }, [boqs]);

  // Boq Columns for Desktop
  const boqColumns = useMemo<DataTableColumnDef<CRMBOQ>[]>(() => [{
    accessorKey: "boq_name",
    meta: { title: "Name", enableSorting: true },
    cell: ({ row }) => (<span className="font-medium text-blue-600 underline"> {row.original.boq_name}</span>)
  }, {
    accessorKey: "boq_value",
    meta: { title: "Value", enableSorting: true },
    cell: ({ row }) => (<span className="font-medium"> {row.original.boq_value} L</span>)
  },
   {
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
    // Mobile View: Uses old Table/Row for the simple table look (as per BOQ image)
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
                                <TableCell colSpan={4} className="text-center h-24">No BOQs found matching your search.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
  }

  // Desktop View: Full Data Table
  return (
    <DataTable
      tableLogic={tableLogic}
      isLoading={false}
      headerTitle={<span>BOQ List</span>}
      noResultsMessage="No BOQs found."
      globalSearchPlaceholder="Search BOQs by name or status..."
      className="h-full"
      shouldExpandHeight={true}
      gridColsClass="md:grid-cols-[1.5fr,1.5fr,1.5fr,1.5fr,1.5fr]"
      onRowClick={(row) => navigate(`/boqs/boq?id=${row.original.name}`)}
    />
  );
};

// --- Contact Data Table ---

const ContactDataTable = ({ contacts }: { contacts: CRMContacts[] }) => {
  const navigate = useNavigate();
  const { isMobile } = useViewport(); // Check viewport

  // Contact Designation Options
  const contactDesignationOptions = useMemo(() => {
    if (!contacts) return [];
    const set = new Set<string>();
    contacts.forEach(c => c.designation && set.add(c.designation));
    return Array.from(set).map(designation => ({ label: designation, value: designation }));
  }, [contacts]);

  // Contact Columns for Desktop
  const contactColumns = useMemo<DataTableColumnDef<CRMContacts>[]>(() => [{
    accessorKey: "first_name",
    meta: { title: "Name", enableSorting: true },
    cell: ({ row }) => (<span className="font-medium text-blue-600 underline"> {row.original.first_name} {row.original.last_name}</span>)
  }, {
    accessorKey: "designation",
    meta: { title: "Designation", filterVariant: "select", filterOptions: contactDesignationOptions, enableSorting: true },
    cell: ({ row }) => <span>{row.original.designation || 'N/A'}</span>,
    filterFn: 'faceted',
  }], [contactDesignationOptions]);

  const tableLogic = useDataTableLogic<CRMContacts>({
    data: contacts,
    columns: contactColumns,
    initialSorting: [{ id: 'first_name', desc: false }],
    customGlobalFilterFn: ['first_name', 'last_name', 'designation']
  });
  
  // Destructure for mobile rendering
  const { table, globalFilter, setGlobalFilter } = tableLogic;
  const mobileRows = table.getRowModel().rows;


  if (isMobile) {
    // Mobile View: Simplified list
    return (
        <div className="flex flex-col gap-4">
            {/* MOBILE SEARCH INPUT (Manually added) */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Search Contacts..."
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
                            <TableHead className="text-right">Designation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mobileRows.length > 0 ? (
                            mobileRows.map((row) => {
                                const contact = row.original;
                                return (
                                    <TableRow 
                                        key={contact.name} 
                                        onClick={() => {
                                            const path = `/contacts/contact?id=${contact.name}`
                                            navigate(path);
                                        }} 
                                        className="cursor-pointer"
                                    >
                                        <TableCell className="font-medium text-blue-600 underline">{contact.first_name} {contact.last_name}</TableCell>
                                        <TableCell className="text-right">{contact.designation || 'N/A'}</TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">No contacts found matching your search.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
  }

  // Desktop View: Full Data Table
  return (
    <DataTable
      tableLogic={tableLogic}
      isLoading={false}
      headerTitle={<span>Contact List</span>}
      noResultsMessage="No contacts found."
      globalSearchPlaceholder="Search contacts by name or designation..."
      className="h-full"
      shouldExpandHeight={true}
      gridColsClass="md:grid-cols-[2fr,1fr]"
      onRowClick={(row) => navigate(`/contacts/contact?id=${row.original.name}`)}
    />
  );
};

// --- Task Data Table ---

const TaskDataTable = ({ tasks, contacts }: { tasks: CRMTask[], contacts: CRMContacts[] }) => {
  const navigate = useNavigate();
  const { isMobile } = useViewport(); // Check viewport

  // Contact Map
  const contactMap = useMemo(() => new Map(contacts.map(c => [c.name, `${c.first_name} ${c.last_name}`])), [contacts]);

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

  // Task Columns for Desktop
  const taskColumns = useMemo<DataTableColumnDef<CRMTask>[]>(() => [{
    accessorKey: "type",
    meta: { title: "Task Details", enableSorting: true, filterVariant: "select", filterOptions: taskTypeOptions },
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <TaskStatusIcon status={row.original.status} className="flex-shrink-0" />
        <div>
          <span className="font-semibold">{row.original.type}</span> with <span className="font-semibold">{contactMap.get(row.original.contact) || row.original.first_name}</span>
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
 
  ], [taskTypeOptions, taskStatusOptions, contactMap]);

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
    // Mobile View: Uses old Table/Row for the detailed list look (as per Task image)
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
                                                        <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{contactMap.get(task.contact) || task.first_name}</span>
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
                                <TableCell colSpan={2} className="text-center h-24">No tasks found matching your search.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
  }

  // Desktop View: Full Data Table
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

export const CompanySubPages = ({ boqs, contacts, tasks }: CompanySubPagesProps) => {
  return (
    <Tabs defaultValue="boqs" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-transparent p-0 border">
        <TabsTrigger value="boqs" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-l-md rounded-r-none">
          BOQs
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {boqs.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="contacts" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-none border-x">
          Contacts
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {contacts.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white rounded-r-md rounded-l-none">
          Tasks
          <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {tasks.length}
          </span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="boqs" className="mt-4">
        {boqs?.length > 0 ? <BoqDataTable boqs={boqs} /> : <p className="text-center text-muted-foreground py-8">No BOQs found for this company.</p>}
      </TabsContent>
      <TabsContent value="contacts" className="mt-4">
        {contacts?.length > 0 ? <ContactDataTable contacts={contacts} /> : <p className="text-center text-muted-foreground py-8">No contacts found for this company.</p>}
      </TabsContent>
      <TabsContent value="tasks" className="mt-4">
        {tasks?.length > 0 ? <TaskDataTable tasks={tasks} contacts={contacts} /> : <p className="text-center text-muted-foreground py-8">No tasks found for this company.</p>}
      </TabsContent>
    </Tabs>
  );
};