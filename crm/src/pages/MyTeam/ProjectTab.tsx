// src/pages/MyTeam/ProjectsTab.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit } from "lucide-react";
import { formatDate } from "@/utils/FormatDate";
import { Link } from "react-router-dom";
import { contactClick,companyClick ,boqClick} from "@/utils/LinkNavigate";
import { useStatusStyles } from "@/hooks/useStatusStyles";


export const ProjectsTab = ({ boqs }) => {
    const getBoqStatusClass=useStatusStyles("boq")
    return (
        <div className="bg-background rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>BOQ Name</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>BOQ Link</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {boqs.length > 0 ? boqs.map(boq => (
                        <TableRow key={boq.name}>
                            <TableCell>
                                <Link to={boqClick(boq.name)} className="text-red-600 underline font-medium">
                                    {boq.boq_name || boq.name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link to={companyClick(boq.company)} className="text-red-600 underline">
                                    {boq["company.company_name"] || boq.company}
                                </Link>
                            </TableCell>
                            <TableCell>
                                {boq.boq_link?(
<a href={boq.boq_link} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">
                                    {boq.boq_link && 'View BOQ'}
                                </a>
                                ):"N/A"}
                                
                            </TableCell>
                            <TableCell>
                               <span className={`text-xs font-semibold px-3 py-1 rounded-md ${getBoqStatusClass(boq.boq_status)}`}>
                                        {boq.boq_status}
                                    </span>
                            </TableCell>
                            <TableCell>{formatDate(boq.creation)}</TableCell>
                        </TableRow>
                    )) : (
                         <TableRow>
                            <TableCell colSpan={5} className="text-center h-24">No projects found for this user.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
};