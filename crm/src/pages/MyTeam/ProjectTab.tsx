// src/pages/MyTeam/ProjectsTab.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit } from "lucide-react";
import { formatDate } from "@/utils/FormatDate";
import { Link } from "react-router-dom";

export const ProjectsTab = ({ boqs }) => {
    return (
        <div className="bg-background rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Project Name</TableHead>
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
                                <Link to={`/boqs/boq?id=${boq.name}`} className="text-red-600 underline font-medium">
                                    {boq.boq_name || boq.name}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Link to={`/companies/company?id=${boq.company}`} className="text-red-600 underline">
                                    {boq["company.company_name"] || boq.company}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <a href={boq.boq_link} target="_blank" rel="noopener noreferrer" className="text-red-600 underline">
                                    {boq.boq_link ? 'View BOQ' : 'N/A'}
                                </a>
                            </TableCell>
                            <TableCell>
                                <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700">
                                    <Edit className="w-3 h-3 mr-2" />
                                    {/* Mocked as per UI */}
                                    Project Live
                                </Button>
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