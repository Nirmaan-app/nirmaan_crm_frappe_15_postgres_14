// src/pages/Tasks/TasksVariantPage.tsx
import { useViewport } from "@/hooks/useViewPort";
import { format, subDays } from "date-fns";
import { MultiValue } from 'react-select'; // Import MultiValue

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRMTask } from "@/types/NirmaanCRM/CRMTask";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ChevronRight, Search } from "lucide-react";

import { TaskListHeader } from "./TaskListHeader"; // 1. IMPORT THE NEW HEADER
import { TaskStatusIcon } from '@/components/ui/TaskStatusIcon'; // Import the status icon
import { formatDate, formatTime12Hour, formatDateWithOrdinal, formatCasualDate } from "@/utils/FormatDate";

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { useStatesSyncedWithParams } from "@/hooks/useSearchParamsManager";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type EnrichedCRMTask = CRMTask & {
    contact_name?: string;
    company_name?: string;
    "contact.first_name"?: string;
    "contact.last_name"?: string;
    "company.company_name"?: string;
};

type TaskVariant = 'all' | 'pending' | 'completed';

interface TasksVariantPageProps {
    variant: TaskVariant;
    from: string;
    to: string;
}

export const StatusPill = ({ status }: { status: string }) => {
    const getStatusClass = useStatusStyles("task");
    return (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border w-fit ${getStatusClass(status)}`}>
            {status}
        </span>
    );
};


// --- NEW HELPER COMPONENT FOR DISPLAYING THE DATE RANGE ---
const DateRangeDisplay = ({ from, to }: { from: string, to: string }) => {
    // Check for valid dates before formatting
    const formattedFrom = from ? format(new Date(from), 'MMM dd, yyyy') : '...';
    const formattedTo = to ? format(new Date(to), 'MMM dd, yyyy') : '...';
    return (
        <p className="text-sm text-muted-foreground whitespace-nowrap">
            {formattedFrom} - {formattedTo}
        </p>
    );
};

// --- NEW HELPER COMPONENT FOR DISPLAYING THE ASSIGNED USERS ---
const AssignedUsersDisplay = ({ assignedUsersString }: { assignedUsersString: string }) => {
    // If the string is empty or null, don't render anything.
    if (!assignedUsersString) {
        return null;
    }
    const users = assignedUsersString.split(',');
    return (
        <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="text-sm font-medium text-muted-foreground">Filtered By:</span>
            {users.map(user => (
                <span key={user} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                    {user}
                </span>
            ))}
        </div>
    );
};


export const TasksVariantPage = ({ variant, from: fromProp, to: toProp }: TasksVariantPageProps) => {
    const navigate = useNavigate();

    const { isMobile } = useViewport();

    const [filterType, setFilterType] = useState("By Contact"); // Default filter type
    const [selectedValues, setSelectedValues] = useState<{ label: string; value: string }[]>([]);

    // This hook will read `from` and `to` from the URL query string.
    const [params, setParams] = useStatesSyncedWithParams([
        { key: 'from', defaultValue: format(subDays(new Date(), 30), 'yyyy-MM-dd') },
        { key: 'to', defaultValue: format(new Date(), 'yyyy-MM-dd') },
        { key: 'assigned_to', defaultValue: '' },
    ]);

    const finalFrom = fromProp || params.from;
    const finalTo = toProp || params.to;
    const assignedToFilter = params.assigned_to; // The string 'user1@email.com,user2@email.com'

    const handleDateRangeChange = (range: { from: string, to: string }) => {
        setParams({ from: range.from, to: range.to });
    };

    const filters = useMemo(() => {
        const today = new Date().toISOString().slice(0, 10);
        let statusFilter;
        switch (variant) {
            case 'pending': statusFilter = ['=', 'Scheduled']; break;
            case 'completed': statusFilter = ['=', 'Completed']; break;
            default: statusFilter = ['!=', '']; break;
        }

        // Start with the mandatory filters (status and date)
        const mandatoryFilters = [
            ['status', statusFilter[0], statusFilter[1]],
            ['start_date', 'between', [finalFrom, finalTo]]
        ];

        // Check if the assignedToFilter from the URL has a value
        if (assignedToFilter) {
            // Split the comma-separated string back into an array of user IDs
            const assignedUsers = assignedToFilter.split(',');
            // Add the assignment filter to our list of filters
            return [
                ...mandatoryFilters,
                ['assigned_sales', 'in', assignedUsers]
            ];
        }

        // If no assignment filter is present in the URL, return only the mandatory filters
        return mandatoryFilters;

    }, [variant, finalFrom, finalTo, assignedToFilter]); // Add the new dependency

    const swrKey = `all-tasks-todays${JSON.stringify(filters)}`;

    const { data: tasksData, isLoading } = useFrappeGetDocList<EnrichedCRMTask>("CRM Task", {
        fields: ["name", "status", "start_date", "type", "modified", "company", "contact.first_name", "contact.last_name", "company.company_name", "creation", "remarks", "boq", "task_profile"],
        filters: filters,
        limit: 0,
        orderBy: { field: "start_date", order: "desc" }
    }, swrKey);

    // Compute options for the multiselect based on the current filterType and available data
    const filterOptions = useMemo(() => {
        if (!tasksData) return [];

        const enriched = tasksData.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
            company_name: task["company.company_name"] || task.company || 'N/A'
        }));

        let rawOptions: string[] = [];

        switch (filterType) {
            case "By Contact":
                rawOptions = Array.from(new Set(enriched.map(t => t.contact_name).filter(Boolean)));
                break;
            case "By Company":
                rawOptions = Array.from(new Set(enriched.map(t => t.company_name).filter(Boolean)));
                break;
            case "By Type":
                rawOptions = Array.from(new Set(enriched.map(t => t.type).filter(Boolean)));
                break;
            default:
                return [];
        }

        return rawOptions.map(opt => ({ label: opt, value: opt }));
    }, [tasksData, filterType]);

    // Clear selected values when filter type changes
    const handleFilterTypeChange = (newType: string) => {
        setFilterType(newType);
        setSelectedValues([]);
    };

    // Handler to safely cast MultiValue to the state type
    const handleSelectedValuesChange = (newValues: MultiValue<{ label: string; value: string }>) => {
        setSelectedValues(newValues as { label: string; value: string }[]);
    };

    const filteredTasks = useMemo(() => {
        const enriched = tasksData?.map(task => ({
            ...task,
            contact_name: `${task.first_name || ''} ${task.last_name || ''}`.trim() || 'N/A',
            company_name: task["company.company_name"] || task.company || 'N/A'
        })) || [];

        if (selectedValues.length === 0) return enriched;

        const selectedStrings = new Set(selectedValues.map(v => v.value));

        // This switch statement makes the search targeted
        switch (filterType) {
            case "By Contact":
                return enriched.filter(task => selectedStrings.has(task.contact_name));
            case "By Company":
                return enriched.filter(task => selectedStrings.has(task.company_name));
            case "By Type":
                return enriched.filter(task => selectedStrings.has(task.type));
            default:
                return enriched;
        }
    }, [tasksData, selectedValues, filterType]); 

    const title = `${variant.charAt(0).toUpperCase() + variant.slice(1)} Tasks - ${filteredTasks.length}`;

    if (isLoading) { return <div>Loading tasks...</div>; }

    return (
        <TooltipProvider>
            <div className="space-y-4">
                <div className="space-y-1">
                    {/* Top Row: Title on left, Date Range on right */}
                    <div className="flex justify-between items-center">
                        <h1 className="text-xl font-bold">{title}</h1>
                        <DateRangeDisplay from={finalFrom} to={finalTo} />
                    </div>
                    {/* Bottom Row: Assigned users list (only shows if filters are active) */}
                    <AssignedUsersDisplay assignedUsersString={assignedToFilter} />
                </div>

                <TaskListHeader
                    filterType={filterType}
                    setFilterType={handleFilterTypeChange}
                    options={filterOptions}
                    selectedValues={selectedValues}
                    setSelectedValues={handleSelectedValuesChange}
                    onDateRangeChange={handleDateRangeChange}
                    dateRange={{ from: finalFrom, to: finalTo }}
                />

                {/* 5. RESPONSIVE TABLE DESIGN */}
                <Card className="mt-4 p-0">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {/* This column is visible on all screen sizes */}
                                    <TableHead>Task Details</TableHead>

                                    {/* These columns will ONLY appear on desktop (md screens and up) */}
                                    {/* <TableHead className="hidden md:table-cell">Company</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead> */}
                                    <TableHead className="hidden md:table-cell text-center">Remarks</TableHead>

                                    <TableHead className="hidden md:table-cell text-center">Scheduled for</TableHead>




                                    {/* Chevron column */}
                                    <TableHead className="w-[5%]"><span className="sr-only">View</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => (
                                        <TableRow key={task.name} onClick={() => isMobile ? navigate(`/tasks/task?id=${task.name}`) : navigate(`/tasks?id=${task.name}`)} className="cursor-pointer">

                                            {/* --- MOBILE & DESKTOP: Combined Cell --- */}
                                            <TableCell>
                                                {isMobile ?
                                                    (<div className="flex items-center gap-3">
                                                        <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                        <div className="flex flex-col">
                                                            {
                                                                task.task_profile === "Sales" ? (<span>                                                <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>{" "}from  {task?.company} {" "}


                                                                </span>) : (<span>                                                <span className="font-semibold">{task?.type}</span> for  {task?.boq} {" "}
                                                                </span>)
                                                            }
                                                            {task.remarks && (<span className="inline-block text-xs   rounded-md  py-0.5 mt-1 md:hidden self-start">
                                                                Remarks: {task.remarks}
                                                            </span>)}
                                                            {/* On mobile, show the date here. Hide it on larger screens. */}
                                                            <span className="inline-block text-xs text-muted-foreground border border-gray-300 dark:border-gray-600 rounded-md px-1.5 py-0.5 mt-1 md:hidden self-start">
                                                                Scheduled for: {formatDateWithOrdinal(task.start_date)}
                                                            </span>
                                                        </div>
                                                    </div>) : (<div className="flex items-center gap-3">
                                                        <TaskStatusIcon status={task.status} className=" flex-shrink-0" />
                                                        <div >
                                                            {/* <span className="font-medium">{`${task.type} with ${task.first_name} from ${task.company_name}`}</span> */}
                                                            {
                                                                task.task_profile === "Sales" ? (<span>                                                <span className="font-semibold">{task?.type}</span> with <span className="font-semibold">{task?.first_name}</span>{" "}from  {task?.company} {" "}


                                                                </span>) : (<span>                                                <span className="font-semibold">{task?.type}</span> for  {task?.boq} {" "}
                                                                </span>)
                                                            }

                                                        </div>
                                                    </div>)}
                                            </TableCell>

                                            {/* --- DESKTOP ONLY Cells --- */}
                                            {/* <TableCell className="hidden md:table-cell">{task.company_name}</TableCell>
                                            <TableCell className="hidden md:table-cell"><StatusPill status={task.status} /></TableCell> */}
                                            <TableCell className="hidden md:table-cell text-center">
                                                {(() => {
                                                    const remarks = task.remarks;
                                                    if (!remarks) return <span className="text-sm">--</span>;
                                                    
                                                    // 200 character limit as requested
                                                    if (remarks.length <= 200) {
                                                        return <span className="text-xs">{remarks}</span>;
                                                    }

                                                    const truncatedRemarks = `${remarks.substring(0, 200)}...`;
                                                    
                                                    return (
                                                        <div className="flex gap-1 justify-center">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    {/* No line-clamp here to allow dynamic height based on content */}
                                                                    <div className="flex items-center justify-center h-auto min-h-[24px] w-auto px-2 py-1 text-xs cursor-pointer text-center max-w-[280px] break-words">
                                                                        {truncatedRemarks}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-[300px] text-wrap break-words">
                                                                    <p>{remarks}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    );
                                                })()}
                                            </TableCell>

                                            <TableCell className="hidden md:table-cell text-right">
                                                <div className="flex flex-col items-center">
                                                    <span>{formatDateWithOrdinal(task.start_date)}</span>

                                                </div>
                                            </TableCell>


                                            <TableCell><ChevronRight className="w-4 h-4 text-muted-foreground" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24">No tasks found in this category.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </TooltipProvider>
    );
};
