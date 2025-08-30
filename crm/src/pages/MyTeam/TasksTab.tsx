// src/pages/MyTeam/TasksTab.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStatusStyles } from "@/hooks/useStatusStyles";
import { formatDate } from "@/utils/FormatDate";
import { Link } from "react-router-dom";

export const TasksTab = ({ tasks }) => {
    const getTaskStatusClass = useStatusStyles("task");

    return (
        <div className="bg-background rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Contact</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Task</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length > 0 ? tasks.map(task => (
                        <TableRow key={task.name}>
                            <TableCell>
                                <Link to={`/contacts/contact?id=${task.contact}`} className="text-red-600 underline font-medium">
                                    {task.contact} 
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link to={`/companies/company?id=${task.company}`} className="text-red-600 underline">
                                    {task["company.company_name"] || task.company}
                                </Link>
                            </TableCell>
                            <TableCell>{task.type}</TableCell>
                            <TableCell>{formatDate(task.start_date)}</TableCell>
                            <TableCell>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit ${getTaskStatusClass(task.status)}`}>
                                    {task.status}
                                </span>
                            </TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No tasks found for this user.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};